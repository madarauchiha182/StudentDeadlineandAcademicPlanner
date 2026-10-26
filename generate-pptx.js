const pptxgen = require("pptxgenjs");

// Initialize presentation
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "Arnav Vaidya (CS2351 / SY-C2)";
pres.company = "JSPM's Rajarshi Shahu College of Engineering, Pune";
pres.subject = "CS2308L Design Thinking Lab - Student Deadline & Academic Planner";
pres.title = "Student Deadline & Academic Planner - Prototype & Design Models";

// Color Palette
const COLORS = {
  primary: "1E40AF",       // Deep Royal Blue
  primaryDark: "0F172A",   // Navy Slate
  accent: "2563EB",        // Electric Blue
  bgLight: "F8FAFC",       // Off white
  cardBg: "FFFFFF",        // Pure white
  border: "E2E8F0",        // Light border
  textDark: "1E293B",      // Charcoal dark
  textMuted: "64748B",     // Slate muted
  white: "FFFFFF",
  critical: "DC2626",      // Red
  high: "EA580C",          // Orange
  medium: "D97706",        // Yellow/Amber
  low: "16A34A"            // Green
};

// Helper: Add consistent header & footer to slide
function addSlideHeader(slide, title, category = "CS2308L DESIGN THINKING LAB • JSPM'S RSCOE PUNE") {
  // Top Banner / Header
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.15,
    fill: { color: COLORS.accent },
    line: { color: COLORS.accent }
  });

  slide.addText(category.toUpperCase(), {
    x: 0.8, y: 0.35, w: 10, h: 0.3,
    fontSize: 10, fontFace: "Calibri", color: COLORS.primary, bold: true, charSpacing: 1.5
  });

  slide.addText(title, {
    x: 0.8, y: 0.65, w: 11.5, h: 0.6,
    fontSize: 22, fontFace: "Calibri", color: COLORS.primaryDark, bold: true
  });

  // Footer
  slide.addShape(pres.ShapeType.line, {
    x: 0.8, y: 7.0, w: 11.7, h: 0,
    line: { color: COLORS.border, width: 1 }
  });

  slide.addText("Student Deadline & Academic Planner • Student: Arnav Vaidya (CS2351)", {
    x: 0.8, y: 7.05, w: 8.0, h: 0.3,
    fontSize: 9, fontFace: "Calibri", color: COLORS.textMuted
  });

  slide.addText("Dept. of Computer Engineering", {
    x: 9.2, y: 7.05, w: 3.3, h: 0.3,
    fontSize: 9, fontFace: "Calibri", color: COLORS.textMuted, align: "right"
  });
}

// -------------------------------------------------------------
// SLIDE 1: Title Slide
// -------------------------------------------------------------
{
  const s1 = pres.addSlide();
  
  // Background gradient/accent
  s1.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: "100%",
    fill: { color: COLORS.primaryDark }
  });

  s1.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 0.4, h: "100%",
    fill: { color: COLORS.accent }
  });

  s1.addText("CS2308L DESIGN THINKING LAB • EXPERIMENTS 7 - 10", {
    x: 1.2, y: 1.5, w: 10, h: 0.4,
    fontSize: 12, fontFace: "Calibri", color: "93C5FD", bold: true, charSpacing: 2
  });

  s1.addText("Student Deadline &\nAcademic Planner", {
    x: 1.2, y: 2.0, w: 10, h: 1.8,
    fontSize: 40, fontFace: "Calibri", color: COLORS.white, bold: true, lineSpacing: 46
  });

  s1.addText("Smart Multi-Factor Prioritization, Web Audio Procedural Alerts & Academic Workflow Automation", {
    x: 1.2, y: 4.0, w: 10, h: 0.6,
    fontSize: 16, fontFace: "Calibri", color: "CBD5E1"
  });

  // Project Info Card
  s1.addShape(pres.ShapeType.roundRect, {
    x: 1.2, y: 4.8, w: 10.5, h: 1.8, r: 0.1,
    fill: { color: "1E293B" },
    line: { color: "334155", width: 1 }
  });

  s1.addText([
    { text: "Author / Student: ", options: { bold: true, color: "93C5FD" } },
    { text: "Arnav Vaidya (Roll No: CS2351 | Class: SY-C2)\n", options: { color: COLORS.white } },
    { text: "Institution: ", options: { bold: true, color: "93C5FD" } },
    { text: "Department of Computer Engineering, JSPM's Rajarshi Shahu College of Engineering, Pune\n", options: { color: COLORS.white } },
    { text: "Lab Faculty: ", options: { bold: true, color: "93C5FD" } },
    { text: "Prof. Sneha Kulkarni | Prof. M. B. Shinde | Verification: 15/15 Automated Test Cases Passed (100%)", options: { color: COLORS.white } }
  ], {
    x: 1.5, y: 5.0, w: 9.9, h: 1.4,
    fontSize: 12, fontFace: "Calibri", lineSpacing: 22
  });
}

// -------------------------------------------------------------
// SLIDE 2: Problem Statement & Student Empathy (Design Thinking)
// -------------------------------------------------------------
{
  const s2 = pres.addSlide();
  addSlideHeader(s2, "Design Thinking Foundation: Empathy & Problem Definition", "EXPERIMENT 7 • EMPATHIZE & DEFINE PHASES");

  // Left Card: The Challenge
  s2.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: 1.5, w: 5.6, h: 5.2, r: 0.1,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.border, width: 1.5 }
  });

  s2.addText("🎯 The Core Problem", {
    x: 1.1, y: 1.8, w: 5.0, h: 0.4,
    fontSize: 16, fontFace: "Calibri", color: COLORS.critical, bold: true
  });

  s2.addText([
    { text: "• Academic Cognitive Overload: ", options: { bold: true } },
    { text: "Students manage 6 concurrent subjects (DBMS, OS, CN, Maths, DT, Python) with overlapping assignment deadlines.\n\n" },
    { text: "• Deadline Amnesia: ", options: { bold: true } },
    { text: "Silent calendar apps fail to create sensory urgency, leading to missed lab journals and 11th-hour panic submissions.\n\n" },
    { text: "• Flat Prioritization Fallacy: ", options: { bold: true } },
    { text: "Existing tools treat a 15-minute quiz the same as a 20-hour semester project.\n\n" },
    { text: "• Absence of Subtask Scaffolding: ", options: { bold: true } },
    { text: "Complex milestones lack structured checkpoints, causing procrastination." }
  ], {
    x: 1.1, y: 2.3, w: 5.0, h: 4.2,
    fontSize: 12, fontFace: "Calibri", color: COLORS.textDark, lineSpacing: 18
  });

  // Right Card: Persona & Empathy Map
  s2.addShape(pres.ShapeType.roundRect, {
    x: 6.8, y: 1.5, w: 5.7, h: 5.2, r: 0.1,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.border, width: 1.5 }
  });

  s2.addText("👤 Persona: Arnav Vaidya (SY-C2)", {
    x: 7.1, y: 1.8, w: 5.1, h: 0.4,
    fontSize: 16, fontFace: "Calibri", color: COLORS.primary, bold: true
  });

  s2.addText([
    { text: "• Says: ", options: { bold: true, color: COLORS.accent } },
    { text: "\"I get overwhelmed when multiple lab records and exams fall on the same day.\"\n\n" },
    { text: "• Thinks: ", options: { bold: true, color: COLORS.accent } },
    { text: "\"Which task will impact my grade most if I submit late?\"\n\n" },
    { text: "• Does: ", options: { bold: true, color: COLORS.accent } },
    { text: "Scatters reminders across WhatsApp groups, diary notes, and phone alarms.\n\n" },
    { text: "• Feels: ", options: { bold: true, color: COLORS.accent } },
    { text: "Constant anxiety about unsubmitted practicals and unexpected exams.\n\n" },
    { text: "• User Need Statement: ", options: { bold: true, color: COLORS.primaryDark } },
    { text: "Needs an intelligent system that automatically calculates urgency and sounds distinct audible alerts before it's too late." }
  ], {
    x: 7.1, y: 2.3, w: 5.1, h: 4.2,
    fontSize: 12, fontFace: "Calibri", color: COLORS.textDark, lineSpacing: 17
  });
}

// -------------------------------------------------------------
// SLIDE 3: System Architecture & Layered Data Models
// -------------------------------------------------------------
{
  const s3 = pres.addSlide();
  addSlideHeader(s3, "System Architecture & Layered Data Models", "EXPERIMENT 7 • ARCHITECTURE & SPECIFICATION");

  const layers = [
    {
      title: "1. Presentation Layer (UI/UX)",
      color: "3B82F6",
      desc: "• Responsive Single Page App (HTML5 + Vanilla CSS3)\n• Role-based portals: Student, Faculty, Administrator\n• Pure Web Audio procedural sound generation (Zero MP3s)\n• Real-time progress bars, sliders, and workload charts"
    },
    {
      title: "2. Business Logic & Model Layer",
      color: "1E40AF",
      desc: "• Multi-factor smart priority evaluator (DiffHours, Weightage, Effort)\n• Task lifecycle & status auto-synchronization\n• Subtask progress rollup & recalculation engine\n• 6-stage deadline alert & notification dispatcher"
    },
    {
      title: "3. Local & Cloud Persistence Layer",
      color: "0F172A",
      desc: "• Offline-first browser LocalStorage (`sdap_*` keys)\n• Auto-save state machine with real-time status pills\n• JSON Backup & Restore for complete data portability\n• Express.js REST API + Vercel Serverless ready"
    }
  ];

  layers.forEach((l, idx) => {
    const x = 0.8 + idx * 4.0;
    s3.addShape(pres.ShapeType.roundRect, {
      x: x, y: 1.5, w: 3.7, h: 5.2, r: 0.1,
      fill: { color: COLORS.cardBg },
      line: { color: l.color, width: 2 }
    });

    s3.addShape(pres.ShapeType.roundRect, {
      x: x + 0.2, y: 1.7, w: 3.3, h: 0.6, r: 0.08,
      fill: { color: l.color }
    });

    s3.addText(l.title, {
      x: x + 0.2, y: 1.7, w: 3.3, h: 0.6,
      fontSize: 12, fontFace: "Calibri", color: COLORS.white, bold: true, align: "center", valign: "middle"
    });

    s3.addText(l.desc, {
      x: x + 0.2, y: 2.5, w: 3.3, h: 4.0,
      fontSize: 11, fontFace: "Calibri", color: COLORS.textDark, lineSpacing: 18
    });
  });
}

// -------------------------------------------------------------
// SLIDE 4: Feature 1 — Smart Multi-Factor Priority Levels
// -------------------------------------------------------------
{
  const s4 = pres.addSlide();
  addSlideHeader(s4, "Feature 1: Smart Multi-Factor Priority Levels", "CORE ENHANCEMENT • INTELLIGENT ALGORITHM");

  // Left: Algorithm Explanation
  s4.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: 1.5, w: 6.8, h: 5.2, r: 0.1,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.border, width: 1.5 }
  });

  s4.addText("🧠 Multi-Factor Suggestion Algorithm", {
    x: 1.1, y: 1.7, w: 6.2, h: 0.4,
    fontSize: 15, fontFace: "Calibri", color: COLORS.primary, bold: true
  });

  s4.addText("Priority is not just a date! The prototype evaluates 4 dynamic vectors:", {
    x: 1.1, y: 2.1, w: 6.2, h: 0.4,
    fontSize: 11, fontFace: "Calibri", color: COLORS.textMuted
  });

  const factors = [
    { title: "1. Time Remaining (Hours)", desc: "Calculates precise hours until due date & time relative to simulation baseline." },
    { title: "2. Assignment Weightage", desc: "High (Exam/Major Project), Medium (Journal/Assignment), Low (Activity/Reading)." },
    { title: "3. Estimated Effort (Hours)", desc: "Total estimated hours required compared to available working hours." },
    { title: "4. Current Progress Percentage", desc: "A task due tomorrow at 90% is safe; at 10% it requires immediate escalation." }
  ];

  factors.forEach((f, i) => {
    const y = 2.6 + i * 0.95;
    s4.addShape(pres.ShapeType.roundRect, {
      x: 1.1, y: y, w: 6.2, h: 0.8, r: 0.08,
      fill: { color: COLORS.bgLight },
      line: { color: COLORS.border, width: 1 }
    });

    s4.addText(f.title, {
      x: 1.3, y: y + 0.1, w: 5.8, h: 0.3,
      fontSize: 11, fontFace: "Calibri", color: COLORS.primaryDark, bold: true
    });
    s4.addText(f.desc, {
      x: 1.3, y: y + 0.38, w: 5.8, h: 0.35,
      fontSize: 9.5, fontFace: "Calibri", color: COLORS.textMuted
    });
  });

  // Right: Priority Badges & Actions
  const badges = [
    { level: "Critical", color: COLORS.critical, badge: "🔴 Critical", rule: "Due < 24h & < 75% done, or High Weightage due in ≤ 2 days" },
    { level: "High", color: COLORS.high, badge: "🟠 High", rule: "Due ≤ 3 days with low progress, or remaining effort > 4 hours" },
    { level: "Medium", color: COLORS.medium, badge: "🟡 Medium", rule: "Standard assignments due in 4–7 days with manageable effort" },
    { level: "Low", color: COLORS.low, badge: "🟢 Low", rule: "Minor prep or submissions due > 7 days away or > 80% complete" }
  ];

  badges.forEach((b, i) => {
    const y = 1.5 + i * 1.3;
    s4.addShape(pres.ShapeType.roundRect, {
      x: 7.9, y: y, w: 4.6, h: 1.15, r: 0.1,
      fill: { color: COLORS.cardBg },
      line: { color: b.color, width: 2 }
    });

    s4.addText(b.badge, {
      x: 8.1, y: y + 0.15, w: 4.2, h: 0.35,
      fontSize: 14, fontFace: "Calibri", color: b.color, bold: true
    });

    s4.addText(b.rule, {
      x: 8.1, y: y + 0.52, w: 4.2, h: 0.5,
      fontSize: 9.5, fontFace: "Calibri", color: COLORS.textDark
    });
  });
}

// -------------------------------------------------------------
// SLIDE 5: Features 2 & 3 — Progress Tracking & Subtasks Breakdown
// -------------------------------------------------------------
{
  const s5 = pres.addSlide();
  addSlideHeader(s5, "Features 2 & 3: Progress Tracking & Subtasks Breakdown", "TASK EXECUTION & LIFECYCLE MANAGEMENT");

  // Left Card: 0-100% Progress Tracking
  s5.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: 1.5, w: 5.6, h: 5.2, r: 0.1,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.border, width: 1.5 }
  });

  s5.addText("📊 0–100% Dynamic Progress Tracking", {
    x: 1.1, y: 1.8, w: 5.0, h: 0.4,
    fontSize: 15, fontFace: "Calibri", color: COLORS.primary, bold: true
  });

  s5.addText([
    { text: "• Dual-Input Controls: ", options: { bold: true } },
    { text: "Interactive 0–100% sliders in Add/Edit modals and inline controls directly on task cards.\n\n" },
    { text: "• Status Auto-Synchronization: ", options: { bold: true } },
    { text: "Moving slider to 100% automatically transitions status to Completed. Progress > 0% auto-sets In Progress.\n\n" },
    { text: "• Overdue Guard: ", options: { bold: true } },
    { text: "Any uncompleted task (<100%) past its due date is automatically tagged OVERDUE with High priority escalation (FR13 / TC14).\n\n" },
    { text: "• Visual Progress Feedback: ", options: { bold: true } },
    { text: "Color-coded progress tracks across Dashboard, Task Lists, and Calendar Side Panels." }
  ], {
    x: 1.1, y: 2.3, w: 5.0, h: 4.2,
    fontSize: 11.5, fontFace: "Calibri", color: COLORS.textDark, lineSpacing: 18
  });

  // Right Card: Subtasks Breakdown
  s5.addShape(pres.ShapeType.roundRect, {
    x: 6.8, y: 1.5, w: 5.7, h: 5.2, r: 0.1,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.border, width: 1.5 }
  });

  s5.addText("📋 Subtask Decomposition (e.g. Database Project)", {
    x: 7.1, y: 1.8, w: 5.1, h: 0.4,
    fontSize: 15, fontFace: "Calibri", color: COLORS.accent, bold: true
  });

  s5.addText("Deconstructs daunting milestones into actionable steps:", {
    x: 7.1, y: 2.2, w: 5.1, h: 0.3,
    fontSize: 10.5, fontFace: "Calibri", color: COLORS.textMuted
  });

  const subtasks = [
    { name: "1. Research & Problem Definition", status: "Completed (20%)", done: true },
    { name: "2. Schema Design & ER Modeling", status: "Completed (40%)", done: true },
    { name: "3. Implementation & SQL Queries", status: "Completed (60%)", done: true },
    { name: "4. Verification & Testing", status: "Pending (80%)", done: false },
    { name: "5. Final Documentation & Report", status: "Pending (100%)", done: false }
  ];

  subtasks.forEach((st, idx) => {
    const y = 2.6 + idx * 0.72;
    s5.addShape(pres.ShapeType.roundRect, {
      x: 7.1, y: y, w: 5.1, h: 0.6, r: 0.06,
      fill: { color: st.done ? "ECFDF5" : COLORS.bgLight },
      line: { color: st.done ? COLORS.low : COLORS.border, width: 1 }
    });

    s5.addText(`${st.done ? "✓" : "○"} ${st.name}`, {
      x: 7.3, y: y + 0.12, w: 3.5, h: 0.35,
      fontSize: 10, fontFace: "Calibri", color: st.done ? COLORS.low : COLORS.textDark, bold: st.done
    });

    s5.addText(st.status, {
      x: 10.5, y: y + 0.12, w: 1.6, h: 0.35,
      fontSize: 9, fontFace: "Calibri", color: COLORS.textMuted, align: "right"
    });
  });

  s5.addText("💡 Subtask Progress Auto-Rollup: Checking 3 of 5 subtasks automatically computes and sets the parent task progress to 60%.", {
    x: 7.1, y: 6.2, w: 5.1, h: 0.45,
    fontSize: 9.5, fontFace: "Calibri", color: COLORS.primary, bold: true
  });
}

// -------------------------------------------------------------
// SLIDE 6: Feature 4 — Web Audio Procedural Sound Alerts Engine
// -------------------------------------------------------------
{
  const s6 = pres.addSlide();
  addSlideHeader(s6, "Feature 4: Upcoming Deadline Procedural Sound Engine", "ACOUSTIC SENSORY URGENCY • WEB AUDIO API");

  // Web Audio Architecture Highlight
  s6.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: 1.5, w: 11.7, h: 1.1, r: 0.1,
    fill: { color: "EFF6FF" },
    line: { color: COLORS.accent, width: 1.5 }
  });

  s6.addText("🔊 Pure Synthesized Web Audio Engine (Zero Latency, 100% Offline)", {
    x: 1.1, y: 1.65, w: 11.0, h: 0.35,
    fontSize: 14, fontFace: "Calibri", color: COLORS.primary, bold: true
  });

  s6.addText("Uses native browser AudioContext oscillators with mathematical frequencies. No MP3 downloads, no network latency. Includes asynchronous AudioContext unlock on first user gesture and an in-memory 16-bit PCM WAV fallback.", {
    x: 1.1, y: 2.0, w: 11.0, h: 0.45,
    fontSize: 10.5, fontFace: "Calibri", color: COLORS.textDark
  });

  // 6 Tones Cards Grid (2 rows x 3 columns)
  const tones = [
    { stage: "7 Days Before", tone: "Soft Harmonic Chime", desc: "Four-note chord (C5-E5-G5-C6) with gentle exponential decay. Friendly reminder.", icon: "🔔", color: "3B82F6" },
    { stage: "3 Days Before", tone: "Two-Tone Reminder", desc: "Pleasant interval (A4 -> E5) doorbell chime signaling upcoming due dates.", icon: "🎵", color: "6366F1" },
    { stage: "24 Hours Before", tone: "Strong Resonant Bell", desc: "Harmonic dual-tone (D5 + A5) with solid gain, commanding student focus.", icon: "⚡", color: "F59E0B" },
    { stage: "2 Hours Before", tone: "Urgent Triple Beep", desc: "Sharp square wave beeps (988 Hz high B5) alerting imminent submission window.", icon: "⏰", color: "EA580C" },
    { stage: "At Deadline", tone: "Repeating Alarm", desc: "Continuous dual-tone alarm repeating every 1.6s with on-screen dismissal banner.", icon: "🚨", color: "DC2626" },
    { stage: "After Deadline", tone: "Low Overdue Tone", desc: "Descending sawtooth wave (F4 -> F3) indicating task has slipped into overdue.", icon: "⚠️", color: "7F1D1D" }
  ];

  tones.forEach((t, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.8 + col * 4.0;
    const y = 2.8 + row * 1.95;

    s6.addShape(pres.ShapeType.roundRect, {
      x: x, y: y, w: 3.7, h: 1.8, r: 0.08,
      fill: { color: COLORS.cardBg },
      line: { color: t.color, width: 1.5 }
    });

    s6.addText(`${t.icon} ${t.stage}`, {
      x: x + 0.15, y: y + 0.15, w: 3.4, h: 0.3,
      fontSize: 12, fontFace: "Calibri", color: t.color, bold: true
    });

    s6.addText(t.tone, {
      x: x + 0.15, y: y + 0.45, w: 3.4, h: 0.25,
      fontSize: 10, fontFace: "Calibri", color: COLORS.primaryDark, bold: true
    });

    s6.addText(t.desc, {
      x: x + 0.15, y: y + 0.72, w: 3.4, h: 0.95,
      fontSize: 9, fontFace: "Calibri", color: COLORS.textMuted
    });
  });
}

// -------------------------------------------------------------
// SLIDE 7: Feature 5 — Sound & Notification Settings Panel
// -------------------------------------------------------------
{
  const s7 = pres.addSlide();
  addSlideHeader(s7, "Feature 5: Sound & Notification Preferences Hub", "USER CONTROLLABILITY & ACCESSIBILITY");

  const settingsCards = [
    {
      title: "🎛️ Master Controls & Volume",
      points: [
        "Master Sound Toggle: Instant global mute/unmute.",
        "Desktop Notification Toggle: Native browser OS alerts with task title, due time, and priority.",
        "Master Volume Slider: 0–100% logarithmic gain control with real-time numeric readout.",
        "Play Test Alert Button: One-click acoustic verification for immediate sound check."
      ]
    },
    {
      title: "🎵 Tone Flavors & Custom Timing",
      points: [
        "Tone Flavor Selector: Choose preferred audio character (Chime, Two-Tone, Bell, Urgent Beep).",
        "Preview Button (▶ Listen): Audition tones before setting them.",
        "Custom Timing Checkboxes: Enable/disable notifications for specific intervals (7d, 3d, 24h, 2h, deadline).",
        "Deduplication Engine: `sdap_notified_stages` prevents repetitive sound spamming."
      ]
    },
    {
      title: "📚 Per-Subject Audio & Snooze",
      points: [
        "Granular Subject Toggles: Selectively enable or silence alerts per academic subject (DBMS, OS, CN, Maths, DT, Python).",
        "Do Not Disturb (DND): One-click study quiet mode.",
        "Flexible Snooze Intervals: Postpone deadline alerts for 10 min, 1 hour, or tomorrow morning.",
        "Auto-rearm: Snoozed alerts reappear automatically when timer elapses (TC15)."
      ]
    }
  ];

  settingsCards.forEach((c, idx) => {
    const x = 0.8 + idx * 4.0;
    s7.addShape(pres.ShapeType.roundRect, {
      x: x, y: 1.5, w: 3.7, h: 5.2, r: 0.1,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.border, width: 1.5 }
    });

    s7.addText(c.title, {
      x: x + 0.2, y: 1.8, w: 3.3, h: 0.4,
      fontSize: 13, fontFace: "Calibri", color: COLORS.primary, bold: true
    });

    s7.addText(c.points.map(p => `• ${p}\n\n`).join(""), {
      x: x + 0.2, y: 2.3, w: 3.3, h: 4.2,
      fontSize: 10.5, fontFace: "Calibri", color: COLORS.textDark, lineSpacing: 16
    });
  });
}

// -------------------------------------------------------------
// SLIDE 8: Feature 6 — Enhanced Student Dashboard
// -------------------------------------------------------------
{
  const s8 = pres.addSlide();
  addSlideHeader(s8, "Feature 6: Multi-Dimensional Student Dashboard", "ACTIONABLE METRICS & WORKLOAD BALANCING");

  const dashWidgets = [
    {
      title: "🎯 Today's Focus (Top 3 Urgent Tasks)",
      desc: "Dynamically isolates the 3 most pressing assignments based on proximity to deadline and remaining effort hours. Provides quick '✓ Complete' action buttons."
    },
    {
      title: "⏱️ Weekly Workload Indicator (Mon–Sun)",
      desc: "Visual bar chart plotting estimated academic hours for every day of the week. Days exceeding the 4-hour fatigue threshold are flagged with red 'Overload' warnings."
    },
    {
      title: "📚 Subject-Wise Progress Breakdown",
      desc: "Tracks granular completion percentages for all 6 semester subjects, displaying completed vs. total counts and individual subject color codes."
    },
    {
      title: "⚠️ Overdue Escalation Banner",
      desc: "Floating warning alert for past-due submissions (e.g., CN Lab Record). Includes 1-click 'Resolve Now' and 'Snooze Alert' actions (TC14)."
    }
  ];

  dashWidgets.forEach((w, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.8 + col * 6.0;
    const y = 1.5 + row * 2.65;

    s8.addShape(pres.ShapeType.roundRect, {
      x: x, y: y, w: 5.7, h: 2.45, r: 0.1,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.border, width: 1.5 }
    });

    s8.addText(w.title, {
      x: x + 0.25, y: y + 0.2, w: 5.2, h: 0.35,
      fontSize: 14, fontFace: "Calibri", color: COLORS.primaryDark, bold: true
    });

    s8.addText(w.desc, {
      x: x + 0.25, y: y + 0.65, w: 5.2, h: 1.6,
      fontSize: 11, fontFace: "Calibri", color: COLORS.textDark, lineSpacing: 18
    });
  });
}

// -------------------------------------------------------------
// SLIDE 9: Feature 7 & Verification — Calendar & 15/15 Automated Tests
// -------------------------------------------------------------
{
  const s9 = pres.addSlide();
  addSlideHeader(s9, "Calendar Enhancements & 15/15 Automated Test Verification", "EXPERIMENTS 9 & 10 • QUALITY ASSURANCE");

  // Left: Calendar Features
  s9.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: 1.5, w: 5.2, h: 5.2, r: 0.1,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.border, width: 1.5 }
  });

  s9.addText("📅 Calendar Enhancements (Feature 7)", {
    x: 1.0, y: 1.7, w: 4.8, h: 0.4,
    fontSize: 14, fontFace: "Calibri", color: COLORS.primary, bold: true
  });

  s9.addText([
    { text: "• Multi-Deadline Day Highlights: ", options: { bold: true } },
    { text: "Dates with multiple submissions receive `.is-multi-deadline` styling with task count badges.\n\n" },
    { text: "• High-Contrast Letter Markers: ", options: { bold: true } },
    { text: "Accessible markers ('C' for Critical, 'H' for High, 'M' for Medium, 'L' for Low, '!' for Overdue) readable without color dependence (TC12).\n\n" },
    { text: "• Type Identification: ", options: { bold: true } },
    { text: "Visual cues for Exams (📋), Lab Records (🔬), Quizzes (❓), and Assignments (📝).\n\n" },
    { text: "• Interactive Day Inspection: ", options: { bold: true } },
    { text: "Clicking any date filters the slide-out detail panel displaying subtask counts, hours, and edit shortcuts." }
  ], {
    x: 1.0, y: 2.2, w: 4.8, h: 4.3,
    fontSize: 11, fontFace: "Calibri", color: COLORS.textDark, lineSpacing: 16
  });

  // Right: Automated Test Results Table
  s9.addShape(pres.ShapeType.roundRect, {
    x: 6.3, y: 1.5, w: 6.2, h: 5.2, r: 0.1,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.low, width: 2 }
  });

  s9.addText("🧪 Automated Test Suite Results (15/15 Passing - 100%)", {
    x: 6.5, y: 1.7, w: 5.8, h: 0.4,
    fontSize: 13, fontFace: "Calibri", color: COLORS.low, bold: true
  });

  const testRows = [
    ["Test ID", "Requirement / Verification", "Result"],
    ["TC01 - TC02", "Valid/Invalid Authentication & Roles", "PASS ✓"],
    ["TC03 - TC05", "Task Addition, Mandatory Validation, Past Date Check", "PASS ✓"],
    ["TC06 - TC07", "Critical/High Priority Tags & Calendar Side Panel", "PASS ✓"],
    ["TC08 - TC09", "Status Sync, Progress % & Alert Actions (Open/Dismiss)", "PASS ✓"],
    ["TC10 - TC11", "Navigation History & Full E2E Workflow Lifecycle", "PASS ✓"],
    ["TC12", "Accessibility: H/M/L Letter Markers for Color-Blind Users", "PASS ✓"],
    ["TC13", "Role Switch & Secure Logout Flow", "PASS ✓"],
    ["TC14 - TC15", "Overdue Banner Display & Snooze Timer Re-alert", "PASS ✓"]
  ];

  const formattedTestRows = testRows.map((row, rIdx) => {
    return row.map((cell, cIdx) => ({
      text: cell,
      options: {
        fill: { color: rIdx === 0 ? "F1F5F9" : rIdx % 2 === 0 ? "F8FAFC" : "FFFFFF" },
        bold: rIdx === 0 || cIdx === 0 || cIdx === 2,
        color: cIdx === 2 && rIdx > 0 ? COLORS.low : COLORS.textDark,
        align: cIdx === 2 ? "center" : "left",
        fontSize: 9,
        fontFace: "Calibri"
      }
    }));
  });

  s9.addTable(formattedTestRows, {
    x: 6.5, y: 2.2, w: 5.8,
    colW: [1.3, 3.5, 1.0],
    border: { color: COLORS.border, pt: 1 }
  });

  s9.addText("✅ All unit, integration, and UI accessibility assertions verified automatically in CLI and browser.", {
    x: 6.5, y: 6.1, w: 5.8, h: 0.4,
    fontSize: 9.5, fontFace: "Calibri", color: COLORS.low, bold: true
  });
}

// -------------------------------------------------------------
// SLIDE 10: Conclusion, Academic Impact & Future Roadmap
// -------------------------------------------------------------
{
  const s10 = pres.addSlide();
  addSlideHeader(s10, "Academic Impact, Deployment & Future Roadmap", "CONCLUSIONS & DEMONSTRATION");

  const pillars = [
    {
      title: "📈 Demonstrated Impact",
      points: [
        "Eliminated missed deadlines through 6-stage sensory auditory alerts.",
        "Empowered student agency with realistic workload distribution (max 4h/day).",
        "Subtask scaffolding reduced academic procrastination and overwhelm.",
        "Zero external audio dependencies ensured seamless 100% offline reliability."
      ]
    },
    {
      title: "🚀 Deployment & Architecture",
      points: [
        "Vercel Cloud Deployment configured via `vercel.json` with production build scripts.",
        "Offline storage resilience with JSON backup/restore guarantees data safety.",
        "Cross-platform responsive design tested across desktop, tablet, and mobile views.",
        "Full compliance with Experiments 7–10 of CS2308L Design Thinking manual."
      ]
    },
    {
      title: "🔮 Future Roadmap",
      points: [
        "Service Worker Push Notifications for background OS alerts while browser is closed.",
        "Bidirectional Google Calendar & Canvas/Moodle LMS API synchronization.",
        "AI-Powered Study Plan Generator utilizing Gemini / LLM scheduling recommendations.",
        "Peer Collaborative Study Groups with shared assignment milestone tracking."
      ]
    }
  ];

  pillars.forEach((p, idx) => {
    const x = 0.8 + idx * 4.0;
    s10.addShape(pres.ShapeType.roundRect, {
      x: x, y: 1.5, w: 3.7, h: 5.2, r: 0.1,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.border, width: 1.5 }
    });

    s10.addText(p.title, {
      x: x + 0.2, y: 1.8, w: 3.3, h: 0.4,
      fontSize: 13, fontFace: "Calibri", color: COLORS.primary, bold: true
    });

    s10.addText(p.points.map(pt => `• ${pt}\n\n`).join(""), {
      x: x + 0.2, y: 2.3, w: 3.3, h: 4.2,
      fontSize: 10.5, fontFace: "Calibri", color: COLORS.textDark, lineSpacing: 17
    });
  });
}

// Save Presentation
const outputFile = "Student_Deadline_Academic_Planner.pptx";
pres.writeFile({ fileName: outputFile })
  .then(fileName => {
    console.log(`🎉 Successfully generated 10-slide PowerPoint presentation: ${fileName}`);
  })
  .catch(err => {
    console.error("Error generating presentation:", err);
    process.exit(1);
  });
