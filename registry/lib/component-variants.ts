import { cva } from 'class-variance-authority';

export { type VariantProps } from 'class-variance-authority';

// ===== SHARED SEMANTIC VARIANTS (Button, Badge, Alert, Banner, Card, Avatar, etc.) =====
export const semanticVariants = {
    default:
        'bg-primary text-primary-foreground hover:opacity-90 transition-all duration-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    secondary:
        'bg-secondary text-secondary-foreground hover:opacity-90 transition-all duration-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    destructive:
        'bg-destructive text-destructive-foreground hover:opacity-90 transition-all duration-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    success:
        'bg-success text-success-foreground hover:opacity-90 transition-all duration-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    warning:
        'bg-warning text-warning-foreground hover:opacity-90 transition-all duration-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    info: 'bg-info text-info-foreground hover:opacity-90 transition-all duration-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    outline:
        'border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    ghost: 'bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    link: 'text-primary underline-offset-4 hover:underline bg-transparent transition-all duration-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    ring: 'ring-2 ring-offset-2 ring-primary bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    border: 'border-2 border-primary bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
};

// ===== UNIFIED SIZING SYSTEM =====
// Standard sizes with height, padding, and text - used by buttons, badges, inputs, etc.
export const sizes = {
    xs: 'h-5 p-sm text-xs font-light',
    sm: 'h-7 p-sm text-sm font-normal',
    md: 'h-9 p-md text-base font-medium',
    lg: 'h-11 p-md text-lg font-semibold',
    xl: 'h-13 p-lg text-xl font-semibold',
    icon: 'h-9 w-9 px-0', // Special case for icon buttons
};

// ===== INTERACTIVE EFFECTS =====
export const interactiveEffects = {
    lift: 'hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-md transition-all duration-fast',
    scale: 'hover:scale-105 active:scale-95 transition-all duration-fast',
    glow: 'hover:shadow-lg hover:shadow-primary/25 active:shadow-primary/50 transition-all duration-normal',
    subtle: 'hover:opacity-90 active:opacity-80 transition-all duration-fast',
    bounce: 'hover:-translate-y-1 active:translate-y-0.5 transition-all duration-fast',
};

// ===== SHAPE VARIANTS =====
export const shapes = {
    rectangle: 'rounded-none',
    rounded: 'rounded', // uses var(--radius)
    pill: 'rounded-full',
};

// ===== OVERFLOW VARIANTS =====
export const overflowVariants = {
    auto: 'overflow-auto', // Scrollbars when needed
    fixed: 'overflow-hidden', // Clip content
    expand: '', // No constraints, content determines size
    wrap: 'flex-wrap', // Flex items wrap to new lines
    show: 'overflow-visible', // Show all content, can spill out
};

// ===== ELEVATION OPTIONS =====
export const elevationOptions = {
    none: 'shadow-none',
    flat: 'shadow-flat',
    elevated: 'shadow-elevated',
    floating: 'shadow-floating',
    lifted: 'shadow-lifted',
    high: 'shadow-high',
};

// ===== POSITIONING (for tooltips, popovers, etc.) =====
export const anchorPosition = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-sm',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-sm',
    left: 'right-full top-1/2 -translate-y-1/2 mr-sm',
    right: 'left-full top-1/2 -translate-y-1/2 ml-sm',
    'top-start': 'bottom-full left-0 mb-sm',
    'top-end': 'bottom-full right-0 mb-sm',
    'bottom-start': 'top-full left-0 mt-sm',
    'bottom-end': 'top-full right-0 mt-sm',
};

// Screen positions for fixed/absolute elements
export const screenPosition = {
    'top-left': 'top-md left-md',
    'top-right': 'top-md right-md',
    'bottom-left': 'bottom-md left-md',
    'bottom-right': 'bottom-md right-md',
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
};

// ===== TYPE EXPORTS =====
export type SemanticVariant = keyof typeof semanticVariants;
export type Size = keyof typeof sizes;
export type Spacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
export type Shape = keyof typeof shapes;
export type Elevation = keyof typeof elevationOptions;
export type InteractiveEffect = keyof typeof interactiveEffects;
export type Overflow = keyof typeof overflowVariants;
