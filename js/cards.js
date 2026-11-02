const CardDeck = (() => {
  const DEFAULT_CATEGORY = "默认";
  const ALL_CATEGORY = "__all__";

  const storedCards = Storage.getCards();
  let cards = normalizeStored(storedCards);

  if (!Array.isArray(storedCards) || needsMigration(storedCards)) {
    Storage.saveCards(cards);
  }

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

  function needsMigration(value) {
    if (!Array.isArray(value)) return true;
    return value.some((item) => typeof item === "string");
  }

  function persist() {
    return Storage.saveCards(cards);
  }

  function normalizeText(text) {
    return String(text == null ? "" : text).trim();
  }

  function normalizeCategory(name) {
    const value = String(name == null ? "" : name).trim();
    return value || DEFAULT_CATEGORY;
  }

  function getCategories() {
    const set = new Set(cards.map((card) => card.category));
    set.add(DEFAULT_CATEGORY);
    return [...set];
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
    const cat = normalizeCategory(category);

    if (!value) {
      return { ok: false, msg: "不能添加空字卡。" };
    }

    if (cards.some((card) => card.text === value && card.category === cat)) {
      return { ok: false, msg: "这个分类下已经有同一张字卡了。" };
    }

    cards.push({ category: cat, text: value });
    persist();
   
