# ⚙️ AISMS Backend API

Enterprise-grade Express + TypeScript + Drizzle ORM (PostgreSQL) REST API & WebSocket Realtime Server.

Author: **Sheikh Noor Abdullah ([@NoorAbdullah02](https://github.com/NoorAbdullah02))**

---

## 📜 Available Scripts

- `npm run dev` — Start development server with live reload (`tsx watch src/index.ts`)
- `npm run build` — Compile TypeScript source code to `dist/` with strict mode
- `npm start` — Run compiled production build (automatically serves `frontend/dist` SPA when present)
- `npm run db:push` — Push `src/db/schema.ts` directly to Neon PostgreSQL database
- `npm run db:generate` — Generate SQL migration files from schema modifications
- `npm run db:migrate` — Execute pending SQL database migrations
- `npm run db:studio` — Launch visual Drizzle Studio database browser
- `npm run db:seed` — Seed demo admin, teacher, student profiles and mock university records

---

## 🌐 Complete API Endpoints Reference

All routes are prefixed with `/api`.

| Module | Method & Route | Access Role | Description |
| :--- | :--- | :--- | :--- |
| **Authentication** | `POST /auth/login` | Public | Login with email & password, returns access + refresh tokens |
| | `POST /auth/refresh` | Public | Exchange refresh token for fresh access token |
| | `GET /auth/me` | Authenticated | Retrieve authenticated user profile |
| | `POST /auth/logout` | Authenticated | Logout and invalidate session |
| | `POST /auth/change-password`| Authenticated | Change user account password |
| | `POST /auth/forgot-password`| Public | Dispatch password reset email via Brevo SMTP API |
| | `PATCH /auth/profile` | Authenticated | Update full name and avatar photo |
| **Departments** | `GET /departments` | Authenticated | List all departments with live student, teacher, and course counts |
| | `POST /departments` | Admin | Create a new academic department |
| | `PATCH /departments/:id` | Admin | Update department title, code, and curriculum description |
| | `DELETE /departments/:id`| Admin | Delete academic department |
| **Teachers** | `GET /teachers` | Authenticated | List all faculty teachers with department names and statuses |
| | `POST /teachers` | Admin | Register new faculty teacher with auto-assigned employee code |
| | `POST /teachers/batch-emails`| Admin | Auto-generate institutional `@faculty.aisms.edu.bd` emails |
| | `POST /teachers/reset-password`| Admin | Reset teacher password and credentials |
| | `DELETE /teachers/:id` | Admin | Remove faculty member |
| **Students** | `GET /students` | Admin, Teacher | List students with search query and department filtering |
| | `GET /students/me` | Student | Get personal student profile and enrollment status |
| | `POST /students` | Admin | Enroll new student with student code and department mapping |
| | `POST /students/batch-emails`| Admin | Auto-generate institutional `@student.aisms.edu.bd` emails |
| | `POST /students/reset-password`| Admin | Reset student portal password |
| | `PATCH /students/:id` | Admin | Update student academic status (active, graduated, suspended) |
| | `DELETE /students/:id` | Admin | Permanently remove student record |
| **Courses** | `GET /courses` | Authenticated | List courses with enrolled counts, department, and teacher names |
| | `GET /courses/:id/students` | Admin, Teacher | Inspect full roster of students enrolled in specific course |
| | `POST /courses` | Admin | Create new course catalog entry with credit weights and capacity |
| | `PATCH /courses/:id` | Admin | Update course syllabus, department, or assigned instructor |
| | `DELETE /courses/:id` | Admin | Delete course entry |
| | `POST /courses/register` | Student | Self-service course enrollment |
| | `GET /courses/my-enrollments`| Student | Retrieve personal registered courses |
| **Attendance** | `POST /attendance` | Admin, Teacher | Mark single student attendance (present, absent, late, excused) |
| | `POST /attendance/bulk` | Admin, Teacher | Bulk mark entire class attendance for date |
| | `GET /attendance/me` | Student | Get personal attendance percentage and session summary |
| | `GET /attendance/course/:id`| Admin, Teacher | Fetch recorded attendance for course on specific date |
| **Results** | `POST /results` | Admin, Teacher | Publish examination marks with auto-calculated grade point/letter |
| | `GET /results/me` | Student | Retrieve personal published marks, CGPA, and total credits |
| | `GET /results/course/:courseId`| Admin, Teacher| Fetch full course grade sheet |
| | `PATCH /results/:id` | Admin, Teacher | Edit marks and semester grade entry |
| | `DELETE /results/:id` | Admin | Delete published grade record |
| **AI Intelligence** | `GET /ai/predict/:studentId` | Admin, Teacher | Heuristic neural GPA prediction, attendance risk, recommendations |
| | `GET /ai/predict/me` | Student | Personal academic trajectory & shortage risk forecast |
| | `POST /ai/chat` | Authenticated | Dual AI chat assistant (Mistral AI & Grok xAI fallback) |
| **Fees & Billing** | `GET /fees` | Admin | View all student fee invoices, revenue, and collection statuses |
| | `GET /fees/me` | Student | Personal fee invoices, balance in Taka (৳), and payment receipts |
| | `POST /fees` | Admin | Issue new fee invoice to student in Taka (৳) |
| | `PATCH /fees/:id/status` | Authenticated | Update invoice status to `paid` or `waived` |
| **Notices** | `GET /notices` | Authenticated | Fetch notices filtered by audience (`all`, `students`, `teachers`, `admins`) |
| | `POST /notices` | Admin, Teacher | Broadcast new institutional notice with instant WebSocket push |
| | `DELETE /notices/:id` | Admin, Teacher | Delete notice announcement |
| **Exports (CSV)** | `GET /export/students` | Admin | Export all students roster as CSV |
| | `GET /export/teachers` | Admin | Export faculty directory as CSV |
| | `GET /export/courses` | Admin | Export course curriculum list as CSV |
| | `GET /export/fees` | Admin | Export financial revenue and billing ledger as CSV |
| | `GET /export/results/:studentId`| Admin, Teacher| Export student results breakdown as CSV |
| | `GET /export/attendance/:courseId`| Admin, Teacher| Export class attendance ledger as CSV |
| **Media & Storage**| `POST /upload/image` | Authenticated | Upload profile photo to Cloudinary CDN storage |
| **Audit Trail** | `GET /audit-logs` | Admin | Security audit trail of all logins, updates, and deletes |
| **Global Search** | `GET /search?q=` | Authenticated | Instant search across departments, courses, teachers, students |
| **Health Check** | `GET /health` | Public | Server uptime and health status (`200 OK`) |

---

## ⚡ Real-Time WebSocket Events (Socket.io)

Clients connect to the Socket.io server with JWT authentication. The server automatically routes events to target rooms:
- `notice:new` — Dispatched when a new announcement is broadcast
- `attendance:marked` — Dispatched when attendance is saved for a class
- `result:published` — Dispatched when student examination marks are recorded
- `fee:new` / `fee:updated` — Dispatched on fee invoice creation or payment
