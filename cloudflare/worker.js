const SUPPORTED_LANGS = new Set(["de", "en", "fr"]);
const HOMEPAGE_PATHS = new Set(["/", "/index.html"]);
const BASE_URL = "https://grydsh.dev";
const IMAGE_VERSION = "20261121";
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

const DATACENTER_ASNS = new Set([
    "AS24940", // Hetzner
    "AS16509", // Amazon
    "AS14618", // Amazon
    "AS14061", // DigitalOcean
    "AS16276", // OVH
    "AS63949", // Linode / Akamai
    "AS15169", // Google Cloud
    "AS8075",  // Microsoft Azure
    "AS31898", // Oracle
    "AS20473", // Choopa / Vultr
    "AS51167", // Contabo
    "AS60068"  // Datacamp
]);

const PAGE_METADATA = {
    "/": {
        pagePath: "/",
        title: {
            de: "Walid Gourideche | IT-Fachkraft für Systeme und Netzwerke",
            en: "Walid Gourideche | IT Specialist for Systems and Networks",
            fr: "Walid Gourideche | Spécialiste IT en systèmes et réseaux"
        },
        description: {
            de: "Portfolio von Walid Gourideche, einer mehrsprachigen IT-Fachkraft für Systeme und Netzwerke mit Fokus auf Netzwerke, Systemadministration und Cybersicherheit.",
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
    "/dental-clinic.html": {
        pagePath: "/dental-clinic.html",
        title: {
            de: "Praxis Dr. Luis Fallstudie | Walid Gourideche",
            en: "Practice Dr. Luis Case Study | Walid Gourideche",
            fr: "Étude de cas Cabinet Dr. Luis | Walid Gourideche"
        },
        description: {
            de: "Technische Fallstudie zur segmentierten Praxis-IT-Infrastruktur mit OPNsense, Windows Server AD DS, GPO und Zammad-Helpdesk-Betrieb.",
            en: "Technical case study on segmented medical IT infrastructure with OPNsense, Windows Server AD DS, GPOs, and Zammad helpdesk operations.",
            fr: "Étude de cas technique sur l'infrastructure IT médicale avec OPNsense, Windows Server AD DS, GPO et support helpdesk Zammad."
        },
        image: `${BASE_URL}/images/medical_card.webp?v=${IMAGE_VERSION}`,
        imageType: "image/webp",
        imageAlt: {
            de: "Netzwerktopologie Praxis Dr. Luis",
            en: "Practice Dr. Luis Network Topology",
            fr: "Topologie réseau Cabinet Dr. Luis"
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
    }
};

function getPageMetadata(pathname) {
    if (pathname === "/index.html") return PAGE_METADATA["/"];
    if (PAGE_METADATA[pathname]) return PAGE_METADATA[pathname];
    if (pathname && !pathname.endsWith(".html") && PAGE_METADATA[`${pathname}.html`]) {
        return PAGE_METADATA[`${pathname}.html`];
    }
    return null;
}

function normalizeLanguage(value) {
    if (!value) return null;
    const candidate = String(value).toLowerCase();
    if (SUPPORTED_LANGS.has(candidate)) return candidate;
    const shortCode = candidate.slice(0, 2);
    return SUPPORTED_LANGS.has(shortCode) ? shortCode : null;
}

function readCookie(cookieHeader, name) {
    if (!cookieHeader) return null;
    for (const entry of cookieHeader.split(";")) {
        const [rawName, ...rawValueParts] = entry.trim().split("=");
        if (rawName !== name) continue;
        return decodeURIComponent(rawValueParts.join("=")).trim();
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

function appendVary(headers, token) {
    const existing = headers.get("Vary");
    if (!existing) {
        headers.set("Vary", token);
        return;
    }
    const values = existing.split(",").map(v => v.trim()).filter(Boolean);
    if (!values.includes(token)) {
        values.push(token);
        headers.set("Vary", values.join(", "));
    }
}

function attachCookies(response, cookies = []) {
    const headers = new Headers(response.headers);
    for (const c of cookies) {
        headers.append("Set-Cookie", c);
    }
    appendVary(headers, "Accept-Language");
    appendVary(headers, "Cookie");
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
    });
}

function buildLanguageRedirect(targetUrl, lang, extraCookies = []) {
    const headers = new Headers();
    headers.set("Location", targetUrl.toString());
    headers.append("Set-Cookie", `preferredLang=${encodeURIComponent(lang)}; Max-Age=31536000; Path=/; SameSite=Lax; Secure`);
    for (const c of extraCookies) {
        headers.append("Set-Cookie", c);
    }
    headers.set("Cache-Control", "private, no-store");
    headers.set("Vary", "Accept-Language, Cookie");
    return new Response(null, { status: 302, headers });
}

class AttributeHandler {
    constructor(attributeName, value) {
        this.attributeName = attributeName;
        this.value = value;
    }
    element(element) {
        if (this.value) element.setAttribute(this.attributeName, this.value);
    }
}

class TextHandler {
    constructor(value) {
        this.value = value;
    }
    element(element) {
        if (this.value) element.setInnerContent(this.value);
    }
}

function rewriteSeoResponse(response, metadata, lang) {
    const activeLang = normalizeLanguage(lang) || "en";
    const title = getLocalizedValue(metadata.title, activeLang, "");
    const description = getLocalizedValue(metadata.description, activeLang, "");
    const image = getLocalizedValue(metadata.image, activeLang, "");
    const imageAlt = getLocalizedValue(metadata.imageAlt, activeLang, "");
    const imageType = metadata.imageType || "image/jpeg";
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
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const cookieHeader = request.headers.get("Cookie") || "";
        const clientIp = request.headers.get("cf-connecting-ip") ||
                         request.headers.get("x-real-ip") ||
                         request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                         "unknown";
        const cf = request.cf || {};
        const asnStr = cf.asn ? `AS${cf.asn}` : "";
        const isDatacenter = DATACENTER_ASNS.has(asnStr);

        // Unified Session Cookie resolution (_gryd_sid)
        let cookieSid = readCookie(cookieHeader, "_gryd_sid");
        const needsSidCookie = !cookieSid;
        const currentSid = cookieSid || `s_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
        const sidCookieHeader = `_gryd_sid=${encodeURIComponent(currentSid)}; Max-Age=86400; Path=/; SameSite=Lax; Secure`;

        // --- High-Precision Telemetry Receiver (/api/v1/sync, /api/track, /sync) ---
        if ((url.pathname === "/api/v1/sync" || url.pathname === "/api/track" || url.pathname === "/sync") && request.method === "POST") {
            try {
                // Drop datacenter automated scrapers completely to protect KV write quota
                if (isDatacenter) {
                    return new Response(JSON.stringify({ ok: true, skipped: "datacenter" }), {
                        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
                    });
                }

                let body = {};
                try {
                    const rawText = await request.text();
                    body = JSON.parse(rawText);
                } catch (_) {}
                const now = new Date();
                const userAgent = request.headers.get("user-agent") || "";
                const headerRef = request.headers.get("referer") || "";

                const eventData = {
                    sid: body.sid || currentSid,
                    event: body.event || "unknown",
                    page: body.url || url.pathname,
                    title: body.title || "",
                    lang: body.lang || "de",
                    ref: body.ref || headerRef || "",
                    ip: clientIp,
                    country: cf.country || "unknown",
                    city: cf.city || "unknown",
                    region: cf.region || "unknown",
                    postal: cf.postalCode || "",
                    isp: cf.asOrganization || "unknown",
                    asn: asnStr,
                    colo: cf.colo || "",
                    screen: body.screen || "",
                    vp: body.vp || "",
                    dpr: body.dpr || "",
                    tz: body.tz || "",
                    cores: body.cores || "",
                    mem: body.mem || "",
                    scroll: body.scroll || "",
                    dwellSec: (typeof body.dwellSec === "number") ? body.dwellSec : null,
                    // Batched Interaction details
                    sections: body.sections || null,
                    projects: body.projects || null,
                    faqs: body.faqs || null,
                    diagrams: body.diagrams || null,
                    outbound: body.outbound || null,
                    id: body.id || "",
                    file: body.file || "",
                    dest: body.dest || "",
                    label: body.label || "",
                    fromLang: body.fromLang || "",
                    toLang: body.toLang || "",
                    target: body.target || "",
                    status: body.status || "",
                    ua: userAgent,
                    source: "client_stealth",
                    timestamp: now.toISOString()
                };

                if (env && env.ANALYTICS) {
                    try {
                        const key = `evt:${now.getTime()}:${Math.random().toString(36).substring(2, 7)}`;
                        await env.ANALYTICS.put(key, JSON.stringify(eventData), { expirationTtl: 2592000 });
                    } catch (_) {}
                }

                const respHeaders = {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type"
                };
                if (needsSidCookie) {
                    respHeaders["Set-Cookie"] = sidCookieHeader;
                }

                return new Response(JSON.stringify({ ok: true, ip: clientIp, sid: eventData.sid }), {
                    headers: respHeaders
                });
            } catch (err) {
                return new Response(JSON.stringify({ ok: false, error: err.message }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                });
            }
        }

        if ((url.pathname === "/api/v1/sync" || url.pathname === "/api/track" || url.pathname === "/sync") && request.method === "OPTIONS") {
            return new Response(null, {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type"
                }
            });
        }

        // --- Live Telemetry API (/api/stats) ---
        if (url.pathname === "/api/stats") {
            if (url.searchParams.get("key") !== "walid2027") {
                return new Response(JSON.stringify({ error: "Unauthorized" }), {
                    status: 401,
                    headers: { "Content-Type": "application/json" }
                });
            }
            if (!env || !env.ANALYTICS) {
                return new Response(JSON.stringify({ error: "KV not bound" }), {
                    status: 500,
                    headers: { "Content-Type": "application/json" }
                });
            }

            // Target current & recent epoch prefixes directly (preserves daily LIST quota: 1000/day)
            const prefixToday = `evt:${Date.now().toString().slice(0, 5)}`;
            const prefixYesterday = `evt:${(Date.now() - 86400000).toString().slice(0, 5)}`;
            
            const pageToday = await env.ANALYTICS.list({ prefix: prefixToday, limit: 100 });
            let allKeys = pageToday.keys || [];
            
            if (allKeys.length < 30 && prefixToday !== prefixYesterday) {
                const pageYesterday = await env.ANALYTICS.list({ prefix: prefixYesterday, limit: 100 });
                allKeys = allKeys.concat(pageYesterday.keys || []);
            }

            allKeys.sort((a, b) => a.name.localeCompare(b.name));
            const targetKeys = allKeys.slice(-100).reverse();
            const rawValues = await Promise.all(targetKeys.map(k => env.ANALYTICS.get(k.name)));

            const events = [];
            const ipMap = {};
            const sessionMap = {};
            const pageSummary = {};
            const citySummary = {};
            const ispSummary = {};
            const eventTypeSummary = {};

            for (const val of rawValues) {
                if (!val) continue;
                try {
                    const ev = JSON.parse(val);
                    events.push(ev);

                    const ip = ev.ip || "unknown";
                    const sid = ev.sid || `session_${ip}`;
                    const pageName = ev.page || "/";
                    const city = ev.city || "unknown";
                    const isp = ev.isp || "unknown";
                    const evt = ev.event || "unknown";

                    ipMap[ip] = (ipMap[ip] || 0) + 1;
                    if (!sessionMap[sid]) sessionMap[sid] = [];
                    sessionMap[sid].push(ev);

                    pageSummary[pageName] = (pageSummary[pageName] || 0) + 1;
                    citySummary[city] = (citySummary[city] || 0) + 1;
                    ispSummary[isp] = (ispSummary[isp] || 0) + 1;
                    eventTypeSummary[evt] = (eventTypeSummary[evt] || 0) + 1;
                } catch (_) {}
            }

            const dwellEvents = events.filter(e => typeof e.dwellSec === "number");
            const avgDwell = dwellEvents.length > 0 
                ? Math.round(dwellEvents.reduce((acc, e) => acc + (e.dwellSec || 0), 0) / dwellEvents.length) 
                : 0;

            const journeys = Object.entries(sessionMap).map(([sid, evs]) => {
                const first = evs[0];
                const last = evs[evs.length - 1];
                return {
                    session_id: sid,
                    ip: first.ip,
                    location: `${first.city}, ${first.region}, ${first.country}`,
                    organization: `${first.asn} ${first.isp}`,
                    first_seen: first.timestamp,
                    last_seen: last.timestamp,
                    event_count: evs.length,
                    timeline: evs.map(e => ({
                        timestamp: e.timestamp,
                        event: e.event,
                        page: e.page || "/",
                        dwell_sec: e.dwellSec,
                        scroll_depth: e.scroll,
                        sections_read: e.sections || undefined,
                        projects_viewed: e.projects || undefined
                    }))
                };
            }).sort((a, b) => new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime());

            const responsePayload = {
                status: "success",
                timestamp_utc: new Date().toISOString(),
                kpis: {
                    total_events: events.length,
                    unique_ips: Object.keys(ipMap).length,
                    unique_sessions: Object.keys(sessionMap).length,
                    pageviews: events.filter(e => e.event === "pageview").length,
                    dwell_sessions: events.filter(e => e.event === "dwell_time").length,
                    avg_dwell_seconds: avgDwell,
                    pdf_downloads: events.filter(e => e.event === "pdf_download" || e.event === "edge_pdf_download").length,
                    contact_clicks: events.filter(e => e.event === "contact_click").length,
                    outbound_clicks: events.filter(e => e.event === "outbound_click").length,
                    video_plays: events.filter(e => e.event === "video_open").length
                },
                event_type_breakdown: eventTypeSummary,
                top_pages: pageSummary,
                top_organizations: ispSummary,
                top_locations: citySummary,
                recruiter_journeys: journeys.slice(0, 40),
                recent_raw_events: events.slice(0, 100)
            };

            return new Response(JSON.stringify(responsePayload, null, 2), {
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
                    "Pragma": "no-cache",
                    "Access-Control-Allow-Origin": "*"
                }
            });
        }

        // --- Server-Side Edge Telemetry (PDFs only — HTML writes disabled to protect KV quota) ---
        const pathnameLower = url.pathname.toLowerCase();
        const isPdf = pathnameLower.endsWith('.pdf');

        if (isPdf && env && env.ANALYTICS && ctx && ctx.waitUntil) {
            const userAgent = (request.headers.get("user-agent") || "").toLowerCase();
            const rawUa = request.headers.get("user-agent") || "";
            const headerRef = request.headers.get("referer") || "";

            const isBot = (
                userAgent.includes("bot") || userAgent.includes("spider") ||
                userAgent.includes("crawl") || userAgent.includes("headless")
            );

            if (!isBot && !isDatacenter) {
                ctx.waitUntil((async () => {
                    try {
                        const now = new Date();
                        const edgeEvent = {
                            sid: currentSid,
                            event: "edge_pdf_download",
                            page: url.pathname,
                            file: url.pathname,
                            title: url.pathname.split("/").pop() || "PDF Report",
                            ip: clientIp,
                            country: cf.country || "unknown",
                            city: cf.city || "unknown",
                            region: cf.region || "unknown",
                            postal: cf.postalCode || "",
                            isp: cf.asOrganization || "unknown",
                            asn: asnStr,
                            colo: cf.colo || "",
                            ua: rawUa,
                            source: "edge_server",
                            timestamp: now.toISOString()
                        };
                        const key = `evt:${now.getTime()}:${Math.random().toString(36).substring(2, 7)}`;
                        await env.ANALYTICS.put(key, JSON.stringify(edgeEvent), { expirationTtl: 2592000 });
                    } catch (_) {}
                })());
            }
        }

        const metadata = getPageMetadata(url.pathname);
        if (!metadata) {
            const response = await fetch(request);
            if (response.status === 404) {
                const accept = request.headers.get("Accept") || "";
                if (accept.includes("text/html")) {
                    const fallbackLang = resolveCountryFallback(request.cf?.country) || "en";
                    const redirectCookies = needsSidCookie ? [sidCookieHeader] : [];
                    return buildLanguageRedirect(new URL(`${BASE_URL}/?lang=${fallbackLang}`), fallbackLang, redirectCookies);
                }
            }
            if (needsSidCookie) {
                return attachCookies(response, [sidCookieHeader]);
            }
            return response;
        }

        const queryLang = normalizeLanguage(url.searchParams.get("lang"));
        const cookieLang = readCookie(cookieHeader, "preferredLang");
        const headerLang = readAcceptLanguage(request.headers.get("Accept-Language"));
        const fallbackLang = HOMEPAGE_PATHS.has(url.pathname)
            ? resolveCountryFallback(request.cf?.country)
            : "en";
        const activeLang = queryLang || cookieLang || headerLang || fallbackLang || "en";

        const extraCookiesToSet = needsSidCookie ? [sidCookieHeader] : [];

        if (queryLang) {
            if (url.pathname === "/index.html") {
                const canonicalUrl = new URL(request.url);
                canonicalUrl.pathname = "/";
                canonicalUrl.searchParams.set("lang", queryLang);
                return buildLanguageRedirect(canonicalUrl, queryLang, extraCookiesToSet);
            }

            const response = await fetch(request);
            const cookiesToAttach = [
                `preferredLang=${encodeURIComponent(queryLang)}; Max-Age=31536000; Path=/; SameSite=Lax; Secure`,
                ...extraCookiesToSet
            ];
            const withCookies = attachCookies(response, cookiesToAttach);
            return rewriteSeoResponse(withCookies, metadata, queryLang);
        }

        if (HOMEPAGE_PATHS.has(url.pathname)) {
            const redirectUrl = new URL(request.url);
            redirectUrl.pathname = "/";
            redirectUrl.searchParams.set("lang", activeLang);
            return buildLanguageRedirect(redirectUrl, activeLang, extraCookiesToSet);
        }

        const response = await fetch(request);
        const finalResponse = extraCookiesToSet.length > 0 ? attachCookies(response, extraCookiesToSet) : response;
        return rewriteSeoResponse(finalResponse, metadata, activeLang);
    }
};
