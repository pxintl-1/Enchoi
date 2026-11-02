const Settings = (() => {
  let els = {};
  let feedbackTimer = null;
  let currentView = "chat";
  let pickingRole = null;

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

    els.settingsTaAvatar = document.getElementById("settings-ta-avatar");
    els.settingsUserAvatar = document.getElementById("settings-user-avatar");
    els.fileInput = document.getElementById("avatar-file-input");

    els.openCardsBtn.addEventListener("click", showCardsView);
    els.backBtn.addEventListener("click", showChatView);
    els.saveCardBtn.addEventListener("click", saveCard);

    els.newCardInput.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        saveCard();
      }
    });

    els.fileInput.addEventListener("change", onFilePicked);

    document.querySelectorAll("[data-pick-avatar]").forEach((button) => {
      button.addEventListener("click", () => {
        pickingRole = button.dataset.pickAvatar;
        els.fileInput.value = "";
        els.fileInput.click();
      });
    });

    document.querySelectorAll("[data-clear-avatar]").forEach((button) => {
      button.addEventListener("click", () => {
        const role = button.dataset.clearAvatar;
        AvatarStore.clear(role);
        renderAvatarSettings();
        Chat.refreshAvatars();
        showFeedback("已恢复默认头像。");
      });
    });

    renderCards();
    renderAvatarSettings();
  }

  function showCardsView() {
    currentView = "cards";
    els.viewChat.hidden = true;
    els.viewCards.hidden = false;
    renderCards();
    renderAvatarSettings();
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

  function renderAvatarPreview(el, role) {
    if (!el) return;

    const dataUrl = AvatarStore.get(role);
    const initial =
      role === "user"
        ? (window.APP_CONFIG.userName || "我").slice(0, 1)
        : (window.APP_CONFIG.taName || "TA").slice(0, 1);

    el.classList.toggle(
      role === "user" ? "avatar--user-default" : "avatar--ta-default",
      !dataUrl
    );
    el.style.backgroundImage = dataUrl ? `url('${dataUrl}')` : "";
    el.textContent = dataUrl ? "" : initial;
  }

  function renderAvatarSettings() {
    renderAvatarPreview(els.settingsTaAvatar, "ta");
    renderAvatarPreview(els.settingsUserAvatar, "user");
  }

  function onFilePicked() {
    const file = els.fileInput.files && els.fileInput.files[0];
    const role = pickingRole;

    if (!file || !role) return;

    if (!file.type.startsWith("image/")) {
      showFeedback("请选择图片文件。", true);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showFeedback("图片太大，请选择 2MB 以内的图片。", true);
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const dataUrl = String(reader.result || "");

      if (!AvatarStore.set(role, dataUrl)) {
        showFeedback("保存失败，可能是存储空间不足。", true);
        return;
      }

      renderAvatarSettings();
      Chat.refreshAvatars();
      showFeedback(role === "ta" ? "TA 的头像已更新。" : "你的头像已更新。");
    };

    reader.onerror = () => {
      showFeedback("读取图片失败，请重试。", true);
    };

    reader.readAsDataURL(file);
  }

  return {
    init,
    getCurrentView() {
      return currentView;
    }
  };
})();
