# Tech Stack

## Frontend

- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 6.3.5
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives (extensive component library)
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **Notifications**: Sonner (toast notifications)
- **Charts**: Recharts
- **Theme**: next-themes for dark/light mode

## Backend & Database

- **Backend**: Supabase (PostgreSQL database + Authentication)
- **Auth**: Supabase Auth with Row Level Security (RLS)
- **API Client**: @supabase/supabase-js

## Database Schema

Key tables:
- `users` - User profiles linked to auth.users
- `articles` - Article content with status workflow (draft → review → published/rejected)
- `article_reviews` - Editorial review tracking
- `submission_guidelines` - Content guidelines for contributors
- `admin_logs` - Audit trail for admin actions

## Common Commands

```bash
# Development
npm run dev          # Start dev server on port 3000

# Build
npm run build        # Production build to /build directory

# Install dependencies
npm install
```

## Development Server

- Port: 3000
- Auto-opens browser on start
- Hot module replacement enabled

## Path Aliases

- `@/*` resolves to `./src/*` for cleaner imports

## Code Style

- TypeScript strict mode
- Functional React components with hooks
- Component composition pattern
- Centralized state management in App.tsx (navigation stack)
- Custom navigation system (no React Router)
