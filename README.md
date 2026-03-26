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

| Method | Endpoint                                | Role     | Description         |
| ------ | --------------------------------------- | -------- | ------------------- |
| POST   | `/api/auth/login`                       | Public   | Login               |
| POST   | `/api/auth/register`                    | Public   | Register            |
| GET    | `/api/hr/employees`                     | HR       | List all employees  |
| POST   | `/api/hr/upload`                        | HR       | Upload Excel file   |
| GET    | `/api/manager/employees`                | Manager  | List team employees |
| POST   | `/api/manager/appraisals`               | Manager  | Submit appraisal    |
| GET    | `/api/employee/my-report`               | Employee | View own report     |
| GET    | `/api/analytics/department-performance` | HR       | Dept analytics      |
| GET    | `/api/analytics/top-performers?limit=N` | HR       | Top performers      |
| GET    | `/api/analytics/bias-cases`             | HR       | Bias detection      |
| GET    | `/api/analytics/sentiment`              | HR       | Sentiment stats     |

---

## AI-Based Smart Performance Appraisal System (Backend)

Node.js / Express.js backend for an AI-based smart performance appraisal system with:

- **MongoDB (Mongoose)**
- **JWT Authentication**
- **Role-based access control (HR / Manager / Employee)**
- **Multer + XLSX** for HR Excel upload
- **Sentiment analysis** (using `sentiment` library)
- **Bias detection** and **weighted final score**

### Project Structure

- `server.js` – Express app, middleware, MongoDB connection, and route mounting.
- `models/` – `User`, `Employee`, `Appraisal` Mongoose models.
- `controllers/` – Request handlers for Auth, HR, Manager, Employee, Analytics.
- `routes/` – Route definitions per module.
- `middleware/` – Auth, role-based access, upload, and error handling.
- `services/` – Business logic (auth, HR upload, manager appraisals, employee report, analytics, sentiment).
- `utils/` – DB connection, JWT helper, score calculator, password generator.

### Installation

```bash
npm install
```

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` and set:

- **MONGO_URI** – e.g. `mongodb://localhost:27017/performance_appraisal_db`
- **JWT_SECRET** – any strong random string
- **PORT** – optional (default `5000`)

### Running the Server

```bash
# development (with nodemon)
npm run dev

# production
npm start
```

Server will start on `http://localhost:5000` (or your configured `PORT`).

Health check:

```http
GET /health
```

### Authentication & Roles

- **User fields**: `name`, `email`, `password` (hashed), `role` (`HR` | `Manager` | `Employee`), `employee` (ref to Employee for employees).
- **JWT** based auth using `Authorization: Bearer <token>`.

Auth routes:

- `POST /api/auth/register` – register user (HR, Manager, or Employee). For demo only.
- `POST /api/auth/login` – login, returns `{ token, user }`.

### Role Permissions

- **HR**
  - Upload Excel with performance data
  - View all employees
  - View analytics
- **Manager**
  - View employee list
  - Submit appraisals
- **Employee**
  - View **only their own** appraisal report

Role enforcement is handled by `authMiddleware` and `authorizeRoles`.

### 1. HR Excel Upload Module

Route:

```http
POST /api/hr/upload-excel
Authorization: Bearer <HR JWT>
Content-Type: multipart/form-data
file: <Excel file>
```

Excel required columns:

- `employeeId` (unique)
- `name`
- `email`
- `department`
- `attendancePercentage`
- `kpiScore`
- `salesAchievementPercentage`
- `peerRating`

Behavior:

- Validates required columns.
- Prevents duplicate `employeeId` (in file and in DB).
- Creates `Employee` records.
- Creates corresponding `User` accounts with role `Employee` (random generated password).
- Returns upload summary: `{ processed, success, failed, errors[] }`.

List employees (HR):

```http
GET /api/hr/employees
Authorization: Bearer <HR JWT>
```

### 2. Manager Appraisal Module

List employees (Manager):

```http
GET /api/manager/employees
Authorization: Bearer <Manager JWT>
```

Submit appraisal:

```http
POST /api/manager/appraisals
Authorization: Bearer <Manager JWT>
Content-Type: application/json

{
  "employeeId": "<Employee Mongo _id>",
  "managerRating": 1-5,
  "managerFeedback": "text feedback"
}
```

Creates an `Appraisal` linked to:

- `employee` (Employee ref)
- `manager` (User ref)

### 3. AI Sentiment Analysis & Bias Detection

When an appraisal is created:

- Sentiment is computed on `managerFeedback` using the `sentiment` library:
  - `sentimentScore` normalized to roughly \[-1, 1\]
  - `sentimentCategory`: `Positive`, `Neutral`, or `Negative`
- Bias detection:
  - If `managerRating` ≤ 2 **and** sentiment is `Positive`
  - Or `managerRating` ≥ 4 **and** sentiment is `Negative`
  - Then `biasFlag = true`

Stored in `Appraisal`:

- `sentimentScore`
- `sentimentCategory`
- `biasFlag`

### 4. Weighted Final Score

Final score formula:

- **40%** – KPI score
- **30%** – Attendance %
- **20%** – Manager rating (normalized 1–5 → 0–100)
- **10%** – Peer rating (normalized 1–5 → 0–100)

Performance categories:

- `>= 85` → **Excellent**
- `70–84` → **Good**
- `50–69` → **Average**
- `< 50` → **Needs Improvement**

Stored in `Appraisal`:

- `finalScore`
- `performanceCategory`

### 5. Employee View Module

Employee self-report:

```http
GET /api/employee/my-report
Authorization: Bearer <Employee JWT>
```

Returns:

- Personal details (from `Employee`)
- KPI score
- Attendance
- Manager rating
- Manager feedback
- Sentiment category & score
- Final score
- Performance category
- Bias flag

Security:

- Uses JWT to identify the user and their linked `Employee`.
- Does **not** allow accessing any other employee’s data.

### 6. HR Analytics (HR Only)

All analytics routes require HR JWT:

- Department-wise average performance:

  ```http
  GET /api/hr/analytics/department-performance
  Authorization: Bearer <HR JWT>
  ```

- Top performers (default top 5, configurable via `?limit=`):

  ```http
  GET /api/hr/analytics/top-performers?limit=5
  Authorization: Bearer <HR JWT>
  ```

- Employees with `biasFlag = true`:

  ```http
  GET /api/hr/analytics/bias-cases
  Authorization: Bearer <HR JWT>
  ```

- Overall average sentiment score:

  ```http
  GET /api/hr/analytics/average-sentiment
  Authorization: Bearer <HR JWT>
  ```

### Notes

- For production, lock down registration, manage initial HR user via seeding/migration, and plug in email to deliver auto-generated passwords or reset links.
- You can replace the local sentiment library with an external AI provider by adjusting `services/sentimentService.js`.
