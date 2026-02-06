document.addEventListener("DOMContentLoaded", () => {

  // =========================
  // Menú hamburguesa (móvil)
  // =========================
  const header = document.querySelector(".header");
  const menuBtn = document.getElementById("menuBtn");
  const mnav = document.getElementById("mnav");

  const openMenu = () => {
    if (!header || !menuBtn || !mnav) return;
    header.classList.add("is-menu-open");
    mnav.classList.add("is-open");
    menuBtn.setAttribute("aria-expanded", "true");
    mnav.setAttribute("aria-hidden", "false");
  };

  const closeMenu = () => {
    if (!header || !menuBtn || !mnav) return;
    header.classList.remove("is-menu-open");
    mnav.classList.remove("is-open");
    menuBtn.setAttribute("aria-expanded", "false");
    mnav.setAttribute("aria-hidden", "true");
  };

  if (menuBtn && mnav && header) {
    menuBtn.addEventListener("click", () => {
      const isOpen = mnav.classList.contains("is-open");
      isOpen ? closeMenu() : openMenu();
    });

    // click fuera (backdrop)
    mnav.addEventListener("click", (e) => {
      const t = e.target;
      if (t && t.getAttribute && t.getAttribute("data-close") === "1") closeMenu();
    });

    // ESC
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    // si vuelves a desktop, cerrar
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) closeMenu();
    });
  }

  // =========================
  // Navegación + Netflix Slide
  // =========================
  let isTransitioning = false;

  // Orden del menú (para saber si vas hacia adelante o atrás)
  const PAGE_ORDER = ["inicio", "servicios", "portafolio", "quienes", "clientes", "cotizacion"];

  function setActiveNav(pageName) {
    // Desktop
    document.querySelectorAll(".navlink").forEach(a => a.classList.remove("is-active"));
    document.querySelector(`.navlink[data-page="${pageName}"]`)?.classList.add("is-active");

    // Móvil (panel)
    document.querySelectorAll(".mnav-link").forEach(a => a.classList.remove("is-active"));
    document.querySelector(`.mnav-link[data-page="${pageName}"]`)?.classList.add("is-active");
  }

  function getPage(name) {
    return document.getElementById(`page-${name}`);
  }

  function getCurrentName() {
    const current = document.querySelector(".page.is-active");
    if (!current) return "inicio";
    const id = current.id || "";
    return id.replace("page-", "") || "inicio";
  }

  function cleanupAnimClasses(el) {
    if (!el) return;
    el.classList.remove(
      "enter-from-right", "enter-from-left",
      "leave-to-left", "leave-to-right"
    );
  }

  function showPage(pageName, { immediate = false } = {}) {
    if (isTransitioning && !immediate) return;

    const current = document.querySelector(".page.is-active");
    const next = getPage(pageName);
    if (!next || next === current) return;

    const currentName = getCurrentName();
    const fromIndex = PAGE_ORDER.indexOf(currentName);
    const toIndex = PAGE_ORDER.indexOf(pageName);

    // Dirección tipo Netflix
    const forward = (toIndex === -1 || fromIndex === -1) ? true : (toIndex > fromIndex);

    const enterClass = forward ? "enter-from-right" : "enter-from-left";
    const leaveClass = forward ? "leave-to-left" : "leave-to-right";

    setActiveNav(pageName);

    // ✅ si estás en móvil, cerrar menú al navegar
    closeMenu();

    if (immediate) {
      document.querySelectorAll(".page").forEach(p => {
        p.classList.remove("is-active");
        cleanupAnimClasses(p);
      });
      next.classList.add("is-active");
      return;
    }

    isTransitioning = true;

    // Limpieza previa
    cleanupAnimClasses(next);

    // 1) Preparar next con “estado de entrada”
    next.classList.add("is-active");
    next.classList.add(enterClass);

    // Forzar reflow
    void next.offsetWidth;

    // 2) Animar hacia el centro y sacar current
    requestAnimationFrame(() => {
      next.classList.remove(enterClass);

      if (current) {
        cleanupAnimClasses(current);
        current.classList.add(leaveClass);
      }

      const DURATION = 700; // un poco mayor a 650ms
      setTimeout(() => {
        if (current) {
          current.classList.remove("is-active");
          cleanupAnimClasses(current);
        }
        cleanupAnimClasses(next);
        isTransitioning = false;

        // ✅ como el scroll es dentro de .page, lo reiniciamos aquí:
        next.scrollTo({ top: 0, behavior: "auto" });
      }, DURATION);
    });
  }

  // =========================
  // Clicks del menú (Desktop)
  // =========================
  document.querySelectorAll(".navlink[data-page]").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      showPage(link.dataset.page);
    });
  });

  // =========================
  // Clicks del menú (Móvil)
  // =========================
  document.querySelectorAll(".mnav-link[data-page]").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      showPage(link.dataset.page);
    });
  });

  // ✅ BRAND HOME (logo + publicidad integral) -> INICIO
  document.querySelector(".brand-home[data-page]")?.addEventListener("click", (e) => {
    e.preventDefault();
    showPage("inicio");
  });

  // Botón directo a cotización
  document.getElementById("btnIrCotizacion")?.addEventListener("click", () => showPage("cotizacion"));

  // Inicial
  showPage("inicio", { immediate: true });

  // =========================
  // Gmail / Outlook / Copiar
  // =========================
  const DESTINO = "arte1@yjpublicidad.pe";
  const $ = (id) => document.getElementById(id);

  function getData() {
    return {
      nombre: ($("nombre")?.value || "").trim(),
      email: ($("email")?.value || "").trim(),
      telefonos: ($("telefonos")?.value || "").trim(),
      mensaje: ($("mensaje")?.value || "").trim(),
    };
  }

  function buildSubject(data) {
    const base = "Cotización - YJ Publicidad";
    const from = data.nombre ? ` | ${data.nombre}` : "";
    return base + from;
  }

  function buildBody(data) {
    return [
      "Hola YJ Publicidad,",
      "",
      "Quisiera una cotización con los siguientes datos:",
      "",
      `Nombre: ${data.nombre || "-"}`,
      `Email: ${data.email || "-"}`,
      `Teléfonos: ${data.telefonos || "-"}`,
      "",
      "Mensaje:",
      data.mensaje || "-",
      "",
      "Enviado desde la web de YJ Publicidad.",
    ].join("\n");
  }

  function openGmail() {
    const data = getData();
    const subject = encodeURIComponent(buildSubject(data));
    const body = encodeURIComponent(buildBody(data));
    const to = encodeURIComponent(DESTINO);

    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`;
    window.open(url, "_blank", "noopener");
  }

  function openOutlook() {
    const data = getData();
    const subject = encodeURIComponent(buildSubject(data));
    const body = encodeURIComponent(buildBody(data));
    const to = encodeURIComponent(DESTINO);

    const url = `https://outlook.office.com/mail/deeplink/compose?to=${to}&subject=${subject}&body=${body}`;
    window.open(url, "_blank", "noopener");
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(DESTINO);
      const btn = $("copyEmail");
      if (btn) {
        const old = btn.textContent;
        btn.textContent = "¡Copiado!";
        setTimeout(() => (btn.textContent = old), 1200);
      }
    } catch {
      alert("No se pudo copiar automáticamente. Copia manualmente: " + DESTINO);
    }
  }

  $("sendGmail")?.addEventListener("click", openGmail);
  $("sendOutlook")?.addEventListener("click", openOutlook);
  $("copyEmail")?.addEventListener("click", copyEmail);
});
