document.addEventListener("DOMContentLoaded", () => {
  document.title = window.APP_CONFIG.siteTitle;

  Chat.init();
  Settings.init();
  Proactive.init();

  const active = Contacts.getActive();
  Chat.setContact(active.id);
  CardDeck.loadFor(active.id);

  setupViewport();
  setupKeyboardHandling();
});

function setupViewport() {
  function apply() {
    const height = window.visualViewport
      ? window.visualViewport.height
      : window.innerHeight;

    document.documentElement.style.setProperty(
      "--app-visual-height",
      height + "px"
    );
  }

  apply();

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", apply);
    window.visualViewport.addEventListener("scroll", apply);
  }

  window.addEventListener("resize", apply);
  window.addEventListener("orientationchange", () => {
    window.setTimeout(apply, 120);
  });
}

function setupKeyboardHandling() {
  const input = document.getElementById("message-input");
  const list = document.getElementById("message-list");
  if (!input) return;

  let keyboardOpen = false;

  function setKeyboard(open) {
    if (keyboardOpen === open) return;
    keyboardOpen = open;
    document.body.classList.toggle("keyboard-open", open);

    if (open && list) {
      requestAnimationFrame(() => {
        list.scrollTop = list.scrollHeight;
      });
    }
  }

  input.addEventListener("focus", () => setKeyboard(true));
  input.addEventListener("blur", () => setKeyboard(false));

  if (window.visualViewport) {
    const baseline = window.visualViewport.height;

    window.visualViewport.addEventListener("resize", () => {
      const current = window.visualViewport.height;
      const diff = baseline - current;

      if (diff > 120) setKeyboard(true);
      else if (diff < 60) setKeyboard(false);
    });
  }
}
