// filename: js/grades.js
// Adds grade management UI: add grades, search by student (email), compute average and remarks.
(function () {
  function renderGradesPage() {
    const page = document.querySelector(".page");
    if (!page) return;

    const filters = page.querySelector(".filters");
    // add a search box for student email / id
    const searchWrapper = document.createElement("label");
    searchWrapper.style.minWidth = "220px";
    searchWrapper.innerHTML = `<span>Search student email</span><input id="regsys_grade_search" placeholder="juan@example.com" style="height:44px;padding:8px;border-radius:8px;border:1px solid rgba(10,23,72,0.06);width:100%;">`;
    if (filters) filters.appendChild(searchWrapper);

    // add Add Grade button
    const addBtn = document.createElement("button");
    addBtn.className = "btn primary";
    addBtn.textContent = "Add Grade";
    addBtn.style.marginLeft = "12px";
    if (filters) filters.appendChild(addBtn);

    const tbody = page.querySelector(".data-table tbody");
    if (!tbody) return;

    function renderFor(email) {
      const grades = storage.getCollection("grades").filter(g => !email || (g.studentEmail || "").toLowerCase() === email.toLowerCase());
      tbody.innerHTML = "";
      if (!grades.length) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="4" style="opacity:.7">No grades yet</td>`;
        tbody.appendChild(tr);
        return;
      }
      let totalWeighted = 0;
      let totalCredits = 0;
      grades.forEach(g => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${g.subject}</td>
                        <td>${g.score}</td>
                        <td>${g.credits}</td>
                        <td>${ui.gradeRemark(g.score)} 
                          <div style="margin-top:6px;">
                            <button class="btn ghost tiny" data-action="del" data-id="${g.id}">Delete</button>
                          </div>
                        </td>`;
        tbody.appendChild(tr);
        totalWeighted += (Number(g.score) || 0) * (Number(g.credits) || 0);
        totalCredits += Number(g.credits) || 0;
      });
      // append GPA row / average
      const avg = totalCredits ? (totalWeighted / totalCredits) : 0;
      const avgTr = document.createElement("tr");
      avgTr.innerHTML = `<td><strong>Average</strong></td><td><strong>${avg.toFixed(2)}</strong></td><td><strong>${totalCredits}</strong></td><td><strong>${avg >= 60 ? "Pass" : "Fail"}</strong></td>`;
      tbody.appendChild(avgTr);

      tbody.querySelectorAll("button[data-action='del']").forEach(b => {
        b.addEventListener("click", async () => {
          const id = b.dataset.id;
          const ok = await ui.confirmPrompt("Delete grade?");
          if (!ok) return;
          storage.remove("grades", id);
          ui.toast("Grade removed");
          renderFor(email);
        });
      });
    }

    addBtn.addEventListener("click", async () => {
      // prompt for student email (we use email as identifier)
      const email = prompt("Student email (identifier):", "");
      if (!email) return;
      const subject = prompt("Subject:", "");
      if (!subject) return;
      const score = prompt("Score (0-100):", "80");
      if (score === null) return;
      const credits = prompt("Credits (numeric):", "3");
      if (credits === null) return;

      const payload = {
        studentEmail: email.trim().toLowerCase(),
        subject: subject.trim(),
        score: Number(score),
        credits: Number(credits),
        createdAt: new Date().toISOString()
      };
      storage.upsert("grades", payload);
      ui.toast("Grade added");
      renderFor(document.getElementById("regsys_grade_search").value.trim());
    });

    const searchInput = document.getElementById("regsys_grade_search");
    searchInput.addEventListener("input", () => renderFor(searchInput.value.trim()));

    // initial render with no filter
    renderFor("");
  }

  window.gradesModule = { renderGradesPage };
})();
