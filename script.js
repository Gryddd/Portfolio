/**
 * @file Main script for the portfolio website.
 * @description Handles language switching, modal interactions (video, project, image),
 * dynamic content for projects, FAQ accordion, floating CTA visibility, mobile navigation,
 * and the contact form submission.
 * @author Walid Gourideche
 */
document.addEventListener("DOMContentLoaded", function () {

    // --- 1. CONFIGURATION & STATE ---

    const config = {
        defaultLang: "en",
        youtubeVideoId: "R_rKRfh7ceU", // Single video ID for the player
        altTexts: {
            de: "Ein professionelles Portraitfoto von Walid Gourideche",
            en: "A professional portrait of Walid Gourideche",
            fr: "Un portrait professionnel de Walid Gourideche",
        },
        // All project data is stored here as a single source of truth.
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
            "project-modal-2": {
                currentSlide: 0,
                slides: [
                    {
                        img: "borealis_architecture.png",
                        title: { de: "Full-Stack MERN Architektur", en: "Full-Stack MERN Architecture", fr: "Architecture Full-Stack MERN" },
                        text: {
                            de: "Borealis ist eine vollständige E-Commerce-Anwendung, die auf dem MERN-Stack basiert. Die Kernarchitektur umfasst eine Node.js/Express REST-API für Backend-Logik, eine MongoDB-Datenbank für die Datenpersistenz und eine reine Vanilla-JS-Frontend-Anwendung, die für eine optimale Leistung ohne Framework-Overhead sorgt.",
                            en: "Borealis is a complete e-commerce application built on the MERN stack. The core architecture features a Node.js/Express REST API for backend logic, a MongoDB database for data persistence, and a pure Vanilla JS frontend for optimal performance without framework overhead.",
                            fr: "Borealis est une application e-commerce complète basée sur la stack MERN. L'architecture de base comprend une API REST Node.js/Express pour la logique backend, une base de données MongoDB pour la persistance des données, et une application frontend en JavaScript pur pour des performances optimales sans la surcharge d'un framework."
                        }
                    },
                    {
                        img: "borealis_auth.png",
                        title: { de: "Sichere Authentifizierung & Sitzungsverwaltung", en: "Secure Authentication & Session Management", fr: "Authentification et Gestion de Session Sécurisées" },
                        text: {
                            de: "Die Benutzerauthentifizierung wird durch JSON Web Tokens (JWT) gesichert. Passwörter werden vor der Speicherung mit bcrypt gehasht, um die Einhaltung von Sicherheitsstandards zu gewährleisten. Token-basierte Sitzungen ermöglichen eine zustandslose und skalierbare Backend-Architektur.",
                            en: "User authentication is secured using JSON Web Tokens (JWT). Passwords are hashed with bcrypt before storage, ensuring security compliance. Token-based sessions allow for a stateless and scalable backend architecture.",
                            fr: "L'authentification des utilisateurs est sécurisée à l'aide de JSON Web Tokens (JWT). Les mots de passe sont hachés avec bcrypt avant d'être stockés, garantissant la conformité en matière de sécurité. Les sessions basées sur des jetons permettent une architecture backend sans état et évolutive."
                        }
                    },
                    {
                        img: "borealis_admin_dashboard.png",
                        title: { de: "Systemadministration & Rollenbasierte Zugriffskontrolle", en: "System Administration & Role-Based Access Control", fr: "Administration Système & Contrôle d'Accès Basé sur les Rôles" },
                        text: {
                            de: "Ein Admin-Dashboard bietet rollenbasierte Zugriffskontrolle (RBAC), die es autorisierten Benutzern ermöglicht, das System zu verwalten. Administratoren können CRUD-Operationen (Erstellen, Lesen, Aktualisieren, Löschen) an Produkten durchführen und alle Benutzer- und Bestelldaten einsehen, was wichtige Systemverwaltungsaufgaben demonstriert.",
                            en: "An admin dashboard provides Role-Based Access Control (RBAC), allowing authorized users to manage the system. Admins can perform CRUD (Create, Read, Update, Delete) operations on products and view all user and order data, demonstrating key system administration tasks.",
                            fr: "Un tableau de bord d'administration fournit un contrôle d'accès basé sur les rôles (RBAC), permettant aux utilisateurs autorisés de gérer le système. Les administrateurs peuvent effectuer des opérations CRUD (Créer, Lire, Mettre à jour, Supprimer) sur les produits et consulter toutes les données des utilisateurs et des commandes, illustrant ainsi des tâches essentielles d'administration système."
                        }
                    },
                    {
                        img: "borealis_api_integration.png",
                        title: { de: "Integration von Drittanbieter-APIs", en: "Third-Party API Integration", fr: "Intégration d'API Tierces" },
                        text: {
                            de: "Das Projekt integriert externe Dienste über APIs für wichtige Funktionalitäten. Stripe wird für eine sichere Zahlungsabwicklung genutzt, wodurch sensible Finanzdaten von den eigenen Servern ferngehalten werden. SendGrid wird für transaktionale E-Mails, wie z.B. das Zurücksetzen von Passwörtern, verwendet.",
                            en: "The project integrates external services via APIs for critical functionality. Stripe is utilized for secure payment processing, keeping sensitive financial data off the local servers. SendGrid is used for transactional emails, such as password resets.",
                            fr: "Le projet intègre des services externes via des API pour des fonctionnalités critiques. Stripe est utilisé pour le traitement sécurisé des paiements, gardant les données financières sensibles hors des serveurs locaux. SendGrid est utilisé pour les e-mails transactionnels, tels que la réinitialisation des mots de passe."
                        }
                    },
                    {
                        img: "borealis_state_management.png",
                        title: { de: "Zustandsverwaltung: Gast vs. Benutzer", en: "State Management: Guest vs. User", fr: "Gestion d'État : Invité vs. Utilisateur" },
                        text: {
                            de: "Eine duale Zustandsverwaltungsstrategie wurde implementiert. Gast-Sitzungen verwenden LocalStorage für die clientseitige Persistenz des Warenkorbs. Beim Einloggen wird der LocalStorage-Zustand nahtlos mit dem in MongoDB gespeicherten Benutzerzustand zusammengeführt, was die Datenintegrität über verschiedene Sitzungstypen hinweg gewährleistet.",
                            en: "A dual state management strategy is implemented. Guest sessions utilize LocalStorage for client-side cart persistence. Upon login, the LocalStorage state is seamlessly merged with the user's database state stored in MongoDB, ensuring data integrity across session types.",
                            fr: "Une double stratégie de gestion d'état est mise en œuvre. Les sessions invitées utilisent LocalStorage pour la persistance du panier côté client. Lors de la connexion, l'état de LocalStorage est fusionné de manière transparente avec l'état de l'utilisateur stocké dans MongoDB, garantissant l'intégrité des données entre les types de session."
                        }
                    }
                ]
            },
            "project-modal-3": {
                currentSlide: 0,
                slides: [
                    {
                        img: "portguardian_slide1.png",
                        title: { de: "Stufe 1: Vorbereitung der Bedrohungssimulation", en: "Stage 1: Threat Simulation Preparation", fr: "Étape 1 : Préparation de la Simulation de Menace" },
                        text: { de: "Um die Engine zu validieren, wurde ein Test-USB-Laufwerk mit verschiedenen Bedrohungsvektoren vorbereitet, darunter bösartiges 'autorun.inf', .lnk-Dateien, die PowerShell aufrufen, und bekannte Malware-Samples wie die EICAR-Testdatei.", en: "To validate the engine, a test USB was prepared with diverse threat vectors, including malicious 'autorun.inf', PowerShell-invoking .lnk files, and known malware samples like the EICAR test file.", fr: "Pour valider le moteur, une clé USB de test a été préparée avec divers vecteurs de menace, incluant un 'autorun.inf' malveillant, des fichiers .lnk invoquant PowerShell, et des échantillons de malware connus comme le fichier de test EICAR." }
                    },
                    {
                        img: "portguardian_slide2.png",
                        title: { de: "Stufe 2: Aktivierung und Überwachung", en: "Stage 2: Activation and Monitoring", fr: "Étape 2 : Activation et Surveillance" },
                        text: { de: "Die Anwendung wird gestartet und die Echtzeit-Überwachung wird aktiviert. Die Benutzeroberfläche bestätigt, dass das System geschützt ist und auf das Einstecken von Geräten wartet.", en: "The application is launched and real-time monitoring is enabled. The user interface confirms the system is protected and awaiting device insertion.", fr: "L'application est lancée et la surveillance en temps réel est activée. L'interface utilisateur confirme que le système est protégé et en attente de l'insertion d'un périphérique." }
                    },
                    {
                        img: "portguardian_slide3.png",
                        title: { de: "Stufe 3: Echtzeit-Scan und Analyse", en: "Stage 3: Real-Time Scan & Analysis", fr: "Étape 3 : Analyse en Temps Réel" },
                        text: { de: "Beim Einstecken des USB-Sticks fängt PortGuardian das Ereignis sofort ab. Der Aktivitätsprotokoll zeigt den Analyseprozess, einschließlich der sofortigen Neutralisierung von 'autorun.inf' und der Hash-Überprüfung gegen Live-Bedrohungs-APIs.", en: "Upon USB insertion, PortGuardian instantly intercepts the event. The activity log displays the analysis process, including the immediate neutralization of 'autorun.inf' and hash verification against live threat intelligence APIs.", fr: "Dès l'insertion de la clé USB, PortGuardian intercepte immédiatement l'événement. Le journal d'activité affiche le processus d'analyse, y compris la neutralisation immédiate de 'autorun.inf' et la vérification des hachages par rapport aux API de renseignement sur les menaces en direct." }
                    },
                    {
                        img: "portguardian_slide4.png",
                        title: { de: "Stufe 4: Bedrohungserkennung und Bericht", en: "Stage 4: Threat Detection & Reporting", fr: "Étape 4 : Détection et Rapport des Menaces" },
                        text: { de: "Nach dem Scan werden die 7 potenziellen Risiken in einem klaren, interaktiven Dialog angezeigt. Die Bedrohungen sind nach Schweregrad kategorisiert, was dem Benutzer die vollständige Kontrolle über die Quarantänemaßnahmen gibt.", en: "After the scan, the 7 potential risks are presented in a clear, interactive dialog. Threats are categorized by severity, giving the user full control over quarantine actions.", fr: "Après l'analyse, les 7 risques potentiels sont présentés dans une boîte de dialogue claire et interactive. Les menaces sont classées par gravité, donnant à l'utilisateur un contrôle total sur les actions de mise en quarantaine." }
                    },
                    {
                        img: "portguardian_slide5.png",
                        title: { de: "Stufe 5: Erfolgreiche Quarantäne", en: "Stage 5: Successful Quarantine", fr: "Étape 5 : Mise en Quarantaine Réussie" },
                        text: { de: "Der Aktivitätsprotokoll bestätigt, dass alle ausgewählten Bedrohungen erfolgreich in den sicheren Quarantäne-Ordner verschoben wurden, wodurch der Endpunkt effektiv geschützt ist.", en: "The activity log confirms that all selected threats were successfully moved to the secure quarantine folder, effectively protecting the endpoint.", fr: "Le journal d'activité confirme que toutes les menaces sélectionnées ont été déplacées avec succès vers le dossier de quarantaine sécurisé, protégeant ainsi efficacement le point de terminaison." }
                    },
                    {
                        img: "portguardian_slide6.png",
                        title: { de: "Stufe 6: Verifizierung der Quarantäne", en: "Stage 6: Quarantine Verification", fr: "Étape 6 : Vérification de la Quarantaine" },
                        text: { de: "Eine Überprüfung des Ordners C:\\PortGuardianQuarantine zeigt, dass alle bösartigen und verdächtigen Dateien sicher isoliert wurden, was den Erfolg des Schutzzyklus bestätigt.", en: "An inspection of the C:\\PortGuardianQuarantine folder shows all malicious and suspicious files have been safely isolated, confirming the success of the protection cycle.", fr: "Une inspection du dossier C:\\PortGuardianQuarantaine montre que tous les fichiers malveillants et suspects ont été isolés en toute sécurité, confirmant le succès du cycle de protection." }
                    }
                ]
            }
        }
    };
    
    let currentLang = localStorage.getItem("preferredLang") || config.defaultLang;
    let player;
    let lastActiveElement;

    const mainNav = document.querySelector(".main-nav");
    const mobileMenuIcon = document.querySelector(".mobile-menu-icon");
    const mobileNavOverlay = document.getElementById("mobile-nav");
    const navCtaDropdown = document.getElementById("nav-cta-dropdown");
    const heroCtaDropdown = document.querySelector(".hero-cta-dropdown");
    const contactForm = document.getElementById("contact-form");
    const allModals = document.querySelectorAll(".modal");
    const videoModal = document.getElementById("video-modal");
    const imageModal = document.getElementById("image-modal");

    const toggleMobileNav = () => {
        if (!mobileMenuIcon || !mobileNavOverlay) return;
        const isOpen = mobileMenuIcon.classList.toggle("change");
        mobileNavOverlay.style.width = isOpen ? "100%" : "0%";
        document.body.classList.toggle("modal-open", isOpen);
    };

    function switchLanguage(newLang) {
        currentLang = newLang;
        localStorage.setItem("preferredLang", newLang);
        document.documentElement.lang = currentLang;
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
        document.querySelectorAll(".language-item").forEach(item => {
            item.classList.toggle("active", item.getAttribute("data-lang") === newLang);
        });
        updateAllProjectModalsText();
    }

    function updateAllProjectModalsText() {
        Object.keys(config.projects).forEach(modalId => {
            const project = config.projects[modalId];
            const modal = document.getElementById(modalId);
            if (!project || !modal) return;
            const descriptionItems = modal.querySelectorAll(".project-modal-description-item");
            project.slides.forEach((slideData, index) => {
                if (descriptionItems[index]) {
                    descriptionItems[index].querySelector("h4").textContent = slideData.title[currentLang];
                    descriptionItems[index].querySelector("p").innerHTML = slideData.text[currentLang];
                }
            });
        });
    }

    function openModal(modal, triggerElement) {
        if (!modal) return;
        mainNav.classList.add("nav-hidden");
        lastActiveElement = triggerElement || document.activeElement;
        modal.classList.add("active");
        document.body.classList.add("modal-open");
        setTimeout(() => {
            const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            firstFocusable?.focus();
        }, 100);
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.classList.remove("active");
        const parentModal = document.querySelector('.project-modal.is-covered');
        if (parentModal) parentModal.classList.remove('is-covered');
        const isAnyModalOpen = Array.from(allModals).some(m => m.classList.contains("active"));
        if (!isAnyModalOpen) {
            document.body.classList.remove("modal-open");
            mainNav.classList.remove("nav-hidden");
        }
        lastActiveElement?.focus();
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
        if (videoModal && videoModal.classList.contains('active')) {
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
        descriptions[project.currentSlide].classList.remove("active");
        slides[nextIndex].classList.add("active");
        descriptions[nextIndex].classList.add("active");
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
                slideEl.innerHTML = `<img src="images/${slideData.img}" alt="${slideData.title.en}" loading="lazy">`;
                slideEl.addEventListener("click", function () {
                    const imageModalImg = imageModal.querySelector("img");
                    imageModalImg.src = this.querySelector('img').src;
                    imageModalImg.alt = `Enlarged view of ${slideData.title[currentLang] || slideData.title.en}`;
                    modal.classList.add("is-covered");
                    openModal(imageModal, this);
                });
                imageContainer.appendChild(slideEl);
                const descEl = document.createElement("div");
                descEl.className = "project-modal-description-item";
                descEl.innerHTML = `<h4></h4><p></p>`;
                descriptionContainer.appendChild(descEl);
            });
        });
    }

    AOS.init({ duration: 1000, once: true });
    const copyrightYearEl = document.getElementById("copyright-year");
    if (copyrightYearEl) copyrightYearEl.textContent = new Date().getFullYear();
    initializeProjectModals();
    switchLanguage(currentLang);

    document.querySelectorAll(".language-item").forEach(item => {
        item.addEventListener("click", e => {
            e.preventDefault();
            const newLang = item.getAttribute("data-lang");
            if (newLang !== currentLang) switchLanguage(newLang);
            item.closest(".nav-dropdown")?.classList.remove("active");
            if (item.closest(".mobile-language-buttons")) setTimeout(toggleMobileNav, 150);
        });
    });

    mobileMenuIcon?.addEventListener("click", toggleMobileNav);
    mobileNavOverlay?.querySelectorAll("a:not(.language-item)").forEach(link => {
        if (link.getAttribute("href")?.startsWith("#")) {
            link.addEventListener("click", () => setTimeout(toggleMobileNav, 150));
        }
    });

    document.querySelectorAll(".faq-question").forEach(button => {
        button.addEventListener("click", () => {
            const panel = button.nextElementSibling;
            const isActive = button.classList.toggle("active");
            button.setAttribute("aria-expanded", isActive);
            panel.style.maxHeight = isActive ? panel.scrollHeight + "px" : null;
        });
    });

    // --- Floating CTA Button Visibility (FIXED FOR MOBILE) ---
    if (navCtaDropdown && heroCtaDropdown) {
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                // This condition is the key:
                // We show the button ONLY if the element is NOT intersecting AND its position is ABOVE the viewport.
                if (!entry.isIntersecting && entry.boundingClientRect.y < 0) {
                    navCtaDropdown.classList.add("is-visible");
                } else {
                    navCtaDropdown.classList.remove("is-visible");
                }
            },
            {
                // We set a threshold of 0, so the callback fires as soon as the element enters or leaves the screen.
                threshold: 0
            }
        );
        observer.observe(heroCtaDropdown);
    }

    document.getElementById("open-video-modal")?.addEventListener("click", function () {
        openModal(videoModal, this);
        createOrPlayPlayer();
    });

    document.querySelectorAll('.project-card .open-project-modal-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const modalId = this.closest('.project-card').dataset.modalId;
            const modal = document.getElementById(modalId);
            config.projects[modalId].currentSlide = 0;
            showProjectSlide(modalId, 0); 
            openModal(modal, this);
        });
    });

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

    if (contactForm) {
        contactForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const submitBtn = contactForm.querySelector(".submit-btn");
            const statusEl = document.getElementById("form-status");
            const btnSpan = submitBtn.querySelector('span');
            const originalText = btnSpan.textContent;
            submitBtn.disabled = true;
            btnSpan.textContent = submitBtn.dataset[`sending-${currentLang}`] || 'Sending...';
            fetch(contactForm.action, {
                method: "POST",
                body: new FormData(contactForm),
                headers: { Accept: "application/json" }
            }).then(response => {
                if (response.ok) {
                    statusEl.innerHTML = `<p class="success">Thank you! Your message has been sent.</p>`;
                    contactForm.reset();
                } else {
                    throw new Error('Form submission failed');
                }
            }).catch(() => {
                statusEl.innerHTML = `<p class="error">Oops! There was a problem. Please try again.</p>`;
            }).finally(() => {
                submitBtn.disabled = false;
                btnSpan.textContent = originalText;
                setTimeout(() => statusEl.innerHTML = '', 5000);
            });
        });
    }

    window.addEventListener("keydown", event => {
        const activeModal = document.querySelector(".modal.active");
        if (!activeModal) return;
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
});