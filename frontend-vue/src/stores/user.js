import { defineStore } from "pinia";

const TOKEN_KEY = "mall_token";
const USER_KEY = "mall_user";

export const useUserStore = defineStore("user", {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || "",
    user: JSON.parse(localStorage.getItem(USER_KEY) || "null")
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.token)
  },
  actions: {
    setLogin(token, user) {
      this.token = token;
      this.user = user || null;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(this.user));
    },
    setUser(user) {
      this.user = user;
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    },
    logout() {
      this.token = "";
      this.user = null;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }
});
