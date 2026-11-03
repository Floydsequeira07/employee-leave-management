# Employee Leave Management System

A full-stack web application for employees to apply for leave and track leave balances, and for administrators to review, approve, or reject leave requests. Developed for the Exelon Circuits Pvt. Ltd. Full Stack Developer selection task.

## Live deployment

- **Frontend:** https://employee-leave-management-floyd.vercel.app
- **Backend API:** https://backend-blush-beta-84.vercel.app
- **API health:** https://backend-blush-beta-84.vercel.app/health
- **GitHub source:** https://github.com/Floydsequeira07/employee-leave-management

The frontend and backend are hosted on Vercel. The hosted MySQL database is on Aiven.

## Project overview

The application provides separate employee and administrator workflows. Employees can view their leave balances, submit requests, and track request status. Administrators can view requests and summary information and approve or reject requests.

## Features

### Employee
- Role-based login.
- View casual, sick, earned, and unpaid leave information.
- Apply for leave with type, date range, and reason.
- View leave request history and status.

### Administrator
- Administrator dashboard and summary statistics.
- View employee leave requests.
- Approve or reject leave requests.
- Access protected administrative routes.

### Platform
- Responsive React interface.
- JWT-based authentication.
- Password hashing with bcryptjs.
- MySQL persistence.
- CORS configuration, Helmet security headers, response compression, and login rate limiting.

## Architecture

```text
Browser
  |
  | HTTPS
  v
React + Vite frontend (Vercel)
  |
  | Axios / REST API
  v
Node.js + Express backend (Vercel)
  |
  | mysql2 with TLS
  v
Aiven MySQL (defaultdb)
  +-- users
  +-- leave_balances
  +-- leave_requests
```

## Tech stack

| Layer | Technologies |
|---|---|
| Frontend | React, JavaScript, Vite, Tailwind CSS, Axios, React Router DOM, React Select, React Hot Toast, React Icons |
| Backend | Node.js, Express, mysql2, JWT, bcryptjs, CORS, Helmet, compression, express-rate-limit, dotenv |
| Database | MySQL on Aiven |
| Source control | Git, GitHub |
| Hosting | Vercel (frontend and backend), Aiven (database) |

## Repository structure

```text
.
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── backend/
    ├── api/
    │   └── index.js
    ├── config/
    │   └── db.js
    ├── controllers/
    ├── middleware/
    ├── routes/
    ├── server.js
    ├── addUsers.js
    └── package.json
```

## Prerequisites

- Node.js and npm.
- Git.
- MySQL server for local development, or access to a compatible MySQL database.
- MySQL Workbench or another MySQL client is recommended.

Check installations:

```bash
node --version
npm --version
git --version
```

## Local setup

### 1. Clone the repository

```bash
git clone https://github.com/Floydsequeira07/employee-leave-management.git
cd employee-leave-management
```

### 2. Create the database and tables

For local MySQL, create and select a database:

```sql
CREATE DATABASE leave_management_exelon;
USE leave_management_exelon;
```

Create the three tables (the hosted Aiven database uses the database name `defaultdb`):

```sql
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('employee', 'admin') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leave_balances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  casual_leave INT DEFAULT 12,
  sick_leave INT DEFAULT 10,
  earned_leave INT DEFAULT 15,
  unpaid_leave INT DEFAULT 0,
  casual_total INT DEFAULT 12,
  sick_total INT DEFAULT 10,
  earned_total INT DEFAULT 15,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS leave_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  leave_type ENUM('casual', 'sick', 'earned') NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  admin_comment TEXT,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

If using Aiven, connect through MySQL Workbench with the Aiven connection information and SSL settings, then run the table statements after selecting `defaultdb`. Do not create a separate database named `leave_management_exelon` on Aiven unless you have explicitly configured the service to use it.

### 3. Configure the backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_LOCAL_MYSQL_PASSWORD
DB_NAME=leave_management_exelon
JWT_SECRET=REPLACE_WITH_A_LONG_RANDOM_SECRET
FRONTEND_URL=http://localhost:5173
```

For Aiven, replace the database values with the Aiven hostname, port, username, password, and database name `defaultdb`. Keep secrets private. The backend database module uses TLS configuration for the hosted connection.

Run the backend:

```bash
npm run dev
```

The local API runs at `http://localhost:5000`.

### 4. Provision demo users

After the schema exists and the backend `.env` points to the database where you want the accounts created, run this from the backend directory:

```bash
node addUsers.js
```

The script provisions one admin and two employee accounts and initializes their leave balances. Run it once per database. The script uses bcryptjs to hash passwords.

Assessment demo credentials (change these before any real-world use):

| Role | Email | Password |
|---|---|---|
| Admin | admin@gmail.com | admin123 |
| Employee | emp1@gmail.com | employee123 |
| Employee | emp2@gmail.com | employee123 |

### 5. Configure and run the frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

Run:

```bash
npm run dev
```

Vite normally serves the app at `http://localhost:5173`.

## Environment variables

### Frontend

| Name | Purpose | Local value |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000` |

For the Vercel frontend, set `VITE_API_URL` to `https://backend-blush-beta-84.vercel.app`. Vite variables are embedded at build time, so redeploy the frontend after changing this value.

### Backend

| Name | Purpose | Local example |
|---|---|---|
| `PORT` | Local Express port | `5000` |
| `DB_HOST` | MySQL hostname | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | Set privately |
| `DB_NAME` | Database schema | `leave_management_exelon` |
| `JWT_SECRET` | JWT signing secret | Set privately |
| `FRONTEND_URL` | Allowed frontend origin for CORS | `http://localhost:5173` |

For production, configure the backend variables in Vercel. The Aiven production database uses its assigned hostname and port, username `avnadmin`, and database `defaultdb`. Never commit a real `.env` file or credentials.

## API overview

Base URL: `https://backend-blush-beta-84.vercel.app`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Public | API status message |
| GET | `/health` | Public | Health check |
| POST | `/api/auth/login` | Public | User login |
| GET | `/api/leaves/balance/:userId` | Authenticated | Get leave balance |
| GET | `/api/leaves/my-leaves/:userId` | Authenticated | Get the user's leave requests |
| POST | `/api/leaves` | Authenticated | Apply for leave |
| GET | `/api/leaves/admin/stats` | Admin | Get dashboard statistics |
| GET | `/api/leaves/admin/all` | Admin | List all leave requests |
| PUT | `/api/leaves/admin/:id/approve` | Admin | Approve a request |
| PUT | `/api/leaves/admin/:id/reject` | Admin | Reject a request |

Protected endpoints require the JWT bearer token:

```http
Authorization: Bearer <token>
```

Request and response body schemas are implemented in the backend controllers.

## Deployment

### Hosting overview

| Component | Provider | Production URL / resource |
|---|---|---|
| Frontend | Vercel | https://employee-leave-management-floyd.vercel.app |
| Backend | Vercel | https://backend-blush-beta-84.vercel.app |
| Database | Aiven | MySQL service `leave-management-db`, schema `defaultdb` |
| Source code | GitHub | https://github.com/Floydsequeira07/employee-leave-management |

### Required services

- GitHub repository containing the source.
- Vercel frontend project configured with Root Directory `frontend`.
- Vercel backend project configured with Root Directory `backend`.
- Aiven MySQL service with the application tables and initial users.
- Vercel environment variables for the frontend and backend.

### Initial deployment procedure

1. Push the repository to GitHub.
2. Import the repository into Vercel and create a frontend project with Root Directory `frontend`, framework Vite, build command `npm run build`, and output directory `dist`.
3. Create a second Vercel project for the backend with Root Directory `backend`.
4. Configure the backend environment variables in Vercel, including Aiven database connection values, `JWT_SECRET`, and `FRONTEND_URL`.
5. Create the database tables in Aiven and provision the demo users.
6. Set the frontend Vercel variable `VITE_API_URL` to the backend production URL.
7. Deploy both projects and test the public health endpoint and login flow.

### Updating the deployment

1. Make and test the code changes locally.
2. Commit and push to the connected GitHub branch (normally `main`).
3. Vercel automatically builds and deploys the changed project when Git integration is enabled.
4. Check the Vercel deployment status and runtime logs.
5. Test the frontend and affected API endpoints after deployment.

When only an environment variable changes, update it in the corresponding Vercel project and redeploy that project; a GitHub push is not needed. Frontend `VITE_*` changes require a new frontend build/deployment.

## Security notes

- Do not commit `.env`, passwords, database credentials, or JWT secrets.
- Keep demo passwords limited to assessment/testing and rotate them before broader use.
- Use HTTPS in production.
- Use the exact frontend origin in the backend CORS configuration.
- Restrict database access and rotate credentials if they are exposed.

## Business Requirements Document

The detailed Business Requirements Document is available at [docs/BRD.md](docs/BRD.md). It covers business objectives, scope, stakeholders, functional and non-functional requirements, architecture, data requirements, API summary, assumptions, acceptance criteria, risks, and deployment.

## License

No open-source license has been specified for this assessment project.
