const Auth = {
  VALID_CREDENTIALS: {
    username: "admin",
    password: "admin",
  },

  login(username, password) {
    if (
      username === this.VALID_CREDENTIALS.username &&
      password === this.VALID_CREDENTIALS.password
    ) {
      const user = {
        username: username,
        role: "admin",
        loginTime: new Date().toISOString(),
      };

      sessionStorage.setItem("libraryAuth", JSON.stringify(user));
      return true;
    }
    return false;
  },

  logout() {
    sessionStorage.removeItem("libraryAuth");
    window.location.href = "login.html";
  },

  isAuthenticated() {
    const auth = sessionStorage.getItem("libraryAuth");
    return auth !== null;
  },

  getCurrentUser() {
    const auth = sessionStorage.getItem("libraryAuth");
    return auth ? JSON.parse(auth) : null;
  },

  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = "login.html";
      return false;
    }
    return true;
  },

  redirectIfAuthenticated() {
    if (this.isAuthenticated()) {
      window.location.href = "index.html";
      return true;
    }
    return false;
  },
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = Auth;
}
