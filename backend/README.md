# AISMS Backend

Express + TypeScript + Drizzle ORM (PostgreSQL) REST API.

## Scripts

- `npm run dev` — start with hot reload (`tsx watch`)
- `npm run build` — compile to `dist/` with `tsc`
- `npm start` — run compiled build (also serves `frontend/dist` if present)
- `npm run db:push` — push `src/db/schema.ts` straight to the database (fast, good for dev)
- `npm run db:generate` — generate SQL migration files from schema changes
- `npm run db:migrate` — apply generated migrations (production-safe path)
- `npm run db:studio` — open Drizzle Studio to browse data
- `npm run db:seed` — insert demo admin/teacher/student + sample data

## API overview

All routes are prefixed with `/api`.

| Resource | Routes |
|---|---|
| Auth | `POST /auth/login`, `POST /auth/refresh`, `GET /auth/me`, `POST /auth/logout` |
| Departments | `GET/POST /departments`, `PATCH/DELETE /departments/:id` |
| Teachers | `GET/POST /teachers`, `DELETE /teachers/:id` |
| Students | `GET/POST /students`, `GET/PATCH/DELETE /students/:id`, `GET /students/me` |
| Courses | `GET/POST /courses`, `PATCH/DELETE /courses/:id`, `POST /courses/register`, `GET /courses/my-enrollments` |
| Attendance | `POST /attendance`, `POST /attendance/bulk`, `GET /attendance/me`, `GET /attendance/student/:id`, `GET /attendance/course/:id` |
| Results | `POST /results`, `GET /results/me`, `GET /results/student/:id` |
| Notices | `GET/POST /notices`, `DELETE /notices/:id` |
| Dashboard | `GET /dashboard/admin`, `GET /dashboard/teacher` |
| AI | `GET /ai/predict/:studentId`, `GET /ai/predict/me` |
| Fees | `GET /fees` (admin), `GET /fees/me` (student), `POST /fees`, `PATCH /fees/:id/status` |
| Search | `GET /search?q=` — instant search across students/teachers/courses |
| Audit | `GET /audit-logs` (admin only) |
| Export | `GET /export/students`, `GET /export/results/:studentId`, `GET /export/attendance/:courseId` — all return CSV |

All routes except `/auth/login` and `/auth/refresh` require `Authorization: Bearer <accessToken>`. Role-based guards restrict each route to admin / teacher / student as documented in the proposal's Scope Definition. The server also runs a Socket.io endpoint on the same port; clients authenticate their socket with the same access token (see `frontend/src/lib/socket.ts`) and receive `notice:new`, `attendance:marked`, `result:published`, `fee:new`, and `fee:updated` events in real time.
