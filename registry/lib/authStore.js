import { supabase } from "./supabase.js";

export const authStore = {
  // State
  currentUser: null,
  loading: false,
  error: null,
  initialized: false,

  // Computed properties
  get isAuthenticated() {
    return !!this.currentUser;
  },

  get userDisplayId() {
    return this.currentUser ? this.currentUser.id.slice(0, 8) + "..." : "";
  },

  // Auth methods
  async init() {
    if (this.initialized) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        this.currentUser = user;
      }
      this.initialized = true;
    } catch (error) {
      console.error("Auth init failed:", error);
      this.error = "Failed to initialize auth: " + error.message;
    }
  },

  async signInAnonymously() {
    this.loading = true;
    this.error = null;

    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;

      this.currentUser = data.user;
      return data.user;
    } catch (error) {
      this.error = "Sign in failed: " + error.message;
      throw error;
    } finally {
      this.loading = false;
    }
  },

  async signOut() {
    this.loading = true;
    this.error = null;

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      this.currentUser = null;
    } catch (error) {
      this.error = "Sign out failed: " + error.message;
      throw error;
    } finally {
      this.loading = false;
    }
  },
};
