// filename: js/schedule.js
// Adds a small UI for adding/editing/deleting schedules and renders the schedule table.
(function () {

  function timeOverlap(aStart, aEnd, bStart, bEnd) {
    return (aStart < bEnd) && (bStart < aEnd);
  }

  function renderSchedulePage() {
    const page = document.querySelector(".page");
    if (!page) return;

    // Attach Add Schedule button above table
    const heading = page.querySelector(".card-head") || page.querySelector("h2.page-title");
    const addBtn = document.createElement("button");
    addBtn.className = "btn primary";
    addBtn.textContent = "Add Schedule";
    addBtn.style.marginLeft = "12px";
    if (heading && heading.parentNode) heading.parentNode.insertBefore(addBtn, heading.nextSibling);

    // find table body
    const tbody = page.querySelector(".data-table tbody");
    if (!tbody) return;

    function loadAndRender() {
      const schedules = storage.getCollection("schedules");
      tbody.innerHTML = "";
      if (!schedules.length) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="4" style="opacity:.7">No schedules yet — click Add Schedule</td>`;
        tbody.appendChild(tr);
        return;
      }

      schedules.forEach(s => {
        const tr = document.createElement("tr");
        const start = new Date(s.start);
        const end = new Date(s.end);
        tr.innerHTML = `
          <td>${start.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}–${end.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
          <td>${s.title}</td>
          <td>${s.room || ""}</td>
          <td>
            ${s.instructor || ""}
            <div style="margin-top:6px">
              <button class="btn ghost tiny" data-action="edit" data-id="${s.id}">Edit</button>
              <button class="btn ghost tiny" data-action="del" data-id="${s.id}">Delete</button>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });

      // attach handlers
      tbody.querySelectorAll("button[data-action]").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          const id = btn.dataset.id;
          const act = btn.dataset.action;
          if (act === "del") {
            const ok = await ui.confirmPrompt("Delete this schedule?");
            if (!ok) return;
            storage.remove("schedules", id);
            ui.toast("Schedule removed");
            loadAndRender();
          } else if (act === "edit") {
            const s = storage.getById("schedules", id);
            if (!s) return ui.toast("Not found");
            showEditor(s);
          }
        });
      });
    }

    function showEditor(existing) {
      // gather fields via prompt chain (simple approach).
      const title = prompt("Subject / Title:", existing?.title || "");
      if (title === null) return;
      const date = prompt("Date (YYYY-MM-DD):", existing ? (existing.start.slice(0,10)) : (new Date().toISOString().slice(0,10)));
      if (date === null) return;
      const startT = prompt("Start time (HH:MM 24h):", existing ? (new Date(existing.start).toTimeString().slice(0,5)) : "08:00");
      if (startT === null) return;
      const endT = prompt("End time (HH:MM 24h):", existing ? (new Date(existing.end).toTimeString().slice(0,5)) : "09:00");
      if (endT === null) return;
      const room = prompt("Room:", existing?.room || "301");
      if (room === null) return;
      const instructor = prompt("Instructor:", existing?.instructor || "");

      const startISO = new Date(`${date}T${startT}:00`).toISOString();
      const endISO = new Date(`${date}T${endT}:00`).toISOString();
      if (isNaN(new Date(startISO)) || isNaN(new Date(endISO))) {
        ui.toast("Invalid date/time");
        return;
      }
      if (new Date(startISO) >= new Date(endISO)) {
        ui.toast("Start must be before end");
        return;
      }

      // conflict detection against existing schedules (same date & room)
      const existingSchedules = storage.getCollection("schedules").filter(s => s.room === room && s.id !== (existing?.id));
      const conflict = existingSchedules.find(s => timeOverlap(new Date(startISO), new Date(endISO), new Date(s.start), new Date(s.end)));
      if (conflict) {
        ui.toast(`Conflict with ${conflict.title} (${new Date(conflict.start).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})})`);
        // still allow the user to force save? For now, block.
        return;
      }

      const payload = {
        id: existing?.id,
        title,
        room,
        instructor,
        start: startISO,
        end: endISO,
        createdAt: new Date().toISOString()
      };

      storage.upsert("schedules", payload);
      ui.toast(existing ? "Schedule updated" : "Schedule added");
      loadAndRender();
    }

    addBtn.addEventListener("click", () => showEditor(null));
    loadAndRender();
  }

  window.scheduleModule = { renderSchedulePage };
})();
