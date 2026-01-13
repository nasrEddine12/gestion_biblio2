/**
 * Main Application Module
 * Handles UI interactions and page functionality
 */

const App = {
    /**
     * Initialize the application
     */
    init() {
        // Check authentication
        if (!Auth.requireAuth()) {
            return;
        }

        // Initialize storage
        Storage.initializeDefaults();

        // Setup UI
        this.setupSidebar();
        this.setupUserInfo();
        this.setupLogout();
        this.setupNavigation();

        // Load default page content
        this.loadDashboard();
    },

    /**
     * Setup sidebar toggle functionality
     */
    setupSidebar() {
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');

        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('-translate-x-full');
                if (overlay) {
                    overlay.classList.toggle('hidden');
                }
            });

            // Close sidebar when clicking overlay
            if (overlay) {
                overlay.addEventListener('click', () => {
                    sidebar.classList.add('-translate-x-full');
                    overlay.classList.add('hidden');
                });
            }
        }
    },

    /**
     * Setup user info display
     */
    setupUserInfo() {
        const user = Auth.getCurrentUser();
        const userNameEl = document.getElementById('userName');
        const userRoleEl = document.getElementById('userRole');

        if (user) {
            if (userNameEl) userNameEl.textContent = user.username;
            if (userRoleEl) userRoleEl.textContent = user.role;
        }
    },

    /**
     * Setup logout button
     */
    setupLogout() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                Auth.logout();
            });
        }
    },

    /**
     * Setup navigation links
     */
    setupNavigation() {
        const navLinks = document.querySelectorAll('[data-page]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.navigateTo(page);

                // Update active state
                navLinks.forEach(l => l.classList.remove('bg-indigo-700'));
                link.classList.add('bg-indigo-700');

                // Close sidebar on mobile
                const sidebar = document.getElementById('sidebar');
                const overlay = document.getElementById('sidebarOverlay');
                if (window.innerWidth < 1024) {
                    sidebar?.classList.add('-translate-x-full');
                    overlay?.classList.add('hidden');
                }
            });
        });
    },

    /**
     * Navigate to a specific page/section
     * @param {string} page 
     */
    navigateTo(page) {
        const mainContent = document.getElementById('mainContent');
        if (!mainContent) return;

        // Update page title
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            pageTitle.textContent = this.formatPageTitle(page);
        }

        // Update active nav state
        document.querySelectorAll('[data-page]').forEach(link => {
            link.classList.remove('bg-white/10');
            if (link.getAttribute('data-page') === page) {
                link.classList.add('bg-white/10');
            }
        });

        // Load page content using Pages module
        switch (page) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'books':
                Pages.books();
                break;
            case 'authors':
                Pages.authors();
                break;
            case 'members':
                Pages.members();
                break;
            case 'loans':
                Pages.loans();
                break;
            case 'categories':
                Pages.categories();
                break;
            default:
                this.loadDashboard();
        }
    },

    /**
     * Format page title
     * @param {string} page 
     * @returns {string}
     */
    formatPageTitle(page) {
        return page.charAt(0).toUpperCase() + page.slice(1);
    },

    /**
     * Load dashboard content
     */
    loadDashboard() {
        // Use the Dashboard module with charts
        Dashboard.render();
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

