/* ==========================================================
   script.js  -  LOGIC NG "LET'S CONNECT" PAGE
   Gabay: hanapin ang number (1-17) para madaling makita ang section.
   Personal details (links, numbers, photo, email, pangalan, footer) = config.js lang. Hindi na kailangang galawin ang file na ito.
   ========================================================== */

/* ==========================================================
   1. CONFIG  -  nasa hiwalay na file: config.js
   Dito na lang binabasa. Lahat ng personal na detalye (pangalan, photo, links, numero, email, footer) ay nasa config.js.
   Dapat naka-load ang config.js BAGO ang script.js sa index.html.
   ========================================================== */
/* ==========================================================
   2. HELPERS + PAGE SIZE
   $("id") = shortcut ng document.getElementById("id").
   ========================================================== */
const $ = (id) => document.getElementById(id);
// matchMedia listener na gumagana pati sa lumang Safari (walang addEventListener sa MediaQueryList)
const onMQ = (mq, fn) =>
  mq.addEventListener ? mq.addEventListener("change", fn) : mq.addListener(fn);
const stage = $("stage"),
  root = document.documentElement;
// Binabasa ang kulay mula sa active theme (CSS variable) para sumunod ang confetti, rings at pill sa theme.
const cv = (n) => getComputedStyle(root).getPropertyValue(n).trim();
let mode = "email";
const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
const EASE = "cubic-bezier(.22,1,.36,1)";
// PLATFORM FLAGS: declared once, here, because size(), Call now, keyboard lift and Save contact all read them.
const UA = navigator.userAgent;
const IOS =
  /iPad|iPhone|iPod/.test(UA) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const ANDROID = /Android/i.test(UA);
const coarse = matchMedia("(pointer:coarse)").matches;
// SAFE AREAS: JS cannot read env(safe-area-inset-*) directly. A hidden zero-size probe pads itself with env()
// and we read the computed padding. Every value is 0 where env() is unsupported.
const probe = document.createElement("div");
probe.setAttribute("aria-hidden", "true");
probe.style.cssText =
  "position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;" +
  "padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)";
document.body.appendChild(probe);
let ins = { t: 0, r: 0, b: 0, l: 0 };
function readInsets() {
  const s = getComputedStyle(probe);
  ins = {
    t: parseFloat(s.paddingTop) || 0,
    r: parseFloat(s.paddingRight) || 0,
    b: parseFloat(s.paddingBottom) || 0,
    l: parseFloat(s.paddingLeft) || 0,
  };
}
readInsets();
// Kinukuwenta ang --u (1 design unit) ayon sa screen. DAPAT kapareho ng formula sa style.css (section 1).
// Naka-freeze habang may popup/keyboard para hindi tumalon ang layout.
// Two-column landscape: u = min(1, usableWidth / 1990, max(floor, usableHeight / 1480)), where usable = viewport minus
// safe areas, and floor = 0.32 on touch screens (0.2 elsewhere). The floor is --umin in style.css. On a phone held
// sideways the page keeps readable text and scrolls a little, instead of shrinking until the text is unreadable.
const landMQ = matchMedia("(orientation:landscape)");
let lastU = 0,
  lastH = "";
function size(force) {
  if (
    force !== true &&
    (document.querySelector(".ov.on") || stage.classList.contains("typing"))
  )
    return;
  readInsets();
  const W = innerWidth,
    H = innerHeight,
    land = landMQ.matches,
    base = Math.min(W, 720) / 941;
  const Wa = Math.max(1, W - ins.l - ins.r),
    Ha = Math.max(1, H - ins.t - ins.b);
  const u =
    land && W >= 560
      ? Math.min(1, Wa / 1990, Math.max(coarse ? 0.32 : 0.2, Ha / 1504))
      : land
        ? base
        : Math.min(
            base,
            H / (parseFloat(root.style.getPropertyValue("--dh")) || 2214),
          );
  const hv = land ? "auto" : H + "px";
  // isinusulat lang kapag nagbago talaga ang value, para hindi mag-relayout ang buong page nang walang dahilan
  if (u !== lastU) {
    root.style.setProperty("--u", u + "px");
    lastU = u;
  }
  if (hv !== lastH) {
    root.style.setProperty("--H", hv);
    lastH = hv;
  }
}
// Pini-pause ang walang-katapusang pulse/ping (CSS: :root.pause) habang may keyboard o popup
let shareOpen = false; // bukas ang share sheet (section 17)
const syncPause = () => {
  root.classList.toggle(
    "pause",
    stage.classList.contains("typing") || callOpen || pvOpen || shareOpen,
  );
  // "modal" = may popup: itinatago lang ang top bar (share + dark/light) kapag may popup, hindi kapag nagta-type
  root.classList.toggle("modal", callOpen || pvOpen || shareOpen);
};
size();
// TWO-COLUMN MODE (landscape/desktop): inilalagay sa right column ang social buttons + message card.
// Pag nag-rotate pabalik sa portrait, ibinabalik sila sa dating pwesto.
const twoMQ = matchMedia("(orientation:landscape) and (min-width:560px)");
const rc = document.createElement("div");
rc.className = "rc";
const stk = document.querySelector(".stack"),
  hdiEl = document.querySelector(".hdi"),
  cardEl = document.querySelector(".card"),
  cardNext = cardEl.nextElementSibling;
// Lilipat ng pwesto ang .stack at .card depende kung two-column o isang column.
function arrange() {
  if (twoMQ.matches) {
    if (!rc.parentNode) {
      stage.insertBefore(rc, cardEl);
      rc.append(stk, cardEl);
    }
  } else if (rc.parentNode) {
    hdiEl.append(stk);
    stage.insertBefore(cardEl, cardNext);
    rc.remove();
  }
}
arrange();
onMQ(twoMQ, arrange);
// isang beses lang kada frame ang resize work (dati: bawat resize event)
let rszRaf = 0;
addEventListener("resize", () => {
  if (rszRaf) return;
  rszRaf = requestAnimationFrame(() => {
    rszRaf = 0;
    size();
    if (callOpen && !callBusy) placeGlow();
  });
});
// Pinipigilan ang page na gumalaw/tumalon habang bukas ang popup o keyboard
if (window.visualViewport) {
  const pin = () => {
    if (document.querySelector(".ov.on")) scrollTo(0, 0);
  };
  visualViewport.addEventListener("scroll", pin);
  visualViewport.addEventListener("resize", pin);
}
addEventListener(
  "scroll",
  () => {
    if (scrollY && document.querySelector(".ov.on")) scrollTo(0, 0);
  },
  { passive: true },
);
/* ==========================================================
   3. ILAGAY ANG LINKS, NUMBERS AT PHOTO MULA SA CONFIG
   Dito kinukuha ng mga buttons ang laman galing sa CONFIG sa taas.
   ========================================================== */
// Phone numbers for tel: links: digits plus one leading "+" (E.164), so every platform gets a valid number.
const telOf = (p) => {
  const raw = String((p && (p.tel || p.label)) || ""),
    digits = raw.replace(/\D/g, "");
  return (raw.trim().charAt(0) === "+" ? "+" : "") + digits;
};
// SMS recipient: CONFIG.smsNumber kung may laman, kung wala ay ang unang numero sa CONFIG.phones
const smsTo = () => CONFIG.smsNumber || telOf(CONFIG.phones[0]);
$("fb").href = CONFIG.facebook;
$("ms").href = CONFIG.messenger;
$("ig").href = CONFIG.instagram;
$("tt").href = CONFIG.tiktok;
$("fbh").textContent = CONFIG.handles.facebook;
$("msh").textContent = CONFIG.handles.messenger;
$("igh").textContent = CONFIG.handles.instagram;
$("tth").textContent = CONFIG.handles.tiktok;
// Ang numero sa ilalim ng "Call now": CONFIG.callMask kung may laman, kung wala ay ang unang numero nang buo.
$("callnum").textContent = CONFIG.callMask || CONFIG.phones[0].label;
// Pangalan at footer galing sa CONFIG (index.html ay walang hardcoded na pangalan)
$("nm").textContent = CONFIG.name;
// BIO: role + location (dalawang chip) at bio (pangungusap). Walang laman = mawawala lang ang bahaging iyon;
// kung wala ang tatlo, mawawala ang buong block. Ang taas ng buong page (--dh) ay kinukuwenta sa fitBio() para laging kasya sa screen.
const bioEl = $("bio"),
  bioMeta = $("bmeta"),
  bioTxt = $("btx");
{
  const cl = (v) =>
    String(v || "")
      .replace(/\s+/g, " ")
      .trim();
  const role = cl(CONFIG.role),
    loc = cl(CONFIG.location),
    mc = CONFIG.bioMaxChars || 140;
  let txt = cl(CONFIG.bio);
  if (txt.length > mc)
    txt =
      txt
        .slice(0, mc)
        .replace(/\s+\S*$/, "")
        .replace(/[\s.,;:|•-]+$/, "") + "…";
  $("brolet").textContent = role;
  $("bloct").textContent = loc;
  $("brole").hidden = !role;
  $("bloc").hidden = !loc;
  bioMeta.hidden = !(role || loc);
  bioTxt.textContent = txt;
  bioTxt.hidden = !txt;
  $("bsp").hidden = !(role || loc) || !txt;
  bioEl.hidden = !(role || loc || txt);
}
// Kinukuwenta ang kabuuang taas ng design (--dh) base sa aktwal na laki ng bio, para hindi lumampas sa screen.
// 2062 = taas ng page na walang bio block (may konting sobra). Dalawang pass dahil nagbabago ang --u kapag nagbago ang --dh.
function fitBio() {
  if (bioEl.hidden) {
    root.style.removeProperty("--dh");
    size(true);
    return;
  }
  const hasM = !bioMeta.hidden,
    hasT = !bioTxt.hidden;
  for (let i = 0; i < 2; i++) {
    const u = parseFloat(root.style.getPropertyValue("--u")) || 0.4;
    const txtU = hasT ? bioTxt.offsetHeight / u : 0;
    const dh = 2214 + 40 + (hasM ? 54 : 0) + (hasM && hasT ? 32 : 0) + txtU;
    root.style.setProperty("--dh", Math.round(dh));
    size(true);
  }
}
fitBio();
$("callname").textContent = "Call " + CONFIG.name;
// pamagat at kumanta ng music (lalabas sa ilalim ng pfp sa photo viewer)
$("pvtitle").textContent = CONFIG.audioTitle || "Now playing";
$("pvartist").textContent = CONFIG.audioArtist || "";
$("pvartist").hidden = !CONFIG.audioArtist;
$("footer").textContent = CONFIG.footer;
// Walang link sa CONFIG = mawawala ang button na iyon. Kapag isa na lang ang natira sa isang hilera, pupunuin nito ang hilera
// (flex:1 sa CSS); kapag wala nang natira sa hilera, itatago ang buong hilera.
[
  ["fb", "facebook"],
  ["ms", "messenger"],
  ["ig", "instagram"],
  ["tt", "tiktok"],
].forEach(([id, key]) => {
  if (!CONFIG[key]) $(id).parentElement.style.display = "none";
});
document.querySelectorAll(".row2").forEach((r) => {
  if ([...r.children].every((x) => x.style.display === "none"))
    r.style.display = "none";
});
CONFIG.phones.forEach((p, i) => {
  const a = $("n" + (i + 1));
  if (!a) return; // may 3rd+ number sa CONFIG pero walang slot sa popup: laktawan, huwag mag-crash
  a.href = "tel:" + telOf(p);
  const m = /^(\+\d+)\s+(.+)$/.exec(p.label),
    cc = m ? m[1] : "",
    digits = m ? m[2] : p.label,
    tag = p.tag || (i ? "Alternate" : "Primary");
  a.setAttribute("aria-label", "Call " + p.label);
  a.innerHTML =
    '<span class="pw"><svg class="pi" viewBox="0 0 100 100"><path transform="translate(9 9) scale(3.4)" fill="#fff" d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></svg></span><span class="nb"><span class="tg">' +
    tag +
    (cc ? "<i>" + cc + "</i>" : "") +
    '</span><span class="nn">' +
    digits +
    '</span><small>Tap to call</small></span><span class="pa"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18 18 6M7 6h11v11"/></svg></span>';
  a.addEventListener("click", () => setTimeout(closeCall, 300));
});
// Kung walang photo o hindi ma-load ang file, ibabalik ang placeholder avatar (walang sirang image icon)
["n1", "n2"].forEach((id, i) => {
  if (!CONFIG.phones[i]) $(id).style.display = "none";
});
// photoReady: tapos na ang pag-decode ng picture BAGO tumakbo ang intro. Dati, sa gitna ng animation
// nagde-decode ang malaking picture sa main thread, kaya nagha-hitch ang mga unang frames.
let photoReady = Promise.resolve();
if (CONFIG.photo) {
  const img = new Image();
  img.alt = CONFIG.name;
  img.decoding = "async";
  img.src = CONFIG.photo;
  const dec = img.decode
    ? img.decode()
    : new Promise((ok, no) => {
        img.onload = ok;
        img.onerror = no;
      });
  // kapag nag-fail ang load, ang placeholder avatar ang mananatili
  photoReady = dec.then(
    () => $("photo").replaceChildren(img),
    () => {},
  );
}
/* ==========================================================
   3b. DARK / LIGHT SWITCH
   Ang switch sa itaas ng page. Ang aktwal na pagpapalit (data-mode, meta tags, pag-save) ay nasa window.setMode
   sa head ng index.html. Dito ang click + animation: circular reveal mula sa button (View Transitions API);
   kung hindi suportado, malambot na fade ng mga kulay (.tswap). Naka-off ang animation kung reduced motion.
   ========================================================== */
const tm = $("tmode");
const isLight = () => root.getAttribute("data-mode") === "light";
function tmLabel() {
  const l = isLight();
  tm.setAttribute(
    "aria-label",
    l ? "Switch to dark mode" : "Switch to light mode",
  );
  tm.title = l ? "Switch to dark mode" : "Switch to light mode";
}
tmLabel();
document.addEventListener("modechange", tmLabel);
let tmBusy = false;
tm.addEventListener("click", () => {
  if (tmBusy || typeof window.setMode !== "function") return;
  const next = !isLight(),
    swap = () => window.setMode(next, true);
  if (reduce) return swap();
  const r = tm.getBoundingClientRect(),
    x = r.left + r.width / 2,
    y = r.top + r.height / 2;
  if (document.startViewTransition) {
    tmBusy = true;
    let vt;
    try {
      vt = document.startViewTransition(swap);
    } catch (e) {
      tmBusy = false;
      return swap();
    }
    vt.ready
      .then(() => {
        const R = Math.hypot(
          Math.max(x, innerWidth - x),
          Math.max(y, innerHeight - y),
        );
        root.animate(
          {
            clipPath: [
              "circle(0px at " + x + "px " + y + "px)",
              "circle(" + R + "px at " + x + "px " + y + "px)",
            ],
          },
          {
            duration: 750,
            easing: EASE,
            pseudoElement: "::view-transition-new(root)",
          },
        );
      })
      .catch(() => {});
    vt.finished.catch(() => {}).then(() => (tmBusy = false));
  } else {
    root.classList.add("tswap");
    swap();
    setTimeout(() => root.classList.remove("tswap"), 600);
  }
});
// lalabas ang top bar (share + switch) pagkatapos ng intro animation
setTimeout(() => $("tbar").classList.add("on"), 1100);
// habang nagta-type, hindi isinasara ang keyboard kapag pinindot ang dark/light switch
tm.addEventListener("mousedown", (e) => e.preventDefault());
/* ==========================================================
   4. ENTRANCE ANIMATION
   play() = pinapatakbo ang animation pag-load, refresh, o pagbalik sa page.
   ========================================================== */
let doneT;
function play() {
  clearTimeout(doneT);
  stage.classList.remove("go", "done");
  void stage.offsetWidth;
  stage.classList.add("go");
  // ang pinakahuling animation ay natatapos mga ~1.65s (sa --spd: 0.75); 2000 ay may buffer
  doneT = setTimeout(() => stage.classList.add("done"), 2000);
}
// Hinihintay muna ang font at photo (hanggang 800ms lang) bago mag-play ang intro.
// Nakatago pa rin ang lahat (opacity 0) habang naghihintay, kaya walang makikitang flash.
// Layunin: walang font-swap o image-decode na tatama sa gitna ng animation.
const wait = (p, ms) =>
  Promise.race([
    Promise.resolve(p).catch(() => {}),
    new Promise((r) => setTimeout(r, ms)),
  ]);
const fontsReady =
  document.fonts && document.fonts.load
    ? Promise.all(
        ["300", "800"].map((w) =>
          document.fonts.load(w + ' 1em "Plus Jakarta Sans"'),
        ),
      )
    : Promise.resolve();
Promise.all([wait(fontsReady, 450), wait(photoReady, 450)]).then(() => {
  fitBio(); // tapos nang mag-load ang font, kaya tama na ang sukat ng bio
  play();
});
addEventListener("pageshow", (e) => {
  if (e.persisted) play();
});
/* ==========================================================
   5. POPUP HELPERS
   Nagsasara ang popup pag pinindot ang labas nito o ang Esc key.
   ========================================================== */
const show = (el) => el.classList.add("on");
const hide = (el) => {
  el.classList.remove("on");
  if (document.activeElement) document.activeElement.blur();
  setTimeout(size, 50);
};
document.querySelectorAll(".ov").forEach((o) =>
  o.addEventListener("click", (e) => {
    if (
      e.target === o ||
      e.target.hasAttribute("data-close") ||
      e.target.id === "cbg" ||
      e.target.id === "sbg"
    )
      o.id === "callov"
        ? closeCall()
        : o.id === "shareov"
          ? closeShare()
          : hide(o);
  }),
);
addEventListener("keydown", (e) => {
  if (e.key === "Escape")
    document
      .querySelectorAll(".ov.on")
      .forEach((o) =>
        o.id === "callov"
          ? closeCall()
          : o.id === "shareov"
            ? closeShare()
            : hide(o),
      );
});
// CALL NOW, by platform:
//   All platforms: the custom number popup (openCall). Each option is a real tel: link, so iOS still shows its own native
//        call confirmation for the number that was picked. The button href stays as a no-JS fallback.
//   iOS only, when CONFIG.iosCallPopup is false: the button is a plain <a href="tel:primary"> and Safari shows its native
//        confirmation straight away. A web page cannot ask iOS for a multi-number chooser, so only the first number is reachable.
// Ang pag-save ng contact ay nasa hiwalay na "Save contact" button (section 15).
const callBtn = $("call");
callBtn.href = "tel:" + telOf(CONFIG.phones[0]);
if (IOS && !CONFIG.iosCallPopup) {
  callBtn.setAttribute("aria-label", "Call " + CONFIG.phones[0].label);
} else {
  callBtn.setAttribute("role", "button");
  callBtn.setAttribute("aria-haspopup", "dialog");
  callBtn.draggable = false;
  // it used to be a <button>, so keep Android's long-press link menu from appearing on it
  if (coarse)
    callBtn.addEventListener("contextmenu", (e) => e.preventDefault());
  callBtn.addEventListener("click", (e) => {
    e.preventDefault();
    openCall();
  });
}
/* ==========================================================
   6. PAGE LOCK (walang drag ng buong page)
   Pinapayagan na ang pinch-zoom at pag-pan kapag naka-zoom (accessibility). Ang pinipigilan lang ay ang
   pag-drag/rubber-band ng page. Gumagalaw pa rin ang textarea, popup sheet at scrollable na .stage.
   ========================================================== */
// Naka-cache ang orientation para hindi bumabasa ng layout (scrollHeight) sa bawat touchmove sa portrait.
let isLand = landMQ.matches;
onMQ(landMQ, () => {
  isLand = landMQ.matches;
  syncLock();
});
function lockMove(e) {
  if (e.touches.length > 1) return;
  if (window.visualViewport && visualViewport.scale > 1.01) return;
  if (e.target.closest("textarea, .sheet")) return;
  e.preventDefault();
}
// Portrait lang naka-lock ang drag. Sa landscape nag-i-scroll ang .stage, kaya walang blocking listener (mas smooth ang scroll).
const syncLock = () =>
  document[isLand ? "removeEventListener" : "addEventListener"](
    "touchmove",
    lockMove,
    { passive: false },
  );
syncLock();
/* ==========================================================
   7. CALL POPUP
   Lumalaki palabas mula sa Call button, at bumabalik doon pag isinara. openCall() / closeCall().
   ========================================================== */
let callOpen = false,
  callBusy = false;
const sglow = $("sglow");
// Inilalagay ang glow layer sa eksaktong pwesto ng sheet (pagkatapos ng open animation)
function placeGlow() {
  const r = $("csheet").getBoundingClientRect();
  Object.assign(sglow.style, {
    left: r.left + "px",
    top: r.top + "px",
    width: r.width + "px",
    height: r.height + "px",
  });
}
// Sinusukat ang pwesto ng Call button para sa grow/shrink animation ng popup
function callGeom() {
  const b = $("call").getBoundingClientRect(),
    r = $("csheet").getBoundingClientRect();
  const dx = b.left + b.width / 2 - (r.left + r.width / 2),
    dy = b.top + b.height / 2 - (r.top + r.height / 2);
  // Landscape / tablet: mas malapad ang Call button kaysa sa popup (max 420px). Hindi kayang palakihin ng clip-path ang lampas sa
  // sariling lapad ng popup, kaya iniuunat muna ang popup nang pahalang (sx) hanggang sa lapad ng button. Ang laman ay naka-fade
  // sa mga sandaling iyon, kaya hindi nakikita ang pag-unat. Sa phone (mas makitid ang button) sx = 1 at clip lang ang gumagana, gaya ng dati.
  const sx = Math.max(1, b.width / r.width);
  const ix = Math.max(0, (r.width - b.width) / 2),
    iy = Math.max(0, (r.height - b.height) / 2);
  // bilog ang dulo ng button: kalahati ng taas nito (hindi lalampas sa 60px). Hinahati sa sx ang pahalang na radius
  // para pagkatapos ng pag-unat ay bilog pa rin.
  const rad = Math.min(b.height / 2, 60);
  return {
    from: "translate3d(" + dx + "px," + dy + "px,0) scaleX(" + sx + ")",
    clipFrom:
      "inset(" +
      iy +
      "px " +
      ix +
      "px " +
      iy +
      "px " +
      ix +
      "px round " +
      rad / sx +
      "px / " +
      rad +
      "px)",
    clipTo: "inset(0px 0px 0px 0px round 28px / 28px)",
  };
}
function openCall() {
  if (callOpen || callBusy) return;
  callOpen = callBusy = true;
  syncPause();
  const ov = $("callov"),
    sh = $("csheet"),
    bg = $("cbg"),
    btn = $("call");
  ov.classList.add("on");
  const g = callGeom(),
    D = reduce ? 1 : 480;
  // sariling layer ang sheet habang gumagalaw, tinatanggal pagkatapos
  sh.style.willChange = "transform, clip-path";
  bg.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: reduce ? 1 : 300,
    easing: "ease",
  });
  sh.animate(
    [
      { transform: g.from, clipPath: g.clipFrom },
      { transform: "none", clipPath: g.clipTo },
    ],
    { duration: D, easing: EASE },
  ).onfinish = () => {
    sh.style.willChange = "";
    // glow: opacity lang (CSS transition), hindi na animated box-shadow
    placeGlow();
    sglow.classList.add("on");
    if (CONFIG.phones[0]) $("n1").focus({ preventScroll: true });
    callBusy = false;
  };
  sh.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: reduce ? 1 : 160,
    easing: "ease-out",
  });
  [...sh.children].forEach((el, i) =>
    el.animate(
      [
        { opacity: 0, transform: "translate3d(0,16px,0) scale(.97)" },
        { opacity: 1, transform: "none" },
      ],
      {
        duration: reduce ? 1 : 420,
        delay: reduce ? 0 : 120 + i * 55,
        easing: EASE,
        fill: "backwards",
      },
    ),
  );
  sh.querySelectorAll(".opt .pi").forEach((ic, i) => {
    if (reduce) return;
    ic.animate(
      [
        { transform: "scale(.4) rotate(0)" },
        { transform: "scale(1.12) rotate(-14deg)", offset: 0.5 },
        { transform: "scale(1) rotate(0)" },
      ],
      { duration: 520, delay: 240 + i * 80, easing: EASE, fill: "backwards" },
    );
  });
}
function closeCall() {
  if (!callOpen || callBusy) return;
  callBusy = true;
  const ov = $("callov"),
    sh = $("csheet"),
    bg = $("cbg"),
    btn = $("call");
  sglow.classList.remove("on");
  const g = callGeom(),
    D = reduce ? 1 : 340,
    opt = { duration: D, easing: EASE, fill: "forwards" };
  [...sh.children].forEach((el) =>
    el.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: reduce ? 1 : 120,
      easing: "ease-in",
      fill: "forwards",
    }),
  );
  bg.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: reduce ? 1 : 280,
    delay: reduce ? 0 : 60,
    easing: "ease",
    fill: "forwards",
  });
  sh.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: reduce ? 1 : 170,
    delay: reduce ? 0 : D - 170,
    easing: "ease-in",
    fill: "forwards",
  });
  sh.animate(
    [
      { transform: "none", clipPath: g.clipTo },
      { transform: g.from, clipPath: g.clipFrom },
    ],
    opt,
  ).onfinish = () => {
    [sh, bg, ...sh.children].forEach((el) =>
      el.getAnimations().forEach((a) => a.cancel()),
    );
    hide(ov);
    callOpen = callBusy = false;
    syncPause();
    // balik ang focus sa Call button (para sa keyboard users)
    btn.focus({ preventScroll: true });
  };
}
/* ==========================================================
   8. EMAIL / PHONE MODE
   mode = "email" o "phone" (SMS). Pinapalitan ng switch button sa card (switchMode sa section 12).
   ========================================================== */
$("sw").onclick = () => switchMode();
/* ==========================================================
   9. MESSAGE BOX + KEYBOARD LIFT
   Pag nag-type sa card, dahan-dahang tumataas ang page para hindi matakpan ng keyboard.
   Pag pinindot ang expand icon, lumalaki ang textbox hanggang sa taas ng keyboard.
   Huwag galawin kung gumagana na (maselan ang spring animation dito).
   ========================================================== */
const msg = $("msg"),
  box = msg.parentElement,
  card = document.querySelector(".card"),
  hd = document.querySelector(".hd");
hd.style.transition = "none";
let poll = 0,
  expanded = false,
  boxBase = 0,
  chromeH = 0;
let closing = false,
  curH = 0,
  shiftCur = 0,
  vH = 0,
  vS = 0,
  raf = 0,
  lastT = 0,
  t0 = 0;
let kbBase = 0,
  kbSeen = false,
  kbMax = 0,
  typingT = 0,
  mH = -1,
  mTop = 0,
  mBot = 0;
let kbRatio = 0;
try {
  kbRatio = +localStorage.getItem("kbr") || 0;
} catch (e) {}
// Sa iOS, pina-pan ng Safari ang visual viewport kaya ito ang pang-counter
const vvTop = () =>
  IOS && window.visualViewport ? window.visualViewport.offsetTop : 0;
const vk = navigator.virtualKeyboard;
if (vk) {
  try {
    vk.overlaysContent = true;
    vk.addEventListener("geometrychange", () => lift());
  } catch (e) {}
}
// Kung gaano kababa ang nakikitang bahagi ng screen (bawas ang keyboard)
function visBottom() {
  const vv = window.visualViewport;
  // iOS: height lang ng nakikitang bahagi (hindi isinasama ang offsetTop)
  let b = vv ? (IOS ? vv.height : vv.offsetTop + vv.height) : innerHeight;
  if (vk && vk.overlaysContent && vk.boundingRect && vk.boundingRect.height > 0)
    b = innerHeight - vk.boundingRect.height;
  return b;
}
const baseH = () =>
  204 * (parseFloat(root.style.getPropertyValue("--u")) || 0) ||
  box.offsetHeight;
const landscape = () => innerWidth > innerHeight;
function effBottom() {
  const b = visBottom();
  if (!coarse) return b;
  if (b < kbBase - 60) {
    kbSeen = true;
    kbMax = Math.max(kbMax, (kbBase - b) / kbBase);
    return b;
  }
  if (kbSeen || performance.now() - typingT > 1200) return b;
  return Math.min(
    b,
    kbBase * (1 - (kbRatio > 0.2 && kbRatio < 0.6 ? kbRatio : 0.4)),
  );
}
function checkKb() {
  if (coarse && kbSeen && expanded && !closing && visBottom() >= kbBase - 60) {
    setExpanded(false);
    msg.blur();
  }
}
// Sinusukat ang card kung ang textbox ay may taas na h (hindi bawat frame)
function measure(h) {
  if (Math.abs(h - mH) < 0.5) return;
  const prev = box.style.height;
  box.style.height = h + "px";
  mTop = card.offsetTop - (landscape() ? stage.scrollTop : 0);
  mBot = mTop + card.offsetHeight;
  mH = h;
  box.style.height = prev;
}
function goals(eb) {
  // pad = gap kept above the card. It includes the top safe area (status bar in Add to Home Screen mode, notch in
  // landscape), so the expand/collapse button is never pushed under it.
  // Sa portrait, nasa kanang itaas ang top bar (share + dark/light), kaya ang card ay humihinto sa ilalim nito.
  const tb = $("tbar"),
    tbR =
      !useKids() && tb.classList.contains("on")
        ? tb.getBoundingClientRect().bottom + 8
        : 0;
  const pad = Math.max(10 + ins.t, tbR);
  const gh =
    closing || !expanded ? boxBase : Math.max(boxBase, eb - pad - 10 - chromeH);
  if (closing) return [gh, 0];
  measure(gh);
  return [gh, Math.max(0, Math.min(mBot + 10 - eb, mTop - pad))];
}
// Page lift. Portrait: the whole .stage is translated. Two-column landscape: .stage is a scroll container
// (overflow-y:auto), and translating it would also raise its clip box and cut the card off, so the stage stays
// put and its children are translated instead.
const useKids = () => landMQ.matches && innerWidth >= 560;
function setShift(y) {
  const v = "translate3d(0," + y + "px,0)";
  if (useKids()) {
    stage.style.transform = "";
    for (const k of stage.children) k.style.transform = v;
  } else stage.style.transform = v;
}
function clearShift() {
  stage.style.transform = "";
  for (const k of stage.children) k.style.transform = "";
}
// Isang frame ng spring animation: sabay ang paglaki ng textbox at pagtaas ng page
function frame(t) {
  raf = 0;
  const dt = Math.min(0.05, Math.max(8e-3, (t - lastT) / 1e3));
  lastT = t;
  const eb = effBottom();
  checkKb();
  const w = closing ? 22 : 18,
    [gh, gs] = goals(eb);
  vH += (w * w * (gh - curH) - 2 * w * vH) * dt;
  curH = Math.max(boxBase, curH + vH * dt);
  vS += (w * w * (gs - shiftCur) - 2 * w * vS) * dt;
  shiftCur = Math.max(0, shiftCur + vS * dt);
  const done =
    (Math.abs(gh - curH) < 0.5 &&
      Math.abs(gs - shiftCur) < 0.5 &&
      Math.abs(vH) < 30 &&
      Math.abs(vS) < 30) ||
    t - t0 > 2500;
  if (done) {
    curH = gh;
    shiftCur = gs;
    vH = vS = 0;
  }
  box.style.height = done && !expanded ? "" : curH + "px";
  setShift(vvTop() - shiftCur);
  if (!done) raf = requestAnimationFrame(frame);
  else if (closing) finishTyping();
}
function kick() {
  if (!raf) {
    lastT = t0 = performance.now();
    raf = requestAnimationFrame(frame);
  }
}
// Tinatawag tuwing nagbabago ang keyboard/text: sinisimulan ang animation
function lift() {
  if (!stage.classList.contains("typing")) return;
  if (!boxBase) {
    boxBase = baseH();
    curH = boxBase;
    chromeH = card.offsetHeight - box.offsetHeight;
    mH = -1;
  }
  const eb = effBottom();
  checkKb();
  if (reduce) {
    const [gh, gs] = goals(eb);
    curH = gh;
    shiftCur = gs;
    box.style.height = expanded ? gh + "px" : "";
    setShift(vvTop() - gs);
    return;
  }
  kick();
}
// Tapos na ang pag-type: ibinabalik sa normal ang lahat
function finishTyping() {
  cancelAnimationFrame(raf);
  raf = 0;
  closing = false;
  if (kbSeen && kbMax > 0.2 && kbMax < 0.6) {
    kbRatio = kbMax;
    try {
      localStorage.setItem("kbr", kbMax.toFixed(3));
    } catch (e) {}
  }
  kbSeen = false;
  kbMax = 0;
  box.style.height = "";
  hd.style.flex = "";
  boxBase = 0;
  chromeH = 0;
  curH = 0;
  shiftCur = 0;
  vH = 0;
  vS = 0;
  mH = -1;
  stage.classList.remove("typing");
  syncPause();
  stage.style.transition = "";
  clearShift();
  setTimeout(size, 450);
}
function setExpanded(v) {
  expanded = v;
  $("open")
    .querySelector("path")
    .setAttribute(
      "d",
      v
        ? "M21 9h-6V3M3 15h6v6M15 9l6-6M9 15l-6 6"
        : "M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7",
    );
  $("open").setAttribute(
    "aria-label",
    v ? "Collapse message box" : "Expand message box",
  );
}
// Focus sa textbox = simula ng typing mode
const typingOn = () => {
  closing = false;
  if (!stage.classList.contains("typing")) {
    kbBase = visBottom();
    typingT = performance.now();
    kbSeen = false;
    kbMax = 0;
    mH = -1;
    if (!landscape()) hd.style.flex = "0 0 " + hd.offsetHeight + "px";
    stage.classList.add("typing");
    syncPause();
    stage.style.transition = "none";
  }
  lift();
  clearInterval(poll);
  let n = 0;
  poll = setInterval(() => {
    lift();
    if (++n > 14) clearInterval(poll);
  }, 120);
};
// Blur sa textbox = bumababa pabalik ang page
const typingOff = () => {
  clearInterval(poll);
  setExpanded(false);
  if (reduce || !boxBase) {
    finishTyping();
    return;
  }
  closing = true;
  kick();
};
msg.addEventListener("focus", typingOn);
msg.addEventListener("blur", (e) => {
  if (!e.relatedTarget || !e.relatedTarget.closest(".card"))
    setTimeout(() => {
      if (document.activeElement !== msg) typingOff();
    }, 220);
});
addEventListener("resize", () => {
  mH = -1;
});
addEventListener("resize", lift);
msg.addEventListener("input", lift);
// tanggal ang pulang error border pag nag-type na ulit
msg.addEventListener("input", () => box.classList.remove("bad"));
if (window.visualViewport) {
  visualViewport.addEventListener("resize", lift);
  visualViewport.addEventListener("scroll", lift);
}
$("open").addEventListener("mousedown", (e) => e.preventDefault());
$("open").onclick = () => {
  const v = !expanded;
  if (
    v &&
    coarse &&
    stage.classList.contains("typing") &&
    kbSeen &&
    visBottom() >= kbBase - 60
  ) {
    kbSeen = false;
    kbMax = 0;
    typingT = performance.now();
    msg.blur();
  }
  setExpanded(v);
  msg.focus({ preventScroll: true });
  lift();
};
stage.addEventListener("click", (e) => {
  if (stage.classList.contains("typing") && !e.target.closest(".card"))
    msg.blur();
});
/* ==========================================================
   10. PROFILE PHOTO VIEWER
   Pinindot ang pfp = lilipad sa gitna at magiging malaking 1:1 photo. Pindutin ulit para isara.
   ========================================================== */
const pv = $("pv"),
  pvbox = $("pvbox"),
  pvi = $("pvi"),
  pvdot = $("pvdot"),
  pvm = $("pvm"),
  pvcap = $("pvcap"),
  pvbg = $("pvbg"),
  av = $("av");
let pvOpen = false,
  pvBusy = false,
  pvT0 = 0;
// Kinukuwenta kung saan at gaano kalaki ang malaking photo AT ang music player sa ilalim nito.
// Portrait / malaking window: pfp sa taas, player sa ilalim. Landscape na mababa (phone na nakahiga): pfp sa kaliwa, player sa kanan.
const PV_CAP = 244; // taas ng player (NOW PLAYING, title, artist, wave, progress, hint)
function pvGeom() {
  const W = innerWidth,
    H = innerHeight,
    side = W > H && H < 520;
  let S, left, top, cl, ct, cw;
  if (side) {
    S = Math.round(Math.min(H * 0.74, W * 0.36, 420));
    cw = Math.min(300, W * 0.34);
    const gap = 36;
    left = (W - (S + gap + cw)) / 2;
    top = (H - S) / 2;
    cl = left + S + gap;
    ct = Math.max(8, (H - PV_CAP) / 2);
  } else {
    const gap = 30;
    S = Math.max(
      120,
      Math.round(Math.min(W * 0.84, H - PV_CAP - gap - 90, 560)),
    );
    top = Math.max(ins.t + 24, (H - (S + gap + PV_CAP)) / 2);
    left = (W - S) / 2;
    cw = Math.min(W - 40, Math.max(S, 320));
    cl = (W - cw) / 2;
    ct = top + S + gap;
  }
  const r = av.getBoundingClientRect(),
    k = r.width / S;
  const dx = r.left + r.width / 2 - (left + S / 2),
    dy = r.top + r.height / 2 - (top + S / 2);
  return {
    S,
    left,
    top,
    cl,
    ct,
    cw,
    from: "translate(" + dx + "px," + dy + "px) scale(" + k + ")",
  };
}
// Pinapantay ang laki at pwesto ng lumilipad na badge sa tunay na badge (may minimum na 22px ang tunay,
// kaya dati ay mas maliit ang lumilipad at biglang lumalaki pagbalik)
let pvHole = 0;
function pvDotFit(g) {
  const w = $("wvdot"),
    dr = w.getBoundingClientRect(),
    ar = av.getBoundingClientRect();
  if (!dr.width || !ar.width) return;
  const k = ar.width / g.S,
    d = dr.width / k,
    cx = ((dr.left + dr.width / 2 - ar.left) / ar.width) * g.S,
    cy = ((dr.top + dr.height / 2 - ar.top) / ar.height) * g.S,
    bw = (parseFloat(getComputedStyle(w).borderTopWidth) || 1) / k;
  Object.assign(pvdot.style, {
    width: d + "px",
    height: d + "px",
    left: cx - d / 2 + "px",
    top: cy - d / 2 + "px",
    borderWidth: bw + "px",
  });
  // cutout (butas) ng malaking pfp: kapareho ng nasa maliit na pfp, para walang kislap ng stroke
  const avgEl = av.querySelector(".avg");
  let hr = avgEl
    ? parseFloat(getComputedStyle(avgEl).getPropertyValue("--hole"))
    : 0;
  if (!(hr > 0))
    hr =
      dr.width / 2 +
      Math.max(
        4.5,
        13 * (parseFloat(root.style.getPropertyValue("--u")) || 0.4),
      );
  pvHole = hr / k;
  pvm.style.setProperty("--hx", cx + "px");
  pvm.style.setProperty("--hy", cy + "px");
  pvm.style.setProperty("--phole", pvHole + "px");
}
function pvLayout(g) {
  Object.assign(pvbox.style, {
    width: g.S + "px",
    height: g.S + "px",
    left: g.left + "px",
    top: g.top + "px",
  });
  pvm.style.padding = g.S * 0.032 + "px";
  pvi.style.borderWidth = g.S * 0.018 + "px";
  Object.assign(pvcap.style, {
    top: g.ct + "px",
    left: g.cl + "px",
    width: g.cw + "px",
    right: "auto",
  });
}
// Bukas: pfp -> gitna ng screen
function openPV() {
  if (pvOpen || pvBusy) return;
  pvBusy = true;
  pvT0 = performance.now();
  pvi.innerHTML = $("photo").innerHTML;
  const g = pvGeom();
  pvLayout(g);
  pvDotFit(g);
  pv.classList.add("on");
  av.style.visibility = "hidden";
  const o = { duration: reduce ? 1 : 540, easing: EASE };
  pvbg.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: reduce ? 1 : 280,
    easing: "ease",
  });
  pvbox.animate(
    [
      { transform: g.from, borderRadius: "50%" },
      { transform: "none", borderRadius: "10%" },
    ],
    o,
  );
  pvi.animate([{ borderRadius: "50%" }, { borderRadius: "7.5%" }], o);
  pvdot.animate([{ transform: "scale(1)" }, { transform: "scale(0)" }], {
    duration: reduce ? 1 : 300,
    easing: EASE,
    fill: "forwards",
  });
  // ang butas ay lumiliit kasabay ng badge
  pvm.animate([{ "--phole": pvHole + "px" }, { "--phole": "0px" }], {
    duration: reduce ? 1 : 300,
    easing: EASE,
    fill: "forwards",
  });
  pvbox.style.borderRadius = "10%";
  pvi.style.borderRadius = "7.5%";
  pvOpen = true;
  syncPause();
  setTimeout(
    () => {
      pv.classList.add("landed");
      pvBusy = false;
    },
    reduce ? 1 : 400,
  );
}
// Sara: bumabalik sa pfp
function closePV() {
  if (!pvOpen || pvBusy) return;
  pvBusy = true;
  pv.classList.remove("landed");
  const g = pvGeom(),
    D = reduce ? 1 : 400,
    o = { duration: D, easing: EASE, fill: "forwards" };
  pvDotFit(g);
  pvdot.getAnimations().forEach((a) => a.cancel());
  pvm.getAnimations().forEach((a) => a.cancel());
  pvm.animate(
    [
      { "--phole": "0px" },
      { "--phole": "0px", offset: 0.55 },
      { "--phole": pvHole + "px" },
    ],
    { duration: D, easing: EASE, fill: "forwards" },
  );
  pvdot.animate(
    [
      { transform: "scale(0)" },
      { transform: "scale(0)", offset: 0.55 },
      { transform: "scale(1)" },
    ],
    { duration: D, easing: EASE, fill: "forwards" },
  );
  pvbg.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: D,
    easing: "ease",
    fill: "forwards",
  });
  pvbox.animate(
    [
      { transform: "none", borderRadius: "10%" },
      { transform: g.from, borderRadius: "50%" },
    ],
    o,
  );
  pvi.animate([{ borderRadius: "7.5%" }, { borderRadius: "50%" }], o);
  setTimeout(() => {
    av.style.visibility = "";
    pv.classList.remove("on");
    [pvbg, pvbox, pvi, pvdot, pvm].forEach((el) =>
      el.getAnimations().forEach((a) => a.cancel()),
    );
    pvOpen = false;
    pvBusy = false;
    syncPause();
  }, D + 30);
}
av.addEventListener("click", () => {
  if (stage.classList.contains("typing")) {
    msg.blur();
    setTimeout(openPV, 520);
  } else openPV();
});
av.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    openPV();
  }
});
pv.addEventListener("click", closePV);
addEventListener("keydown", (e) => {
  if (e.key === "Escape") closePV();
});
addEventListener("resize", () => {
  if (pvOpen && !pvBusy) {
    const g = pvGeom();
    pvLayout(g);
    pvDotFit(g);
  }
});
/* ==========================================================
   11. PAG-ROTATE NG SCREEN
   Pag nag-rotate: isinasara ang keyboard state at kinukuwenta ulit ang laki ng page.
   ========================================================== */
let rotT = [];
function onRotate() {
  if (stage.classList.contains("typing")) {
    clearInterval(poll);
    setExpanded(false);
    finishTyping();
    msg.blur();
  }
  clearShift();
  stage.scrollTop = 0;
  scrollTo(0, 0);
  rotT.forEach(clearTimeout);
  rotT = [0, 100, 300, 700].map((t) =>
    setTimeout(() => {
      size(true);
      scrollTo(0, 0);
      if (pvOpen && !pvBusy) pvLayout(pvGeom());
    }, t),
  );
}
addEventListener("orientationchange", onRotate);
onMQ(matchMedia("(orientation:portrait)"), onRotate);
/* ==========================================================
   12. EFFECTS
   Icon swap (mail/sms/check), confetti pag nasend, at animation ng Email <-> Phone switch.
   ========================================================== */
const ICONS = {
  mail: '<rect x="2.5" y="5" width="19" height="14" rx="1.5"/><path d="m2.5 6 9.5 7.5L21.5 6M2.5 18.5l7-7M21.5 18.5l-7-7"/>',
  sms: '<path d="M4 4.5h16a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5h-9l-5 4v-4H4A1.5 1.5 0 0 1 2.5 15V6A1.5 1.5 0 0 1 4 4.5z"/><path d="M7.5 10.5h.01M12 10.5h.01M16.5 10.5h.01" stroke-width="2.6"/>',
  check:
    '<path d="M4.5 12.5l5 5L19.5 7" pathLength="1" stroke-width="2.4" style="stroke-dasharray:1;stroke-dashoffset:1"/>',
};
const sico = $("sico"),
  card2 = document.querySelector(".card");
let icoKind = "mail",
  icoTok = 0;
// Pinapalitan ang icon sa Send button (may flying animation)
function setIcon(kind, fly) {
  const k = ++icoTok;
  icoKind = kind;
  const out = sico.animate(
    fly
      ? [
          { transform: "none", opacity: 1 },
          {
            transform: "translate3d(54px,-40px,0) rotate(22deg) scale(.3)",
            opacity: 0,
          },
        ]
      : [
          { transform: "none", opacity: 1 },
          {
            transform:
              "translate3d(" +
              (kind === "sms" ? -18 : 18) +
              "px,0,0) scale(.55)",
            opacity: 0,
          },
        ],
    {
      duration: reduce ? 1 : fly ? 380 : 170,
      easing: fly ? "cubic-bezier(.5,0,.9,.4)" : "ease-in",
      fill: "forwards",
    },
  );
  out.onfinish = () => {
    out.cancel();
    if (k !== icoTok) return;
    sico.innerHTML = ICONS[kind];
    sico.animate(
      kind === "check"
        ? [
            { transform: "scale(.2) rotate(-80deg)", opacity: 0 },
            { transform: "scale(1.18) rotate(8deg)", opacity: 1, offset: 0.65 },
            { transform: "none", opacity: 1 },
          ]
        : [
            {
              transform:
                "translate3d(" +
                (kind === "sms" ? 18 : -18) +
                "px,0,0) scale(.55)",
              opacity: 0,
            },
            {
              transform: "translate3d(0,0,0) scale(1.12)",
              opacity: 1,
              offset: 0.7,
            },
            { transform: "none", opacity: 1 },
          ],
      { duration: reduce ? 1 : 440, easing: EASE, fill: "backwards" },
    );
    if (kind === "check")
      sico
        .querySelector("path")
        .animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
          duration: reduce ? 1 : 420,
          delay: reduce ? 0 : 160,
          easing: "ease-out",
          fill: "both",
        });
  };
}
// Confetti pag successful ang send
function burst(el) {
  if (reduce) return;
  const w = document.createElement("i");
  w.className = "burst";
  el.appendChild(w);
  const cols = [
    cv("--a400"),
    cv("--a300"),
    cv("--a200"),
    cv("--ok"),
    "#ffffff",
    cv("--ok-l"),
  ];
  for (let i = 0; i < 14; i++) {
    const d = document.createElement("b"),
      a = (i / 14) * Math.PI * 2 + Math.random() * 0.5,
      r = 70 + Math.random() * 90,
      z = 5 + Math.random() * 5;
    d.style.cssText =
      "background:" +
      cols[i % cols.length] +
      ";width:" +
      z +
      "px;height:" +
      z * (i % 3 ? 1 : 1.8) +
      "px;border-radius:" +
      (i % 3 ? "50%" : "2px");
    w.appendChild(d);
    const dx = Math.cos(a) * r,
      dy = Math.sin(a) * r - 34,
      rot = (Math.random() - 0.5) * 540;
    d.animate(
      [
        { transform: "translate3d(0,0,0) rotate(0) scale(.4)", opacity: 1 },
        {
          transform:
            "translate3d(" +
            dx +
            "px," +
            dy +
            "px,0) rotate(" +
            rot * 0.6 +
            "deg) scale(1)",
          opacity: 1,
          offset: 0.55,
        },
        {
          transform:
            "translate3d(" +
            dx * 1.12 +
            "px," +
            (dy + 70) +
            "px,0) rotate(" +
            rot +
            "deg) scale(.3)",
          opacity: 0,
        },
      ],
      {
        duration: 950 + Math.random() * 350,
        easing: "cubic-bezier(.2,.7,.3,1)",
        fill: "forwards",
      },
    );
  }
  setTimeout(() => w.remove(), 1500);
}
function ringFx(el, cls, color, kf, dur, delay) {
  if (reduce) return;
  const r = document.createElement("i");
  r.className = cls;
  if (color) r.style.borderColor = color;
  el.appendChild(r);
  r.animate(kf, {
    duration: dur,
    delay: delay || 0,
    easing: "cubic-bezier(.2,.7,.3,1)",
    fill: "both",
  }).onfinish = () => r.remove();
}
// Effects pag nabuksan na ang email/SMS app: check icon, confetti, rings
function sentFx() {
  const sb = $("send");
  toast("App opened. Tap Send there to finish.");
  sb.classList.add("ok");
  setIcon("check", true);
  burst(sb);
  ringFx(
    sb,
    "sring",
    "",
    [
      { transform: "scale(1)", opacity: 0.9 },
      { transform: "scale(1.45,2.1)", opacity: 0 },
    ],
    800,
  );
  ringFx(
    sb,
    "sring",
    "",
    [
      { transform: "scale(1)", opacity: 0.7 },
      { transform: "scale(1.45,2.1)", opacity: 0 },
    ],
    800,
    160,
  );
  ringFx(
    card2,
    "cring",
    cv("--ok-l"),
    [
      { transform: "scale(1)", opacity: 0.85 },
      { transform: "scale(1.06)", opacity: 0 },
    ],
    1e3,
  );
  // Hindi binubura ang message: hindi natin alam kung natuloy ang pagsend sa email/SMS app. Babalik sa normal ang button pagkatapos.
  setTimeout(() => {
    sb.classList.remove("ok");
    setIcon(mode === "phone" ? "sms" : "mail");
  }, 2400);
}
function slide(el, text) {
  if (reduce) {
    el.textContent = text;
    return;
  }
  const o = el.animate(
    [
      { opacity: 1, transform: "none" },
      { opacity: 0, transform: "translate3d(0,-10px,0)" },
    ],
    { duration: 130, easing: "ease-in", fill: "forwards" },
  );
  o.onfinish = () => {
    el.textContent = text;
    o.cancel();
    el.animate(
      [
        { opacity: 0, transform: "translate3d(0,12px,0)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 380, easing: EASE, fill: "backwards" },
    );
  };
}
// Email <-> Phone: ang pill, label, icon at card ay sabay nagbabago
function switchMode() {
  mode = mode === "email" ? "phone" : "email";
  const ph = mode === "phone",
    pill = $("pill"),
    pt = $("pt"),
    sb = $("send"),
    dir = ph ? 1 : -1;
  // CSS ang bahala sa kulay (crossfade ng opacity sa .pill::after), kaya walang overlay na nilalagay dito
  pill.classList.toggle("ph", ph);
  if (reduce) {
    pt.textContent = ph ? "SMS" : "Email";
  } else {
    const o = pt.animate(
      [
        { transform: "none", opacity: 1 },
        { transform: "translate3d(" + -dir * 26 + "px,0,0)", opacity: 0 },
      ],
      { duration: 160, easing: "ease-in", fill: "forwards" },
    );
    o.onfinish = () => {
      pt.textContent = ph ? "SMS" : "Email";
      o.cancel();
      pt.animate(
        [
          { transform: "translate3d(" + dir * 26 + "px,0,0)", opacity: 0 },
          { transform: "none", opacity: 1 },
        ],
        { duration: 420, easing: EASE, fill: "backwards" },
      );
    };
  }
  if (!reduce)
    pill.animate(
      [
        { transform: "none" },
        { transform: "scale(1.14,.82)", offset: 0.22 },
        { transform: "scale(.95,1.1)", offset: 0.5 },
        { transform: "scale(1.03,.98)", offset: 0.75 },
        { transform: "none" },
      ],
      { duration: 640, easing: "ease-out" },
    );
  slide($("swl"), ph ? "Switch to Email" : "Switch to SMS");
  if (!sb.disabled && !sb.classList.contains("ok")) {
    slide($("sendt"), ph ? "Send SMS" : "Send now");
    setIcon(ph ? "sms" : "mail");
  }
  if (!reduce) {
    $("sw").animate(
      [
        { transform: "rotate(0) scale(1)" },
        { transform: "rotate(200deg) scale(.88)", offset: 0.5 },
        { transform: "rotate(360deg) scale(1)" },
      ],
      { duration: 620, easing: EASE },
    );
    ringFx(
      card2,
      "cring",
      cv("--a300"),
      [
        { transform: "scale(1)", opacity: 0.7 },
        { transform: "scale(1.04)", opacity: 0 },
      ],
      800,
    );
    box.animate(
      [
        { borderColor: "rgba(" + cv("--bd") + ",.45)" },
        { borderColor: cv("--a300"), offset: 0.3 },
        { borderColor: "rgba(" + cv("--bd") + ",.45)" },
      ],
      { duration: 800 },
    );
  }
}
/* ==========================================================
   13. TOAST
   toast(text) = maliit na message sa ibaba. flag(el) = shake/pula kapag walang laman.
   ========================================================== */
let toastT;
function toast(t, ms) {
  const el = $("toast");
  el.textContent = t;
  el.classList.add("on");
  clearTimeout(toastT);
  toastT = setTimeout(() => el.classList.remove("on"), ms || 3600);
}
function flag(el) {
  el.classList.remove("bad");
  void el.offsetWidth;
  el.classList.add("bad");
}
/* ==========================================================
   14. PAG-SEND NG MESSAGE (+ fallback)
   Email mode: binubuksan ang email app ng bisita (mailto) na nakalagay na ang To, Subject at Message.
   Phone mode: binubuksan ang SMS app ng bisita gamit ang smsNumber.
   ========================================================== */
// Binubuksan ang email/SMS app. Kapag walang app na nagbukas (hal. desktop na walang mail app), kinokopya ang message at may toast na instruction.
function copyText(t) {
  try {
    if (navigator.clipboard)
      return navigator.clipboard.writeText(t).then(
        () => true,
        () => false,
      );
  } catch (e) {}
  return Promise.resolve(false);
}
let appBusy = false; // iwas double-tap na nagbubukas ng app nang dalawang beses
function openApp(url, onOpen, onFail) {
  if (appBusy) return;
  appBusy = true;
  let left = false;
  const mark = () => {
    if (left) return;
    left = true;
    onOpen();
  };
  addEventListener("blur", mark, { once: true });
  document.addEventListener("visibilitychange", mark, { once: true });
  location.href = url;
  setTimeout(() => {
    removeEventListener("blur", mark);
    document.removeEventListener("visibilitychange", mark);
    appBusy = false;
    if (!left) onFail();
  }, 4000); // 4s: may permission prompt ang ibang browser, kaya hindi dapat madaling ideklarang failed
}
function send() {
  const m = msg.value.trim();
  if (!m) {
    flag(box);
    msg.focus({ preventScroll: true });
    toast("Please write a message first.");
    return;
  }
  if (mode === "phone") {
    const sep = IOS ? "&" : "?";
    openApp(
      "sms:" + smsTo() + sep + "body=" + encodeURIComponent(m),
      sentFx,
      () =>
        copyText(m).then((ok) =>
          toast(
            ok
              ? "SMS failed. Message copied. Text " + smsTo()
              : "SMS failed. Text me at " + smsTo(),
          ),
        ),
    );
    return;
  }
  toast("Opening email. Tap Send there to finish.");
  openApp(
    "mailto:" +
      CONFIG.email +
      "?subject=" +
      encodeURIComponent(CONFIG.emailSubject) +
      "&body=" +
      encodeURIComponent(m),
    sentFx,
    () =>
      copyText(m).then((ok) =>
        toast(
          ok
            ? "No email app. Message copied. Email " + CONFIG.email
            : "No email app. Email me at " + CONFIG.email,
        ),
      ),
  );
}
$("send").onclick = send;
// Desktop: Ctrl/Cmd + Enter para mag-send habang nasa textbox
msg.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    send();
  }
});
/* ==========================================================
   15. SAVE CONTACT
   Walang web API na nagsisingit ng contact nang tahimik (ang navigator.contacts ay pambasa/pampili lang, hindi pangsulat).
   Ang pinakamalapit na totoo: iOS = bubukas ang native "Add Contact" card; Android = share sheet (kung suportado), kung hindi, .vcf download;
   Desktop = .vcf download. Nabubuo ang card mula sa CONFIG; walang backend. Hindi sinasabing "saved" hangga't hindi kumpirmado ng user.

   iOS DELIVERY, in order of preference:
     1. A real https URL (contact.vcf) answered by sw.js from the Cache API with Content-Type text/vcard and
        Content-Disposition inline. Safari treats it like a file from a server and opens its native contact card
        (Create New Contact / Add to Existing Contact) with no download step. Needs sw.js beside index.html.
     2. If the service worker is unavailable (private mode, Lockdown Mode, file://, first tap before it is ready):
        navigate to a blob: URL, the previous behaviour.
     3. Tapping Save contact again within 15 seconds opens the share sheet with the .vcf file (iOS 15+), where
        Contacts can be chosen.
   Add to Home Screen (standalone) opens the card in an in-app view with a Done button, so the app is never left stuck.
   Nothing here can confirm that the contact was saved, so the page never says it was.
   ========================================================== */
const saveBtn = $("save"),
  saveSub = $("savesub"),
  saveIdle = saveSub.textContent;
// In-app browsers (Messenger, Facebook, Instagram, TikTok) ay humaharang ng file/share
const IN_APP =
  /FBAN|FBAV|FB_IAB|Instagram|Messenger|TikTok|musical_ly|Bytedance|; wv\)/i.test(
    UA,
  );
const utf8 = new TextEncoder();
const oneLine = (s) =>
  String(s == null ? "" : s)
    .replace(/[\r\n]+/g, " ")
    .trim();
const esc = (s) => oneLine(s).replace(/([\\;,])/g, "\\$1");
const escMulti = (s) =>
  String(s)
    .trim()
    .replace(/\r\n|\r/g, "\n")
    .replace(/([\\;,])/g, "\\$1")
    .replace(/\n/g, "\\n");
// vCard line folding: hanggang 75 octets bawat linya, hindi pinuputol ang UTF-8 character
function fold(line) {
  let out = "",
    cur = "",
    n = 0;
  for (const ch of line) {
    const b = ch.charCodeAt(0) < 128 ? 1 : utf8.encode(ch).length;
    if (n + b > 75) {
      out += cur + "\r\n ";
      cur = "";
      n = 1;
    }
    cur += ch;
    n += b;
  }
  return out + cur;
}
function vcard(photo) {
  const c = CONFIG.contact || {},
    parts = CONFIG.name.trim().split(/\s+/);
  let first = c.firstName,
    last = c.lastName;
  if (!first && !last) {
    last = parts.length > 1 ? parts.pop() : "";
    first = parts.join(" ");
  }
  const full = oneLine(
    ((first || "") + " " + (last || "")).trim() || CONFIG.name,
  );
  const r = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "N:" + esc(last || "") + ";" + esc(first || "") + ";;;",
    "FN:" + esc(full),
  ];
  if (c.company) r.push("ORG:" + esc(c.company));
  if (c.jobTitle) r.push("TITLE:" + esc(c.jobTitle));
  CONFIG.phones.forEach((p, i) => {
    const t = oneLine(p.tel).replace(/[^\d+]/g, "");
    if (t) r.push("TEL;TYPE=CELL,VOICE" + (i ? "" : ",PREF") + ":" + t);
  });
  if (CONFIG.email) r.push("EMAIL;TYPE=INTERNET:" + oneLine(CONFIG.email));
  if (c.website) r.push("URL:" + oneLine(c.website));
  if (c.address) r.push("ADR;TYPE=HOME:;;" + esc(c.address) + ";;;;");
  if (c.note) r.push("NOTE:" + escMulti(c.note));
  [
    ["Facebook", CONFIG.facebook],
    ["Instagram", CONFIG.instagram],
    ["TikTok", CONFIG.tiktok],
  ]
    .filter((x) => x[1])
    .forEach(([label, url], i) =>
      r.push(
        "item" + (i + 1) + ".URL:" + oneLine(url),
        "item" + (i + 1) + ".X-ABLabel:" + label,
      ),
    );
  if (photo) r.push("PHOTO;ENCODING=b;TYPE=JPEG:" + photo);
  r.push("END:VCARD");
  return r.map(fold).join("\r\n") + "\r\n";
}
// Maliit (256px) na JPEG ng profile photo para sa card; kung pumalya, walang photo
function loadPhoto() {
  return new Promise((ok) => {
    if (!CONFIG.photo) return ok("");
    const im = new Image();
    im.onload = () => {
      try {
        const m = Math.min(im.naturalWidth, im.naturalHeight),
          s = Math.min(256, m),
          cv = document.createElement("canvas");
        cv.width = cv.height = s;
        cv.getContext("2d").drawImage(
          im,
          (im.naturalWidth - m) / 2,
          (im.naturalHeight - m) / 2,
          m,
          m,
          0,
          0,
          s,
          s,
        );
        ok(cv.toDataURL("image/jpeg", 0.85).split(",")[1] || "");
      } catch (e) {
        ok("");
      }
    };
    im.onerror = () => ok("");
    im.src = CONFIG.photo;
  });
}
// Inihahanda nang maaga para sync ang click (kailangan ng share sheet ang user gesture)
let vcf = null,
  vcfP = null,
  saving = false;
function prepare() {
  return (
    vcfP ||
    (vcfP = loadPhoto()
      .then((ph) => {
        const name = CONFIG.name.replace(/\s+/g, "-") + ".vcf",
          text = vcard(ph),
          blob = new Blob([text], { type: "text/vcard;charset=utf-8" });
        let file = null;
        try {
          file = new File([blob], name, { type: "text/vcard" });
        } catch (e) {}
        vcf = { blob, file, name, text, swUrl: "" };
        prepareIOS(vcf);
        return vcf;
      })
      .catch((e) => {
        vcfP = null;
        throw e;
      }))
  );
}
setTimeout(prepare, 2500);
// iOS only: register sw.js and store the finished vCard in the Cache API under /contact.vcf. sw.js answers
// navigations to that URL from the cache. Resolves quietly with swUrl = "" on any failure, so the blob route still works.
const VCF_CACHE = "linkertap-vcf-v1";
function prepareIOS(v) {
  if (
    !IOS ||
    IN_APP ||
    !("serviceWorker" in navigator) ||
    !window.caches ||
    !window.Response
  )
    return;
  const url = new URL("contact.vcf", document.baseURI).href;
  Promise.race([
    navigator.serviceWorker
      .register("sw.js")
      .then(() => navigator.serviceWorker.ready)
      .then(() => caches.open(VCF_CACHE))
      .then((c) =>
        c.put(
          url,
          new Response(v.text, {
            headers: {
              "Content-Type": "text/vcard; charset=utf-8",
              "Content-Disposition": 'inline; filename="' + v.name + '"',
              "Cache-Control": "no-store",
            },
          }),
        ),
      )
      .then(() => url),
    new Promise((ok) => setTimeout(() => ok(""), 6000)),
  ]).then(
    (u) => {
      v.swUrl = u || "";
    },
    () => {
      v.swUrl = "";
    },
  );
}
const objUrl = (b) => {
  const u = URL.createObjectURL(b);
  setTimeout(() => URL.revokeObjectURL(u), 60000);
  return u;
};
function setBusy(on) {
  saving = on;
  saveBtn.classList.toggle("busy", on);
  saveBtn.setAttribute("aria-busy", on);
  saveSub.textContent = on ? "Preparing contact" : saveIdle;
}
function download(v) {
  const a = document.createElement("a");
  a.href = objUrl(v.blob);
  a.download = v.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  toast("Contact file ready. Open it to save.");
}
let iosLast = 0;
function deliverIOS(v) {
  const retry = Date.now() - iosLast < 15000;
  iosLast = Date.now();
  // Second tap soon after the first: the card did not open for this person, so offer the share sheet instead.
  if (
    retry &&
    v.file &&
    navigator.canShare &&
    navigator.canShare({ files: [v.file] })
  ) {
    toast("Pick Contacts, then Create New Contact.", 6000);
    return navigator
      .share({ files: [v.file], title: CONFIG.name })
      .then(null, (e) => {
        if (!e || e.name !== "AbortError") location.href = objUrl(v.blob);
      })
      .then(() => setBusy(false));
  }
  const u = v.swUrl || objUrl(v.blob);
  toast("Tap Create New Contact. Nothing opened? Tap Save again.", 6500);
  if (navigator.standalone) {
    // home-screen mode: in-app view with a Done button (iwas ma-stuck). If the popup is blocked, say so instead of navigating away.
    if (!window.open(u, "_blank"))
      toast("Open in Safari to save contact.", 5000);
  } else location.href = u;
  return setTimeout(() => setBusy(false), 1500);
}
function deliver(v) {
  if (IOS) return deliverIOS(v);
  if (
    ANDROID &&
    CONFIG.androidShare &&
    v.file &&
    navigator.canShare &&
    navigator.canShare({ files: [v.file] })
  )
    return navigator
      .share({ files: [v.file], title: CONFIG.name })
      .then(
        () => toast("Shared. Finish saving in that app."),
        (e) => {
          if (!e || e.name !== "AbortError") download(v);
        },
      )
      .then(() => setBusy(false));
  download(v);
  setTimeout(() => setBusy(false), 1200);
}
function saveFail() {
  setBusy(false);
  toast(
    "Couldn’t open contacts. Save manually: " + CONFIG.phones[0].label,
    5000,
  );
}
const run = (v) => {
  try {
    deliver(v);
  } catch (e) {
    saveFail();
  }
};
saveBtn.onclick = () => {
  if (saving) return;
  if (IN_APP)
    return copyText(location.href).then((ok) =>
      toast(
        ok
          ? "This browser can’t save contacts. Link copied. Paste in Safari or Chrome."
          : "This browser can’t save contacts. Open in Safari or Chrome.",
        5000,
      ),
    );
  setBusy(true);
  if (vcf) run(vcf);
  else prepare().then(run, saveFail);
};
/* ==========================================================
   16. OFFLINE
   Nire-register ang sw.js sa lahat ng platform (dati iOS lang, para sa Save contact). Pagkatapos ng unang bukas na may data,
   nabubuksan na ang page kahit walang signal. Ang tel: at sms: ay cellular lang ang kailangan. Ang social links ay kailangan ng data,
   kaya kapag offline, toast ang lalabas imbes na blangkong browser error. (navigator.onLine = false ay maaasahan; ang true ay hindi garantiya.)
   ========================================================== */
if ("serviceWorker" in navigator && location.protocol !== "file:")
  addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
["fb", "ms", "ig", "tt"].forEach((id) =>
  $(id).addEventListener("click", (e) => {
    if (navigator.onLine === false) {
      e.preventDefault();
      toast("No internet. Call and text still work.", 4500);
    }
  }),
);
// Toast nang isang beses bawat phone, kapag nakumpirmang naka-save na ang page para sa offline. Hinihintay muna ang intro animation.
// Titingnan talaga sa cache kung nandoon na ang index.html, kaya hindi ito lalabas kung hindi gumana ang pag-save (hal. walang https).
(function offlineNote() {
  if (
    !("serviceWorker" in navigator) ||
    !window.caches ||
    location.protocol === "file:"
  )
    return;
  const KEY = "offlineNote";
  try {
    if (localStorage.getItem(KEY) === "1") return;
  } catch (e) {}
  navigator.serviceWorker.ready
    .then(() => caches.open("linkertap-static-v1"))
    .then((c) => c.match(new URL("index.html", document.baseURI).href))
    .then((hit) => {
      if (!hit) return;
      setTimeout(() => {
        // huwag sumabat kung may popup o nagta-type
        if (
          document.querySelector(".ov.on") ||
          pvOpen ||
          stage.classList.contains("typing")
        )
          return;
        toast("Saved for offline use.", 4500);
        try {
          localStorage.setItem(KEY, "1");
        } catch (e) {}
      }, 3200);
    })
    .catch(() => {});
})();
/* Harangin ang drag ng pfp, links at icons (hindi na pwedeng i-drop sa tab bar para gawing new tab) */
document.addEventListener("dragstart", (e) => {
  const t = e.target;
  if (t && t.closest && t.closest("input, textarea")) return; // hayaan ang pag-drag ng text sa loob ng message box
  e.preventDefault();
});
/* ==========================================================
   17. MUSIC + SOUNDWAVE + SHARE PROFILE
   17a. Background music: kusang tumutugtog pag-load (loop, walang controls). File = CONFIG.audio.
        Bawal ng browsers ang tunog na walang pindot ng bisita, kaya: sinusubukan muna sa pag-load; kapag hinarang,
        magsisimula sa UNANG tap / click / key ng bisita. Natitigil kapag nakatago ang tab, at bumabalik pag nakita ulit.
   17b. Soundwave: ang maliit na badge sa pfp at ang malaking wave sa ilalim ng pamagat ng kanta (photo viewer).
        Totoong real-time ang galaw (Web Audio AnalyserNode). Kung hindi pwede (hal. file:// o walang Web Audio),
        may kunwaring galaw habang tumutugtog. Kapag walang tunog: tahimik na maliliit na bar.
   17c. Share profile: share sheet na may QR code + built-in share options ng device.
   ========================================================== */
const bgm = $("bgm"),
  hasAudio = !!CONFIG.audio;
let audioFail = false, // hindi ma-load ang file
  hiddenPaused = false, // na-pause dahil nakatago ang tab
  ctx = null,
  an = null,
  fd = null,
  gn = null,
  fadeDone = false,
  analyserOK = false;
// iOS: gawing "playback" ang audio para hindi ma-mute ng silent switch ang tunog na dumadaan sa Web Audio
try {
  if (navigator.audioSession) navigator.audioSession.type = "playback";
} catch (e) {}
// Web Audio graph: audio element -> analyser -> speakers. Hindi ito ginagawa sa file:// (tahimik ang resulta doon).
function initGraph() {
  if (!hasAudio || ctx || location.protocol === "file:") return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  try {
    ctx = new AC();
    const src = ctx.createMediaElementSource(bgm);
    an = ctx.createAnalyser();
    an.fftSize = 256;
    an.smoothingTimeConstant = 0.7;
    an.minDecibels = -88;
    an.maxDecibels = -16;
    gn = ctx.createGain();
    gn.gain.value = fadeDone ? 1 : 0;
    src.connect(an);
    an.connect(gn);
    gn.connect(ctx.destination);
    fd = new Uint8Array(an.frequencyBinCount);
    analyserOK = true;
  } catch (e) {
    ctx = an = fd = gn = null;
    analyserOK = false;
  }
}
// Kailangan pa ba ng AudioContext? (wala sa file:// o kung walang Web Audio)
const needsCtx =
  !!(window.AudioContext || window.webkitAudioContext) &&
  location.protocol !== "file:";
const unlocked = () =>
  !bgm.paused && (!needsCtx || (ctx && ctx.state === "running"));
// fromGesture = true kapag galing sa pindot ng bisita. Ang AudioContext ay ginagawa LANG pagkatapos ng pindot,
// kaya wala nang "AudioContext was not allowed to start" na babala, at kung pinayagan na ng browser ang autoplay,
// tumutugtog agad ang music bago pa mag-tap.
function tryPlay(fromGesture) {
  if (!hasAudio || audioFail) return;
  if (fromGesture) initGraph();
  if (!gn && !fadeDone) bgm.volume = 0; // walang Web Audio: sa element volume ang fade
  if (ctx && ctx.state !== "running") {
    try {
      ctx.resume().catch(() => {});
    } catch (e) {}
  }
  const p = bgm.play();
  if (p && p.then)
    p.then(
      () => setTimeout(() => unlocked() && disarm(), 300),
      () => arm(),
    );
}
// Hinihintay ang unang pindot ng bisita kapag hinarang ang autoplay
const GESTURES = [
    "pointerdown",
    "mousedown",
    "pointerup",
    "touchend",
    "click",
    "keydown",
  ],
  GO = { capture: true, passive: true };
let armed = false;
function onGesture() {
  if (document.hidden) return;
  tryPlay(true);
  setTimeout(() => unlocked() && disarm(), 500);
}
function arm() {
  if (armed) return;
  armed = true;
  GESTURES.forEach((g) => addEventListener(g, onGesture, GO));
}
function disarm() {
  if (!armed) return;
  armed = false;
  GESTURES.forEach((g) => removeEventListener(g, onGesture, GO));
}
// FADE IN: dahan-dahang tumataas ang volume pagsimula ng music (CONFIG.audioFadeIn, segundo). Gain node ang gamit para gumana pati sa iOS.
const FADE = Math.max(
  0,
  +(CONFIG.audioFadeIn == null ? 2.5 : CONFIG.audioFadeIn) || 0,
);
const volTarget = () =>
  Math.min(
    1,
    Math.max(0, CONFIG.audioVolume == null ? 0.8 : CONFIG.audioVolume),
  );
function fadeIn(sec) {
  if (!(sec > 0)) {
    if (gn) gn.gain.value = 1;
    else bgm.volume = volTarget();
    return;
  }
  if (gn && ctx) {
    try {
      const t = ctx.currentTime,
        N = 48,
        curve = new Float32Array(N);
      for (let i = 0; i < N; i++) {
        const x = i / (N - 1);
        curve[i] = x * x * (3 - 2 * x);
      }
      gn.gain.cancelScheduledValues(t);
      gn.gain.setValueAtTime(0, t);
      gn.gain.setValueCurveAtTime(curve, t, sec);
    } catch (e) {
      gn.gain.value = 1;
    }
    return;
  }
  const tgt = volTarget(),
    t0 = performance.now();
  bgm.volume = 0;
  (function step(now) {
    const x = Math.min(1, (now - t0) / (sec * 1000));
    bgm.volume = tgt * x * x * (3 - 2 * x);
    if (x < 1) requestAnimationFrame(step);
  })(t0);
}
if (hasAudio) {
  bgm.src = CONFIG.audio;
  bgm.loop = true;
  bgm.volume = volTarget();
  bgm.addEventListener("playing", () => {
    if (fadeDone) return;
    fadeDone = true;
    fadeIn(FADE);
  });
  bgm.addEventListener("error", () => {
    audioFail = true;
  });
  arm();
  tryPlay();
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (!bgm.paused) {
        hiddenPaused = true;
        bgm.pause();
      }
    } else if (hiddenPaused) {
      hiddenPaused = false;
      tryPlay();
      fadeIn(Math.min(FADE, 1));
    }
  });
}

/* ---- MUTE / UNMUTE (photo viewer) ----
   Naaalala ang pinili ng bisita (localStorage). Kapag muted, kalmado ang soundwave. */
const pvmute = $("pvmute"),
  pvmt = $("pvmutet");
pvmute.hidden = !hasAudio;
try {
  if (hasAudio && localStorage.getItem("lc-muted") === "1") bgm.muted = true;
} catch (e) {}
function syncMute(anim) {
  const m = !!bgm.muted;
  pvmute.classList.toggle("off", m);
  pvmute.setAttribute("aria-pressed", m ? "true" : "false");
  pvmute.setAttribute("aria-label", m ? "Unmute music" : "Mute music");
  const t = m ? "Unmute" : "Mute";
  if (anim && !reduce && pvmt.textContent !== t) {
    // label: umaakyat palabas, tapos ang bago ay umaakyat papasok (malambot, walang bounce)
    const o = pvmt.animate(
      [
        { opacity: 1, transform: "none" },
        { opacity: 0, transform: "translate3d(0,-7px,0)" },
      ],
      { duration: 160, easing: "ease-in", fill: "forwards" },
    );
    o.onfinish = () => {
      pvmt.textContent = t;
      o.cancel();
      pvmt.animate(
        [
          { opacity: 0, transform: "translate3d(0,8px,0)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 420, easing: EASE },
      );
    };
  } else pvmt.textContent = t;
  // makintab na guhit na dumadaan sa button
  if (anim && !reduce) {
    pvmute.classList.remove("fx");
    void pvmute.offsetWidth;
    pvmute.classList.add("fx");
  }
}

pvmute.addEventListener("animationend", (e) => {
  if (e.animationName === "pmsweep") pvmute.classList.remove("fx");
});
pvmute.addEventListener("click", (e) => {
  e.stopPropagation(); // huwag isara ang viewer
  bgm.muted = !bgm.muted;
  try {
    localStorage.setItem("lc-muted", bgm.muted ? "1" : "0");
  } catch (e2) {}
  if (!bgm.muted) tryPlay(true);
  syncMute(true);
});

/* ---- 17b. SOUNDWAVE ---- */
const wvViews = [
  { c: $("wvc"), kind: "badge", h: [], bar: "#fff" }, // badge sa pfp
  { c: $("pvdc"), kind: "badge", h: [], bar: "#fff" }, // badge sa pfp na lumilipad (photo viewer)
  { c: $("pvwave"), kind: "wave", h: [] }, // malaking wave sa ilalim ng pamagat
];
const col = { ic: "#fff", a1: "#8fb0ff", a2: "#4a78f0" };
const readCols = () => {
  col.ic = cv("--ic") || "#fff";
  col.a1 = cv("--a200") || "#b9cdff";
  col.a2 = cv("--a500") || "#4a78f0";
};
readCols();
document.addEventListener("modechange", readCols);
// Lahat ng bar ay bilugan ang dulo
function bar(g, x, y, w, h) {
  const r = Math.min(w / 2, h / 2);
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
  g.fill();
}
// n antas (0 hanggang 1) mula sa frequency data: bass sa kaliwa, treble sa kanan (log scale)
function levels(n, t, live) {
  const out = new Array(n);
  if (live) {
    const lo = 1,
      hi = Math.min(fd.length - 1, 92);
    for (let i = 0; i < n; i++) {
      const a = lo * Math.pow(hi / lo, i / n),
        b = lo * Math.pow(hi / lo, (i + 1) / n),
        i0 = Math.floor(a),
        i1 = Math.max(i0 + 1, Math.ceil(b));
      let mx = 0,
        sum = 0,
        c = 0;
      for (let k = i0; k < i1 && k <= hi; k++) {
        mx = Math.max(mx, fd[k]);
        sum += fd[k];
        c++;
      }
      const v = (0.6 * mx + 0.4 * (sum / c)) / 255;
      out[i] = Math.min(1, Math.pow(v, 1.5) * (1 + 0.9 * (i / n)));
    }
  } else if (!bgm.paused && !audioFail && !bgm.muted) {
    // kunwaring galaw (walang analyser): may "beat" at kaunting ingay
    const beat = Math.pow(Math.max(0, Math.sin(t * 5.2)), 3);
    for (let i = 0; i < n; i++)
      out[i] =
        0.16 +
        0.34 *
          (0.5 + 0.5 * Math.sin(t * 3.1 + i * 1.37)) *
          (0.5 + 0.5 * Math.sin(t * 1.9 + i * 0.71)) +
        0.28 * beat * (1 - i / n) +
        0.08 * Math.random();
  } else {
    // tahimik: maliliit na bar na dahan-dahang gumagalaw
    for (let i = 0; i < n; i++)
      out[i] = 0.07 + 0.035 * Math.sin(t * 1.6 + i * 0.9);
  }
  return out;
}
const ease3 = (x) => x * x * (3 - 2 * x);
let wvLast = 0;
function wvFrame(now) {
  requestAnimationFrame(wvFrame);
  const dt = Math.min(0.06, Math.max(0.001, (now - wvLast) / 1000));
  wvLast = now;
  const t = now / 1000,
    dpr = Math.min(2, window.devicePixelRatio || 1);
  const live =
    analyserOK &&
    ctx &&
    ctx.state === "running" &&
    !bgm.paused &&
    !audioFail &&
    !bgm.muted;
  if (live) an.getByteFrequencyData(fd);
  const calm = !live && (bgm.paused || bgm.muted || audioFail);
  // pagbukas ng viewer: lumalaki ang mga bar mula sa baba pagkatapos lumapag ang photo
  const rise = pvOpen
    ? ease3(Math.min(1, Math.max(0, (now - pvT0 - 380) / 900)))
    : 0;
  for (const v of wvViews) {
    const c = v.c,
      cw = c.clientWidth,
      ch = c.clientHeight;
    if (!cw || !ch) continue; // nakatago (hal. photo viewer na sarado)
    const W = Math.round(cw * dpr),
      H = Math.round(ch * dpr);
    if (c.width !== W || c.height !== H) {
      c.width = W;
      c.height = H;
    }
    const g = c.getContext("2d");
    g.clearRect(0, 0, W, H);
    const wave = v.kind === "wave";
    // wave: simetrikal (bass sa gitna, treble palabas), laging odd ang dami ng bar. badge: 5 bar.
    const bw = wave ? 3 * dpr : 0,
      gap = wave ? 3.5 * dpr : 0;
    let nb = wave
      ? Math.max(
          11,
          Math.min(47, Math.floor((W - 24 * dpr + gap) / (bw + gap))),
        )
      : 4;
    if (wave && nb % 2 === 0) nb--;
    const m = wave ? (nb + 1) / 2 : 4;
    const lv = levels(m, t, live);
    if (v.h.length !== m) v.h = lv.slice();
    // smoothing: mabilis umakyat, dahan-dahang bumaba
    for (let i = 0; i < m; i++) {
      const k = 1 - Math.exp(-dt / (lv[i] > v.h[i] ? 0.035 : 0.2));
      v.h[i] += (lv[i] - v.h[i]) * k;
    }
    if (wave) {
      const total = nb * bw + (nb - 1) * gap,
        x0 = (W - total) / 2,
        cen = (nb - 1) / 2;
      const grad = g.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0, col.a2);
      grad.addColorStop(0.5, col.a1);
      grad.addColorStop(1, col.a2);
      g.fillStyle = grad;
      for (let i = 0; i < nb; i++) {
        const d = Math.round(Math.abs(i - cen)),
          lvl = v.h[d],
          fall = 1 - 0.55 * (d / cen),
          h = bw + Math.min(H * 0.86 - bw, lvl * fall * H * rise);
        g.globalAlpha = Math.min(
          1,
          ((calm ? 0.4 : 0.65) + 0.35 * Math.min(1, lvl * 1.4)) *
            (1 - 0.6 * (d / cen)),
        );
        bar(g, x0 + i * (bw + gap), (H - h) / 2, bw, h);
      }
      g.globalAlpha = 1;
    } else {
      // badge: 4 makakapal na bar sa loob ng bilog, mas malaki ang galaw para kita agad ang soundwave
      const area = W * 0.5,
        gp = W * 0.06,
        w = (area - gp * 3) / 4,
        x0 = (W - area) / 2,
        edge = [0.82, 1, 1, 0.82];
      g.fillStyle = v.bar || col.ic;
      for (let i = 0; i < 4; i++) {
        const lv2 = Math.min(1, v.h[i] * 1.4),
          h = Math.max(w, H * (0.17 + 0.35 * lv2) * edge[i]);
        bar(g, x0 + i * (w + gp), (H - h) / 2, w, h);
      }
    }
  }
}
requestAnimationFrame(wvFrame);

/* ---- 17c. SHARE PROFILE ---- */
// Ang link na ishe-share: CONFIG.shareUrl, o ang link ng page na binuksan (walang ?theme / ?mode)
const shareUrl = () =>
  CONFIG.shareUrl ||
  (location.protocol === "file:"
    ? location.href
    : location.origin + location.pathname);
const shareEl = $("shareov");
// Tinatandaan kung bukas ang share sheet (kahit Esc o labas ang pinindot) para sumabay ang pause + top bar
new MutationObserver(() => {
  shareOpen = shareEl.classList.contains("on");
  syncPause();
}).observe(shareEl, { attributes: true, attributeFilter: ["class"] });
const canShare = !!navigator.share;
$("shname").textContent = CONFIG.name;
// walang built-in share (hal. desktop Firefox): Copy link na lang ang pangunahing button
if (!canShare) {
  $("shnative").hidden = true;
  $("shcopy").classList.remove("alt");
}
function copyLink() {
  const u = shareUrl();
  return copyText(u).then((ok) =>
    toast(ok ? "Link copied." : "Couldn’t copy. Link: " + u, ok ? 2600 : 6000),
  );
}
// Built-in share sheet ng device (Messenger, Messages, AirDrop, WhatsApp, etc.)
function nativeShare() {
  if (!canShare) return copyLink();
  return navigator
    .share({
      title: CONFIG.name + " | Let’s Connect",
      text: CONFIG.shareText || "",
      url: shareUrl(),
    })
    .then(null, (e) => {
      if (!e || e.name !== "AbortError") copyLink(); // AbortError = isinara lang ng bisita
    });
}
let qrFor = "";
function buildQR() {
  const u = shareUrl();
  if (qrFor === u) return;
  qrFor = u;
  const svg = qrSvg(u);
  $("qrw").innerHTML = svg || "";
  $("qrw").hidden = !svg;
}
// Ang sheet ay lumalaki mula sa share button papunta sa gitna (kapareho ng pfp / call popup) at bumabalik doon pagsara.
let shBusy = false;
function shGeom() {
  const b = $("tshare").getBoundingClientRect(),
    r = $("shsheet").getBoundingClientRect();
  const dx = b.left + b.width / 2 - (r.left + r.width / 2),
    dy = b.top + b.height / 2 - (r.top + r.height / 2);
  const ix = Math.max(0, (r.width - b.width) / 2),
    iy = Math.max(0, (r.height - b.height) / 2),
    rad = b.width / 2;
  return {
    from: "translate3d(" + dx + "px," + dy + "px,0)",
    clipFrom:
      "inset(" +
      iy +
      "px " +
      ix +
      "px " +
      iy +
      "px " +
      ix +
      "px round " +
      rad +
      "px)",
    clipTo: "inset(0px 0px 0px 0px round 28px)",
  };
}
function openShare() {
  if (shBusy || shareEl.classList.contains("on")) return;
  buildQR();
  show(shareEl);
  // Phone / tablet: sabay na lumalabas ang built-in share options ng device. Nasa likod nito ang sheet na may QR code.
  if (canShare && coarse) nativeShare();
  if (reduce) return;
  const sh = $("shsheet"),
    bg = $("sbg"),
    g = shGeom();
  shBusy = true;
  sh.style.willChange = "transform, clip-path";
  bg.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: 300,
    easing: "ease",
  });
  sh.animate(
    [
      { transform: g.from, clipPath: g.clipFrom },
      { transform: "none", clipPath: g.clipTo },
    ],
    { duration: 480, easing: EASE },
  ).onfinish = () => {
    sh.style.willChange = "";
    shBusy = false;
  };
  sh.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: 160,
    easing: "ease-out",
  });
  [...sh.children].forEach((el, i) =>
    el.animate(
      [
        { opacity: 0, transform: "translate3d(0,16px,0) scale(.97)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 420, delay: 120 + i * 50, easing: EASE, fill: "backwards" },
    ),
  );
}
function closeShare() {
  if (shBusy || !shareEl.classList.contains("on")) return;
  if (reduce) return hide(shareEl);
  shBusy = true;
  const sh = $("shsheet"),
    bg = $("sbg"),
    g = shGeom(),
    D = 340;
  // bumabalik ang top bar habang lumiliit ang sheet papunta sa button
  setTimeout(() => {
    shareOpen = false;
    syncPause();
  }, D * 0.5);
  [...sh.children].forEach((el) =>
    el.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 120,
      easing: "ease-in",
      fill: "forwards",
    }),
  );
  bg.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: 280,
    delay: 60,
    easing: "ease",
    fill: "forwards",
  });
  sh.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: 170,
    delay: D - 170,
    easing: "ease-in",
    fill: "forwards",
  });
  sh.animate(
    [
      { transform: "none", clipPath: g.clipTo },
      { transform: g.from, clipPath: g.clipFrom },
    ],
    { duration: D, easing: EASE, fill: "forwards" },
  ).onfinish = () => {
    [sh, bg, ...sh.children].forEach((el) =>
      el.getAnimations().forEach((a) => a.cancel()),
    );
    hide(shareEl);
    shBusy = false;
  };
}
$("tshare").addEventListener("click", openShare);
$("shnative").addEventListener("click", nativeShare);
$("shcopy").addEventListener("click", copyLink);

/* QR CODE GENERATOR (walang library, offline): byte mode, error correction M, version 1 hanggang 10 (hanggang ~213 characters).
   qrSvg(text) = SVG string, o "" kung masyadong mahaba ang link. */
function qrSvg(text) {
  const data = Array.from(new TextEncoder().encode(text));
  const ECC = [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26], // ecc codewords bawat block (level M)
    BLK = [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5]; // dami ng blocks (level M)
  const raw = (v) => {
    let r = (16 * v + 128) * v + 64;
    if (v >= 2) {
      const n = Math.floor(v / 7) + 2;
      r -= (25 * n - 10) * n - 55;
      if (v >= 7) r -= 36;
    }
    return r;
  };
  let ver = 1,
    cap = 0;
  for (; ; ver++) {
    if (ver > 10) return "";
    cap = Math.floor(raw(ver) / 8) - ECC[ver] * BLK[ver];
    if (4 + (ver < 10 ? 8 : 16) + data.length * 8 <= cap * 8) break;
  }
  // 1) data bits
  const bits = [],
    put = (v, n) => {
      for (let i = n - 1; i >= 0; i--) bits.push((v >>> i) & 1);
    };
  put(4, 4);
  put(data.length, ver < 10 ? 8 : 16);
  data.forEach((b) => put(b, 8));
  put(0, Math.min(4, cap * 8 - bits.length));
  while (bits.length % 8) bits.push(0);
  for (let pad = 0xec; bits.length < cap * 8; pad ^= 0xec ^ 0x11) put(pad, 8);
  const cw = [];
  for (let i = 0; i < bits.length; i += 8)
    cw.push(parseInt(bits.slice(i, i + 8).join(""), 2));
  // 2) Reed-Solomon error correction
  const EXP = new Array(512),
    LOG = new Array(256);
  for (let i = 0, x = 1; i < 255; i++) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 256) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  const mul = (a, b) => (a && b ? EXP[LOG[a] + LOG[b]] : 0);
  const rs = (d, n) => {
    let g = [1];
    for (let i = 0; i < n; i++) {
      const nx = new Array(g.length + 1).fill(0);
      for (let j = 0; j < g.length; j++) {
        nx[j] ^= g[j];
        nx[j + 1] ^= mul(g[j], EXP[i]);
      }
      g = nx;
    }
    const r = new Array(n).fill(0);
    for (const b of d) {
      const f = b ^ r[0];
      r.shift();
      r.push(0);
      for (let i = 0; i < n; i++) r[i] ^= mul(g[i + 1], f);
    }
    return r;
  };
  // 3) hati sa blocks at i-interleave
  const nb = BLK[ver],
    ecl = ECC[ver],
    total = Math.floor(raw(ver) / 8),
    shortLen = Math.floor(total / nb),
    nShort = nb - (total % nb),
    blocks = [];
  for (let i = 0, k = 0; i < nb; i++) {
    const dl = shortLen - ecl + (i < nShort ? 0 : 1),
      d = cw.slice(k, k + dl);
    k += dl;
    blocks.push({ d, e: rs(d, ecl) });
  }
  const all = [];
  for (let i = 0; i <= shortLen - ecl; i++)
    blocks.forEach((b) => i < b.d.length && all.push(b.d[i]));
  for (let i = 0; i < ecl; i++) blocks.forEach((b) => all.push(b.e[i]));
  // 4) matrix: function patterns
  const N = ver * 4 + 17,
    mk = () => Array.from({ length: N }, () => new Array(N).fill(false)),
    M = mk(),
    FN = mk(),
    setF = (x, y, v) => {
      M[y][x] = v;
      FN[y][x] = true;
    };
  for (let i = 0; i < N; i++) {
    setF(6, i, i % 2 === 0);
    setF(i, 6, i % 2 === 0);
  }
  const finder = (cx, cy) => {
    for (let dy = -4; dy <= 4; dy++)
      for (let dx = -4; dx <= 4; dx++) {
        const d = Math.max(Math.abs(dx), Math.abs(dy)),
          x = cx + dx,
          y = cy + dy;
        if (x >= 0 && x < N && y >= 0 && y < N) setF(x, y, d !== 2 && d !== 4);
      }
  };
  finder(3, 3);
  finder(N - 4, 3);
  finder(3, N - 4);
  const na = ver > 1 ? Math.floor(ver / 7) + 2 : 0;
  let pos = [];
  if (na) {
    const step = Math.ceil((ver * 4 + 4) / (na * 2 - 2)) * 2;
    pos = [6];
    for (let p = N - 7; pos.length < na; p -= step) pos.splice(1, 0, p);
  }
  for (let i = 0; i < pos.length; i++)
    for (let j = 0; j < pos.length; j++) {
      if (
        (i === 0 && j === 0) ||
        (i === 0 && j === pos.length - 1) ||
        (i === pos.length - 1 && j === 0)
      )
        continue;
      for (let dy = -2; dy <= 2; dy++)
        for (let dx = -2; dx <= 2; dx++)
          setF(
            pos[i] + dx,
            pos[j] + dy,
            Math.max(Math.abs(dx), Math.abs(dy)) !== 1,
          );
    }
  const bit = (x, i) => ((x >>> i) & 1) !== 0;
  const fmtBits = (g, mask) => {
    const d = (0 << 3) | mask; // level M = 0
    let r = d;
    for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537);
    const b = ((d << 10) | r) ^ 0x5412;
    for (let i = 0; i <= 5; i++) g[i][8] = bit(b, i);
    g[7][8] = bit(b, 6);
    g[8][8] = bit(b, 7);
    g[8][7] = bit(b, 8);
    for (let i = 9; i < 15; i++) g[8][14 - i] = bit(b, i);
    for (let i = 0; i < 8; i++) g[8][N - 1 - i] = bit(b, i);
    for (let i = 8; i < 15; i++) g[N - 15 + i][8] = bit(b, i);
    g[N - 8][8] = true;
  };
  fmtBits(M, 0);
  for (let i = 0; i <= 5; i++) FN[i][8] = FN[8][i] = true;
  FN[7][8] = FN[8][8] = FN[8][7] = true;
  for (let i = 9; i < 15; i++) FN[8][14 - i] = FN[14 - i][8] = true;
  for (let i = 0; i < 8; i++) FN[8][N - 1 - i] = FN[N - 1 - i][8] = true;
  for (let i = 8; i < 15; i++) FN[N - 15 + i][8] = FN[8][N - 15 + i] = true;
  M[N - 8][8] = true;
  FN[N - 8][8] = true;
  if (ver >= 7) {
    let r = ver;
    for (let i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1f25);
    const b = (ver << 12) | r;
    for (let i = 0; i < 18; i++) {
      const a = N - 11 + (i % 3),
        c = Math.floor(i / 3);
      setF(a, c, bit(b, i));
      setF(c, a, bit(b, i));
    }
  }
  // 5) ilagay ang data (zigzag)
  for (let i = 0, right = N - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < N; vert++)
      for (let j = 0; j < 2; j++) {
        const x = right - j,
          y = ((right + 1) & 2) === 0 ? N - 1 - vert : vert;
        if (!FN[y][x] && i < all.length * 8) {
          M[y][x] = bit(all[i >>> 3], 7 - (i & 7));
          i++;
        }
      }
  }
  // 6) pumili ng pinakamagandang mask (pinakamababang penalty)
  const MASK = [
    (x, y) => (x + y) % 2 === 0,
    (x, y) => y % 2 === 0,
    (x, y) => x % 3 === 0,
    (x, y) => (x + y) % 3 === 0,
    (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
    (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
    (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
    (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
  ];
  const withMask = (m) => {
    const g = M.map((r) => r.slice());
    for (let y = 0; y < N; y++)
      for (let x = 0; x < N; x++)
        if (!FN[y][x] && MASK[m](x, y)) g[y][x] = !g[y][x];
    fmtBits(g, m);
    return g;
  };
  const penalty = (g) => {
    let r = 0,
      dark = 0;
    for (let t = 0; t < 2; t++)
      for (let a = 0; a < N; a++) {
        let run = 1;
        for (let b = 1; b < N; b++) {
          const c = t ? g[b][a] : g[a][b],
            q = t ? g[b - 1][a] : g[a][b - 1];
          if (c === q) {
            run++;
            if (run === 5) r += 3;
            else if (run > 5) r++;
          } else run = 1;
        }
      }
    for (let y = 0; y < N; y++)
      for (let x = 0; x < N; x++) {
        if (g[y][x]) dark++;
        if (
          x < N - 1 &&
          y < N - 1 &&
          g[y][x] === g[y][x + 1] &&
          g[y][x] === g[y + 1][x] &&
          g[y][x] === g[y + 1][x + 1]
        )
          r += 3;
      }
    const P = [1, 0, 1, 1, 1, 0, 1],
      lt = (t, a, b) => (b < 0 || b >= N ? true : !(t ? g[b][a] : g[a][b]));
    for (let t = 0; t < 2; t++)
      for (let a = 0; a < N; a++)
        for (let i = 0; i + 7 <= N; i++) {
          if (!P.every((v, k) => (t ? g[i + k][a] : g[a][i + k]) === !!v))
            continue;
          if (
            [1, 2, 3, 4].every((k) => lt(t, a, i - k)) ||
            [0, 1, 2, 3].every((k) => lt(t, a, i + 7 + k))
          )
            r += 40;
        }
    r += (Math.ceil(Math.abs(dark * 20 - N * N * 10) / (N * N)) - 1) * 10;
    return r;
  };
  let best = null,
    bp = 1e9;
  for (let m = 0; m < 8; m++) {
    const g = withMask(m),
      p = penalty(g);
    if (p < bp) {
      bp = p;
      best = g;
    }
  }
  // 7) SVG (may 4 module na puting gilid)
  let d = "";
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++)
      if (best[y][x]) d += "M" + x + " " + y + "h1v1h-1z";
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 ' +
    (N + 8) +
    " " +
    (N + 8) +
    '" shape-rendering="crispEdges"><rect x="-4" y="-4" width="' +
    (N + 8) +
    '" height="' +
    (N + 8) +
    '" fill="#fff"/><path d="' +
    d +
    '" fill="#000"/></svg>'
  );
}