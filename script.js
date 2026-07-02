const siteHeader = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector("[data-nav-links]");
const themeToggle = document.querySelector(".theme-toggle");
const links = document.querySelectorAll(".nav-links a");
const sections = document.querySelectorAll("main section[id]");
const revealItems = document.querySelectorAll(".reveal");
const faqItems = document.querySelectorAll(".faq-item");
const compareSliders = document.querySelectorAll(".compare-slider");
const animatedNumbers = document.querySelectorAll("[data-count]");
const tiltCards = document.querySelectorAll(".service-card, .pricing-card");
const storedTheme = localStorage.getItem("sourceCleaningTheme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const setTheme = (theme) => {
  const isDark = theme === "dark";

  document.body.classList.toggle("dark-mode", isDark);
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  localStorage.setItem("sourceCleaningTheme", theme);
};

setTheme(storedTheme || (prefersDark ? "dark" : "light"));

const closeMobileNav = () => {
  navLinks.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Open menu");
};

navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
});

links.forEach((link) => {
  link.addEventListener("click", closeMobileNav);
});

themeToggle.addEventListener("click", () => {
  const nextTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";
  setTheme(nextTheme);
});

const updateScrollEffects = () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  const heroOffset = Math.min(window.scrollY * 0.12, 80);

  document.documentElement.style.setProperty("--scroll-progress", `${(progress * 100).toFixed(2)}%`);
  document.documentElement.style.setProperty("--hero-shift", `${heroOffset}px`);
  siteHeader.classList.toggle("scrolled", window.scrollY > 12);
};

window.addEventListener("scroll", () => {
  window.requestAnimationFrame(updateScrollEffects);
});

updateScrollEffects();

if (!prefersReducedMotion) {
  window.addEventListener("pointermove", (event) => {
    document.documentElement.style.setProperty("--cursor-x", `${event.clientX}px`);
    document.documentElement.style.setProperty("--cursor-y", `${event.clientY}px`);
    document.documentElement.style.setProperty("--cursor-opacity", "1");
  });

  window.addEventListener("pointerleave", () => {
    document.documentElement.style.setProperty("--cursor-opacity", "0");
  });
}

const animateNumber = (element) => {
  const target = Number(element.dataset.count);
  const duration = 1100;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);

    element.textContent = Math.round(target * eased);

    if (progress < 1) {
      window.requestAnimationFrame(tick);
    }
  };

  window.requestAnimationFrame(tick);
};

const numberObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      animateNumber(entry.target);
      numberObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.55 }
);

animatedNumbers.forEach((number) => numberObserver.observe(number));

if (!prefersReducedMotion) {
  tiltCards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      card.style.setProperty("--tilt-x", `${(-y * 5).toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${(x * 5).toFixed(2)}deg`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    });
  });
}

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      links.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
);

sections.forEach((section) => navObserver.observe(section));

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index * 45, 240)}ms`;
  revealObserver.observe(item);
});

faqItems.forEach((item) => {
  const button = item.querySelector("button");

  button.addEventListener("click", () => {
    const isOpen = item.classList.toggle("open");
    button.setAttribute("aria-expanded", String(isOpen));
  });
});

compareSliders.forEach((slider) => {
  const input = slider.querySelector('input[type="range"]');

  const setSliderPosition = (value) => {
    slider.style.setProperty("--position", value);
    input.value = value;
  };

  const updateFromPointer = (event) => {
    const rect = slider.getBoundingClientRect();
    const x = Math.min(Math.max(event.clientX - rect.left, 0), rect.width);
    const value = Math.round((x / rect.width) * 100);

    setSliderPosition(value);
  };

  input.addEventListener("input", (event) => {
    setSliderPosition(event.target.value);
  });

  slider.addEventListener("pointerdown", (event) => {
    slider.setPointerCapture(event.pointerId);
    updateFromPointer(event);
  });

  slider.addEventListener("pointermove", (event) => {
    if (event.buttons !== 1) return;
    updateFromPointer(event);
  });
});
