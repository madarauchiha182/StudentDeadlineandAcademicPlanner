/**
 * UI Controller & Application Orchestrator
 * Student Deadline & Academic Planner (CS2308L Design Thinking Lab)
 * Department of Computer Engineering - JSPM's RSCOE Pune
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Model and Test Suite
  const model = new window.AcademicPlannerModel();
  const testRunner = new window.TestSuiteRunner(model);

  // App State
  let currentView = "dashboard";
  let calendarDate = new Date("2026-10-26T00:00:00");
  let selectedCalendarDateStr = "2026-10-27";
  let activeCalendarView = "month"; // month, week, day
  let pendingTaskData = null; // Stored during past-date confirmation
  let activeSnoozeAlertId = null;

  // DOM Elements
  const appRoot = document.getElementById("app-root");
  const loginOverlay = document.getElementById("login-modal");
  const toastContainer = document.getElementById("toast-container");
  const overdueBanner = document.getElementById("overdue-banner-container");
  const demoGuideBar = document.getElementById("demo-guide-bar");

  // Navigation Links
  const navItems = document.querySelectorAll(".nav-item[data-view]");
  const roleSelect = document.getElementById("topbar-role-select");
  const currentUserName = document.getElementById("current-user-name");
  const currentUserRole = document.getElementById("current-user-role");
  const alertNavBadge = document.getElementById("alert-nav-badge");

  // -------------------------------------------------------------
  // Toast Notifications
  // -------------------------------------------------------------
  function showToast(message, type = "info", duration = 3500) {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    let icon = "ℹ️";
    if (type === "success") icon = "✅";
    if (type === "error") icon = "❌";
    if (type === "warning") icon = "⚠️";

    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(20px)";
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // -------------------------------------------------------------
  // View Router
  // -------------------------------------------------------------
  function switchView(viewName) {
    currentView = viewName;

    // Update Sidebar Navigation state
    navItems.forEach(item => {
      if (item.getAttribute("data-view") === viewName) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    // Update Main Tabs
    document.querySelectorAll(".tab-content").forEach(tab => {
      if (tab.id === `view-${viewName}`) {
        tab.classList.add("active");
      } else {
        tab.classList.remove("active");
      }
    });

    const pageTitleMap = {
      dashboard: "Student Dashboard",
      calendar: "Task & Exam Calendar",
      tasks: "My Tasks & Submissions",
      alerts: "Alerts & Notifications",
      faculty: "Faculty Portal - Class Reports",
      admin: "Administrator Portal",
      architecture: "System Models & Architecture",
      tests: "Automated Test Suite (15/15 TC)",
      settings: "Sound & Notification Preferences"
    };
    const titleEl = document.getElementById("current-page-title");
    if (titleEl) titleEl.textContent = pageTitleMap[viewName] || "Academic Planner";

    // Refresh view specific components
    if (viewName === "dashboard") renderDashboard();
    if (viewName === "calendar") renderCalendar();
    if (viewName === "tasks") renderTaskList();
    if (viewName === "alerts") renderAlertsView();
    if (viewName === "faculty") renderFacultyPortal();
    if (viewName === "admin") renderAdminPortal();
    if (viewName === "tests") renderTestRunnerView();
    if (viewName === "settings") renderSettingsView();
  }

  // -------------------------------------------------------------
  // Render Dashboard (Screen 2 / UC08 / US07 & Enhancements)
  // -------------------------------------------------------------
  function renderDashboard() {
    const stats = model.getDashboardStats();

    // 1. Stats Counter Badges
    document.getElementById("stat-pending-num").textContent = stats.pending;
    document.getElementById("stat-duesoon-num").textContent = stats.dueSoonCount;
    document.getElementById("stat-overdue-num").textContent = stats.overdue;
    document.getElementById("stat-done-num").textContent = stats.completed;

    // 2. Dynamic Progress Bar (FR08 / TC08)
    const progressFill = document.getElementById("dashboard-progress-fill");
    const progressPercent = document.getElementById("dashboard-progress-percent");
    const progressSubtitle = document.getElementById("dashboard-progress-subtitle");

    if (progressFill) progressFill.style.width = `${stats.completionPct}%`;
    if (progressPercent) progressPercent.textContent = `${stats.completionPct}%`;
    if (progressSubtitle) {
      progressSubtitle.textContent = `Overall progress: ${stats.completionPct}% complete (${stats.completed} of ${stats.total} tasks)`;
    }

    // 3. ENHANCEMENT E3 & TC14: Overdue Banner
    if (stats.overdueTask) {
      overdueBanner.innerHTML = `
        <div class="overdue-banner">
          <div class="overdue-info">
            <div class="overdue-icon-wrapper">⚠️</div>
            <div class="overdue-text">
              <h4>${stats.overdueTask.title} is OVERDUE!</h4>
              <p>Was due on ${stats.overdueTask.dueDate} at ${stats.overdueTask.dueTime}. Priority has been automatically escalated to High (FR13 / X5).</p>
            </div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-danger btn-sm" id="banner-view-overdue-btn">Resolve Now</button>
            <button class="btn btn-secondary btn-sm" id="banner-snooze-overdue-btn">Snooze Alert</button>
          </div>
        </div>
      `;
      overdueBanner.style.display = "block";

      document.getElementById("banner-view-overdue-btn").onclick = () => {
        switchView("tasks");
        const statusFilter = document.getElementById("task-filter-status");
        if (statusFilter) {
          statusFilter.value = "Overdue";
          renderTaskList();
        }
      };
      document.getElementById("banner-snooze-overdue-btn").onclick = () => {
        const alt = model.alerts.find(a => a.taskId === stats.overdueTask.id);
        if (alt) openSnoozeModal(alt.id);
        else showToast("No active alert found for this task", "info");
      };
    } else {
      overdueBanner.innerHTML = "";
      overdueBanner.style.display = "none";
    }

    // 4. FEATURE 6: Today's Focus (Top 3 Urgent Tasks)
    const focusContainer = document.getElementById("dashboard-focus-container");
    if (focusContainer) {
      const focusTasks = model.getTodaysFocus(3);
      if (focusTasks.length === 0) {
        focusContainer.innerHTML = `<div style="padding: 16px; color: var(--text-muted); text-align: center; width: 100%;">No urgent tasks currently pending! Great job staying ahead. 🌟</div>`;
      } else {
        focusContainer.innerHTML = focusTasks.map(t => {
          const pLower = (t.priority || "Medium").toLowerCase();
          const pBadge = t.priority === "Critical" ? "🔴 Critical" : t.priority === "High" ? "🟠 High" : t.priority === "Medium" ? "🟡 Medium" : "🟢 Low";
          const progress = t.progressPercent || 0;
          return `
            <div class="focus-card priority-${pLower}">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                <span class="subject-pill">${t.subject}</span>
                <span class="badge-priority priority-${pLower}">${pBadge}</span>
              </div>
              <h4 style="font-size: 0.96rem; font-weight: 700; margin: 8px 0 4px 0;">${escapeHtml(t.title)}</h4>
              <div style="font-size: 0.78rem; color: var(--text-muted); display: flex; gap: 8px; align-items: center; margin-bottom: 10px;">
                <span>📅 ${t.dueDate} at ${t.dueTime}</span>
                <span>• Effort: ${t.estimatedHours || 2}h</span>
              </div>
              <div style="margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 3px;">
                  <span>Progress</span>
                  <span style="font-weight: 700;">${progress}%</span>
                </div>
                <div class="progress-track" style="height: 6px; margin: 0;">
                  <div class="progress-bar-fill" style="width: ${progress}%; background: ${pLower === 'critical' ? 'var(--priority-critical)' : 'var(--primary)'};"></div>
                </div>
              </div>
              <div style="display: flex; justify-content: flex-end; gap: 6px; margin-top: 10px;">
                <button class="btn btn-secondary btn-sm" onclick="editTask('${t.id}')">View Details</button>
                <button class="btn btn-primary btn-sm quick-done-btn" data-id="${t.id}">✓ Complete</button>
              </div>
            </div>
          `;
        }).join("");
      }
    }

    // 5. FEATURE 6: Due This Week List
    const dueWeekList = document.getElementById("dashboard-due-week-list");
    const dueWeekBadge = document.getElementById("due-week-count-badge");
    if (dueWeekList) {
      const dueWeekTasks = model.getDueThisWeek();
      if (dueWeekBadge) dueWeekBadge.textContent = `${dueWeekTasks.length} Due`;
      if (dueWeekTasks.length === 0) {
        dueWeekList.innerHTML = `<div style="padding: 16px; color: var(--text-muted); text-align: center;">No deadlines scheduled this week!</div>`;
      } else {
        dueWeekList.innerHTML = dueWeekTasks.map(t => {
          const pLower = (t.priority || "Medium").toLowerCase();
          const pBadge = t.priority === "Critical" ? "🔴" : t.priority === "High" ? "🟠" : t.priority === "Medium" ? "🟡" : "🟢";
          return `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border-light);">
              <div>
                <div style="font-weight: 700; font-size: 0.88rem;">${escapeHtml(t.title)}</div>
                <div style="font-size: 0.76rem; color: var(--text-muted); display: flex; gap: 8px; align-items: center; margin-top: 2px;">
                  <span class="subject-pill">${t.subject}</span>
                  <span>📅 ${t.dueDate} (${t.dueTime})</span>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="badge-priority priority-${pLower}">${pBadge} ${t.priority}</span>
                <button class="btn btn-secondary btn-sm quick-done-btn" data-id="${t.id}">✓ Done</button>
              </div>
            </div>
          `;
        }).join("");
      }
    }

    // 6. FEATURE 6: Weekly Workload Indicator
    const workloadContainer = document.getElementById("dashboard-workload-container");
    if (workloadContainer) {
      const workload = model.getWeeklyWorkload(4);
      workloadContainer.innerHTML = `
        <div class="workload-chart-wrapper" style="display: flex; gap: 10px; justify-content: space-between; align-items: flex-end; padding-top: 14px;">
          ${workload.map(item => {
            const heightPercent = Math.min(100, Math.max(12, Math.round((item.hours / 8) * 100)));
            const barColor = item.isOverloaded ? "var(--priority-critical)" : item.hours > 0 ? "var(--primary)" : "var(--border-light)";
            return `
              <div style="display: flex; flex-direction: column; align-items: center; flex: 1; text-align: center;">
                <div style="font-size: 0.72rem; font-weight: 700; margin-bottom: 4px; color: ${item.isOverloaded ? 'var(--priority-critical)' : 'var(--text-main)'};">
                  ${item.hours}h
                </div>
                <div style="width: 100%; max-width: 38px; height: 110px; background: var(--bg-surface-alt, #f1f5f9); border-radius: 6px; display: flex; align-items: flex-end; overflow: hidden; position: relative;">
                  <div style="width: 100%; height: ${heightPercent}%; background: ${barColor}; transition: height 0.3s ease; border-radius: 4px 4px 0 0;" title="${item.day} ${item.label}: ${item.hours} hrs (${item.taskCount} tasks)"></div>
                </div>
                <div style="font-size: 0.75rem; font-weight: 700; margin-top: 6px;">${item.day}</div>
                <div style="font-size: 0.68rem; color: var(--text-muted);">${item.label}</div>
                ${item.isOverloaded ? `<span style="font-size: 0.62rem; color: #dc2626; font-weight: 800; margin-top: 2px;">Overload</span>` : ""}
              </div>
            `;
          }).join("")}
        </div>
      `;
    }

    // 7. FEATURE 6: Subject-Wise Progress
    const subjectProgressList = document.getElementById("dashboard-subject-progress-list");
    if (subjectProgressList) {
      const subjects = model.getSubjectProgress();
      subjectProgressList.innerHTML = subjects.map(s => `
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; font-size: 0.84rem;">
            <div style="font-weight: 700;">
              <span class="subject-pill" style="margin-right: 6px;">${s.code}</span>
              <span>${s.name}</span>
            </div>
            <div style="color: var(--text-muted); font-size: 0.78rem;">
              <span>${s.completed} / ${s.total} completed</span>
              <strong style="margin-left: 8px; color: var(--text-main);">${s.avgProgress}%</strong>
            </div>
          </div>
          <div class="progress-track" style="height: 7px; margin: 0;">
            <div class="progress-bar-fill" style="width: ${s.avgProgress}%; background: ${s.color || 'var(--primary)'};"></div>
          </div>
        </div>
      `).join("");
    }

    // 8. Upcoming Deadlines List
    const upcomingDeadlinesList = document.getElementById("dashboard-upcoming-list");
    const upcoming = model.getUpcomingDeadlines(5);

    if (upcoming.length === 0) {
      upcomingDeadlinesList.innerHTML = `<div style="padding: 24px; text-align: center; color: var(--text-muted);">No upcoming tasks pending! You are all caught up. 🎉</div>`;
    } else {
      upcomingDeadlinesList.innerHTML = upcoming.map(task => {
        const priorityClass = (task.priority || "Medium").toLowerCase();
        const pBadge = task.priority === "Critical" ? "🔴 Critical" : task.priority === "High" ? "🟠 High" : task.priority === "Medium" ? "🟡 Medium" : "🟢 Low";
        return `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border-light);">
            <div>
              <div style="font-weight: 700; font-size: 0.92rem;">${escapeHtml(task.title)}</div>
              <div style="font-size: 0.78rem; color: var(--text-muted); display: flex; gap: 8px; align-items: center; margin-top: 4px;">
                <span class="subject-pill">${task.subject}</span>
                <span>📅 ${task.dueDate} at ${task.dueTime}</span>
                <span>• ${task.progressPercent || 0}% Done</span>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="badge-priority priority-${priorityClass}">
                ${pBadge}
              </span>
              <button class="btn btn-secondary btn-sm quick-done-btn" data-id="${task.id}" title="Mark Complete">✓ Done</button>
            </div>
          </div>
        `;
      }).join("");
    }

    // Quick Done Handlers
    document.querySelectorAll(".quick-done-btn").forEach(btn => {
      btn.onclick = (e) => {
        const id = e.target.getAttribute("data-id");
        model.updateTask(id, { status: "Completed", progressPercent: 100 });
        showToast("Task marked as completed! Progress updated.", "success");
        renderDashboard();
        updateAlertBadge();
      };
    });

    // Update alert badge in sidebar
    updateAlertBadge();
  }

  function updateAlertBadge() {
    const activeAlerts = model.alerts.filter(a => !a.isDismissed && !a.isSnoozed);
    if (alertNavBadge) {
      alertNavBadge.textContent = activeAlerts.length;
      alertNavBadge.style.display = activeAlerts.length > 0 ? "inline-block" : "none";
    }
  }

  // -------------------------------------------------------------
  // Render Calendar (Screen 4 / UC05 / Enhancement E2)
  // -------------------------------------------------------------
  function renderCalendar() {
    const monthYearTitle = document.getElementById("calendar-month-year-title");
    const gridEl = document.getElementById("calendar-grid-cells");
    if (!gridEl) return;

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth(); // 9 = October in 0-indexed JS Date

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    monthYearTitle.textContent = `${monthNames[month]} ${year}`;

    // Get days in month
    const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday
    // Adjust for Monday start: Mon=0, Sun=6
    const startOffset = (firstDay + 6) % 7;
    const totalDays = new Date(year, month + 1, 0).getDate();

    gridEl.innerHTML = "";

    // Fill blank cells from previous month
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const cell = document.createElement("div");
      cell.className = "calendar-cell is-other-month";
      cell.innerHTML = `<div class="date-num">${d}</div>`;
      gridEl.appendChild(cell);
    }

    // Current month cells
    for (let d = 1; d <= totalDays; d++) {
      const dStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const cell = document.createElement("div");
      cell.className = "calendar-cell";

      const isToday = dStr === "2026-10-26";
      const isSelected = dStr === selectedCalendarDateStr;

      if (isToday) cell.classList.add("is-today");
      if (isSelected) cell.classList.add("is-selected");

      // Find tasks due on this date
      const tasksOnDate = model.tasks.filter(t => t.dueDate === dStr);

      // FEATURE 7: Highlight days with multiple deadlines
      if (tasksOnDate.length > 1) {
        cell.classList.add("is-multi-deadline");
      }

      // Priority Markers with Letter (C, H, M, L)
      let markersHtml = "";
      if (tasksOnDate.length > 0) {
        markersHtml = `<div class="marker-container">` + tasksOnDate.map(t => {
          let letter = t.priority ? t.priority[0] : "M";
          let cls = "cal-marker-med";
          if (t.status === "Overdue") {
            letter = "!";
            cls = "cal-marker-overdue";
          } else if (t.priority === "Critical") {
            letter = "C";
            cls = "cal-marker-crit";
          } else if (t.priority === "High") {
            letter = "H";
            cls = "cal-marker-high";
          } else if (t.priority === "Low") {
            letter = "L";
            cls = "cal-marker-low";
          }
          return `<span class="cal-marker ${cls}" title="${escapeHtml(t.title)} [${t.subject}] (${t.priority} Priority, ${t.progressPercent || 0}% done)">${letter}</span>`;
        }).join("") + `</div>`;
      }

      cell.innerHTML = `
        <div class="date-num">
          <span>${d}</span>
          ${tasksOnDate.length > 1 ? `<span class="deadline-count-badge" title="${tasksOnDate.length} deadlines scheduled">${tasksOnDate.length}</span>` : ""}
          ${isToday ? `<span style="font-size: 0.65rem; background: var(--primary); color: white; padding: 1px 4px; border-radius: 4px;">TODAY</span>` : ""}
        </div>
        ${markersHtml}
      `;

      cell.onclick = () => {
        selectedCalendarDateStr = dStr;
        renderCalendar();
        renderCalendarSidePanel(dStr);
      };

      gridEl.appendChild(cell);
    }

    renderCalendarSidePanel(selectedCalendarDateStr);
  }

  // Calendar Side Panel (TC07 & Feature 7)
  function renderCalendarSidePanel(dateStr) {
    const titleEl = document.getElementById("calendar-side-panel-title");
    const listEl = document.getElementById("calendar-side-task-list");
    if (!titleEl || !listEl) return;

    titleEl.textContent = `Tasks Due: ${dateStr}`;
    const tasks = model.tasks.filter(t => t.dueDate === dateStr);

    if (tasks.length === 0) {
      listEl.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.88rem;">
          No tasks scheduled for this day.
        </div>
      `;
    } else {
      listEl.innerHTML = tasks.map(t => {
        const priorityCls = (t.priority || "Medium").toLowerCase();
        const pBadge = t.priority === "Critical" ? "🔴 C" : t.priority === "High" ? "🟠 H" : t.priority === "Medium" ? "🟡 M" : "🟢 L";
        const subCount = t.subtasks && t.subtasks.length > 0 ? `<div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">📋 ${t.subtasks.filter(s => s.completed).length}/${t.subtasks.length} subtasks done</div>` : "";
        return `
          <div class="side-panel-task-card" style="border-left-color: ${t.priority === 'Critical' ? 'var(--priority-critical)' : t.priority === 'High' ? 'var(--priority-high)' : t.priority === 'Low' ? 'var(--priority-low)' : 'var(--priority-med)'};">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <span class="subject-pill">${t.subject}</span>
              <span class="badge-priority priority-${priorityCls}">
                ${pBadge}
              </span>
            </div>
            <div style="font-weight: 700; font-size: 0.95rem; margin-top: 4px;">${escapeHtml(t.title)}</div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">Due at: <strong>${t.dueTime}</strong> • Type: ${t.type}</div>
            ${subCount}
            <div style="margin: 8px 0 6px 0;">
              <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); margin-bottom: 2px;">
                <span>Progress</span>
                <strong>${t.progressPercent || 0}%</strong>
              </div>
              <div class="progress-track" style="height: 5px; margin: 0;">
                <div class="progress-bar-fill" style="width: ${t.progressPercent || 0}%;"></div>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
              <span class="badge-status ${t.status === 'Completed' ? 'status-completed' : t.status === 'Overdue' ? 'status-overdue-tag' : 'status-in-progress'}">${t.status}</span>
              <button class="btn btn-secondary btn-sm" onclick="editTask('${t.id}')">Edit</button>
            </div>
          </div>
        `;
      }).join("");
    }
  }

  // -------------------------------------------------------------
  // Render My Tasks List (Screen 5 / UC04 / UC06 / TC08 / Features 1, 2, 3)
  // -------------------------------------------------------------
  function renderTaskList() {
    const tableBody = document.getElementById("tasks-table-body");
    const countBadge = document.getElementById("tasks-count-display");
    if (!tableBody) return;

    // Filters & Sorters
    const searchVal = (document.getElementById("task-search-input")?.value || "").toLowerCase().trim();
    const subjectFilter = document.getElementById("task-filter-subject")?.value || "All";
    const priorityFilter = document.getElementById("task-filter-priority")?.value || "All";
    const statusFilter = document.getElementById("task-filter-status")?.value || "All";
    const sortBy = document.getElementById("task-sort-by")?.value || "deadline";

    let filtered = model.tasks.filter(t => {
      if (searchVal && !t.title.toLowerCase().includes(searchVal) && !t.subject.toLowerCase().includes(searchVal)) {
        return false;
      }
      if (subjectFilter !== "All" && t.subject !== subjectFilter) return false;
      if (priorityFilter !== "All" && t.priority !== priorityFilter) return false;
      if (statusFilter !== "All" && t.status !== statusFilter) return false;
      return true;
    });

    // Sorting
    const priorityOrder = { "Critical": 4, "High": 3, "Medium": 2, "Low": 1 };
    if (sortBy === "deadline") {
      filtered.sort((a, b) => new Date(a.dueDate + "T" + (a.dueTime || "23:59")) - new Date(b.dueDate + "T" + (b.dueTime || "23:59")));
    } else if (sortBy === "priority") {
      filtered.sort((a, b) => (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2));
    } else if (sortBy === "progress") {
      filtered.sort((a, b) => (a.progressPercent || 0) - (b.progressPercent || 0));
    } else if (sortBy === "subject") {
      filtered.sort((a, b) => a.subject.localeCompare(b.subject));
    }

    if (countBadge) countBadge.textContent = `Showing ${filtered.length} of ${model.tasks.length} tasks`;

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 32px; color: var(--text-muted);">
            No tasks found matching current filters.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = filtered.map(task => {
      const pClass = (task.priority || "Medium").toLowerCase();
      const pBadge = task.priority === "Critical" ? "🔴 Critical" : task.priority === "High" ? "🟠 High" : task.priority === "Medium" ? "🟡 Medium" : "🟢 Low";
      const progress = task.progressPercent || 0;

      // Subtasks inline list or summary
      let subtasksHtml = "";
      if (task.subtasks && task.subtasks.length > 0) {
        const completedCount = task.subtasks.filter(s => s.completed).length;
        subtasksHtml = `
          <div style="margin-top: 6px;">
            <div style="font-size: 0.74rem; color: var(--text-muted); margin-bottom: 3px;">
              📋 Subtasks: <strong>${completedCount}/${task.subtasks.length}</strong>
            </div>
            <div style="display: flex; flex-direction: column; gap: 3px;">
              ${task.subtasks.map(s => `
                <label style="display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: ${s.completed ? 'var(--text-muted)' : 'var(--text-main)'}; cursor: pointer;">
                  <input type="checkbox" class="task-subtask-toggle" data-task-id="${task.id}" data-sub-id="${s.id}" ${s.completed ? 'checked' : ''}>
                  <span style="${s.completed ? 'text-decoration: line-through;' : ''}">${escapeHtml(s.title)}</span>
                </label>
              `).join("")}
            </div>
          </div>
        `;
      }

      return `
        <tr>
          <td>
            <div style="font-weight: 700; font-size: 0.92rem;">${escapeHtml(task.title)}</div>
            ${task.description ? `<div style="font-size: 0.76rem; color: var(--text-muted); max-width: 320px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(task.description)}</div>` : ""}
            ${subtasksHtml}
          </td>
          <td><span class="subject-pill">${task.subject}</span></td>
          <td>
            <div style="font-size: 0.85rem; font-weight: 600;">${task.dueDate}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${task.dueTime}</div>
          </td>
          <td>
            <span class="badge-priority priority-${pClass}">
              ${pBadge}
            </span>
          </td>
          <td style="min-width: 140px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.78rem; font-weight: 700; margin-bottom: 3px;">
              <span>Progress</span>
              <span>${progress}%</span>
            </div>
            <div class="progress-track" style="height: 6px; margin: 0 0 6px 0;">
              <div class="progress-bar-fill" style="width: ${progress}%;"></div>
            </div>
            <input type="range" class="progress-slider-control inline-task-progress-slider" data-id="${task.id}" min="0" max="100" value="${progress}" style="height: 4px;">
          </td>
          <td>
            <select class="form-select status-select-row" data-id="${task.id}" style="padding: 4px 8px; font-size: 0.8rem; width: auto; font-weight: 600;">
              <option value="Not started" ${task.status === "Not started" ? "selected" : ""}>Not started</option>
              <option value="In progress" ${task.status === "In progress" ? "selected" : ""}>In progress</option>
              <option value="Completed" ${task.status === "Completed" ? "selected" : ""}>Completed</option>
              ${task.status === "Overdue" ? `<option value="Overdue" selected>OVERDUE</option>` : ""}
            </select>
          </td>
          <td>
            <div style="display: flex; gap: 6px;">
              <button class="btn btn-secondary btn-sm task-edit-btn" data-id="${task.id}" title="Edit Task">✏️</button>
              <button class="btn btn-secondary btn-sm task-delete-btn" data-id="${task.id}" title="Delete Task" style="color: var(--priority-high);">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join("");

    // Attach Status Change Listeners (TC08)
    document.querySelectorAll(".status-select-row").forEach(select => {
      select.onchange = (e) => {
        const taskId = e.target.getAttribute("data-id");
        const newStatus = e.target.value;
        const res = model.updateTask(taskId, { status: newStatus });
        if (res.success) {
          const stats = model.getDashboardStats();
          showToast(`Task updated to "${newStatus}". Progress is now ${stats.completionPct}% (${stats.completed}/${stats.total} completed).`, "success");
          renderTaskList();
          updateAlertBadge();
        }
      };
    });

    // Attach Inline Progress Slider Listeners (Feature 2)
    document.querySelectorAll(".inline-task-progress-slider").forEach(slider => {
      slider.onchange = (e) => {
        const taskId = e.target.getAttribute("data-id");
        const val = parseInt(e.target.value) || 0;
        model.updateTaskProgress(taskId, val);
        showToast(`Task progress set to ${val}%.`, "success");
        renderTaskList();
        renderDashboard();
      };
    });

    // Attach Subtask Toggle Checkbox Listeners (Feature 3)
    document.querySelectorAll(".task-subtask-toggle").forEach(chk => {
      chk.onchange = (e) => {
        const taskId = e.target.getAttribute("data-task-id");
        const subId = e.target.getAttribute("data-sub-id");
        const res = model.toggleSubtask(taskId, subId);
        if (res && res.success) {
          showToast(`Subtask updated. Task progress now ${res.task.progressPercent}%.`, "info");
          renderTaskList();
          renderDashboard();
        }
      };
    });

    // Attach Edit / Delete Listeners
    document.querySelectorAll(".task-edit-btn").forEach(btn => {
      btn.onclick = () => window.editTask(btn.getAttribute("data-id"));
    });
    document.querySelectorAll(".task-delete-btn").forEach(btn => {
      btn.onclick = () => window.confirmDeleteTask(btn.getAttribute("data-id"));
    });
  }

  // -------------------------------------------------------------
  // Render Alerts & Reminders View (Screen 6 / UC09 / UC10 / E1)
  // -------------------------------------------------------------
  function renderAlertsView() {
    const listEl = document.getElementById("alerts-view-list");
    const countHeader = document.getElementById("alerts-count-header");
    if (!listEl) return;

    const activeAlerts = model.alerts.filter(a => !a.isDismissed);
    if (countHeader) countHeader.textContent = `Notifications (${activeAlerts.length})`;

    if (activeAlerts.length === 0) {
      listEl.innerHTML = `
        <div style="padding: 48px; text-align: center; background: var(--bg-surface); border-radius: var(--radius-md); border: 1px solid var(--border-light);">
          <div style="font-size: 2.5rem; margin-bottom: 12px;">🔔</div>
          <h3>No active notifications</h3>
          <p style="color: var(--text-muted); font-size: 0.88rem; margin-top: 6px;">All deadline alerts are acknowledged or completed!</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = activeAlerts.map(alert => {
      const isUrgent = alert.level === "urgent";
      const isDanger = alert.level === "danger" || alert.isOverdue;
      const isWarning = alert.level === "warning";

      let cardClass = "alert-card";
      if (isDanger) cardClass += " alert-danger";
      else if (isUrgent) cardClass += " alert-urgent";
      else if (isWarning) cardClass += " alert-warning";

      if (alert.isSnoozed) cardClass += " is-snoozed";

      return `
        <div class="${cardClass}" id="alert-card-${alert.id}">
          <div class="alert-content">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="subject-pill">${alert.subject}</span>
              ${alert.isSnoozed ? `<span style="background: var(--priority-med-bg); color: var(--priority-med-text); padding: 2px 8px; border-radius: 4px; font-size: 0.72rem; font-weight: 700;">SNOOZED (${alert.snoozeLabel})</span>` : ""}
            </div>
            <h4 style="margin-top: 6px;">${escapeHtml(alert.title)}</h4>
            <p>${escapeHtml(alert.subtitle)}</p>
          </div>
          <div class="alert-actions">
            <button class="btn btn-secondary btn-sm alert-open-btn" data-id="${alert.id}" data-task="${alert.taskId}">Open</button>
            <button class="btn btn-warning btn-sm alert-snooze-btn" data-id="${alert.id}">Snooze</button>
            <button class="btn btn-secondary btn-sm alert-dismiss-btn" data-id="${alert.id}">Dismiss</button>
          </div>
        </div>
      `;
    }).join("");

    // Attach Event Handlers (TC09)
    document.querySelectorAll(".alert-open-btn").forEach(btn => {
      btn.onclick = () => {
        const taskId = btn.getAttribute("data-task");
        switchView("tasks");
        const searchInput = document.getElementById("task-search-input");
        const task = model.tasks.find(t => t.id === taskId);
        if (task && searchInput) {
          searchInput.value = task.title;
          renderTaskList();
        }
      };
    });

    document.querySelectorAll(".alert-snooze-btn").forEach(btn => {
      btn.onclick = () => openSnoozeModal(btn.getAttribute("data-id"));
    });

    document.querySelectorAll(".alert-dismiss-btn").forEach(btn => {
      btn.onclick = () => {
        const alertId = btn.getAttribute("data-id");
        const card = document.getElementById(`alert-card-${alertId}`);
        if (card) {
          card.style.opacity = "0";
          card.style.transform = "translateX(20px)";
          setTimeout(() => {
            model.dismissAlert(alertId);
            showToast("Alert dismissed.", "info");
            renderAlertsView();
            updateAlertBadge();
          }, 250);
        }
      };
    });
  }

  // Snooze Modal (Enhancement E1, TC09, TC15)
  function openSnoozeModal(alertId) {
    activeSnoozeAlertId = alertId;
    const modal = document.getElementById("snooze-modal");
    if (modal) modal.classList.add("active");
  }

  window.closeSnoozeModal = function() {
    activeSnoozeAlertId = null;
    const modal = document.getElementById("snooze-modal");
    if (modal) modal.classList.remove("active");
  };

  window.confirmSnooze = function(hours) {
    if (!activeSnoozeAlertId) return;
    const res = model.snoozeAlert(activeSnoozeAlertId, hours);
    if (res.success) {
      showToast(`Alert snoozed for ${res.alert.snoozeLabel}. It will re-alert after timer expires (TC15).`, "warning");
      window.closeSnoozeModal();
      renderAlertsView();
      updateAlertBadge();
    }
  };

  // -------------------------------------------------------------
  // Add / Edit Task Modal & Validation (Features 1, 2, 3)
  // -------------------------------------------------------------
  let modalSubtasks = [];

  function renderModalSubtasks() {
    const container = document.getElementById("task-modal-subtasks-container");
    const counter = document.getElementById("modal-subtask-counter");
    if (!container) return;

    if (counter) {
      const completed = modalSubtasks.filter(s => s.completed).length;
      counter.textContent = `${completed}/${modalSubtasks.length} subtasks completed`;
    }

    if (modalSubtasks.length === 0) {
      container.innerHTML = `<div style="font-size: 0.8rem; color: var(--text-muted); padding: 8px 0;">No subtasks added yet. Add subtasks below to break down this assignment.</div>`;
      return;
    }

    container.innerHTML = modalSubtasks.map((s, idx) => `
      <div class="subtask-item" style="display: flex; align-items: center; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border-light);">
        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; cursor: pointer; flex: 1;">
          <input type="checkbox" class="modal-subtask-chk" data-idx="${idx}" ${s.completed ? "checked" : ""}>
          <span style="${s.completed ? 'text-decoration: line-through; color: var(--text-muted);' : ''}">${escapeHtml(s.title)}</span>
        </label>
        <button type="button" class="btn-icon btn-sm modal-subtask-del-btn" data-idx="${idx}" title="Remove Subtask" style="color: var(--priority-critical); background: none; border: none; cursor: pointer;">✕</button>
      </div>
    `).join("");

    container.querySelectorAll(".modal-subtask-chk").forEach(chk => {
      chk.onchange = (e) => {
        const idx = parseInt(e.target.getAttribute("data-idx"));
        if (modalSubtasks[idx]) {
          modalSubtasks[idx].completed = e.target.checked;
          // Sync progress slider automatically from subtasks
          const completed = modalSubtasks.filter(s => s.completed).length;
          const pct = Math.round((completed / modalSubtasks.length) * 100);
          const progSlider = document.getElementById("task-form-progress");
          const progVal = document.getElementById("task-modal-progress-val");
          if (progSlider) progSlider.value = pct;
          if (progVal) progVal.textContent = `${pct}%`;
          renderModalSubtasks();
          triggerAutoPriority();
        }
      };
    });

    container.querySelectorAll(".modal-subtask-del-btn").forEach(btn => {
      btn.onclick = (e) => {
        const idx = parseInt(e.target.getAttribute("data-idx"));
        modalSubtasks.splice(idx, 1);
        renderModalSubtasks();
      };
    });
  }

  function addModalSubtask() {
    const input = document.getElementById("new-subtask-input");
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    modalSubtasks.push({
      id: "sub-" + Date.now().toString(36) + "-" + Math.random().toString(36).substr(2, 4),
      title: text,
      completed: false,
      dueDate: document.getElementById("task-form-duedate")?.value || "2026-10-27"
    });
    input.value = "";
    renderModalSubtasks();
  }

  document.getElementById("btn-add-modal-subtask")?.addEventListener("click", addModalSubtask);
  document.getElementById("new-subtask-input")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addModalSubtask();
    }
  });

  // Modal Progress Slider Listener
  document.getElementById("task-form-progress")?.addEventListener("input", (e) => {
    const val = e.target.value;
    const label = document.getElementById("task-modal-progress-val");
    if (label) label.textContent = `${val}%`;
    triggerAutoPriority();
  });

  function triggerAutoPriority() {
    const dueDate = document.getElementById("task-form-duedate")?.value || "2026-10-27";
    const dueTime = document.getElementById("task-form-duetime")?.value || "23:59";
    const weightage = document.getElementById("task-form-weightage")?.value || "Medium";
    const hours = parseFloat(document.getElementById("task-form-hours")?.value) || 2;
    const progress = parseInt(document.getElementById("task-form-progress")?.value) || 0;

    const suggested = model.suggestPriority(dueDate, dueTime, weightage, hours, progress);
    const radio = document.querySelector(`input[name="task-priority"][value="${suggested}"]`);
    if (radio) {
      radio.checked = true;
      updatePriorityRadioStyles();
      const hint = document.getElementById("priority-suggested-hint");
      if (hint) {
        hint.innerHTML = `💡 Auto-suggested: <strong>${suggested}</strong> (${weightage} weight, ${hours}h effort, ${progress}% complete)`;
      }
    }
  }

  // Hook input changes for auto-suggestion
  ["task-form-duedate", "task-form-duetime", "task-form-weightage", "task-form-hours"].forEach(id => {
    document.getElementById(id)?.addEventListener("change", triggerAutoPriority);
  });

  window.openAddTaskModal = function(prefillDate = null) {
    document.getElementById("modal-task-title-text").textContent = "Add New Academic Task";
    document.getElementById("task-edit-id").value = "";
    document.getElementById("task-form-title").value = "";
    document.getElementById("task-form-title").classList.remove("is-invalid");
    document.getElementById("task-form-subject").value = "DBMS";
    document.getElementById("task-form-type").value = "Assignment";
    document.getElementById("task-form-duedate").value = prefillDate || "2026-10-29";
    document.getElementById("task-form-duetime").value = "23:59";
    document.getElementById("task-form-description").value = "";
    document.getElementById("task-form-weightage").value = "Medium";
    document.getElementById("task-form-hours").value = "3";
    document.getElementById("task-form-progress").value = "0";
    document.getElementById("task-modal-progress-val").textContent = "0%";

    modalSubtasks = [];
    renderModalSubtasks();

    triggerAutoPriority();
    document.getElementById("add-task-modal").classList.add("active");
  };

  window.editTask = function(taskId) {
    const task = model.tasks.find(t => t.id === taskId);
    if (!task) return;

    document.getElementById("modal-task-title-text").textContent = "Edit Task / Assignment";
    document.getElementById("task-edit-id").value = task.id;
    document.getElementById("task-form-title").value = task.title;
    document.getElementById("task-form-title").classList.remove("is-invalid");
    document.getElementById("task-form-subject").value = task.subject;
    document.getElementById("task-form-type").value = task.type;
    document.getElementById("task-form-duedate").value = task.dueDate;
    document.getElementById("task-form-duetime").value = task.dueTime;
    document.getElementById("task-form-description").value = task.description || "";
    document.getElementById("task-form-weightage").value = task.weightage || "Medium";
    document.getElementById("task-form-hours").value = task.estimatedHours || 3;
    document.getElementById("task-form-progress").value = task.progressPercent || 0;
    document.getElementById("task-modal-progress-val").textContent = `${task.progressPercent || 0}%`;

    const priorityInput = document.querySelector(`input[name="task-priority"][value="${task.priority}"]`);
    if (priorityInput) priorityInput.checked = true;
    updatePriorityRadioStyles();

    modalSubtasks = (task.subtasks || []).map(s => ({ ...s }));
    renderModalSubtasks();

    document.getElementById("add-task-modal").classList.add("active");
  };

  window.closeAddTaskModal = function() {
    document.getElementById("add-task-modal").classList.remove("active");
  };

  function updatePriorityRadioStyles() {
    const checked = document.querySelector('input[name="task-priority"]:checked')?.value;
    document.querySelectorAll(".radio-card").forEach(card => {
      card.classList.remove("selected-crit", "selected-high", "selected-med", "selected-low");
      const val = card.querySelector("input")?.value;
      if (val === checked) {
        if (val === "Critical") card.classList.add("selected-crit");
        if (val === "High") card.classList.add("selected-high");
        if (val === "Medium") card.classList.add("selected-med");
        if (val === "Low") card.classList.add("selected-low");
      }
    });
  }

  document.querySelectorAll('input[name="task-priority"]').forEach(radio => {
    radio.addEventListener("change", updatePriorityRadioStyles);
  });

  // Handle Form Submission with Validation (DP2 / TC04 / TC05)
  document.getElementById("task-submit-btn")?.addEventListener("click", () => {
    const editId = document.getElementById("task-edit-id").value;
    const title = document.getElementById("task-form-title").value;
    const subject = document.getElementById("task-form-subject").value;
    const type = document.getElementById("task-form-type").value;
    const dueDate = document.getElementById("task-form-duedate").value;
    const dueTime = document.getElementById("task-form-duetime").value;
    const priority = document.querySelector('input[name="task-priority"]:checked')?.value || "Medium";
    const description = document.getElementById("task-form-description").value;
    const weightage = document.getElementById("task-form-weightage")?.value || "Medium";
    const estimatedHours = parseFloat(document.getElementById("task-form-hours")?.value) || 2;
    const progressPercent = parseInt(document.getElementById("task-form-progress")?.value) || 0;

    const taskData = {
      title,
      subject,
      type,
      dueDate,
      dueTime,
      priority,
      description,
      weightage,
      estimatedHours,
      progressPercent,
      subtasks: modalSubtasks
    };

    // Validate Mandatory Fields (TC05)
    if (!title.trim()) {
      document.getElementById("task-form-title").classList.add("is-invalid");
      showToast("Title is mandatory! Please enter a valid task title (FR02 / TC05).", "error");
      return;
    }

    if (editId) {
      // Update
      const res = model.updateTask(editId, taskData);
      if (res.success) {
        showToast("Task updated successfully!", "success");
        window.closeAddTaskModal();
        renderDashboard();
        renderTaskList();
        renderCalendar();
      }
    } else {
      // Add with Past Date Check (TC04)
      const res = model.addTask(taskData, false);
      if (res.requiresConfirmation) {
        // Trigger Warning Dialog (Exp 9 Issue 1 / TC04 fix!)
        pendingTaskData = taskData;
        window.closeAddTaskModal();
        const warnModal = document.getElementById("past-date-modal");
        if (warnModal) warnModal.classList.add("active");
        return;
      }

      if (res.success) {
        showToast("Task added successfully and scheduled on calendar!", "success");
        window.closeAddTaskModal();
        renderDashboard();
        renderTaskList();
        renderCalendar();
      }
    }
  });

  // Past Date Warning Confirmation (TC04 fix)
  window.confirmPastDateSave = function() {
    if (!pendingTaskData) return;
    const res = model.addTask(pendingTaskData, true);
    document.getElementById("past-date-modal").classList.remove("active");
    pendingTaskData = null;
    showToast("Task saved as Overdue with High priority escalation (TC04).", "warning");
    renderDashboard();
    renderTaskList();
    renderCalendar();
  };

  window.cancelPastDateSave = function() {
    document.getElementById("past-date-modal").classList.remove("active");
    pendingTaskData = null;
    window.openAddTaskModal();
  };

  // Delete Task Confirmation Modal
  let activeDeleteTaskId = null;
  window.confirmDeleteTask = function(taskId) {
    activeDeleteTaskId = taskId;
    const modal = document.getElementById("delete-task-modal");
    if (modal) modal.classList.add("active");
  };

  window.closeDeleteModal = function() {
    activeDeleteTaskId = null;
    const modal = document.getElementById("delete-task-modal");
    if (modal) modal.classList.remove("active");
  };

  window.executeTaskDelete = function() {
    if (!activeDeleteTaskId) return;
    model.deleteTask(activeDeleteTaskId);
    window.closeDeleteModal();
    showToast("Task deleted successfully (US08 / UC03).", "info");
    renderDashboard();
    renderTaskList();
    renderCalendar();
  };

  // -------------------------------------------------------------
  // Render Faculty Portal (Screen 7 / UC11 / UC12 / US09 / US10)
  // -------------------------------------------------------------
  function renderFacultyPortal() {
    const batchSelect = document.getElementById("faculty-batch-select")?.value || "SY-C2";
    const subjectSelect = document.getElementById("faculty-subject-select")?.value || "All";
    const reportData = model.getClassReport(subjectSelect, batchSelect);

    const reportOverview = document.getElementById("faculty-report-overview");
    if (reportOverview) {
      reportOverview.innerHTML = `
        <div class="stats-grid">
          <div class="stat-card stat-pending">
            <div class="stat-title">Total Academic Tasks</div>
            <div class="stat-number">${reportData.total}</div>
            <div class="stat-meta">For Batch: ${batchSelect}</div>
          </div>
          <div class="stat-card stat-done">
            <div class="stat-title">Completion Rate</div>
            <div class="stat-number">${reportData.rate}%</div>
            <div class="stat-meta">${reportData.completed} submissions completed</div>
          </div>
          <div class="stat-card stat-overdue">
            <div class="stat-title">Overdue Submissions</div>
            <div class="stat-number">${reportData.overdue}</div>
            <div class="stat-meta">Requires faculty intervention</div>
          </div>
          <div class="stat-card stat-duesoon">
            <div class="stat-title">In Progress</div>
            <div class="stat-number">${reportData.inProgress}</div>
            <div class="stat-meta">Under active student work</div>
          </div>
        </div>
      `;
    }

    const reportTableBody = document.getElementById("faculty-tasks-report-body");
    if (reportTableBody) {
      reportTableBody.innerHTML = reportData.tasks.map(t => `
        <tr>
          <td><strong>${escapeHtml(t.title)}</strong></td>
          <td><span class="subject-pill">${t.subject}</span></td>
          <td>${t.type}</td>
          <td>${t.dueDate}</td>
          <td><span class="badge-priority priority-${t.priority.toLowerCase()}">${t.priority}</span></td>
          <td><span class="badge-status ${t.status === 'Completed' ? 'status-completed' : t.status === 'Overdue' ? 'status-overdue-tag' : 'status-in-progress'}">${t.status}</span></td>
        </tr>
      `).join("");
    }
  }

  // Faculty Broadcast Deadline (FR10 / UC11 / US09 / A3)
  document.getElementById("faculty-post-deadline-btn")?.addEventListener("click", () => {
    const title = document.getElementById("faculty-post-title")?.value;
    const subject = document.getElementById("faculty-post-subject")?.value;
    const dueDate = document.getElementById("faculty-post-duedate")?.value;
    const batch = document.getElementById("faculty-post-batch")?.value || "SY-C2";

    if (!title || !title.trim()) {
      showToast("Please enter assignment title to post to students.", "error");
      return;
    }

    const res = model.postFacultyDeadline({
      title,
      subject,
      type: "Assignment",
      dueDate: dueDate || "2026-11-03",
      dueTime: "23:59",
      priority: "High",
      batch: batch,
      description: `Official assignment posted by Faculty for batch ${batch}. Synchronized to all student calendars.`
    });

    if (res.success) {
      showToast(`Broadcast deadline "${title}" posted to all students in ${batch} (FR10 / US09)!`, "success");
      document.getElementById("faculty-post-title").value = "";
      renderFacultyPortal();
      renderDashboard();
    }
  });

  // Download PDF Report (US10 / Exp 8 F)
  document.getElementById("faculty-export-pdf-btn")?.addEventListener("click", () => {
    window.print();
  });

  // -------------------------------------------------------------
  // Render Administrator Portal (Screen 8 / UC13 / US11)
  // -------------------------------------------------------------
  function renderAdminPortal() {
    const userTableBody = document.getElementById("admin-users-table-body");
    if (userTableBody) {
      userTableBody.innerHTML = model.users.map(u => `
        <tr>
          <td><strong>${escapeHtml(u.rollNo)}</strong></td>
          <td>${escapeHtml(u.name)}</td>
          <td>${escapeHtml(u.email)}</td>
          <td><span style="text-transform: capitalize; font-weight: 600;">${escapeHtml(u.role)}</span></td>
          <td>${escapeHtml(u.batch || u.department || "General")}</td>
          <td>
            <div style="display: flex; gap: 6px;">
              <button class="btn btn-secondary btn-sm" onclick="showToast('User account active.', 'info')">Active ✓</button>
              ${model.users.length > 1 ? `<button class="btn btn-secondary btn-sm" onclick="adminDeleteUser('${u.id}')" style="color: var(--priority-high);">Delete</button>` : ""}
            </div>
          </td>
        </tr>
      `).join("");
    }
  }

  // Admin Add User Modal Handling
  window.openAddUserModal = function() {
    document.getElementById("user-form-roll").value = "";
    document.getElementById("user-form-name").value = "";
    document.getElementById("user-form-email").value = "";
    document.getElementById("user-form-batch").value = "SY-C2";
    document.getElementById("add-user-modal")?.classList.add("active");
  };

  window.closeAddUserModal = function() {
    document.getElementById("add-user-modal")?.classList.remove("active");
  };

  window.adminDeleteUser = function(userId) {
    if (confirm("Are you sure you want to remove this user account?")) {
      const res = model.deleteUser(userId);
      if (res.success) {
        showToast("User account deleted successfully and changes saved.", "info");
        renderAdminPortal();
      } else {
        showToast(res.message, "error");
      }
    }
  };

  document.getElementById("btn-save-new-user")?.addEventListener("click", () => {
    const rollNo = document.getElementById("user-form-roll").value;
    const name = document.getElementById("user-form-name").value;
    const email = document.getElementById("user-form-email").value;
    const role = document.getElementById("user-form-role").value;
    const batch = document.getElementById("user-form-batch").value;

    const res = model.addUser({ rollNo, name, email, role, batch });
    if (res.success) {
      showToast(`User ${name} (${rollNo}) added and persisted to storage (FR12 / UC13).`, "success");
      window.closeAddUserModal();
      renderAdminPortal();
    } else {
      showToast(res.message, "error");
    }
  });

  // Attach button for opening Add User dialog in Admin View
  document.querySelector("#view-admin .panel-header button")?.addEventListener("click", () => {
    window.openAddUserModal();
  });

  // -------------------------------------------------------------
  // Data Persistence, Live Auto-Save, and Backup Export/Import
  // -------------------------------------------------------------
  const autoSavePill = document.getElementById("autosave-status-pill");
  const autoSaveText = document.getElementById("autosave-status-text");

  model.onSave((timestamp) => {
    if (autoSaveText) {
      autoSaveText.textContent = `Saved ${timestamp}`;
      if (autoSavePill) {
        autoSavePill.style.borderColor = "var(--priority-low)";
        setTimeout(() => {
          autoSavePill.style.borderColor = "var(--border-subtle)";
        }, 1500);
      }
    }
  });

  // Export JSON Backup
  document.getElementById("btn-export-backup")?.addEventListener("click", () => {
    const jsonStr = model.exportBackupJSON();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `academic-planner-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Data backup successfully exported to JSON file! 💾", "success");
  });

  // Import JSON Backup Trigger
  const backupFileInput = document.getElementById("backup-file-input");
  document.getElementById("btn-import-backup-trigger")?.addEventListener("click", () => {
    backupFileInput?.click();
  });

  backupFileInput?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const res = model.importBackupJSON(content);
      if (res.success) {
        showToast(`Backup restored successfully! Loaded ${res.count} tasks.`, "success");
        renderDashboard();
        renderTaskList();
        renderCalendar();
        renderAlertsView();
        renderFacultyPortal();
        renderAdminPortal();
      } else {
        showToast(res.message, "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  });

  // -------------------------------------------------------------
  // Automated Test Suite View (TC01 - TC15 / Exp 9-10)
  // -------------------------------------------------------------
  function renderTestRunnerView() {
    const resultsContainer = document.getElementById("test-suite-results-body");
    const summaryCard = document.getElementById("test-suite-summary-card");
    if (!resultsContainer) return;

    if (testRunner.results.length === 0) {
      resultsContainer.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 32px; color: var(--text-muted);">
            Click <strong>"Run All 15 Test Cases"</strong> above to validate the system against Experiment 9 and Experiment 10 specifications.
          </td>
        </tr>
      `;
      if (summaryCard) summaryCard.style.display = "none";
    }
  }

  document.getElementById("btn-run-all-tests")?.addEventListener("click", async () => {
    const runBtn = document.getElementById("btn-run-all-tests");
    runBtn.disabled = true;
    runBtn.textContent = "Running 15 Test Cases...";

    const resultsContainer = document.getElementById("test-suite-results-body");
    resultsContainer.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 24px;">Executing verification tests...</td></tr>`;

    const summary = await testRunner.runAllTests((tcResult, current, total) => {
      runBtn.textContent = `Running Test ${current}/${total} (${tcResult.id})...`;
    });

    runBtn.disabled = false;
    runBtn.textContent = "Run All 15 Test Cases Again";

    // Render results
    resultsContainer.innerHTML = summary.results.map(r => `
      <tr style="background: ${r.passed ? 'rgba(16, 185, 129, 0.04)' : 'rgba(239, 68, 68, 0.08)'};">
        <td><strong>${r.id}</strong></td>
        <td><strong>${r.name}</strong></td>
        <td style="color: var(--text-muted); font-size: 0.78rem;">${escapeHtml(r.expected)}</td>
        <td style="font-size: 0.8rem;">${escapeHtml(r.actual)}</td>
        <td>
          <span class="${r.passed ? 'test-badge-pass' : 'badge-danger'}" style="padding: 3px 8px; border-radius: 4px; font-weight: 700;">
            ${r.passed ? 'PASS ✓' : 'FAIL ✗'}
          </span>
        </td>
        <td style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(r.remarks)}</td>
      </tr>
    `).join("");

    const summaryCard = document.getElementById("test-suite-summary-card");
    if (summaryCard) {
      summaryCard.style.display = "block";
      document.getElementById("test-summary-pass-count").textContent = `${summary.passed} of ${summary.total} Passed (${summary.passRate}%)`;
      document.getElementById("test-summary-badge").textContent = summary.failed === 0 ? "100% ALL TESTS PASSING" : `${summary.failed} Failed`;
    }

    showToast(`Test execution complete: ${summary.passed}/${summary.total} test cases passed!`, "success");
  });

  // -------------------------------------------------------------
  // 5-Minute Live Demo Script Runner (Exp 10 Section E)
  // -------------------------------------------------------------
  const demoSteps = [
    {
      step: 1,
      title: "Step 1: Student Login & Security Check",
      action: "Role selection and verification of credentials.",
      run: () => {
        switchView("dashboard");
        showToast("Step 1: Logged in as Arnav Vaidya (Student SY-C2 / CS2351).", "success");
      }
    },
    {
      step: 2,
      title: "Step 2: Dashboard Overview",
      action: "Review stats: 8 Pending, 3 Due soon, 1 Overdue, 12 Done, 57% Progress, and Overdue Banner.",
      run: () => {
        switchView("dashboard");
        showToast("Step 2: Dashboard displaying progress metrics and Overdue Banner for CN Lab Record.", "info");
      }
    },
    {
      step: 3,
      title: "Step 3: Quick Add Task with Past Date Validation",
      action: "Attempt to add a task with a past date (2026-10-20) to demonstrate warning dialog.",
      run: () => {
        window.openAddTaskModal("2026-10-20");
        document.getElementById("task-form-title").value = "Missed Practical Submission";
        showToast("Step 3: Past date detected! Warning dialog shown with confirmation prompt (TC04).", "warning");
      }
    },
    {
      step: 4,
      title: "Step 4: Set Priority and Save to Calendar",
      action: "Enter valid task with High Priority and auto-suggested tag.",
      run: () => {
        window.closeAddTaskModal();
        const res = model.addTask({
          title: "Operating Systems Viva Prep",
          subject: "OS",
          type: "Exam",
          dueDate: "2026-10-28",
          dueTime: "10:00",
          priority: "High"
        }, true);
        renderCalendar();
        switchView("calendar");
        showToast("Step 4: Task saved! Appears with High Priority marker 'H' on 28 Oct.", "success");
      }
    },
    {
      step: 5,
      title: "Step 5: Calendar Navigation & Side Panel",
      action: "Click 27 Oct to inspect OS Unit Test in side panel.",
      run: () => {
        switchView("calendar");
        selectedCalendarDateStr = "2026-10-27";
        renderCalendar();
        showToast("Step 5: 27 Oct selected. Side panel displays OS Unit Test (10:00 AM, High Priority).", "info");
      }
    },
    {
      step: 6,
      title: "Step 6: Open Alerts & Snooze Notification",
      action: "Open Alerts screen and trigger 1-hour snooze on OS Unit Test.",
      run: () => {
        switchView("alerts");
        const alt = model.alerts.find(a => a.title.includes("OS Unit Test"));
        if (alt) {
          model.snoozeAlert(alt.id, 1);
          renderAlertsView();
          showToast("Step 6: Alert snoozed for 1 hour! Snooze badge displayed (TC09/TC15).", "warning");
        }
      }
    },
    {
      step: 7,
      title: "Step 7: Mark Task Completed & Observe Progress Jump",
      action: "Mark DBMS Assignment 3 completed. Watch progress increase on dashboard.",
      run: () => {
        const dbms = model.tasks.find(t => t.title === "DBMS Assignment 3");
        if (dbms) {
          model.updateTask(dbms.id, { status: "Completed" });
          switchView("dashboard");
          showToast("Step 7: DBMS Assignment 3 completed! Overall progress increased (TC08).", "success");
        }
      }
    }
  ];

  let currentDemoStepIndex = 0;
  function updateDemoBar() {
    const stepObj = demoSteps[currentDemoStepIndex];
    const textEl = document.getElementById("demo-step-text-display");
    if (textEl) {
      textEl.innerHTML = `<strong>${stepObj.title}</strong>: ${stepObj.action}`;
    }
  }

  document.getElementById("btn-demo-next")?.addEventListener("click", () => {
    demoSteps[currentDemoStepIndex].run();
    currentDemoStepIndex = (currentDemoStepIndex + 1) % demoSteps.length;
    updateDemoBar();
  });

  document.getElementById("btn-demo-reset")?.addEventListener("click", () => {
    model.resetToDefault();
    currentDemoStepIndex = 0;
    updateDemoBar();
    switchView("dashboard");
    showToast("Simulation reset to initial state (12 of 21 tasks completed / 57%).", "info");
  });

  // -------------------------------------------------------------
  // Render Settings View (Sound & Notification Engine Preferences)
  // -------------------------------------------------------------
  function renderSettingsView() {
    const svc = window.soundAlertService;
    if (!svc) return;

    // Master toggles
    const soundToggle = document.getElementById("setting-toggle-sound");
    if (soundToggle) {
      soundToggle.checked = svc.settings.soundEnabled;
      soundToggle.onchange = (e) => {
        svc.settings.soundEnabled = e.target.checked;
        svc.saveSettings();
        showToast(`Sound alerts ${e.target.checked ? "enabled" : "disabled"}.`, "info");
      };
    }

    const notifToggle = document.getElementById("setting-toggle-browser-notif");
    if (notifToggle) {
      notifToggle.checked = svc.settings.notificationsEnabled;
      notifToggle.onchange = (e) => {
        svc.settings.notificationsEnabled = e.target.checked;
        svc.saveSettings();
        showToast(`Desktop notifications ${e.target.checked ? "enabled" : "disabled"}.`, "info");
      };
    }

    // Permission button
    document.getElementById("btn-request-notif-perm")?.addEventListener("click", async () => {
      const res = await svc.requestNotificationPermission();
      if (res.permission === "granted") {
        showToast("Desktop notification permission granted! 🔔", "success");
        if (notifToggle) notifToggle.checked = true;
      } else {
        showToast(`Notification permission status: ${res.permission}`, "warning");
      }
    });

    // Volume Slider
    const volSlider = document.getElementById("setting-volume-slider");
    const volNum = document.getElementById("setting-volume-num");
    if (volSlider) {
      volSlider.value = svc.settings.volume || 85;
      if (volNum) volNum.textContent = `${volSlider.value}%`;
      volSlider.oninput = (e) => {
        const val = parseInt(e.target.value);
        svc.settings.volume = val;
        svc.saveSettings();
        if (volNum) volNum.textContent = `${val}%`;
      };
    }

    // Tone Select & Preview
    const toneSelect = document.getElementById("setting-preferred-tone");
    if (toneSelect) {
      toneSelect.value = svc.settings.preferredTone || "chime";
      toneSelect.onchange = (e) => {
        svc.settings.preferredTone = e.target.value;
        svc.saveSettings();
      };
    }

    document.getElementById("btn-preview-tone")?.addEventListener("click", async () => {
      const tone = toneSelect?.value || "chime";
      await svc.unlockAudio();
      await svc.playTestSound(tone);
      showToast(`Playing "${tone}" preview.`, "info");
    });

    document.getElementById("btn-play-test-alert")?.addEventListener("click", async () => {
      await svc.unlockAudio();
      await svc.playTestSound(toneSelect?.value || "chime");
      showToast("🔊 Test sound alert triggered successfully!", "success");
    });

    // DND Toggle
    const dndToggle = document.getElementById("setting-toggle-dnd");
    if (dndToggle) {
      dndToggle.checked = svc.settings.dndEnabled;
      dndToggle.onchange = (e) => {
        svc.settings.dndEnabled = e.target.checked;
        svc.saveSettings();
        showToast(`Do Not Disturb ${e.target.checked ? "Activated 🌙" : "Deactivated"}`, e.target.checked ? "warning" : "info");
      };
    }

    // Timing Stage Checkboxes
    const timingMap = {
      "timing-stage-7d": "sevenDays",
      "timing-stage-3d": "threeDays",
      "timing-stage-1d": "oneDay",
      "timing-stage-2h": "twoHours",
      "timing-stage-deadline": "atDeadline",
      "timing-stage-overdue": "overdue"
    };

    Object.entries(timingMap).forEach(([elemId, configKey]) => {
      const chk = document.getElementById(elemId);
      if (chk) {
        chk.checked = svc.settings.timings[configKey] !== false;
        chk.onchange = (e) => {
          svc.settings.timings[configKey] = e.target.checked;
          svc.saveSettings();
        };
      }
    });

    // Per-Subject Sound Toggles Grid
    const subjGrid = document.getElementById("settings-subject-toggles-grid");
    if (subjGrid) {
      const subjects = model.subjects || [];
      subjGrid.innerHTML = subjects.map(s => {
        const isMuted = svc.settings.subjectMutes && svc.settings.subjectMutes[s.code] === false;
        return `
          <label class="radio-card" style="cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <span class="subject-pill">${s.code}</span>
              <span style="font-size: 0.82rem; margin-left: 6px;">${s.name}</span>
            </div>
            <input type="checkbox" class="subject-mute-chk" data-subject="${s.code}" ${isMuted ? "" : "checked"}>
          </label>
        `;
      }).join("");

      subjGrid.querySelectorAll(".subject-mute-chk").forEach(chk => {
        chk.onchange = (e) => {
          const code = e.target.getAttribute("data-subject");
          if (!svc.settings.subjectMutes) svc.settings.subjectMutes = {};
          svc.settings.subjectMutes[code] = e.target.checked;
          svc.saveSettings();
          showToast(`Sound alerts for ${code} ${e.target.checked ? "enabled" : "muted"}.`, "info");
        };
      });
    }

    // Default Snooze Select
    const snoozeSel = document.getElementById("setting-snooze-duration");
    if (snoozeSel) {
      snoozeSel.value = svc.settings.snoozeMinutes || 60;
      snoozeSel.onchange = (e) => {
        svc.settings.snoozeMinutes = parseInt(e.target.value) || 60;
        svc.saveSettings();
      };
    }
  }

  // -------------------------------------------------------------
  // Global Event Listeners & Initial Setup
  // -------------------------------------------------------------
  navItems.forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const v = item.getAttribute("data-view");
      if (v) switchView(v);
    });
  });

  // Topbar Enable Sound & Audio Test Button
  const btnEnableAudio = document.getElementById("btn-enable-sound-alerts");
  if (btnEnableAudio) {
    btnEnableAudio.addEventListener("click", async () => {
      if (window.soundAlertService) {
        await window.soundAlertService.unlockAudio();
        await window.soundAlertService.playTestSound();
        showToast("🔊 Notification Audio Active & Playing Test Chime!", "success");
      }
    });
  }

  // Quick Add Button (+ Quick add)
  document.getElementById("quick-add-btn")?.addEventListener("click", () => {
    window.openAddTaskModal();
  });

  // Floating Add Task Button on Calendar Side Panel
  document.getElementById("cal-side-add-task-btn")?.addEventListener("click", () => {
    window.openAddTaskModal(selectedCalendarDateStr);
  });

  // Role Switcher in Top Bar
  if (roleSelect) {
    roleSelect.addEventListener("change", (e) => {
      const selectedRole = e.target.value;
      const targetUser = model.users.find(u => u.role === selectedRole);
      if (targetUser) {
        model.currentUser = targetUser;
        currentUserName.textContent = targetUser.name;
        currentUserRole.textContent = targetUser.role;
        showToast(`Switched active profile to ${targetUser.name} (${targetUser.role.toUpperCase()})`, "info");
        if (selectedRole === "faculty") switchView("faculty");
        else if (selectedRole === "admin") switchView("admin");
        else switchView("dashboard");
      }
    });
  }

  // Dark Mode Toggle
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const isDark = document.body.getAttribute("data-theme") === "dark";
      if (isDark) {
        document.body.removeAttribute("data-theme");
        themeToggleBtn.innerHTML = "🌙";
      } else {
        document.body.setAttribute("data-theme", "dark");
        themeToggleBtn.innerHTML = "☀️";
      }
    });
  }

  // Filter Event Listeners for My Tasks (S5)
  ["task-search-input", "task-filter-subject", "task-filter-priority", "task-filter-status", "task-sort-by"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", renderTaskList);
      el.addEventListener("change", renderTaskList);
    }
  });

  // Faculty batch/subject filter changes
  ["faculty-batch-select", "faculty-subject-select"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", renderFacultyPortal);
  });

  // Periodic deadline sound evaluation (every 30 seconds)
  if (window.soundAlertService) {
    window.soundAlertService.checkTaskDeadlines(model.tasks, model.baseDate);
    setInterval(() => {
      window.soundAlertService.checkTaskDeadlines(model.tasks, model.baseDate);
    }, 30000);
  }

  // Helper escape
  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  // Initialize
  updateDemoBar();
  switchView("dashboard");
});
