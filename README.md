# ڨصرة - Guesra - High-Performance Meme Platform

A modern, full-stack meme creation and sharing platform built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Advanced Meme Editor**: Interactive Fabric.js-powered editor with drag-and-drop text layers
- **Community Feed**: Discover and upvote trending memes with real-time voting
- **Authentication**: Secure email/password authentication
- **Responsive Design**: Mobile-first design with dark theme
- **High-Quality Export**: Export memes as high-resolution PNG files

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI**: ShadcnUI components, Framer Motion animations, Lucide icons
- **Backend**: Supabase (Auth, Database, Storage)
- **Editor**: Fabric.js for canvas manipulation
- **Styling**: Custom design system with Impact font for memes

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/meme-hub.git
cd meme-hub
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://fmxdljayzmpbxpymqoba.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZteGRsamF5em1wYnhweW1xb2JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NTEzNjMsImV4cCI6MjA4MzIyNzM2M30.q_2RlwmY_ICigTYcTp80hXEjJDv0Ss-yt4YMQwuWBDA
```

4. Set up Supabase database schema:

Create the following tables in your Supabase dashboard:

**memes table:**
```sql
CREATE TABLE memes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0
);
```

**meme_votes table:**
```sql
CREATE TABLE meme_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meme_id UUID REFERENCES memes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vote_type TEXT CHECK (vote_type IN ('up', 'down')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(meme_id, user_id)
);
```

**profiles table:**
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── editor/            # Meme editor page
│   ├── community/         # Community feed page
│   ├── auth/              # Authentication page
│   └── contact/           # Contact page
├── components/            # Reusable components
│   ├── ui/               # ShadcnUI components
│   ├── Navigation.tsx    # Main navigation
│   └── ThemeProvider.tsx # Theme context
├── lib/                  # Utility functions
│   ├── supabase.ts       # Supabase client
│   └── utils.ts          # General utilities
└── types/                # TypeScript type definitions
```

## Design System

### Colors
- **Primary**: `#FACC15` (Vibrant Yellow)
- **Secondary**: `#000000` (Pure Black)
- **Background**: `#0F0F0F` (Dark)
- **Accent**: `#262626` (Dark Gray)

### Typography
- **UI Font**: Inter (system font stack)
- **Meme Text Font**: Impact (for bold, uppercase text)

### Components
- Button variants: default, destructive, outline, secondary, ghost, link
- Responsive grid layouts
- Smooth animations with Framer Motion
- Dark theme with proper contrast ratios

## Features Overview

### Meme Editor
- Upload custom images or use templates
- Add multiple text layers with full customization
- Drag, resize, and rotate text elements
- Customize font, color, stroke, and effects
- Export high-quality PNG files
- Share to community with Supabase Storage

### Community Feed
- Masonry/grid layout for meme cards
- Upvote/downvote system with real-time updates
- Trending and latest sorting options
- User profiles and creator attribution

### Authentication
- Email/password authentication
- Secure session management
- Profile creation and management

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email hello@meme-hub.com or join our Discord community.