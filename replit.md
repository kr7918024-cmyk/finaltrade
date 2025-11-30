# Meta Traders - Replit Project

## Overview
Meta Traders is a community-based trading management application that provides:
- Client-facing dashboard for viewing trading performance, fund management, and trade reports
- Admin control panel for managing users, funds, withdrawals, KYC, and trade reports
- Real-time trading performance with 20-30% daily profit targets
- Secure authentication with Google OAuth
- Premium gradient design (orange → purple) with light/dark mode

## Tech Stack
- **Frontend**: React + Vite + TypeScript
- **UI Framework**: Tailwind CSS + ShadCN UI
- **Backend**: Supabase (PostgreSQL database)
- **Authentication**: Supabase Auth with Google OAuth
- **Icons**: Lucide React
- **Charts**: Recharts
- **Routing**: React Router DOM
- **State Management**: TanStack Query

## Project Structure
```
src/
├── components/
│   ├── ui/              # ShadCN UI components
│   ├── AppLayout.tsx    # Main app layout with sidebar
│   └── NavLink.tsx      # Navigation link component
├── pages/
│   ├── app/
│   │   ├── admin/       # Admin dashboard components
│   │   ├── Home.tsx     # Client home (today's working)
│   │   ├── Funds.tsx    # Fund management
│   │   ├── Reports.tsx  # Trade reports
│   │   ├── Messages.tsx # Help/Chat
│   │   └── Account.tsx  # Account settings
│   ├── auth/
│   │   ├── Login.tsx    # Login page
│   │   └── Signup.tsx   # Signup with KYC
│   ├── Landing.tsx      # Landing page
│   └── NotFound.tsx     # 404 page
├── integrations/
│   └── supabase/        # Supabase client & types
├── hooks/               # Custom React hooks
└── lib/                 # Utility functions
```

## Database Schema (Supabase)
The application uses the following main tables:
- **user_roles**: Manages user roles (admin, moderator, user)
- **user_profiles**: User profile information with KYC details and balance
- **trades**: Trade records with profit/loss calculations
- **fund_requests**: Deposit and withdrawal requests

## Environment Variables
```
VITE_SUPABASE_URL=<your-supabase-project-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

## Migration from Lovable to Replit - Completed ✅
**Date**: November 13, 2025

### Changes Made:
1. ✅ Configured Vite to bind to `0.0.0.0:5000` (Replit webview requirement)
2. ✅ Fixed Supabase environment variable name from `VITE_SUPABASE_PUBLISHABLE_KEY` to `VITE_SUPABASE_ANON_KEY`
3. ✅ Set up Supabase credentials as Replit secrets
4. ✅ Configured workflow to run `npm run dev` on port 5000
5. ✅ Verified application is running successfully

### Development Server
The application runs on port 5000 and is accessible through the Replit webview.

## User Preferences
- Clean, modern, premium design with gradient themes
- Mobile-responsive interface
- Real-time updates and notifications
- Secure authentication and role-based access control

## Recent Changes
- **2025-11-14**: Fresh GitHub import to Replit environment
  - Imported from repository: https://github.com/amorgankellyofficial-debug/v2.2
  - Configured Vite with `allowedHosts: true` for Replit proxy compatibility
  - Installed Node.js 20 and all npm dependencies
  - Set up Supabase credentials (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
  - Configured dev-server workflow on port 5000
  - Created .gitignore file for Node.js/React projects
  - Configured deployment settings (autoscale)
- **2025-11-13**: Initial migration from Lovable to Replit environment
  - Updated Vite configuration for Replit compatibility
  - Configured environment secrets
  - Set up development workflow

## Key Features Implemented
1. **Authentication System**
   - Email/password login
   - Google OAuth integration
   - KYC-based signup with document uploads

2. **Client Dashboard**
   - Today's working (profit/loss summary)
   - Fund management (add money, view history)
   - Trade reports with filters
   - Account management

3. **Admin Panel**
   - User management
   - Fund request approvals
   - Withdrawal request handling
   - Trade report management
   - KYC verification

4. **Database Integration**
   - Supabase PostgreSQL backend
   - Row Level Security (RLS) policies
   - Automated triggers and functions

## Running the Project
```bash
npm run dev        # Start development server (port 5000)
npm run build      # Build for production
npm run preview    # Preview production build
```

## Next Steps for Development
Refer to `requirements_1763043637006.txt` for the complete feature list and implementation details.
