# Pine UI Components for Astro

A collection of Pine UI components converted for the AHA stack (Astro + HTMX + Alpine.js). Based on the excellent Pine UI library by DevDojo.

## ✨ Features

- 🎨 **Tailwind CSS** styling
- ⚡ **Alpine.js** reactivity
- 🚀 **Astro** framework optimized
- 📱 **Responsive** design
- ♿ **Accessible** components
- 🎯 **TypeScript** support

## 📦 Available Components (42 Total)

### Basic Components (7)
- **Accordion** - Collapsible content sections
- **Alert** - Notification messages with variants
- **Badge** - Status indicators and labels
- **Banner** - Top/bottom page announcements
- **Card** - Content containers with header/body/footer
- **Quotes** - Testimonial and citation blocks
- **Table** - Data tables with responsive wrapper

### Form Components (10)
- **Button** - Interactive buttons with variants
- **Checkbox** - Form checkboxes with custom styling
- **DatePicker** - Interactive calendar date selection
- **RadioGroup** - Single-select option groups
- **RangeSlider** - Configurable range input sliders
- **Rating** - Star rating components
- **Select** - Searchable dropdown selects
- **Switch** - Toggle controls
- **TextInput** - Text input fields with variants
- **Textarea** - Multi-line text areas with auto-resize

### Navigation Components (7)
- **Breadcrumbs** - Navigation breadcrumb trails
- **Dropdown** - Toggleable menus
- **MenuBar** - Application-style menu bars
- **Modal** - Overlay dialogs
- **NavigationMenu** - Advanced navigation with dropdowns
- **Pagination** - Page navigation controls
- **Tabs** - Tabbed content interfaces

### Interactive Components (7)
- **Command** - Command palette interface
- **ContextMenu** - Right-click context menus
- **FullScreenModal** - Full screen overlay modals
- **HoverCard** - Tooltip-like cards with delay
- **Popover** - Positioned popup content
- **SlideOver** - Side panel modals
- **Toast** - Temporary notifications

### Animation Components (5)
- **Marquee** - Scrolling text/content
- **Progress** - Progress bars with animations
- **RetroGrid** - Animated grid backgrounds
- **TextAnimation** - Character-by-character text effects (GSAP)
- **TypingEffect** - Typewriter text animations

### Media Components (2)
- **ImageGallery** - Image gallery with lightbox
- **VideoPlayer** - Custom video player with controls

### Utility Components (3)
- **CopyToClipboard** - Copy text functionality
- **MonacoEditor** - Code editor integration
- **Tooltip** - Hover information tooltips

## 🚀 Quick Start

1. Import the component you need:
```astro
---
import { Button, Modal, Alert } from '../components/pine';
---
```

2. Use in your Astro component:
```astro
<Button variant="solid" color="blue" size="lg">
  Click me!
</Button>

<Alert variant="soft-green" title="Success">
  Your changes have been saved.
</Alert>
```

## 📋 Prerequisites

Make sure you have these dependencies installed:

- **Alpine.js** - Required for component reactivity
- **Tailwind CSS** - Required for styling
- **Alpine.js Collapse Plugin** - Required for Accordion component

```bash
npm install alpinejs @alpinejs/collapse
```

## 🔧 Alpine.js Setup

Initialize Alpine.js in your main layout:

```astro
---
// Layout.astro
---
<html>
<head>
  <!-- Your head content -->
</head>
<body>
  <!-- Your content -->
  
  <script>
    import Alpine from 'alpinejs'
    import collapse from '@alpinejs/collapse'
    
    Alpine.plugin(collapse)
    Alpine.start()
  </script>
</body>
</html>
```

## 📖 Component Documentation

### Button

```astro
<Button 
  variant="solid" 
  color="blue" 
  size="md"
  disabled={false}
>
  Button Text
</Button>
```

**Props:**
- `variant`: 'solid' | 'outline' | 'soft' | 'ghost'
- `color`: 'neutral' | 'blue' | 'red' | 'green' | 'yellow' | 'purple'
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `disabled`: boolean
- `type`: 'button' | 'submit' | 'reset'

### Alert

```astro
<Alert 
  variant="soft-blue" 
  title="Information"
  dismissible={true}
>
  This is an alert message.
</Alert>
```

**Props:**
- `variant`: 'default' | 'blue' | 'red' | 'green' | 'yellow' | 'soft-*'
- `title`: string (optional)
- `dismissible`: boolean
- `icon`: string (SVG content)

### Modal

```astro
<Modal id="example-modal" size="md">
  <Button slot="trigger">Open Modal</Button>
  
  <h2 slot="header">Modal Title</h2>
  
  <div slot="body">
    <p>Modal content...</p>
  </div>
  
  <div slot="footer">
    <Button variant="outline">Cancel</Button>
    <Button>Confirm</Button>
  </div>
</Modal>
```

### Accordion

```astro
<Accordion 
  items={[
    { title: "Question 1", content: "Answer 1" },
    { title: "Question 2", content: "Answer 2" }
  ]} 
/>
```

### Switch

```astro
<Switch 
  id="notifications"
  label="Email notifications"
  description="Receive updates via email"
  checked={true}
  size="md"
/>
```

### Select

```astro
<Select 
  options={[
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" }
  ]}
  searchable={true}
  placeholder="Choose an option..."
/>
```

### Rating

```astro
<Rating 
  maxStars={5}
  initialValue={3}
  size="md"
  name="rating"
/>
```

### Progress

```astro
<Progress 
  value={75}
  max={100}
  color="blue"
  showLabel={true}
  animated={true}
/>
```

### Tabs

```astro
<Tabs 
  tabs={[
    { id: "tab1", label: "Overview" },
    { id: "tab2", label: "Settings" }
  ]}
  variant="underline"
>
  <div slot="tab1">Tab 1 content</div>
  <div slot="tab2">Tab 2 content</div>
</Tabs>
```

### TypingEffect

```astro
<TypingEffect 
  texts={["Hello World!", "Welcome to Pine UI", "Built with Alpine.js"]}
  typeSpeed={100}
  deleteSpeed={50}
/>
```

### CopyToClipboard

```astro
<CopyToClipboard 
  text="Hello, World!"
  variant="button"
  successMessage="Copied!"
/>
```

## 🎨 Customization

All components accept a `class` prop for additional styling:

```astro
<Button class="my-custom-class" variant="solid">
  Custom Button
</Button>
```

## 📄 License

Based on Pine UI by DevDojo. Components have been adapted for Astro and the AHA stack.

## 🔗 Links

- [Pine UI Documentation](https://devdojo.com/pines/docs)
- [Alpine.js Documentation](https://alpinejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)