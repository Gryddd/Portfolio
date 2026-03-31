document.addEventListener("DOMContentLoaded", () => {
    const loader = document.getElementById("case-loader");
    const backgroundVideo = document.getElementById("portguardian-background-video");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const loaderIcon = loader?.querySelector(".case-loader-icon");
    const panel = loader?.querySelector(".case-loader-panel");
    const copy = loader?.querySelector(".case-loader-copy");
    const animationReadyEvent = "portfolio:ready";

    const signalAnimationsReady = () => {
        if (document.documentElement.dataset.animationsReady === "true") return;
        document.documentElement.dataset.animationsReady = "true";
        document.dispatchEvent(new Event(animationReadyEvent));
    };

    const waitForWindowLoad = callback => {
        if (document.readyState === "complete") {
            callback();
            return;
        }

        window.addEventListener("load", callback, { once: true });
    };

    const waitForFontsReady = () => {
        if (!document.fonts?.ready) return Promise.resolve();
        return document.fonts.ready.catch(() => {});
    };

    const waitForImageReady = image => {
        if (!image) return Promise.resolve();
        if (image.complete && image.naturalWidth > 0) {
            if (typeof image.decode === "function") {
                return image.decode().catch(() => {});
            }
            return Promise.resolve();
        }

        return new Promise(resolve => {
            const finish = () => {
                if (typeof image.decode === "function") {
                    image.decode().catch(() => {}).finally(resolve);
                    return;
                }
                resolve();
            };

            image.addEventListener("load", finish, { once: true });
            image.addEventListener("error", resolve, { once: true });
        });
    };

    const shouldEnableBackgroundVideo = () => {
        const saveData = Boolean(connection?.saveData);
        const slowConnection = typeof connection?.effectiveType === "string" && /(2g|3g)/i.test(connection.effectiveType);
        return !reduceMotion && !saveData && !slowConnection;
    };

    const initializeBackgroundVideo = () => {
        if (!backgroundVideo) return;

        const shouldEnable = shouldEnableBackgroundVideo();
        document.body.classList.toggle("project-background-video-disabled", !shouldEnable);

        if (!shouldEnable) {
            backgroundVideo.pause();
            backgroundVideo.innerHTML = "";
            backgroundVideo.load();
            return;
        }

        if (!backgroundVideo.querySelector("source") && backgroundVideo.dataset.src) {
            const source = document.createElement("source");
            source.src = backgroundVideo.dataset.src;
            source.type = "video/webm";
            backgroundVideo.appendChild(source);
            backgroundVideo.load();
        }

        backgroundVideo.play().catch(() => {});
    };

    if (!loader) {
        initializeBackgroundVideo();
        waitForWindowLoad(signalAnimationsReady);
        return;
    }

    initializeBackgroundVideo();

    let introStartedAt = performance.now();

    const setupLoaderAnimation = () => {
        if (!panel || !copy) {
            document.body.classList.add("case-loader-animate");
            introStartedAt = performance.now();
            return;
        }

        const gap = Number.parseFloat(window.getComputedStyle(panel).gap) || 0;
        const copyWidth = copy.getBoundingClientRect().width;
        const startOffset = (copyWidth + gap) / 2;

        document.body.style.setProperty("--portguardian-loader-icon-start-offset", `${startOffset}px`);
        window.requestAnimationFrame(() => {
            introStartedAt = performance.now();
            document.body.classList.add("case-loader-animate");
        });
    };

    const loaderIntroReady = Promise.all([
        waitForFontsReady(),
        waitForImageReady(loaderIcon)
    ]).then(setupLoaderAnimation).catch(setupLoaderAnimation);

    const cleanupDelay = reduceMotion ? 220 : 860;
    const minimumVisibleMs = reduceMotion ? 240 : 2200;
    const finalHoldMs = 1000;
    let completed = false;

    const finishLoader = () => {
        if (completed) return;
        completed = true;

        loaderIntroReady.finally(() => {
            const elapsed = performance.now() - introStartedAt;
            const remaining = Math.max(0, minimumVisibleMs - elapsed) + finalHoldMs;

            window.setTimeout(() => {
                loader.classList.add("is-complete");
                loader.setAttribute("aria-hidden", "true");
                window.setTimeout(() => {
                    document.body.classList.remove("case-loader-animate");
                    document.body.classList.remove("case-loader-active");
                    document.body.style.removeProperty("--portguardian-loader-icon-start-offset");
                    loader.remove();
                    window.requestAnimationFrame(signalAnimationsReady);
                }, cleanupDelay);
            }, remaining);
        });
    };

    waitForWindowLoad(finishLoader);
});
