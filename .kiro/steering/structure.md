# Project Structure

## Root Directory

```
/
├── src/                    # Source code
├── build/                  # Production build output
├── .kiro/                  # Kiro AI configuration
├── node_modules/           # Dependencies
├── index.html              # Entry HTML
├── vite.config.ts          # Vite configuration
├── package.json            # Dependencies and scripts
└── *.sql                   # Database setup scripts
```

## Source Directory (`/src`)

```
src/
├── components/
│   ├── pages/             # Full page components (HomePage, MarketsPage, etc.)
│   ├── layout/            # Layout components (Header, Footer)
│   ├── ui/                # Reusable UI components (Radix-based)
│   └── figma/             # Figma design references
├── lib/
│   ├── supabase.ts        # Supabase client and auth helpers
│   ├── types.ts           # TypeScript type definitions
│   ├── data.ts            # Static data and content
│   └── market-api.ts      # Market data API integration
├── supabase/              # Supabase-specific utilities
├── utils/                 # General utility functions
├── styles/                # Global styles
├── guidelines/            # Content guidelines
├── App.tsx                # Main application component
├── main.tsx               # Application entry point
└── index.css              # Global CSS
```

## Key Architectural Patterns

### Navigation System

- Custom navigation stack in `App.tsx` (no React Router)
- Navigation handled via `handleNavigate(page, data?)` function
- Stack-based history with back navigation support
- Page state preserved in navigation entries

### Component Organization

- **Pages**: Full-page components in `/components/pages`
- **Layout**: Shared layout components (Header, Footer)
- **UI**: Reusable Radix UI-based components in `/components/ui`
- All components receive `onNavigate` prop for navigation

### State Management

- User authentication state in App.tsx
- User profile loaded from Supabase `users` table
- Auth state synced with Supabase auth listener
- Page-specific state managed locally in page components

### Database Integration

- Supabase client initialized in `/lib/supabase.ts`
- Auth helpers: `authHelpers` (signIn, signUp, signOut, getSession)
- User operations: `userOperations` (CRUD for user profiles)
- Row Level Security (RLS) policies enforce access control

## SQL Scripts

Database setup scripts in root:
- `supabase-setup.sql` - Initial database schema
- `fix-database-columns.sql` - Schema fixes
- `fix-trigger.sql` - Trigger fixes
- `cleanup-policies.sql` - RLS policy cleanup
- `insert-sample-data.sql` - Sample data

## Configuration Files

- `vite.config.ts` - Build configuration with path aliases
- `netlify.toml` - Deployment configuration
- `package.json` - Dependencies and scripts
