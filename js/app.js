document.addEventListener("DOMContentLoaded", () => {
  document.title = window.APP_CONFIG.siteTitle;

  const taName = document.getElementById("ta-name");
  if (taName) {
    taName.textContent = window.APP_CONFIG.taName;
  }

  Chat.init();
  Settings.init();
});
