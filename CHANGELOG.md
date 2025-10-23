# Changelog - The Mane Review Website

## Latest Updates (October 23, 2025)

### Major Features Added
- ✅ **Account Page**: Full user account management with sections for account details, preferences, submissions, notifications, and security
- ✅ **Admin Dashboard**: Direct article creation for administrators with comprehensive form
- ✅ **Database Integration**: All pages now load articles from Supabase database instead of mock data
- ✅ **Article Display**: Complete article reading experience with formatted content

### Published Articles
1. **Toyota Sales Jump** by Max Cunningham (Markets/USA)
2. **Private Equity Crisis** by Henrique Faria (Opinion/USA)
3. **2008 Financial Crisis** by Gustavo Abdallah (Opinion/USA)
4. **Debt Ceiling Standoff** by Nicolas Thomas (Opinion/USA)

### UI/UX Improvements
- Removed newsletter signup box from homepage
- Improved spacing across all pages (Markets, Opinion, Watchlist, About, Account)
- Updated page titles to consistent 75px size
- Made Markets page title adjustable
- Added curved borders (rounded-xl) throughout for modern aesthetic
- Improved Account page layout with sticky sidebar
- Better article page layout with improved spacing

### Content Updates
- Changed article submission word limit from 800-1500 to 400-1000 words
- Added placeholder data disclaimers on Home and Markets pages
- Removed all "Submit Article" buttons, replaced with contact email (hg3@stpauls.br)
- Updated all contact emails to hg3@stpauls.br
- Simplified Watchlist page to "Coming Soon" message
- Removed article submission tabs from Opinion page

### Authentication & Admin
- Made henriquegullo@icloud.com an Admin account
- Fixed authentication flow with localStorage persistence
- Added admin article creation form
- Removed sharing options from article pages

### Technical Improvements
- Scroll-to-top on page navigation
- Database queries for all article displays
- Improved error handling
- Fixed React Hooks violations in ArticlePage
- Better component organization

### Styling
- Consistent curved borders across UI
- Navy blue selected states for navigation
- Improved button spacing and padding
- Better mobile responsiveness
- Cleaner footer with disclaimers
