/* ==========================================================================
   TEMPLATE WEBSITE - script.js
   Tanpa library. Isi file:
     1. Navigasi: dropdown interaktif (desktop & mobile), menu mobile, pencarian
     2. Galeri: carousel, titik navigasi, putar/jeda, geser sentuh
     3. Footer: akordeon di layar kecil
   ========================================================================== */

(function () {
  "use strict";

  // Definisi "mobile": harus sama dengan media query di style.css
  var NAV_MQ = "(max-width: 833px), (hover: none) and (pointer: coarse) and (max-height: 500px)";
  var PHONE_MQ = "(max-width: 734px), (hover: none) and (pointer: coarse) and (max-height: 500px)";
  var phoneQuery = window.matchMedia(PHONE_MQ);
  var listen = function (mq, fn) {
    if (mq.addEventListener) mq.addEventListener("change", fn); else mq.addListener(fn);
  };

  /* ------------------------------------------------------------------------
     1. NAVIGASI
     Kelas pada <nav class="nav">:
       is-dropdown-open  dropdown desktop terbuka
       is-menu-open      panel menu mobile terbuka
       is-submenu-open   submenu mobile terbuka
       is-search-open    flyout pencarian terbuka
     ------------------------------------------------------------------------ */
  var nav = document.querySelector(".nav");

  if (nav) {
    var navList = nav.querySelector(".nav-list");
    var menuToggle = nav.querySelector(".nav-menu-toggle");
    var backButton = nav.querySelector(".nav-back");
    var searchToggle = nav.querySelector(".nav-search-toggle");
    var searchInput = nav.querySelector(".nav-search-input");
    var curtain = nav.querySelector(".nav-curtain");
    var navTitle = nav.querySelector(".nav-bar-title");
    var root = document.documentElement;
    var mobileQuery = window.matchMedia(NAV_MQ);

    var items = Array.prototype.slice.call(nav.querySelectorAll(".nav-item"));
    var activeItem = null;
    var hoverTimer = null;
    var usesTouch = false;

    items.forEach(function (item) {
      var dd = item.querySelector(".nav-dropdown");
      if (!dd) return;
      item.classList.add("has-dropdown");
      Array.prototype.forEach.call(dd.querySelectorAll(".nav-dropdown-group"), function (g, i) {
        g.style.setProperty("--group-index", String(i));
      });
    });

    var syncLock = function () {
      root.classList.toggle("nav-locked", nav.classList.contains("is-menu-open") || nav.classList.contains("is-search-open"));
    };

    var setDropdown = function (nextItem, restoreFocus) {
      window.clearTimeout(hoverTimer);
      var prevItem = activeItem;
      if (prevItem === nextItem) return;

      var isMobile = mobileQuery.matches;
      var navHeight = nav.querySelector(".nav-bar").offsetHeight || 44;
      var prevHeight = 0;

      if (prevItem) {
        var prevDd = prevItem.querySelector(".nav-dropdown");
        var prevLink = prevItem.querySelector(".nav-link");
        if (!isMobile && prevDd && nextItem) prevHeight = prevDd.getBoundingClientRect().height;
        prevItem.classList.remove("is-open");
        if (prevLink) prevLink.setAttribute("aria-expanded", "false");
        if (prevDd) {
          prevDd.style.height = "";
          prevDd.classList.remove("is-scrollable");
        }
        if (restoreFocus && !nextItem && prevLink) prevLink.focus();
      }

      activeItem = nextItem || null;

      // Di mobile, item lain dinonaktifkan dari fokus/pembaca layar saat submenu terbuka
      items.forEach(function (it) {
        if (isMobile && activeItem && it !== activeItem) it.setAttribute("inert", "");
        else it.removeAttribute("inert");
      });

      if (activeItem) {
        var dd = activeItem.querySelector(".nav-dropdown");
        var link = activeItem.querySelector(".nav-link");
        if (link) link.setAttribute("aria-expanded", "true");

        if (isMobile) {
          activeItem.classList.add("is-open");
          nav.classList.add("is-submenu-open");
          if (navTitle && link) navTitle.textContent = link.textContent.trim();
          if (dd) {
            dd.scrollTop = 0;
            var firstLink = dd.querySelector("a");
            if (firstLink) firstLink.focus({ preventScroll: true });
          }
        } else {
          setSearch(false);
          nav.classList.add("is-dropdown-open");
          if (dd) {
            var maxH = Math.max(120, window.innerHeight - navHeight);
            var targetH = Math.min(dd.scrollHeight, maxH);
            dd.classList.toggle("is-scrollable", dd.scrollHeight > maxH);
            if (prevHeight > 0) {
              dd.style.transition = "none";
              dd.style.height = prevHeight + "px";
              void dd.offsetHeight;
              dd.style.transition = "";
            }
            activeItem.classList.add("is-open");
            dd.style.height = targetH + "px";
            dd.scrollTop = 0;
          }
        }
      } else {
        nav.classList.remove("is-dropdown-open", "is-submenu-open");
      }
    };

    var setMenu = function (open) {
      if (!open) setDropdown(null);
      nav.classList.toggle("is-menu-open", open);
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Tutup menu" : "Menu");
      syncLock();
    };

    var setSearch = function (open) {
      if (open) {
        setDropdown(null);
        setMenu(false);
      }
      nav.classList.toggle("is-search-open", open);
      searchToggle.setAttribute("aria-expanded", String(open));
      syncLock();
      if (open) window.setTimeout(function () { searchInput.focus(); }, 50);
    };

    if (navList) {
      navList.addEventListener("touchstart", function () { usesTouch = true; }, { once: true, passive: true });

      navList.addEventListener("mouseover", function (event) {
        if (mobileQuery.matches || usesTouch) return;
        var item = event.target.closest(".nav-item");
        if (!item) return;
        window.clearTimeout(hoverTimer);
        hoverTimer = window.setTimeout(function () {
          if (item.classList.contains("has-dropdown")) setDropdown(item);
          else setDropdown(null);
        }, 120);
      });

      navList.addEventListener("click", function (event) {
        // Klik tautan tujuan (bukan pembuka submenu) menutup menu/dropdown
        var target = event.target.closest(".nav-dropdown-links a, .nav-item:not(.has-dropdown) > .nav-link");
        if (target) {
          if (mobileQuery.matches) setMenu(false); else setDropdown(null);
          return;
        }
        var link = event.target.closest(".nav-link");
        if (!link) return;
        var item = link.closest(".nav-item");
        if (!item || !item.classList.contains("has-dropdown")) return;
        event.preventDefault();
        setDropdown(activeItem === item ? null : item);
      });
    }

    nav.addEventListener("mouseleave", function () {
      if (mobileQuery.matches || usesTouch) return;
      setDropdown(null);
    });

    curtain.addEventListener("mouseenter", function () {
      if (mobileQuery.matches || usesTouch || !activeItem) return;
      setDropdown(null);
    });

    nav.addEventListener("focusout", function (event) {
      if (mobileQuery.matches || !activeItem) return;
      if (event.relatedTarget && !nav.contains(event.relatedTarget)) setDropdown(null);
    });

    if (backButton) {
      backButton.addEventListener("click", function () {
        setDropdown(null, true);
      });
    }

    menuToggle.addEventListener("click", function () {
      var willOpen = !nav.classList.contains("is-menu-open");
      if (willOpen) setSearch(false);
      setMenu(willOpen);
    });

    searchToggle.addEventListener("click", function () {
      setSearch(!nav.classList.contains("is-search-open"));
    });

    // Klik area gelap menutup flyout dan dropdown
    curtain.addEventListener("click", function () {
      setSearch(false);
      setDropdown(null);
    });

    // Tutup dropdown desktop saat halaman di-scroll (kecuali di mobile/touch)
    window.addEventListener("scroll", function () {
      if (!mobileQuery.matches && !usesTouch && activeItem) setDropdown(null);
    }, { passive: true });

    // Esc menutup pencarian, dropdown, atau menu dan mengembalikan fokus
    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      if (nav.classList.contains("is-search-open")) {
        setSearch(false);
        searchToggle.focus();
      } else if (nav.classList.contains("is-dropdown-open")) {
        setDropdown(null, true);
      } else if (nav.classList.contains("is-submenu-open")) {
        setDropdown(null, true);
      } else if (nav.classList.contains("is-menu-open")) {
        setMenu(false);
        menuToggle.focus();
      }
    });

    // Klik di luar header menutup flyout pencarian dan dropdown
    document.addEventListener("click", function (event) {
      if (!nav.contains(event.target)) {
        if (nav.classList.contains("is-search-open")) setSearch(false);
        if (nav.classList.contains("is-dropdown-open")) setDropdown(null);
      }
    });

    // Menu mobile & dropdown ditutup otomatis saat melewati breakpoint desktop/mobile
    var onBreakpoint = function () {
      setDropdown(null);
      if (!mobileQuery.matches) setMenu(false);
    };
    listen(mobileQuery, onBreakpoint);
  }


  /* ------------------------------------------------------------------------
     2. GALERI
     - Titik navigasi dibuat dari jumlah .gallery-item. Label tiap titik
       diambil dari atribut data-title pada item.
     - Durasi putar otomatis: atribut data-autoplay-ms pada .gallery
       (isi 0 untuk mematikan putar otomatis).
     ------------------------------------------------------------------------ */
  var gallery = document.querySelector(".gallery");

  if (gallery) {
    var track = gallery.querySelector(".gallery-track");
    var slides = Array.prototype.slice.call(gallery.querySelectorAll(".gallery-item"));
    var dotsWrap = gallery.querySelector(".gallery-dots");
    var playButton = gallery.querySelector(".gallery-playpause");
    var duration = parseInt(gallery.getAttribute("data-autoplay-ms"), 10);
    if (isNaN(duration)) duration = 5000;

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var current = 0;
    var timer = null;
    var playing = duration > 0 && !reduceMotion;

    gallery.style.setProperty("--gallery-duration", duration + "ms");

    // Buat titik navigasi
    var dots = slides.map(function (item, index) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "gallery-dot";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "Item " + (index + 1) + ": " + (item.getAttribute("data-title") || ""));
      dot.addEventListener("click", function () { goTo(index, true); });
      dotsWrap.appendChild(dot);
      return dot;
    });

    // Mulai ulang animasi progres pada titik aktif
    var restartProgress = function () {
      gallery.classList.remove("is-playing");
      void gallery.offsetWidth;          // paksa browser menghitung ulang agar animasi mulai dari nol
      if (playing) gallery.classList.add("is-playing");
    };

    var schedule = function () {
      window.clearTimeout(timer);
      if (playing && gallery.offsetParent !== null) timer = window.setTimeout(function () { goTo(current + 1, false); }, duration);
    };

    var goTo = function (index, fromUser) {
      current = (index + slides.length) % slides.length;
      track.style.transform = "translateX(" + (-100 * current) + "%)";

      slides.forEach(function (item, i) {
        // inert mencegah slide yang tidak terlihat bisa difokus atau dibaca pembaca layar
        if (i === current) item.removeAttribute("inert"); else item.setAttribute("inert", "");
        dots[i].setAttribute("aria-selected", String(i === current));
        dots[i].setAttribute("tabindex", i === current ? "0" : "-1");
      });

      restartProgress();
      schedule();
      if (fromUser) dots[current].focus();
    };

    var updatePlayButton = function () {
      playButton.setAttribute("aria-label", playing ? "Jeda galeri" : "Putar galeri");
    };

    playButton.addEventListener("click", function () {
      playing = !playing;
      updatePlayButton();
      restartProgress();
      schedule();
    });

    // Panah kiri/kanan berpindah antar titik
    dotsWrap.addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight") { event.preventDefault(); goTo(current + 1, true); }
      if (event.key === "ArrowLeft")  { event.preventDefault(); goTo(current - 1, true); }
    });

    // Geser sentuh: geser lebih dari 50px untuk berpindah slide
    var startX = null;
    gallery.addEventListener("touchstart", function (event) { startX = event.touches[0].clientX; }, { passive: true });
    gallery.addEventListener("touchend", function (event) {
      if (startX === null) return;
      var delta = event.changedTouches[0].clientX - startX;
      startX = null;
      if (Math.abs(delta) > 50) goTo(current + (delta < 0 ? 1 : -1), false);
    });

    // Putar otomatis berhenti saat tab tidak terlihat
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) window.clearTimeout(timer); else schedule();
    });

    listen(phoneQuery, schedule);   // galeri desktop berhenti saat disembunyikan di ponsel
    updatePlayButton();
    goTo(0, false);
  }


  /* ------------------------------------------------------------------------
     2b. GALERI MOBILE (.gallery-mobile, hanya tampil di ponsel)
     Geser memakai scroll-snap CSS. Script ini mengatur titik, tombol
     putar/jeda, dan putar otomatis (jeda saat disentuh/difokus/tab tersembunyi).
     ------------------------------------------------------------------------ */
  var gm = document.querySelector(".gallery-mobile");

  if (gm) {
    var gmTrack = gm.querySelector(".gm-track");
    var gmSlides = Array.prototype.slice.call(gm.querySelectorAll(".gm-slide"));
    var gmDots = gm.querySelector(".gm-dots");
    var gmPlay = gm.querySelector(".gm-playpause");
    var gmMs = parseInt(gm.getAttribute("data-autoplay-ms"), 10);
    if (isNaN(gmMs)) gmMs = 5000;
    var gmReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    var gmIndex = 0, gmTimer = null, gmHold = false, gmRaf = 0, gmResize = null;
    var gmPlaying = gmMs > 0 && !gmReduce.matches;

    var gmLeft = function (i) {
      var s = gmSlides[i];
      return s.offsetLeft - (gmTrack.clientWidth - s.offsetWidth) / 2;
    };

    var gmButtons = gmSlides.map(function (slide, i) {
      slide.setAttribute("role", "group");
      slide.setAttribute("aria-roledescription", "slide");
      slide.setAttribute("aria-label", (i + 1) + " dari " + gmSlides.length);
      var b = document.createElement("button");
      b.type = "button";
      b.className = "gm-dot";
      b.setAttribute("aria-label", "Slide " + (i + 1) + ": " + (slide.getAttribute("data-title") || ""));
      b.addEventListener("click", function () { gmGo(i); });
      gmDots.appendChild(b);
      return b;
    });

    var gmMark = function (i) {
      gmIndex = i;
      gmButtons.forEach(function (b, n) { b.setAttribute("aria-current", String(n === i)); });
    };

    var gmGo = function (i) {
      i = (i + gmSlides.length) % gmSlides.length;
      gmTrack.scrollTo({ left: gmLeft(i), behavior: gmReduce.matches ? "auto" : "smooth" });
      gmMark(i);
    };

    // Slide aktif = slide yang tengahnya paling dekat dengan tengah track
    gmTrack.addEventListener("scroll", function () {
      if (gmRaf) return;
      gmRaf = window.requestAnimationFrame(function () {
        gmRaf = 0;
        var mid = gmTrack.scrollLeft + gmTrack.clientWidth / 2, best = 0, bestD = Infinity;
        gmSlides.forEach(function (s, n) {
          var d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - mid);
          if (d < bestD) { bestD = d; best = n; }
        });
        if (best !== gmIndex) gmMark(best);
      });
    }, { passive: true });

    var gmSchedule = function () {
      window.clearTimeout(gmTimer);
      if (gmPlaying && !gmHold && !document.hidden && gm.offsetParent !== null) {
        gmTimer = window.setTimeout(function () { gmGo(gmIndex + 1); gmSchedule(); }, gmMs);
      }
    };

    var gmSync = function () {
      gm.classList.toggle("is-paused", !gmPlaying);
      gmPlay.setAttribute("aria-label", gmPlaying ? "Jeda galeri" : "Putar galeri");
      gmTrack.setAttribute("aria-live", gmPlaying ? "off" : "polite");
    };

    gmPlay.addEventListener("click", function () { gmPlaying = !gmPlaying; gmSync(); gmSchedule(); });
    if (gmMs <= 0) gmPlay.hidden = true;

    var gmPause = function () { gmHold = true; gmSchedule(); };
    var gmResume = function () { gmHold = false; gmSchedule(); };
    gm.addEventListener("touchstart", gmPause, { passive: true });
    gm.addEventListener("touchend", gmResume, { passive: true });
    gm.addEventListener("touchcancel", gmResume, { passive: true });
    gm.addEventListener("focusin", gmPause);
    gm.addEventListener("focusout", gmResume);

    document.addEventListener("visibilitychange", gmSchedule);
    listen(phoneQuery, gmSchedule);

    // Putar layar/ubah ukuran: sejajarkan ulang slide aktif tanpa animasi
    window.addEventListener("resize", function () {
      window.clearTimeout(gmResize);
      gmResize = window.setTimeout(function () { gmTrack.scrollLeft = gmLeft(gmIndex); }, 150);
    });

    gmMark(0);
    gmSync();
    gmSchedule();
  }


  /* ------------------------------------------------------------------------
     3. FOOTER (akordeon)
     Aktif hanya di layar <= 734px. Di desktop tombol judul tidak berfungsi
     (diatur CSS) dan semua daftar tampil.
     ------------------------------------------------------------------------ */
  var smallQuery = window.matchMedia("(max-width: 734px)");

  Array.prototype.forEach.call(document.querySelectorAll(".footer-section"), function (section) {
    var button = section.querySelector(".footer-section-button");
    if (!button) return;

    button.addEventListener("click", function () {
      if (!smallQuery.matches) return;
      var open = !section.classList.contains("is-open");
      section.classList.toggle("is-open", open);
      button.setAttribute("aria-expanded", String(open));
    });
  });

})();
