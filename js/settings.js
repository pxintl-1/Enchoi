const Settings = (() => {
  let els = {};
  let feedbackTimer = null;
  let currentView = "chat";

  function init() {
    els.viewChat = document.getElementById("view-chat");
    els.viewCards = document.getElementById("view-cards");

    els.openCardsBtn = document.getElementById("open-cards-page");
    els.backBtn = document.getElementById("back-to-chat");

    els.cardCount = document.getElementById("card-count");
    els.newCardInput = document.getElementById("new-card-input");
    els.saveCardBtn = document.getElementById("save-card-btn");
    els.cardFeedback = document.getElementById("card-feedback");
    els.cardList = document.getElementById("card-list");
    els.cardEmpty = document.getElementById("card-empty");

    els.openCardsBtn.addEventListener("click", showCardsView);
    els.backBtn.addEventListener("click", showChatView);
    els.saveCardBtn.addEventListener("click", saveCard);

    els.newCardInput.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        saveCard();
      }
    });

    renderCards();
  }

  function showCardsView() {
    currentView = "cards";
    els.viewChat.hidden = true;
    els.viewCards.hidden = false;
    renderCards();
    window.setTimeout(() => els.newCardInput.focus(), 50);
  }

  function showChatView() {
    currentView = "chat";
    els.viewCards.hidden = true;
    els.viewChat.hidden = false;

    const input = document.getElementById("message-input");
    if (input) input.focus();
  }

  function showFeedback(message, isError) {
    if (!els.cardFeedback) return;

    els.cardFeedback.textContent = message;
    els.cardFeedback.classList.toggle("is-error", Boolean(isError));

    if (feedbackTimer) clearTimeout(feedbackTimer);

    feedbackTimer = window.setTimeout(() => {
      els.cardFeedback.textContent = "";
      els.cardFeedback.classList.remove("is-error");
    }, 2600);
  }

  function renderCards() {
    const cards = CardDeck.getAll();
    els.cardCount.textContent = String(cards.length);

    if (cards.length === 0) {
      els.cardList.innerHTML = "";
      els.cardEmpty.hidden = false;
      return;
    }

    els.cardEmpty.hidden = true;
    els.cardList.innerHTML = cards
      .map((card) => `<li>${escapeHtml(card)}</li>`)
      .join("");
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = String(text == null ? "" : text);
    return div.innerHTML;
  }

  function saveCard() {
    const text = els.newCardInput.value;

    if (!text.trim()) {
      showFeedback("字卡内容不能为空。", true);
      els.newCardInput.focus();
      return;
    }

    const result = CardDeck.add(text);

    if (!result.ok) {
      showFeedback(result.msg, true);
      return;
    }

    els.newCardInput.value = "";
    renderCards();
    showFeedback("已保存。这张字卡会出现在聊天回复里。");
    els.newCardInput.focus();
  }

  return {
    init,
    getCurrentView() {
      return currentView;
    }
  };
})();
