const Proactive = (() => {
  const KEY = "private_chat_proactive_v1";

  const DEFAULTS = {
    enabled: false,
    intervalMin: 5,
    chance: 0.6
  };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { ...DEFAULTS };
      const parsed = JSON.parse(raw);
      return {
        enabled: parsed.enabled === true,
        intervalMin: Math.max(1, Math.min(180, Number(parsed.intervalMin) || 5)),
        chance: Math.max(0.05, Math.min(1, Number(parsed.chance) || 0.6))
      };
    } catch (error) {
      return { ...DEFAULTS };
    }
  }

  let config = load();
  let timer = null;

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(config));
      return true;
    } catch (error) {
      console.warn("主动发消息设置保存失败", error);
      return false;
    }
  }

  function get() {
    return { ...config };
  }

  function set(patch) {
    if (!patch || typeof patch !== "object") return get();

    if (typeof patch.enabled === "boolean") config.enabled = patch.enabled;
    if (patch.intervalMin !== undefined) {
      config.intervalMin = Math.max(1, Math.min(180, Number(patch.intervalMin) || 5));
    }
    if (patch.chance !== undefined) {
      config.chance = Math.max(0.05, Math.min(1, Number(patch.chance) || 0.6));
    }

    save();
    restart();
    return get();
  }

  function isChatVisible() {
    const view = document.getElementById("view-chat");
    return view && !view.hidden;
  }

  function tick() {
    if (!config.enabled) return;
    if (document.hidden) return;
    if (!isChatVisible()) return;
    if (Math.random() > config.chance) return;

    const contact = Contacts.getActive();
    if (!contact) return;

    CardDeck.loadFor(contact.id);
    const cards = CardDeck.getAll();
    if (cards.length === 0) return;

    const picked = cards[Math.floor(Math.random() * cards.length)];
    if (!picked || !picked.text) return;

    Chat.appendPartnerMessage(picked.text);
  }

  function restart() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }

    if (!config.enabled) return;

    const ms = config.intervalMin * 60 * 1000;
    timer = window.setInterval(tick, ms);
  }

  function init() {
    restart();

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) restart();
    });

    document.addEventListener("app:viewchange", (event) => {
      const view = event.detail && event.detail.view;
      if (view === "chat") restart();
    });
  }

  return { init, get, set, restart };
})();
