// Pine UI Components for Astro
// Based on Pine UI by DevDojo (https://devdojo.com/pines)
// Converted for AHA Stack (Astro + HTMX + Alpine.js)
// Complete collection organized by functional categories

// Layout - Layout and structure components
export * from './layout';

// Forms - Input and form controls
export * from './forms';

// Navigation - Navigation and wayfinding
export * from './navigation';

// Feedback - User feedback and status
export * from './feedback';

// Overlay - Overlays and modals
export * from './overlay';

// Display - Content display
export * from './display';

// Interactive - Rich interactions
export * from './interactive';

// Animation - Motion and effects
export * from './animation';

// Type exports for TypeScript support
// Layout types
export type { Props as GridProps } from './layout/Grid.astro';
export type { Props as RowProps } from './layout/Row.astro';
export type { Props as ColumnProps } from './layout/Column.astro';
export type { Props as ListProps } from './layout/List.astro';
export type { Props as PageProps } from './layout/Page.astro';
export type { Props as SectionProps } from './layout/Section.astro';
export type { Props as DividerProps } from './layout/Divider.astro';
export type { Props as SpacerProps } from './layout/Spacer.astro';
export type { Props as ConditionalProps } from './layout/Conditional.astro';

// Form types
export type { Props as ButtonProps } from './forms/Button.astro';
export type { Props as CheckboxProps } from './forms/Checkbox.astro';
export type { Props as DatePickerProps } from './forms/DatePicker.astro';
export type { Props as RadioGroupProps } from './forms/RadioGroup.astro';
export type { Props as RangeSliderProps } from './forms/RangeSlider.astro';
export type { Props as RatingProps } from './forms/Rating.astro';
export type { Props as SelectProps } from './forms/Select.astro';
export type { Props as TextInputProps } from './forms/TextInput.astro';
export type { Props as TextareaProps } from './forms/Textarea.astro';

// Navigation types
export type { Props as BreadcrumbsProps } from './navigation/Breadcrumbs.astro';
export type { Props as MenuBarProps } from './navigation/MenuBar.astro';
export type { Props as NavigationMenuProps } from './navigation/NavigationMenu.astro';
export type { Props as PaginationProps } from './navigation/Pagination.astro';
export type { Props as TabsProps } from './navigation/Tabs.astro';

// Feedback types
export type { Props as AlertProps } from './feedback/Alert.astro';
export type { Props as BadgeProps } from './feedback/Badge.astro';
export type { Props as BannerProps } from './feedback/Banner.astro';
export type { Props as ProgressProps } from './feedback/Progress.astro';
export type { Props as ToastProps } from './feedback/Toast.astro';
export type { Props as EmptyProps } from './feedback/Empty.astro';
export type { Props as ErrorProps } from './feedback/Error.astro';
export type { Props as LoadingProps } from './feedback/Loading.astro';

// Overlay types
export type { Props as CommandProps } from './overlay/Command.astro';
export type { Props as ContextMenuProps } from './overlay/ContextMenu.astro';
export type { Props as DropdownProps } from './overlay/Dropdown.astro';
export type { Props as FullScreenModalProps } from './overlay/FullScreenModal.astro';
export type { Props as HoverCardProps } from './overlay/HoverCard.astro';
export type { Props as ModalProps } from './overlay/Modal.astro';
export type { Props as PopoverProps } from './overlay/Popover.astro';
export type { Props as SlideOverProps } from './overlay/SlideOver.astro';
export type { Props as TooltipProps } from './overlay/Tooltip.astro';

// Display types
export type { Props as ImageProps } from './display/Image.astro';
export type { Props as ImageGalleryProps } from './display/ImageGallery.astro';
export type { Props as QuotesProps } from './display/Quotes.astro';
export type { Props as TableProps } from './display/Table.astro';
export type { Props as VideoPlayerProps } from './display/VideoPlayer.astro';
export type { Props as TextProps } from './display/Text.astro';
// Card types
export type { Props as CardProps } from './display/card/Card.astro';
export type { Props as CardContentProps } from './display/card/CardContent.astro';
export type { Props as CardFooterProps } from './display/card/CardFooter.astro';
export type { Props as CardHeaderProps } from './display/card/CardHeader.astro';
// Accordion types
export type { Props as AccordionProps } from './display/accordion/Accordion.astro';
export type { Props as AccordionContentProps } from './display/accordion/AccordionContent.astro';
export type { Props as AccordionItemProps } from './display/accordion/AccordionItem.astro';
export type { Props as AccordionTriggerProps } from './display/accordion/AccordionTrigger.astro';
// Avatar types
export type { Props as AvatarProps } from './display/avatar/Avatar.astro';
export type { Props as AvatarFallbackProps } from './display/avatar/AvatarFallback.astro';
export type { Props as AvatarImageProps } from './display/avatar/AvatarImage.astro';

// Interactive types
export type { Props as CopyToClipboardProps } from './interactive/CopyToClipboard.astro';
export type { Props as MonacoEditorProps } from './interactive/MonacoEditor.astro';

// Animation types
export type { Props as MarqueeProps } from './animation/Marquee.astro';
export type { Props as RetroGridProps } from './animation/RetroGrid.astro';
export type { Props as TextAnimationProps } from './animation/TextAnimation.astro';
export type { Props as TypingEffectProps } from './animation/TypingEffect.astro';