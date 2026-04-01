(function () {
    const supportedLangs = ["de", "en", "fr"];
    const localeMap = {
        de: "de_DE",
        en: "en_US",
        fr: "fr_FR"
    };

    const normalizeLanguage = value => {
        if (!value) return null;
        const candidate = String(value).toLowerCase();
        if (supportedLangs.includes(candidate)) return candidate;
        const shortCode = candidate.slice(0, 2);
        return supportedLangs.includes(shortCode) ? shortCode : null;
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
            const url = new URL(window.location.href);
            const browserLang = (navigator.languages || [navigator.language])
                .map(normalizeLanguage)
                .find(Boolean);

            return normalizeLanguage(url.searchParams.get("lang"))
                || normalizeLanguage(url.pathname.split("/").filter(Boolean)[0])
                || readPreferredLanguageCookie()
                || readPreferredLanguageStorage()
                || browserLang
                || "en";
        } catch (_) {
            return "en";
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

    const buildLocalizedUrl = (pagePath, lang) => {
        const localizedUrl = new URL(pagePath || window.location.pathname, window.location.origin);
        localizedUrl.search = "";
        localizedUrl.hash = "";
        localizedUrl.searchParams.set("lang", lang);
        return localizedUrl.toString();
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
        normalizeLanguage,
        resolveInitialLanguage
    };

    if (seoConfig) {
        applyLocalizedSeo(resolveInitialLanguage());
    }
})();
