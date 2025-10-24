// filename: js/ui.js
// Tiny UI helpers: toast, confirm (promise), modal builders (very small)
(function (global) {

  function toast(msg, timeout = 2500) {
    let container = document.getElementById("regsys_toast_container");
    if (!container) {
      container = document.createElement("div");
      container.id = "regsys_toast_container";
      container.style.position = "fixed";
      container.style.right = "18px";
      container.style.bottom = "18px";
      container.style.zIndex = 9999;
      document.body.appendChild(container);
    }
    const el = document.createElement("div");
    el.textContent = msg;
    el.style.background = "#0b1a3d";
    el.style.color = "#fff";
    el.style.padding = "10px 14px";
    el.style.marginTop = "8px";
    el.style.borderRadius = "8px";
    el.style.boxShadow = "0 8px 20px rgba(0,0,0,0.12)";
    container.appendChild(el);
    setTimeout(() => {
      el.style.transition = "opacity .3s ease, transform .3s ease";
      el.style.opacity = 0;
      el.style.transform = "translateY(8px)";
      setTimeout(() => el.remove(), 350);
    }, timeout);
  }

  function confirmPrompt(message) {
    return new Promise(resolve => {
      const ok = confirm(message);
      resolve(ok);
    });
  }

  // Small helper to convert grade -> remark
  function gradeRemark(score) {
    const g = Number(score);
    if (Number.isNaN(g)) return "Invalid";
    return g >= 60 ? "Pass" : "Fail";
  }

  global.ui = { toast, confirmPrompt, gradeRemark };
})(window);
