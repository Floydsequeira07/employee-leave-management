const bcrypt = require("bcryptjs");
const db = require("./config/db");

const addUsers = async () => {
  try {
    // Hash passwords
    const adminPassword = await bcrypt.hash("admin123", 10);
    const employeePassword = await bcrypt.hash("employee123", 10);

    // Admin
    await db.query(
      `INSERT INTO users (name, email, password, role)
       VALUES (?, ?, ?, ?)`,
      ["Admin", "admin@gmail.com", adminPassword, "admin"]
    );

    // Employee 1
    const [employee1] = await db.query(
      `INSERT INTO users (name, email, password, role)
       VALUES (?, ?, ?, ?)`,
      ["Employee 1", "emp1@gmail.com", employeePassword, "employee"]
    );

    // Employee 2
    const [employee2] = await db.query(
      `INSERT INTO users (name, email, password, role)
       VALUES (?, ?, ?, ?)`,
      ["Employee 2", "emp2@gmail.com", employeePassword, "employee"]
    );

    // Leave balance for Employee 1
    await db.query(
      `INSERT INTO leave_balances
       (user_id, casual_total, casual_leave,
        sick_total, sick_leave,
        earned_total, earned_leave, unpaid_leave)
       VALUES (?, 12, 12, 10, 10, 15, 15, 0)`,
      [employee1.insertId]
    );

    // Leave balance for Employee 2
    await db.query(
      `INSERT INTO leave_balances
       (user_id, casual_total, casual_leave,
        sick_total, sick_leave,
        earned_total, earned_leave, unpaid_leave)
       VALUES (?, 12, 12, 10, 10, 15, 15, 0)`,
      [employee2.insertId]
    );

    console.log("1 Admin and 2 Employees added successfully!");

    console.log("Admin: admin@gmail.com / admin123");
    console.log("Employee 1: emp1@gmail.com / employee123");
    console.log("Employee 2: emp2@gmail.com / employee123");

  } catch (error) {
    console.error("Error adding users:", error);
  } finally {
    await db.end();
  }
};

addUsers();