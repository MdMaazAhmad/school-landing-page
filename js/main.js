 (function () {
    "use strict";
  
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  
    function addDrag(el, opts) {
      var startX = 0, startY = 0, dragging = false, moved = false;
      var threshold = opts.threshold || 40;
  
      function down(e) {
        dragging = true; moved = false;
        startX = e.clientX; startY = e.clientY;
        if (opts.onStart) opts.onStart();
      }
      function move(e) {
        if (!dragging) return;
        var dx = e.clientX - startX;
        var dy = e.clientY - startY;
        if (Math.abs(dx) > Math.abs(dy)) {
          moved = true;
          if (opts.onMove) opts.onMove(dx);
        }
      }
      function up(e) {
        if (!dragging) return;
        dragging = false;
        var dx = e.clientX - startX;
        if (opts.onEnd) opts.onEnd(dx, Math.abs(dx) > threshold);
      }
  
      el.addEventListener("pointerdown", down);
      el.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      el.addEventListener("pointercancel", up);
      el.addEventListener("dragstart", function (e) { e.preventDefault(); });
      return function isMoved() { return moved; };
    }
  
    (function heroGallery() {
      var root = document.querySelector(".gallery");
      if (!root) return;
  
      var track = root.querySelector("[data-gallery-track]");
      var prev = root.querySelector("[data-gallery-prev]");
      var next = root.querySelector("[data-gallery-next]");
      var toggle = root.querySelector("[data-gallery-toggle]");
      if (!track) return;
  
      var offset = 0;
      var dragStartOffset = 0;
  
      function step() {
        var col = track.querySelector(".gallery__col");
        if (!col) return 220;
        var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 12;
        return col.getBoundingClientRect().width + gap;
      }
      function maxOffset() {
        return Math.max(0, track.scrollWidth - root.querySelector(".gallery__viewport").clientWidth);
      }
      function clamp(v) { return Math.min(0, Math.max(-maxOffset(), v)); }
  
      function apply(animate) {
        track.style.transition = animate ? "transform 0.45s cubic-bezier(.22,.61,.36,1)" : "none";
        track.style.transform = "translateX(" + offset + "px)";
        updateButtons();
      }
      function updateButtons() {
        var max = maxOffset();
        var atStart = offset >= -1;
        var atEnd = offset <= -max + 1 || max === 0;
        if (prev) prev.disabled = atStart;
        if (next) next.disabled = atEnd;
      }
  
      if (prev) prev.addEventListener("click", function () { offset = clamp(offset + step()); apply(true); });
      if (next) next.addEventListener("click", function () { offset = clamp(offset - step()); apply(true); });
 
      addDrag(track, {
        onStart: function () { dragStartOffset = offset; track.classList.add("is-grabbing"); },
        onMove: function (dx) { offset = clamp(dragStartOffset + dx); apply(false); },
        onEnd: function (dx, passed) {
          track.classList.remove("is-grabbing");
          if (passed) { offset = clamp(dragStartOffset + (dx < 0 ? -step() : step())); }
          else { offset = clamp(dragStartOffset); }
          apply(true);
        }
      });
  
      root.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") { e.preventDefault(); if (next) next.click(); }
        else if (e.key === "ArrowLeft") { e.preventDefault(); if (prev) prev.click(); }
      });
  
      if (toggle) {
        toggle.addEventListener("click", function () {
          var paused = root.classList.toggle("is-paused");
          toggle.setAttribute("aria-pressed", String(paused));
          toggle.setAttribute("aria-label", paused ? "Play photo animation" : "Pause photo animation");
        });
      }
  
      if (reduceMotion) {
        root.classList.add("is-paused");
        if (toggle) {
          toggle.setAttribute("aria-pressed", "true");
          toggle.setAttribute("aria-label", "Play photo animation");
        }
      }
  
      window.addEventListener("resize", function () { offset = clamp(offset); apply(false); });
      apply(false);
    })();

    (function marquee() {
      var root = document.querySelector("[data-marquee]");
      if (!root) return;
      document.addEventListener("visibilitychange", function () {
        root.setAttribute("data-paused", document.hidden ? "true" : "false");
      });
    })();
  
    (function chooseSlider() {
      var root = document.querySelector("[data-cards]");
      if (!root) return;
      var track = root.querySelector("[data-cards-track]");
      var dotsWrap = root.querySelector("[data-cards-dots]");
      if (!track || !dotsWrap) return;
      var cards = Array.prototype.slice.call(track.children);
  
      cards.forEach(function (card, i) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "choose__dot";
        dot.setAttribute("role", "tab");
        dot.setAttribute("aria-label", "Go to slide " + (i + 1));
        dot.setAttribute("aria-selected", i === 0 ? "true" : "false");
        dot.addEventListener("click", function () {
          track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: reduceMotion ? "auto" : "smooth" });
        });
        dotsWrap.appendChild(dot);
      });
      var dots = Array.prototype.slice.call(dotsWrap.children);
  
      function setActive(idx) {
        dots.forEach(function (d, i) { d.setAttribute("aria-selected", i === idx ? "true" : "false"); });
      }
  
      var raf;
      track.addEventListener("scroll", function () {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          var center = track.scrollLeft + track.clientWidth / 2;
          var best = 0, bestDist = Infinity;
          cards.forEach(function (card, i) {
            var c = card.offsetLeft + card.offsetWidth / 2 - track.offsetLeft;
            var dist = Math.abs(c - center);
            if (dist < bestDist) { bestDist = dist; best = i; }
          });
          setActive(best);
        });
      }, { passive: true });
    })();
  
  (function exhibitionSlider() {
    var root = document.querySelector("[data-exh]");
    if (!root) return;
    var track = root.querySelector("[data-exh-track]");
    var prev = root.querySelector("[data-exh-prev]");
    var next = root.querySelector("[data-exh-next]");
    if (!track || track.children.length < 2) return;

    var animating = false;

    function stepPx() {
      var first = track.children[0];
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 16;
      return first.getBoundingClientRect().width + gap;
    }

    function goNext() {
      if (animating) return;
      if (reduceMotion) { track.appendChild(track.children[0]); return; }
      animating = true;
      track.style.transition = "";
      track.style.transform = "translateX(" + (-stepPx()) + "px)";
      var done = function () {
        track.removeEventListener("transitionend", done);
        track.style.transition = "none";
        track.appendChild(track.children[0]);     
        track.style.transform = "translateX(0)";
        void track.offsetWidth;                    
        track.style.transition = "";
        animating = false;
      };
      track.addEventListener("transitionend", done);
    }

    function goPrev() {
      if (animating) return;
      if (reduceMotion) { track.insertBefore(track.children[track.children.length - 1], track.children[0]); return; }
      animating = true;
      track.style.transition = "none";
      track.insertBefore(track.children[track.children.length - 1], track.children[0]);
      track.style.transform = "translateX(" + (-stepPx()) + "px)";
      void track.offsetWidth;
      track.style.transition = "";
      track.style.transform = "translateX(0)";
      var done = function () { track.removeEventListener("transitionend", done); animating = false; };
      track.addEventListener("transitionend", done);
    }

    if (prev) prev.addEventListener("click", function () { goPrev(); restart(); });
    if (next) next.addEventListener("click", function () { goNext(); restart(); });

    root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); goNext(); restart(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); restart(); }
    });

  
    var startX = 0, dragging = false;
    track.addEventListener("pointerdown", function (e) { dragging = true; startX = e.clientX; });
    window.addEventListener("pointerup", function (e) {
      if (!dragging) return; dragging = false;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 50) { (dx < 0 ? goNext : goPrev)(); restart(); }
    });

    var timer = null;
    function startAuto() { if (reduceMotion) return; stopAuto(); timer = setInterval(goNext, 4500); }
    function stopAuto() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stopAuto(); startAuto(); }

    root.addEventListener("mouseenter", stopAuto);
    root.addEventListener("focusin", stopAuto);
    root.addEventListener("mouseleave", startAuto);

    startAuto();
  })();
  
    (function header() {
      var header = document.querySelector(".header");
      if (!header) return;
      var ticking = false;
      function update() {
        header.classList.toggle("header--scrolled", window.scrollY > 30);
        ticking = false;
      }
      window.addEventListener("scroll", function () {
        if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
      }, { passive: true });
      update();
    })();
  
  })();