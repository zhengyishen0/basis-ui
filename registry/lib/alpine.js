import Alpine from "alpinejs";
import mask from "@alpinejs/mask";
import intersect from "@alpinejs/intersect";
import persist from "@alpinejs/persist";
import focus from "@alpinejs/focus";
import collapse from "@alpinejs/collapse";
import anchor from "@alpinejs/anchor";
import morph from "@alpinejs/morph";
import sort from "@alpinejs/sort";
import resize from "@alpinejs/resize";
import { todoStore } from "./todoStore.js";
import { authStore } from "./authStore.js";
import { themeStore } from "./themeStore.js";
import { layoutStore } from "./layoutStore.js";

// Register all plugins before starting Alpine
Alpine.plugin(mask);
Alpine.plugin(intersect);
Alpine.plugin(persist);
Alpine.plugin(focus);
Alpine.plugin(collapse);
Alpine.plugin(anchor);
Alpine.plugin(morph);
Alpine.plugin(sort);
Alpine.plugin(resize);

// Register Stores
Alpine.store("todo", todoStore);
Alpine.store("auth", authStore);
Alpine.store("theme", themeStore);
Alpine.store("layout", layoutStore);

// Make Alpine available globally for debugging (optional)
window.Alpine = Alpine;

// Start Alpine
Alpine.start();

export default Alpine;
