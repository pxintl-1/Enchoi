const Home = (() => {
  let els = {};

  function init() {
    els.viewHome = document.getElementById("view-home");
    els.viewChat = document.getElementById("view-chat");
    els.viewCards = document.getElementById("view-cards");
    els.viewSettings = document.getElementById("view-settings");

    els.appChat = document.getElementById("app-chat");
    els.appCards = document.getElementById("app-cards");
    els.appSettings = document.getElementById("app-settings");

    els.appChat.addEventListener("click", () => show("chat"));
    els.appCards.addEventListener("click", () => show("cards"));
    els.appSettings.addEventListener("click", () => show("settings"));
  }

  function show(target) {
    els.viewHome.hidden = target !== "home";
    els.viewChat.hidden = target !== "chat";
    els.viewCards.hidden = target !== "cards";
    els.viewSettings.hidden = target !== "settings";

    if (target === "chat") {
      Chat.refreshAppearance();
    }
  }

  function showHome() {
    show("home");
  }

  return { init, show, showHome };
})();
