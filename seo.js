(function () {
    const supportedLangs = ["de", "en", "fr"];
    const localeMap = {
        de: "de_DE",
        en: "en_US",
        fr: "fr_FR"
    };
    const documentLanguage = () => normalizeLanguage(
        document.documentElement.getAttribute("lang")
        || document.body?.dataset?.pageLang
    );

    const normalizeLanguage = value => {
        if (!value) return null;
        const candidate = String(value).toLowerCase();
        if (supportedLangs.includes(candidate)) return candidate;
        const shortCode = candidate.slice(0, 2);
        return supportedLangs.includes(shortCode) ? shortCode : null;
    };

    const getPathSegments = pathname => String(pathname || "/")
        .split("/")
        .filter(Boolean);

    const stripLanguagePrefix = pathname => {
        const segments = getPathSegments(pathname);
        if (segments.length === 0) return "/";
        const leadingLang = normalizeLanguage(segments[0]);
        if (leadingLang) {
            const remaining = segments.slice(1);
            return remaining.length === 0 ? "/" : `/${remaining.join("/")}`;
        }
        // Handle subfolder deployment e.g. /Portfolio/de/...
        if (segments.length > 1 && normalizeLanguage(segments[1])) {
            const remaining = [segments[0], ...segments.slice(2)];
            return `/${remaining.join("/")}`;
        }
        return `/${segments.join("/")}`;
    };

    const normalizePagePath = value => {
        const fallbackPath = stripLanguagePrefix(window.location.pathname);
        const candidate = String(value || fallbackPath || "/").trim();
        const withLeadingSlash = candidate.startsWith("/") ? candidate : `/${candidate}`;
        if (withLeadingSlash === "/index.html") return "/";
        return withLeadingSlash || "/";
    };

    const buildLocalizedPath = (pagePath, lang) => {
        const normalizedPagePath = normalizePagePath(pagePath);
        const normalizedLang = normalizeLanguage(lang) || documentLanguage() || "en";
        if (normalizedLang === "en") {
            return normalizedPagePath;
        }
        if (normalizedPagePath === "/") {
            return `/${normalizedLang}/`;
        }
        return `/${normalizedLang}${normalizedPagePath}`;
    };

    const readPreferredLanguageCookie = () => {
        try {
            const cookieEntry = document.cookie
                .split(";")
                .map(entry => entry.trim())
                .find(entry => entry.startsWith("preferredLang="));

            if (!cookieEntry) return null;
            return normalizeLanguage(decodeURIComponent(cookieEntry.split("=").slice(1).join("=")));
        } catch (_) {
            return null;
        }
    };

    const readPreferredLanguageStorage = () => {
        try {
            return normalizeLanguage(localStorage.getItem("preferredLang"));
        } catch (_) {
            return null;
        }
    };

    const resolveInitialLanguage = () => {
        try {
            const segments = getPathSegments(window.location.pathname);
            const pathLang = segments.map(normalizeLanguage).find(Boolean);
            const browserLang = (navigator.languages || [navigator.language])
                .map(normalizeLanguage)
                .find(Boolean);

            return pathLang
                || documentLanguage()
                || (window.location.search ? normalizeLanguage(new URLSearchParams(window.location.search).get("lang")) : null)
                || readPreferredLanguageCookie()
                || readPreferredLanguageStorage()
                || browserLang
                || "en";
        } catch (_) {
            return documentLanguage() || "en";
        }
    };

    const getLocalizedValue = (map, lang, fallback = "") => {
        if (typeof map === "string") return map;
        if (!map || typeof map !== "object") return fallback;
        return map[lang] || map.en || fallback;
    };

    const seoConfigElement = document.getElementById("page-seo-config");
    const structuredDataElement = document.getElementById("page-structured-data");

    let seoConfig = null;
    let baseStructuredData = null;

    try {
        if (seoConfigElement?.textContent) {
            seoConfig = JSON.parse(seoConfigElement.textContent);
        }
    } catch (_) {
        seoConfig = null;
    }

    try {
        if (structuredDataElement?.textContent) {
            baseStructuredData = JSON.parse(structuredDataElement.textContent);
        }
    } catch (_) {
        baseStructuredData = null;
    }

    const buildLocalizedUrl = (pagePath, lang, hash = "") => {
        const path = buildLocalizedPath(pagePath, lang);
        const fragment = hash ? (hash.startsWith("#") ? hash : `#${hash}`) : "";
        try {
            if (window.location.origin && window.location.origin !== "null" && window.location.protocol.startsWith("http")) {
                const localizedUrl = new URL(path, window.location.origin);
                localizedUrl.search = "";
                localizedUrl.hash = fragment;
                return localizedUrl.toString();
            }
        } catch (_) {}
        const cleanPath = path.startsWith("/") ? path.slice(1) : path;
        return cleanPath + fragment;
    };

    const updateMetaContent = (id, value) => {
        if (!value) return;
        const element = document.getElementById(id);
        if (element) {
            element.setAttribute("content", value);
        }
    };

    const updateLinkHref = (id, value) => {
        if (!value) return;
        const element = document.getElementById(id);
        if (element) {
            element.setAttribute("href", value);
        }
    };

    const applyLocalizedSeo = lang => {
        if (!seoConfig) return normalizeLanguage(lang) || resolveInitialLanguage();

        const activeLang = normalizeLanguage(lang) || resolveInitialLanguage();
        const pageUrl = buildLocalizedUrl(seoConfig.pagePath, activeLang);
        const title = getLocalizedValue(seoConfig.title, activeLang, document.title);
        const description = getLocalizedValue(seoConfig.description, activeLang, "");
        const image = getLocalizedValue(seoConfig.image, activeLang, "");
        const imageAlt = getLocalizedValue(seoConfig.imageAlt, activeLang, "");
        const imageType = typeof seoConfig.imageType === "string" ? seoConfig.imageType : "";
        const locale = localeMap[activeLang] || localeMap.en;

        document.documentElement.lang = activeLang;
        document.title = title;

        if (description) {
            updateMetaContent("meta-description", description);
            updateMetaContent("meta-og-description", description);
            updateMetaContent("meta-twitter-description", description);
        }

        updateMetaContent("meta-og-title", title);
        updateMetaContent("meta-twitter-title", title);
        updateLinkHref("meta-canonical", pageUrl);
        updateMetaContent("meta-og-url", pageUrl);
        updateMetaContent("meta-twitter-url", pageUrl);
        updateMetaContent("meta-og-locale", locale);

        if (image) {
            updateMetaContent("meta-og-image", image);
            updateMetaContent("meta-og-image-secure", image);
            updateMetaContent("meta-twitter-image", image);
        }

        if (imageType) {
            updateMetaContent("meta-og-image-type", imageType);
        }

        if (imageAlt) {
            updateMetaContent("meta-og-image-alt", imageAlt);
            updateMetaContent("meta-twitter-image-alt", imageAlt);
        }

        if (structuredDataElement && baseStructuredData) {
            const nextStructuredData = JSON.parse(JSON.stringify(baseStructuredData));
            nextStructuredData.url = pageUrl;
            nextStructuredData.inLanguage = activeLang;
            if (description) {
                nextStructuredData.description = description;
            }
            if (image) {
                nextStructuredData.image = image;
            }
            structuredDataElement.textContent = JSON.stringify(nextStructuredData, null, 2);
        }

        return activeLang;
    };

    window.PortfolioSeo = {
        applyLocalizedSeo,
        buildLocalizedPath,
        buildLocalizedUrl,
        getCurrentPagePath: () => normalizePagePath(stripLanguagePrefix(window.location.pathname)),
        normalizeLanguage,
        resolveInitialLanguage,
        stripLanguagePrefix
    };

    if (seoConfig) {
        applyLocalizedSeo(resolveInitialLanguage());
    }
})();
