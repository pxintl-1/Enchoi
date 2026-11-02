const Storage = (() => {
  const K = window.APP_CONFIG.storageKeys;
  const DEFAULT_ID = "default";

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

  function historyKey(contactId) {
    return `${K.history}__${contactId || DEFAULT_ID}`;
  }

  function cardsKey(contactId) {
    return `${K.cards}__${contactId || DEFAULT_ID}`;
  }

  function categoriesKey(contactId) {
    return `private_chat_categories_v1__${contactId || DEFAULT_ID}`;
  }

  function migrateLegacy() {
    try {
      const legacyHistory = localStorage.getItem(K.history);
      const legacyCards = localStorage.getItem(K.cards);
      const legacyCategories = localStorage.getItem("private_chat_categories_v1");

      if (legacyHistory && !localStorage.getItem(historyKey(DEFAULT_ID))) {
        localStorage.setItem(historyKey(DEFAULT_ID), legacyHistory);
      }

      if (legacyCards && !localStorage.getItem(cardsKey(DEFAULT_ID))) {
        localStorage.setItem(cardsKey(DEFAULT_ID), legacyCards);
      }

      if (legacyCategories && !localStorage.getItem(categoriesKey(DEFAULT_ID))) {
        localStorage.setItem(categoriesKey(DEFAULT_ID), legacyCategories);
      }
    } catch (error) {
      // 忽略迁移失败
    }
  }

  migrateLegacy();

  return {
    historyKey,
    cardsKey,
    categoriesKey,

    getCards(contactId) {
      return load(cardsKey(contactId), null);
    },
    saveCards(contactId, cards) {
      return save(cardsKey(contactId), cards);
    },

    getCategories(contactId) {
      return load(categoriesKey(contactId), []);
    },
    saveCategories(contactId, list) {
      return save(categoriesKey(contactId), list);
    },

    getHistory(contactId) {
      return load(historyKey(contactId), []);
    },
    saveHistory(contactId, messages) {
      return save(
        historyKey(contactId),
        messages.slice(-window.APP_CONFIG.maxHistory)
      );
    },
    clearHistory(contactId) {
      localStorage.removeItem(historyKey(contactId));
    }
  };
})();
