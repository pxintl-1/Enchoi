const Home = (() => {
  let els = {};

  function init() {
    els.viewHome = document.getElementById("view-home");
    els.viewContacts = document.getElementById("view-contacts");
    els.viewChat = document.getElementById("view-chat");
    els.viewCards = document.getElementById("view-cards");
    els.viewSettings = document.getElementById("view-settings");

    els.appChat = document.getElementById("app-chat");
    els.appCards = document.getElementById("app-cards");
    els.appSettings = document.getElementById("app-settings");

    els.appChat.addEventListener("click", () => show("contacts"));
    els.appCards.addEventListener("click", () => show("cards"));
    els.appSettings.addEventListener("click", () => show("settings"));
  }

  function show(target) {
    els.viewHome.hidden = target !== "home";
    els.viewContacts.hidden = target !== "contacts";
    els.viewChat.hidden = target !== "chat";
    els.viewCards.hidden = target !== "cards";
    els.viewSettings.hidden = target !== "settings";

    document.dispatchEvent(
      new CustomEvent("app:viewchange", { detail: { view: target } })
    );
  }

  function showHome() {
    show("home");
  }

  return { init, show, showHome };
})();
