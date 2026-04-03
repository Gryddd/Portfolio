import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const siteOrigin = "https://grydsh.dev";
const localeMap = {
    de: "de_DE",
    fr: "fr_FR"
};
const languages = ["de", "fr"];
const pageFiles = ["index.html", "portguardian.html", "leagueskins.html"];

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceFirst(html, pattern, replacement) {
    if (!pattern.test(html)) {
        throw new Error(`Expected pattern not found: ${pattern}`);
    }
    return html.replace(pattern, replacement);
}

function updateTagAttribute(html, tagName, matcher, attributeName, value) {
    const tagPattern = new RegExp(`<${tagName}\\b[^>]*>`, "g");
    const matcherPattern = new RegExp(matcher);
    const tags = html.match(tagPattern) || [];
    const originalTag = tags.find(tag => matcherPattern.test(tag));
    if (!originalTag) {
        throw new Error(`Missing <${tagName}> tag for matcher: ${matcher}`);
    }
    const attributePattern = new RegExp(`\\b${attributeName}="[^"]*"`);
    const updatedTag = attributePattern.test(originalTag)
        ? originalTag.replace(attributePattern, `${attributeName}="${value}"`)
        : originalTag.replace(/^<\w+/, `$& ${attributeName}="${value}"`);
    return html.replace(originalTag, updatedTag);
}

function extractJsonBlock(html, id) {
    const pattern = new RegExp(
        `<script id="${escapeRegExp(id)}" type="application/(?:json|ld\\+json)">\\s*([\\s\\S]*?)\\s*</script>`
    );
    const match = html.match(pattern);
    if (!match) {
        throw new Error(`Missing JSON block: ${id}`);
    }
    return JSON.parse(match[1]);
}

function buildLocalizedPath(pagePath, lang) {
    const normalizedPagePath = pagePath === "/index.html" ? "/" : pagePath;
    if (lang === "en") return normalizedPagePath;
    if (normalizedPagePath === "/") return `/${lang}/`;
    return `/${lang}${normalizedPagePath}`;
}

function buildLocalizedUrl(pagePath, lang) {
    return new URL(buildLocalizedPath(pagePath, lang), siteOrigin).toString();
}

function rewriteRelativeAssetUrls(html) {
    return html.replace(
        /\b(src|href)="(?!https?:|mailto:|tel:|#|\/|data:)([^"]+)"/g,
        (_, attr, value) => `${attr}="/${value.replace(/^\.\//, "")}"`
    );
}

function updateMetaTag(html, id, value) {
    return updateTagAttribute(html, "meta", `id="${escapeRegExp(id)}"`, "content", value);
}

function updateLinkHref(html, id, value) {
    return updateTagAttribute(html, "link", `id="${escapeRegExp(id)}"`, "href", value);
}

function updateAlternateHref(html, hreflang, value) {
    return updateTagAttribute(html, "link", `hreflang="${escapeRegExp(hreflang)}"`, "href", value);
}

async function generatePage(sourceFile, lang) {
    const sourcePath = path.join(rootDir, sourceFile);
    const sourceHtml = await fs.readFile(sourcePath, "utf8");
    const seoConfig = extractJsonBlock(sourceHtml, "page-seo-config");
    const structuredData = extractJsonBlock(sourceHtml, "page-structured-data");
    const localizedUrl = buildLocalizedUrl(seoConfig.pagePath || "/", lang);
    const localizedTitle = seoConfig.title?.[lang] || seoConfig.title?.en || "";
    const localizedDescription = seoConfig.description?.[lang] || seoConfig.description?.en || "";
    const localizedImageAlt = seoConfig.imageAlt?.[lang] || seoConfig.imageAlt?.en || "";
    const localizedStructuredData = {
        ...structuredData,
        url: localizedUrl,
        inLanguage: lang
    };

    if (localizedDescription) {
        localizedStructuredData.description = localizedDescription;
    }

    let html = sourceHtml;

    html = replaceFirst(html, /<html lang="[^"]+">/, `<html lang="${lang}">`);
    html = replaceFirst(html, /data-page-lang="[^"]+"/, `data-page-lang="${lang}"`);
    html = replaceFirst(html, /<title>[\s\S]*?<\/title>/, `<title>${localizedTitle}</title>`);
    html = updateMetaTag(html, "meta-description", localizedDescription);
    html = updateMetaTag(html, "meta-og-title", localizedTitle);
    html = updateMetaTag(html, "meta-og-description", localizedDescription);
    html = updateMetaTag(html, "meta-og-image-alt", localizedImageAlt);
    html = updateMetaTag(html, "meta-og-locale", localeMap[lang] || localeMap.de);
    html = updateMetaTag(html, "meta-twitter-title", localizedTitle);
    html = updateMetaTag(html, "meta-twitter-description", localizedDescription);
    html = updateMetaTag(html, "meta-twitter-image-alt", localizedImageAlt);
    html = updateMetaTag(html, "meta-og-url", localizedUrl);
    html = updateMetaTag(html, "meta-twitter-url", localizedUrl);
    html = updateLinkHref(html, "meta-canonical", localizedUrl);
    html = updateAlternateHref(html, "de", buildLocalizedUrl(seoConfig.pagePath || "/", "de"));
    html = updateAlternateHref(html, "en", buildLocalizedUrl(seoConfig.pagePath || "/", "en"));
    html = updateAlternateHref(html, "fr", buildLocalizedUrl(seoConfig.pagePath || "/", "fr"));
    html = updateAlternateHref(html, "x-default", buildLocalizedUrl(seoConfig.pagePath || "/", "en"));
    html = replaceFirst(
        html,
        /(<script id="page-structured-data" type="application\/ld\+json">\s*)[\s\S]*?(\s*<\/script>)/,
        `$1${JSON.stringify(localizedStructuredData, null, 2)}$2`
    );
    html = rewriteRelativeAssetUrls(html);
    html = html.replace(
        /href="\/#projekte"([^>]*data-localized-path="\/"[^>]*data-localized-hash="projekte")/g,
        `href="${buildLocalizedPath("/", lang)}#projekte"$1`
    );

    const outputDir = path.join(rootDir, lang);
    const outputPath = sourceFile === "index.html"
        ? path.join(outputDir, "index.html")
        : path.join(outputDir, sourceFile);

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, html, "utf8");
}

await Promise.all(
    languages.flatMap(lang => pageFiles.map(file => generatePage(file, lang)))
);

console.log("Localized pages generated.");
