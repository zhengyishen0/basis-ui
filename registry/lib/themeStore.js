/**
 * Theme Store for Alpine.js
 * Manages dark/light/system theme preferences with localStorage persistence
 */
export const themeStore = {
    current: 'system',
    
    /**
     * Initialize theme from localStorage and apply
     */
    init() {
        this.current = localStorage.getItem('theme') || 'system';
        this.apply();
        
        // Listen for system theme changes when in system mode
        if (this.current === 'system') {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
                if (this.current === 'system') {
                    this.apply();
                }
            });
        }
    },
    
    /**
     * Toggle between light -> dark -> system -> light
     */
    toggle() {
        const themes = ['light', 'dark', 'system'];
        const currentIndex = themes.indexOf(this.current);
        this.current = themes[(currentIndex + 1) % themes.length];
        this.save();
        this.apply();
    },
    
    /**
     * Set specific theme
     * @param {string} theme - 'light', 'dark', or 'system'
     */
    set(theme) {
        if (['light', 'dark', 'system'].includes(theme)) {
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
        
        if (this.current === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.classList.add(prefersDark ? 'dark' : 'light');
        } else {
            root.classList.add(this.current);
        }
    },
    
    /**
     * Save theme preference to localStorage
     */
    save() {
        localStorage.setItem('theme', this.current);
    },
    
    /**
     * Get the resolved theme (actual light/dark, never system)
     */
    get resolved() {
        if (this.current === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return this.current;
    }
};