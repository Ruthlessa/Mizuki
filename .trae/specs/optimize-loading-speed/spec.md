# Loading Speed Optimization - Product Requirement Document

## Overview
- **Summary**: Optimize the loading speed of the Mizuki Astro blog by improving performance metrics like FCP, LCP, TTI, and reducing bundle sizes.
- **Purpose**: Make the site faster, improve user experience, and maintain/raise Lighthouse performance score.
- **Target Users**: Site visitors and developers maintaining the project.

## Goals
- Improve Lighthouse performance score ≥ 0.90+
- Reduce FCP ≤ 1500ms
- Reduce LCP ≤ 3000ms
- Reduce TTI ≤ 4000ms
- Keep CLS ≤ 0.08
- Reduce total bundle size by 10-20%

## Non-Goals (Out of Scope)
- Rewriting the entire framework
- Changing core functionality
- Adding new features unrelated to performance

## Background & Context
The project is an Astro-based static site with Svelte components, Swup for transitions, and various UI libraries like Expressive Code, Fancybox, etc. Current performance baseline is in src/config/performance-baseline.json, with Lighthouse score 0.85.

## Functional Requirements
- **FR-1**: Optimize image loading (lazy loading, image formats, etc.)
- **FR-2**: Optimize JS/CSS delivery (code splitting, tree shaking, critical CSS)
- **FR-3**: Optimize font loading
- **FR-4**: Reduce render-blocking resources

## Non-Functional Requirements
- **NFR-1**: Maintain backward compatibility
- **NFR-2**: Keep build time ≤ 2 minutes

## Constraints
- **Technical**: Must stay with existing stack (Astro, Svelte, etc.)
- **Business**: No breaking changes allowed
- **Dependencies**: Existing dependencies should remain unless absolutely necessary

## Assumptions
- The project can leverage Astro's built-in optimizations
- We can use existing scripts (analyze-bundle, performance-check)
- No new dependencies are needed unless small optimizations

## Acceptance Criteria

### AC-1: Improved Lighthouse Score
- **Given**: Running Lighthouse on homepage/about/anime pages
- **When**: Tests are run after optimizations are applied
- **Then**: Performance score ≥ 0.90, FCP ≤1500, LCP ≤3000, CLS ≤0.08, TTI ≤4000
- **Verification**: Programmatic (Lighthouse CI)

### AC-2: Reduced Bundle Size
- **Given**: Building the project
- **When**: Analyze bundle size
- **Then**: Total JS size reduced by ≥10%
- **Verification**: Programmatic (analyze-bundle script)

### AC-3: No Breaking Changes
- **Given**: The optimized site
- **When**: Navigating around
- **Then**: All existing features work as before
- **Verification**: Human judgment (manual testing)

## Open Questions
- None at this time
