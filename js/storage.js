const Storage = (() => {
  const K = window.APP_CONFIG.storageKeys;

  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (error) {
      console.warn("读取本地数据失败", key, error);
      return fallback;
    }
  }

  function save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn("保存本地数据失败", key, error);
      return false;
    }
  }

  return {
    getCards() {
      return load(K.cards, null);
    },
    saveCards(cards) {
      return save(K.cards, cards);
    },
    getHistory() {
      return load(K.history, []);
    },
    saveHistory(messages) {
      return save(K.history, messages.slice(-window.APP_CONFIG.maxHistory));
    },
    clearHistory() {
      localStorage.removeItem(K.history);
    },
    getSettings() {
      return load(K.settings, {});
    },
    saveSettings(settings) {
      return save(K.settings, settings);
    }
  };
})();
