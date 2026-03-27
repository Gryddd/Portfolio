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

  return Object.entries(totalsByLanguage)
    .map(([name, bytes]) => ({
      name,
      percentage: Math.round((bytes / totalBytes) * 100)
    }))
    .sort((left, right) => right.percentage - left.percentage)
    .slice(0, 4);
}

async function main() {
  const [user, repos, lastYearContributions] = await Promise.all([
    fetchJson(`${apiBaseUrl}/users/${username}`),
    fetchAllOwnedRepos(),
    fetchLastYearContributionCount()
  ]);

  const stars = repos.reduce((sum, repo) => sum + (Number(repo?.stargazers_count) || 0), 0);
  const languages = await fetchLanguageBreakdown(repos);

  const payload = {
    username,
    lastYearContributions,
    repos: Number(user?.public_repos) || 0,
    stars,
    languages,
    updatedAt: new Date().toISOString(),
    sources: {
      profile: `https://github.com/${username}`,
      contributions: contributionUrl,
      apiUser: `${apiBaseUrl}/users/${username}`,
      apiRepos: `${apiBaseUrl}/users/${username}/repos?type=owner`
    }
  };

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  console.log(`Synced GitHub stats for ${username}: ${lastYearContributions} contributions, ${payload.repos} repos, ${stars} stars.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
