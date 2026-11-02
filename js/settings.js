const Settings = (() => {
  let els = {};
  let feedbackTimer = null;

  function init() {
    els.modal = document.getElementById("settings-modal");
    els.openBtn = document.getElementById("open-settings");
    els.cardCount = document.getElementById("card-count");
    els.newCardInput = document.getElementById("new-card-input");
    els.addCardBtn = document.getElementById("add-card-btn");
    els.cardList = document.getElementById("card-list");
    els.feedback = document.getElementById("settings-feedback");
    els.importInput = document.getElementById("import-input");
    els.importBtn = document.getElementById("import-btn");
    els.exportCardsBtn = document.getElementById("export-cards-btn");
    els.exportHistoryBtn = document.getElementById("export-history-btn");
    els.clearHistoryBtn = document.getElementById("clear-history-btn");

    els.openBtn.addEventListener("click", open);

    document.querySelectorAll("[data-close-settings]").forEach((el) => {
      el.addEventListener("click", close);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !els.modal.hidden) close();
    });

    els.addCardBtn.addEventListener("click", addCard);

    els.newCardInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        addCard();
      }
    });

    els.cardList.addEventListener("click", onCardListClick);
    els.importBtn.addEventListener("click", importCards);
    els.exportCardsBtn.addEventListener("click", exportCards);
    els.exportHistoryBtn.addEventListener("click", exportHistory);
    els.clearHistoryBtn.addEventListener("click", clearHistory);
  }

  function open() {
    els.modal.hidden = false;
    document.body.classList.add("modal-open");
    render();
    window.setTimeout(() => els.newCardInput.focus(), 50);
  }

  function close() {
    els.modal.hidden = true;
    document.body.classList.remove("modal-open");
  }

  function showFeedback(message, isError) {
    if (!els.feedback) return;

    els.feedback.textContent = message;
    els.feedback.classList.toggle("is-error", Boolean(isError));

    if (feedbackTimer) clearTimeout(feedbackTimer);

    feedbackTimer = window.setTimeout(() => {
      els.feedback.textContent = "";
      els.feedback.classList.remove("is-error");
    }, 2600);
  }

  function render() {
    const cards = CardDeck.getAll();
    els.cardCount.textContent = String(cards.length);

    if (cards.length === 0) {
      els.cardList.innerHTML =
        '<li><span>字卡库是空的。添加一张字卡后，TA 才能回复你。</span></li>';
      return;
    }

    els.cardList.innerHTML = cards
      .map(
        (card, index) => `
          <li>
            <span>${escapeHtml(card)}</span>
            <button type="button" data-remove-index="${index}">删除</button>
          </li>
        `
      )
      .join("");
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = String(text == null ? "" : text);
    return div.innerHTML;
  }

  function addCard() {
    const result = CardDeck.add(els.newCardInput.value);

    if (!result.ok) {
      showFeedback(result.msg, true);
      return;
    }

    els.newCardInput.value = "";
    render();
    showFeedback("已添加一张字卡。");
  }

  function onCardListClick(event) {
    const button = event.target.closest("[data-remove-index]");
    if (!button) return;

    const index = Number(button.dataset.removeIndex);
    if (!window.confirm("确定删除这张字卡吗？")) return;

    if (CardDeck.removeAt(index)) {
      render();
      showFeedback("已删除。");
    }
  }

  function parseImportText(text) {
    const value = text.trim();
    if (!value) return null;

    if (value.startsWith("[")) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
      } catch (error) {
        // 不是合法 JSON 时，按每行一条处理
      }
    }

    return value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  function importCards() {
    const list = parseImportText(els.importInput.value);

    if (!list) {
      showFeedback("先粘贴要导入的字卡。", true);
      return;
    }

    const result = CardDeck.importFromArray(list);

    if (!result.ok) {
      showFeedback(result.msg, true);
      return;
    }

    els.importInput.value = "";
    render();
    showFeedback(`导入完成：新增 ${result.added} 张，共 ${result.total} 张。`);
  }

  function download(filename, content) {
    const blob = new Blob([content], {
      type: "application/json;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function todayStamp() {
    return new Date().toISOString().slice(0, 10);
  }

  function exportCards() {
    download(
      `chat-cards-${todayStamp()}.json`,
      JSON.stringify(CardDeck.getAll(), null, 2)
    );
    showFeedback("字卡已导出。");
  }

  function exportHistory() {
    download(
      `chat-history-${todayStamp()}.json`,
      JSON.stringify(Chat.getHistory(), null, 2)
    );
    showFeedback("聊天记录已导出。");
  }

  function clearHistory() {
    if (!window.confirm("确定清空所有聊天记录吗？字卡库不会受影响。")) return;

    Chat.clear();
    showFeedback("聊天记录已清空。");
  }

  return {
    init
  };
})();
