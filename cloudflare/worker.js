const SUPPORTED_LANGS = new Set(["de", "en", "fr"]);
const BASE_URL = "https://grydsh.dev";

// Unlocalized root paths eligible for geographic language routing when no preferredLang cookie exists
const ROOT_LOCALIZABLE_PATHS = new Map([
    ["/", "/"],
    ["/index.html", "/"],
    ["/dental-clinic", "/dental-clinic"],
    ["/dental-clinic.html", "/dental-clinic"],
    ["/homelab", "/homelab"],
    ["/homelab.html", "/homelab"],
    ["/portguardian", "/portguardian"],
    ["/portguardian.html", "/portguardian"]
]);

// All valid HTML portfolio page paths (clean and .html variants) for server-side edge_nav detection
const PORTFOLIO_HTML_PATHS = new Set([
    "/", "/index.html",
    "/dental-clinic", "/dental-clinic.html",
    "/homelab", "/homelab.html",
    "/portguardian", "/portguardian.html",
    "/de", "/de/", "/de/index.html",
    "/de/dental-clinic", "/de/dental-clinic.html",
    "/de/homelab", "/de/homelab.html",
    "/de/portguardian", "/de/portguardian.html",
    "/fr", "/fr/", "/fr/index.html",
    "/fr/dental-clinic", "/fr/dental-clinic.html",
    "/fr/homelab", "/fr/homelab.html",
    "/fr/portguardian", "/fr/portguardian.html"
]);

const DACH_COUNTRIES = new Set(["DE", "AT", "LI", "CH"]);
const DACH_TIMEZONES = new Set(["Europe/Berlin", "Europe/Vienna", "Europe/Zurich", "Europe/Vaduz", "Europe/Busingen"]);

// Expanded cloud, VPS, and corporate proxy ASNs (used strictly as classification metadata, never to drop German visitors)
const DATACENTER_ASNS = new Set([
    "AS24940",  // Hetzner
    "AS16509",  // Amazon AWS
    "AS14618",  // Amazon AWS
    "AS14061",  // DigitalOcean
    "AS16276",  // OVH
    "AS63949",  // Linode / Akamai
    "AS20940",  // Akamai
    "AS15169",  // Google Cloud
    "AS396982", // Google Cloud
    "AS8075",   // Microsoft Azure
    "AS31898",  // Oracle Cloud
    "AS20473",  // Choopa / Vultr
    "AS51167",  // Contabo
    "AS60068",  // Datacamp
    "AS13335",  // Cloudflare / WARP
    "AS54113",  // Fastly
    "AS9009",   // M247
    "AS45102",  // Alibaba Cloud
    "AS132203", // Tencent Cloud
    "AS60781",  // Leaseweb
    "AS28753",  // Leaseweb DE
    "AS30633",  // Leaseweb US
    "AS395954", // Leaseweb
    "AS7203",   // Leaseweb
    "AS50300",  // CustodianDC
    "AS218785", // TC Datacenter
    "AS12876",  // Scaleway
    "AS203020", // HostRoyale
    "AS10557",  // EGIHosting
    "AS22616",  // Zscaler
    "AS53813",  // Zscaler
    "AS62044"   // Zscaler
]);

const DATACENTER_ISP_KEYWORDS = [
    "amazon", "aws", "google cloud", "google llc", "microsoft", "azure",
    "hetzner", "ovh", "digitalocean", "linode", "akamai", "vultr", "choopa",
    "oracle", "contabo", "datacamp", "m247", "leaseweb", "alibaba", "tencent",
    "custodiandc", "datacenter", "data center", "hosting", "vps", "scaleway",
    "zscaler", "netskope", "cloudflare"
];

const CRAWLER_UA_RE = /bot|spider|crawl|slurp|mediapartners|adsbot|bingpreview|facebookexternalhit|whatsapp|slackbot|discordbot|telegrambot|linkedinbot|xing-contenttabreceiver|applebot|petalbot|bytespider|gptbot|claudebot|anthropic|perplexity|ahrefs|semrush|mj12bot|dotbot|censys|zgrab|nmap|masscan|curl\/|wget\/|python-requests|python-urllib|go-http-client|scrapy|axios\/|okhttp|java\/|headlesschrome|phantomjs|playwright|puppeteer|selenium/i;

// Search engines and link-preview unfurlers must receive direct 200 OK without geo-redirects
const PREVIEW_OR_SEARCH_BOT_RE = /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|applebot|linkedinbot|xing|twitterbot|facebookexternalhit|whatsapp|slackbot|discordbot|telegrambot/i;

const ENGAGEMENT_EVENTS = new Set([
    "video_open",
    "faq_open",
    "pdf_download",
    "contact_click",
    "outbound_click",
    "contact_form_submit",
    "language_switch"
]);

function normalizeLanguage(value) {
    if (!value) return null;
    const candidate = String(value).trim().toLowerCase();
    if (SUPPORTED_LANGS.has(candidate)) return candidate;
    const shortCode = candidate.slice(0, 2);
    return SUPPORTED_LANGS.has(shortCode) ? shortCode : null;
}

function readCookie(cookieHeader, name) {
    if (!cookieHeader) return null;
    for (const entry of cookieHeader.split(";")) {
        const [rawName, ...rawValueParts] = entry.trim().split("=");
        if (rawName !== name) continue;
        try {
            return decodeURIComponent(rawValueParts.join("=")).trim();
        } catch (_) {
            return rawValueParts.join("=").trim();
        }
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

function isDatacenterNetwork(asnStr, ispName) {
    if (asnStr && DATACENTER_ASNS.has(asnStr)) return true;
    const lowerIsp = String(ispName || "").toLowerCase();
    if (!lowerIsp) return false;
    return DATACENTER_ISP_KEYWORDS.some(kw => lowerIsp.includes(kw));
}

function isGermanTargetSignal({ country, tz, langs, acceptLang }) {
    const c = String(country || "").toUpperCase();
    if (DACH_COUNTRIES.has(c)) return true;
    if (tz && DACH_TIMEZONES.has(String(tz))) return true;
    const primaryClientLang = String(langs || "").split(",")[0].trim().toLowerCase();
    if (primaryClientLang.startsWith("de")) return true;
    const primaryHeaderLang = String(acceptLang || "").split(",")[0].trim().toLowerCase();
    if (primaryHeaderLang.startsWith("de")) return true;
    return false;
}

function resolveTargetLanguageByGeoAndHeader(countryCode, acceptLanguageHeader) {
    const country = String(countryCode || "").toUpperCase();
    const headerLang = readAcceptLanguage(acceptLanguageHeader);

    // 1. Strict DACH geography first (even when corporate laptop UI is set to English)
    if (country === "DE" || country === "AT" || country === "LI") {
        return "de";
    }
    if (country === "CH") {
        return headerLang === "fr" ? "fr" : "de";
    }
    if (country === "FR") {
        return "fr";
    }

    // 2. Outside DACH/FR: respect German/French browser language (catches German recruiters on NL/GB/US VPNs)
    if (headerLang === "de" || headerLang === "fr") {
        return headerLang;
    }

    return "en";
}

function extractBasePagePath(pathname) {
    if (ROOT_LOCALIZABLE_PATHS.has(pathname)) {
        return ROOT_LOCALIZABLE_PATHS.get(pathname);
    }
    const stripped = pathname.replace(/^\/(de|fr)(?=\/|$)/, "") || "/";
    if (ROOT_LOCALIZABLE_PATHS.has(stripped)) {
        return ROOT_LOCALIZABLE_PATHS.get(stripped);
    }
    return null;
}

function buildCleanLocalizedPath(basePagePath, lang) {
    const normalizedBase = basePagePath === "/index.html" || !basePagePath ? "/" : basePagePath;
    if (lang === "en") {
        return normalizedBase;
    }
    if (normalizedBase === "/") {
        return `/${lang}/`;
    }
    return `/${lang}${normalizedBase}`;
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

function attachResponseHeaders(response, cookies = [], addGeoVary = false) {
    const headers = new Headers(response.headers);
    for (const c of cookies) {
        headers.append("Set-Cookie", c);
    }
    if (addGeoVary) {
        appendVary(headers, "Accept-Language");
        appendVary(headers, "Cookie");
    }
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
    });
}

function buildRedirectResponse(targetUrl, status = 302, cookies = []) {
    const headers = new Headers();
    headers.set("Location", targetUrl.toString());
    for (const c of cookies) {
        headers.append("Set-Cookie", c);
    }
    headers.set("Cache-Control", "private, no-store");
    headers.set("Vary", "Accept-Language, Cookie");
    return new Response(null, { status, headers });
}

function parseScrollPct(val) {
    if (typeof val === "number") return val;
    if (!val) return 0;
    const m = String(val).match(/(\d+(?:\.\d+)?)/);
    return m ? Number(m[1]) : 0;
}

function classifySessionEvents(evs) {
    let isDc = false;
    let uaBot = false;
    let webdriver = false;
    let interacted = false;
    let maxInteractions = 0;
    let maxScroll = 0;
    let maxDwell = 0;
    let hasEngagementClick = false;
    let onlyColdPdf = true;
    let isGerman = false;

    for (const e of evs) {
        if (e.is_dc || isDatacenterNetwork(e.asn, e.isp)) isDc = true;
        if (e.ua_bot || CRAWLER_UA_RE.test(e.ua || "")) uaBot = true;
        if (e.webdriver === true) webdriver = true;
        if (e.interacted === true) interacted = true;
        if ((Number(e.interactions) || 0) > maxInteractions) {
            maxInteractions = Number(e.interactions) || 0;
        }
        const sc = parseScrollPct(e.scroll);
        if (sc > maxScroll) maxScroll = sc;
        if (typeof e.dwellSec === "number" && e.dwellSec > maxDwell) {
            maxDwell = e.dwellSec;
        }
        if (ENGAGEMENT_EVENTS.has(e.event)) {
            hasEngagementClick = true;
        }
        if (e.event !== "edge_pdf_download" || e.has_sid_cookie || String(e.ref || "").includes("grydsh.dev")) {
            onlyColdPdf = false;
        }
        if (isGermanTargetSignal({
            country: e.country,
            tz: e.tz,
            langs: e.langs,
            acceptLang: e.acceptLang,
            page: e.page
        })) {
            isGerman = true;
        }
    }

    const hasHumanProof = !webdriver && !uaBot && (
        interacted ||
        maxInteractions > 0 ||
        maxScroll > 0 ||
        maxDwell >= 8 ||
        hasEngagementClick
    );

    let classification = "scanner_or_unverified";
    if (webdriver || uaBot || onlyColdPdf || (isDc && !hasHumanProof && !isGerman)) {
        classification = "bot_or_scraper";
    } else if (hasHumanProof) {
        classification = "verified_human";
    }

    return {
        classification,
        isGerman,
        isDc,
        uaBot,
        webdriver,
        interacted,
        maxInteractions,
        maxScroll,
        maxDwell,
        hasEngagementClick
    };
}

async function listKeysForPrefix(kv, prefix, maxPages = 3) {
    const keys = [];
    let cursor = undefined;
    for (let page = 0; page < maxPages; page++) {
        const res = await kv.list({ prefix, limit: 1000, cursor });
        if (res.keys && res.keys.length > 0) {
            keys.push(...res.keys);
        }
        if (res.list_complete || !res.cursor) {
            break;
        }
        cursor = res.cursor;
    }
    return keys;
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
        const ispName = cf.asOrganization || "unknown";
        const isDatacenter = isDatacenterNetwork(asnStr, ispName);
        const rawUa = request.headers.get("user-agent") || "";
        const isCrawlerUa = CRAWLER_UA_RE.test(rawUa);
        const acceptLangHeader = request.headers.get("Accept-Language") || "";

        // Unified Session Cookie resolution (_gryd_sid)
        const cookieSid = readCookie(cookieHeader, "_gryd_sid");
        const needsSidCookie = !cookieSid;
        const currentSid = cookieSid || `s_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
        const sidCookieHeader = `_gryd_sid=${encodeURIComponent(currentSid)}; Max-Age=86400; Path=/; SameSite=Lax; Secure`;

        // 1. Telemetry CORS preflight (works on both grydsh.dev and www.grydsh.dev)
        if ((url.pathname === "/api/v1/sync" || url.pathname === "/api/track" || url.pathname === "/sync") && request.method === "OPTIONS") {
            return new Response(null, {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type"
                }
            });
        }

        // 2. High-Precision Telemetry Receiver (/api/v1/sync)
        if ((url.pathname === "/api/v1/sync" || url.pathname === "/api/track" || url.pathname === "/sync") && request.method === "POST") {
            try {
                const originHeader = request.headers.get("origin") || "";
                if (originHeader && !/^https:\/\/(www\.)?grydsh\.dev$/i.test(originHeader)) {
                    return new Response(JSON.stringify({ ok: false, skipped: "foreign_origin" }), {
                        status: 403,
                        headers: { "Content-Type": "application/json" }
                    });
                }

                let body = null;
                try {
                    const rawText = await request.text();
                    body = JSON.parse(rawText);
                } catch (_) {
                    body = null;
                }

                if (!body || typeof body.event !== "string" || !body.event.trim()) {
                    return new Response(JSON.stringify({ ok: false, skipped: "invalid_payload" }), {
                        status: 400,
                        headers: { "Content-Type": "application/json" }
                    });
                }

                const isGermanTarget = isGermanTargetSignal({
                    country: cf.country,
                    tz: body.tz,
                    langs: body.langs,
                    acceptLang: acceptLangHeader,
                    page: body.url
                });

                // Never drop DACH/German-signal payloads; only skip explicit non-DACH crawler UAs
                if (!isGermanTarget && isCrawlerUa) {
                    return new Response(JSON.stringify({ ok: true, skipped: "crawler_ua" }), {
                        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
                    });
                }

                const now = new Date();
                const headerRef = request.headers.get("referer") || "";

                const eventData = {
                    sid: body.sid || currentSid,
                    event: body.event.trim(),
                    page: body.url || url.pathname,
                    title: body.title || "",
                    lang: body.lang || "de",
                    langs: body.langs || "",
                    acceptLang: acceptLangHeader.slice(0, 64),
                    ref: body.ref !== undefined ? body.ref : headerRef,
                    ip: clientIp,
                    country: cf.country || "unknown",
                    city: cf.city || "unknown",
                    region: cf.region || "unknown",
                    postal: cf.postalCode || "",
                    isp: ispName,
                    asn: asnStr,
                    colo: cf.colo || "",
                    httpProto: cf.httpProtocol || "",
                    tlsVer: cf.tlsVersion || "",
                    is_dc: isDatacenter,
                    ua_bot: isCrawlerUa,
                    webdriver: Boolean(body.webdriver),
                    interacted: Boolean(body.interacted),
                    interactions: Number(body.interactions) || 0,
                    vis: body.vis || "",
                    screen: body.screen || "",
                    vp: body.vp || "",
                    dpr: body.dpr || "",
                    tz: body.tz || "",
                    cores: body.cores || "",
                    mem: body.mem || "",
                    scroll: body.scroll || "",
                    dwellSec: typeof body.dwellSec === "number" ? body.dwellSec : null,
                    sections: body.sections_read || body.sections || null,
                    projects: body.projects_viewed || body.projects || null,
                    caseStudies: body.case_studies || body.caseStudies || null,
                    diagrams: body.diagrams || null,
                    dropdownCount: typeof body.dropdown_count === "number" ? body.dropdown_count : null,
                    faqs: body.faqs || null,
                    outbound: body.outbound || null,
                    id: body.id || "",
                    question: body.question || "",
                    file: body.file || "",
                    dest: body.dest || "",
                    label: body.label || "",
                    fromLang: body.fromLang || "",
                    toLang: body.toLang || "",
                    target: body.target || "",
                    status: body.status || "",
                    ua: rawUa,
                    source: "client_stealth",
                    timestamp: now.toISOString()
                };

                if (isGermanTarget || !isDatacenter) {
                    console.log({
                        type: "portfolio_telemetry",
                        source: "client_stealth",
                        sid: eventData.sid,
                        event: eventData.event,
                        country: eventData.country,
                        city: eventData.city,
                        asn: eventData.asn,
                        isp: eventData.isp,
                        is_dc: eventData.is_dc,
                        interacted: eventData.interacted,
                        dwellSec: eventData.dwellSec,
                        scroll: eventData.scroll,
                        page: eventData.page
                    });
                }

                if (env && env.ANALYTICS) {
                    const key = `evt:${now.getTime()}:${Math.random().toString(36).substring(2, 7)}`;
                    const writePromise = env.ANALYTICS.put(key, JSON.stringify(eventData), { expirationTtl: 2592000 }).catch(() => {});
                    if (ctx && ctx.waitUntil) {
                        ctx.waitUntil(writePromise);
                    } else {
                        await writePromise;
                    }
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

                return new Response(JSON.stringify({ ok: true, sid: eventData.sid }), {
                    headers: respHeaders
                });
            } catch (err) {
                return new Response(JSON.stringify({ ok: false, error: err.message }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                });
            }
        }

        // 3. Canonicalize www.grydsh.dev -> grydsh.dev (301 permanent redirect)
        if (url.hostname === "www.grydsh.dev") {
            const canonical = new URL(request.url);
            canonical.hostname = "grydsh.dev";
            return Response.redirect(canonical.toString(), 301);
        }

        // 4. Live Telemetry Stats API (/api/stats)
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

            const nowMs = Date.now();
            const prefixToday = `evt:${nowMs.toString().slice(0, 5)}`;
            const prefixYesterday = `evt:${(nowMs - 86400000).toString().slice(0, 5)}`;

            let allKeyObjs = await listKeysForPrefix(env.ANALYTICS, prefixToday, 3);
            if (prefixYesterday !== prefixToday) {
                const prevKeys = await listKeysForPrefix(env.ANALYTICS, prefixYesterday, 2);
                allKeyObjs = prevKeys.concat(allKeyObjs);
            }

            const seenNames = new Set();
            const dedupedKeys = [];
            for (const k of allKeyObjs) {
                if (!seenNames.has(k.name)) {
                    seenNames.add(k.name);
                    dedupedKeys.push(k.name);
                }
            }
            dedupedKeys.sort();

            // Fetch up to the latest 300 events across the ~48h window so busy days never truncate at oldest 100
            const targetKeys = dedupedKeys.slice(-300).reverse();
            const rawValues = await Promise.all(targetKeys.map(name => env.ANALYTICS.get(name)));

            const events = [];
            const sessionMap = {};

            for (const val of rawValues) {
                if (!val) continue;
                try {
                    const ev = JSON.parse(val);
                    events.push(ev);
                    const sid = ev.sid || `session_${ev.ip || "unknown"}`;
                    if (!sessionMap[sid]) sessionMap[sid] = [];
                    sessionMap[sid].push(ev);
                } catch (_) {}
            }

            // Sort each session chronologically
            for (const sid of Object.keys(sessionMap)) {
                sessionMap[sid].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            }

            const pageSummary = {};
            const citySummary = {};
            const ispSummary = {};
            const eventTypeSummary = {};
            const verifiedHumanSessions = [];
            const germanVerifiedSessions = [];
            const germanScannerOrUnverifiedSessions = [];
            let botSessionCount = 0;

            // Deduplicated dwell per (sid, page) and deduplicated human PDF downloads per (sid, file)
            const maxDwellBySidPage = new Map();
            const humanPdfSet = new Set();
            const deHumanPdfSet = new Set();

            const journeys = [];

            for (const [sid, evs] of Object.entries(sessionMap)) {
                const meta = classifySessionEvents(evs);
                const first = evs[0];
                const last = evs[evs.length - 1];

                if (meta.classification === "bot_or_scraper") {
                    botSessionCount++;
                } else if (meta.classification === "verified_human") {
                    verifiedHumanSessions.push(sid);
                    if (meta.isGerman) germanVerifiedSessions.push(sid);
                } else if (meta.isGerman) {
                    germanScannerOrUnverifiedSessions.push(sid);
                }

                for (const e of evs) {
                    const evt = e.event || "unknown";
                    eventTypeSummary[evt] = (eventTypeSummary[evt] || 0) + 1;

                    if (meta.classification === "verified_human") {
                        const pageName = e.page || "/";
                        const city = e.city || "unknown";
                        const isp = e.isp || "unknown";
                        pageSummary[pageName] = (pageSummary[pageName] || 0) + 1;
                        citySummary[city] = (citySummary[city] || 0) + 1;
                        ispSummary[isp] = (ispSummary[isp] || 0) + 1;

                        if (typeof e.dwellSec === "number") {
                            const dpKey = `${sid}|${pageName}`;
                            const prev = maxDwellBySidPage.get(dpKey) || 0;
                            if (e.dwellSec > prev) maxDwellBySidPage.set(dpKey, e.dwellSec);
                        }

                        if (evt === "pdf_download" || evt === "edge_pdf_download") {
                            const normFile = String(e.file || e.page || "").split("?")[0].split("/").pop().toLowerCase();
                            if (normFile) {
                                humanPdfSet.add(`${sid}|${normFile}`);
                                if (meta.isGerman) deHumanPdfSet.add(`${sid}|${normFile}`);
                            }
                        }
                    }
                }

                journeys.push({
                    session_id: sid,
                    classification: meta.classification,
                    is_german_target: meta.isGerman,
                    is_datacenter_asn: meta.isDc,
                    ip: first.ip,
                    location: `${first.city}, ${first.region}, ${first.country}`,
                    organization: `${first.asn} ${first.isp}`.trim(),
                    device: `${first.vp || first.screen || ""} | tz=${first.tz || ""} | langs=${first.langs || first.acceptLang || ""}`,
                    max_dwell_sec: meta.maxDwell,
                    max_scroll_pct: `${meta.maxScroll}%`,
                    interacted: meta.interacted,
                    first_seen: first.timestamp,
                    last_seen: last.timestamp,
                    event_count: evs.length,
                    timeline: evs.map(e => ({
                        timestamp: e.timestamp,
                        source: e.source,
                        event: e.event,
                        page: e.page || "/",
                        ref: e.ref || undefined,
                        dwell_sec: e.dwellSec ?? undefined,
                        scroll_depth: e.scroll || undefined,
                        sections_read: e.sections || undefined,
                        projects_viewed: e.projects || undefined,
                        case_studies: e.caseStudies || undefined,
                        diagrams: e.diagrams || undefined,
                        label: e.label || e.question || e.file || undefined
                    }))
                });
            }

            journeys.sort((a, b) => new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime());

            const dwellValues = Array.from(maxDwellBySidPage.values());
            const avgDwell = dwellValues.length > 0
                ? Math.round(dwellValues.reduce((a, b) => a + b, 0) / dwellValues.length)
                : 0;

            const deJourneys = journeys.filter(j => j.is_german_target);
            const deVerifiedJourneys = deJourneys.filter(j => j.classification === "verified_human");
            const deAvgDwell = deVerifiedJourneys.length > 0
                ? Math.round(deVerifiedJourneys.reduce((a, j) => a + (j.max_dwell_sec || 0), 0) / deVerifiedJourneys.length)
                : 0;

            const verifiedSidSet = new Set(verifiedHumanSessions);
            const deVerifiedSidSet = new Set(germanVerifiedSessions);

            const responsePayload = {
                status: "success",
                timestamp_utc: new Date().toISOString(),
                german_recruiter_kpis: {
                    verified_de_human_sessions: germanVerifiedSessions.length,
                    de_scanner_or_bounce_sessions: germanScannerOrUnverifiedSessions.length,
                    de_avg_dwell_seconds: deAvgDwell,
                    de_pdf_downloads: deHumanPdfSet.size,
                    de_video_plays: events.filter(e => deVerifiedSidSet.has(e.sid) && e.event === "video_open").length,
                    de_faq_opens: events.filter(e => deVerifiedSidSet.has(e.sid) && e.event === "faq_open").length,
                    de_contact_clicks: events.filter(e => deVerifiedSidSet.has(e.sid) && (e.event === "contact_click" || e.event === "contact_form_submit")).length
                },
                kpis: {
                    total_raw_events_scanned: events.length,
                    verified_human_sessions: verifiedHumanSessions.length,
                    filtered_bot_or_scraper_sessions: botSessionCount,
                    avg_human_dwell_seconds: avgDwell,
                    human_pdf_downloads: humanPdfSet.size,
                    contact_clicks: events.filter(e => verifiedSidSet.has(e.sid) && e.event === "contact_click").length,
                    outbound_clicks: events.filter(e => verifiedSidSet.has(e.sid) && e.event === "outbound_click").length,
                    video_plays: events.filter(e => verifiedSidSet.has(e.sid) && e.event === "video_open").length
                },
                event_type_breakdown: eventTypeSummary,
                top_human_pages: pageSummary,
                top_human_organizations: ispSummary,
                top_human_locations: citySummary,
                german_journeys: deJourneys.slice(0, 50),
                recruiter_journeys: journeys.filter(j => j.classification !== "bot_or_scraper").slice(0, 40),
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

        // 5. Server-Side Edge PDF Telemetry (records context to separate real recruiters from cold PDF bots)
        const pathnameLower = url.pathname.toLowerCase();
        const isPdf = pathnameLower.endsWith(".pdf") && request.method === "GET";

        if (isPdf && env && env.ANALYTICS && ctx && ctx.waitUntil) {
            const headerRef = request.headers.get("referer") || "";
            const hasSameSiteRef = headerRef.includes("grydsh.dev");
            const isGermanPdf = isGermanTargetSignal({
                country: cf.country,
                acceptLang: acceptLangHeader,
                page: pathnameLower
            });

            // Skip obvious non-German cold bot PDF scrapes that lack both session cookie and site referer
            const shouldLogPdf = isGermanPdf || Boolean(cookieSid) || hasSameSiteRef || (!isCrawlerUa && !isDatacenter);
            if (shouldLogPdf) {
                ctx.waitUntil((async () => {
                    try {
                        const now = new Date();
                        const edgePdfEvent = {
                            sid: currentSid,
                            event: "edge_pdf_download",
                            page: url.pathname,
                            file: url.pathname,
                            title: url.pathname.split("/").pop() || "PDF Report",
                            ref: headerRef,
                            has_sid_cookie: Boolean(cookieSid),
                            sec_fetch_dest: request.headers.get("sec-fetch-dest") || "",
                            sec_fetch_mode: request.headers.get("sec-fetch-mode") || "",
                            ip: clientIp,
                            country: cf.country || "unknown",
                            city: cf.city || "unknown",
                            region: cf.region || "unknown",
                            postal: cf.postalCode || "",
                            isp: ispName,
                            asn: asnStr,
                            colo: cf.colo || "",
                            is_dc: isDatacenter,
                            ua_bot: isCrawlerUa,
                            acceptLang: acceptLangHeader.slice(0, 64),
                            ua: rawUa,
                            source: "edge_server",
                            timestamp: now.toISOString()
                        };
                        const key = `evt:${now.getTime()}:${Math.random().toString(36).substring(2, 7)}`;
                        await env.ANALYTICS.put(key, JSON.stringify(edgePdfEvent), { expirationTtl: 2592000 });
                    } catch (_) {}
                })());
            }
        }

        // 6. Clean Geographic & Explicit Language Routing (Zero ?lang= client-side redirect chain)
        const queryLang = normalizeLanguage(url.searchParams.get("lang"));
        const cookieLang = normalizeLanguage(readCookie(cookieHeader, "preferredLang"));
        const basePagePath = extractBasePagePath(url.pathname);

        // 6a. Legacy ?lang=de|en|fr links immediately 302 to clean canonical path (/de/, /, /fr/)
        if (queryLang && basePagePath && request.method === "GET") {
            const targetUrl = new URL(request.url);
            targetUrl.pathname = buildCleanLocalizedPath(basePagePath, queryLang);
            targetUrl.searchParams.delete("lang");
            const prefCookie = `preferredLang=${encodeURIComponent(queryLang)}; Max-Age=31536000; Path=/; SameSite=Lax; Secure`;
            return buildRedirectResponse(targetUrl, 302, [prefCookie]);
        }

        const secFetchMode = (request.headers.get("sec-fetch-mode") || "").toLowerCase();
        const secPurpose = (request.headers.get("sec-purpose") || request.headers.get("purpose") || "").toLowerCase();
        const isPrefetch = secPurpose.includes("prefetch") || secPurpose.includes("prerender");
        const isServiceWorkerSubfetch = secFetchMode && secFetchMode !== "navigate";
        const isSearchOrPreviewBot = Boolean(cf.botManagement?.verifiedBot) || PREVIEW_OR_SEARCH_BOT_RE.test(rawUa);

        // 6b. Unlocalized root pages (/, /dental-clinic, /homelab, /portguardian): redirect to /de/... or /fr/...
        //     unless user explicitly chose English (preferredLang=en) or visitor is a search/preview bot
        if (ROOT_LOCALIZABLE_PATHS.has(url.pathname) && request.method === "GET" && !isSearchOrPreviewBot && !isServiceWorkerSubfetch && !isPrefetch) {
            const cleanBase = ROOT_LOCALIZABLE_PATHS.get(url.pathname);
            const desiredLang = cookieLang || resolveTargetLanguageByGeoAndHeader(cf.country, acceptLangHeader);

            if (desiredLang === "de" || desiredLang === "fr") {
                const redirectUrl = new URL(request.url);
                redirectUrl.pathname = buildCleanLocalizedPath(cleanBase, desiredLang);
                // Do not set preferredLang on automatic geo-redirect; only set _gryd_sid on the final 200 landing
                return buildRedirectResponse(redirectUrl, 302, []);
            }

            if (url.pathname === "/index.html") {
                const canonicalRoot = new URL(request.url);
                canonicalRoot.pathname = "/";
                return buildRedirectResponse(canonicalRoot, 301, []);
            }
        }

        // 7. Fetch from static-assets origin Worker (portfolio)
        const response = await fetch(request);

        // Ensure /sw.js always revalidates instead of inheriting 24h /*.js CDN cache
        if (url.pathname === "/sw.js" && response.status === 200) {
            const swHeaders = new Headers(response.headers);
            swHeaders.set("Cache-Control", "public, max-age=0, must-revalidate");
            return new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers: swHeaders
            });
        }

        // 404 HTML fallback -> clean localized homepage
        if (response.status === 404 && request.method === "GET") {
            const accept = request.headers.get("Accept") || "";
            if (accept.includes("text/html")) {
                const fallbackLang = cookieLang || resolveTargetLanguageByGeoAndHeader(cf.country, acceptLangHeader);
                const homeUrl = new URL(buildCleanLocalizedPath("/", fallbackLang), BASE_URL);
                return buildRedirectResponse(homeUrl, 302, []);
            }
        }

        // 8. Server-side edge_nav safety net: captures first German/DACH HTML landing even if JS/beacons are blocked
        const respContentType = (response.headers.get("content-type") || "").toLowerCase();
        const isHtml200 = response.status === 200 && respContentType.includes("text/html");
        const isRealNavigation = request.method === "GET" && (!secFetchMode || secFetchMode === "navigate") && !isPrefetch;

        if (isHtml200 && isRealNavigation && PORTFOLIO_HTML_PATHS.has(url.pathname)) {
            const isGermanLanding = isGermanTargetSignal({
                country: cf.country,
                acceptLang: acceptLangHeader,
                page: url.pathname
            });

            if (isGermanLanding && needsSidCookie && !isCrawlerUa && env && env.ANALYTICS && ctx && ctx.waitUntil) {
                const headerRef = request.headers.get("referer") || "";
                ctx.waitUntil((async () => {
                    try {
                        const now = new Date();
                        const navEvent = {
                            sid: currentSid,
                            event: "edge_nav",
                            page: url.pathname,
                            ref: headerRef,
                            sec_fetch_mode: secFetchMode,
                            sec_fetch_site: request.headers.get("sec-fetch-site") || "",
                            ip: clientIp,
                            country: cf.country || "unknown",
                            city: cf.city || "unknown",
                            region: cf.region || "unknown",
                            postal: cf.postalCode || "",
                            isp: ispName,
                            asn: asnStr,
                            colo: cf.colo || "",
                            httpProto: cf.httpProtocol || "",
                            tlsVer: cf.tlsVersion || "",
                            is_dc: isDatacenter,
                            ua_bot: false,
                            acceptLang: acceptLangHeader.slice(0, 64),
                            ua: rawUa,
                            source: "edge_server",
                            timestamp: now.toISOString()
                        };
                        console.log({
                            type: "portfolio_telemetry",
                            source: "edge_server",
                            event: "edge_nav",
                            sid: currentSid,
                            country: navEvent.country,
                            city: navEvent.city,
                            asn: navEvent.asn,
                            isp: navEvent.isp,
                            is_dc: isDatacenter,
                            page: url.pathname,
                            ref: headerRef
                        });
                        const key = `evt:${now.getTime()}:${Math.random().toString(36).substring(2, 7)}`;
                        await env.ANALYTICS.put(key, JSON.stringify(navEvent), { expirationTtl: 2592000 });
                    } catch (_) {}
                })());
            }

            const cookiesToAttach = needsSidCookie ? [sidCookieHeader] : [];
            const isRootPage = ROOT_LOCALIZABLE_PATHS.has(url.pathname);
            if (cookiesToAttach.length > 0 || isRootPage) {
                return attachResponseHeaders(response, cookiesToAttach, isRootPage);
            }
        }

        return response;
    }
};
