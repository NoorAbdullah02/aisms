# 🎓 AISMS · AI-Based Student Management System

[![Build Status](https://img.shields.io/badge/Build-Passing-emerald.svg)](https://github.com)
[![Node](https://img.shields.io/badge/Node-v20+-blue.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18%20%2F%2019-cyan.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-v4-slate.svg)](https://expressjs.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle%20ORM-PostgreSQL-green.svg)](https://orm.drizzle.team/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-black.svg)](https://threejs.org/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

An enterprise-grade, full-stack monorepo for modern universities and educational institutions. AISMS unifies academic departments, faculty, student admissions, automated grade point transcripts, continuous attendance monitoring, financial accounting in Bangladeshi Taka (BDT / ৳), and dual-engine AI predictive analytics with real-time WebSocket communication.

---

## 🏛️ System Architecture

AISMS is engineered as a unified full-stack monorepo. In production, **Express serves both the REST API, WebSocket server, and the compiled Vite React frontend SPA from a single unified service origin**—ideal for zero-CORS 1-click deployments on platforms like **Render**, Railway, or AWS.

```mermaid
graph TD
    Client["Browser (Desktop & Mobile SPA)"] -->|HTTP / HTTPS| Express["Express Server (:PORT)"]
    Client -->|WebSocket / WSS| SocketIO["Socket.io Server"]
    Express -->|Static Asset Fallback| ViteSPA["frontend/dist/ (React 19 + Three.js)"]
    Express -->|API Routing /api/*| Controllers["Backend Controllers"]
    Controllers -->|Drizzle ORM (Pooler)| NeonDB[("Neon PostgreSQL Serverless")]
    Controllers -->|Dual AI Intelligence| AIProviders["Mistral AI & Grok xAI Fallback"]
    Controllers -->|Transactional Email| Brevo["Brevo SMTP API"]
    Controllers -->|Media Storage CDN| Cloudinary["Cloudinary High-Speed Image CDN"]
```

---

## 🚀 Key Feature Matrix

### 👤 Role-Based Portals (FR-01, FR-02, FR-03)
* **System Administrator:** Complete administrative oversight over students, faculty, departments, curricula, attendance auditing, results, billing, and system audit trails.
* **Faculty Teacher:** Management of assigned course syllabi, student rosters, digital attendance marking, and grade publishing.
* **Student:** Self-service course enrollment, attendance tracking, semester GPA trendlines, online fee payments (৳), and printable official transcripts.

### 🏢 Department & Curriculum Management (FR-05, FR-06, FR-07)
* Academic faculties and departments with live counts for enrolled students, active courses, and faculty members.
* Course catalog entries with credit weights, semester assignments, teacher mapping, and max seating capacities.
* Interactive **Enrolled Students Roster Modal** to inspect registered students per course.

### 📅 Attendance & Risk Monitoring (FR-08, FR-15)
* Date-based attendance marking with quick actions: **"Mark All Present"**, **"Mark All Absent"**, and **"Mark All Late"**.
* Heuristic attendance compliance engine flagging students below the 75% examination eligibility threshold.

### 📊 Examinations & Official Transcripts (FR-09, FR-10, FR-11)
* Automated letter grade and grade point calculation ($A+$, $A$, $A-$, $B+$, $B$, $C+$, $C$, $D$, $F$) from raw exam marks.
* Course grade sheet management with edit and delete capabilities.
* **Official University Academic Transcript Modal:** Controller of Examinations header, course breakdown, cumulative GPA, and authorized signature seal ready for high-resolution printing.

### 🤖 Dual AI Insights & "What-If" Simulator (FR-14, FR-15, FR-16)
* **Dual LLM Provider:** Multi-provider fallback between **Mistral AI** and **Grok (xAI)** with offline heuristic calculation backup.
* **3D Neural Core Visualizer:** Interactive Three.js particle canvas reacting to mouse movement.
* **What-If Academic Simulator:** Dynamic slider modal letting students simulate future attendance, midterm, and assignment scores to forecast semester final GPA.
* **AI Academic Chat Widget:** Real-time conversational assistant answering student questions on attendance, GPA, and portal navigation.

### 💳 Financial Accounting & Fee Payments (৳ / BDT)
* Complete fee invoicing in Bangladeshi Taka (৳).
* **Online Payment Checkout Modal:** Supports instant simulated payment via **bKash**, **Nagad**, **Rocket**, and **Visa / Mastercard**.
* **Official Fee Receipt:** Auto-generated university tax payment receipts with print and PDF download support.

### 🔔 Real-time Broadcasting & Security Audit (FR-12, FR-13, NFR-17)
* Notice board announcements with targeted audience filters (`All`, `Students`, `Faculty`, `Admins`).
* Live WebSocket event dispatching without requiring manual browser reload.
* **Security Audit Trail:** Immutable chronicle of administrative operations, logins, and status updates with live search and CSV export.

---

## 🔑 Demo Credentials

Once the database is seeded, log in with any of the following accounts:

| Role | Email Address | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@aisms.dev` | `Admin@123` | Full administrative control across all institutional records |
| **Faculty Teacher** | `teacher@aisms.dev` | `Teacher@123` | Course assignments, attendance marking, and grade publishing |
| **Student** | `student@aisms.dev` | `Student@123` | Course registration, results, fee checkout, and AI insights |

*(Demo accounts can also be autofilled with 1-click directly from the login page).*

---

## 🌐 Deploy to Render (Single Web Service)

Because Express serves the compiled React frontend directly in production, you can deploy the **entire application in 1 single Web Service on Render**!

### Step 1: Push Project to GitHub
```bash
git init
git add .
git commit -m "feat: complete production-ready AISMS full-stack monorepo"
git branch -M main
# Add your remote repository:
git remote add origin https://github.com/<your-username>/aisms.git
git push -u origin main
```

### Step 2: Create Web Service on Render
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository (`aisms`).
4. Configure the service settings:
   * **Name:** `aisms` (or your preferred name)
   * **Region:** `Singapore` (or closest to your users)
   * **Branch:** `main`
   * **Root Directory:** *(leave blank)*
   * **Runtime:** `Node`
   * **Build Command:** `npm install && npm run build`
   * **Start Command:** `npm start`
   * **Plan:** `Free`

### Step 3: Add Environment Variables in Render
Under the **Environment** tab of your Render service, add the following variables:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production mode |
| `PORT` | `10000` | Render port (auto-set by Render) |
| `DATABASE_URL` | `postgresql://...` | Neon PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | `super_secure_jwt_access_secret_key` | Secret key for JWT access tokens |
| `JWT_REFRESH_SECRET` | `super_secure_jwt_refresh_secret_key` | Secret key for JWT refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Token expiry duration |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token duration |
| `PRIMARY_AI_PROVIDER` | `mistral` | Primary LLM engine (`mistral` or `grok`) |
| `MISTRAL_API_KEY` | `your_mistral_api_key` | Mistral AI API key |
| `MISTRAL_MODEL` | `mistral-small-latest` | Mistral LLM model identifier |
| `GROK_API_KEY` | `your_grok_api_key` | Grok xAI API key |
| `GROK_MODEL` | `grok-beta` | Grok LLM model identifier |
| `BREVO_API_KEY` | `xkeysib-...` | Brevo SMTP API key |
| `BREVO_SENDER_EMAIL` | `your-verified-email@gmail.com` | Verified Brevo sender email |
| `BREVO_SENDER_NAME` | `AISMS System` | Sender display name |
| `CLOUDINARY_CLOUD_NAME` | `your_cloud_name` | Cloudinary storage account name |
| `CLOUDINARY_API_KEY` | `your_api_key` | Cloudinary API key |
| `CLOUDINARY_API_SECRET`| `your_api_secret` | Cloudinary API secret |
| `CLOUDINARY_UPLOAD_PRESET`| `aisms_uploads` | Cloudinary upload preset |

5. Click **Create Web Service**. Render will install dependencies, build the backend & frontend, and launch your live application on your assigned `https://aisms-xxxx.onrender.com` domain!

---

## 💻 Local Development Setup

### 1. Prerequisites
* **Node.js** v20.0 or higher
* **npm** v10 or higher
* **PostgreSQL** database (Local or cloud hosted on [Neon](https://neon.tech))

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/<your-username>/aisms.git
cd aisms

# Install monorepo dependencies for both backend and frontend
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory (or copy from `.env.example`):
```bash
cp .env.example .env
```

### 4. Database Setup & Seeding
```bash
# Push Drizzle schema to PostgreSQL
npm run db:push

# Seed demo students, faculty, departments, and course records
npm run db:seed

# Optional: Open visual Drizzle Studio database browser
npm run db:studio
```

### 5. Launch Development Servers
```bash
npm run dev
```
* **Frontend:** `http://localhost:5173`
* **Backend API & WebSocket:** `http://localhost:4000`

---

## 🛠️ Tech Stack & Libraries

* **Core Language:** TypeScript (v5.7.2) across the entire stack.
* **Frontend:** React 19, Vite 6, TailwindCSS v3.4, React Router v7, TanStack Query v5, Zustand v5.
* **3D Visuals & Animation:** Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`), Framer Motion, GSAP.
* **Backend:** Node.js, Express v4, Express Async Errors, Helmet, Morgan, Express Rate Limit.
* **Database & ORM:** PostgreSQL (Neon Serverless), Drizzle ORM, Drizzle Kit.
* **Authentication:** JWT (Access & Refresh tokens), Bcrypt.js password encryption.
* **Real-time:** Socket.io (WebSocket with HTTP polling fallback).
* **AI Providers:** Mistral AI, Grok (xAI), Heuristic Neural Engine.
* **Third-Party APIs:** Brevo Transactional Email, Cloudinary Image Storage CDN.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
