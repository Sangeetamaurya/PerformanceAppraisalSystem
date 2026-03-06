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

