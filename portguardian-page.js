document.addEventListener("DOMContentLoaded", () => {
    const loader = document.getElementById("case-loader");
    const backgroundVideo = document.getElementById("portguardian-background-video");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const loaderIcon = loader?.querySelector(".case-loader-icon");
    const loaderIconShell = loader?.querySelector(".case-loader-icon-shell");
    const copy = loader?.querySelector(".case-loader-copy");
    const mainContent = document.getElementById("main-content");
    const animationReadyEvent = "portfolio:ready";
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    const signalAnimationsReady = () => {
        if (document.documentElement.dataset.animationsReady === "true") return;
        document.documentElement.dataset.animationsReady = "true";
        document.dispatchEvent(new Event(animationReadyEvent));
    };

    let animationsReadyScheduled = false;

    const scheduleAnimationsReady = () => {
        if (animationsReadyScheduled) return;
        animationsReadyScheduled = true;

        const fireReady = () => {
            window.requestAnimationFrame(signalAnimationsReady);
        };

        if (reduceMotion) {
            fireReady();
            return;
        }

        window.setTimeout(() => {
            if (typeof window.requestIdleCallback === "function") {
                window.requestIdleCallback(fireReady, { timeout: 900 });
                return;
            }
            fireReady();
        }, 340);
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

    let backgroundVideoInitialized = false;

    const initializeBackgroundVideoOnce = () => {
        if (backgroundVideoInitialized) return;
        backgroundVideoInitialized = true;
        initializeBackgroundVideo();
    };

    const scheduleBackgroundVideoInitialization = () => {
        if (backgroundVideoInitialized) return;

        if (reduceMotion) {
            initializeBackgroundVideoOnce();
            return;
        }

        window.setTimeout(() => {
            if (typeof window.requestIdleCallback === "function") {
                window.requestIdleCallback(() => initializeBackgroundVideoOnce(), { timeout: 1200 });
                return;
            }
            initializeBackgroundVideoOnce();
        }, 420);
    };

    if (!loader) {
        initializeBackgroundVideoOnce();
        waitForWindowLoad(signalAnimationsReady);
        return;
    }

    if (mainContent) {
        mainContent.inert = true;
        mainContent.setAttribute("aria-hidden", "true");
    }

    let introStartedAt = performance.now();

    const measureLoaderCopyWidth = (element, maxWidth) => {
        if (!element) return 0;

        const clone = element.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        clone.style.position = "fixed";
        clone.style.left = "-9999px";
        clone.style.top = "0";
        clone.style.width = "auto";
        clone.style.maxWidth = `${Math.max(0, Math.round(maxWidth))}px`;
        clone.style.opacity = "1";
        clone.style.visibility = "hidden";
        clone.style.pointerEvents = "none";
        clone.style.overflow = "visible";
        clone.style.transform = "none";
        clone.style.padding = "0";
        clone.style.zIndex = "-1";
        document.body.appendChild(clone);
        const width = Math.ceil(clone.getBoundingClientRect().width);
        clone.remove();
        return width;
    };

    const setupLoaderAnimation = () => {
        if (loaderIconShell && copy) {
            const iconWidth = Math.ceil(loaderIconShell.getBoundingClientRect().width);
            const rootFontSize = Number.parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16;
            const viewportWidth = window.innerWidth;
            const gap = viewportWidth <= 720
                ? clamp(viewportWidth * 0.028, 0.55 * rootFontSize, 0.9 * rootFontSize)
                : clamp(viewportWidth * 0.024, 0.9 * rootFontSize, 1.4 * rootFontSize);
            const availableCopyWidth = Math.max(160, viewportWidth - iconWidth - gap - (rootFontSize * 2));
            const copyWidth = measureLoaderCopyWidth(copy, availableCopyWidth);

            document.body.style.setProperty("--portguardian-loader-gap-active", `${Math.round(gap)}px`);
            document.body.style.setProperty("--portguardian-loader-copy-width", `${copyWidth}px`);
        }

        window.requestAnimationFrame(() => {
            introStartedAt = performance.now();
            document.body.classList.add("case-loader-animate");
        });
    };

    const loaderIntroReady = Promise.all([
        waitForFontsReady(),
        waitForImageReady(loaderIcon)
    ]).then(setupLoaderAnimation).catch(setupLoaderAnimation);

    const cleanupDelay = reduceMotion ? 180 : 760;
    const minimumVisibleMs = reduceMotion ? 220 : 1650;
    const finalHoldMs = reduceMotion ? 80 : 160;
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
                document.body.classList.add("case-loader-transitioning");

                window.requestAnimationFrame(() => {
                    if (mainContent) {
                        mainContent.inert = false;
                        mainContent.removeAttribute("aria-hidden");
                    }
                    document.body.classList.remove("case-loader-active");
                    scheduleBackgroundVideoInitialization();
                    scheduleAnimationsReady();
                });

                window.setTimeout(() => {
                    document.body.classList.remove("case-loader-animate");
                    document.body.classList.remove("case-loader-transitioning");
                    document.body.style.removeProperty("--portguardian-loader-gap-active");
                    document.body.style.removeProperty("--portguardian-loader-copy-width");
                    loader.remove();
                }, cleanupDelay);
            }, remaining);
        });
    };

    waitForWindowLoad(finishLoader);
});
