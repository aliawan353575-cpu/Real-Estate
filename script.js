(function () {
  "use strict";

  /* ---------- Dev-facing image warnings ----------
     The on-page fallback (.img-placeholder) keeps the UI polished for
     visitors, but a missing image is still a real issue during
     development — surface it in the console so it isn't silently lost. */
  document.querySelectorAll(".img-el").forEach(function (img) {
    img.addEventListener("error", function () {
      console.warn("[Ferdows] Image failed to load, showing placeholder:", img.getAttribute("src"));
    });
  });

  /* ---------- Sticky header ---------- */
  var header = document.getElementById("site-header");
  function onScroll() {
    if (window.scrollY > 20) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
    var backTop = document.getElementById("back-to-top");
    if (backTop) backTop.hidden = window.scrollY < 500;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var menuToggle = document.getElementById("menu-toggle");
  var mobileNav = document.getElementById("mobile-nav");

  function closeMenu() {
    mobileNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
  }
  function openMenu() {
    mobileNav.classList.add("is-open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close menu");
  }
  menuToggle.addEventListener("click", function () {
    var isOpen = mobileNav.classList.contains("is-open");
    if (isOpen) { closeMenu(); } else { openMenu(); }
  });
  mobileNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  /* ---------- Active navigation on scroll ---------- */
  var sections = document.querySelectorAll("main section[id]");
  var navLinks = document.querySelectorAll(".main-nav a, .mobile-nav a");

  function setActiveNav() {
    var scrollPos = window.scrollY + 120;
    var currentId = null;
    sections.forEach(function (sec) {
      if (sec.offsetTop <= scrollPos) currentId = sec.id;
    });
    navLinks.forEach(function (link) {
      var href = link.getAttribute("href");
      if (href === "#" + currentId) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }
  window.addEventListener("scroll", setActiveNav, { passive: true });
  setActiveNav();

  /* ---------- Back to top ---------- */
  var backTop = document.getElementById("back-to-top");
  if (backTop) {
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Service filtering ---------- */
  var serviceFilterBtns = document.querySelectorAll("[data-filter]");
  var serviceCards = document.querySelectorAll(".service-card");

  serviceFilterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      serviceFilterBtns.forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");

      var filter = btn.getAttribute("data-filter");
      serviceCards.forEach(function (card) {
        var match = filter === "all" || card.getAttribute("data-category") === filter;
        card.hidden = !match;
      });
    });
  });

  /* ---------- Gallery filtering ---------- */
  var galleryFilterBtns = document.querySelectorAll("[data-gfilter]");
  var galleryItems = document.querySelectorAll(".gallery-item");

  galleryFilterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      galleryFilterBtns.forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");

      var filter = btn.getAttribute("data-gfilter");
      galleryItems.forEach(function (item) {
        var match = filter === "all" || item.getAttribute("data-gcat") === filter;
        item.hidden = !match;
      });
    });
  });

  /* ---------- Lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  var lbImage = document.getElementById("lb-image");
  var lbCaption = document.getElementById("lb-caption");
  var lbClose = document.getElementById("lb-close");
  var lbPrev = document.getElementById("lb-prev");
  var lbNext = document.getElementById("lb-next");
  var galleryList = Array.prototype.slice.call(galleryItems);
  var currentIndex = 0;
  var lastFocusedEl = null;

  function visibleGalleryItems() {
    return galleryList.filter(function (item) { return !item.hidden; });
  }

  function openLightbox(index) {
    var visible = visibleGalleryItems();
    if (!visible.length) return;
    currentIndex = index;
    lastFocusedEl = document.activeElement;
    showImage(visible);
    lightbox.hidden = false;
    lbClose.focus();
    document.body.style.overflow = "hidden";
  }

  function showImage(visible) {
    var item = visible[currentIndex];
    var img = item.querySelector("img");
    lbImage.classList.remove("is-broken");
    lbImage.src = img.src;
    lbImage.alt = img.alt;
    lbCaption.textContent = item.getAttribute("data-caption") || "";
    if (img.classList.contains("is-broken")) {
      lbImage.classList.add("is-broken");
    }
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  function showNext(dir) {
    var visible = visibleGalleryItems();
    currentIndex = (currentIndex + dir + visible.length) % visible.length;
    showImage(visible);
  }

  galleryItems.forEach(function (item, idx) {
    item.addEventListener("click", function () {
      var visible = visibleGalleryItems();
      var visIdx = visible.indexOf(item);
      openLightbox(visIdx >= 0 ? visIdx : 0);
    });
  });

  lbClose.addEventListener("click", closeLightbox);
  lbPrev.addEventListener("click", function () { showNext(-1); });
  lbNext.addEventListener("click", function () { showNext(1); });

  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", function (e) {
    if (lightbox.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") showNext(1);
    if (e.key === "ArrowLeft") showNext(-1);
  });

  /* ---------- FAQ accordion ---------- */
  var accordionTriggers = document.querySelectorAll(".accordion-trigger");
  accordionTriggers.forEach(function (trigger) {
    var panel = trigger.nextElementSibling;
    trigger.addEventListener("click", function () {
      var isOpen = trigger.getAttribute("aria-expanded") === "true";

      accordionTriggers.forEach(function (t) {
        t.setAttribute("aria-expanded", "false");
        t.nextElementSibling.style.maxHeight = null;
      });

      if (!isOpen) {
        trigger.setAttribute("aria-expanded", "true");
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });

  /* ---------- Scroll reveal ---------- */
  var revealTargets = document.querySelectorAll(
    ".intro-grid, .service-grid, .featured, .gallery-grid, .reviews-inner, .booking-inner, .location-grid, .accordion, .final-cta-content"
  );
  revealTargets.forEach(function (el) { el.classList.add("reveal"); });

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealTargets.forEach(function (el) { observer.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Smooth scroll for in-page links (with header offset) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var headerHeight = header.offsetHeight;
      var top = target.getBoundingClientRect().top + window.scrollY - headerHeight + 1;
      window.scrollTo({ top: top, behavior: "smooth" });
    });
  });
})();
