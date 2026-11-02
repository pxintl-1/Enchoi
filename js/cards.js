const CardDeck = (() => {
  const storedCards = Storage.getCards();
  let cards = Array.isArray(storedCards)
    ? storedCards
    : [...window.APP_CONFIG.defaultCards];

  if (!Array.isArray(storedCards)) {
    Storage.saveCards(cards);
  }

  let lastIndex = -1;

  function normalize(text) {
    return String(text == null ? "" : text).trim();
  }

  function persist() {
    return Storage.saveCards(cards);
  }

  function draw() {
    if (cards.length === 0) {
      return "（字卡库是空的，点右上角“字卡”添加一些吧）";
    }

    if (cards.length === 1) {
      lastIndex = 0;
      return cards[0];
    }

    let index = Math.floor(Math.random() * cards.length);
    let guard = 0;

    while (
      window.APP_CONFIG.avoidRepeat &&
      index === lastIndex &&
      guard < 20
    ) {
      index = Math.floor(Math.random() * cards.length);
      guard += 1;
    }

    lastIndex = index;
    return cards[index];
  }

  function add(text) {
    const value = normalize(text);

    if (!value) {
      return { ok: false, msg: "不能添加空字卡。" };
    }

    if (cards.includes(value)) {
      return { ok: false, msg: "这张字卡已经存在。" };
    }

    cards.push(value);
    persist();
    return { ok: true };
  }

  function removeAt(index) {
    if (index < 0 || index >= cards.length) return false;
    cards.splice(index, 1);
    persist();
    return true;
  }

  function getAll() {
    return [...cards];
  }

  function importFromArray(list) {
    if (!Array.isArray(list)) {
      return { ok: false, msg: "导入内容必须是字符串数组。" };
    }

    const valid = list.map(normalize).filter(Boolean);

    if (valid.length === 0) {
      return { ok: false, msg: "没有找到有效字卡。" };
    }

    const before = cards.length;
    cards = [...new Set([...cards, ...valid])];
    persist();

    return {
      ok: true,
      added: cards.length - before,
      total: cards.length
    };
  }

  return {
    draw,
    add,
    removeAt,
    getAll,
    importFromArray
  };
})();
