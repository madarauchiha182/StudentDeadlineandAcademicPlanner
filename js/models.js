/**
 * Domain Models, Business Rules, and Decision Points Engine
 * Based on CS2308L Design Thinking Lab (Exp 7-10)
 * Student Deadline & Academic Planner
 */

class StorageService {
  constructor() {
    this.prefix = "sdap_";
  }

  load(key, fallback) {
    try {
      const data = localStorage.getItem(this.prefix + key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.warn("Storage load error:", e);
      return fallback;
    }
  }

  save(key, value) {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch (e) {
      console.warn("Storage save error:", e);
    }
  }

  clearAll() {
    try {
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith(this.prefix)) localStorage.removeItem(k);
      });
    } catch (e) {
      console.warn("Storage clear error:", e);
    }
  }
}

class AcademicPlannerModel {
  constructor() {
    this.storage = new StorageService();
    this.baseDate = new Date("2026-10-26T09:00:00"); // Simulation anchor: 26 Oct 2026
    this.loginAttempts = 0;
    this.lockedUntil = null;
    this.init();
  }

  init() {
    // Load persisted state or bootstrap with seeds
    const seed = window.APP_SEED || {};
    this.users = this.storage.load("users", seed.USERS || []);
    this.subjects = this.storage.load("subjects", seed.SUBJECTS || []);
    this.batches = this.storage.load("batches", seed.BATCHES || []);
    this.tasks = this.storage.load("tasks", seed.TASKS || []);
    this.alerts = this.storage.load("alerts", seed.ALERTS || []);
    this.currentUser = this.storage.load("currentUser", this.users[0]); // Default to student Arnav Vaidya
    this.emailAlertsEnabled = this.storage.load("emailAlertsEnabled", true);

    // Initial check for overdue tasks
    this.evaluateOverdueTasks();

    // Ensure state is written to storage
    this.saveListeners = [];
    this.persist();
  }

  onSave(listener) {
    if (typeof listener === "function") {
      this.saveListeners.push(listener);
    }
  }

  resetToDefault() {
    this.storage.clearAll();
    const seed = window.APP_SEED || {};
    this.users = JSON.parse(JSON.stringify(seed.USERS || []));
    this.subjects = JSON.parse(JSON.stringify(seed.SUBJECTS || []));
    this.batches = JSON.parse(JSON.stringify(seed.BATCHES || []));
    this.tasks = JSON.parse(JSON.stringify(seed.TASKS || []));
    this.alerts = JSON.parse(JSON.stringify(seed.ALERTS || []));
    this.currentUser = this.users[0];
    this.emailAlertsEnabled = true;
    this.loginAttempts = 0;
    this.lockedUntil = null;
    this.persist();
  }

  persist() {
    this.storage.save("users", this.users);
    this.storage.save("subjects", this.subjects);
    this.storage.save("batches", this.batches);
    this.storage.save("tasks", this.tasks);
    this.storage.save("alerts", this.alerts);
    this.storage.save("currentUser", this.currentUser);
    this.storage.save("emailAlertsEnabled", this.emailAlertsEnabled);

    const now = new Date();
    this.lastSaved = now.toLocaleTimeString();

    if (this.saveListeners && this.saveListeners.length > 0) {
      this.saveListeners.forEach(fn => {
        try { fn(this.lastSaved); } catch (e) { console.warn("Save listener err:", e); }
      });
    }
  }

  // --- DECISION POINT 1 (DP1): Authentication & Account Lockout ---
  authenticate(identifier, password, selectedRole) {
    // Check account lockout (Exception X1 / E2)
    if (this.lockedUntil && new Date() < new Date(this.lockedUntil)) {
      const remainingMinutes = Math.ceil((new Date(this.lockedUntil) - new Date()) / 60000);
      return {
        success: false,
        locked: true,
        message: `Account is locked due to 5 consecutive failed attempts. Please retry in ${remainingMinutes} minute(s).`
      };
    }

    const cleanId = (identifier || "").trim().toLowerCase();
    const cleanPass = (password || "").trim();

    const user = this.users.find(u => 
      (u.rollNo.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId) &&
      u.role === selectedRole
    );

    if (!user || user.password !== cleanPass) {
      this.loginAttempts++;
      if (this.loginAttempts >= 5) {
        this.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lock
        return {
          success: false,
          locked: true,
          message: "Account locked! 5 failed attempts reached. Locked for 15 minutes as per security policy (FR01 / NFR03)."
        };
      }
      return {
        success: false,
        locked: false,
        message: `Incorrect Roll No / Email or password. Attempt ${this.loginAttempts} of 5.`
      };
    }

    // Success: Reset lock counter
    this.loginAttempts = 0;
    this.lockedUntil = null;
    this.currentUser = user;
    this.persist();
    return {
      success: true,
      user: this.currentUser,
      message: `Welcome back, ${user.name} (${user.role.toUpperCase()})!`
    };
  }

  logout() {
    this.currentUser = null;
    this.storage.save("currentUser", null);
  }

  // --- DECISION POINT 2 (DP2): Validate Task Details & Past Date Check ---
  validateTaskInput(taskData) {
    const errors = [];
    const warnings = [];

    if (!taskData.title || !taskData.title.trim()) {
      errors.push({ field: "title", message: "Task title is mandatory (FR02 / US02)." });
    }
    if (!taskData.subject || !taskData.subject.trim()) {
      errors.push({ field: "subject", message: "Subject selection is mandatory (FR02 / US02)." });
    }
    if (!taskData.dueDate) {
      errors.push({ field: "dueDate", message: "Due date is mandatory (FR02 / US02)." });
    } else {
      // Check if due date is in past compared to current timeline (26 Oct 2026)
      const due = new Date(taskData.dueDate + "T" + (taskData.dueTime || "23:59:00"));
      if (due < this.baseDate) {
        warnings.push({
          field: "dueDate",
          code: "PAST_DATE_WARNING",
          message: "Due date is in the past! Continue to save as overdue task?"
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // --- Priority Suggestion Formula (FR04 / US03 / A2) ---
  suggestPriority(dueDateStr, dueTimeStr = "23:59") {
    if (!dueDateStr) return "Medium";
    const due = new Date(dueDateStr + "T" + dueTimeStr);
    const diffHours = (due - this.baseDate) / (1000 * 60 * 60);

    if (diffHours <= 48) {
      return "High"; // Within 48 hours -> High priority
    } else if (diffHours <= 120) { // 2 to 5 days
      return "Medium";
    } else {
      return "Low"; // > 5 days
    }
  }

  // --- Task Operations (UC02, UC03, UC04) ---
  addTask(taskData, forceConfirmPastDate = false) {
    const validation = this.validateTaskInput(taskData);
    if (!validation.isValid) {
      return { success: false, validation };
    }

    if (validation.warnings.length > 0 && !forceConfirmPastDate) {
      return { success: false, requiresConfirmation: true, warnings: validation.warnings };
    }

    // Auto-suggest priority if not provided
    const priority = taskData.priority || this.suggestPriority(taskData.dueDate, taskData.dueTime);

    // Initial status: if in past and not finished, mark Overdue
    const due = new Date(taskData.dueDate + "T" + (taskData.dueTime || "23:59:00"));
    let status = taskData.status || "Not started";
    if (due < this.baseDate && status !== "Completed") {
      status = "Overdue";
    }

    const newTask = {
      id: "task-" + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
      title: taskData.title.trim(),
      subject: taskData.subject,
      type: taskData.type || "Assignment",
      dueDate: taskData.dueDate,
      dueTime: taskData.dueTime || "23:59",
      priority: priority,
      status: status,
      description: taskData.description || "",
      isFacultyPosted: !!taskData.isFacultyPosted,
      batch: taskData.batch || (this.currentUser ? this.currentUser.batch : "SY-C2"),
      createdAt: new Date().toISOString()
    };

    this.tasks.unshift(newTask);

    // Update alert schedule (DP3: Is deadline within 48h?)
    this.scheduleAlertForTask(newTask);

    this.persist();
    return { success: true, task: newTask };
  }

  updateTask(taskId, updates) {
    const idx = this.tasks.findIndex(t => t.id === taskId);
    if (idx === -1) return { success: false, message: "Task not found." };

    const oldTask = this.tasks[idx];
    const updated = { ...oldTask, ...updates };

    // DP4 check
    if (updates.status === "Completed") {
      updated.completedAt = new Date().toISOString();
      // Dismiss active alerts for this task
      this.alerts = this.alerts.filter(a => a.taskId !== taskId);
    } else if (updates.status && updates.status !== "Completed") {
      const due = new Date(updated.dueDate + "T" + (updated.dueTime || "23:59:00"));
      if (due < this.baseDate) {
        updated.status = "Overdue";
        updated.priority = "High"; // FR13 raise priority
      }
    }

    this.tasks[idx] = updated;
    this.persist();
    return { success: true, task: updated };
  }

  deleteTask(taskId) {
    this.tasks = this.tasks.filter(t => t.id !== taskId);
    this.alerts = this.alerts.filter(a => a.taskId !== taskId);
    this.persist();
    return { success: true };
  }

  // --- DECISION POINT 3 & 4: Alert Scheduling & Overdue Flagging (FR06, FR13) ---
  scheduleAlertForTask(task) {
    if (task.status === "Completed") return;

    const due = new Date(task.dueDate + "T" + task.dueTime);
    const diffHours = (due - this.baseDate) / (1000 * 60 * 60);

    let title = "";
    let level = "info";
    let isOverdue = false;

    if (diffHours < 0) {
      // Overdue
      title = `${task.title} - OVERDUE`;
      level = "danger";
      isOverdue = true;
    } else if (diffHours <= 24) {
      title = `${task.title} - due tomorrow`;
      level = "urgent";
    } else if (diffHours <= 72) {
      const days = Math.round(diffHours / 24);
      title = `${task.title} - ${days} days left`;
      level = "warning";
    } else {
      return; // No immediate alert required
    }

    // Check if alert already exists
    const existing = this.alerts.find(a => a.taskId === task.id);
    if (existing) {
      existing.title = title;
      existing.level = level;
      existing.isOverdue = isOverdue;
      existing.subtitle = `${task.dueDate}, ${task.dueTime} | Priority: ${task.priority}`;
    } else {
      this.alerts.unshift({
        id: "alt-" + Date.now().toString(36),
        taskId: task.id,
        title: title,
        subtitle: `${task.dueDate}, ${task.dueTime} | Priority: ${task.priority}`,
        subject: task.subject,
        isOverdue: isOverdue,
        level: level,
        isSnoozed: false,
        snoozedUntil: null,
        isDismissed: false
      });
    }
  }

  evaluateOverdueTasks() {
    this.tasks.forEach(t => {
      if (t.status !== "Completed") {
        const due = new Date(t.dueDate + "T" + (t.dueTime || "23:59:00"));
        if (due < this.baseDate) {
          t.status = "Overdue";
          t.priority = "High"; // FR13 raise priority
        }
      }
    });
  }

  // --- SNOOZE & DISMISS ALERTS (Enhancement E1, TC09, TC15) ---
  snoozeAlert(alertId, durationHours = 1) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) return { success: false, message: "Alert not found" };

    const unSnoozeTime = new Date(Date.now() + durationHours * 3600 * 1000);
    alert.isSnoozed = true;
    alert.snoozedUntil = unSnoozeTime.toISOString();
    alert.snoozeLabel = durationHours === 24 ? "Tomorrow" : `${durationHours} hour(s)`;

    this.persist();
    return { success: true, alert, unSnoozeTime };
  }

  dismissAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.isDismissed = true;
      this.alerts = this.alerts.filter(a => a.id !== alertId);
      this.persist();
      return { success: true };
    }
    return { success: false };
  }

  // --- PROGRESS & DASHBOARD STATS (FR08, UC08, TC08) ---
  getDashboardStats() {
    const total = this.tasks.length;
    const completed = this.tasks.filter(t => t.status === "Completed").length;
    const pending = this.tasks.filter(t => t.status === "Not started").length;
    const inProgress = this.tasks.filter(t => t.status === "In progress").length;
    const overdue = this.tasks.filter(t => t.status === "Overdue").length;

    // Overdue banner task (Enhancement E3, TC14)
    const overdueTask = this.tasks.find(t => t.status === "Overdue");

    // Due soon tasks (within next 4 days)
    const dueSoonTasks = this.tasks.filter(t => {
      if (t.status === "Completed") return false;
      const due = new Date(t.dueDate + "T" + t.dueTime);
      const diffHours = (due - this.baseDate) / (1000 * 60 * 60);
      return diffHours >= 0 && diffHours <= 96;
    });

    const completionPct = total === 0 ? 0 : Math.round((completed / total) * 100);

    return {
      total,
      completed,
      pending,
      inProgress,
      overdue,
      dueSoonCount: dueSoonTasks.length,
      completionPct,
      overdueTask
    };
  }

  // --- UPCOMING DEADLINES SORTED BY DATE (FR08, US07) ---
  getUpcomingDeadlines(limit = 6) {
    return this.tasks
      .filter(t => t.status !== "Completed")
      .sort((a, b) => new Date(a.dueDate + "T" + a.dueTime) - new Date(b.dueDate + "T" + b.dueTime))
      .slice(0, limit);
  }

  // --- FACULTY BROADCAST POSTING (FR10 / UC11 / US09) ---
  postFacultyDeadline(facultyTaskData) {
    const task = {
      ...facultyTaskData,
      isFacultyPosted: true
    };
    const res = this.addTask(task, true);
    return res;
  }

  // --- CLASS REPORTS GENERATION (FR11 / UC12 / US10) ---
  getClassReport(subjectCode = "All", batchId = "SY-C2") {
    let filtered = this.tasks.filter(t => !batchId || t.batch === batchId);
    if (subjectCode !== "All") {
      filtered = filtered.filter(t => t.subject === subjectCode);
    }

    const total = filtered.length;
    const completed = filtered.filter(t => t.status === "Completed").length;
    const overdue = filtered.filter(t => t.status === "Overdue").length;
    const inProgress = filtered.filter(t => t.status === "In progress").length;
    const notStarted = filtered.filter(t => t.status === "Not started").length;
    const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

    return {
      batchId,
      subjectCode,
      total,
      completed,
      overdue,
      inProgress,
      notStarted,
      rate,
      tasks: filtered
    };
  }

  // --- USER MANAGEMENT (Admin Portal UC13 / US11) ---
  addUser(userData) {
    if (!userData.rollNo || !userData.name || !userData.email) {
      return { success: false, message: "Roll No, Name, and Email are required." };
    }

    const cleanRoll = userData.rollNo.trim().toUpperCase();
    if (this.users.some(u => u.rollNo.toUpperCase() === cleanRoll)) {
      return { success: false, message: `User with Roll / ID ${cleanRoll} already exists.` };
    }

    const newUser = {
      id: "usr-" + Date.now().toString(36),
      rollNo: cleanRoll,
      name: userData.name.trim(),
      email: userData.email.trim(),
      password: userData.password || "password123",
      role: userData.role || "student",
      batch: userData.batch || "SY-C2",
      department: userData.department || "Computer Engineering"
    };

    this.users.push(newUser);
    this.persist();
    return { success: true, user: newUser };
  }

  deleteUser(userId) {
    if (this.users.length <= 1) {
      return { success: false, message: "Cannot delete the only existing user." };
    }
    this.users = this.users.filter(u => u.id !== userId);
    this.persist();
    return { success: true };
  }

  // --- BACKUP EXPORT & IMPORT (Data Safety & Portability) ---
  exportBackupJSON() {
    const backupData = {
      version: "1.0",
      institute: "JSPM's RSCOE Pune",
      course: "CS2308L Design Thinking",
      exportedAt: new Date().toISOString(),
      users: this.users,
      subjects: this.subjects,
      batches: this.batches,
      tasks: this.tasks,
      alerts: this.alerts,
      emailAlertsEnabled: this.emailAlertsEnabled
    };
    return JSON.stringify(backupData, null, 2);
  }

  importBackupJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (!Array.isArray(data.tasks) || !Array.isArray(data.users)) {
        return { success: false, message: "Invalid backup format: missing tasks or users array." };
      }

      this.users = data.users;
      this.subjects = data.subjects || this.subjects;
      this.batches = data.batches || this.batches;
      this.tasks = data.tasks;
      this.alerts = data.alerts || [];
      this.emailAlertsEnabled = typeof data.emailAlertsEnabled === "boolean" ? data.emailAlertsEnabled : true;
      this.evaluateOverdueTasks();
      this.persist();

      return { success: true, count: this.tasks.length };
    } catch (e) {
      return { success: false, message: "Failed to parse JSON file: " + e.message };
    }
  }
}

// Attach to window
if (typeof window !== "undefined") {
  window.AcademicPlannerModel = AcademicPlannerModel;
}
