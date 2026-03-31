const SUPPORTED_LANGS = new Set(["de", "en", "fr"]);
const HOMEPAGE_PATHS = new Set(["/", "/index.html"]);
const COUNTRY_LANGUAGE_FALLBACKS = new Map([
    ["DE", "de"],
    ["AT", "de"],
    ["FR", "fr"]
]);

function normalizeLanguage(value) {
    if (!value) return null;
    const candidate = String(value).toLowerCase();
    if (SUPPORTED_LANGS.has(candidate)) return candidate;
    const shortCode = candidate.slice(0, 2);
    return SUPPORTED_LANGS.has(shortCode) ? shortCode : null;
}

function readCookieLanguage(cookieHeader) {
    if (!cookieHeader) return null;

    for (const entry of cookieHeader.split(";")) {
        const [rawName, ...rawValueParts] = entry.trim().split("=");
        if (rawName !== "preferredLang") continue;
        return normalizeLanguage(decodeURIComponent(rawValueParts.join("=")));
    }

    return null;
}

function readAcceptLanguage(headerValue) {
    if (!headerValue) return null;

    for (const languageToken of headerValue.split(",")) {
        const candidate = normalizeLanguage(languageToken.split(";")[0].trim());
        if (candidate) return candidate;
    }

    return null;
}

function resolveCountryFallback(countryCode) {
    return COUNTRY_LANGUAGE_FALLBACKS.get(String(countryCode || "").toUpperCase()) || "en";
}

function buildPreferredLanguageCookie(lang) {
    return `preferredLang=${encodeURIComponent(lang)}; Max-Age=31536000; Path=/; SameSite=Lax; Secure`;
}

function appendVary(headers, token) {
    const existing = headers.get("Vary");
    if (!existing) {
        headers.set("Vary", token);
        return;
    }

    const values = existing
        .split(",")
        .map(value => value.trim())
        .filter(Boolean);

    if (!values.includes(token)) {
        values.push(token);
        headers.set("Vary", values.join(", "));
    }
}

function buildLanguageRedirect(targetUrl, lang) {
    const headers = new Headers();
    headers.set("Location", targetUrl.toString());
    headers.set("Set-Cookie", buildPreferredLanguageCookie(lang));
    headers.set("Cache-Control", "private, no-store");
    headers.set("Vary", "Accept-Language, Cookie");
    return new Response(null, { status: 302, headers });
}

function attachPreferredLanguageCookie(response, lang) {
    const headers = new Headers(response.headers);
    headers.set("Set-Cookie", buildPreferredLanguageCookie(lang));
    appendVary(headers, "Accept-Language");
    appendVary(headers, "Cookie");

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
    });
}

export default {
    async fetch(request) {
        const url = new URL(request.url);
        if (!HOMEPAGE_PATHS.has(url.pathname)) {
            return fetch(request);
        }

        const queryLang = normalizeLanguage(url.searchParams.get("lang"));
        if (queryLang) {
            if (url.pathname === "/index.html") {
                const canonicalUrl = new URL(request.url);
                canonicalUrl.pathname = "/";
                canonicalUrl.searchParams.set("lang", queryLang);
                return buildLanguageRedirect(canonicalUrl, queryLang);
            }

            const response = await fetch(request);
            return attachPreferredLanguageCookie(response, queryLang);
        }

        const cookieLang = readCookieLanguage(request.headers.get("Cookie"));
        const headerLang = readAcceptLanguage(request.headers.get("Accept-Language"));
        const fallbackLang = resolveCountryFallback(request.cf?.country);
        const targetLang = cookieLang || headerLang || fallbackLang || "en";

        const redirectUrl = new URL(request.url);
        redirectUrl.pathname = "/";
        redirectUrl.searchParams.set("lang", targetLang);
        return buildLanguageRedirect(redirectUrl, targetLang);
    }
};
