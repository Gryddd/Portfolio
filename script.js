document.addEventListener("DOMContentLoaded", function () {
    // Enable smooth scroll after initial load to prevent "fast scroll" on return
    setTimeout(() => {
        document.documentElement.classList.add('smooth-scroll');
    }, 500);

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .catch(() => {});
        });
    }

    const themeToggleBtns = document.querySelectorAll('.theme-toggle');
    const rootElement = document.documentElement;
    const savedTheme = localStorage.getItem('portfolio-theme');

    if (savedTheme === 'light') {
        rootElement.setAttribute('data-theme', 'light');
    }

    themeToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const themeColorMeta = document.getElementById('theme-color-meta');
            if (rootElement.getAttribute('data-theme') === 'light') {
                rootElement.removeAttribute('data-theme');
                localStorage.setItem('portfolio-theme', 'dark');
                if (themeColorMeta) themeColorMeta.setAttribute('content', '#000000');
            } else {
                rootElement.setAttribute('data-theme', 'light');
                localStorage.setItem('portfolio-theme', 'light');
                if (themeColorMeta) themeColorMeta.setAttribute('content', '#f5f5f7');
            }
        });
    });

    const themeColorMeta = document.getElementById('theme-color-meta');
    if (savedTheme === 'light' && themeColorMeta) {
        themeColorMeta.setAttribute('content', '#f5f5f7');
    }

    const backgroundVideo = document.getElementById('background-video');
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const animationReadyEvent = 'portfolio:ready';
    const hasProjectLoader = Boolean(document.getElementById('case-loader') || document.getElementById('rose-loader'));
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mainHeroCard = document.querySelector('body:not(.project-case-page) .hero-card');
    const isPortGuardianPage = document.body.classList.contains('portguardian-case-page');

    if (mainHeroCard && !prefersReducedMotion) {
        document.documentElement.classList.add('hero-reveal-pending');
    }

    function signalAnimationsReady() {
        if (document.documentElement.dataset.animationsReady === 'true') return;
        document.documentElement.dataset.animationsReady = 'true';
        document.dispatchEvent(new Event(animationReadyEvent));
        if (typeof AOS !== 'undefined') {
            window.requestAnimationFrame(() => AOS.refreshHard());
        }
    }

    function releaseDeferredAnimations() {
        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                document.documentElement.classList.remove('hero-reveal-pending');
                signalAnimationsReady();
            });
        });
    }

    function waitForWindowLoad(callback) {
        if (document.readyState === 'complete') {
            callback();
            return;
        }

        window.addEventListener('load', callback, { once: true });
    }

    function waitForFontsReady() {
        if (!document.fonts?.ready) return Promise.resolve();
        return document.fonts.ready.catch(() => {});
    }

    function shouldEnableBackgroundVideo() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const saveData = Boolean(connection?.saveData);
        const slowConnection = typeof connection?.effectiveType === 'string' && /(2g|3g)/i.test(connection.effectiveType);
        return !prefersReducedMotion && !saveData && !slowConnection;
    }

    function initializeBackgroundVideo() {
        if (!backgroundVideo) return;

        const shouldEnable = shouldEnableBackgroundVideo();
        document.body.classList.toggle('background-video-disabled', !shouldEnable);
        backgroundVideo.classList.remove('is-ready');

        if (!shouldEnable) {
            backgroundVideo.pause();
            backgroundVideo.innerHTML = '';
            return;
        }

        const markVideoReady = () => {
            backgroundVideo.classList.add('is-ready');
        };

        backgroundVideo.addEventListener('loadeddata', markVideoReady, { once: true });
        backgroundVideo.addEventListener('canplay', markVideoReady, { once: true });

        if (!backgroundVideo.querySelector('source') && backgroundVideo.dataset.src) {
            const source = document.createElement('source');
            source.src = backgroundVideo.dataset.src;
            source.type = 'video/webm';
            backgroundVideo.appendChild(source);
            backgroundVideo.load();
        }

        if (backgroundVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            markVideoReady();
        }

        backgroundVideo.play().catch(() => {});
    }

    const config = {
        defaultLang: "en",
        youtubeVideoId: "R_rKRfh7ceU",
        altTexts: {
            de: "Ein professionelles Portraitfoto von Walid Gourideche",
            en: "A professional portrait of Walid Gourideche",
            fr: "Un portrait professionnel de Walid Gourideche",
        },
        projects: {
            "project-modal-1": {
                currentSlide: 0,
                slides: [
                    {
                        img: "diagram.png",
                        title: { de: "Architekturübersicht", en: "Architecture Overview", fr: "Vue d'ensemble de l'architecture" },
                        text: {
                            de:
                                "Das Projekt begann mit dem Aufbau einer kompletten End-to-End-Unternehmensinfrastruktur. Dies umfasste die Konfiguration eines pfSense-Firewalls, eines Windows Servers als Domänencontroller und die Netzwerksegmentierung, um eine realistische Umgebung zu schaffen.",
                            en:
                                "The project began with the construction of a complete end-to-end enterprise infrastructure. This included configuring a pfSense firewall, a Windows Server as a Domain Controller, and segmenting the network to create a realistic environment.",
                            fr:
                                "Le projet a débuté par la mise en place d'une infrastructure d'entreprise complète. Cela incluait la configuration d'un pare-feu pfSense, d'un serveur Windows en tant que contrôleur de domaine, et la segmentation du réseau pour simuler un environnement professionnel.",
                        },
                    },
                    {
                        img: "windows_server_roles.png",
                        title: { de: "Kerndienste: Domain Controller", en: "Core Services: Domain Controller", fr: "Services Clés : Contrôleur de Domaine" },
                        text: {
                            de:
                                "Ein Windows Server 2022 wurde als Herzstück des Netzwerks bereitgestellt. Er wurde zur Rolle eines Domänencontrollers für die Domäne „homelab.local“ heraufgestuft und verwaltet die zentralen Active Directory- und DNS-Dienste.",
                            en: 'A Windows Server 2022 was deployed as the heart of the network. It was promoted to the role of a Domain Controller for the "homelab.local" domain, managing centralized Active Directory and DNS services.',
                            fr: "Un serveur Windows 2022 a été déployé comme cœur du réseau. Promu au rôle de contrôleur de domaine pour 'homelab.local', il gère de manière centralisée les services Active Directory et DNS.",
                        },
                    },
                    {
                        img: "netdata_snmp_devices.png",
                        title: { de: "Netzwerk-Monitoring: Leistung", en: "Network Monitoring: Performance", fr: "Surveillance Réseau : Performance" },
                        text: {
                            de:
                                "Ein anfängliches Monitoring wurde mit Netdata implementiert, um Echtzeit-Leistungs- und Zustandsmetriken für die gesamte Kerninfrastruktur zu liefern. Dies gewährleistete die Stabilität des Netzwerks, bevor weitere Sicherheitsmaßnahmen implementiert wurden.",
                            en:
                                "Initial monitoring was implemented using Netdata to provide real-time performance and health metrics for all core infrastructure. This ensured network stability and performance before layering on security measures.",
                            fr:
                                "Une surveillance initiale des performances a été mise en place avec Netdata, offrant des métriques en temps réel sur l'état de l'infrastructure. Cette étape a garanti la stabilité du réseau avant l'intégration des dispositifs de sécurité.",
                        },
                    },
                    {
                        img: "5.png",
                        title: { de: "Sicherheitshärtung: IPS-Bereitstellung", en: "Security Hardening: IPS Deployment", fr: "Durcissement de la Sécurité : Déploiement de l'IPS" },
                        text: {
                            de:
                                "Nachdem die Netzwerkstabilität sichergestellt war, verlagerte sich der Fokus auf die Sicherheit. Ein fortschrittliches Intrusion Prevention System (Suricata) wurde auf der pfSense-Firewall bereitgestellt und mit den branchenüblichen ETOpen-Regelsätzen zur Bedrohungserkennung ausgestattet.",
                            en:
                                "With the network operational, the focus shifted to security. An advanced Intrusion Prevention System (Suricata) was deployed on the pfSense firewall. The ETOpen rule sets were enabled to arm the system with industry-standard threat intelligence.",
                            fr:
                                "Une fois le réseau opérationnel, l'accent a été mis sur la sécurité. Un système de prévention d'intrusion (IPS) avancé, Suricata, a été déployé sur le pare-feu pfSense, puis armé avec les règles de menaces standard de l'industrie (ETOpen).",
                        },
                    },
                    {
                        img: "6.png",
                        title: { de: "Simulation einer Insider-Bedrohung", en: "Insider Threat Simulation", fr: "Simulation d'une Menace Interne" },
                        text: {
                            de:
                                "Um das IPS zu validieren, wurde eine Insider-Bedrohung simuliert, indem ein Aufklärungsscan von einer internen Workstation (192.168.10.101) gegen den Domänencontroller (192.168.10.10) mit Nmap gestartet wurde. Dies ahmt einen Angreifer nach, der das interne Netzwerk nach Schwachstellen absucht.",
                            en:
                                "To validate the IPS, an insider threat was simulated by launching a reconnaissance scan from an internal workstation (192.168.10.101) against the Domain Controller (192.168.10.10) using Nmap. This mimics an attacker mapping the internal network for vulnerabilities.",
                            fr:
                                "Pour valider l'IPS, une menace interne a été simulée en lançant un scan de reconnaissance depuis un poste de travail interne vers le contrôleur de domaine avec Nmap. Cette action imite un attaquant qui cartographie le réseau à la recherche de vulnérabilités.",
                        },
                    },
                    {
                        img: "7.png",
                        title: { de: "Erfolgreiche Bedrohungserkennung", en: "Successful Threat Detection", fr: "Détection de Menace Réussie" },
                        text: {
                            de:
                                "Das IPS hat den feindlichen Scan sofort in Echtzeit erkannt und mehrere hochpriore Alarme ausgelöst, darunter „ET SCAN Possible Nmap User-Agent“. Dies beweist die Fähigkeit des Systems, Bedrohungen innerhalb des vertrauenswürdigen Netzwerks zuverlässig zu identifizieren.",
                            en:
                                'The IPS successfully detected the hostile scan in real-time. Multiple high-priority alerts, including "ET SCAN Possible Nmap User-Agent", were triggered. This proves the system’s ability to reliably identify and alert on threats within the trusted network, confirming the project’s success.',
                            fr:
                                "L'IPS a détecté avec succès le scan hostile en temps réel. De multiples alertes de haute priorité, incluant « ET SCAN Possible Nmap User-Agent », ont été déclenchées. Cela prouve la capacité du système à identifier et à signaler de manière fiable les menaces au sein du réseau de confiance, confirmant ainsi le succès du projet.",
                        },
                    },
                ],
            },
            "project-modal-4": {
                currentSlide: 0,
                slides: [
                    {
                        img: "leagueskins_thumb.webp",
                        title: {
                            de: "Open Source Maintainer Rolle",
                            en: "Open Source Maintainer Role",
                            fr: "Rôle de Mainteneur Open Source"
                        },
                        text: {
                            de: "Ich pflege LeagueSkins/ROSE für ein Open-Source-Ökosystem mit über 10K Nutzern und mehr als 100K Downloads weltweit. Meine Rolle ist entscheidend für die Systemstabilität, da proprietäre Spieldaten korrekt validiert, strukturiert und für Releases bereitgestellt werden.",
                            en: "I maintain LeagueSkins/ROSE for an open-source ecosystem with over 10K users and more than 100K downloads worldwide. My role is critical for stability, ensuring proprietary game data is correctly validated, structured, and prepared for release.",
                            fr: "Je maintiens LeagueSkins/ROSE pour un écosystème open source comptant plus de 10K utilisateurs et plus de 100K téléchargements dans le monde. Mon rôle est clé pour la stabilité, en veillant à ce que les données propriétaires du jeu soient validées, structurées et prêtes pour la publication."
                        }
                    },
                    {
                        img: "leagueskins_code.png",
                        title: {
                            de: "Reverse Engineering & Debugging",
                            en: "Reverse Engineering & Debugging",
                            fr: "Rétro-ingénierie & Débogage"
                        },
                        text: {
                            de: "Um komplexe Rendering-Fehler zu beheben (wie im Code gezeigt), führe ich Reverse Engineering an binären Konfigurationsdateien (.bin) durch. Ich analysiere Parameter wie <code>InitialSubmeshToHide</code> und patche die Logik manuell, um fehlende Assets wiederherzustellen, die von automatisierten Tools übersehen wurden.",
                            en: "To resolve complex rendering bugs (as shown in the code), I perform reverse engineering on binary configuration files (.bin). I analyze parameters like <code>InitialSubmeshToHide</code> and manually patch the logic to restore missing assets that automated tools fail to detect.",
                            fr: "Pour résoudre des bugs de rendu complexes, j'effectue une rétro-ingénierie sur des fichiers de configuration binaires (.bin). J'analyse des paramètres comme <code>InitialSubmeshToHide</code> et corrige manuellement la logique pour restaurer les actifs manquants."
                        }
                    },
                    {
                        img: "leagueskins_files.png",
                        title: {
                            de: "Datenstruktur & QA-Workflow",
                            en: "Data Structure & QA Workflow",
                            fr: "Structure des Données & Workflow QA"
                        },
                        text: {
                            de: "Ich leite ein Sub-Team von Testern, um Regressionstests für neue Patches durchzuführen. Mein Workflow umfasst die Nutzung von CLI-Tools (RitoBIN) zur Datenextraktion, Git zur Versionskontrolle und strikte JSON-Validierung, bevor Updates in die Live-Umgebung gepusht werden.",
                            en: "I lead a sub-team of testers to perform regression testing for new patches. My workflow involves using CLI tools (RitoBIN) for data extraction, Git for version control, and strict JSON validation before updates are pushed to the live production environment.",
                            fr: "Je dirige une sous-équipe de testeurs pour effectuer des tests de régression. Mon flux de travail implique l'utilisation d'outils CLI (RitoBIN) pour l'extraction de données, Git pour le contrôle de version et une validation JSON stricte avant la mise en production."
                        }
                    }
                ]
            }
        }
    };
    const supportedLangs = ["de", "en", "fr"];
    const normalizeLanguage = value => {
        if (!value) return null;
        const candidate = String(value).toLowerCase();
        if (supportedLangs.includes(candidate)) return candidate;
        const shortCode = candidate.slice(0, 2);
        return supportedLangs.includes(shortCode) ? shortCode : null;
    };
    const pageLanguage = normalizeLanguage(document.body?.dataset.pageLang || document.documentElement.lang);
    const requestedQueryLanguage = (() => {
        try {
            return normalizeLanguage(new URL(window.location.href).searchParams.get("lang"));
        } catch (_) {
            return null;
        }
    })();
    const readPreferredLanguageCookie = () => {
        const cookieEntry = document.cookie
            .split(";")
            .map(entry => entry.trim())
            .find(entry => entry.startsWith("preferredLang="));

        if (!cookieEntry) return null;
        return normalizeLanguage(decodeURIComponent(cookieEntry.split("=").slice(1).join("=")));
    };
    const persistPreferredLanguage = lang => {
        const secureFlag = window.location.protocol === "https:" ? "; Secure" : "";
        document.cookie = `preferredLang=${encodeURIComponent(lang)}; Max-Age=31536000; Path=/; SameSite=Lax${secureFlag}`;
    };
    const resolveInitialLanguage = () => {
        const url = new URL(window.location.href);
        const pathLang = normalizeLanguage(url.pathname.split("/").filter(Boolean)[0]);
        const browserLang = (navigator.languages || [navigator.language]).map(normalizeLanguage).find(Boolean);
        return pathLang
            || pageLanguage
            || normalizeLanguage(url.searchParams.get("lang"))
            || readPreferredLanguageCookie()
            || normalizeLanguage(localStorage.getItem("preferredLang"))
            || browserLang
            || config.defaultLang;
    };
    const parseVisibleLanguages = value => String(value || "")
        .split(/[,\s]+/)
        .map(normalizeLanguage)
        .filter(Boolean);
    let currentLang = resolveInitialLanguage();
    let player;
    let lastActiveElement;
    let lastMobileNavFocus = null;
    let resizeTimer;
    const mainNav = document.querySelector(".main-nav");
    const mainContent = document.getElementById("main-content");
    const mobileMenuIcon = document.querySelector(".mobile-menu-icon");
    const mobileNavOverlay = document.getElementById("mobile-nav");
    const heroCtaDropdown = document.querySelector(".hero-cta-dropdown");
    const contactForm = document.getElementById("contact-form");
    const allModals = document.querySelectorAll(".modal");
    const videoModal = document.getElementById("video-modal");
    const toRootAssetPath = assetPath => {
        if (!assetPath || /^(https?:|data:|blob:)/i.test(assetPath)) return assetPath;
        return assetPath.startsWith("/") ? assetPath : `/${assetPath.replace(/^\.?\//, '')}`;
    };

    // Project Data for switching
    const projectOrder = ["3", "4", "1"];
    const projectsData = {
        "1": {
            id: "1",
            modalId: "project-modal-1",
            img: "images/widepre.webp",
            imagePosition: "center center",
            mobileAspectRatio: "16 / 5",
            title: {
                de: "Unternehmens-IT-Infrastruktur",
                en: "Enterprise IT Infrastructure",
                fr: "Infrastructure IT d'Entreprise"
            },
            desc: {
                de: "Ein End-to-End-Projekt zum Aufbau und zur Absicherung eines Unternehmensnetzwerks mit VMware, Windows Server, pfSense und einem Suricata IPS zur Abwehr von Insider-Bedrohungen.",
                en: "An end-to-end project building and securing an enterprise network using VMware, Windows Server, pfSense, and a Suricata IPS to defend against insider threats.",
                fr: "Un projet de bout en bout pour construire et sécuriser un réseau d'entreprise en utilisant VMware, Windows Server, pfSense et un IPS Suricata pour se défendre contre les menaces internes."
            },
            buttons: [
                { type: "modal", modalId: "project-modal-1", text: { de: "Details", en: "Details", fr: "Détails" } }
            ]
        },
        "3": {
            id: "3",
            img: "images/Portpreview.jpg",
            imagePosition: "center center",
            title: {
                de: "PortGuardian Enterprise",
                en: "PortGuardian Enterprise",
                fr: "PortGuardian Enterprise"
            },
            desc: {
                de: "Ein Windows-USB-Schutzagent mit WMI-Erkennung, lokaler sechsstufiger Analyse, automatischer Isolation und Splunk-Weiterleitung.",
                en: "A Windows USB defense agent with WMI detection, local six-layer analysis, automatic isolation, and Splunk forwarding.",
                fr: "Un agent de défense USB Windows avec détection WMI, analyse locale en six couches, isolation automatique et transfert vers Splunk."
            },
            buttons: [
                { type: "link", url: "portguardian.html", text: { de: "Details ansehen", en: "View Details", fr: "Voir détails" } }
            ]
        },
        "4": {
            id: "4",
            modalId: "project-modal-4",
            img: "images/leagueskins.jpg",
            imagePosition: "center center",
            title: {
                de: "LeagueSkins/ROSE",
                en: "LeagueSkins/ROSE",
                fr: "LeagueSkins/ROSE"
            },
            desc: {
                de: "LeagueSkins/ROSE für ein Open-Source-Ökosystem mit 10K+ Nutzern und mehr als 100K Downloads weltweit gepflegt. Fokus auf Reverse Engineering von Binärdateien (.bin), Fehlerbehebung und QA-Leitung.",
                en: "Maintained LeagueSkins/ROSE for an open-source ecosystem with 10K+ users and more than 100K downloads worldwide. Focused on reverse engineering binary files (.bin), troubleshooting, and QA leadership.",
                fr: "Maintenance de LeagueSkins/ROSE pour un écosystème open source avec 10K+ utilisateurs et plus de 100K téléchargements dans le monde. Accent sur la rétro-ingénierie de fichiers binaires (.bin) et la direction QA."
            },
            buttons: [
                { type: "link", url: "leagueskins.html", text: { de: "Details ansehen", en: "View Details", fr: "Voir détails" } }
            ]
        }
    };
    let activeProjectId = "3";
    let featuredProjectTimer;

    function attachFeaturedProjectButtonListeners(container) {
        container?.querySelectorAll('.open-project-modal-btn').forEach(button => {
            button.addEventListener('click', function() {
                const modalId = this.dataset.modalId;
                const modal = document.getElementById(modalId);
                if (!modal || !config.projects[modalId]) return;
                config.projects[modalId].currentSlide = 0;
                showProjectSlide(modalId, 0);
                openModal(modal, this);
            });
        });
    }

    function updateActiveProjectThumbnail(projectId) {
        document.querySelectorAll('.project-thumbnail').forEach(thumb => {
            const isActive = thumb.dataset.projectId === projectId;
            thumb.classList.toggle('active', isActive);
            thumb.setAttribute('aria-pressed', String(isActive));
        });
    }

    function updateFeaturedProject(projectId, direction = 'next', options = {}) {
        const { animate = true } = options;
        const project = projectsData[projectId];
        if (!project) return;

        const featuredImg = document.getElementById('featured-img');
        const featuredTitle = document.getElementById('featured-title');
        const featuredDesc = document.getElementById('featured-desc');
        const featuredButtons = document.getElementById('featured-buttons');
        const featuredProject = document.getElementById('featured-project');

        const applyProjectContent = () => {
            if (featuredImg) {
                featuredImg.src = toRootAssetPath(project.img);
                featuredImg.alt = project.title[currentLang];
                featuredImg.style.objectFit = project.imageFit || 'cover';
                featuredImg.style.objectPosition = project.imagePosition || 'top center';
            }

            if (featuredProject) {
                featuredProject.style.setProperty('--featured-project-mobile-aspect-ratio', project.mobileAspectRatio || '16 / 9');
            }

            if (featuredTitle) {
                featuredTitle.textContent = project.title[currentLang];
                featuredTitle.dataset.de = project.title.de;
                featuredTitle.dataset.en = project.title.en;
                featuredTitle.dataset.fr = project.title.fr;
            }

            if (featuredDesc) {
                featuredDesc.textContent = project.desc[currentLang];
                featuredDesc.dataset.de = project.desc.de;
                featuredDesc.dataset.en = project.desc.en;
                featuredDesc.dataset.fr = project.desc.fr;
            }

            if (featuredButtons) {
                featuredButtons.innerHTML = project.buttons.map(btn => {
                    if (btn.type === 'modal') {
                        return `<button type="button" class="submit-btn open-project-modal-btn lang"
                            data-de="${btn.text.de}" data-en="${btn.text.en}" data-fr="${btn.text.fr}"
                            data-modal-id="${btn.modalId}">${btn.text[currentLang]}</button>`;
                    }
                    const buttonHref = /^(https?:|mailto:|tel:)/i.test(btn.url)
                        ? btn.url
                        : getLocalizedPageUrl(btn.url, currentLang);
                    return `<a href="${buttonHref}" ${buttonHref.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''}
                        class="submit-btn ${btn.secondary ? 'submit-btn-secondary' : ''} lang"
                        data-de="${btn.text.de}" data-en="${btn.text.en}" data-fr="${btn.text.fr}">${btn.text[currentLang]}</a>`;
                }).join('');

                attachFeaturedProjectButtonListeners(featuredButtons);
            }
        };

        clearTimeout(featuredProjectTimer);
        activeProjectId = projectId;
        updateActiveProjectThumbnail(projectId);

        if (!featuredProject || !animate) {
            applyProjectContent();
            if (featuredProject) {
                featuredProject.style.opacity = '1';
                featuredProject.style.transform = 'translateX(0)';
            }
            return;
        }

        const outX = direction === 'next' ? -28 : 28;
        const inX = direction === 'next' ? 28 : -28;

        featuredProject.style.opacity = '0';
        featuredProject.style.transform = `translateX(${outX}px)`;

        featuredProjectTimer = setTimeout(() => {
            applyProjectContent();
            featuredProject.style.transition = 'none';
            featuredProject.style.transform = `translateX(${inX}px)`;

            void featuredProject.offsetHeight;

            featuredProject.style.transition = 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)';
            featuredProject.style.opacity = '1';
            featuredProject.style.transform = 'translateX(0)';
        }, 220);
    }
    const imageModal = document.getElementById("image-modal");
    const mobileToggle = document.querySelector('.mobile-toggle');
    const mobileList = document.querySelector('.mobile-list');
    const activeDropdownSelector = '.nav-dropdown.active, .mobile-language-selector.active, .hero-cta-dropdown.active, .project-report-dropdown.active, .experience-dropdown-container.active';
    const githubDataBadge = document.getElementById('github-data-badge');
    const githubDataStatus = document.getElementById('github-data-status');
    const languageConditionalElements = document.querySelectorAll('[data-visible-langs]');
    let mobileMenuScrollY = 0;
    const normalizeInternalPagePath = value => {
        if (!value) return window.PortfolioSeo?.getCurrentPagePath?.() || "/";
        if (/^(https?:|mailto:|tel:|#)/i.test(value)) return value;
        const normalizedValue = value.replace(/^\.\//, "");
        if (normalizedValue === "index.html") return "/";
        return normalizedValue.startsWith("/") ? normalizedValue : `/${normalizedValue}`;
    };
    const getLocalizedPageUrl = (pagePath, lang, hash = "") => {
        const normalizedPagePath = normalizeInternalPagePath(pagePath);
        if (/^(https?:|mailto:|tel:|#)/i.test(normalizedPagePath)) {
            return normalizedPagePath;
        }
        if (window.PortfolioSeo?.buildLocalizedUrl) {
            return window.PortfolioSeo.buildLocalizedUrl(normalizedPagePath, lang, hash);
        }
        const fallbackUrl = new URL(normalizedPagePath, window.location.origin);
        fallbackUrl.hash = hash ? (hash.startsWith("#") ? hash : `#${hash}`) : "";
        return fallbackUrl.toString();
    };

    function getActiveModal() {
        const activeModals = Array.from(allModals).filter(modal => modal.classList.contains("active"));
        return activeModals[activeModals.length - 1] || null;
    }

    function getFocusableElements(container) {
        if (!container) return [];
        return Array.from(container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
            .filter(element => !element.disabled
                && element.getAttribute('aria-hidden') !== 'true'
                && !element.hidden
                && !element.closest('[hidden], [inert]'));
    }

    function syncDropdownState(dropdown, isActive) {
        if (!dropdown) return;
        dropdown.classList.toggle('active', isActive);

        const toggle = dropdown.querySelector('.nav-dropdown-toggle, .mobile-toggle, .cta-dropdown-toggle');
        if (toggle) {
            toggle.setAttribute('aria-expanded', String(isActive));
            toggle.classList.toggle('active', isActive);
        }

        const menu = dropdown.querySelector('.nav-dropdown-menu, .mobile-list, .cta-dropdown-menu');
        if (menu) {
            menu.setAttribute('aria-hidden', String(!isActive));
        }

        if (!isActive) {
            collapseMobileLanguageList(dropdown);
        }
    }

    function collapseMobileLanguageList(dropdown) {
        if (!dropdown || !dropdown.matches('.mobile-language-selector')) return;
        const list = dropdown.querySelector('.mobile-list');
        if (list) list.style.maxHeight = '0';
    }

    function closeActiveDropdown() {
        const activeDropdown = document.querySelector(activeDropdownSelector);
        if (!activeDropdown) return;
        syncDropdownState(activeDropdown, false);
    }

    function lockMobileMenuScroll() {
        mobileMenuScrollY = window.scrollY || window.pageYOffset;
        document.body.style.top = `-${mobileMenuScrollY}px`;
        document.body.classList.add('mobile-nav-open');
    }

    function unlockMobileMenuScroll({ restoreScroll = true } = {}) {
        const inlineScrollBehavior = document.documentElement.style.scrollBehavior;
        document.body.classList.remove('mobile-nav-open');
        document.body.style.top = '';
        if (restoreScroll) {
            document.documentElement.style.scrollBehavior = 'auto';
            window.scrollTo({ top: mobileMenuScrollY, left: 0, behavior: 'auto' });
            window.requestAnimationFrame(() => {
                if (inlineScrollBehavior) {
                    document.documentElement.style.scrollBehavior = inlineScrollBehavior;
                } else {
                    document.documentElement.style.removeProperty('scroll-behavior');
                }
            });
        }
    }

    function setBackgroundContentInert(isInert) {
        [mainNav, mainContent].forEach(element => {
            if (!element) return;
            element.inert = isInert;
            if (isInert) {
                element.setAttribute('aria-hidden', 'true');
            } else {
                element.removeAttribute('aria-hidden');
            }
        });
    }

    function getMobileNavFocusableElements() {
        return getFocusableElements(mobileNavOverlay)
            .filter(element => element !== mobileMenuIcon);
    }

    function focusMobileNavFirstElement() {
        const [firstFocusable] = getMobileNavFocusableElements();
        firstFocusable?.focus();
    }

    function trapFocusInContainer(container, event) {
        const focusableElements = getFocusableElements(container);
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    }

    function setMobileNavState(isOpen, options = {}) {
        if (!mobileMenuIcon || !mobileNavOverlay) return;
        const { restoreFocus = true } = options;
        mobileMenuIcon.classList.toggle("change", isOpen);
        mobileNavOverlay.style.width = isOpen ? "100%" : "0%";
        mobileMenuIcon.setAttribute('aria-expanded', String(isOpen));
        mobileNavOverlay.setAttribute('aria-hidden', String(!isOpen));
        if (isOpen) {
            lastMobileNavFocus = document.activeElement instanceof HTMLElement ? document.activeElement : mobileMenuIcon;
            closeActiveDropdown();
            lockMobileMenuScroll();
            setBackgroundContentInert(true);
            window.requestAnimationFrame(() => {
                window.setTimeout(focusMobileNavFirstElement, 60);
            });
        } else {
            setBackgroundContentInert(false);
            unlockMobileMenuScroll(options);
            if (restoreFocus) {
                (lastMobileNavFocus || mobileMenuIcon)?.focus?.();
            }
            lastMobileNavFocus = null;
        }
    }

    const toggleMobileNav = () => {
        const isOpen = !mobileMenuIcon?.classList.contains("change");
        setMobileNavState(Boolean(isOpen));
    };

    function scrollToSection(hash) {
        if (!hash || !hash.startsWith('#')) return false;
        const targetId = decodeURIComponent(hash.slice(1));
        const targetSection = document.getElementById(targetId);
        if (!targetSection) return false;

        const scrollMarginTop = Number.parseFloat(window.getComputedStyle(targetSection).scrollMarginTop) || 0;
        const targetTop = targetSection.getBoundingClientRect().top + window.scrollY - scrollMarginTop;
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        window.scrollTo({
            top: Math.max(targetTop, 0),
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });

        if (window.location.hash !== hash) {
            history.pushState(null, '', hash);
        }

        return true;
    }
    function updateModalLanguageSwitchers() {
        document.querySelectorAll('.modal-lang-switcher .modal-language-item').forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-lang') === currentLang);
        });
    }
    function syncLanguageUrl(lang, options = {}) {
        const { hash = window.location.hash, replace = false } = options;
        const localizedUrl = getLocalizedPageUrl(window.PortfolioSeo?.getCurrentPagePath?.() || "/", lang, hash);
        const currentUrl = new URL(window.location.href);
        const nextUrl = new URL(localizedUrl, window.location.origin);
        if (currentUrl.pathname === nextUrl.pathname && currentUrl.hash === nextUrl.hash) {
            return false;
        }
        if (replace) {
            window.location.replace(nextUrl.toString());
        } else {
            window.location.assign(nextUrl.toString());
        }
        return true;
    }

    function refreshLanguageSwitcherLinks() {
        document.querySelectorAll('a.language-item[data-lang]').forEach(item => {
            const targetLang = normalizeLanguage(item.getAttribute('data-lang'));
            if (!targetLang) return;
            item.href = getLocalizedPageUrl(window.PortfolioSeo?.getCurrentPagePath?.() || "/", targetLang, window.location.hash);
        });
    }

    function refreshLocalizedLinks() {
        document.querySelectorAll('[data-localized-path]').forEach(link => {
            const pagePath = link.getAttribute('data-localized-path');
            const hash = link.getAttribute('data-localized-hash') || '';
            const href = getLocalizedPageUrl(pagePath, currentLang, hash);
            link.setAttribute('href', href);
        });
    }

    function isEffectivelyHidden(element) {
        return !element || Boolean(element.closest('[hidden]'));
    }

    function getLanguageSwitchAnchor() {
        if (document.body.classList.contains('mobile-nav-open')) return null;

        const navBottom = mainNav ? mainNav.getBoundingClientRect().bottom : 0;
        const sampleY = Math.min(
            window.innerHeight - 24,
            Math.max(Math.round(window.innerHeight * 0.24), Math.round(navBottom + 24))
        );
        const sampleX = Math.round(window.innerWidth / 2);
        const anchorSelectors = [
            '.timeline-item',
            '.timeline-content',
            '.skill-card',
            '.project-card',
            '.featured-project-container',
            '.github-stats-grid',
            '.faq-item',
            '.contact-form-section',
            '.tech-stack-section',
            'section[id]'
        ].join(', ');

        const sampledNode = document.elementFromPoint(sampleX, sampleY);
        if (!(sampledNode instanceof Element)) return null;

        return sampledNode.closest(anchorSelectors) || sampledNode.closest('main > *');
    }

    function resetAosState(elements) {
        if (typeof AOS === 'undefined' || !elements?.length) return;

        elements.forEach(element => {
            const animatedNodes = [
                ...(element.matches?.('[data-aos]') ? [element] : []),
                ...element.querySelectorAll?.('[data-aos]') || []
            ];

            animatedNodes.forEach(node => {
                node.classList.remove('aos-animate');
            });
        });
    }

    function finalizeLanguageLayout(anchor, anchorTopBefore, scrollYBefore) {
        const anchorIsVisible = anchor && anchor.isConnected && !isEffectivelyHidden(anchor);
        if (anchorIsVisible && Number.isFinite(anchorTopBefore)) {
            const anchorTopAfter = anchor.getBoundingClientRect().top;
            const delta = anchorTopAfter - anchorTopBefore;
            if (Math.abs(delta) > 1) {
                window.scrollTo({
                    top: Math.max(scrollYBefore + delta, 0),
                    left: 0,
                    behavior: 'auto'
                });
            }
        }

        const maxScrollTop = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
        if (window.scrollY > maxScrollTop) {
            window.scrollTo({ top: maxScrollTop, left: 0, behavior: 'auto' });
        }

        if (typeof AOS !== 'undefined') {
            AOS.refreshHard();
        }
    }

    function refreshAfterLanguageSwitch(changedElements) {
        const anchor = getLanguageSwitchAnchor();
        const anchorTopBefore = anchor?.getBoundingClientRect().top ?? null;
        const scrollYBefore = window.scrollY;
        const delayMs = document.body.classList.contains('mobile-nav-open') ? 180 : 0;

        resetAosState(changedElements);

        window.setTimeout(() => {
            window.requestAnimationFrame(() => {
                window.requestAnimationFrame(() => {
                    finalizeLanguageLayout(anchor, anchorTopBefore, scrollYBefore);
                });
            });
        }, delayMs);
    }

    function updateLanguageConditionalContent() {
        document.body.dataset.currentLang = currentLang;
        const changedElements = [];

        if (currentLang !== 'de' && videoModal?.classList.contains('active')) {
            if (player?.stopVideo) player.stopVideo();
            closeModal(videoModal);
        }

        languageConditionalElements.forEach(element => {
            const visibleLanguages = parseVisibleLanguages(element.dataset.visibleLangs);
            const shouldShow = visibleLanguages.length === 0 || visibleLanguages.includes(currentLang);
            const wasHidden = element.hidden;
            element.hidden = !shouldShow;
            if (wasHidden !== element.hidden) {
                changedElements.push(element);
            }
        });

        const activeElement = document.activeElement;
        if (activeElement instanceof HTMLElement) {
            const conditionalParent = activeElement.closest('[data-visible-langs]');
            if (conditionalParent?.hidden) {
                mainNav?.querySelector('a, button')?.focus();
            }
        }

        if (window.location.hash) {
            const targetId = decodeURIComponent(window.location.hash.slice(1));
            const targetElement = document.getElementById(targetId);
            if (targetElement?.hidden) {
                const url = new URL(window.location.href);
                url.hash = '';
                history.replaceState(null, '', `${url.pathname}${url.search}`);
            }
        }

        return changedElements;
    }
    function switchLanguage(newLang, options = {}) {
        const { syncUrl = true, refreshLayout = true, navigate = false, replaceHistory = false } = options;
        const normalizedLang = normalizeLanguage(newLang) || config.defaultLang;
        currentLang = normalizedLang;
        localStorage.setItem("preferredLang", currentLang);
        persistPreferredLanguage(currentLang);
        if (syncUrl && navigate && syncLanguageUrl(currentLang, { replace: replaceHistory })) {
            return;
        }
        document.documentElement.lang = currentLang;
        if (window.PortfolioSeo?.applyLocalizedSeo) {
            window.PortfolioSeo.applyLocalizedSeo(currentLang);
        }
        document.querySelectorAll(".lang").forEach(el => {
            if (el.dataset[currentLang]) el.innerHTML = el.dataset[currentLang];
        });
        document.querySelectorAll(".lang-placeholder").forEach(el => {
            if (el.dataset[currentLang]) el.placeholder = el.dataset[currentLang];
        });
        document.querySelectorAll(".lang-aria").forEach(el => {
            if (el.dataset[currentLang]) el.setAttribute("aria-label", el.dataset[currentLang]);
        });
        const profilePicture = document.getElementById("profile-picture");
        if (profilePicture) profilePicture.alt = config.altTexts[currentLang];
        
        const featuredImg = document.getElementById("featured-img");
        if (featuredImg && featuredImg.dataset[currentLang]) {
            featuredImg.alt = featuredImg.dataset[currentLang];
        }
        document.querySelectorAll(".language-item").forEach(item => {
            item.classList.toggle("active", item.getAttribute("data-lang") === normalizedLang);
        });
        refreshLanguageSwitcherLinks();
        refreshLocalizedLinks();
        updateFeaturedProject(activeProjectId, 'next', { animate: false });
        updateAllProjectModalsText();
        updateModalLanguageSwitchers();
        const changedElements = updateLanguageConditionalContent();
        if (refreshLayout) {
            refreshAfterLanguageSwitch(changedElements);
        }
    }
    function updateAllProjectModalsText() {
        Object.keys(config.projects).forEach(modalId => {
            const project = config.projects[modalId];
            const modal = document.getElementById(modalId);
            if (!project || !modal) return;
            const descriptionItems = modal.querySelectorAll(".project-modal-description-item");
            const slideItems = modal.querySelectorAll(".project-modal-slide");
            project.slides.forEach((slideData, index) => {
                if (descriptionItems[index]) {
                    descriptionItems[index].querySelector("h4").textContent = slideData.title[currentLang];
                    descriptionItems[index].querySelector("p").innerHTML = slideData.text[currentLang];
                }
                if (slideItems[index]) {
                    slideItems[index].setAttribute('aria-label', `Open enlarged image for ${slideData.title[currentLang] || slideData.title.en}`);
                }
            });
        });
    }
    function openModal(modal, triggerElement) {
        if (!modal) return;
        mainNav.classList.add("nav-hidden");
        lastActiveElement = triggerElement || document.activeElement;
        modal.classList.add("active");
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add("modal-open");
        setTimeout(() => {
            const firstFocusable = getFocusableElements(modal)[0];
            firstFocusable?.focus();
        }, 100);
    }
    function closeModal(modal) {
        if (!modal) return;
        modal.classList.remove("active");
        modal.setAttribute('aria-hidden', 'true');
        const parentModal = document.querySelector('.project-modal.is-covered');
        if (parentModal) {
            parentModal.classList.remove('is-covered');
            parentModal.setAttribute('aria-hidden', 'false');
        }
        const isAnyModalOpen = Array.from(allModals).some(m => m.classList.contains("active"));
        if (!isAnyModalOpen) {
            document.body.classList.remove("modal-open");
            mainNav.classList.remove("nav-hidden");
        }
        if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
            lastActiveElement.focus();
        } else if (parentModal) {
            getFocusableElements(parentModal)[0]?.focus();
        }
        lastActiveElement = null;
    }
    function createOrPlayPlayer() {
        if (typeof YT === "undefined" || typeof YT.Player === "undefined") {
            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";
            document.head.appendChild(tag);
        } else {
            if (!player || typeof player.playVideo !== 'function') {
                player = new YT.Player("youtube-player-container", {
                    height: "100%",
                    width: "100%",
                    videoId: config.youtubeVideoId,
                    playerVars: { autoplay: 1, controls: 1, rel: 0 }
                });
            } else {
                player.playVideo();
            }
        }
    }
    window.onYouTubeIframeAPIReady = () => {
        if (currentLang === 'de' && videoModal && videoModal.classList.contains('active')) {
            createOrPlayPlayer();
        }
    };
    function showProjectSlide(modalId, nextIndex) {
        const project = config.projects[modalId];
        const modal = document.getElementById(modalId);
        if (!project || !modal) return;
        const slides = modal.querySelectorAll(".project-modal-slide");
        const descriptions = modal.querySelectorAll(".project-modal-description-item");
        const counter = modal.querySelector(".project-modal-counter");
        slides[project.currentSlide].classList.remove("active");
        slides[project.currentSlide].setAttribute('aria-hidden', 'true');
        descriptions[project.currentSlide].classList.remove("active");
        descriptions[project.currentSlide].setAttribute('aria-hidden', 'true');
        slides[nextIndex].classList.add("active");
        slides[nextIndex].setAttribute('aria-hidden', 'false');
        descriptions[nextIndex].classList.add("active");
        descriptions[nextIndex].setAttribute('aria-hidden', 'false');
        const newActiveImg = slides[nextIndex].querySelector("img");
        if (newActiveImg) newActiveImg.alt = project.slides[nextIndex].title[currentLang] || project.slides[nextIndex].title.en;
        project.currentSlide = nextIndex;
        if (counter) counter.textContent = `${nextIndex + 1} / ${project.slides.length}`;
    }
    function initializeProjectModals() {
        Object.keys(config.projects).forEach(modalId => {
            const project = config.projects[modalId];
            const modal = document.getElementById(modalId);
            if (!modal) return;
            const imageContainer = modal.querySelector(".project-modal-image-wrapper");
            const descriptionContainer = modal.querySelector(".project-modal-description");
            if (!imageContainer || !descriptionContainer) return;
            imageContainer.innerHTML = "";
            descriptionContainer.innerHTML = "";
            project.slides.forEach(slideData => {
                const slideEl = document.createElement("div");
                slideEl.className = "project-modal-slide";
                slideEl.tabIndex = 0;
                slideEl.setAttribute('role', 'button');
                slideEl.setAttribute('aria-hidden', 'true');
                slideEl.setAttribute('aria-label', `Open enlarged image for ${slideData.title[currentLang] || slideData.title.en}`);
                slideEl.innerHTML = `<img src="${toRootAssetPath(`images/${slideData.img}`)}" alt="${slideData.title.en}" loading="lazy" decoding="async">`;
                slideEl.addEventListener("click", function () {
                    const imageModalImg = imageModal.querySelector("img");
                    imageModalImg.src = this.querySelector('img').src;
                    imageModalImg.alt = `Enlarged view of ${slideData.title[currentLang] || slideData.title.en}`;
                    modal.classList.add("is-covered");
                    modal.setAttribute('aria-hidden', 'true');
                    openModal(imageModal, this);
                });
                slideEl.addEventListener("keydown", event => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        slideEl.click();
                    }
                });
                imageContainer.appendChild(slideEl);
                const descEl = document.createElement("div");
                descEl.className = "project-modal-description-item";
                descEl.setAttribute('aria-hidden', 'true');
                descEl.innerHTML = `<h4></h4><p></p>`;
                descriptionContainer.appendChild(descEl);
            });
        });
    }

    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: isPortGuardianPage ? 440 : 400,
            easing: isPortGuardianPage ? 'ease-out-cubic' : 'ease',
            once: true,
            offset: isPortGuardianPage ? 18 : 50,
            delay: 0,
            anchorPlacement: 'top-bottom',
            disable: false,
            throttleDelay: isPortGuardianPage ? 70 : 150,
            debounceDelay: isPortGuardianPage ? 40 : 100,
            startEvent: animationReadyEvent,
            disableMutationObserver: false
        });
    }

    async function fetchGitHubStats() {
        const CACHE_KEY = 'github_stats_cache_v6';
        const CACHE_DURATION = 3600000;
        const statsUrl = new URL('./data/github-stats.json', window.location.href).toString();

        function isValidLanguageEntry(entry) {
            return !!entry
                && typeof entry.name === 'string'
                && entry.name.length > 0
                && typeof entry.percentage === 'number'
                && Number.isFinite(entry.percentage);
        }

        function isValidStatsPayload(data) {
            return !!data
                && typeof data.lastYearContributions === 'number'
                && Number.isFinite(data.lastYearContributions)
                && typeof data.repos === 'number'
                && Number.isFinite(data.repos)
                && typeof data.stars === 'number'
                && Number.isFinite(data.stars)
                && (data.pinnedRepoStars === undefined || (typeof data.pinnedRepoStars === 'number' && Number.isFinite(data.pinnedRepoStars)))
                && (data.pinnedRepos === undefined || Array.isArray(data.pinnedRepos))
                && Array.isArray(data.languages)
                && data.languages.every(isValidLanguageEntry);
        }

        function readCachedStats() {
            const cached = localStorage.getItem(CACHE_KEY);
            if (!cached) {
                return null;
            }

            try {
                const parsed = JSON.parse(cached);
                if (!parsed || !isValidStatsPayload(parsed.data)) {
                    localStorage.removeItem(CACHE_KEY);
                    return null;
                }

                return parsed;
            } catch (error) {
                localStorage.removeItem(CACHE_KEY);
                return null;
            }
        }

        const cached = readCachedStats();
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            return { ...cached.data, dataSource: 'cached' };
        }

        try {
            const response = await fetch(statsUrl, { cache: 'no-store' });

            if (!response.ok) {
                throw new Error('GitHub stats data request failed.');
            }

            const data = await response.json();
            if (!isValidStatsPayload(data)) {
                throw new Error('GitHub stats data is invalid.');
            }

            const stats = {
                lastYearContributions: data.lastYearContributions,
                repos: data.repos,
                stars: data.stars,
                pinnedRepoStars: data.pinnedRepoStars || 0,
                languages: data.languages,
                updatedAt: data.updatedAt || '',
                dataSource: 'synced'
            };

            localStorage.setItem(CACHE_KEY, JSON.stringify({
                data: stats,
                timestamp: Date.now()
            }));

            return stats;
        } catch (error) {
            if (cached) {
                return { ...cached.data, dataSource: 'cached' };
            }

            return null;
        }
    }

    function formatGitHubSyncDate(updatedAt) {
        if (!updatedAt) {
            return '';
        }

        const parsedDate = new Date(updatedAt);
        if (Number.isNaN(parsedDate.getTime())) {
            return '';
        }

        return parsedDate.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    function updateGitHubBadge(dataSource, updatedAt = '') {
        if (!githubDataBadge || !githubDataStatus) return;

        githubDataBadge.classList.remove('is-cached', 'is-unavailable');
        const formattedDate = formatGitHubSyncDate(updatedAt);

        if (dataSource === 'cached') {
            githubDataBadge.classList.add('is-cached');
            githubDataBadge.title = formattedDate
                ? `Cached GitHub stats from the latest synced data on ${formattedDate}.`
                : 'Cached GitHub stats from the latest synced data.';
            githubDataStatus.textContent = formattedDate
                ? `GitHub stats are currently shown from a recent cache synced on ${formattedDate}.`
                : 'GitHub stats are currently shown from a recent cache.';
        } else if (dataSource === 'unavailable') {
            githubDataBadge.classList.add('is-unavailable');
            githubDataBadge.title = 'GitHub stats are temporarily unavailable.';
            githubDataStatus.textContent = 'GitHub stats are temporarily unavailable.';
        } else {
            githubDataBadge.title = formattedDate
                ? `GitHub stats were synced from public GitHub data on ${formattedDate}.`
                : 'GitHub stats were synced from public GitHub data.';
            githubDataStatus.textContent = formattedDate
                ? `GitHub stats were synced from public GitHub data on ${formattedDate}.`
                : 'GitHub stats were synced from public GitHub data.';
        }
    }

    function setGitHubUnavailable(githubSection) {
        const statNumbers = githubSection.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            stat.removeAttribute('data-count');
            stat.textContent = '—';
        });

        const languageBar = githubSection.querySelector('.language-bar');
        const languageLabels = githubSection.querySelector('.language-labels');

        if (languageBar) {
            languageBar.innerHTML = '';
        }

        if (languageLabels) {
            languageLabels.classList.add('is-muted');
            languageLabels.textContent = 'GitHub language data is temporarily unavailable.';
        }

        updateGitHubBadge('unavailable');
    }

    async function updateGitHubStats() {
        const githubSection = document.getElementById('github-activity');
        if (!githubSection) return;

        try {
            const stats = await fetchGitHubStats();

            if (!stats) {
                setGitHubUnavailable(githubSection);
                return false;
            }
            updateGitHubBadge(stats.dataSource, stats.updatedAt);

            const statNumbers = githubSection.querySelectorAll('.stat-number');

            if (statNumbers[0]) {
                statNumbers[0].setAttribute('data-count', stats.lastYearContributions);
                statNumbers[0].textContent = '0';
            }

            if (statNumbers[1]) {
                statNumbers[1].setAttribute('data-count', stats.pinnedRepoStars || 0);
                statNumbers[1].textContent = '0';
            }

            const languageBar = githubSection.querySelector('.language-bar');
            const languageLabels = githubSection.querySelector('.language-labels');

            if (languageBar && languageLabels && stats.languages && stats.languages.length > 0) {
                languageLabels.classList.remove('is-muted');
                const languageColors = {
                    'HTML': '#e34c26',
                    'Python': '#3572A5',
                    'JavaScript': '#f1e05a',
                    'CSS': '#563d7c',
                    'TypeScript': '#2b7489',
                    'Java': '#b07219',
                    'C++': '#f34b7d',
                    'C': '#555555',
                    'Go': '#00ADD8',
                    'Rust': '#dea584',
                    'Shell': '#89e051',
                    'PHP': '#4F5D95'
                };

                languageBar.innerHTML = stats.languages.map(lang =>
                    `<div class="language-segment" style="width: ${lang.percentage}%; background: ${languageColors[lang.name] || '#666'};" title="${lang.name}"></div>`
                ).join('');

                languageLabels.innerHTML = stats.languages.map(lang =>
                    `<span><span class="lang-dot" style="background: ${languageColors[lang.name] || '#666'};"></span> ${lang.name} ${lang.percentage}%</span>`
                ).join('');
            } else if (languageBar && languageLabels) {
                languageBar.innerHTML = '';
                languageLabels.classList.add('is-muted');
                languageLabels.textContent = 'No public language breakdown is available yet.';
            }

            return true;
        } catch (error) {
            setGitHubUnavailable(githubSection);
            return false;
        }
    }

    function animateCounter(element) {
        const target = parseInt(element.getAttribute('data-count'));

        if (isNaN(target) || target === null || target === undefined) {
            element.textContent = '—';
            return;
        }

        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    }

    const githubSection = document.getElementById('github-activity');
    if (githubSection) {
        let githubStatsLoaded = false;
        let githubCountersAnimated = false;

        const animateGitHubCounters = () => {
            if (githubCountersAnimated) return;
            githubCountersAnimated = true;
            const counters = githubSection.querySelectorAll('.stat-number[data-count]');
            counters.forEach(counter => animateCounter(counter));
        };

        const loadGitHubStats = async () => {
            if (githubStatsLoaded) return;
            githubStatsLoaded = true;
            const loaded = await updateGitHubStats();
            if (loaded && !('IntersectionObserver' in window)) {
                animateGitHubCounters();
            }
        };

        if ('IntersectionObserver' in window) {
            const githubObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;

                    loadGitHubStats().then(animateGitHubCounters);
                    githubObserver.unobserve(entry.target);
                });
            }, {
                rootMargin: '200px 0px',
                threshold: 0.15
            });

            githubObserver.observe(githubSection);
        } else {
            loadGitHubStats();
        }
    }

    const copyrightYearEl = document.getElementById("copyright-year");
    if (copyrightYearEl) copyrightYearEl.textContent = new Date().getFullYear();
    if (requestedQueryLanguage && requestedQueryLanguage !== currentLang) {
        localStorage.setItem("preferredLang", requestedQueryLanguage);
        persistPreferredLanguage(requestedQueryLanguage);
        syncLanguageUrl(requestedQueryLanguage, { replace: true });
        return;
    }
    initializeBackgroundVideo();
    initializeProjectModals();
    initializeProjectShowcase();
    switchLanguage(currentLang, { syncUrl: false, refreshLayout: false });
    allModals.forEach(modal => modal.setAttribute('aria-hidden', 'true'));
    document.querySelectorAll('.project-modal .modal-lang-switcher').forEach(switcher => {
        switcher.remove();
    });
    document.querySelectorAll('.nav-dropdown, .mobile-language-selector, .hero-cta-dropdown, .experience-dropdown-container').forEach(dropdown => {
        syncDropdownState(dropdown, false);
    });
    document.querySelectorAll(".faq-question").forEach((button, index) => {
        const panel = button.nextElementSibling;
        if (!panel) return;
        if (!button.id) button.id = `faq-question-${index + 1}`;
        panel.setAttribute('role', 'region');
        panel.setAttribute('aria-labelledby', button.id);
        panel.setAttribute('aria-hidden', 'true');
    });
    document.querySelectorAll(".language-item").forEach(item => {
        item.addEventListener("click", e => {
            e.preventDefault();
            const newLang = item.getAttribute("data-lang");
            if (newLang !== currentLang) {
                switchLanguage(newLang, { navigate: true });
            }

            const navDropdown = item.closest(".nav-dropdown");
            if (navDropdown) syncDropdownState(navDropdown, false);
            if (item.closest(".mobile-list")) {
                mobileToggle?.classList.remove("active");
                if (mobileList) mobileList.style.maxHeight = '0';
            }
            if (item.closest(".mobile-language-buttons")) {
                setTimeout(() => setMobileNavState(false, { restoreFocus: false }), 150);
            }
        });
    });
    document.querySelectorAll('.modal-lang-switcher .modal-language-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const newLang = this.getAttribute('data-lang');
            if (newLang && newLang !== currentLang) {
                switchLanguage(newLang, { navigate: true });
            }
        });
    });
    const dropdownToggles = document.querySelectorAll('.nav-dropdown-toggle, .mobile-toggle, .cta-dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            if (this.tagName === 'A' && this.target === '_blank') {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            const parentDropdown = this.closest('.nav-dropdown, .mobile-language-selector, .hero-cta-dropdown, .project-report-dropdown, .experience-dropdown-container');
            if (!parentDropdown) return;
            const isActive = parentDropdown.classList.contains('active');
            document.querySelectorAll('.nav-dropdown, .mobile-language-selector, .hero-cta-dropdown, .project-report-dropdown, .experience-dropdown-container').forEach(dd => {
                if (dd !== parentDropdown) {
                    syncDropdownState(dd, false);
                }
            });
            syncDropdownState(parentDropdown, !isActive);
            if (parentDropdown.matches('.mobile-language-selector')) {
                const list = parentDropdown.querySelector('.mobile-list');
                if (list) {
                    list.style.maxHeight = !isActive ? list.scrollHeight + 'px' : '0';
                }
            }
        });
    });
    document.addEventListener('click', function(e) {
        const activeDropdown = document.querySelector(activeDropdownSelector);
        if (activeDropdown && !activeDropdown.contains(e.target)) {
            closeActiveDropdown();
        }
    });
    mobileMenuIcon?.addEventListener("click", toggleMobileNav);
    mobileNavOverlay?.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener("click", event => {
            const hash = link.getAttribute('href');
            const targetId = hash ? decodeURIComponent(hash.slice(1)) : '';
            if (!targetId || !document.getElementById(targetId)) return;

            event.preventDefault();
            closeActiveDropdown();
            setMobileNavState(false, { restoreScroll: false, restoreFocus: false });
            requestAnimationFrame(() => {
                scrollToSection(hash);
            });
        });
    });
    mobileNavOverlay?.querySelectorAll('a:not(.language-item):not([href^="#"])').forEach(link => {
        link.addEventListener("click", () => {
            setTimeout(() => setMobileNavState(false, { restoreFocus: false }), 150);
        });
    });
    document.querySelectorAll(".faq-question").forEach(button => {
        button.addEventListener("click", () => {
            const panel = button.nextElementSibling;
            const isActive = button.classList.toggle("active");
            button.setAttribute("aria-expanded", isActive);
            panel.setAttribute('aria-hidden', String(!isActive));
            panel.style.maxHeight = isActive ? panel.scrollHeight + "px" : null;
        });
    });
    document.getElementById("open-video-modal")?.addEventListener("click", function () {
        if (currentLang !== 'de') return;
        openModal(videoModal, this);
        createOrPlayPlayer();
    });
    function navigateFeaturedProject(step) {
        const currentIndex = projectOrder.indexOf(activeProjectId);
        if (currentIndex === -1) return;
        const nextIndex = (currentIndex + step + projectOrder.length) % projectOrder.length;
        updateFeaturedProject(projectOrder[nextIndex], step > 0 ? 'next' : 'prev');
    }

    function initializeProjectShowcase() {
        document.querySelectorAll('.project-thumbnail').forEach(thumb => {
            thumb.addEventListener('click', function() {
                if (this.dataset.projectId === activeProjectId) return;
                const currentIndex = projectOrder.indexOf(activeProjectId);
                const nextIndex = projectOrder.indexOf(this.dataset.projectId);
                const direction = nextIndex > currentIndex ? 'next' : 'prev';
                updateFeaturedProject(this.dataset.projectId, direction);
            });
        });

        document.querySelector('.featured-project-arrow.next')?.addEventListener('click', () => {
            navigateFeaturedProject(1);
        });

        document.querySelector('.featured-project-arrow.prev')?.addEventListener('click', () => {
            navigateFeaturedProject(-1);
        });
    }

    allModals.forEach(modal => {
        modal.querySelector(".close-button")?.addEventListener("click", () => {
            if (modal.id === 'video-modal' && player && typeof player.stopVideo === 'function') player.stopVideo();
            closeModal(modal);
        });
        modal.addEventListener("click", e => {
            if (e.target === modal) closeModal(modal);
        });
    });
    document.querySelectorAll('.project-modal').forEach(modal => {
        const modalId = modal.id;
        modal.querySelector('.project-modal-arrow.next')?.addEventListener('click', () => {
            const project = config.projects[modalId];
            showProjectSlide(modalId, (project.currentSlide + 1) % project.slides.length);
        });
        modal.querySelector('.project-modal-arrow.prev')?.addEventListener('click', () => {
            const project = config.projects[modalId];
            showProjectSlide(modalId, (project.currentSlide - 1 + project.slides.length) % project.slides.length);
        });
    });
    window.addEventListener("keydown", event => {
        if (document.body.classList.contains('mobile-nav-open')) {
            if (event.key === "Escape") {
                closeActiveDropdown();
                setMobileNavState(false);
                return;
            }
            if (event.key === "Tab") {
                trapFocusInContainer(mobileNavOverlay, event);
                return;
            }
        }
        const activeModal = getActiveModal();
        if (!activeModal) {
            if (event.key === "Escape") {
                closeActiveDropdown();
            }
            return;
        }
        if (event.key === "Tab") {
            const focusableElements = getFocusableElements(activeModal);
            if (focusableElements.length === 0) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.shiftKey && document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            } else if (!event.shiftKey && document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
            return;
        }
        if (event.key === "Escape") {
            if (activeModal.id === 'video-modal' && player?.stopVideo) player.stopVideo();
            closeModal(activeModal);
        }
        if (activeModal.classList.contains('project-modal') && (event.key === "ArrowRight" || event.key === "ArrowLeft")) {
            const project = config.projects[activeModal.id];
            if (!project) return;
            const numSlides = project.slides.length;
            let nextIndex = project.currentSlide;
            if (event.key === "ArrowRight") nextIndex = (project.currentSlide + 1) % numSlides;
            else if (event.key === "ArrowLeft") nextIndex = (project.currentSlide - 1 + numSlides) % numSlides;
            showProjectSlide(activeModal.id, nextIndex);
        }
    });
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            initializeBackgroundVideo();
        }, 150);
    }, { passive: true });

    const scrollProgressBar = document.getElementById('scroll-progress');
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    let scrollTicking = false;
    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            requestAnimationFrame(() => {
                const scrollTop = window.scrollY;
                if (scrollProgressBar) {
                    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                    scrollProgressBar.style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + '%';
                }
                if (scrollToTopBtn) {
                    scrollToTopBtn.classList.toggle('visible', scrollTop > 400);
                }
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    }, { passive: true });
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    const sections = document.querySelectorAll('section[id]');
    if ('IntersectionObserver' in window && sections.length > 0 && navLinks.length > 0) {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    navLinks.forEach(link => {
                        link.classList.toggle('active', link.getAttribute('href') === '#' + id);
                    });
                }
            });
        }, { root: null, rootMargin: '-20% 0px -60% 0px', threshold: 0 });
        sections.forEach(section => sectionObserver.observe(section));
    }

    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        toastContainer.setAttribute('role', 'status');
        toastContainer.setAttribute('aria-live', 'polite');
        document.body.appendChild(toastContainer);
    }
    function showToast(message, type = 'success', duration = 4000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('toast-out');
            toast.addEventListener('animationend', () => toast.remove());
        }, duration);
    }

    const formMessages = {
        success: {
            de: 'Vielen Dank! Ihre Nachricht wurde gesendet.',
            en: 'Thank you! Your message has been sent.',
            fr: 'Merci ! Votre message a été envoyé.'
        },
        error: {
            de: 'Hoppla! Es gab ein Problem. Bitte versuchen Sie es erneut.',
            en: 'Oops! There was a problem. Please try again.',
            fr: 'Oups ! Un problème est survenu. Veuillez réessayer.'
        }
    };
    if (contactForm) {
        const newForm = contactForm.cloneNode(true);
        contactForm.parentNode.replaceChild(newForm, contactForm);
        newForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const submitBtn = newForm.querySelector(".submit-btn");
            const btnSpan = submitBtn.querySelector('span');
            const formStatus = newForm.querySelector('#form-status');
            const originalText = btnSpan.textContent;
            submitBtn.disabled = true;
            newForm.setAttribute('aria-busy', 'true');
            if (formStatus) formStatus.textContent = '';
            btnSpan.textContent = submitBtn.dataset[`sending${currentLang.charAt(0).toUpperCase() + currentLang.slice(1)}`] || 'Sending...';
            fetch(newForm.action, {
                method: "POST",
                body: new FormData(newForm),
                headers: { Accept: "application/json" }
            }).then(response => {
                if (response.ok) {
                    showToast(formMessages.success[currentLang] || formMessages.success.en, 'success');
                    newForm.reset();
                    if (formStatus) formStatus.textContent = formMessages.success[currentLang] || formMessages.success.en;
                } else {
                    throw new Error('Form submission failed');
                }
            }).catch(() => {
                showToast(formMessages.error[currentLang] || formMessages.error.en, 'error');
                if (formStatus) formStatus.textContent = formMessages.error[currentLang] || formMessages.error.en;
            }).finally(() => {
                submitBtn.disabled = false;
                newForm.removeAttribute('aria-busy');
                btnSpan.textContent = originalText;
            });
        });
    }

    const preloader = document.getElementById('preloader');
    const preloaderBar = document.getElementById('preloader-bar');
    const preloaderPercent = document.getElementById('preloader-percent');
    if (preloader && preloaderBar && preloaderPercent) {
        const preloaderStartedAt = performance.now();
        let isComplete = false;
        const preloaderAssetsReady = waitForFontsReady();
        const minimumVisibleMs = prefersReducedMotion ? 0 : 180;
        const finalHoldMs = prefersReducedMotion ? 0 : 120;

        const renderPreloader = (value) => {
            const nextValue = Math.max(0, Math.min(100, Math.round(value)));
            preloaderBar.style.width = `${nextValue}%`;
            preloaderPercent.textContent = `${nextValue}%`;
        };

        const finishPreloader = () => {
            if (isComplete) return;
            isComplete = true;
            renderPreloader(100);
            window.setTimeout(() => preloader.classList.add('hidden'), finalHoldMs);
            window.setTimeout(() => {
                document.body.classList.remove('preloader-active');
                preloader.remove();
                releaseDeferredAnimations();
            }, finalHoldMs + 220);
        };

        renderPreloader(20);
        window.setTimeout(() => renderPreloader(72), 60);
        preloaderAssetsReady.finally(() => {
            const elapsed = performance.now() - preloaderStartedAt;
            const remaining = Math.max(0, minimumVisibleMs - elapsed);
            window.setTimeout(finishPreloader, remaining);
        });
    } else if (!hasProjectLoader) {
        waitForWindowLoad(releaseDeferredAnimations);
    }

});
