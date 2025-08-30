document.addEventListener("DOMContentLoaded", function () {
    AOS.init({ duration: 1000, once: !0 });
    document.getElementById("copyright-year").textContent = new Date().getFullYear();
    let currentLang = localStorage.getItem("preferredLang") || "en";
    let player;
    let lastActiveElement;
    const youtubeVideoId = "R_rKRfh7ceU";
    const mainNav = document.querySelector(".main-nav");
    const languageItems = document.querySelectorAll(".language-item");
    const translatableElements = document.querySelectorAll(".lang");
    const translatablePlaceholders = document.querySelectorAll(".lang-placeholder");
    const translatableAria = document.querySelectorAll(".lang-aria");
    const profilePicture = document.getElementById("profile-picture");
    const allModals = document.querySelectorAll(".modal");
    const videoModal = document.getElementById("video-modal");
    const imageModal = document.getElementById("image-modal");
    const diagramModal = document.getElementById("diagram-modal");
    const contactForm = document.getElementById("contact-form");
    const altTexts = { de: "Ein professionelles Portraitfoto von Walid Gourideche", en: "A professional portrait of Walid Gourideche", fr: "Un portrait professionnel de Walid Gourideche" };
    const projectsData = {
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
        // NEW BOREALIS PROJECT DATA STARTS HERE
        "project-modal-2": {
            currentSlide: 0,
            slides: [
                {
                    img: "borealis_architecture.png", // You will need to create this screenshot
                    title: { de: "Full-Stack MERN Architektur", en: "Full-Stack MERN Architecture", fr: "Architecture Full-Stack MERN" },
                    text: {
                        de: "Borealis ist eine vollständige E-Commerce-Anwendung, die auf dem MERN-Stack basiert. Die Kernarchitektur umfasst eine Node.js/Express REST-API für Backend-Logik, eine MongoDB-Datenbank für die Datenpersistenz und eine reine Vanilla-JS-Frontend-Anwendung, die für eine optimale Leistung ohne Framework-Overhead sorgt.",
                        en: "Borealis is a complete e-commerce application built on the MERN stack. The core architecture features a Node.js/Express REST API for backend logic, a MongoDB database for data persistence, and a pure Vanilla JS frontend for optimal performance without framework overhead.",
                        fr: "Borealis est une application e-commerce complète basée sur la stack MERN. L'architecture de base comprend une API REST Node.js/Express pour la logique backend, une base de données MongoDB pour la persistance des données, et une application frontend en JavaScript pur pour des performances optimales sans la surcharge d'un framework."
                    }
                },
                {
                    img: "borealis_auth.png", // You will need to create this screenshot
                    title: { de: "Sichere Authentifizierung & Sitzungsverwaltung", en: "Secure Authentication & Session Management", fr: "Authentification et Gestion de Session Sécurisées" },
                    text: {
                        de: "Die Benutzerauthentifizierung wird durch JSON Web Tokens (JWT) gesichert. Passwörter werden vor der Speicherung mit bcrypt gehasht, um die Einhaltung von Sicherheitsstandards zu gewährleisten. Token-basierte Sitzungen ermöglichen eine zustandslose und skalierbare Backend-Architektur.",
                        en: "User authentication is secured using JSON Web Tokens (JWT). Passwords are hashed with bcrypt before storage, ensuring security compliance. Token-based sessions allow for a stateless and scalable backend architecture.",
                        fr: "L'authentification des utilisateurs est sécurisée à l'aide de JSON Web Tokens (JWT). Les mots de passe sont hachés avec bcrypt avant d'être stockés, garantissant la conformité en matière de sécurité. Les sessions basées sur des jetons permettent une architecture backend sans état et évolutive."
                    }
                },
                {
                    img: "borealis_admin_dashboard.png", // You will need to create this screenshot
                    title: { de: "Systemadministration & Rollenbasierte Zugriffskontrolle", en: "System Administration & Role-Based Access Control", fr: "Administration Système & Contrôle d'Accès Basé sur les Rôles" },
                    text: {
                        de: "Ein Admin-Dashboard bietet rollenbasierte Zugriffskontrolle (RBAC), die es autorisierten Benutzern ermöglicht, das System zu verwalten. Administratoren können CRUD-Operationen (Erstellen, Lesen, Aktualisieren, Löschen) an Produkten durchführen und alle Benutzer- und Bestelldaten einsehen, was wichtige Systemverwaltungsaufgaben demonstriert.",
                        en: "An admin dashboard provides Role-Based Access Control (RBAC), allowing authorized users to manage the system. Admins can perform CRUD (Create, Read, Update, Delete) operations on products and view all user and order data, demonstrating key system administration tasks.",
                        fr: "Un tableau de bord d'administration fournit un contrôle d'accès basé sur les rôles (RBAC), permettant aux utilisateurs autorisés de gérer le système. Les administrateurs peuvent effectuer des opérations CRUD (Créer, Lire, Mettre à jour, Supprimer) sur les produits et consulter toutes les données des utilisateurs et des commandes, illustrant ainsi des tâches essentielles d'administration système."
                    }
                },
                {
                    img: "borealis_api_integration.png", // You will need to create this screenshot
                    title: { de: "Integration von Drittanbieter-APIs", en: "Third-Party API Integration", fr: "Intégration d'API Tierces" },
                    text: {
                        de: "Das Projekt integriert externe Dienste über APIs für wichtige Funktionalitäten. Stripe wird für eine sichere Zahlungsabwicklung genutzt, wodurch sensible Finanzdaten von den eigenen Servern ferngehalten werden. SendGrid wird für transaktionale E-Mails, wie z.B. das Zurücksetzen von Passwörtern, verwendet.",
                        en: "The project integrates external services via APIs for critical functionality. Stripe is utilized for secure payment processing, keeping sensitive financial data off the local servers. SendGrid is used for transactional emails, such as password resets.",
                        fr: "Le projet intègre des services externes via des API pour des fonctionnalités critiques. Stripe est utilisé pour le traitement sécurisé des paiements, gardant les données financières sensibles hors des serveurs locaux. SendGrid est utilisé pour les e-mails transactionnels, tels que la réinitialisation des mots de passe."
                    }
                },
                {
                    img: "borealis_state_management.png", // You will need to create this screenshot
                    title: { de: "Zustandsverwaltung: Gast vs. Benutzer", en: "State Management: Guest vs. User", fr: "Gestion d'État : Invité vs. Utilisateur" },
                    text: {
                        de: "Eine duale Zustandsverwaltungsstrategie wurde implementiert. Gast-Sitzungen verwenden LocalStorage für die clientseitige Persistenz des Warenkorbs. Beim Einloggen wird der LocalStorage-Zustand nahtlos mit dem in MongoDB gespeicherten Benutzerzustand zusammengeführt, was die Datenintegrität über verschiedene Sitzungstypen hinweg gewährleistet.",
                        en: "A dual state management strategy is implemented. Guest sessions utilize LocalStorage for client-side cart persistence. Upon login, the LocalStorage state is seamlessly merged with the user's database state stored in MongoDB, ensuring data integrity across session types.",
                        fr: "Une double stratégie de gestion d'état est mise en œuvre. Les sessions invitées utilisent LocalStorage pour la persistance du panier côté client. Lors de la connexion, l'état de LocalStorage est fusionné de manière transparente avec l'état de l'utilisateur stocké dans MongoDB, garantissant l'intégrité des données entre les types de session."
                    }
                }
            ]
        }
        // NEW BOREALIS PROJECT DATA ENDS HERE
    };
    function updateModalLangSwitchers(selectedLang) {
        document.querySelectorAll(".modal-lang-switcher button").forEach((button) => {
            button.classList.toggle("active", button.dataset.lang === selectedLang);
        });
    }
    function switchLanguage(newLang) {
        currentLang = newLang;
        localStorage.setItem("preferredLang", newLang);
        document.documentElement.lang = currentLang;
        translatableElements.forEach((el) => {
            if (el.dataset[currentLang]) {
                el.innerHTML = el.dataset[currentLang];
            }
        });
        translatablePlaceholders.forEach((el) => {
            if (el.dataset[currentLang]) {
                el.placeholder = el.dataset[currentLang];
            }
        });
        translatableAria.forEach((el) => {
            if (el.dataset[currentLang]) {
                el.setAttribute("aria-label", el.dataset[currentLang]);
            }
        });
        if (profilePicture) {
            profilePicture.alt = altTexts[currentLang];
        }
        updateLanguageSelectorUI(currentLang);
        updateModalLangSwitchers(currentLang);
        updateAllProjectModalsText();
        // Updated logic to populate both mobile showcases
        populateMobileShowcase("project-modal-1", "mobile-project-showcase");
        populateMobileShowcase("project-modal-2", "mobile-project-showcase-borealis");
    }
    function updateLanguageSelectorUI(selectedLang) {
        document.querySelectorAll(".language-item").forEach((item) => {
            item.classList.toggle("active", item.getAttribute("data-lang") === selectedLang);
        });
    }
    function updateAllProjectModalsText() {
        Object.keys(projectsData).forEach((modalId) => {
            const project = projectsData[modalId];
            const modal = document.getElementById(modalId);
            if (!project || !modal) return;
            const descriptionItems = modal.querySelectorAll(".project-modal-description-item");
            project.slides.forEach((slideData, index) => {
                if (descriptionItems[index]) {
                    descriptionItems[index].querySelector("h4").textContent = slideData.title[currentLang];
                    descriptionItems[index].querySelector("p").innerHTML = slideData.text[currentLang];
                }
            });
            if (modal.classList.contains("active")) {
                const activeDesc = modal.querySelector(".project-modal-description-item.active");
                const descContainer = modal.querySelector(".project-modal-description");
                if (activeDesc && descContainer) {
                    descContainer.style.height = activeDesc.scrollHeight + "px";
                }
            }
        });
    }
    function populateMobileShowcase(modalId, showcaseId) {
        const project = projectsData[modalId];
        const container = document.getElementById(showcaseId);
        if (!container) return;
        container.innerHTML = "";
        project.slides.forEach((slideData) => {
            const item = document.createElement("div");
            item.className = "mobile-project-item";
            item.setAttribute("data-aos", "fade-up");
            const img = document.createElement("img");
            img.src = "images/" + slideData.img;
            img.alt = slideData.title[currentLang] || slideData.title.en;
            img.loading = "lazy";
            img.addEventListener("click", function () {
                const imageModalImg = imageModal.querySelector("img");
                imageModalImg.src = this.src;
                imageModalImg.alt = `Enlarged view of ${slideData.title[currentLang] || slideData.title.en}`;
                openModal(imageModal, this);
            });
            const textDiv = document.createElement("div");
            textDiv.className = "mobile-project-text";
            const title = document.createElement("h4");
            title.textContent = slideData.title[currentLang];
            const text = document.createElement("p");
            text.innerHTML = slideData.text[currentLang];
            textDiv.appendChild(title);
            textDiv.appendChild(text);
            item.appendChild(img);
            item.appendChild(textDiv);
            container.appendChild(item);
        });
    }
    function openModal(modal, triggerElement) {
        if (!modal) return;
        mainNav.classList.add("nav-hidden");
        lastActiveElement = triggerElement || document.activeElement;
        modal.classList.add("active");
        document.body.classList.add("modal-open");
        updateModalLangSwitchers(currentLang);
        const firstFocusable = modal.querySelector("button, [href]");
        setTimeout(() => firstFocusable?.focus(), 100);
    }
    function closeModal(modal) {
        if (!modal) return;
        modal.classList.remove("active");
        if ((modal.id === "image-modal" || modal.id === "diagram-modal") && lastActiveElement) {
            const parentModal = lastActiveElement.closest(".project-modal");
            if (parentModal) {
                parentModal.classList.remove("is-covered");
            }
        }
        const isAnyModalOpen = Array.from(allModals).some((m) => m.classList.contains("active"));
        if (!isAnyModalOpen) {
            document.body.classList.remove("modal-open");
            mainNav.classList.remove("nav-hidden");
        }
        if (lastActiveElement) {
            lastActiveElement.focus();
            lastActiveElement = null;
        }
    }
    function createPlayer() {
        if (typeof YT === "undefined" || typeof YT.Player === "undefined") {
            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName("script")[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            window.onYouTubeIframeAPIReady = () => {
                player = new YT.Player("youtube-player-container", { height: "100%", width: "100%", videoId: youtubeVideoId, playerVars: { autoplay: 1, controls: 1, rel: 0 } });
            };
        } else {
            if (!player) {
                player = new YT.Player("youtube-player-container", { height: "100%", width: "100%", videoId: youtubeVideoId, playerVars: { autoplay: 1, controls: 1, rel: 0 } });
            } else {
                player.playVideo();
            }
        }
    }
    function showProjectSlide(modalId, nextIndex) {
        const project = projectsData[modalId];
        const modal = document.getElementById(modalId);
        if (!project || !modal) return;
        const modalImageSlides = modal.querySelectorAll(".project-modal-slide");
        const modalDescriptionContainer = modal.querySelector(".project-modal-description");
        const modalDescriptionSlides = modal.querySelectorAll(".project-modal-description-item");
        const modalCounter = modal.querySelector(".project-modal-counter");
        const currentActiveDesc = modalDescriptionSlides[project.currentSlide];
        if (currentActiveDesc) currentActiveDesc.classList.remove("active");
        modalImageSlides[project.currentSlide].classList.remove("active");
        const nextActiveDesc = modalDescriptionSlides[nextIndex];
        if (nextActiveDesc) {
            nextActiveDesc.classList.add("active");
            modalDescriptionContainer.style.height = nextActiveDesc.scrollHeight + "px";
        }
        const newActiveImg = modalImageSlides[nextIndex].querySelector("img");
        if (newActiveImg) newActiveImg.alt = project.slides[nextIndex].title[currentLang] || project.slides[nextIndex].title.en;
        modalImageSlides[nextIndex].classList.add("active");
        project.currentSlide = nextIndex;
        modalCounter.textContent = `${nextIndex + 1} / ${project.slides.length}`;
    }
    Object.keys(projectsData).forEach((modalId) => {
        const project = projectsData[modalId];
        const modal = document.getElementById(modalId);
        if (!modal) return;
        const modalImageContainer = modal.querySelector(".project-modal-image-wrapper");
        const modalDescriptionContainer = modal.querySelector(".project-modal-description");
        modalImageContainer.innerHTML = "";
        modalDescriptionContainer.innerHTML = "";
        project.slides.forEach((slideData) => {
            const slideContainer = document.createElement("div");
            slideContainer.className = "project-modal-slide";
            const imgEl = document.createElement("img");
            imgEl.src = "images/" + slideData.img;
            imgEl.alt = slideData.title.en;
            imgEl.loading = "lazy";
            slideContainer.appendChild(imgEl);
            slideContainer.addEventListener("click", function () {
                const imageModalImg = imageModal.querySelector("img");
                imageModalImg.src = imgEl.src;
                imageModalImg.alt = `Enlarged view of ${slideData.title[currentLang] || slideData.title.en}`;
                modal.classList.add("is-covered");
                openModal(imageModal, this);
            });
            modalImageContainer.appendChild(slideContainer);
            const descEl = document.createElement("div");
            descEl.className = "project-modal-description-item";
            descEl.innerHTML = `<h4></h4><p></p>`;
            modalDescriptionContainer.appendChild(descEl);
        });
        const modalPrevBtn = modal.querySelector(".project-modal-arrow.prev");
        const modalNextBtn = modal.querySelector(".project-modal-arrow.next");
        modalNextBtn?.addEventListener("click", () => showProjectSlide(modalId, (project.currentSlide + 1) % project.slides.length));
        modalPrevBtn?.addEventListener("click", () => showProjectSlide(modalId, (project.currentSlide - 1 + project.slides.length) % project.slides.length));
        
        // This logic is now handled in switchLanguage to ensure it runs on load and on lang change
        // populateMobileShowcase(modalId, `mobile-project-showcase${modalId.includes('2') ? '-borealis' : ''}`);
    });
    document.querySelectorAll(".open-project-modal-btn").forEach((button) => {
        button.addEventListener("click", function () {
            const modalId = this.dataset.modalId;
            const project = projectsData[modalId];
            const modal = document.getElementById(modalId);
            if (!project || !modal) return;
            updateAllProjectModalsText();
            project.currentSlide = 0;
            modal.querySelectorAll(".project-modal-slide").forEach((s, i) => s.classList.toggle("active", i === 0));
            modal.querySelectorAll(".project-modal-description-item").forEach((d, i) => d.classList.toggle("active", i === 0));
            showProjectSlide(modalId, 0);
            openModal(modal, this);
        });
    });
    switchLanguage(currentLang);
    const navCtaDropdown = document.getElementById("nav-cta-dropdown");
    const heroCtaDropdown = document.querySelector(".hero-cta-dropdown");
    if (navCtaDropdown && heroCtaDropdown) {
        const mainNavHeight = mainNav.offsetHeight;
        window.addEventListener(
            "scroll",
            () => {
                const heroCtaPos = heroCtaDropdown.getBoundingClientRect();
                if (heroCtaPos.bottom < mainNavHeight) {
                    navCtaDropdown.classList.add("is-visible");
                } else {
                    navCtaDropdown.classList.remove("is-visible");
                    navCtaDropdown.classList.remove("active");
                }
            },
            { passive: !0 }
        );
    }
    document.querySelectorAll(".project-intro-image").forEach((introImage) => {
        introImage.addEventListener("click", function () {
            const img = this.querySelector("img");
            if (img) {
                diagramModal.querySelector("img").src = img.src;
                diagramModal.querySelector("img").alt = img.alt;
                openModal(diagramModal, this);
            }
        });
    });
    document.getElementById("open-video-modal")?.addEventListener("click", function () {
        openModal(videoModal, this);
        createPlayer();
    });
    allModals.forEach((modal) => {
        const closeBtn = modal.querySelector(".close-button");
        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                if (modal.id === "video-modal" && player && typeof player.stopVideo === "function") player.stopVideo();
                closeModal(modal);
            });
        }
    });
    if (contactForm) {
        const submitBtn = contactForm.querySelector(".submit-btn");
        const formStatus = document.getElementById("form-status");
        contactForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const originalBtnText = submitBtn.querySelector("span").innerHTML;
            const sendingText = submitBtn.dataset["sending" + currentLang.charAt(0).toUpperCase() + currentLang.slice(1)];
            submitBtn.disabled = !0;
            submitBtn.innerHTML = `<span>${sendingText}</span>`;
            formStatus.innerHTML = "";
            fetch(contactForm.action, { method: "POST", body: new FormData(contactForm), headers: { Accept: "application/json" } })
                .then((response) => {
                    if (response.ok) {
                        const sentText = submitBtn.dataset["sent" + currentLang.charAt(0).toUpperCase() + currentLang.slice(1)];
                        submitBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg> <span>${sentText}</span>`;
                        formStatus.innerHTML = `<p class="success">${{ de: "Vielen Dank! Ihre Nachricht wurde gesendet.", en: "Thank you! Your message has been sent.", fr: "Merci ! Votre message a été envoyé." }[currentLang]}</p>`;
                        contactForm.reset();
                    } else {
                        response.json().then((data) => {
                            formStatus.innerHTML = `<p class="error">${data.errors ? data.errors.map((e) => e.message).join(", ") : "Oops! There was a problem."}</p>`;
                        });
                        submitBtn.disabled = !1;
                        submitBtn.innerHTML = `<span>${originalBtnText}</span>`;
                    }
                })
                .catch(() => {
                    const errorMessages = { de: "Netzwerkfehler. Bitte versuchen Sie es erneut.", en: "Network error. Please try again.", fr: "Erreur réseau. Veuillez réessayer." };
                    formStatus.innerHTML = `<p class="error">${errorMessages[currentLang]}</p>`;
                    submitBtn.disabled = !1;
                    submitBtn.innerHTML = `<span>${originalBtnText}</span>`;
                });
        });
    }
    window.addEventListener("click", (event) => {
        if (event.target.classList.contains("modal")) closeModal(event.target);
        if (!event.target.closest(".nav-dropdown, .hero-cta-dropdown, #nav-cta-dropdown")) {
            document.querySelectorAll(".nav-dropdown.active, .hero-cta-dropdown.active, #nav-cta-dropdown.active").forEach((dd) => {
                dd.classList.remove("active");
                if (dd.querySelector(".nav-dropdown-toggle")) {
                    dd.querySelector(".nav-dropdown-toggle").setAttribute("aria-expanded", "false");
                }
            });
        }
        if (!event.target.closest(".flip-card")) document.querySelectorAll(".flip-card-inner.is-flipped").forEach((inner) => inner.classList.remove("is-flipped"));
    });
    window.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        const activeImageModal = document.getElementById("image-modal");
        const activeDiagramModal = document.getElementById("diagram-modal");
        if (activeImageModal && activeImageModal.classList.contains("active")) {
            closeModal(activeImageModal);
        } else if (activeDiagramModal && activeDiagramModal.classList.contains("active")) {
            closeModal(activeDiagramModal);
        } else {
            const activeModal = document.querySelector(".modal.active");
            if (activeModal) {
                if (activeModal.id === "video-modal" && player?.stopVideo) player.stopVideo();
                closeModal(activeModal);
            }
        }
    });
    window.addEventListener("keydown", (event) => {
        const activeModal = document.querySelector(".project-modal.active");
        if (!activeModal) return;
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            const modalId = activeModal.id;
            const project = projectsData[modalId];
            if (project) {
                if (event.key === "ArrowRight") showProjectSlide(modalId, (project.currentSlide + 1) % project.slides.length);
                if (event.key === "ArrowLeft") showProjectSlide(modalId, (project.currentSlide - 1 + project.slides.length) % project.slides.length);
            }
        }
        if (event.key === "Tab") {
            const focusableElements = Array.from(activeModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'));
            if (focusableElements.length === 0) {
                event.preventDefault();
                return;
            }
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            if (event.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    event.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    event.preventDefault();
                }
            }
        }
    });
    document.querySelectorAll(".language-item").forEach((item) => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            switchLanguage(item.getAttribute("data-lang"));
            const activeDropdown = item.closest(".nav-dropdown.active");
            if (activeDropdown) {
                activeDropdown.classList.remove("active");
                activeDropdown.querySelector(".nav-dropdown-toggle").setAttribute("aria-expanded", "false");
            }
            if (item.closest(".mobile-language-buttons")) {
                setTimeout(toggleNav, 150);
            }
        });
    });
    document.querySelectorAll(".modal-lang-switcher button").forEach((button) => {
        button.addEventListener("click", function (e) {
            e.preventDefault();
            const newLang = this.dataset.lang;
            if (newLang !== currentLang) {
                switchLanguage(newLang);
            }
        });
    });
    document.querySelectorAll(".faq-question").forEach((button) =>
        button.addEventListener("click", () => {
            const panel = button.nextElementSibling;
            button.classList.toggle("active");
            button.setAttribute("aria-expanded", button.classList.contains("active"));
            panel.style.maxHeight = panel.style.maxHeight ? null : panel.scrollHeight + "px";
        })
    );
    const mobileMenuIcon = document.querySelector(".mobile-menu-icon");
    const mobileNavOverlay = document.getElementById("mobile-nav");
    const toggleNav = () => {
        const isOpen = mobileMenuIcon.classList.toggle("change");
        mobileNavOverlay.style.width = isOpen ? "100%" : "0%";
        document.body.classList.toggle("modal-open", isOpen);
    };
    mobileMenuIcon.addEventListener("click", toggleNav);
    mobileNavOverlay.querySelectorAll("a:not(.language-item)").forEach((link) => {
        if (link.getAttribute("href")?.startsWith("#")) {
            link.addEventListener("click", () => setTimeout(toggleNav, 150));
        }
    });
    document.querySelectorAll(".nav-dropdown-toggle").forEach((toggle) =>
        toggle.addEventListener("click", (e) => {
            e.stopPropagation();
            const parent = toggle.closest(".nav-dropdown");
            const isActive = parent.classList.contains("active");
            document.querySelectorAll(".nav-dropdown.active").forEach((d) => {
                if (d !== parent) {
                    d.classList.remove("active");
                    d.querySelector(".nav-dropdown-toggle").setAttribute("aria-expanded", "false");
                }
            });
            parent.classList.toggle("active");
            toggle.setAttribute("aria-expanded", !isActive);
        })
    );
    document.querySelectorAll(".flip-card").forEach((card) => {
        card.addEventListener("click", function () {
            this.querySelector(".flip-card-inner").classList.toggle("is-flipped");
        });
        card.querySelectorAll("a").forEach((a) => a.addEventListener("click", (e) => e.stopPropagation()));
    });
});