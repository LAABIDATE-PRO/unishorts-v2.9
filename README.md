# 📘 UniShorts Platform - Technical Documentation (README.md)

## 🧠 Introduction
**UniShorts** is a modern web platform designed to host, discover, and interact with academic short films, submitted and curated by students. The platform ensures exclusivity through university-based access and AI-driven moderation, while offering interactive user experiences akin to industry leaders like Netflix, YouTube, and Google.

---

## 🏗️ Project Structure

```bash
unishorts/
├── public/               # Static assets (icons, images, manifest)
├── src/
│   ├── assets/           # Fonts, colors, images
│   ├── components/       # UI components (Buttons, Cards, Navbar)
│   ├── layouts/          # Page layouts
│   ├── pages/            # Application routes (Home, Film, Login, etc.)
│   ├── lib/              # API & utility functions
│   ├── hooks/            # Custom React hooks
│   ├── styles/           # Global styles, Tailwind config
│   └── context/          # Auth, Theme, Notification Providers
├── supabase/             # Supabase DB schema & migrations
├── .env                 # Environment variables
├── package.json
├── vite.config.ts
└── README.md
```

---

## 🔧 Technology Stack

| Layer           | Tech                                    |
|----------------|------------------------------------------|
| Frontend       | React, TypeScript, TailwindCSS, Vite     |
| Backend        | Supabase (PostgreSQL, Auth, Storage)     |
| Authentication | Supabase Auth (magic link + admin gate)  |
| AI Integration | DeepSeek (Free Tier API)                 |
| Hosting        | Netlify / Vercel                         |
| Emailing       | SMTP / Supabase Email Templates          |

---

## 🌐 Pages Overview

| Route | Description |
|-------|-------------|
| `/` | Landing Page with platform intro & CTAs for new users |
| `/explore` | Explore & filter short films by genre or popularity |
| `/film/:id` | Detailed film page with video, comments, analytics |
| `/favorites` | List of saved films |
| `/login`, `/register` | Auth pages with verification email flow |
| `/upload` | Authenticated users can upload short films |
| `/dashboard` | Film submissions, stats, saved drafts |
| `/settings` | Update profile, account, preferences |
| `/admin` | Admin dashboard: user approvals, film moderation |

---

## 🧩 AI Integration (DeepSeek)

### ✅ AI-Powered Features:
- 🔍 **Smart Search**: Suggest films based on keywords & preferences.
- 🤖 **Auto Tagging**: Analyze film content & generate metadata.
- 🎥 **Preview Analysis**: Show a snippet preview from YouTube links.
- 📊 **User Behavior Tracking**: Suggest films based on viewing time.

```js
const aiSuggestKeywords = async (text) => {
  const res = await fetch("https://api.deepseek.com/keywords", {
    method: "POST",
    headers: {
      "Authorization": `Bearer YOUR_API_KEY`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prompt: text })
  });
  return await res.json();
};
```

---

## 📈 Analytics Module

| Metric | Description |
|--------|-------------|
| Film Views | Tracked with IP + session
| Time Watched | Cumulative seconds viewed per film
| Page Visit Heatmap | Tracks popular pages/sections
| Device Type | Mobile/Desktop/Tablet
| Location | IP-based country/city for regional metrics

All data is stored securely and anonymously (no cookies without consent).

---

## 📬 Email Workflow

### 🔒 Verification
- User receives a link on first sign-up to activate the account.
- If not verified, they are blocked from all content.

### ✅ Approved by Admin
- Admin receives request, and upon approval, user receives a beautiful custom-designed email with activation confirmation.

### 💌 Templates
- Password reset
- Email verification
- Submission accepted/rejected
- Admin invitations

---

## 🔐 Account & Security Features

- Single active session enforcement: auto logout on second device.
- IP & device logging on login
- Optional 2FA (future roadmap)
- Restrict content by country (optional)

---

## 🔔 Notifications Center

```json
{
  "type": "FILM_APPROVED",
  "message": "Your film has been approved and is now live!",
  "timestamp": "2025-07-11T12:34:56Z"
}
```
- Notifications: Film status, new comments, admin responses.
- User can clear or mark as read.

---

## 🖼️ UI/UX Design Guidelines

| Element       | Guideline |
|---------------|-----------|
| Colors        | Primary: #A78BFA, Accent: #D8B4FE, BG: #F5F3FF |
| Fonts         | Headings: Space Grotesk, Body: PT Sans |
| Icons         | Lucide Icons (clean, modern) |
| Animations    | Subtle fade-ins, loading indicators |
| Responsiveness| Fully mobile-first, desktop enhanced |

---

## 📡 Deployment Notes

- **Netlify/Vercel Build Command**:
```bash
npm install && npm run build && netlify deploy
```

- Make sure `.env` includes:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_DEEPSEEK_API_KEY=...
```

---

## 🔄 Future Improvements

- Advanced AI recommendations
- Role-based permissions (Students, Teachers, Admins)
- Live film festivals with voting
- Mobile app (React Native)
- Multi-language support (🇫🇷 🇦🇪 🇲🇦 🇺🇸)

---

## 📮 Contact
If you have any issues, suggestions, or partnership proposals:
📧 **oussamalaabidatepro@gmail.com**

---

> Built with ❤️ by students, for students. Empowering academic creativity through film.
