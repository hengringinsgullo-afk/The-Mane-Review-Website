# The Mane Review - Complete Site Architecture

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Database Schema](#database-schema)
5. [Authentication & Authorization](#authentication--authorization)
6. [Key Features](#key-features)
7. [API Integrations](#api-integrations)
8. [Deployment](#deployment)

---

## 🎯 Project Overview

**The Mane Review** is a financial publication website created by students at St. Paul's School. The platform makes markets and investing approachable for students and anyone interested in finance and economic thinking.

### Target Audience
- **Primary**: St. Paul's School students learning about finance
- **Secondary**: General audience interested in accessible financial content

### Core Purpose
- Educational financial content
- Student-contributed articles
- Real-time market data
- Community-driven watchlists

---

## 🛠 Tech Stack

### Frontend
```
Framework:      React 18.3.1 with TypeScript
Build Tool:     Vite 6.3.5
Styling:        Tailwind CSS + Custom Design System
UI Components:  Radix UI (extensive component library)
Icons:          Lucide React
Forms:          React Hook Form
Notifications:  Sonner (toast notifications)
Charts:         Recharts
Theme:          next-themes (dark/light mode)
```

### Backend & Database
```
Backend:        Supabase (PostgreSQL + Auth + Storage + Edge Functions)
Auth:           Supabase Auth with Row Level Security (RLS)
API Client:     @supabase/supabase-js
Real-time:      Supabase Realtime subscriptions
Storage:        Supabase Storage (for article images)
```

### AI & External APIs
```
AI Image Gen:   Google Gemini 2.5 Flash Image
AI Prompts:     Google Gemini 2.5 Flash Lite Preview
Market Data:    Alpha Vantage API + Finnhub API + Brapi (Brazilian stocks)
Symbol Search:  Alpha Vantage Symbol Search
```

### Deployment
```
Hosting:        Netlify
Domain:         themanereview.com
CDN:            Netlify Edge
SSL:            Automatic (Netlify)
```

---

## 📁 Project Structure

```
/
├── src/
│   ├── components/
│   │   ├── pages/              # Full page components
│   │   │   ├── HomePage.tsx
│   │   │   ├── MarketsPage.tsx
│   │   │   ├── OpinionPage.tsx
│   │   │   ├── WatchlistPage.tsx
│   │   │   ├── ArticlePage.tsx
│   │   │   ├── AuthPage.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AccountPage.tsx
│   │   │   └── AboutPage.tsx
│   │   │
│   │   ├── layout/             # Layout components
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   │
│   │   └── ui/                 # Reusable UI components (Radix-based)
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── badge.tsx
│   │       ├── table.tsx
│   │       ├── article-card.tsx
│   │       ├── article-submission-form.tsx
│   │       ├── enhanced-article-review.tsx
│   │       └── ... (30+ components)
│   │
│   ├── lib/
│   │   ├── supabase.ts         # Supabase client & operations
│   │   ├── types.ts            # TypeScript type definitions
│   │   ├── data.ts             # Static data and mock content
│   │   ├── market-api.ts       # Market data API integration
│   │   ├── symbol-search.ts    # Stock symbol search
│   │   ├── auth-utils.ts       # Authentication utilities
│   │   └── gemini-image-service.ts  # AI image generation
│   │
│   ├── utils/
│   │   ├── device-detection.ts # Device & iPhone detection
│   │   └── supabase/
│   │       └── info.tsx        # Supabase config info
│   │
│   ├── supabase/
│   │   └── functions/          # Supabase Edge Functions
│   │       ├── gemini-image/   # AI image generation endpoint
│   │       └── stock-data/     # Stock data proxy endpoint
│   │
│   ├── App.tsx                 # Main app component (navigation)
│   ├── main.tsx                # Application entry point
│   └── index.css               # Global CSS + Tailwind
│
├── supabase/                   # Supabase deployment files
│   └── functions/
│       ├── gemini-image/
│       └── stock-data/
│
├── index.html                  # Entry HTML
├── vite.config.ts              # Vite configuration
├── package.json                # Dependencies and scripts
├── netlify.toml                # Netlify deployment config
├── .env                        # Environment variables (local)
└── *.sql                       # Database setup scripts
```

---

## 🗄 Database Schema

### Core Tables

#### `users`
```sql
- id (uuid, PK)
- auth_id (uuid, FK to auth.users)
- email (text)
- name (text)
- role (text) -- Admin, Editor, Contributor, Student, Reader
- bio (text)
- avatar_url (text)
- created_at (timestamp)
- updated_at (timestamp)
```

#### `articles`
```sql
- id (uuid, PK)
- slug (text, unique)
- title (text)
- excerpt (text)
- body (text)
- cover_image (text)
- cover_alt (text)
- category (text) -- Opinion, Markets, Analysis
- region (text) -- USA, Europe, South America, Asia, Global
- tags (text[])
- author_id (uuid, FK to users)
- author_role (text)
- status (text) -- draft, review, published, rejected
- featured (boolean)
- est_read_min (integer)
- views (integer)
- published_at (timestamp)
- reviewer_id (uuid, FK to users)
- review_notes (text)
- request_ai_image (boolean)
- ai_image_url (text)
- ai_image_prompt (text)
- ai_image_status (text) -- pending, generating, completed, failed
- created_at (timestamp)
- updated_at (timestamp)
```

#### `article_reviews`
```sql
- id (uuid, PK)
- article_id (uuid, FK to articles)
- reviewer_id (uuid, FK to users)
- decision (text) -- approved, rejected, needs_changes
- comments (text)
- created_at (timestamp)
```

#### `watchlist`
```sql
- id (uuid, PK)
- user_id (uuid, FK to users)
- symbol (text)
- added_at (timestamp)
- UNIQUE(user_id, symbol)
```

#### `submission_guidelines`
```sql
- id (uuid, PK)
- title (text)
- content (text)
- category (text)
- order_index (integer)
- active (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

#### `admin_logs`
```sql
- id (uuid, PK)
- admin_id (uuid, FK to users)
- action (text)
- target_type (text)
- target_id (uuid)
- details (jsonb)
- created_at (timestamp)
```

### Storage Buckets

#### `article-images`
- **Purpose**: Store AI-generated and uploaded article images
- **Access**: Public read, authenticated write
- **Format**: PNG, JPEG, WebP
- **Max Size**: 5MB per file

---

## 🔐 Authentication & Authorization

### Authentication Flow
1. **Sign Up**: Email + Password via Supabase Auth
2. **Sign In**: Email + Password
3. **Session**: JWT tokens (access + refresh)
4. **Profile**: Auto-created in `users` table via trigger

### User Roles & Permissions

#### Reader (Default)
- ✅ View published articles
- ✅ Browse markets data
- ✅ Create personal watchlist
- ❌ Submit articles
- ❌ Access admin features

#### Student
- ✅ All Reader permissions
- ✅ Submit articles for review
- ✅ View own submissions
- ❌ Publish directly

#### Contributor
- ✅ All Student permissions
- ✅ Submit articles for review
- ✅ View submission guidelines

#### Editor
- ✅ All Contributor permissions
- ✅ Review submitted articles
- ✅ Approve/reject articles
- ✅ Request changes
- ❌ Delete published articles

#### Admin
- ✅ All Editor permissions
- ✅ User management
- ✅ Delete any article
- ✅ Manage submission guidelines
- ✅ View admin logs
- ✅ Access admin dashboard

### Row Level Security (RLS)

All tables have RLS enabled with policies:

**Articles**:
- Public can read published articles
- Authenticated users can create drafts
- Authors can update their own drafts
- Editors/Admins can update any article

**Watchlist**:
- Users can only see/modify their own watchlist

**Users**:
- Public can read basic user info
- Users can update their own profile
- Admins can update any profile

---

## ✨ Key Features

### 1. Article Management System

#### For Students/Contributors
- Submit articles via rich text editor
- Request AI-generated featured images
- Track submission status
- View editorial feedback

#### For Editors/Admins
- Review queue with filtering
- Approve/reject/request changes
- AI-powered image generation on approval
- Bulk operations

#### Article Workflow
```
Draft → Review → (Approved/Rejected/Needs Changes) → Published
```

### 2. AI Image Generation

**Technology**: Google Gemini 2.5 Flash Image

**Process**:
1. Author requests AI image during submission
2. Article goes through editorial review
3. On approval, AI generates image automatically:
   - Step 1: Gemini analyzes article → creates prompt
   - Step 2: Gemini generates 16:9 image
   - Step 3: Image uploaded to Supabase Storage
   - Step 4: Article updated with image URL

**Models Used**:
- `gemini-2.5-flash-lite-preview-09-2025` (prompt generation)
- `gemini-2.5-flash-image` (image generation)

### 3. Real-Time Market Data

**Data Sources**:
- **Alpha Vantage**: US stocks, global markets
- **Finnhub**: Real-time quotes, company info
- **Brapi**: Brazilian stocks (B3)

**Features**:
- Real-time stock quotes
- Price changes & percentages
- Volume data
- Company information
- Symbol search with autocomplete

**Caching**:
- 5-minute cache for quotes
- 1-hour cache for company info
- Force refresh option available

### 4. Personal Watchlist

**Features**:
- Add/remove stocks
- Real-time price updates
- Sort by symbol, price, change, volume
- Search within watchlist
- Mobile-optimized cards (expandable)
- Desktop table view

**Community Watchlist**:
- Most tracked symbols across all users
- Real-time popularity tracking
- Discover trending stocks

### 5. Markets Coverage

**Regions**:
- 🇺🇸 USA
- 🇪🇺 Europe
- 🇧🇷 South America
- 🇨🇳 Asia
- 🌍 Global

**Content**:
- Market analysis articles
- Regional insights
- Economic trends
- Investment perspectives

### 6. Mobile Optimization

**iPhone 17 Pro Max Specific**:
- Safe area insets for notch
- True black OLED optimization
- Touch-optimized UI (44px+ targets)
- Compact expandable cards
- No horizontal scrolling
- Responsive typography

**General Mobile**:
- Responsive breakpoints
- Touch gestures
- Swipe navigation
- Modal optimization
- Reduced motion support

---

## 🔌 API Integrations

### 1. Supabase

**Base URL**: `https://dlpfkrqvptlgtampkqvd.supabase.co`

**Services Used**:
- **Database**: PostgreSQL with RLS
- **Auth**: Email/password authentication
- **Storage**: Article images
- **Edge Functions**: AI image generation, stock data proxy
- **Realtime**: Live updates (optional)

**Environment Variables**:
```env
VITE_SUPABASE_URL=https://dlpfkrqvptlgtampkqvd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 2. Google Gemini AI

**Purpose**: AI-powered image generation

**API Key**: Stored as Supabase secret (`VITE_GOOGLE_API_KEY`)

**Endpoints** (via Edge Function):
- `POST /functions/v1/gemini-image/prompt` - Generate image prompt
- `POST /functions/v1/gemini-image/image` - Generate image
- `POST /functions/v1/gemini-image/generate` - Complete workflow

**Rate Limits**:
- Prompt generation: ~$0.00001 per request
- Image generation: ~$0.02-0.04 per image

### 3. Alpha Vantage

**Purpose**: Stock market data

**API Key**: `ALPHA_VANTAGE_API_KEY` (Supabase secret)

**Endpoints Used**:
- `GLOBAL_QUOTE` - Real-time quotes
- `SYMBOL_SEARCH` - Symbol autocomplete
- `OVERVIEW` - Company information

**Rate Limits**: 5 calls/minute (free tier)

### 4. Finnhub

**Purpose**: Alternative stock data source

**API Key**: `FINNHUB_API_KEY` (Supabase secret)

**Endpoints Used**:
- `/quote` - Stock quotes
- `/profile2` - Company profiles

**Rate Limits**: 60 calls/minute (free tier)

### 5. Brapi

**Purpose**: Brazilian stock market data (B3)

**Base URL**: `https://brapi.dev/api`

**Endpoints Used**:
- `/quote/{ticker}` - Brazilian stock quotes

**Rate Limits**: No authentication required, generous limits

---

## 🚀 Deployment

### Netlify Configuration

**Build Settings**:
```toml
[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Environment Variables** (Netlify):
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_GOOGLE_API_KEY (not used in production - moved to Supabase)
```

### Supabase Edge Functions

**Deployment**:
```bash
supabase functions deploy gemini-image --project-ref dlpfkrqvptlgtampkqvd
supabase functions deploy stock-data --project-ref dlpfkrqvptlgtampkqvd
```

**Secrets** (Supabase):
```bash
supabase secrets set VITE_GOOGLE_API_KEY=xxx
supabase secrets set ALPHA_VANTAGE_API_KEY=xxx
supabase secrets set FINNHUB_API_KEY=xxx
```

### Build Process

1. **Local Development**:
   ```bash
   npm run dev  # Starts on port 3000
   ```

2. **Production Build**:
   ```bash
   npm run build  # Outputs to /build
   ```

3. **Deployment**:
   - Push to GitHub main branch
   - Netlify auto-deploys
   - Edge Functions deployed separately via Supabase CLI

---

## 📊 Performance Optimizations

### Frontend
- ✅ Code splitting (Vite)
- ✅ Lazy loading images
- ✅ Optimized bundle size
- ✅ Tree shaking
- ✅ CSS purging (Tailwind)

### Backend
- ✅ Database indexes on frequently queried columns
- ✅ RLS policies for security
- ✅ Connection pooling (Supabase)
- ✅ Edge Functions for API proxying

### Caching
- ✅ Market data cached (5 min)
- ✅ Company info cached (1 hour)
- ✅ Static assets cached (CDN)
- ✅ Service worker (optional)

### Mobile
- ✅ Touch-optimized UI
- ✅ Reduced animations
- ✅ Optimized images
- ✅ Minimal JavaScript

---

## 🔒 Security

### Authentication
- ✅ JWT tokens (Supabase)
- ✅ Secure password hashing
- ✅ Email verification (optional)
- ✅ Session management

### Authorization
- ✅ Row Level Security (RLS)
- ✅ Role-based access control
- ✅ API key protection (server-side)
- ✅ CORS configuration

### Data Protection
- ✅ SQL injection prevention (Supabase)
- ✅ XSS protection (React)
- ✅ CSRF protection
- ✅ HTTPS only

---

## 📈 Analytics & Monitoring

### Metrics Tracked
- Article views
- User registrations
- Article submissions
- Watchlist additions
- Market data requests

### Logging
- Admin actions logged
- Article review history
- Error tracking (console)
- Performance monitoring (optional)

---

## 🎨 Design System

### Colors
- **Primary**: Financial blue/navy
- **Secondary**: Gold/amber accents
- **Success**: Green (positive changes)
- **Destructive**: Red (negative changes)
- **Muted**: Gray tones

### Typography
- **Headlines**: Playfair Display (serif)
- **Body**: Inter (sans-serif)
- **Monospace**: System mono

### Spacing
- Base unit: 0.25rem (4px)
- Scale: 1, 2, 3, 4, 6, 8, 12, 16, 20, 24

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

---

## 🐛 Known Issues & Limitations

### Current Limitations
1. **Market Data**: Free tier API limits (5-60 calls/min)
2. **AI Images**: Cost per generation (~$0.02-0.04)
3. **Real-time**: Not true real-time (5-min cache)
4. **Search**: Basic text search (no full-text)

### Future Enhancements
- [ ] Full-text search (PostgreSQL)
- [ ] Real-time notifications
- [ ] Email notifications
- [ ] Advanced charting
- [ ] Portfolio tracking
- [ ] Social features (comments, likes)
- [ ] Mobile app (React Native)

---

## 📞 Support & Contact

**Technical Issues**: Check console logs and Supabase dashboard
**Content Issues**: Contact editorial team
**General Inquiries**: hg3@stpauls.br

---

## 📝 License & Credits

**Created by**: St. Paul's School students
**Maintained by**: The Mane Review editorial team
**Built with**: React, Supabase, Tailwind CSS, and ❤️

---

**Last Updated**: November 2025
**Version**: 2.0
**Status**: ✅ Production Ready
