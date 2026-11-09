const Proactive = (() => {
  const KEY = "private_chat_proactive_v4";
  const LEGACY_KEYS = [
    "private_chat_proactive_v3",
    "private_chat_proactive_v2",
    "private_chat_proactive_v1"
  ];
  const CHECK_INTERVAL_MS = 30 * 1000;
  const DEFAULT_INTERVAL = 10;
  const DEFAULT_CHANCE = 50;

  const DEFAULTS = {
    enabled: false,
    intervalMin: DEFAULT_INTERVAL,
    chance: DEFAULT_CHANCE,
    lastSentAt: 0
  };

  function clampInterval(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) return DEFAULT_INTERVAL;
    return Math.max(0, Math.floor(num));
  }

  function clampChance(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) return DEFAULT_CHANCE;
    return Math.max(0, Math.min(100, Math.round(num)));
  }

  function normalize(parsed) {
    if (!parsed || typeof parsed !== "object") return { ...DEFAULTS };
    return {
      enabled: parsed.enabled === true,
      intervalMin: clampInterval(parsed.intervalMin),
      chance:
        parsed.chance === undefined
          ? DEFAULT_CHANCE
          : clampChance(parsed.chance),
      lastSentAt: Number(parsed.lastSentAt) || 0
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return normalize(JSON.parse(raw));

      for (let i = 0; i < LEGACY_KEYS.length; i += 1) {
        const legacyRaw = localStorage.getItem(LEGACY_KEYS[i]);
        if (legacyRaw) {
          const migrated = normalize(JSON.parse(legacyRaw));
          localStorage.setItem(KEY, JSON.stringify(migrated));
          return migrated;
        }
      }

      return { ...DEFAULTS };
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
      config.intervalMin = clampInterval(patch.intervalMin);
    }

    if (patch.chance !== undefined) {
      config.chance = clampChance(patch.chance);
    }

    if (patch.lastSentAt !== undefined) {
      config.lastSentAt = Number(patch.lastSentAt) || 0;
    }

    save();
    restart();
    return get();
  }

  function minutesSinceLast() {
    if (!config.lastSentAt) return Infinity;
    return (Date.now() - config.lastSentAt) / 60000;
  }

  function pickCardText() {
    const contact = Contacts.getActive();
    if (!contact) return "";

    CardDeck.loadFor(contact.id);
    const cards = CardDeck.getAll();
    if (cards.length === 0) return "";

    const picked = cards[Math.floor(Math.random() * cards.length)];
    return picked && picked.text ? String(picked.text).trim() : "";
  }

  function trySend() {
    const text = pickCardText();
    if (!text) return false;

    Chat.appendPartnerMessage(text);
    config.lastSentAt = Date.now();
    save();
    return true;
  }

  function tick() {
    if (!config.enabled) return;
    if (document.hidden) return;

    const interval = config.intervalMin;
    const elapsed = minutesSinceLast();

    if (interval === 0) {
      if (config.chance >= 100 || Math.random() * 100 < config.chance) {
        trySend();
      }
      return;
    }

    if (elapsed >= interval) {
      trySend();
      return;
    }

    if (config.chance <= 0) return;

    if (Math.random() * 100 < config.chance) {
      trySend();
    }
  }

  function restart() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }

    if (!config.enabled) return;
    timer = window.setInterval(tick, CHECK_INTERVAL_MS);
  }

  function init() {
    restart();

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) restart();
    });

    document.addEventListener("app:viewchange", () => {
      restart();
    });
  }

  return { init, get, set, restart };
})();
