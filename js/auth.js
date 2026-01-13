/**
 * Authentication Module
 * Handles user login, logout, and session management
 */

const Auth = {
    // Static credentials (in production, this would be server-side)
    VALID_CREDENTIALS: {
        username: 'admin',
        password: 'admin'
    },

    /**
     * Attempt to log in with provided credentials
     * @param {string} username 
     * @param {string} password 
     * @returns {boolean} Success status
     */
    login(username, password) {
        if (username === this.VALID_CREDENTIALS.username && 
            password === this.VALID_CREDENTIALS.password) {
            
            const user = {
                username: username,
                role: 'admin',
                loginTime: new Date().toISOString()
            };
            
            sessionStorage.setItem('libraryAuth', JSON.stringify(user));
            return true;
        }
        return false;
    },

    /**
     * Log out the current user
     */
    logout() {
        sessionStorage.removeItem('libraryAuth');
        window.location.href = 'login.html';
    },

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        const auth = sessionStorage.getItem('libraryAuth');
        return auth !== null;
    },

    /**
     * Get current user information
     * @returns {Object|null}
     */
    getCurrentUser() {
        const auth = sessionStorage.getItem('libraryAuth');
        return auth ? JSON.parse(auth) : null;
    },

    /**
     * Require authentication - redirect to login if not authenticated
     */
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },

    /**
     * Redirect to dashboard if already authenticated (for login page)
     */
    redirectIfAuthenticated() {
        if (this.isAuthenticated()) {
            window.location.href = 'index.html';
            return true;
        }
        return false;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Auth;
}
