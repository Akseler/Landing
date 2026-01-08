# AKSELER Landing Page - Design Guidelines

## Design Approach

**Reference-Based Approach**: Drawing inspiration from tryholo.ai and modern SaaS landing pages (Linear, Stripe, Notion) with extreme minimalism and generous white space. The design emphasizes clarity, bold typography, and strategic content placement over decorative elements.

## Core Design Principles

1. **Radical Minimalism**: Every element serves a clear purpose. No decorative flourishes.
2. **Bold Typography Hierarchy**: Let type do the heavy lifting for visual impact
3. **Strategic White Space**: Breathing room is a feature, not empty space
4. **Subtle Interactions**: Minimal animations, maximum impact
5. **Content-First**: Information architecture drives visual design

---

## Typography System

### Font Families
- **Primary**: Inter or similar geometric sans-serif (Google Fonts)
- **Accent**: Same as primary, leverage weight variations instead of multiple families

### Hierarchy
- **Hero Headline**: 4xl to 6xl (64-72px desktop), bold/extrabold weight
- **Section Headlines**: 3xl to 4xl (36-48px), semibold weight  
- **Subheadings**: xl to 2xl (20-30px), medium weight
- **Body Text**: base to lg (16-18px), regular weight
- **Small Text**: sm (14px) for captions, stats labels
- **Micro Text**: xs (12px) for disclaimers only

### Special Treatments
- Subtle text underlines using thin decorative lines beneath key phrases (not actual underlines - decorative element positioned below text)
- Letter spacing: -0.02em for headlines, normal for body
- Line height: 1.1-1.2 for headlines, 1.6-1.7 for body text

---

## Layout System

### Spacing Units
Core Tailwind spacing: **4, 8, 12, 16, 20, 24, 32**
- Component padding: 4-8 units
- Section spacing (vertical): 20-32 units
- Container margins: 16-24 units

### Grid Structure
- **Container**: max-w-7xl with responsive padding (px-6 mobile, px-12 desktop)
- **Content Width**: max-w-4xl for text-heavy sections
- **Multi-column**: Only where appropriate (service cards, stats, testimonials)

### Responsive Breakpoints
- Mobile: Single column, stack everything
- Tablet (md): 2-column layouts for cards
- Desktop (lg+): 3-column maximum for cards, asymmetric layouts for features

---

## Page Structure & Sections

### 1. Navigation
- Fixed/sticky minimal header with AKSELER logo (left)
- Right-aligned CTA button only
- Clean horizontal divider below header (1px subtle line)
- Height: 16-20 units

### 2. Hero Section (80vh)
- **Layout**: Centered content, single column
- **Elements**:
  - AKSELER logo/brand mark
  - Massive headline: "Padidinkite pardavimus 10x" (or similar from mockup)
  - Subheadline about AI licensing system
  - Interactive input field (oversized, minimal styling) for service query
  - Single primary CTA button
- **Background**: Clean solid background, no hero image
- **Typography**: Largest text on page, extreme hierarchy

### 3. Value Proposition / AI Funnel
- **Layout**: Center-aligned with visual diagram
- **Elements**:
  - "Dirbtinis Intelektas" funnel illustration showing lead qualification
  - From "NEKLASIFIKUOTI POTENCIALŪS KLIENTAI" → "KVALIFIKUOTI KLIENTAI"
  - Clean, diagram-style visual (recreate from mockup as SVG/CSS)
  - Supporting text explaining AI processing

### 4. Features Grid
- **Layout**: 2-column (desktop), single column (mobile)
- **Cards**: 
  - Minimal border or subtle shadow
  - Icon/visual at top
  - Bold headline
  - 2-3 lines description
  - Plenty of internal padding (p-8 to p-12)
- **Content**: Latest AI models, customer query processing, automation features

### 5. Statistics Showcase
- **Layout**: 3-column equal-width grid
- **Elements**:
  - Large number (3xl-4xl, bold)
  - Label below (sm text)
  - Examples: "15+ valandų", "30%", "24+ valandos"
- **Spacing**: Significant gaps between stat columns

### 6. Services Section
- **Layout**: 3-card horizontal grid (2-col tablet, 1-col mobile)
- **Cards**:
  - Icon at top
  - Service name as headline
  - Brief description
  - Minimal card styling (border or subtle background)
- **Services**: Quick returns, Financial services, Reliable market (from mockup)

### 7. Testimonials
- **Layout**: 3-column grid, equal height cards
- **Card Design**:
  - Customer photo (circular, medium size - 80-96px)
  - Name (semibold)
  - Quote (body text, italic or regular)
  - Clean card background with subtle border
  - Customers: Tomas, Mindaugas, Renatas (from mockup)
- **Styling**: Minimal, focus on authenticity

### 8. Video/Webinar Section
- **Layout**: Full-width or contained section
- **Elements**:
  - Section headline
  - Video embed (16:9 aspect ratio, max-width contained)
  - Registration CTA below video
  - Clean frame/border around video

### 9. Footer
- **Layout**: Multi-column (4 columns desktop, stack mobile)
- **Elements**:
  - AKSELER branding
  - Quick links navigation
  - Contact information
  - Social links (minimal icons)
  - Copyright and legal links
- **Styling**: Subtle background differentiation, smaller text

---

## Component Specifications

### Buttons
- **Primary CTA**: Large (px-8 py-4), bold text, rounded corners (rounded-lg)
- **Secondary**: Outlined version, same size
- **Hover**: Subtle transform (translate or scale 1.02), no blur effects
- **Background Blur**: For buttons on images, apply backdrop-blur-sm with semi-transparent background

### Input Fields
- **Style**: Oversized for hero section (h-16 to h-20)
- **Border**: Minimal, 1-2px
- **Focus State**: Subtle shadow or border accent
- **Placeholder**: Lower opacity, clear descriptive text

### Cards
- **Border**: 1px subtle outline OR subtle shadow (not both)
- **Padding**: Generous (p-8 to p-12)
- **Radius**: Consistent rounded corners (rounded-xl)
- **Hover**: Very subtle lift (shadow increase), no dramatic effects

### Dividers
- Horizontal rules between major sections (1px, subtle)
- Use sparingly, prefer white space for separation

---

## Visual Elements & Images

### Images
**No large hero background image** - clean solid background instead

**Testimonial Photos**:
- Circular avatars (80-96px diameter)
- Positioned above or beside testimonial text
- Use placeholder images initially: 3 professional headshots

**Funnel Diagram**:
- Clean vector illustration showing AI process flow
- Use from mockup as reference
- Can be created as CSS/SVG or static image
- Centered, significant size to be focal point

**Icons**:
- Use Heroicons (outline style for consistency with minimalism)
- Medium size (h-12 w-12 for feature cards)
- Monochrome, matching text accent

---

## Interaction & Animation

**Minimize animations** - use only where they add clarity:
- Smooth scroll behavior
- Subtle button hover states (0.2s transition)
- Card hover lift (very subtle)
- No scroll-triggered animations
- No parallax effects
- No auto-playing media (except video if user initiates)

---

## Lithuanian Language Integration

- All text in Lithuanian (primary)
- Maintain proper typography (diacritical marks rendered correctly)
- Key phrases from mockup:
  - "Padidinkite pardavimus 10x"
  - "Dirbtinis Intelektas"
  - "Kvalifikuoti klientai"
  - Service and stats text in Lithuanian

---

## Accessibility

- Maintain 4.5:1 contrast ratios minimum
- All interactive elements keyboard accessible
- Focus states clearly visible
- Alt text for all images
- Semantic HTML structure
- Form labels properly associated

---

This design creates a professional, clean landing page that emphasizes content and clarity while maintaining visual interest through typography, strategic spacing, and minimal but purposeful components.