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

    if (els.appChat) {
      els.appChat.addEventListener("click", () => show("contacts"));
    }

    if (els.appCards) {
      els.appCards.addEventListener("click", () => show("cards"));
    }

    if (els.appSettings) {
      els.appSettings.addEventListener("click", () => show("settings"));
    }
  }

  function show(target) {
    if (els.viewHome) els.viewHome.hidden = target !== "home";
    if (els.viewContacts) els.viewContacts.hidden = target !== "contacts";
    if (els.viewChat) els.viewChat.hidden = target !== "chat";
    if (els.viewCards) els.viewCards.hidden = target !== "cards";
    if (els.viewSettings) els.viewSettings.hidden = target !== "settings";

    document.dispatchEvent(
      new CustomEvent("app:viewchange", { detail: { view: target } })
    );
  }

  function showHome() {
    show("home");
  }

  return { init, show, showHome };
})();
