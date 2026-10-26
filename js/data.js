/**
 * Seed data matching Experiments 7, 8, 9, 10 for:
 * Student Deadline & Academic Planner
 * JSPM's RSCOE Pune - CS2308L Design Thinking Lab
 * Student: Arnav Vaidya (CS2351 / SY-C2)
 * Reference Timeline Date: 2026-10-26 (26 Oct 2026)
 */

const SEED_USERS = [
  {
    id: "usr-001",
    rollNo: "CS2351",
    name: "Arnav Vaidya",
    email: "arnav.vaidya@rscoe.edu.in",
    password: "password123",
    role: "student",
    batch: "SY-C2",
    department: "Computer Engineering",
    phone: "+91 98765 43210"
  },
  {
    id: "usr-002",
    rollNo: "FAC-101",
    name: "Prof. Sneha Kulkarni",
    email: "faculty@rscoe.edu.in",
    password: "password123",
    role: "faculty",
    department: "Computer Engineering",
    subjects: ["DBMS", "OS"]
  },
  {
    id: "usr-003",
    rollNo: "ADM-001",
    name: "Dr. A. P. Mane (HOD/Admin)",
    email: "admin@rscoe.edu.in",
    password: "password123",
    role: "admin",
    department: "Computer Engineering"
  }
];

const SEED_SUBJECTS = [
  { code: "DBMS", name: "Database Management Systems", faculty: "Prof. Sneha Kulkarni", color: "#3b82f6" },
  { code: "OS", name: "Operating Systems", faculty: "Prof. Sneha Kulkarni", color: "#ef4444" },
  { code: "CN", name: "Computer Networks", faculty: "Prof. R. V. Patil", color: "#f59e0b" },
  { code: "Maths", name: "Engineering Mathematics III", faculty: "Dr. S. K. Joshi", color: "#8b5cf6" },
  { code: "DT", name: "Design Thinking Lab", faculty: "Prof. M. B. Shinde", color: "#10b981" },
  { code: "Python", name: "Python Programming", faculty: "Prof. A. N. More", color: "#06b6d4" }
];

const SEED_BATCHES = [
  { id: "SY-C1", name: "Second Year - Div C Batch 1", count: 24 },
  { id: "SY-C2", name: "Second Year - Div C Batch 2", count: 23 },
  { id: "SY-C3", name: "Second Year - Div C Batch 3", count: 22 }
];

// Baseline date set to 26 Oct 2026 as per manual
const BASE_DATE_STR = "2026-10-26";

const SEED_TASKS = [
  // 1. CN Lab Record - OVERDUE (due 25 Oct 2026)
  {
    id: "task-001",
    title: "CN Lab Record",
    subject: "CN",
    type: "Lab Record",
    dueDate: "2026-10-25",
    dueTime: "17:00",
    priority: "High",
    status: "Overdue",
    description: "Submit completed write-up and wireshark packet capture analysis for Experiment 4.",
    isFacultyPosted: false,
    batch: "SY-C2",
    createdAt: "2026-10-18T10:00:00"
  },
  // 2. OS Unit Test - High Priority due tomorrow 27 Oct 2026
  {
    id: "task-002",
    title: "OS Unit Test",
    subject: "OS",
    type: "Exam",
    dueDate: "2026-10-27",
    dueTime: "10:00",
    priority: "High",
    status: "Not started",
    description: "Unit Test covering Process Scheduling, Deadlocks, and Semaphores in Room 304.",
    isFacultyPosted: true,
    batch: "SY-C2",
    createdAt: "2026-10-15T09:30:00"
  },
  // 3. DBMS Assignment 3 - High Priority due 29 Oct 2026
  {
    id: "task-003",
    title: "DBMS Assignment 3",
    subject: "DBMS",
    type: "Assignment",
    dueDate: "2026-10-29",
    dueTime: "23:59",
    priority: "High",
    status: "In progress",
    description: "Solve SQL normalization questions (3NF & BCNF) with ER-to-relational schema mapping.",
    isFacultyPosted: true,
    batch: "SY-C2",
    createdAt: "2026-10-20T11:00:00"
  },
  // 4. Maths Quiz prep - Medium Priority due 30 Oct 2026
  {
    id: "task-004",
    title: "Maths Quiz prep",
    subject: "Maths",
    type: "Exam",
    dueDate: "2026-10-30",
    dueTime: "14:00",
    priority: "Medium",
    status: "Not started",
    description: "Online Moodle Quiz on Fourier Transforms and Vector Calculus.",
    isFacultyPosted: false,
    batch: "SY-C2",
    createdAt: "2026-10-22T14:15:00"
  },
  // 5. Seminar slides - Medium Priority due 2 Nov 2026
  {
    id: "task-005",
    title: "Seminar slides",
    subject: "DT",
    type: "Activity",
    dueDate: "2026-11-02",
    dueTime: "23:59",
    priority: "Medium",
    status: "Not started",
    description: "Prepare presentation deck for Experiment 10 prototype demonstration and deployment strategy.",
    isFacultyPosted: false,
    batch: "SY-C2",
    createdAt: "2026-10-24T16:00:00"
  },
  // 6. Python Mini Project - Low Priority due 5 Nov 2026 (Completed)
  {
    id: "task-006",
    title: "Python Mini Project",
    subject: "Python",
    type: "Project",
    dueDate: "2026-11-05",
    dueTime: "23:59",
    priority: "Low",
    status: "Completed",
    description: "GUI Tkinter/Flask project for library seat reservation system.",
    isFacultyPosted: false,
    batch: "SY-C2",
    createdAt: "2026-10-10T12:00:00"
  },
  // 7. Additional completed tasks to reach exactly 12 completed of 21 total tasks (57%) as shown in Screen 2:
  {
    id: "task-007",
    title: "DBMS Assignment 1 - SQL Queries",
    subject: "DBMS",
    type: "Assignment",
    dueDate: "2026-10-05",
    dueTime: "23:59",
    priority: "Medium",
    status: "Completed",
    description: "DDL & DML scripts executed on PostgreSQL.",
    isFacultyPosted: true,
    batch: "SY-C2"
  },
  {
    id: "task-008",
    title: "DBMS Assignment 2 - Joins & Views",
    subject: "DBMS",
    type: "Assignment",
    dueDate: "2026-10-14",
    dueTime: "23:59",
    priority: "High",
    status: "Completed",
    description: "Complex join queries, indexes and materialized views.",
    isFacultyPosted: true,
    batch: "SY-C2"
  },
  {
    id: "task-009",
    title: "OS Lab Exp 1 - Linux Commands",
    subject: "OS",
    type: "Lab Record",
    dueDate: "2026-09-30",
    dueTime: "17:00",
    priority: "Low",
    status: "Completed",
    description: "Basic shell scripting and process management tools.",
    isFacultyPosted: false,
    batch: "SY-C2"
  },
  {
    id: "task-010",
    title: "OS Lab Exp 2 - Shell Scripting",
    subject: "OS",
    type: "Lab Record",
    dueDate: "2026-10-08",
    dueTime: "17:00",
    priority: "Medium",
    status: "Completed",
    description: "Bash scripts for automated backup and text processing.",
    isFacultyPosted: false,
    batch: "SY-C2"
  },
  {
    id: "task-011",
    title: "OS Lab Exp 3 - CPU Scheduling",
    subject: "OS",
    type: "Lab Record",
    dueDate: "2026-10-16",
    dueTime: "17:00",
    priority: "High",
    status: "Completed",
    description: "FCFS, SJF, Round Robin simulation in C++.",
    isFacultyPosted: false,
    batch: "SY-C2"
  },
  {
    id: "task-012",
    title: "CN Exp 1 - Cable Crimping & Network Setup",
    subject: "CN",
    type: "Lab Record",
    dueDate: "2026-09-28",
    dueTime: "17:00",
    priority: "Low",
    status: "Completed",
    description: "RJ-45 CAT-6 connector crimping and peer-to-peer setup.",
    isFacultyPosted: false,
    batch: "SY-C2"
  },
  {
    id: "task-013",
    title: "CN Exp 2 - IP Subnetting Exercise",
    subject: "CN",
    type: "Lab Record",
    dueDate: "2026-10-07",
    dueTime: "17:00",
    priority: "Medium",
    status: "Completed",
    description: "Classless Inter-Domain Routing (CIDR) and VLSM sheet.",
    isFacultyPosted: false,
    batch: "SY-C2"
  },
  {
    id: "task-014",
    title: "CN Exp 3 - Socket Programming in C",
    subject: "CN",
    type: "Lab Record",
    dueDate: "2026-10-15",
    dueTime: "17:00",
    priority: "High",
    status: "Completed",
    description: "TCP echo client and server with multi-client handling.",
    isFacultyPosted: false,
    batch: "SY-C2"
  },
  {
    id: "task-015",
    title: "Maths Tutorial 1 - First Order DE",
    subject: "Maths",
    type: "Assignment",
    dueDate: "2026-10-02",
    dueTime: "12:00",
    priority: "Medium",
    status: "Completed",
    description: "Solved worksheet for differential equations.",
    isFacultyPosted: false,
    batch: "SY-C2"
  },
  {
    id: "task-016",
    title: "Maths Tutorial 2 - Linear Differential Eq",
    subject: "Maths",
    type: "Assignment",
    dueDate: "2026-10-12",
    dueTime: "12:00",
    priority: "Medium",
    status: "Completed",
    description: "Complementary function and particular integrals.",
    isFacultyPosted: false,
    batch: "SY-C2"
  },
  {
    id: "task-017",
    title: "DT Exp 7 - Use Case & User Story Doc",
    subject: "DT",
    type: "Activity",
    dueDate: "2026-10-10",
    dueTime: "17:00",
    priority: "High",
    status: "Completed",
    description: "Use case diagram, 13 use cases, and 11 user stories.",
    isFacultyPosted: false,
    batch: "SY-C2"
  },
  {
    id: "task-018",
    title: "DT Exp 8 - UI/UX Mock-up Design",
    subject: "DT",
    type: "Activity",
    dueDate: "2026-10-19",
    dueTime: "17:00",
    priority: "High",
    status: "Completed",
    description: "6 mockups, navigation flow, and prototype hotspot mapping.",
    isFacultyPosted: false,
    batch: "SY-C2"
  },
  // Pending tasks to make total = 21 (12 Done + 1 Overdue + 8 Pending/In-Progress):
  {
    id: "task-019",
    title: "DBMS Mini Project Schema Design",
    subject: "DBMS",
    type: "Project",
    dueDate: "2026-11-08",
    dueTime: "23:59",
    priority: "Medium",
    status: "Not started",
    description: "Drafting schema and integrity constraints for course portal.",
    isFacultyPosted: true,
    batch: "SY-C2"
  },
  {
    id: "task-020",
    title: "Python File Handling Lab Write-up",
    subject: "Python",
    type: "Lab Record",
    dueDate: "2026-11-10",
    dueTime: "17:00",
    priority: "Low",
    status: "Not started",
    description: "CSV and JSON data pipeline scripts with exception handling.",
    isFacultyPosted: false,
    batch: "SY-C2"
  },
  {
    id: "task-021",
    title: "Design Thinking Final Report Submission",
    subject: "DT",
    type: "Project",
    dueDate: "2026-11-15",
    dueTime: "23:59",
    priority: "High",
    status: "Not started",
    description: "Compilation of Experiment 1 to 10 for University External Viva.",
    isFacultyPosted: false,
    batch: "SY-C2"
  }
];

const SEED_ALERTS = [
  {
    id: "alt-001",
    taskId: "task-002",
    title: "OS Unit Test - due tomorrow",
    subtitle: "Tue 27 Oct, 10:00 AM | Priority: High",
    subject: "OS",
    isOverdue: false,
    level: "urgent", // High/urgent
    scheduledFor: "2026-10-26T08:00:00",
    isSnoozed: false,
    snoozedUntil: null,
    isDismissed: false
  },
  {
    id: "alt-002",
    taskId: "task-003",
    title: "DBMS Assignment 3 - 3 days left",
    subtitle: "Thu 29 Oct, 11:59 PM | Priority: High",
    subject: "DBMS",
    isOverdue: false,
    level: "warning", // Medium/warning
    scheduledFor: "2026-10-26T09:00:00",
    isSnoozed: false,
    snoozedUntil: null,
    isDismissed: false
  },
  {
    id: "alt-003",
    taskId: "task-001",
    title: "CN Lab Record - OVERDUE",
    subtitle: "Was due Sun 25 Oct | Priority raised to High",
    subject: "CN",
    isOverdue: true,
    level: "danger", // Critical overdue
    scheduledFor: "2026-10-26T00:00:00",
    isSnoozed: false,
    snoozedUntil: null,
    isDismissed: false
  }
];

// Export to window or module
if (typeof window !== "undefined") {
  window.APP_SEED = {
    USERS: SEED_USERS,
    SUBJECTS: SEED_SUBJECTS,
    BATCHES: SEED_BATCHES,
    TASKS: SEED_TASKS,
    ALERTS: SEED_ALERTS,
    BASE_DATE: BASE_DATE_STR
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    SEED_USERS,
    SEED_SUBJECTS,
    SEED_BATCHES,
    SEED_TASKS,
    SEED_ALERTS,
    BASE_DATE_STR
  };
}
