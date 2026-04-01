import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const username = process.env.GITHUB_USERNAME || 'Gryddd';
const token = process.env.GITHUB_TOKEN || '';
const apiBaseUrl = 'https://api.github.com';
const contributionUrl = `https://github.com/users/${username}/contributions`;
const outputPath = path.resolve(__dirname, '..', 'data', 'github-stats.json');

const apiHeaders = {
  'Accept': 'application/vnd.github+json',
  'User-Agent': 'portfolio-github-stats-sync'
};

if (token) {
  apiHeaders.Authorization = `Bearer ${token}`;
}

async function fetchJson(url, headers = apiHeaders) {
  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`Request failed for ${url}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function fetchAllOwnedRepos() {
  const repos = [];
  let page = 1;

  while (true) {
    const pageUrl = `${apiBaseUrl}/users/${username}/repos?per_page=100&type=owner&sort=updated&page=${page}`;
    const pageRepos = await fetchJson(pageUrl);

    if (!Array.isArray(pageRepos)) {
      throw new Error('GitHub repos response was not an array.');
    }

    repos.push(...pageRepos);

    if (pageRepos.length < 100) {
      break;
    }

    page += 1;
  }

  return repos;
}

async function fetchLastYearContributionCount() {
  const response = await fetch(contributionUrl, {
    headers: {
      'User-Agent': 'portfolio-github-stats-sync'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to load contributions page: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const match = html.match(/<h2[^>]*id="js-contribution-activity-description"[^>]*>\s*([\d,]+)\s+contributions\s+in the last year\s*<\/h2>/i);

  if (!match) {
    throw new Error('Could not parse the GitHub last-year contributions count.');
  }

  return Number.parseInt(match[1].replace(/,/g, ''), 10);
}

async function fetchLanguageBreakdown(repos) {
  const totalsByLanguage = {};

  for (const repo of repos) {
    if (!repo?.languages_url) {
      continue;
    }

    const languages = await fetchJson(repo.languages_url);

    if (!languages || typeof languages !== 'object') {
      continue;
    }

    for (const [language, bytes] of Object.entries(languages)) {
      if (!Number.isFinite(bytes)) {
        continue;
      }

      totalsByLanguage[language] = (totalsByLanguage[language] || 0) + bytes;
    }
  }

  const totalBytes = Object.values(totalsByLanguage).reduce((sum, bytes) => sum + bytes, 0);

  if (totalBytes === 0) {
    return [];
  }

  const topLanguages = Object.entries(totalsByLanguage)
    .map(([name, bytes]) => ({
      name,
      percentage: Math.round((bytes / totalBytes) * 100)
    }))
    .sort((left, right) => right.percentage - left.percentage)
    .slice(0, 4);

  const percentageTotal = topLanguages.reduce((sum, language) => sum + language.percentage, 0);
  if (percentageTotal !== 100 && topLanguages.length > 0) {
    topLanguages[0].percentage += 100 - percentageTotal;
  }

  return topLanguages;
}

async function fetchGitHubProfileHtml() {
  const response = await fetch(`https://github.com/${username}`, {
    headers: {
      'User-Agent': 'portfolio-github-stats-sync'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to load GitHub profile page: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

function parsePinnedReposFromProfileHtml(html) {
  const pinnedSectionMatch = html.match(/<h2 class="f4 mb-2 text-normal">\s*Pinned[\s\S]*?<ol[\s\S]*?>([\s\S]*?)<\/ol>/i);
  if (!pinnedSectionMatch) {
    throw new Error('Could not locate the pinned repositories section.');
  }

  const pinnedItems = [...pinnedSectionMatch[1].matchAll(/<li[\s\S]*?pinned-item-list-item[\s\S]*?<\/li>/gi)];
  if (pinnedItems.length === 0) {
    throw new Error('Pinned repositories section was empty.');
  }

  const pinnedRepos = [];
  let pinnedRepoStars = 0;

  for (const match of pinnedItems) {
    const itemHtml = match[0];
    const repoMatch = itemHtml.match(/href="\/([^"<>]+\/[^"<>]+)"/i);
    const starMatch = itemHtml.match(/href="\/[^"<>]+\/stargazers"[\s\S]*?<\/svg>\s*([\d,]+)\s*<\/a>/i);

    if (!repoMatch) {
      continue;
    }

    pinnedRepos.push(repoMatch[1]);

    if (starMatch) {
      pinnedRepoStars += Number.parseInt(starMatch[1].replace(/,/g, ''), 10);
    }
  }

  if (pinnedRepos.length === 0) {
    throw new Error('Could not parse pinned repository names from the profile page.');
  }

  return { pinnedRepoStars, pinnedRepos };
}

async function fetchPinnedRepos() {
  if (!token) {
    return parsePinnedReposFromProfileHtml(await fetchGitHubProfileHtml());
  }

  const graphqlQuery = {
    query: `
      query {
        user(login: "${username}") {
          pinnedItems(first: 6, types: REPOSITORY) {
            nodes {
              ... on Repository {
                name
                stargazerCount
              }
            }
          }
        }
      }
    `
  };

  try {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'portfolio-github-stats-sync'
      },
      body: JSON.stringify(graphqlQuery)
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    const pinnedItems = result?.data?.user?.pinnedItems?.nodes || [];
    const pinnedRepos = pinnedItems.map(repo => repo.name);
    const pinnedRepoStars = pinnedItems.reduce((sum, repo) => sum + (repo.stargazerCount || 0), 0);

    return { pinnedRepoStars, pinnedRepos };
  } catch (error) {
    console.warn('Failed to fetch pinned repos through GraphQL, falling back to the public profile page:', error.message);
    return parsePinnedReposFromProfileHtml(await fetchGitHubProfileHtml());
  }
}

async function main() {
  const [user, repos, lastYearContributions, pinnedData] = await Promise.all([
    fetchJson(`${apiBaseUrl}/users/${username}`),
    fetchAllOwnedRepos(),
    fetchLastYearContributionCount(),
    fetchPinnedRepos()
  ]);

  const stars = repos.reduce((sum, repo) => sum + (Number(repo?.stargazers_count) || 0), 0);
  const languages = await fetchLanguageBreakdown(repos);

  const payload = {
    username,
    lastYearContributions,
    repos: Number(user?.public_repos) || 0,
    stars,
    pinnedRepoStars: pinnedData.pinnedRepoStars,
    pinnedRepos: pinnedData.pinnedRepos,
    languages,
    updatedAt: new Date().toISOString(),
    sources: {
      profile: `https://github.com/${username}`,
      contributions: contributionUrl,
      apiUser: `${apiBaseUrl}/users/${username}`,
      apiRepos: `${apiBaseUrl}/users/${username}/repos?type=owner`,
      pinnedProfile: `https://github.com/${username}`
    }
  };

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  console.log(`Synced GitHub stats for ${username}: ${lastYearContributions} contributions, ${payload.repos} repos, ${stars} stars, ${pinnedData.pinnedRepoStars} pinned repo stars.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
