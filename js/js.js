document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  const topNav = document.querySelector(".top-nav");
  const navBrand = document.querySelector(".top-nav .brand");
  const scrollProgress = document.getElementById("scrollProgress");
  const scrollTicks = document.getElementById("scrollTicks");
  const cursor = document.getElementById("cursor");
  const cursorLabel = document.getElementById("cursorLabel");
  const cursorTrail = document.getElementById("cursorTrail");
  const spotlight = document.getElementById("spotlight");
  const marqueeWrap = document.querySelector(".header__marq-wrapp");
  const hero = document.querySelector(".header");
  const heroImg = document.querySelector(".header__img");
  const heroDust = document.getElementById("heroDust");

  let lastScrollY = window.scrollY;
  let scrollTicking = false;

  if (navToggle) {
    navToggle.addEventListener("click", function () {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!expanded));
      navLinks.classList.toggle("open");
    });
  }

  if (navBrand) {
    navBrand.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
      navLinks.classList.remove("open");
      navToggle && navToggle.setAttribute("aria-expanded", "false");
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      const target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      const navOffset = topNav ? topNav.getBoundingClientRect().height + 28 : 104;
      const y = target.getBoundingClientRect().top + window.pageYOffset - navOffset;
      window.scrollTo({ top: Math.max(0, y), behavior: prefersReduced ? "auto" : "smooth" });
      navLinks.classList.remove("open");
      navToggle && navToggle.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("click", function (e) {
    if (!navLinks || !navToggle || !topNav) return;
    if (!topNav.contains(e.target)) {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && navLinks && navToggle) {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });

  if (marqueeWrap && !marqueeWrap.dataset.loopReady) {
    const seed = Array.from(marqueeWrap.children).map(function (node) {
      return node.cloneNode(true);
    });
    let guard = 0;
    while (marqueeWrap.scrollWidth < window.innerWidth * 1.5 && guard < 20) {
      seed.forEach(function (node) {
        marqueeWrap.appendChild(node.cloneNode(true));
      });
      guard += 1;
    }
    const firstRun = Array.from(marqueeWrap.children).map(function (node) {
      return node.cloneNode(true);
    });
    firstRun.forEach(function (node) {
      marqueeWrap.appendChild(node);
    });
    marqueeWrap.dataset.loopReady = "true";
  }

  function handleScroll() {
    const h = document.documentElement;
    const scrollable = h.scrollHeight - h.clientHeight;
    const pct = scrollable > 0 ? (h.scrollTop / scrollable) * 100 : 0;
    if (scrollProgress) scrollProgress.style.width = pct + "%";

    if (scrollTicks) {
      Array.from(scrollTicks.children).forEach(function (tick, i) {
        tick.classList.toggle("active", pct >= (i + 1) * 20);
      });
    }

    if (marqueeWrap) {
      const delta = window.scrollY - lastScrollY;
      marqueeWrap.classList.toggle("is-reverse", delta < 0);
    }
    if (topNav) {
      topNav.classList.toggle("nav-compact", window.scrollY > 30);
    }

    lastScrollY = window.scrollY;
    scrollTicking = false;
  }

  window.addEventListener("scroll", function () {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(handleScroll);
  }, { passive: true });
  handleScroll();

  if (!prefersReduced && cursor) {
    let cx = window.innerWidth / 2;
    let cy = window.innerHeight / 2;
    let tx = cx;
    let ty = cy;
    const trail = [];
    const trailCount = 8;

    for (let i = 0; i < trailCount; i += 1) {
      const dot = document.createElement("span");
      dot.className = "cursor-trail-dot";
      cursorTrail && cursorTrail.appendChild(dot);
      trail.push(dot);
    }

    document.addEventListener("mousemove", function (e) {
      tx = e.clientX;
      ty = e.clientY;
      if (spotlight) {
        spotlight.style.setProperty("--mx", e.clientX + "px");
        spotlight.style.setProperty("--my", e.clientY + "px");
      }
      if (cursorLabel) {
        cursorLabel.style.transform = "translate(" + e.clientX + "px," + e.clientY + "px)";
      }
    });

    function animateCursor() {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      cursor.style.transform = "translate(" + (cx - 10) + "px," + (cy - 10) + "px)";
      trail.forEach(function (dot, i) {
        const f = (i + 1) / trailCount;
        dot.style.transform = "translate(" + (cx - f * (cx - tx) - 3) + "px," + (cy - f * (cy - ty) - 3) + "px)";
        dot.style.opacity = String(1 - f);
      });
      requestAnimationFrame(animateCursor);
    }
    requestAnimationFrame(animateCursor);

    document.querySelectorAll("a, button").forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        cursor.classList.add("active");
      });
      el.addEventListener("mouseleave", function () {
        cursor.classList.remove("active");
        cursorLabel && cursorLabel.classList.remove("show");
      });
    });
  }

  if (hero && heroImg && !prefersReduced) {
    hero.addEventListener("mousemove", function (e) {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      heroImg.style.transform = "translateY(-50%) translate(" + (x * 16) + "px," + (y * 10) + "px)";
    });
    hero.addEventListener("mouseleave", function () {
      heroImg.style.transform = "translateY(-50%)";
    });
  }

  if (heroDust && !prefersReduced) {
    for (let i = 0; i < 18; i += 1) {
      const p = document.createElement("span");
      p.style.left = Math.random() * 100 + "%";
      p.style.top = 70 + Math.random() * 30 + "%";
      p.style.animationDelay = (Math.random() * 10) + "s";
      p.style.animationDuration = (8 + Math.random() * 8) + "s";
      heroDust.appendChild(p);
    }
  }

  const revealItems = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  }, { threshold: 0.12 });
  revealItems.forEach(function (item) {
    revealObserver.observe(item);
  });

  const sectionRevealItems = document.querySelectorAll(".main .section");
  const sectionRevealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) entry.target.classList.add("section-visible");
    });
  }, { threshold: 0.2 });
  sectionRevealItems.forEach(function (item) {
    sectionRevealObserver.observe(item);
  });

  const sections = document.querySelectorAll("main section[id], header[id]");
  const navAnchors = document.querySelectorAll(".nav-links a");
  const sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      navAnchors.forEach(function (a) {
        a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id);
      });
    });
  }, { threshold: 0.5 });
  sections.forEach(function (s) {
    sectionObserver.observe(s);
  });
});
