/**
 * Sound & Notification Engine using Web Audio API & Web Notification API
 * CS2308L Design Thinking Lab - Student Deadline & Academic Planner
 * Department of Computer Engineering - JSPM's RSCOE Pune
 * 
 * Features:
 * - Pure Web Audio API synthesis (Zero MP3 files, zero latency, 100% offline).
 * - Automatic & Manual AudioContext unlock (resolves browser autoplay policy).
 * - High-clarity, audible procedural tones for:
 *   1. 7-day chime (soft harmonic chord)
 *   2. 3-day reminder (pleasant two-tone)
 *   3. 24-hour alert (strong resonant bell)
 *   4. 2-hour alert (urgent triple beep)
 *   5. Deadline alert (repeating alarm until dismissed with UI banner)
 *   6. Overdue tone (low descending warning)
 * - Synthesized WAV fallback for extreme browser compatibility.
 * - Browser visual Notification API integration.
 * - LocalStorage stage deduplication (prevents re-alerting same task stage).
 * - Volume control, Do-Not-Disturb (DND), and per-subject sound filters.
 */

class SoundAlertService {
  constructor() {
    this.audioCtx = null;
    this.isUnlocked = false;
    this.activeAlarmInterval = null;
    this.alarmActive = false;

    // Local storage keys
    this.settingsKey = "sdap_sound_settings";
    this.notifiedKey = "sdap_notified_stages";

    this.defaultSettings = {
      soundEnabled: true,
      notificationsEnabled: true,
      volume: 85, // 0 - 100
      preferredTone: "chime", // chime, beep, bell, urgent, alarm
      dndEnabled: false,
      timings: {
        sevenDays: true,
        threeDays: true,
        oneDay: true,
        twoHours: true,
        atDeadline: true,
        overdue: true
      },
      subjectMutes: {}, // e.g. { "DBMS": false, "OS": true }
      snoozeMinutes: 60
    };

    this.settings = this.loadSettings();
    this.notifiedStages = this.loadNotifiedStages();

    // Auto-setup unlock listeners on first user gesture
    this.setupUnlockListeners();
  }

  loadSettings() {
    try {
      const data = localStorage.getItem(this.settingsKey);
      return data ? { ...this.defaultSettings, ...JSON.parse(data) } : { ...this.defaultSettings };
    } catch (e) {
      return { ...this.defaultSettings };
    }
  }

  saveSettings() {
    try {
      localStorage.setItem(this.settingsKey, JSON.stringify(this.settings));
    } catch (e) {
      console.warn("Could not save sound settings:", e);
    }
  }

  loadNotifiedStages() {
    try {
      const data = localStorage.getItem(this.notifiedKey);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  saveNotifiedStages() {
    try {
      localStorage.setItem(this.notifiedKey, JSON.stringify(this.notifiedStages));
    } catch (e) {
      console.warn("Could not save notified stages:", e);
    }
  }

  setupUnlockListeners() {
    const unlock = async () => {
      await this.unlockAudio();
    };

    ["click", "keydown", "touchstart", "mousedown"].forEach(evt => {
      document.addEventListener(evt, unlock, { once: false, passive: true });
    });
  }

  ensureAudioContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    return this.audioCtx;
  }

  async unlockAudio() {
    this.ensureAudioContext();
    if (this.audioCtx) {
      if (this.audioCtx.state === "suspended") {
        try {
          await this.audioCtx.resume();
        } catch (e) {
          console.warn("AudioContext resume warning:", e);
        }
      }
      if (this.audioCtx.state === "running") {
        this.isUnlocked = true;
        this.updateAudioStatusUI(true);
      }
    }
    return this.audioCtx;
  }

  updateAudioStatusUI(unlocked) {
    const label = document.getElementById("sound-status-label");
    const btn = document.getElementById("btn-enable-sound-alerts");
    if (label && unlocked) {
      label.textContent = "Audio Ready (Test 🔔)";
    }
    if (btn && unlocked) {
      btn.classList.remove("btn-secondary");
      btn.classList.add("btn-outline");
      btn.style.borderColor = "var(--priority-low)";
      btn.style.color = "var(--priority-low)";
    }
  }

  getMasterVolume() {
    if (!this.settings.soundEnabled || this.settings.dndEnabled) return 0;
    const vol = (typeof this.settings.volume === "number") ? this.settings.volume : 85;
    return Math.max(0, Math.min(1, vol / 100));
  }

  // -------------------------------------------------------------
  // Synthesized WAV Audio Fallback (Guaranteed to play anywhere)
  // -------------------------------------------------------------
  playWavFallback(frequency = 587, durationSec = 0.4, type = "sine") {
    try {
      const sampleRate = 22050;
      const numSamples = Math.floor(sampleRate * durationSec);
      const buffer = new Uint8Array(44 + numSamples * 2);
      const view = new DataView(buffer.buffer);

      // Write WAV Header
      const writeString = (offset, str) => {
        for (let i = 0; i < str.length; i++) buffer[offset + i] = str.charCodeAt(i);
      };
      writeString(0, "RIFF");
      view.setUint32(4, 36 + numSamples * 2, true);
      writeString(8, "WAVE");
      writeString(12, "fmt ");
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true); // PCM
      view.setUint16(22, 1, true); // Mono
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true); // 16-bit
      writeString(36, "data");
      view.setUint32(40, numSamples * 2, true);

      // Generate waveform
      const vol = this.getMasterVolume();
      const amplitude = 32760 * vol * 0.7;
      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        const decay = Math.exp(-3.5 * (i / numSamples)); // natural decay
        let sample = 0;
        if (type === "square") {
          sample = Math.sin(2 * Math.PI * frequency * t) >= 0 ? 1 : -1;
        } else {
          sample = Math.sin(2 * Math.PI * frequency * t);
        }
        view.setInt16(44 + i * 2, Math.floor(sample * amplitude * decay), true);
      }

      const blob = new Blob([buffer], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.volume = Math.max(0.1, vol);
      audio.play().catch(e => console.warn("Fallback audio play suppressed:", e));
    } catch (err) {
      console.warn("WAV synthesis fallback error:", err);
    }
  }

  // -------------------------------------------------------------
  // Web Audio Procedural Sound Generators
  // -------------------------------------------------------------

  /**
   * 1. 7 Days Before: Soft Harmonic Chime (C5 -> E5 -> G5 -> C6)
   */
  async playSoftChime() {
    const vol = this.getMasterVolume();
    if (vol <= 0) return;
    const ctx = await this.unlockAudio();
    if (!ctx || ctx.state !== "running") {
      this.playWavFallback(523.25, 0.4);
      return;
    }

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0.0001, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(vol * 0.45, now + idx * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.95);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 1.0);
    });
  }

  /**
   * 2. 3 Days Before: Two-tone Pleasant Reminder (A4 -> C#5)
   */
  async playTwoTone() {
    const vol = this.getMasterVolume();
    if (vol <= 0) return;
    const ctx = await this.unlockAudio();
    if (!ctx || ctx.state !== "running") {
      this.playWavFallback(659.25, 0.35);
      return;
    }

    const now = ctx.currentTime;
    const notes = [440.0, 659.25]; // A4, E5 (pleasant musical fifth)

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.18);

      gain.gain.setValueAtTime(0.0001, now + idx * 0.18);
      gain.gain.linearRampToValueAtTime(vol * 0.55, now + idx * 0.18 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.18 + 0.75);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.18);
      osc.stop(now + idx * 0.18 + 0.8);
    });
  }

  /**
   * 3. 24 Hours Before: Stronger Resonant Alert (D5 + A5 Bell)
   */
  async playStrongAlert() {
    const vol = this.getMasterVolume();
    if (vol <= 0) return;
    const ctx = await this.unlockAudio();
    if (!ctx || ctx.state !== "running") {
      this.playWavFallback(880.0, 0.5);
      return;
    }

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "triangle";
    osc2.type = "sine";

    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc2.frequency.setValueAtTime(880.0, now);  // A5

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(vol * 0.65, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.15);
    osc2.stop(now + 1.15);
  }

  /**
   * 4. 2 Hours Before: Urgent Triple Beep
   */
  async playUrgentTripleBeep() {
    const vol = this.getMasterVolume();
    if (vol <= 0) return;
    const ctx = await this.unlockAudio();
    if (!ctx || ctx.state !== "running") {
      this.playWavFallback(880.0, 0.15, "square");
      return;
    }

    const now = ctx.currentTime;
    const beeps = [0, 0.15, 0.30];

    beeps.forEach(delay => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(987.77, now + delay); // B5 high alert

      gain.gain.setValueAtTime(0.0001, now + delay);
      gain.gain.linearRampToValueAtTime(vol * 0.45, now + delay + 0.02);
      gain.gain.linearRampToValueAtTime(0.0001, now + delay + 0.10);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.11);
    });
  }

  /**
   * 5. At Deadline: Repeating Alarm (loops until dismissed)
   */
  async startRepeatingAlarm(taskTitle = "Assignment Deadline") {
    if (this.alarmActive) return;
    this.alarmActive = true;

    const playBeepPair = async () => {
      if (!this.alarmActive) return;
      const vol = this.getMasterVolume();
      if (vol <= 0) return;

      const ctx = await this.unlockAudio();
      if (!ctx || ctx.state !== "running") {
        this.playWavFallback(988, 0.2);
        return;
      }

      const now = ctx.currentTime;
      [0, 0.18].forEach((t, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(i === 0 ? 880 : 1046.5, now + t); // A5 -> C6

        gain.gain.setValueAtTime(0.0001, now + t);
        gain.gain.linearRampToValueAtTime(vol * 0.5, now + t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.14);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + t);
        osc.stop(now + t + 0.15);
      });
    };

    // Play immediately and repeat every 1.6 seconds
    await playBeepPair();
    this.activeAlarmInterval = setInterval(() => playBeepPair(), 1600);

    // Show floating on-screen dismissal banner
    this.showAlarmDismissBanner(taskTitle);
  }

  stopAlarm() {
    this.alarmActive = false;
    if (this.activeAlarmInterval) {
      clearInterval(this.activeAlarmInterval);
      this.activeAlarmInterval = null;
    }
    const banner = document.getElementById("active-alarm-banner");
    if (banner) banner.remove();
  }

  showAlarmDismissBanner(taskTitle) {
    const existing = document.getElementById("active-alarm-banner");
    if (existing) existing.remove();

    const banner = document.createElement("div");
    banner.id = "active-alarm-banner";
    banner.innerHTML = `
      <div class="alarm-floating-box">
        <div class="alarm-pulsing-icon">🚨</div>
        <div class="alarm-text">
          <strong>DEADLINE REACHED!</strong>
          <span>${taskTitle} is due right now.</span>
        </div>
        <button class="btn btn-danger btn-sm" id="btn-dismiss-sound-alarm">Silence Alarm ✕</button>
      </div>
    `;
    document.body.appendChild(banner);

    document.getElementById("btn-dismiss-sound-alarm")?.addEventListener("click", () => {
      this.stopAlarm();
    });
  }

  /**
   * 6. After Deadline: Low Overdue Warning Tone
   */
  async playOverdueTone() {
    const vol = this.getMasterVolume();
    if (vol <= 0) return;
    const ctx = await this.unlockAudio();
    if (!ctx || ctx.state !== "running") {
      this.playWavFallback(220, 0.6, "square");
      return;
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(349.23, now); // F4
    osc.frequency.exponentialRampToValueAtTime(174.61, now + 0.7); // Descend to F3

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(vol * 0.55, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.9);
  }

  /**
   * Test Sound Trigger for Settings & Topbar
   */
  async playTestSound(toneName = null) {
    await this.unlockAudio();
    const tone = toneName || this.settings.preferredTone || "chime";
    switch (tone) {
      case "chime":
        await this.playSoftChime();
        break;
      case "beep":
        await this.playTwoTone();
        break;
      case "bell":
        await this.playStrongAlert();
        break;
      case "urgent":
        await this.playUrgentTripleBeep();
        break;
      case "alarm":
        await this.startRepeatingAlarm("Test Assignment Alert");
        setTimeout(() => this.stopAlarm(), 3400);
        break;
      case "overdue":
        await this.playOverdueTone();
        break;
      default:
        await this.playSoftChime();
    }
  }

  // -------------------------------------------------------------
  // Browser Visual Notifications Integration
  // -------------------------------------------------------------

  async requestNotificationPermission() {
    if (!("Notification" in window)) {
      return { supported: false, permission: "unsupported" };
    }

    try {
      const permission = await Notification.requestPermission();
      this.settings.notificationsEnabled = (permission === "granted");
      this.saveSettings();
      return { supported: true, permission };
    } catch (e) {
      return { supported: true, permission: Notification.permission };
    }
  }

  showBrowserNotification(title, options = {}) {
    if (!this.settings.notificationsEnabled || this.settings.dndEnabled) return;
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    try {
      new Notification(title, {
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">⏰</text></svg>',
        ...options
      });
    } catch (e) {
      console.warn("Notification error:", e);
    }
  }

  // -------------------------------------------------------------
  // Deadline Evaluation & Scheduled Sound Trigger
  // -------------------------------------------------------------

  checkTaskDeadlines(tasks, baseDate) {
    if (this.settings.dndEnabled || !this.settings.soundEnabled) return;

    const base = new Date(baseDate || "2026-10-26T10:00:00");

    tasks.forEach(task => {
      // Skip completed tasks
      if (task.status === "Completed" || task.progressPercent >= 100) return;

      // Check per-subject mute
      if (this.settings.subjectMutes && this.settings.subjectMutes[task.subject] === false) {
        return;
      }

      // Calculate time remaining in hours
      const [year, month, day] = task.dueDate.split("-").map(Number);
      const [hours, minutes] = (task.dueTime || "23:59").split(":").map(Number);
      const due = new Date(year, month - 1, day, hours, minutes);
      const diffMs = due.getTime() - base.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      // 1. Overdue (negative hours, up to 48 hours overdue)
      if (diffHours < 0 && diffHours >= -48) {
        this.triggerStageAlert(task, "overdue", "Overdue Warning", () => this.playOverdueTone(), "Task is overdue!");
      }
      // 2. At Deadline (-0.1 to 0.25 hours)
      else if (diffHours >= -0.1 && diffHours <= 0.25) {
        this.triggerStageAlert(task, "at_deadline", "Deadline Alarm", () => this.startRepeatingAlarm(task.title), "Deadline reached! Submit now.");
      }
      // 3. 2 hours before (diffHours between 1.5 and 2.5)
      else if (diffHours <= 2.5 && diffHours >= 1.5) {
        this.triggerStageAlert(task, "2_hours", "Urgent Triple Beep", () => this.playUrgentTripleBeep(), `Due in 2 hours (${task.dueTime})`);
      }
      // 4. 24 hours before (diffHours between 22 and 26)
      else if (diffHours <= 26 && diffHours >= 22) {
        this.triggerStageAlert(task, "24_hours", "Strong Alert", () => this.playStrongAlert(), `Due tomorrow at ${task.dueTime}`);
      }
      // 5. 3 days before (diffHours between 68 and 74)
      else if (diffHours <= 74 && diffHours >= 68) {
        this.triggerStageAlert(task, "3_days", "Two-Tone Reminder", () => this.playTwoTone(), `Due in 3 days (${task.dueDate})`);
      }
      // 6. 7 days before (diffHours between 162 and 172)
      else if (diffHours <= 172 && diffHours >= 162) {
        this.triggerStageAlert(task, "7_days", "Soft Chime", () => this.playSoftChime(), `Due in 7 days (${task.dueDate})`);
      }
    });
  }

  triggerStageAlert(task, stageCode, stageName, soundFn, timeText) {
    const stageKey = `${task.id}_${stageCode}`;
    if (this.notifiedStages[stageKey]) {
      return; // Already notified for this stage!
    }

    // Check if user enabled timing in settings
    const timingMap = {
      sevenDays: "7_days",
      threeDays: "3_days",
      oneDay: "24_hours",
      twoHours: "2_hours",
      atDeadline: "at_deadline",
      overdue: "overdue"
    };

    let timingEnabled = true;
    for (const [key, val] of Object.entries(timingMap)) {
      if (val === stageCode && this.settings.timings[key] === false) {
        timingEnabled = false;
        break;
      }
    }
    if (!timingEnabled) return;

    // Record stage as notified
    this.notifiedStages[stageKey] = new Date().toISOString();
    this.saveNotifiedStages();

    // Play Sound
    if (this.settings.soundEnabled) {
      soundFn();
    }

    // Browser Notification
    this.showBrowserNotification(`⏰ ${task.title} [${task.subject}]`, {
      body: `${timeText} • Priority: ${task.priority || "High"}\nDue: ${task.dueTime}`,
      tag: stageKey
    });

    console.log(`🔔 [SoundAlert] Dispatched ${stageName} for task "${task.title}" (${timeText})`);
  }

  resetNotificationStage(taskId) {
    Object.keys(this.notifiedStages).forEach(k => {
      if (k.startsWith(taskId + "_")) delete this.notifiedStages[k];
    });
    this.saveNotifiedStages();
  }
}

// Global instance
if (typeof window !== "undefined") {
  window.soundAlertService = new SoundAlertService();
}
