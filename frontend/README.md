# Performance Appraisal System — Frontend

Next.js 14 (App Router) frontend for the AI-based Performance Appraisal backend.

## Tech Stack
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Axios** (with JWT interceptors)
- **React Context** (auth state)

## Quick Start

```bash
# Install dependencies
npm install

# Set the backend URL in .env.local (already pre-configured for localhost:5000)
# NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Run in development
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Folder Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx       ← Login page
│   │   └── register/page.tsx    ← Register with role selection
│   ├── (dashboard)/
│   │   ├── layout.tsx           ← Protected route wrapper + sidebar
│   │   ├── hr/
│   │   │   ├── page.tsx         ← HR Dashboard (stats + charts)
│   │   │   ├── employees/       ← Full employee list with search
│   │   │   ├── upload/          ← Excel upload with drag & drop
│   │   │   └── analytics/       ← Full analytics page
│   │   ├── manager/
│   │   │   ├── page.tsx         ← Manager Dashboard
│   │   │   ├── employees/       ← Team member list
│   │   │   └── appraisal/       ← Submit appraisal form
│   │   └── employee/
│   │       └── page.tsx         ← Personal appraisal report
│   ├── layout.tsx               ← Root layout with AuthProvider
│   └── page.tsx                 ← Root redirect
├── components/
│   ├── ui/                      ← Card, Badge, Button, Input, Spinner, etc.
│   └── layouts/                 ← Sidebar, PageHeader
├── contexts/
│   └── AuthContext.tsx          ← JWT auth state + role routing
├── hooks/
│   └── useApi.ts                ← Generic async hook with loading/error
├── lib/
│   ├── axios.ts                 ← Axios instance + interceptors
│   ├── cn.ts                    ← Classname utility
│   └── utils.ts                 ← Score colors, date formatting, etc.
├── services/
│   ├── authService.ts           ← POST /auth/login, /auth/register
│   ├── hrService.ts             ← GET /hr/employees, POST /hr/upload
│   ├── managerService.ts        ← GET /manager/employees, POST /manager/appraisals
│   ├── employeeService.ts       ← GET /employee/my-report
│   └── analyticsService.ts     ← GET /analytics/*
└── types/
    └── index.ts                 ← All TypeScript interfaces
```

## Authentication Flow

1. User submits login form → POST `/api/auth/login`
2. Server returns `{ token, user: { id, name, email, role } }`
3. Token stored in `sessionStorage` (clears on tab close)
4. Axios interceptor attaches `Authorization: Bearer <token>` to every request
5. On 401 response → auto-logout and redirect to `/login`
6. Role-based routing: HR → `/hr`, Manager → `/manager`, Employee → `/employee`

## API Routes Used

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | Public | Login |
| POST | `/api/auth/register` | Public | Register |
| GET | `/api/hr/employees` | HR | List all employees |
| POST | `/api/hr/upload` | HR | Upload Excel file |
| GET | `/api/manager/employees` | Manager | List team employees |
| POST | `/api/manager/appraisals` | Manager | Submit appraisal |
| GET | `/api/employee/my-report` | Employee | View own report |
| GET | `/api/analytics/department-performance` | HR | Dept analytics |
| GET | `/api/analytics/top-performers?limit=N` | HR | Top performers |
| GET | `/api/analytics/bias-cases` | HR | Bias detection |
| GET | `/api/analytics/sentiment` | HR | Sentiment stats |
