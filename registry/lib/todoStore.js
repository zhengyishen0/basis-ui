import { createDataStore } from "./dataStore.js";
import { authStore } from "./authStore.js";

// Create single todo store
const baseStore = createDataStore("todos", {
  orderBy: "inserted_at",
  ascending: false,
  primaryKey: "id",
  userField: "user_id",
});

// Create todo store with auth integration
export const todoStore = {
  // Spread base store methods and properties
  ...baseStore,

  // Separate data arrays
  userTodos: [],
  allTodos: [],

  // Todo-specific state
  userFilter: "all",
  allFilter: "all",

  // Computed properties for user todos
  get filteredUserTodos() {
    const todos = this.userTodos || [];
    switch (this.userFilter) {
      case "active":
        return todos.filter((t) => !t.is_complete);
      case "completed":
        return todos.filter((t) => t.is_complete);
      default:
        return todos;
    }
  },

  // Computed properties for all todos
  get filteredAllTodos() {
    const todos = this.allTodos || [];
    switch (this.allFilter) {
      case "active":
        return todos.filter((t) => !t.is_complete);
      case "completed":
        return todos.filter((t) => t.is_complete);
      default:
        return todos;
    }
  },

  get userActiveCount() {
    const todos = this.userTodos || [];
    return todos.filter((t) => !t.is_complete).length;
  },

  get userCompletedCount() {
    const todos = this.userTodos || [];
    return todos.filter((t) => t.is_complete).length;
  },

  get allActiveCount() {
    const todos = this.allTodos || [];
    return todos.filter((t) => !t.is_complete).length;
  },

  get allCompletedCount() {
    const todos = this.allTodos || [];
    return todos.filter((t) => t.is_complete).length;
  },

  get uniqueUserCount() {
    const todos = this.allTodos || [];
    const uniqueUsers = new Set(todos.map((t) => t.user_id));
    return uniqueUsers.size;
  },

  // Methods that use authStore internally
  async loadTodos() {
    if (!authStore.currentUser) return;

    // Load user-specific todos
    await this.loadUserTodos();

    // Load all todos
    await this.loadAllTodos();

    // Start real-time subscriptions
    this.startRealtimeSync();
  },

  // Load only current user's todos
  async loadUserTodos() {
    // Use the dataStore with user filtering
    await baseStore.load.call(this, authStore.currentUser.id);
    this.userTodos = [...this.items];
  },

  // Load all todos (bypass user filtering)
  async loadAllTodos() {
    // Use special filter to bypass user restrictions
    await baseStore.load.call(this, authStore.currentUser.id, {
      _loadAllUsers: true,
    });
    this.allTodos = [...this.items];
  },

  // Simple real-time setup - leverage dataStore's built-in real-time
  startRealtimeSync() {
    if (!authStore.currentUser) return;

    // Set up real-time for all todos (will update both arrays when data changes)
    baseStore.subscribe.call(
      this,
      null,
      {},
      {
        onInsert: () => this.refreshData(),
        onUpdate: () => this.refreshData(),
        onDelete: () => this.refreshData(),
      },
    );
  },

  // Refresh both user and all todos arrays
  async refreshData() {
    await this.loadUserTodos();
    await this.loadAllTodos();
  },

  // Stop real-time subscriptions
  stopRealtimeSync() {
    baseStore.unsubscribe.call(this);
  },

  async addTodo(text) {
    if (!text?.trim() || !authStore.currentUser) return;

    const result = await baseStore.create.call(this, authStore.currentUser.id, {
      task: text.trim(),
    });

    // Refresh data after successful creation
    if (result || !this.error) {
      await this.refreshData();
    }
  },

  async toggleTodo(todoId, completed) {
    if (!authStore.currentUser) return;
    await baseStore.update.call(this, authStore.currentUser.id, todoId, {
      is_complete: completed,
    });
    await this.refreshData();
  },

  async deleteTodo(todoId) {
    if (!authStore.currentUser) return;
    await baseStore.delete.call(this, authStore.currentUser.id, todoId);
    await this.refreshData();
  },

  // Filter management
  setUserFilter(filter) {
    this.userFilter = filter;
  },

  setAllFilter(filter) {
    this.allFilter = filter;
  },

  // Clean up on sign out or component unmount
  cleanup() {
    this.stopRealtimeSync();
    this.userTodos = [];
    this.allTodos = [];
    this.items = [];
  },
};
