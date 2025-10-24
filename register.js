// filename: js/registration.js
// Handles registration form: save user records to 'users' collection
(function () {
  function initRegistrationPage() {
    const form = document.querySelector(".form-grid");
    if (!form) return;

    // create Save button next to the existing actions
    const actions = form.querySelector(".form-actions");
    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "btn primary";
    saveBtn.style.marginRight = "8px";
    saveBtn.textContent = "Save Registration";
    // insert before first child so layout stays same
    if (actions) actions.insertBefore(saveBtn, actions.firstChild);

    // helpers to read form
    function readForm() {
      return {
        fname: (document.getElementById("fname") || {}).value?.trim() || "",
        lname: (document.getElementById("lname") || {}).value?.trim() || "",
        year: (document.getElementById("year") || {}).value || "",
        course: (document.getElementById("course") || {}).value || "",
        email: (document.getElementById("email") || {}).value?.trim() || "",
      };
    }

    function validate(data) {
      if (!data.fname || !data.lname) { ui.toast("Enter first and last name"); return false; }
      if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) { ui.toast("Enter a valid email"); return false; }
      return true;
    }

    saveBtn.addEventListener("click", () => {
      const data = readForm();
      if (!validate(data)) return;
      // ensure no duplicate email
      const existing = storage.find("users", u => u.email.toLowerCase() === data.email.toLowerCase());
      if (existing.length) {
        // update first match
        const user = existing[0];
        user.fname = data.fname;
        user.lname = data.lname;
        user.year = data.year;
        user.course = data.course;
        storage.upsert("users", user);
        ui.toast("Registration updated");
      } else {
        const newUser = {
          fname: data.fname,
          lname: data.lname,
          email: data.email,
          year: data.year,
          course: data.course,
          createdAt: new Date().toISOString()
        };
        storage.upsert("users", newUser);
        ui.toast("Student registered");
      }
    });

    // auto-fill if there is exactly one user in storage (convenience for demo)
    const users = storage.getCollection("users");
    if (users.length === 1) {
      const u = users[0];
      document.getElementById("fname").value = u.fname || "";
      document.getElementById("lname").value = u.lname || "";
      document.getElementById("year").value = u.year || "";
      document.getElementById("course").value = u.course || "";
      document.getElementById("email").value = u.email || "";
    }

    // Also migrate any existing static fields from table (if user copy-pastes into a table later)
    // (No-op when not needed)
  }

  // expose initializer
  window.regModule = { initRegistrationPage };
})();
