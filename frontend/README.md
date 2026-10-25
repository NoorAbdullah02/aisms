# 🎨 AISMS Frontend SPA

Modern, responsive university portal interface built with React 19, Vite, TypeScript, TailwindCSS, React Three Fiber (Three.js), and Framer Motion.

Author: **Sheikh Noor Abdullah ([@NoorAbdullah02](https://github.com/NoorAbdullah02))**

---

## 🛠️ Technology Stack

- **Core:** React 19 + Vite 6 + TypeScript (strict mode)
- **Routing:** React Router v7 with protected role-based guards (`admin`, `teacher`, `student`)
- **State Management:** Zustand with local storage persistence
- **Server State & Caching:** TanStack Query (React Query) v5 + Axios interceptors for automatic JWT refresh
- **3D Graphics & Visuals:** Three.js + React Three Fiber (`@react-three/fiber`) + Drei (`@react-three/drei`)
- **Animations:** Framer Motion (spring modal dialogs, drawer transitions) + GSAP & ScrollTrigger
- **Forms & Validation:** React Hook Form + Zod validation
- **Data Visualization:** Recharts (pie charts, bar charts, attendance analytics)
- **Icons:** Lucide React

---

## 📂 Project Architecture

```
frontend/src/
├── components/
│   ├── layout/
│   │   └── AppLayout.tsx         # Responsive sidebar & mobile drawer shell
│   ├── three/
│   │   ├── HeroScene.tsx         # Interactive 3D knowledge graph with mouse tracking
│   │   └── AIBrainVisualizer.tsx # 3D neural core with particle orbits for AI Insights
│   ├── ui/
│   │   ├── Modal.tsx             # React createPortal spring-physics modal dialog
│   │   ├── ConfirmModal.tsx      # Safe delete & action confirmation dialog
│   │   ├── PageHeader.tsx        # Standardized page title & action banner
│   │   ├── StatCard.tsx          # Key metric counter card with gradient accents
│   │   └── Table.tsx             # Responsive overflow-x data table
│   ├── ChatWidget.tsx            # Floating AI Assistant chatbot (Mistral + Grok)
│   └── CommandPalette.tsx        # Global search modal (Ctrl + K)
├── pages/
│   ├── LandingPage.tsx           # Institutional marketing landing page
│   ├── LoginPage.tsx             # Multi-role authentication & 1-click demo login
│   ├── DashboardPage.tsx         # Role-tailored overview with live metrics
│   ├── DepartmentsPage.tsx       # Academic department curriculum & faculty manager
│   ├── CoursesPage.tsx           # Course catalog & enrolled student rosters
│   ├── AttendancePage.tsx        # Digital class attendance marker with bulk actions
│   ├── ResultsPage.tsx           # Examination results, grade sheets & printable transcript
│   ├── PredictionsPage.tsx       # AI risk analysis & interactive What-If GPA simulator
│   ├── FeesPage.tsx              # Taka (৳) billing ledger, bKash checkout & receipts
│   ├── NoticesPage.tsx           # Instant notice board with audience filters
│   ├── AuditLogPage.tsx          # Security audit trail with live search & CSV export
│   └── SettingsPage.tsx          # Profile photo upload (Cloudinary) & security credentials
├── lib/
│   ├── api.ts                    # Axios client with JWT auto-refresh interceptors
│   ├── socket.ts                 # Real-time WebSocket connection manager
│   └── types.ts                  # TypeScript types for entire application
└── store/
    └── authStore.ts              # Zustand authentication and session store
```

---

## 🚀 Available Scripts

- `npm run dev` — Start local Vite development server with hot-reload (`http://localhost:5173`)
- `npm run build` — Run TypeScript type checking (`tsc -b`) and bundle for production (`vite build`)
- `npm run preview` — Test and preview compiled production bundle locally
