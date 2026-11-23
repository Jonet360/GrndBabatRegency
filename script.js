/* ==========================================================================
   TEMPLATE WEBSITE - script.js
   Tanpa library. Isi file:
     1. Navigasi: dropdown interaktif (desktop & mobile), menu mobile, pencarian
     2. Galeri: carousel, titik navigasi, putar/jeda, geser sentuh
     3. Footer: akordeon di layar kecil
   ========================================================================== */

(function () {
  "use strict";

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
    var root = document.documentElement;
    var mobileQuery = window.matchMedia("(max-width: 833px)");

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

      if (activeItem) {
        var dd = activeItem.querySelector(".nav-dropdown");
        var link = activeItem.querySelector(".nav-link");
        if (link) link.setAttribute("aria-expanded", "true");

        if (isMobile) {
          activeItem.classList.add("is-open");
          nav.classList.add("is-submenu-open");
          if (dd) dd.scrollTop = 0;
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
    if (mobileQuery.addEventListener) mobileQuery.addEventListener("change", onBreakpoint);
    else mobileQuery.addListener(onBreakpoint);
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
    var items = Array.prototype.slice.call(gallery.querySelectorAll(".gallery-item"));
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
    var dots = items.map(function (item, index) {
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
      if (playing) timer = window.setTimeout(function () { goTo(current + 1, false); }, duration);
    };

    var goTo = function (index, fromUser) {
      current = (index + items.length) % items.length;
      track.style.transform = "translateX(" + (-100 * current) + "%)";

      items.forEach(function (item, i) {
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

    updatePlayButton();
    goTo(0, false);
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
