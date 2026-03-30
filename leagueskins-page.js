document.addEventListener("DOMContentLoaded", () => {
    const loader = document.getElementById("rose-loader");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const numberFormatter = new Intl.NumberFormat("en-US");

    if (loader) {
        document.body.classList.add("rose-loader-active");

        const startedAt = performance.now();
        const minimumVisibleMs = reduceMotion ? 350 : 3200;
        let completed = false;

        const finishLoader = () => {
            if (completed) return;
            completed = true;

            const elapsed = performance.now() - startedAt;
            const remaining = Math.max(0, minimumVisibleMs - elapsed);

            window.setTimeout(() => {
                loader.classList.add("is-complete");
                loader.setAttribute("aria-hidden", "true");
                document.body.classList.remove("rose-loader-active");
                window.setTimeout(() => loader.remove(), 720);
            }, remaining);
        };

        window.addEventListener("load", finishLoader, { once: true });
        window.setTimeout(finishLoader, reduceMotion ? 900 : 5400);
    }

    const onlineCount = document.getElementById("discord-online-count");
    const memberCount = document.getElementById("discord-member-count");
    const serverIcon = document.getElementById("discord-server-icon");
    const metricsCard = document.querySelector(".discord-metric-card");
    const metricAnimations = new WeakMap();

    const setMetricValue = (element, value) => {
        if (!element || !Number.isFinite(value)) return;
        element.dataset.currentValue = String(value);
        element.textContent = numberFormatter.format(value);
    };

    const animateMetric = (element, value) => {
        if (!element || !Number.isFinite(value)) return;

        const targetValue = Math.max(0, Math.round(value));

        if (reduceMotion || typeof window.requestAnimationFrame !== "function") {
            setMetricValue(element, targetValue);
            return;
        }

        const previousFrame = metricAnimations.get(element);
        if (previousFrame) {
            window.cancelAnimationFrame(previousFrame);
        }

        const startValue = Number(element.dataset.currentValue ?? 0);
        const startedAt = performance.now();
        const duration = 1900;

        const tick = now => {
            const progress = Math.min(1, (now - startedAt) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            const nextValue = Math.round(startValue + (targetValue - startValue) * eased);
            setMetricValue(element, nextValue);

            if (progress < 1) {
                metricAnimations.set(element, window.requestAnimationFrame(tick));
                return;
            }

            setMetricValue(element, targetValue);
            metricAnimations.delete(element);
        };

        metricAnimations.set(element, window.requestAnimationFrame(tick));
    };

    let cardVisible = !metricsCard || reduceMotion || !("IntersectionObserver" in window);
    let metricsReady = false;
    let metricsAnimated = false;
    let pendingOnline = 0;
    let pendingMembers = 0;

    setMetricValue(onlineCount, 0);
    setMetricValue(memberCount, 0);

    const applyMetrics = (online, members) => {
        animateMetric(onlineCount, online);
        animateMetric(memberCount, members);
    };

    const maybeAnimateMetrics = () => {
        if (!metricsReady || !cardVisible || metricsAnimated) return;
        metricsAnimated = true;
        applyMetrics(pendingOnline, pendingMembers);
    };

    if (metricsCard && !reduceMotion && "IntersectionObserver" in window) {
        const metricsObserver = new IntersectionObserver(entries => {
            const isVisible = entries.some(entry => entry.isIntersecting);
            if (!isVisible) return;

            cardVisible = true;
            metricsObserver.disconnect();
            maybeAnimateMetrics();
        }, {
            rootMargin: "0px 0px -12% 0px",
            threshold: 0.35
        });

        metricsObserver.observe(metricsCard);
    }

    const POLL_INTERVAL_MS = 3 * 60 * 1000; // refresh every 3 minutes

    const fetchDiscordStats = (isInitial = false) => {
        fetch("https://discord.com/api/v9/invites/roseapp?with_counts=true&with_expiration=true", {
            cache: "no-store"
        })
            .then(response => {
                if (!response.ok) throw new Error("Discord invite lookup failed");
                return response.json();
            })
            .then(data => {
                const nextOnline = Number(data?.approximate_presence_count ?? data?.profile?.online_count);
                const nextMembers = Number(data?.approximate_member_count ?? data?.profile?.member_count);
                const guildId = data?.guild?.id;
                const iconHash = data?.guild?.icon;

                const resolvedOnline = Number.isFinite(nextOnline) ? nextOnline : 0;
                const resolvedMembers = Number.isFinite(nextMembers) ? nextMembers : 0;

                if (isInitial) {
                    pendingOnline = resolvedOnline;
                    pendingMembers = resolvedMembers;
                    metricsReady = true;
                    maybeAnimateMetrics();
                } else {
                    // Subsequent polls: animate to new values directly
                    animateMetric(onlineCount, resolvedOnline);
                    animateMetric(memberCount, resolvedMembers);
                }

                if (serverIcon && guildId && iconHash) {
                    serverIcon.src = `https://cdn.discordapp.com/icons/${guildId}/${iconHash}.png?size=256`;
                }
            })
            .catch(() => {
                // On failure, leave counts at 0
            });
    };

    // Initial fetch
    fetchDiscordStats(true);

    // Poll every 3 minutes
    setInterval(() => fetchDiscordStats(false), POLL_INTERVAL_MS);
});
