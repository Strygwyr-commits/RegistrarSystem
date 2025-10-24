// filename: js/main.js
// Initialize page-specific modules
document.addEventListener("DOMContentLoaded", () => {
  // registration page
  if (document.querySelector("form.form-grid")) {
    setTimeout(() => window.regModule?.initRegistrationPage?.(), 0);
  }

  // schedule page
  if (document.querySelector("h2.page-title") && document.querySelector(".page-title").textContent.includes("Schedules")) {
    setTimeout(() => window.scheduleModule?.renderSchedulePage?.(), 0);
  }

  // grades page
  if (document.querySelector("h2.page-title") && document.querySelector(".page-title").textContent.includes("Grades")) {
    setTimeout(() => window.gradesModule?.renderGradesPage?.(), 0);
  }

  // small enhancement: if there are static table rows (from your HTML) migrate them to storage so they persist
  // migrate schedules from the schedule table (only when storage is empty)
  try {
    const existingSchedules = storage.getCollection("schedules");
    if (!existingSchedules.length && document.location.href.includes("schedule.html")) {
      // read static rows
      const rows = document.querySelectorAll(".data-table tbody tr");
      rows.forEach(r => {
        const cols = r.querySelectorAll("td");
        if (cols.length >= 4) {
          // try parse time text like "8:00–9:00" in first column
          const timeText = cols[0].textContent.trim();
          const [startText, endText] = timeText.split("–").map(s => s.trim());
          const today = new Date().toISOString().slice(0,10);
          const startISO = new Date(`${today}T${startText}:00`).toISOString();
          const endISO = new Date(`${today}T${endText}:00`).toISOString();
          const rec = {
            title: cols[1].textContent.trim(),
            room: cols[2].textContent.trim(),
            instructor: cols[3].textContent.trim(),
            start: startISO,
            end: endISO,
            createdAt: new Date().toISOString()
          };
          storage.upsert("schedules", rec);
        }
      });
    }

    // migrate grades from static table (on grades.html)
    const existingGrades = storage.getCollection("grades");
    if (!existingGrades.length && document.location.href.includes("grades.html")) {
      const rows = document.querySelectorAll(".data-table tbody tr");
      rows.forEach(r => {
        const cols = r.querySelectorAll("td");
        if (cols.length >= 4) {
          const rec = {
            subject: cols[0].textContent.trim(),
            score: Number(cols[1].textContent.trim()),
            credits: Number(cols[2].textContent.trim()),
            remarks: cols[3].textContent.trim(),
            studentEmail: "sample@student.local",
            createdAt: new Date().toISOString()
          };
          storage.upsert("grades", rec);
        }
      });
    }
  } catch (e) {
    console.warn("migration error", e);
  }
});
