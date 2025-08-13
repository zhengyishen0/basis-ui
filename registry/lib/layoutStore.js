/**
 * Layout Store for Alpine.js
 * Manages page width toggle (normal container vs full width) with localStorage persistence
 */
export const layoutStore = {
    wide: false,
    
    /**
     * Initialize layout from localStorage
     */
    init() {
        this.wide = localStorage.getItem('layout-wide') === 'true';
    },
    
    /**
     * Toggle between normal container and full width
     */
    toggleWidth() {
        this.wide = !this.wide;
        this.save();
    },
    
    /**
     * Set specific width mode
     * @param {boolean} wide - true for full width, false for container
     */
    setWidth(wide) {
        this.wide = Boolean(wide);
        this.save();
    },
    
    /**
     * Save layout preference to localStorage
     */
    save() {
        localStorage.setItem('layout-wide', this.wide.toString());
    },
    
    /**
     * Get container classes based on current width setting
     */
    get containerClasses() {
        return this.wide ? '' : 'container mx-auto px-4';
    }
};