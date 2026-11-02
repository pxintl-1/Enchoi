const CardDeck = (() => {
  const DEFAULT_CATEGORY = "默认";
  const ALL_CATEGORY = "__all__";

  let contactId = null;
  let cards = [];
  let categories = [DEFAULT_CATEGORY];
  let lastKey = "";

  function normalizeStored(value) {
    if (!Array.isArray(value)) {
      return window.APP_CONFIG.defaultCards.map((text) => ({
        category: DEFAULT_CATEGORY,
        text
      }));
    }

    return value
      .map((item) => {
        if (typeof item === "string") {
          const text = item.trim();
          return text ? { category: DEFAULT_CATEGORY, text } : null;
        }

        if (item && typeof item === "object") {
          const text = String(item.text == null ? "" : item.text).trim();
          if (!text) return null;
          const category = String(item.category == null ? "" : item.category).trim();
          return { category: category || DEFAULT_CATEGORY, text };
        }

        return null;
      })
      .filter(Boolean);
  }

  function loadFor(id) {
    contactId = id;
    lastKey = "";

    const storedCards = Storage.getCards(id);
    const needsMigration =
      !Array.isArray(storedCards) ||
      storedCards.some((item) => typeof item === "string");

    cards = normalizeStored(storedCards);

    if (needsMigration) {
      Storage.saveCards(id, cards);
    }

    const storedCategories = Storage.getCategories(id);
    categories = Array.isArray(storedCategories)
      ? storedCategories
          .map((item) => String(item == null ? "" : item).trim())
          .filter(Boolean)
      : [];

    if (categories.length === 0) {
      categories = [DEFAULT_CATEGORY];
      Storage.saveCategories(id, categories);
    }
  }

  function persist() {
    return Storage.saveCards(contactId, cards);
  }

  function persistCategories() {
    return Storage.saveCategories(contactId, categories);
  }

  function normalizeText(text) {
    return String(text == null ? "" : text).trim();
  }

  function normalizeCategory(name) {
    const value = String(name == null ? "" : name).trim();
    return value || DEFAULT_CATEGORY;
  }

  function ensureCategory(name) {
    const value = normalizeCategory(name);
    if (!categories.includes(value)) {
      categories.push(value);
      persistCategories();
    }
    return value;
  }

  function getCategories() {
    const list = [...categories];
    if (!list.includes(DEFAULT_CATEGORY)) {
      list.unshift(DEFAULT_CATEGORY);
    }
    return list;
  }

  function addCategory(name) {
    const value = normalizeCategory(name);
    if (categories.includes(value)) {
      return { ok: false, msg: "这个分类已经存在。" };
    }
    categories.push(value);
    persistCategories();
    return { ok: true, category: value };
  }

  function countByCategory(category) {
    if (category === ALL_CATEGORY) return cards.length;
    return cards.filter((card) => card.category === category).length;
  }

  function draw(category) {
    const target = category && category !== ALL_CATEGORY ? category : null;
    const pool = target
      ? cards.filter((card) => card.category === target)
      : cards;

    if (pool.length === 0) {
      return cards.length === 0
        ? "（字卡库是空的，点“字卡”添加一些吧）"
        : "（这个分类下还没有字卡）";
    }

    if (pool.length === 1) {
      lastKey = pool[0].category + "::" + pool[0].text;
      return pool[0].text;
    }

    let index = Math.floor(Math.random() * pool.length);
    let guard = 0;

    while (window.APP_CONFIG.avoidRepeat && guard < 20) {
      const key = pool[index].category + "::" + pool[index].text;
      if (key !== lastKey) break;
      index = Math.floor(Math.random() * pool.length);
      guard += 1;
    }

    lastKey = pool[index].category + "::" + pool[index].text;
    return pool[index].text;
  }

  function add(text, category) {
    const value = normalizeText(text);
    const cat = ensureCategory(category);

    if (!value) return { ok: false, msg: "不能添加空字卡。" };

    if (cards.some((card) => card.text === value && card.category === cat)) {
      return { ok: false, msg: "这个分类下已经有同一张字卡了。" };
    }

    cards.push({ category: cat, text: value });
    persist();
    return { ok: true };
  }

  function removeAt(index) {
    if (index < 0 || index >= cards.length) return false;
    cards.splice(index, 1);
    persist();
    return true;
  }

  function updateAt(index, patch) {
    if (index < 0 || index >= cards.length) {
      return { ok: false, msg: "字卡不存在。" };
    }

    const current = cards[index];
    const nextText =
      patch && typeof patch.text === "string"
        ? normalizeText(patch.text)
        : current.text;
    const nextCategory =
      patch && typeof patch.category === "string"
        ? ensureCategory(patch.category)
        : current.category;

    if (!nextText) return { ok: false, msg: "字卡内容不能为空。" };

    const duplicated = cards.some(
      (card, i) =>
        i !== index &&
        card.text === nextText &&
        card.category === nextCategory
    );

    if (duplicated) {
      return { ok: false, msg: "这个分类下已经有同一张字卡了。" };
    }

    cards[index] = { category: nextCategory, text: nextText };
    persist();

    return { ok: true, category: nextCategory, text: nextText };
  }

  function getAll() {
    return cards.map((card) => ({ ...card }));
  }

  function getByCategory(category) {
    if (!category || category === ALL_CATEGORY) return getAll();
    return cards
      .filter((card) => card.category === category)
      .map((card) => ({ ...card }));
  }

  function importFromArray(list, category) {
    if (!Array.isArray(list)) {
      return { ok: false, msg: "导入内容必须是字符串数组。" };
    }

    const cat = ensureCategory(category);
    const valid = list.map(normalizeText).filter(Boolean);

    if (valid.length === 0) return { ok: false, msg: "没有找到有效字卡。" };

    const before = cards.length;
    const existing = new Set(cards.map((card) => card.category + "::" + card.text));

    valid.forEach((text) => {
      const key = cat + "::" + text;
      if (!existing.has(key)) {
        cards.push({ category: cat, text });
        existing.add(key);
      }
    });

    persist();

    return {
      ok: true,
      added: cards.length - before,
      total: cards.length
    };
  }

  return {
    DEFAULT_CATEGORY,
    ALL_CATEGORY,
    loadFor,
    draw,
    add,
    removeAt,
    updateAt,
    getAll,
    getByCategory,
    getCategories,
    addCategory,
    countByCategory,
    importFromArray
  };
})();
