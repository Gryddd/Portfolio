document.addEventListener("DOMContentLoaded", () => {
    const loader = document.getElementById("case-loader");
    const backgroundVideo = document.getElementById("portguardian-background-video");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const panel = loader?.querySelector(".case-loader-panel");
    const copy = loader?.querySelector(".case-loader-copy");

    if (!loader) return;

    document.body.classList.add("case-loader-active");

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

    initializeBackgroundVideo();

    const setupLoaderAnimation = () => {
        if (!panel || !copy) {
            document.body.classList.add("case-loader-animate");
            return;
        }

        const gap = Number.parseFloat(window.getComputedStyle(panel).gap) || 0;
        const copyWidth = copy.getBoundingClientRect().width;
        const startOffset = (copyWidth + gap) / 2;

        document.body.style.setProperty("--portguardian-loader-icon-start-offset", `${startOffset}px`);
        window.requestAnimationFrame(() => {
            document.body.classList.add("case-loader-animate");
        });
    };

    if (document.fonts?.ready) {
        document.fonts.ready.then(setupLoaderAnimation).catch(setupLoaderAnimation);
    } else {
        setupLoaderAnimation();
    }

    const startedAt = performance.now();
    const cleanupDelay = reduceMotion ? 240 : 820;
    const minimumVisibleMs = reduceMotion ? 300 : 2800;
    let completed = false;

    const finishLoader = () => {
        if (completed) return;
        completed = true;

        const elapsed = performance.now() - startedAt;
        const remaining = Math.max(0, minimumVisibleMs - elapsed);

        window.setTimeout(() => {
            loader.classList.add("is-complete");
            loader.setAttribute("aria-hidden", "true");
            window.requestAnimationFrame(() => {
                document.body.classList.remove("case-loader-active");
            });
            window.setTimeout(() => {
                document.body.classList.remove("case-loader-animate");
                document.body.style.removeProperty("--portguardian-loader-icon-start-offset");
                loader.remove();
            }, cleanupDelay);
        }, remaining);
    };

    window.addEventListener("load", finishLoader, { once: true });
    window.setTimeout(finishLoader, reduceMotion ? 900 : 5000);
});
