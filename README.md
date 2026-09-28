# SpendScope

Minimal foundation for **SpendScope**, featuring authentication and a private dashboard.

---

## 📁 Folder Structure

```text
spendscope/
├── public/                    # Static public assets
├── src/                       # Application source code
│   ├── app/                   # Next.js App Router routes & layouts
│   │   ├── (public)/          # Public routes
│   │   │   ├── sign-in/       # Sign-in page (/sign-in)
│   │   │   │   └── page.jsx
│   │   │   ├── signup/        # Signup page (/signup)
│   │   │   │   └── page.jsx
│   │   │   └── layout.jsx     # Public layout wrapper
│   │   │
│   │   ├── (private)/         # Private routes
│   │   │   ├── dashboard/     # Minimal dashboard (/dashboard)
│   │   │   │   └── page.jsx
│   │   │   └── layout.jsx     # Private layout wrapper
│   │   │
│   │   ├── favicon.ico        # App icon
│   │   ├── globals.css        # Global CSS & Tailwind styling
│   │   ├── layout.jsx         # Root app layout
│   │   ├── loading.jsx        # Root loading component
│   │   └── provider.jsx       # Global providers (Redux Store & Toastify)
│   │
│   ├── components/            # UI components
│   ├── hooks/                 # Custom hooks
│   │   └── useAuth.js         # Authentication hook
│   │
│   ├── lib/                   # Client libraries & config
│   │   └── supabaseconfig.js  # Supabase client initialization
│   │
│   ├── redux/                 # Redux Toolkit state management
│   │   ├── actions.js         # Shared Redux actions
│   │   ├── index.js           # Store configuration & persistence
│   │   ├── rootReducer.js     # Root reducer
│   │   └── slices/
│   │       └── authSlice.js   # Authentication slice & cookie sync
│   │
│   ├── services/              # API interaction services
│   │   └── authService.js     # Supabase auth service
│   │
│   ├── utils/                 # Utilities and helpers
│   └── middleware.js          # Next.js authentication & route protection middleware
│
├── .env.local                 # Local environment variables
├── package.json               # NPM scripts and dependencies
└── README.md                  # Project documentation
```

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) & [Redux Persist](https://github.com/rt2zz/redux-persist)
- **Backend / Authentication**: [Supabase](https://supabase.com/)
- **Feedback**: [React Toastify](https://fkhadra.github.io/react-toastify/)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18.x or higher)
- npm, yarn, or pnpm

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Ensure `.env.local` contains your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Sign in: [http://localhost:3000/sign-in](http://localhost:3000/sign-in)
   - Sign up: [http://localhost:3000/signup](http://localhost:3000/signup)
   - Dashboard: [http://localhost:3000/dashboard](http://localhost:3000/dashboard) (Protected)
