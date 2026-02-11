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

    mnav.addEventListener("click", (e) => {
      if (e.target?.getAttribute("data-close") === "1") closeMenu();
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) closeMenu();
    });
  }

  // =========================
  // Navegación tipo Netflix
  // =========================
  let isTransitioning = false;
  const PAGE_ORDER = ["inicio", "servicios", "portafolio", "quienes", "clientes", "cotizacion"];

  function setActiveNav(pageName) {
    document.querySelectorAll(".navlink").forEach(a => a.classList.remove("is-active"));
    document.querySelector(`.navlink[data-page="${pageName}"]`)?.classList.add("is-active");

    document.querySelectorAll(".mnav-link").forEach(a => a.classList.remove("is-active"));
    document.querySelector(`.mnav-link[data-page="${pageName}"]`)?.classList.add("is-active");
  }

  function getPage(name) {
    return document.getElementById(`page-${name}`);
  }

  function getCurrentName() {
    const current = document.querySelector(".page.is-active");
    return current?.id.replace("page-", "") || "inicio";
  }

  function cleanupAnimClasses(el) {
    el?.classList.remove(
      "enter-from-right", "enter-from-left",
      "leave-to-left", "leave-to-right"
    );
  }

  function showPage(pageName, { immediate = false } = {}) {
    if (isTransitioning && !immediate) return;

    const current = document.querySelector(".page.is-active");
    const next = getPage(pageName);
    if (!next || next === current) return;

    const fromIndex = PAGE_ORDER.indexOf(getCurrentName());
    const toIndex = PAGE_ORDER.indexOf(pageName);
    const forward = (toIndex === -1 || fromIndex === -1) ? true : (toIndex > fromIndex);

    const enterClass = forward ? "enter-from-right" : "enter-from-left";
    const leaveClass = forward ? "leave-to-left" : "leave-to-right";

    setActiveNav(pageName);
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
    cleanupAnimClasses(next);

    next.classList.add("is-active", enterClass);
    void next.offsetWidth;

    requestAnimationFrame(() => {
      next.classList.remove(enterClass);
      if (current) {
        cleanupAnimClasses(current);
        current.classList.add(leaveClass);
      }

      setTimeout(() => {
        current?.classList.remove("is-active");
        cleanupAnimClasses(current);
        cleanupAnimClasses(next);
        isTransitioning = false;
        next.scrollTo({ top: 0, behavior: "auto" });
      }, 700);
    });
  }

  // =========================
  // Contacto: ventana interna (Contactos <-> Cotización)
  // =========================
  const contactWindow = document.getElementById("contactWindow");
  const btnPideCotizacion = document.getElementById("btnPideCotizacion");
  const btnVolverContactos = document.getElementById("btnVolverContactos");

  function openContactoPanel(panel = "contactos") {
    if (!contactWindow) return;
    if (panel === "cotizacion") contactWindow.classList.add("is-quote");
    else contactWindow.classList.remove("is-quote");

    // opcional: reset scroll interno
    const views = contactWindow.querySelectorAll(".contactView");
    const target = panel === "cotizacion" ? views[1] : views[0];
    target?.scrollTo({ top: 0, behavior: "auto" });
  }

  btnPideCotizacion?.addEventListener("click", () => openContactoPanel("cotizacion"));
  btnVolverContactos?.addEventListener("click", () => openContactoPanel("contactos"));

  // =========================
  // Clicks del menú (Desktop)
  // =========================
  document.querySelectorAll(".navlink[data-page]").forEach(link =>
    link.addEventListener("click", e => {
      e.preventDefault();
      showPage(link.dataset.page);

      // si entras a CONTACTO desde el menú, muestra "contactos"
      if (link.dataset.page === "cotizacion") openContactoPanel("contactos");
    })
  );

  // =========================
  // Clicks del menú (Móvil)
  // =========================
  document.querySelectorAll(".mnav-link[data-page]").forEach(link =>
    link.addEventListener("click", e => {
      e.preventDefault();
      showPage(link.dataset.page);

      // si entras a CONTACTO desde el menú, muestra "contactos"
      if (link.dataset.page === "cotizacion") openContactoPanel("contactos");
    })
  );

  // ✅ BRAND HOME -> INICIO
  document.querySelector(".brand-home[data-page]")?.addEventListener("click", e => {
    e.preventDefault();
    showPage("inicio");
  });

  // ✅ Botón de INICIO: ir a CONTACTO y abrir directo COTIZACIÓN
  document.getElementById("btnIrCotizacion")?.addEventListener("click", () => {
    showPage("cotizacion");
    // Espera el cambio de página para luego activar el panel
    setTimeout(() => openContactoPanel("cotizacion"), 750);
  });

  // Inicial
  showPage("inicio", { immediate: true });

  // =========================
  // Gmail / Outlook / Copiar
  // =========================
  const DESTINO = "yfranco@yjpublicidad.pe";
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
    return "Cotización - YJ Publicidad" + (data.nombre ? ` | ${data.nombre}` : "");
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
    const d = getData();
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(DESTINO)}&su=${encodeURIComponent(buildSubject(d))}&body=${encodeURIComponent(buildBody(d))}`,
      "_blank",
      "noopener"
    );
  }

  function openOutlook() {
    const d = getData();
    window.open(
      `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(DESTINO)}&subject=${encodeURIComponent(buildSubject(d))}&body=${encodeURIComponent(buildBody(d))}`,
      "_blank",
      "noopener"
    );
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(DESTINO);

      const msg = $("copiedText");
      if (msg) {
        msg.classList.add("show");
        clearTimeout(msg._t);
        msg._t = setTimeout(() => msg.classList.remove("show"), 1400);
      }
    } catch {
      alert("No se pudo copiar automáticamente. Copia manualmente: " + DESTINO);
    }
  }

  $("sendGmail")?.addEventListener("click", openGmail);
  $("sendOutlook")?.addEventListener("click", openOutlook);
  $("copyEmail")?.addEventListener("click", copyEmail);

});
const DESTINO = "yfranco@yjpublicidad.pe";

