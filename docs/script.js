const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const formatNumber = (value) =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(value);

document.documentElement.classList.add("js-ready");

if (!reduceMotion) {
  window.addEventListener(
    "pointermove",
    (event) => {
      const x = `${(event.clientX / window.innerWidth) * 100}%`;
      const y = `${(event.clientY / window.innerHeight) * 100}%`;
      document.body.style.setProperty("--spot-x", x);
      document.body.style.setProperty("--spot-y", y);
    },
    { passive: true },
  );
}

const revealItems = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll("[data-count]");
const animatedCounters = new WeakSet();

const animateCounter = (element) => {
  if (animatedCounters.has(element) || reduceMotion) {
    element.textContent = `${formatNumber(Number(element.dataset.count))}${element.dataset.suffix || ""}`;
    return;
  }

  animatedCounters.add(element);

  const target = Number(element.dataset.count);
  const suffix = element.dataset.suffix || "";
  const duration = 1300;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);

    element.textContent = `${formatNumber(value)}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.45 },
  );

  counters.forEach((counter) => counterObserver.observe(counter));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
  counters.forEach(animateCounter);
}

document.querySelectorAll(".metric-card, .method-step, .audience-grid article, .bonus-grid article, .kit-card, .offer-box, .faq-list details").forEach((card) => {
  card.addEventListener(
    "pointermove",
    (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    },
    { passive: true },
  );
});

const heroVisual = document.querySelector(".hero-visual");

if (heroVisual && !reduceMotion) {
  heroVisual.addEventListener(
    "pointermove",
    (event) => {
      const rect = heroVisual.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      heroVisual.style.transform = `perspective(1200px) rotateY(${x * 4}deg) rotateX(${y * -4}deg)`;
    },
    { passive: true },
  );

  heroVisual.addEventListener("pointerleave", () => {
    heroVisual.style.transform = "perspective(1200px) rotateY(0deg) rotateX(0deg)";
  });
}

document.querySelectorAll("[data-accordion] details").forEach((detail) => {
  detail.addEventListener("toggle", () => {
    if (!detail.open) return;

    document.querySelectorAll("[data-accordion] details").forEach((otherDetail) => {
      if (otherDetail !== detail) otherDetail.open = false;
    });
  });
});
