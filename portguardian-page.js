document.addEventListener("DOMContentLoaded", () => {
    const loader = document.getElementById("case-loader");
    const backgroundVideo = document.getElementById("portguardian-background-video");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

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

    if (!loader) return;

    window.requestAnimationFrame(() => {
        loader.classList.add("is-complete");
        loader.setAttribute("aria-hidden", "true");
        window.setTimeout(() => loader.remove(), reduceMotion ? 180 : 420);
    });
});
