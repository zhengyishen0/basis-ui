/**
 * Theme Store for Alpine.js
 * Manages dark/light/system theme preferences with localStorage persistence
 */
export const themeStore = {
    current: 'light',
    
    /**
     * Initialize theme from localStorage and apply
     */
    init() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
            this.current = savedTheme;
        } else {
            // Auto-detect initial theme based on system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.current = prefersDark ? 'dark' : 'light';
        }
        this.apply();
    },
    
    /**
     * Toggle between light and dark
     */
    toggle() {
        this.current = this.current === 'light' ? 'dark' : 'light';
        this.save();
        this.apply();
    },
    
    /**
     * Set specific theme
     * @param {string} theme - 'light' or 'dark'
     */
    set(theme) {
        if (['light', 'dark'].includes(theme)) {
            this.current = theme;
            this.save();
            this.apply();
        }
    },
    
    /**
     * Apply theme to document
     */
    apply() {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(this.current);
    },
    
    /**
     * Save theme preference to localStorage
     */
    save() {
        localStorage.setItem('theme', this.current);
    },
    
    /**
     * Get the resolved theme (actual light/dark)
     */
    get resolved() {
        return this.current;
    }
};