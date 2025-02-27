# PrajnAI Frontend Technical Specification

## Design System & Theme

### Colors

```
Primary:    #89A8B2 (Steel blue)
Secondary:  #B3C8CF (Light steel blue)
Accent:     #E5E1DA (Light gray)
Light:      #F1F0E8 (Off white)
```

### Typography

- Font Family: Domine (Google Fonts)
- Use appropriate font weights for hierarchy
- Maintain consistent text sizes using Tailwind's scale

## Component Guidelines

### UI Component Library

- Use shadcn/ui as the primary component library
- Benefits:
  - Accessible by default
  - Type-safe
  - Customizable
  - Server component ready
  - Built on Radix UI primitives

### Component Design Standards

1. Visual Style

   - All interactive components should have rounded corners (min rounded-md)
   - Apply consistent shadows (shadow-md) for elevation
   - Use theme colors for backgrounds and accents
   - Maintain proper spacing using Tailwind's spacing scale

2. Component States
   - Hover states should be subtle but noticeable
   - Active/Selected states should use primary color
   - Disabled states should have reduced opacity
   - Loading states should use consistent spinners/skeletons

## File & Directory Structure

### Directory Organization

```
src/
├── app/                    # Next.js app directory
├── components/
│   ├── ui/                # Reusable UI components
│   │   └── shadcn/       # shadcn component overrides
│   ├── layout/           # Layout components
│   └── features/         # Feature-specific components
├── lib/                   # Utility functions and shared logic
├── styles/               # Global styles and Tailwind utilities
└── types/                # TypeScript type definitions
```

### File Naming Conventions

- Use kebab-case for file names: `auth-button.tsx`
- Component files should be PascalCase: `AuthButton.tsx`
- Utility files should be camelCase: `formatDate.ts`
- Test files should match their component name: `AuthButton.test.tsx`

## Best Practices

### Component Development

1. Composition

   - Prefer composition over inheritance
   - Break down complex components into smaller, reusable pieces
   - Use layout components for consistent spacing

2. Props

   - Use TypeScript interfaces for prop definitions
   - Provide sensible default props
   - Document required props clearly

3. Performance
   - Lazy load components when appropriate
   - Use proper React hooks for state management
   - Implement proper memoization where needed

### Code Style

1. General

   - Use TypeScript for all components and utilities
   - Follow ESLint and Prettier configurations
   - Write meaningful comments for complex logic

2. CSS/Styling
   - Use Tailwind CSS classes
   - Create custom utilities for repeated patterns
   - Maintain consistent class ordering

### Accessibility

- Ensure proper ARIA attributes
- Maintain keyboard navigation
- Test with screen readers
- Follow WCAG guidelines

## Implementation Process

1. Create new components in their appropriate directories
2. Follow the shadcn/ui installation process for new components
3. Apply theme colors and styling consistently
4. Test components for accessibility and responsiveness
5. Document any special considerations or usage notes

Remember to update this specification as new patterns or requirements emerge.

## Components

### Upload Component

- create a card component for uploading files
- the component will have 3 props
  - Title: take text input
  - Type: enum
    - pdf
    - web-link
    - text
  - description: take text input
- the ui will have 3 parts
  - the first part will be the title
  - the second part will be the type
    - there will be 3 horizontal button of type pdf, web-link, text and according to the button selected the below input field will be changed
    - the button will have icons accordingly
  - the third part will be the description

## local storage and Subject

- each subject will have a unique id (auto generated) and name (taken from the title)
- save it in local storage with the key "subjects"
- subject can have multiple topics , will work on topics later
- there can be multiple subjects , creation and deletion of subjects will work on it later
- dont need to save the upload data in local storage

### Side Bar

- create a component for the side bar
- the side bar will have 3 parts
  - logo : the logo will be a text text
  - Subjects : the subjects will be a list of subjects from local storage
  - reset : the reset will be a button that will reset the local storage
- the side bar is collapsible and will be on the left side of the screen
- when the side bar is collapsed the logo , subjects heading icon and reset button icon will be visible

## Topic Card Component

- create a card component for the topic
- the component will have 4 props
  - title : string
  - additional_info : string
  - page_created: boolean
  - page_updated: boolean
  - notion_page_id: string

## previous upload card component

- create a card component for the previous upload
- the component will have 5 props
  - title : string
  - type : enum
    - pdf
    - web-link
    - text
  - description: string
  - content: string
  - created_at: datetime
- this is just to show no edit button needed
- follow the color and design of the other components
- the card will have a delete button on the top right corner

# Notion like components

## these are the components that will be used to create a notes page

each of these component should have 2 states Edit and View, these, all of these components
can only be vertically stacked on to each other

components like un-order list and order list should have sub components to handle list items

- heading 1
- heading 2
- paragraph
- un-order list
  - un-order list item
- order list
  - order list item
- Image
- code block

Page Structure

- Block
  - heading 1
  - Sub-Block
- Sub-Block
  - heading 2
  - paragraph
    or
  - heading 2
  - un-order list
    or
  - heading 2
  - order list
    or
  - heading 2
  - Image
    or
  - heading 2
  - code block
