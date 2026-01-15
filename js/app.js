const App = {
  init() {
    if (!Auth.requireAuth()) {
      return;
    }

    Storage.initializeDefaults();

    this.setupSidebar();
    this.setupUserInfo();
    this.setupLogout();
    this.setupNavigation();

    this.loadDashboard();
  },

  setupSidebar() {
    const sidebarToggle = document.getElementById("sidebarToggle");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");

    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener("click", () => {
        sidebar.classList.toggle("-translate-x-full");
        if (overlay) {
          overlay.classList.toggle("hidden");
        }
      });

      if (overlay) {
        overlay.addEventListener("click", () => {
          sidebar.classList.add("-translate-x-full");
          overlay.classList.add("hidden");
        });
      }
    }
  },

  setupUserInfo() {
    const user = Auth.getCurrentUser();
    const userNameEl = document.getElementById("userName");
    const userRoleEl = document.getElementById("userRole");

    if (user) {
      if (userNameEl) userNameEl.textContent = user.username;
      if (userRoleEl) userRoleEl.textContent = user.role;
    }
  },

  setupLogout() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        Auth.logout();
      });
    }
  },

  setupNavigation() {
    const navLinks = document.querySelectorAll("[data-page]");
    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const page = link.getAttribute("data-page");
        this.navigateTo(page);

        navLinks.forEach((l) => l.classList.remove("bg-indigo-700"));
        link.classList.add("bg-indigo-700");

        const sidebar = document.getElementById("sidebar");
        const overlay = document.getElementById("sidebarOverlay");
        if (window.innerWidth < 1024) {
          sidebar?.classList.add("-translate-x-full");
          overlay?.classList.add("hidden");
        }
      });
    });
  },

  navigateTo(page) {
    const mainContent = document.getElementById("mainContent");
    if (!mainContent) return;

    const pageTitle = document.getElementById("pageTitle");
    if (pageTitle) {
      pageTitle.textContent = this.formatPageTitle(page);
    }

    document.querySelectorAll("[data-page]").forEach((link) => {
      link.classList.remove("bg-white/10");
      if (link.getAttribute("data-page") === page) {
        link.classList.add("bg-white/10");
      }
    });

    switch (page) {
      case "dashboard":
        this.loadDashboard();
        break;
      case "books":
        Pages.books();
        break;
      case "authors":
        Pages.authors();
        break;
      case "members":
        Pages.members();
        break;
      case "loans":
        Pages.loans();
        break;
      case "categories":
        Pages.categories();
        break;
      default:
        this.loadDashboard();
    }
  },

  formatPageTitle(page) {
    return page.charAt(0).toUpperCase() + page.slice(1);
  },

  loadDashboard() {
    Dashboard.render();
  },
};

document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
