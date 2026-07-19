const SUPPORTED_LANGS = new Set(["de", "en", "fr"]);
const HOMEPAGE_PATHS = new Set(["/", "/index.html"]);
const BASE_URL = "https://grydsh.dev";
const IMAGE_VERSION = "20260401";
const COUNTRY_LANGUAGE_FALLBACKS = new Map([
    ["DE", "de"],
    ["AT", "de"],
    ["FR", "fr"]
]);
const LOCALE_MAP = {
    de: "de_DE",
    en: "en_US",
    fr: "fr_FR"
};
const PAGE_METADATA = {
    "/": {
        pagePath: "/",
        title: {
            de: "Walid Gourideche | IT-Fachkraft fuer Systeme und Netzwerke",
            en: "Walid Gourideche | IT Specialist for Systems and Networks",
            fr: "Walid Gourideche | Spécialiste IT en systèmes et réseaux"
        },
        description: {
            de: "Portfolio von Walid Gourideche, einer mehrsprachigen IT-Fachkraft fuer Systeme und Netzwerke mit Fokus auf Netzwerke, Systemadministration und Cybersicherheit.",
            en: "Portfolio of Walid Gourideche, a multilingual IT Specialist for Systems and Networks focused on networking, system administration, and cybersecurity.",
            fr: "Portfolio de Walid Gourideche, spécialiste IT multilingue en systèmes et réseaux, axé sur les réseaux, l'administration système et la cybersécurité."
        },
        image: `${BASE_URL}/images/aura.jpg?v=${IMAGE_VERSION}`,
        imageType: "image/jpeg",
        imageAlt: {
            de: "Portfolio-Vorschaubild von Walid Gourideche",
            en: "Portfolio preview image of Walid Gourideche",
            fr: "Image d'aperçu du portfolio de Walid Gourideche"
        }
    },
    "/portguardian.html": {
        pagePath: "/portguardian.html",
        title: {
            de: "PortGuardian Enterprise Fallstudie | Walid Gourideche",
            en: "PortGuardian Enterprise Case Study | Walid Gourideche",
            fr: "Étude de cas PortGuardian Enterprise | Walid Gourideche"
        },
        description: {
            de: "Technische Fallstudie zu PortGuardian mit Labortopologie, Endpoint-Erkennungsablauf, Splunk-Telemetriepfad und Validierungsergebnissen.",
            en: "Technical case study for PortGuardian covering the lab topology, endpoint detection flow, Splunk telemetry path, and validation results.",
            fr: "Étude de cas technique de PortGuardian présentant la topologie du labo, le flux de détection endpoint, le chemin de télémétrie Splunk et les résultats de validation."
        },
        image: `${BASE_URL}/images/portguardian_infra.png?v=${IMAGE_VERSION}`,
        imageType: "image/png",
        imageAlt: {
            de: "Vorschaubild der PortGuardian-Infrastruktur",
            en: "PortGuardian infrastructure preview image",
            fr: "Image d'aperçu de l'infrastructure PortGuardian"
        }
    },
    "/homelab.html": {
        pagePath: "/homelab.html",
        title: {
            de: "Unternehmens-IT-Infrastruktur Fallstudie | Walid Gourideche",
            en: "Enterprise IT Infrastructure Case Study | Walid Gourideche",
            fr: "Étude de cas Infrastructure IT d'Entreprise | Walid Gourideche"
        },
        description: {
            de: "Technische Fallstudie zum Aufbau und zur Absicherung eines Unternehmensnetzwerks mit Windows Server 2022, Active Directory, pfSense, Netdata-Monitoring und Suricata IPS.",
            en: "Technical case study on building and securing an enterprise network with Windows Server 2022, Active Directory, pfSense, Netdata monitoring, and a Suricata IPS.",
            fr: "Étude de cas technique sur la construction et la sécurisation d'un réseau d'entreprise avec Windows Server 2022, Active Directory, pfSense, la supervision Netdata et un IPS Suricata."
        },
        image: `${BASE_URL}/images/diagram.png?v=${IMAGE_VERSION}`,
        imageType: "image/png",
        imageAlt: {
            de: "Netzwerktopologie der Homelab-Infrastruktur",
            en: "Network topology of the homelab infrastructure",
            fr: "Topologie réseau de l'infrastructure homelab"
        }
    }
};

function getPageMetadata(pathname) {
    if (pathname === "/index.html") return PAGE_METADATA["/"];
    return PAGE_METADATA[pathname] || null;
}

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

function getLocalizedValue(map, lang, fallback = "") {
    if (typeof map === "string") return map;
    if (!map || typeof map !== "object") return fallback;
    return map[lang] || map.en || fallback;
}

function buildLocalizedPageUrl(pagePath, lang) {
    const localizedUrl = new URL(pagePath || "/", BASE_URL);
    localizedUrl.search = "";
    localizedUrl.hash = "";
    localizedUrl.searchParams.set("lang", lang);
    return localizedUrl.toString();
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

function withVaryHeaders(response) {
    const headers = new Headers(response.headers);
    appendVary(headers, "Accept-Language");
    appendVary(headers, "Cookie");

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
    });
}

class AttributeHandler {
    constructor(attributeName, value) {
        this.attributeName = attributeName;
        this.value = value;
    }

    element(element) {
        if (this.value) {
            element.setAttribute(this.attributeName, this.value);
        }
    }
}

class TextHandler {
    constructor(value) {
        this.value = value;
    }

    element(element) {
        if (this.value) {
            element.setInnerContent(this.value);
        }
    }
}

function rewriteSeoResponse(response, metadata, lang) {
    const activeLang = normalizeLanguage(lang) || "en";
    const title = getLocalizedValue(metadata.title, activeLang, "");
    const description = getLocalizedValue(metadata.description, activeLang, "");
    const image = getLocalizedValue(metadata.image, activeLang, "");
    const imageAlt = getLocalizedValue(metadata.imageAlt, activeLang, "");
    const imageType = metadata.imageType || "";
    const pageUrl = buildLocalizedPageUrl(metadata.pagePath, activeLang);
    const locale = LOCALE_MAP[activeLang] || LOCALE_MAP.en;

    return new HTMLRewriter()
        .on("html", new AttributeHandler("lang", activeLang))
        .on("title", new TextHandler(title))
        .on('meta[name="description"]', new AttributeHandler("content", description))
        .on('meta[property="og:title"]', new AttributeHandler("content", title))
        .on('meta[property="og:description"]', new AttributeHandler("content", description))
        .on('meta[property="og:url"]', new AttributeHandler("content", pageUrl))
        .on('meta[property="og:locale"]', new AttributeHandler("content", locale))
        .on('meta[property="og:image"]', new AttributeHandler("content", image))
        .on('meta[property="og:image:secure_url"]', new AttributeHandler("content", image))
        .on('meta[property="og:image:type"]', new AttributeHandler("content", imageType))
        .on('meta[property="og:image:alt"]', new AttributeHandler("content", imageAlt))
        .on('meta[name="twitter:title"]', new AttributeHandler("content", title))
        .on('meta[name="twitter:description"]', new AttributeHandler("content", description))
        .on('meta[name="twitter:image"]', new AttributeHandler("content", image))
        .on('meta[name="twitter:image:alt"]', new AttributeHandler("content", imageAlt))
        .on('meta[property="twitter:url"]', new AttributeHandler("content", pageUrl))
        .on('meta[name="twitter:url"]', new AttributeHandler("content", pageUrl))
        .on('link[rel="canonical"]', new AttributeHandler("href", pageUrl))
        .transform(response);
}

export default {
    async fetch(request) {
        const url = new URL(request.url);
        const metadata = getPageMetadata(url.pathname);
        if (!metadata) return fetch(request);

        const queryLang = normalizeLanguage(url.searchParams.get("lang"));
        const cookieLang = readCookieLanguage(request.headers.get("Cookie"));
        const headerLang = readAcceptLanguage(request.headers.get("Accept-Language"));
        const fallbackLang = HOMEPAGE_PATHS.has(url.pathname)
            ? resolveCountryFallback(request.cf?.country)
            : "en";
        const activeLang = queryLang || cookieLang || headerLang || fallbackLang || "en";

        if (queryLang) {
            if (url.pathname === "/index.html") {
                const canonicalUrl = new URL(request.url);
                canonicalUrl.pathname = "/";
                canonicalUrl.searchParams.set("lang", queryLang);
                return buildLanguageRedirect(canonicalUrl, queryLang);
            }

            const response = await fetch(request);
            const withCookie = attachPreferredLanguageCookie(response, queryLang);
            return rewriteSeoResponse(withVaryHeaders(withCookie), metadata, queryLang);
        }

        if (HOMEPAGE_PATHS.has(url.pathname)) {
            const redirectUrl = new URL(request.url);
            redirectUrl.pathname = "/";
            redirectUrl.searchParams.set("lang", activeLang);
            return buildLanguageRedirect(redirectUrl, activeLang);
        }

        const response = await fetch(request);
        return rewriteSeoResponse(withVaryHeaders(response), metadata, activeLang);
    }
};
