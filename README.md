# Leave Management System

A full-stack Leave Management System developed as part of the Full Stack Developer selection task for **Exelon Circuits Pvt. Ltd.**

The application provides separate workflows for employees and administrators to manage leave requests, approvals, leave history, and leave balances.

The application is designed to be **responsive** and works across desktop, tablet, and mobile screen sizes.

---

## 1. Project Overview

The Leave Management System allows employees to:

- Log in securely
- View their leave balance
- Apply for leave
- View their leave history
- Track the status of leave requests
- View approved, rejected, and pending leave requests
- Track paid leave and Loss of Pay (LOP)

Administrators can:

- Log in through the Admin role
- View the admin dashboard
- View employee leave requests
- View employee leave balances
- Approve leave requests
- Reject leave requests
- View overall leave statistics

The system uses:

- React.js for the frontend
- JavaScript for application development
- Node.js and Express.js for the backend
- MySQL for the database
- Tailwind CSS for responsive UI styling

---

## 2. Features

### Employee Features

- Employee login
- Role-based login
- Employee dashboard
- View Casual Leave balance
- View Sick Leave balance
- View Earned Leave balance
- View LOP (Loss of Pay)
- Apply for leave
- Select leave type
- Select start and end dates
- Enter leave reason
- View leave history
- View leave request status
- Responsive user interface
- Automatic refresh of leave status and balance

### Admin Features

- Admin login
- Admin dashboard
- View total number of employees
- View pending leave requests
- View approved leave requests
- View rejected leave requests
- View all employee leave requests
- View employee leave balances
- Approve leave requests
- Reject leave requests
- Confirmation popup before approving/rejecting leave
- Responsive admin interface

### Leave Management

The system supports:

- Casual Leave
- Sick Leave
- Earned Leave
- Unpaid Leave / LOP

When a leave request is approved:

1. The system checks the employee's available paid leave.
2. Available paid leave is deducted from the corresponding leave balance.
3. If the requested number of days exceeds the available paid leave, the remaining days are counted as LOP.
4. Pending requests do not reduce the leave balance.
5. Rejected requests do not reduce the leave balance.
6. Leave balances never become negative.

---

## 3. Responsive Design

The application has been designed to be responsive across:

- Desktop
- Laptop
- Tablet
- Mobile devices

Tailwind CSS responsive utility classes are used to adapt:

- Navigation
- Dashboard cards
- Forms
- Tables
- Leave request sections
- Buttons
- Layouts
- Admin dashboard
- Employee dashboard

The application is intended to provide a consistent user experience across different screen sizes.

---

## 4. Technology Stack

### Frontend

- React.js
- JavaScript
- Vite
- Tailwind CSS
- Axios
- React Router DOM
- React Select
- React Hot Toast
- React Icons

### Backend

- Node.js
- Express.js
- MySQL2
- JWT
- bcryptjs
- CORS
- dotenv

### Database

- MySQL

### Development Tools

- Visual Studio Code
- Git
- GitHub
- Postman
- npm

### Deployment

- Frontend: Vercel
- Backend: Vercel
- Database: MySQL

---

## 5. Clone the Project

Clone the GitHub repository using:

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Navigate into the project folder:

```bash
cd Leave_Management_System
```

The project contains two main applications:

```text
frontend/
backend/
```

The frontend and backend need to be run separately during local development.

---

## 6. Prerequisites

Before running the project, make sure the following are installed:

- Node.js
- npm
- MySQL
- Git

You can check the installed versions using:

```bash
node --version
npm --version
git --version
```

Make sure MySQL is running before starting the backend.

---

## 7. Database Setup

The application uses MySQL as its database.

### Database Name

```sql
CREATE DATABASE leave_management_exelon;

USE leave_management_exelon;
```

### Database Tables

The database contains the following tables:

**1. users**

Stores admin and employee login details, including name, email, hashed password, and role.

**2. leave_balances**

Stores employee leave balances, including:

- Casual Leave (12 days)
- Sick Leave (10 days)
- Earned Leave (15 days)
- Unpaid Leave (LOP)

It also stores the total allowed and remaining leave balances.

**3. leave_requests**

Stores employee leave applications, including:

- Leave type
- Start date
- End date
- Reason
- Request status
- Admin comments
- Application date

Create the database and tables by executing the SQL queries in MySQL Workbench.

Make sure all required columns and foreign key relationships are created before running the backend.

### Demo User Setup

The project includes an `addUsers.js` script inside the backend folder to insert demo admin and employee accounts.

Run the following command from the backend directory:

```bash
node addUsers.js
```

This creates one admin account and two employee accounts with their initial leave balances.

---

## 8. Backend Setup

The backend is located inside:

```text
backend/
```

Open a terminal from the project root.

Navigate to the backend:

```bash
cd backend
```

Install the backend dependencies:

```bash
npm install
```

Create a `.env` file inside the backend folder:

```text
backend/.env
```

Add the following configuration:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=leave_management_exelon

JWT_SECRET=YOUR_JWT_SECRET
```

Replace `YOUR_MYSQL_PASSWORD` with your local MySQL password and configure a secure JWT secret.

Make sure the `.env` file is not uploaded to GitHub.

### Start the Backend

Run:

```bash
npm run dev
```

The backend will run on:

```text
http://localhost:5000
```

The main backend entry file is:

```text
backend/server.js
```

You can verify that the backend is running by opening:

```text
http://localhost:5000/
```

Expected response:

```json
{
  "message": "Leave Management API is running"
}
```

---

## 9. Frontend Setup

The frontend is located inside:

```text
frontend/
```

Open a new terminal while keeping the backend terminal running.

From the project root, run:

```bash
cd frontend
```

Install the frontend dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Vite will display a local URL, normally:

```text
http://localhost:5173
```

Open that URL in your browser.

The main frontend files are:

```text
frontend/src/main.jsx
frontend/src/App.jsx
```

---

## 10. Running Frontend and Backend Together

The frontend and backend must be running at the same time.

You need two terminals.

### Terminal 1 - Backend

From the project root:

```bash
cd backend
npm install
npm run dev
```

Backend:

```text
http://localhost:5000
```

### Terminal 2 - Frontend

Open another terminal and from the project root run:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

Then open the frontend URL in your browser:

```text
http://localhost:5173
```

The frontend communicates with the backend through REST APIs.

---

## 11. Demo Login Credentials

The project contains two employee accounts and one admin account for testing.

### Admin

- Name: Admin
- Email: admin@gmail.com
- Password: admin123
- Role: Admin

### Employee 1

- Name: Employee 1
- Email: emp1@gmail.com
- Password: employee123
- Role: Employee

### Employee 2

- Name: Employee 2
- Email: emp2@gmail.com
- Password: employee123
- Role: Employee

### Login Instructions

1. Open the application.
2. Select the required role.
3. Enter the email.
4. Enter the password.
5. Click Login.

Example Admin login:

```text
Role: Admin
Email: admin@gmail.com
Password: admin123
```

Example Employee login:

```text
Role: Employee
Email: emp1@gmail.com
Password: employee123
```

