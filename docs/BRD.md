# Business Requirements Document (BRD)
## Employee Leave Management System

**Prepared for:** Exelon Circuits Pvt. Ltd.  
**Project:** Employee Leave Management System  
**Document type:** Business Requirements Document  
**Version:** 1.0  
**Status:** Submitted project documentation  
**Date:** 3 November 2026

---

## 1. Purpose

This Business Requirements Document (BRD) defines the business objectives, scope, users, functional requirements, business rules, assumptions, and deployment approach for the Employee Leave Management System. It is intended to help stakeholders and developers understand what the application is expected to do and how it is operated.

## 2. Project Overview

The Employee Leave Management System is a web application for employees to submit leave requests and monitor leave balances and request status, and for administrators to review, approve, or reject those requests.

The system replaces an informal or manual leave-request process with a centralized interface and a persistent MySQL database. It provides role-based access for employees and administrators.

**Hosted application:** https://employee-leave-management-floyd.vercel.app  
**Backend API:** https://backend-blush-beta-84.vercel.app  
**Source repository:** https://github.com/Floydsequeira07/employee-leave-management

## 3. Business Objectives

1. Provide employees with a simple way to apply for leave online.
2. Give employees visibility into leave balances and request history.
3. Provide administrators with a central place to review and process requests.
4. Maintain consistent records of leave applications and decisions.
5. Reduce manual tracking and improve the transparency of leave-request status.

## 4. Scope

### 4.1 In scope

- Employee and administrator login.
- Role-based access to employee and administrator functionality.
- Employee leave balance viewing.
- Submission of leave requests with type, dates, and reason.
- Viewing personal leave-request history and statuses.
- Administrator overview of leave requests and summary statistics.
- Approval and rejection of leave requests.
- Recording of administrator comments where supported by the application.
- Persistence of users, leave balances, and leave requests in MySQL.
- Responsive browser-based user interface.
- Deployment of frontend and backend to Vercel and database hosting on Aiven MySQL.

### 4.2 Out of scope

- Payroll processing and salary calculations.
- Integration with third-party HR, attendance, or payroll platforms.
- Email/SMS notifications unless separately implemented.
- SSO, enterprise identity-provider integration, and multi-factor authentication.
- Native Android or iOS applications.
- Advanced multi-level approval workflows and configurable policy engines.

## 5. Stakeholders and User Roles

| Stakeholder / role | Responsibility |
|---|---|
| Employee | Authenticate, view own balances, apply for leave, and track own requests. |
| Administrator | Review requests, inspect leave information, and approve or reject requests. |
| HR / business owner | Define leave policy, administer user access, and use records for operational oversight. |
| Developer / maintainer | Configure, run, deploy, monitor, and maintain the application and its database. |

## 6. Functional Requirements

### FR-01: Authentication

- The system shall provide a login interface.
- Users shall authenticate using their registered email and password.
- Passwords shall be stored as password hashes, not plaintext.
- The application shall issue and use an authentication token for protected operations.
- The user role shall determine access to employee or administrator features.

### FR-02: Employee dashboard

- An authenticated employee shall be able to view their dashboard.
- The dashboard shall show leave balance information available for that employee.
- The employee shall be able to navigate to leave application and leave-history views.

### FR-03: Apply for leave

- An employee shall be able to select a leave category.
- An employee shall provide a start date, end date, and reason.
- The application shall submit the request to the backend.
- A submitted request shall be recorded with a status of Pending.

### FR-04: Leave history and status

- An employee shall be able to view their own leave requests.
- Each request shall display relevant request details and its current status.
- The system shall distinguish pending, approved, and rejected requests.

### FR-05: Leave balance

- The application shall display the employee's available leave categories and balances.
- The application shall maintain leave balance records associated with employees.
- Leave balance changes shall follow the configured approval and leave accounting logic.

### FR-06: Administrator dashboard

- An administrator shall be able to view administrative summary information.
- An administrator shall be able to view the list of leave requests.
- An administrator shall be able to review request details before taking action.

### FR-07: Approve or reject leave

- An administrator shall be able to approve a pending request.
- An administrator shall be able to reject a pending request.
- The request status shall be updated and persisted.
- An administrator comment may be recorded where the interface and API support it.
- The system shall prevent unauthorized employees from accessing administrator operations.

## 7. Business Rules

1. Only authenticated users may access protected leave operations.
2. Employees may access their own leave information; administrator operations require the administrator role.
3. New leave requests are created with Pending status.
4. Pending and rejected requests must not be treated as approved leave.
5. Approved leave shall be accounted for according to the available leave balance and the application's leave calculation logic.
6. Leave balance values must be associated with the correct user.
7. Passwords must be hashed using the backend password-hashing implementation.
8. Database credentials, JWT secrets, and other secrets must be stored in deployment environment variables and must not be committed to source control.

**Policy note:** Leave quotas and any paid-leave/LOP calculation are implementation defaults for this assessment. An organization adopting the system should confirm them against its official HR policy before production use.

## 8. Data Requirements

The application uses a MySQL database. The hosted database service is Aiven MySQL, with the application schema hosted in the `defaultdb` database.

| Entity / table | Purpose | Main information |
|---|---|---|
| `users` | User identity and access | Name, unique email, hashed password, role, creation timestamp |
| `leave_balances` | Per-user leave entitlement and remaining balances | User reference, leave category balances, unpaid leave and totals |
| `leave_requests` | Leave applications and decisions | User reference, leave type, dates, reason, status, admin comment, applied timestamp |

The tables are related by user identifiers and foreign-key relationships. The `users` email is unique. Password values are stored as hashes.

## 9. Non-Functional Requirements

### 9.1 Security

- Use HTTPS for hosted application traffic.
- Store passwords as bcrypt hashes.
- Use JWT-based authentication for protected API calls.
- Enforce role checks for administrator routes.
- Keep credentials and secrets outside the Git repository.
- Restrict cross-origin browser requests to approved frontend origins.

### 9.2 Performance and availability

- Use a shared database connection pool with limits appropriate to serverless execution.
- Use compressed HTTP responses.
- Provide health/root endpoints for basic availability checks.
- Production availability depends on Vercel and Aiven service availability and plan limits.

### 9.3 Usability and compatibility

- Provide clear employee and administrator workflows.
- Use a responsive layout suitable for desktop, tablet, and mobile browsers.
- Provide status feedback for user actions and form submissions.

### 9.4 Maintainability

- Separate frontend and backend code.
- Keep API routes, controllers, middleware, and database configuration in separate backend modules.
- Document environment variables, setup, API endpoints, and deployment operations.

## 10. System Architecture

The solution uses a browser-based frontend, a REST API backend, and a managed MySQL database.

```text
Employee / Administrator browser
             |
             | HTTPS
             v
React + Vite frontend (Vercel)
             |
             | Axios REST requests
             v
Node.js + Express API (Vercel)
             |
             | mysql2 over TLS
             v
Aiven MySQL (defaultdb)
             |
             +-- users
             +-- leave_balances
             +-- leave_requests
```

### Components

- **Frontend:** React, JavaScript, Vite, Tailwind CSS, Axios, React Router DOM, React Select, React Hot Toast, and React Icons.
- **Backend:** Node.js, Express, mysql2, JWT, bcryptjs, CORS, Helmet, compression, express-rate-limit, and dotenv.
- **Database:** Aiven-managed MySQL.
- **Source control:** Git and GitHub.
- **Hosting:** Vercel for frontend and backend; Aiven for MySQL.

## 11. API Requirements and Route Summary

The API base URL is:

`https://backend-blush-beta-84.vercel.app`

The following route summary reflects the Express route mounts and route declarations in the project. Request body fields and response schemas should be confirmed from the respective controller implementations.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/` | Public | API status message |
| GET | `/health` | Public | Health check |
| POST | `/api/auth/login` | Public | Authenticate a user |
| GET | `/api/leaves/balance/:userId` | Authenticated | Retrieve a user's leave balance |
| GET | `/api/leaves/my-leaves/:userId` | Authenticated | Retrieve a user's leave requests |
| POST | `/api/leaves` | Authenticated | Submit a leave request |
| GET | `/api/leaves/admin/stats` | Administrator | Retrieve admin summary statistics |
| GET | `/api/leaves/admin/all` | Administrator | Retrieve all leave requests |
| PUT | `/api/leaves/admin/:id/approve` | Administrator | Approve a leave request |
| PUT | `/api/leaves/admin/:id/reject` | Administrator | Reject a leave request |

Protected requests use the bearer token in the Authorization header:

`Authorization: Bearer <token>`

## 12. Assumptions, Dependencies, and Constraints

### Assumptions

- Users and their roles are provisioned in the database.
- The database schema is created before the backend is used.
- The frontend is configured with the deployed backend base URL.
- The backend is configured with a valid Aiven MySQL connection and a JWT secret.
- Demo accounts are for assessment/testing and must not be used as real production credentials.

### Dependencies

- Node.js and npm for local development.
- Vercel account and GitHub repository integration for hosting and deployment.
- Aiven MySQL service for persistent hosted database storage.
- Valid database hostname, port, username, password, and TLS configuration.

### Constraints

- The deployed backend depends on correct Vercel environment-variable configuration.
- The deployed application depends on network access from Vercel to Aiven.
- Free/trial hosting limits and service lifecycle may affect long-term availability.
- Leave policies may differ by organization and must be validated before operational adoption.

## 13. Deployment

### 13.1 Hosting locations

| Component | Hosting platform | Deployed resource |
|---|---|---|
| Frontend | Vercel | https://employee-leave-management-floyd.vercel.app |
| Backend API | Vercel | https://backend-blush-beta-84.vercel.app |
| MySQL database | Aiven | MySQL service `leave-management-db`, database `defaultdb` |
| Source code | GitHub | https://github.com/Floydsequeira07/employee-leave-management |

### 13.2 Deployment approach

The project is maintained in a GitHub repository with separate `frontend` and `backend` directories. Vercel projects are connected to the repository and use their respective root directories. A push to the configured production branch triggers a deployment. The frontend is built with Vite; the backend is deployed as an Express application/serverless API. Persistent application data is stored in Aiven MySQL.

### 13.3 Required services

- GitHub repository: `Floydsequeira07/employee-leave-management`.
- Vercel frontend project with root directory `frontend`.
- Vercel backend project with root directory `backend`.
- Aiven MySQL service with `defaultdb` and the required schema.
- Vercel environment variables for frontend API URL, backend database connection, frontend CORS origin, and JWT signing secret.

### 13.4 Environment variables

**Frontend (Vercel)**

| Variable | Description | Example / value |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `https://backend-blush-beta-84.vercel.app` |

**Backend (Vercel)**

| Variable | Description | Example / value |
|---|---|---|
| `DB_HOST` | Aiven MySQL hostname | Obtain from Aiven connection information |
| `DB_PORT` | Aiven MySQL port | `12846` |
| `DB_USER` | Database username | `avnadmin` |
| `DB_PASSWORD` | Database password | Set privately in Vercel |
| `DB_NAME` | Database name | `defaultdb` |
| `JWT_SECRET` | Secret used to sign JWTs | Generate and store privately |
| `FRONTEND_URL` | Allowed production frontend origin | `https://employee-leave-management-floyd.vercel.app` |
| `PORT` | Local Express listening port | `5000` (not generally required for Vercel serverless) |

Never commit a real `.env` file or secret value to GitHub. Use a local `.env` file for development and Vercel Environment Variables for hosted deployments.

### 13.5 Database deployment and initialization

1. Create or select the Aiven MySQL service.
2. Connect to it from MySQL Workbench using the Aiven hostname, port, username, password, and SSL settings.
3. Select `defaultdb`.
4. Create the `users`, `leave_balances`, and `leave_requests` tables using the project's schema.
5. Provision demo accounts using the backend's `addUsers.js` script after configuring its local `.env` to use the Aiven connection. Run it only once unless the script is designed to be idempotent.
6. Verify the deployed backend can connect to the Aiven database through Vercel Runtime Logs.

### 13.6 Initial deployment steps

1. Push the project to GitHub.
2. Import the repository into Vercel for the frontend and set Root Directory to `frontend`.
3. Configure the frontend build command as `npm run build` and output directory as `dist`.
4. Deploy the frontend and note its production domain.
5. Import the same repository into Vercel for the backend and set Root Directory to `backend`.
6. Configure the backend environment variables in Vercel.
7. Configure `FRONTEND_URL` to the exact frontend production origin.
8. Create the Aiven schema and provision application users.
9. Set `VITE_API_URL` in the frontend Vercel project to the backend API base URL.
10. Redeploy the frontend after setting `VITE_API_URL`.
11. Test the root endpoint, login, employee operations, and administrator operations.
12. Inspect Vercel Runtime Logs if API or database errors occur.

### 13.7 Updating the application

1. Make and test code changes locally.
2. Commit and push changes to the configured GitHub branch.
3. Confirm the relevant Vercel project starts a new deployment.
4. Check the deployment build logs and wait for the deployment to become Ready.
5. Test the production frontend and relevant API routes.
6. If only environment variables change, save them in the relevant Vercel project and redeploy that project; a GitHub push is not required for an environment-variable-only change.

## 14. Acceptance Criteria

The project is considered to meet its core assessment requirements when:

- The frontend production URL loads successfully.
- The backend root and health endpoints return their expected responses.
- An authorized user can log in with a provisioned account.
- Employees can view their leave information and submit a leave request.
- Employees can view their request history and statuses.
- Administrators can view requests and approve or reject them.
- Role-protected operations reject unauthorized access.
- Data is persisted in the hosted MySQL database.
- The README and BRD explain the setup, architecture, environment configuration, APIs, and deployment sufficiently for another developer to reproduce the deployment.

## 15. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Incorrect database credentials or network configuration | Validate Aiven connection details locally and inspect Vercel Runtime Logs. |
| Secrets accidentally committed to Git | Keep `.env` ignored and store production secrets in Vercel. Rotate any exposed credentials. |
| CORS blocks browser requests | Set the exact frontend production origin in backend configuration and test preflight requests. |
| Missing or inconsistent database schema | Apply and verify schema before using the application. |
| Demo credentials used outside assessment | Replace demo users and passwords before real deployment. |
| Hosting trial or plan limits | Monitor service usage and select an appropriate ongoing plan. |

## 16. Future Enhancements

Potential future improvements include email notifications, configurable leave policies, multi-level approvals, audit logs, calendar integration, exportable reports, SSO/MFA, and automated database backups.

## 17. Conclusion

The Employee Leave Management System provides a centralized web-based workflow for leave applications, balance visibility, and administrator decisions. This BRD records the project requirements and the deployed architecture to support review, development handover, and independent setup and deployment.
