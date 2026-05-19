# Novelosity — Ebook Reading & Writing Platform

A full-featured web novel platform built with Next.js 15, inspired by platforms like GoodNovel and Webnovel. Readers browse and read novels, authors write and publish, editors review submissions, and admins manage the platform.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Icons | lucide-react |
| Forms | react-hook-form + Zod |
| Auth (future) | Firebase Auth |
| Database (future) | Firebase Firestore |
| AI | Google Generative AI (Gemini) |
| Deployment | Vercel |

---

## Project Structure

```
novelosity/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout (sidebar, header, role provider)
│   ├── page.tsx                  # Home page (trending, new releases)
│   ├── browse/                   # Book discovery with filters
│   ├── reader/[bookId]/[chapterId]/  # Reading interface
│   ├── authors/                  # Author listings
│   ├── authors/[authorId]/       # Individual author profile
│   ├── login/                    # Auth page
│   ├── profile/                  # User profile + wallet
│   ├── settings/                 # App settings
│   ├── messages/                 # User messaging
│   ├── about/                    # About page
│   ├── privacy-policy/           # Privacy policy
│   ├── author/
│   │   ├── create-novel/         # Novel creation wizard
│   │   └── write/[novelId]/      # Chapter editor
│   ├── author-dashboard/         # Author stats & story management
│   ├── author-communication/     # Editor ↔ Author messaging (editor role)
│   ├── editorial-dashboard/      # Submission review (editor role)
│   ├── content-moderation/       # Reported content queue (editor/admin)
│   ├── admin/
│   │   ├── dashboard/            # Admin control panel
│   │   └── users/                # User management
│   └── tools/
│       └── chapter-title-generator/  # AI-powered title generator
│
├── components/
│   ├── ClientRoleProtector.tsx   # Role-based route guard
│   ├── nav-menu.tsx              # Sidebar navigation (role-aware)
│   ├── site-header.tsx           # Top header with role badge
│   ├── logo.tsx                  # Novelosity logo component
│   └── ui/                       # shadcn/ui components
│       ├── alert.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── checkbox.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── radio-group.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sidebar.tsx
│       ├── slider.tsx
│       ├── switch.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       ├── toast.tsx
│       └── toaster.tsx
│
├── contexts/
│   └── RoleContext.tsx            # Global role state (persisted to localStorage)
│
├── hooks/
│   ├── use-toast.ts              # Toast notification hook
│   └── use-mobile.ts             # Mobile breakpoint hook
│
├── ai/
│   └── flows/
│       └── generate-chapter-title.ts  # Gemini AI title generator (server action)
│
├── types/
│   └── novelosity.ts             # Shared TypeScript types
│
├── lib/
│   └── utils.ts                  # cn() utility (clsx + tailwind-merge)
│
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
└── .env.local                    # Environment variables (not committed)
```

---

## Role-Based Access Control

The platform has 4 user roles. Each role unlocks additional pages and navigation items.

| Role | Pages Accessible |
|------|-----------------|
| `reader` | Home, Browse, Authors, Reader, Messages, Profile, Settings |
| `author` | + Author Dashboard, Create Novel, Write Chapters, AI Title Generator |
| `editor` | + Editorial Dashboard, Author Communication, Content Moderation |
| `admin` | Everything + Admin Dashboard, User Management |

### How it works

- **`RoleContext`** (`contexts/RoleContext.tsx`) — stores the current role in React state and persists it to `localStorage` so it survives page refreshes.
- **`ClientRoleProtector`** (`components/ClientRoleProtector.tsx`) — wraps protected pages. If the user's role isn't in `allowedRoles`, it renders an "Access Denied" screen instead of the page content.
- **`NavMenu`** (`components/nav-menu.tsx`) — conditionally renders sidebar navigation groups based on the current role.

### Usage in pages

```tsx
// Protect a page to author role only
export default function CreateNovelPage() {
  return (
    <ClientRoleProtector allowedRoles={["author", "admin"]} pageTitle="Create Novel">
      <CreateNovelContent />
    </ClientRoleProtector>
  );
}
```

### Testing roles

1. Go to `/profile`
2. Click **"Become an Author"** to upgrade from `reader` → `author`
3. The role badge in the top header updates immediately
4. New sidebar sections appear for the new role

To test `editor` or `admin` roles, open browser DevTools console and run:
```javascript
localStorage.setItem('novelosity_role', 'admin');
location.reload();
```

---

## Key Features

### For Readers
- **Browse** (`/browse`) — filter by genre, tags, completion status, search
- **Read** (`/reader/[bookId]/[chapterId]`) — adjustable font size/family, dark/light mode, fullscreen, chapter navigation, locked/paid chapter unlocking with coins
- **Wallet** (`/profile`) — coin balance, purchase packages (Google Pay UI)
- **Library, History, Downloads, Stats, Badges** — profile sub-sections

### For Authors
- **Create Novel** (`/author/create-novel`) — title, genre, tags, synopsis, cover upload, content rating with Zod form validation
- **Write Chapters** (`/author/write/[novelId]`) — chapter editor, word counter, free/paid pricing, chapter notes, share to social
- **Author Dashboard** (`/author-dashboard`) — income stats, book performance, writing calendar, contract system
- **AI Title Generator** (`/tools/chapter-title-generator`) — describe a chapter, get AI-suggested titles via Gemini

### For Editors
- **Editorial Dashboard** (`/editorial-dashboard`) — review submitted novels, approve/suggest edits/reject
- **Author Communication** (`/author-communication`) — messaging thread with authors
- **Content Moderation** (`/content-moderation`) — reported content queue with action/dismiss

### For Admins
- **Admin Dashboard** (`/admin/dashboard`) — user management, content pipeline, promotions, analytics, financial overview, system health
- **User Management** (`/admin/users`) — view, edit, ban users

---

## Environment Variables

Create a `.env.local` file in the project root (never commit this):

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google AI (Gemini) — for AI Chapter Title Generator
GOOGLE_GENAI_API_KEY=your_gemini_api_key
```

Get your Gemini API key at: https://aistudio.google.com/app/apikey

---

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment (Vercel)

### Option 1: Vercel CLI (recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (follow prompts to link account)
vercel

# Deploy to production
vercel --prod
```

### Option 2: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in with `novelnowus@gmail.com`
2. Click **"Add New Project"**
3. Import from GitHub (connect the `novelosity` repo)
4. Add environment variables from `.env.local`
5. Click **Deploy**

### Required Vercel Environment Variables

Add these in the Vercel dashboard under **Settings → Environment Variables**:

```
GOOGLE_GENAI_API_KEY
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

---

## GitHub Setup

```bash
# Authenticate with GitHub (novelnowus@gmail.com)
gh auth login

# Create the repository
gh repo create novelosity --public --description "Ebook reading and writing platform"

# Push code
git remote add origin https://github.com/novelnowus/novelosity.git
git push -u origin master
```

---

## Design System

**Colors**
- Primary: `#F95700` (vibrant orange)
- Sidebar: orange background with white text
- Dark mode: near-black background with bright orange accents

**Typography**
- Headlines: [Playfair Display](https://fonts.google.com/specimen/Playfair+Display) (serif)
- Body: [PT Sans](https://fonts.google.com/specimen/PT+Sans) (sans-serif)

**Component library**: [shadcn/ui](https://ui.shadcn.com) — all components are in `/components/ui/` and fully customizable.

---

## Roadmap (Future Work)

- [ ] Firebase Authentication (email/password + Google/Apple/Facebook OAuth)
- [ ] Firestore database integration (replace all mock data)
- [ ] Firebase Storage for book cover uploads
- [ ] Real payment processing (Stripe or Google Pay)
- [ ] Real-time messaging (Firestore listeners)
- [ ] Push notifications
- [ ] Search backend (Algolia or Firestore full-text)
- [ ] Author contract PDF generation
- [ ] Analytics dashboard (real data)
- [ ] Mobile app (React Native / Expo)

---

## License

Private — All rights reserved. Novelosity © 2026
