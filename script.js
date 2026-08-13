(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------ */
  /* Nav: scroll shadow, mobile toggle, active link                      */
  /* ------------------------------------------------------------------ */
  var nav = document.getElementById("nav");
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");

  function onScroll() {
    if (!nav) return;
    if (window.scrollY > 8) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      navToggle.classList.toggle("open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        navLinks.classList.remove("open");
        navToggle.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  var sectionLinks = document.querySelectorAll(".nav-link[href*='#']");
  var sections = [];
  sectionLinks.forEach(function (link) {
    var id = link.getAttribute("href").split("#")[1];
    var el = document.getElementById(id);
    if (el) sections.push({ id: id, el: el, link: link });
  });
  if (sections.length && "IntersectionObserver" in window) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var match = sections.find(function (s) { return s.el === entry.target; });
          if (!match) return;
          if (entry.isIntersecting) {
            sections.forEach(function (s) { s.link.classList.remove("active"); });
            match.link.classList.add("active");
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    sections.forEach(function (s) { navObserver.observe(s.el); });
  }

  /* ------------------------------------------------------------------ */
  /* Scroll reveal                                                       */
  /* ------------------------------------------------------------------ */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ------------------------------------------------------------------ */
  /* Animated stat counters                                              */
  /* ------------------------------------------------------------------ */
  var counters = document.querySelectorAll(".stat-num[data-count]");
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var prefix = el.getAttribute("data-prefix") || "";
    var decimals = (el.getAttribute("data-count").split(".")[1] || "").length;
    if (reduceMotion) {
      el.textContent = prefix + target + suffix;
      return;
    }
    var duration = 1200;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var val = target * eased;
      el.textContent = prefix + val.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (counters.length && "IntersectionObserver" in window) {
    var counterObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach(function (el) { counterObserver.observe(el); });
  }

  /* ------------------------------------------------------------------ */
  /* Gene cards — expand on click / keyboard                             */
  /* ------------------------------------------------------------------ */
  var geneCards = document.querySelectorAll(".gene-card");
  geneCards.forEach(function (card) {
    function toggle() {
      var isOpen = card.classList.toggle("open");
      card.setAttribute("aria-expanded", isOpen ? "true" : "false");
      var more = card.querySelector(".gene-more");
      if (more) more.textContent = isOpen ? "− collapse" : "+ read more";
    }
    card.addEventListener("click", toggle);
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
  });

  /* ------------------------------------------------------------------ */
  /* Genome-browser sequence track (hero canvas)                         */
  /* ------------------------------------------------------------------ */
  var canvas = document.getElementById("sequenceCanvas");
  if (canvas) {
    var ctx = canvas.getContext("2d");
    var bases = ["A", "T", "C", "G"];
    var baseColor = { A: "#2DD4C4", T: "#8B7CF6", C: "#F0A857", G: "#EF6F8E" };
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var colWidth = 16;
    var offset = 0;
    var seq = [];
    var highlightIndex = 0;

    function seedSequence(count) {
      seq = [];
      for (var i = 0; i < count; i++) {
        seq.push(bases[Math.floor(Math.random() * bases.length)]);
      }
      highlightIndex = Math.floor(count * 0.62);
    }

    function resize() {
      var rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var cols = Math.ceil(rect.width / colWidth) + 6;
      seedSequence(cols);
    }

    function draw() {
      var rect = canvas.getBoundingClientRect();
      var w = rect.width, h = rect.height;
      ctx.clearRect(0, 0, w, h);

      var axisY = h * 0.62;
      ctx.strokeStyle = "rgba(201,211,224,0.14)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, axisY);
      ctx.lineTo(w, axisY);
      ctx.stroke();

      ctx.font = "12px 'IBM Plex Mono', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (var i = 0; i < seq.length; i++) {
        var x = i * colWidth - offset;
        if (x < -colWidth || x > w + colWidth) continue;
        var isHi = i === highlightIndex || i === highlightIndex + 7;
        var letter = seq[i];
        var color = baseColor[letter];

        // tick
        ctx.strokeStyle = isHi ? color : "rgba(201,211,224,0.18)";
        ctx.lineWidth = isHi ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(x, axisY - (isHi ? 14 : 8));
        ctx.lineTo(x, axisY + (isHi ? 14 : 8));
        ctx.stroke();

        if (isHi) {
          ctx.save();
          ctx.shadowColor = color;
          ctx.shadowBlur = 10;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(x, axisY, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        ctx.fillStyle = isHi ? color : "rgba(201,211,224,0.32)";
        ctx.fillText(letter, x, axisY - 24);
      }

      // baseline coordinate ticks label
      ctx.fillStyle = "rgba(201,211,224,0.3)";
      ctx.font = "10px 'IBM Plex Mono', monospace";
      ctx.textAlign = "left";
      ctx.fillText("5\u2032", 6, axisY + 26);
      ctx.textAlign = "right";
      ctx.fillText("3\u2032", w - 6, axisY + 26);
    }

    function loop() {
      offset += 0.35;
      if (offset >= colWidth) {
        offset = 0;
        seq.shift();
        seq.push(bases[Math.floor(Math.random() * bases.length)]);
        highlightIndex = Math.max(0, highlightIndex - 1);
        if (highlightIndex <= 2) {
          highlightIndex = Math.floor(seq.length * 0.62);
        }
      }
      draw();
      if (!reduceMotion) requestAnimationFrame(loop);
    }

    resize();
    draw();
    window.addEventListener("resize", resize);
    if (!reduceMotion) requestAnimationFrame(loop);
  }

  /* ------------------------------------------------------------------ */
  /* FAQ accordion                                                        */
  /* ------------------------------------------------------------------ */
  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    var question = item.querySelector(".faq-question");
    if (!question) return;
    question.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      faqItems.forEach(function (other) {
        other.classList.remove("open");
        var q = other.querySelector(".faq-question");
        if (q) q.setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("open");
        question.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ------------------------------------------------------------------ */
  /* Risk pattern explorer                                               */
  /* ------------------------------------------------------------------ */
  var RISK_MAP = {
    e2e2: { label: "Below-average population risk", pct: 12, color: "var(--teal)",
      desc: "The ε2 allele is linked to somewhat lower average risk and may also delay typical age of onset, though this genotype is uncommon." },
    e2e3: { label: "Below-average population risk", pct: 20, color: "var(--teal)",
      desc: "Carrying one ε2 copy alongside ε3 is generally associated with slightly lower than average population risk." },
    e3e3: { label: "Average population risk", pct: 35, color: "var(--teal)",
      desc: "The most common APOE genotype. Population studies use this as the baseline against which other genotypes are compared." },
    e2e4: { label: "Slightly increased risk", pct: 48, color: "var(--amber)",
      desc: "The ε2 copy appears to partially offset the ε4 copy, so risk is elevated but less than ε3/ε4 in most studies." },
    e3e4: { label: "Increased risk (~2–3× average)", pct: 66, color: "var(--amber)",
      desc: "One ε4 copy is consistently linked to roughly two to three times average population risk for late-onset Alzheimer's." },
    e4e4: { label: "Substantially increased risk (~8–12× average)", pct: 92, color: "var(--rose)",
      desc: "Two ε4 copies show the strongest common genetic association with late-onset Alzheimer's, though outcomes still vary widely between individuals." }
  };

  function computeRisk(genotype, familyHistory, ageOver65) {
    var base = RISK_MAP[genotype] || RISK_MAP.e3e3;
    var pct = base.pct;
    var label = base.label;
    var desc = base.desc;
    var color = base.color;
    var notes = [];

    if (familyHistory) {
      pct = Math.min(98, pct + 15);
      notes.push("family history of early-onset disease raises the illustrative estimate further");
      if (color === "var(--teal)") color = "var(--amber)";
    }
    if (ageOver65) {
      pct = Math.min(98, pct + 5);
      notes.push("risk in population studies rises with age generally");
    }
    if (notes.length) {
      desc += " This illustration also factors in that " + notes.join(" and ") + ".";
    }
    return { label: label, desc: desc, pct: pct, color: color };
  }
  window.LocusRisk = { compute: computeRisk, map: RISK_MAP };

  var genotypeEl = document.getElementById("genotype");
  var familyHistoryEl = document.getElementById("familyHistory");
  var ageOver65El = document.getElementById("ageOver65");
  var riskBadge = document.getElementById("riskBadge");
  var riskDesc = document.getElementById("riskDesc");
  var riskMeter = document.getElementById("riskMeter");

  function updateRiskUI() {
    if (!genotypeEl || !riskBadge) return;
    var result = computeRisk(genotypeEl.value, familyHistoryEl.checked, ageOver65El.checked);
    riskBadge.textContent = result.label;
    riskBadge.style.color = result.color;
    riskDesc.textContent = result.desc;
    riskMeter.style.width = result.pct + "%";
    riskMeter.style.background = result.color;
  }
  [genotypeEl, familyHistoryEl, ageOver65El].forEach(function (el) {
    if (el) el.addEventListener("change", updateRiskUI);
  });
  if (genotypeEl) updateRiskUI();
})();
