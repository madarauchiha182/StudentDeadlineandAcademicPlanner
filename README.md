# Student Deadline & Academic Planner (CS2308L Design Thinking Lab)

**JSPM's Rajarshi Shahu College of Engineering, Tathwade Pune-33**  
**Department of Computer Engineering**  
**Course**: CS2308L - Design Thinking Lab  
**Student**: Arnav Vaidya (Roll No. CS2351 / Class SY-C2)  
**Experiments**: Experiment No. 7, 8, 9 & 10  

---

## 🌟 Overview

The **Student Deadline & Academic Planner** is a high-fidelity working software model, interactive prototype, and formal architectural specification designed to solve the critical student problem of missed assignment deadlines, examination schedule conflicts, and fragmented notices across WhatsApp and LMS portals.

### Implemented Enhancements (Experiment 10)
- **E1: Snooze on Alert Cards**: Allows students to postpone reminders (1 hour, 3 hours, or tomorrow morning) with automatic re-alert timers (`TC09`, `TC15`).
- **E2: Accessible H / M / L Priority Markers**: Embedded high-contrast letter badges (`H`, `M`, `L`, `!`) inside enlarged calendar cells and task lists, ensuring accessibility without relying solely on color (`TC12`).
- **E3: Overdue Banner on Dashboard**: High-visibility crimson warning banner directly flagging overdue tasks (e.g., `CN Lab Record`), explaining the deadline lapse and providing a 1-click `Resolve Now` action (`TC14`).

---

## 🚀 How to Run the Application

### Option 1: Open Directly in Any Browser
Simply double-click or open [index.html](file:///c:/Users/drsum/Desktop/DTI/index.html) in Google Chrome, Microsoft Edge, Firefox, or Safari. It works with zero external build dependencies.

### Option 2: Run via Node.js Local Server
Run in PowerShell / Terminal:
```bash
node server.js
```
The server will start at `http://localhost:3001` (or fallback if port is occupied).

---

## 🧪 Automated Verification & Test Suite (15/15 Tests Passing)

To run the verification test suite in terminal:
```bash
node run-tests-cli.js
```

Inside the browser application:
1. Navigate to the **"15/15 Test Runner"** tab in the sidebar.
2. Click **"Run All 15 Test Cases"** to watch the real-time assertion check and validation table.

---

## 📐 Models & Documentation Directory

- **Architecture & System Models**: [docs/ARCHITECTURE_AND_MODELS.md](file:///c:/Users/drsum/Desktop/DTI/docs/ARCHITECTURE_AND_MODELS.md)
  - UML Conceptual Class Diagram
  - PostgreSQL Relational Database Schema & DDL
  - State Machine & Workflow Decision Points (`DP1` to `DP4`, `X1` to `X5`, `A1` to `A4`)
  - Requirement Traceability Matrix (`FR01`-`FR14`, `UC01`-`UC13`, `US01`-`US11`, `TC01`-`TC15`)
  - Deployment Architecture & Feasibility Analysis
- **Core Application**: [index.html](file:///c:/Users/drsum/Desktop/DTI/index.html)
- **Styling & Tokens**: [css/styles.css](file:///c:/Users/drsum/Desktop/DTI/css/styles.css)
- **Business Logic & Decision Points Engine**: [js/models.js](file:///c:/Users/drsum/Desktop/DTI/js/models.js)
- **Seed Data**: [js/data.js](file:///c:/Users/drsum/Desktop/DTI/js/data.js)
- **Test Suite Engine**: [js/tests.js](file:///c:/Users/drsum/Desktop/DTI/js/tests.js)
