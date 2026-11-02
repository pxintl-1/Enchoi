const Settings = (() => {
  let els = {};
  let feedbackTimer = null;
  let profileFeedbackTimer = null;
  let pickingRole = null;

  let activeCategory = CardDeck.ALL_CATEGORY;
  let chatCategory = CardDeck.ALL_CATEGORY;

  function init() {
    els.viewChat = document.getElementById("view-chat");
    els.viewCards = document.getElementById("view-cards");
    els.viewSettings = document.getElementById("view-settings");

    els.openCardsBtn = document.getElementById("open-cards-page");
    els.openSettingsBtn = document.getElementById("open-settings-page");
    els.backBtn = document.getElementById("back-to-chat");
    els.backBtn2 = document.getElementById("back-to-chat-2");

    els.cardCount = document.getElementById("card-count");
    els.categorySelect = document.getElementById("card-category-select");
    els.newCardInput = document.getElementById("new-card-input");
    els.saveCardBtn = document.getElementById("save-card-btn");
    els.cardFeedback = document.getElementById("card-feedback");
    els.cardList = document.getElementById("card-list");
    els.cardEmpty = document.getElementById("card-empty");
    els.categoryTabs = document.getElementById("category-tabs");
    els.newCategoryInput = document.getElementById("new-category-input");
    els.addCategoryBtn = document.getElementById("add-category-btn");
    els.targetCategoryLabel = document.getElementById("target-category-label");

    els.inputTaName = document.getElementById("input-ta-name");
    els.inputUserName = document.getElementById("input-user-name");
    els.inputTaCall = document.getElementById("input-ta-call");
    els.inputUserCall = document.getElementById("input-user-call");
    els.saveProfileBtn = document.getElementById("save-profile-btn");
    els.profileFeedback = document.getElementById("profile-feedback");

    els.settingsTaAvatar = document.getElementById("settings-ta-avatar");
    els.settingsUserAvatar = document.getElementById("settings-user-avatar");
    els.avatarFileInput = document.getElementById("avatar-file-input");
    els.backgroundFileInput = document.getElementById("background-file-input");
    els.pickBackgroundBtn = document.getElementById("pick-background-btn");
    els.clearBackgroundBtn = document.getElementById("clear-background-btn");

    els.openCardsBtn.addEventListener("click", showCardsView);
    els.openSettingsBtn.addEventListener("click", showSettingsView);
    els.backBtn.addEventListener("click", showChatView);
    els.backBtn2.addEventListener("click", showChatView);

    els.saveCardBtn.addEventListener("click", saveCards);
    els.newCardInput.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        saveCards();
      }
    });

    els.addCategoryBtn.addEventListener("click", addCategory);
    els.newCategoryInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        addCategory();
      }
    });

    els.categorySelect.addEventListener("change", () => {
      chatCategory = els.categorySelect.value;
      els.categorySelect.blur();
      showCardFeedback(
        chatCategory === CardDeck.ALL_CATEGORY
          ? "聊天将从全部分类里抽取。"
          : `聊天只从「${chatCategory}」里抽取。`
      );
      Chat.setCardCategory(chatCategory);
    });

    els.categoryTabs.addEventListener("click", (event) => {
      const button = event.target.closest("[data-category]");
      if (!button) return;
      activeCategory = button.dataset.category;
      renderCards();
    });

    els.saveProfileBtn.addEventListener("click", saveProfile);
    els.avatarFileInput.addEventListener("change", onAvatarPicked);
    els.backgroundFileInput.addEventListener("change", onBackgroundPicked);

    els.pickBackgroundBtn.addEventListener("click", () => {
      els.backgroundFileInput.value = "";
      els.backgroundFileInput.click();
    });

    els.clearBackgroundBtn.addEventListener("click", clearBackground);

    document.querySelectorAll("[data-pick-avatar]").forEach((button) => {
      button.addEventListener("click", () => {
        pickingRole = button.dataset.pickAvatar;
        els.avatarFileInput.value = "";
        els.avatarFileInput.click();
      });
    });

    document.querySelectorAll("[data-clear-avatar]").forEach((button) => {
      button.addEventListener("click", () => {
        const role = button.dataset.clearAvatar;
        AvatarStore.clear(role);
        renderAvatarSettings();
        Chat.refreshAppearance();
        showProfileFeedback("已恢复默认头像。");
      });
    });

    renderCategorySelect();
    renderCards();
    renderAvatarSettings();
    fillProfileForm();

    Chat.setCardCategory(chatCategory);
  }

  function showView(target) {
    els.viewChat.hidden = target !== "chat";
    els.viewCards.hidden = target !== "cards";
    els.viewSettings.hidden = target !== "settings";
  }

  function showCardsView() {
    showView("cards");
    renderCategorySelect();
    renderCards();
    window.setTimeout(() => els.newCardInput.focus(), 50);
  }

  function showSettingsView() {
    showView("settings");
    renderAvatarSettings();
    fillProfileForm();
  }

  function showChatView() {
    showView("chat");
  }

  function showCardFeedback(message, isError) {
    if (!els.cardFeedback) return;
    els.cardFeedback.textContent = message;
    els.cardFeedback.classList.toggle("is-error", Boolean(isError));
    if (feedbackTimer) clearTimeout(feedbackTimer);
    feedbackTimer = window.setTimeout(() => {
      els.cardFeedback.textContent = "";
      els.cardFeedback.classList.remove("is-error");
    }, 3000);
  }

  function showProfileFeedback(message, isError) {
    if (!els.profileFeedback) return;
    els.profileFeedback.textContent = message;
    els.profileFeedback.classList.toggle("is-error", Boolean(isError));
    if (profileFeedbackTimer) clearTimeout(profileFeedbackTimer);
    profileFeedbackTimer = window.setTimeout(() => {
      els.profileFeedback.textContent = "";
      els.profileFeedback.classList.remove("is-error");
    }, 2600);
  }

  function renderCategorySelect() {
    const categories = CardDeck.getCategories();
    const options = [
      `<option value="${CardDeck.ALL_CATEGORY}">全部分类（默认）</option>`,
      ...categories.map(
        (cat) => `<option value="${escapeAttr(cat)}">${escapeHtml(cat)}</option>`
      )
    ];

    els.categorySelect.innerHTML = options.join("");
    els.categorySelect.value = categories.includes(chatCategory)
      ? chatCategory
      : CardDeck.ALL_CATEGORY;

    chatCategory = els.categorySelect.value;
  }

  function currentTargetCategory() {
    return activeCategory === CardDeck.ALL_CATEGORY
      ? CardDeck.DEFAULT_CATEGORY
      : activeCategory;
  }

  function updateTargetCategoryLabel() {
    if (!els.targetCategoryLabel) return;
    els.targetCategoryLabel.textContent = currentTargetCategory();
  }

  function renderCards() {
    const categories = CardDeck.getCategories();

    if (
      activeCategory !== CardDeck.ALL_CATEGORY &&
      !categories.includes(activeCategory)
    ) {
      activeCategory = CardDeck.ALL_CATEGORY;
    }

    const tabs = [
      { key: CardDeck.ALL_CATEGORY, label: "全部" },
      ...categories.map((cat) => ({ key: cat, label: cat }))
    ];

    els.categoryTabs.innerHTML = tabs
      .map((tab) => {
        const count = CardDeck.countByCategory(tab.key);
        const active = tab.key === activeCategory ? " is-active" : "";
        return `<button type="button" class="category-tab${active}" data-category="${escapeAttr(tab.key)}">${escapeHtml(tab.label)}<span class="category-tab__count">${count}</span></button>`;
      })
      .join("");

    els.cardCount.textContent = String(CardDeck.getAll().length);
    updateTargetCategoryLabel();

    const list = CardDeck.getByCategory(activeCategory);

    if (list.length === 0) {
      els.cardList.innerHTML = "";
      els.cardEmpty.hidden = false;
      return;
    }

    els.cardEmpty.hidden = true;
    els.cardList.innerHTML = list
      .map(
        (card) => `
          <li>
            <span class="card-list__category">${escapeHtml(card.category)}</span>
            <span class="card-list__text">${escapeHtml(card.text)}</span>
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

  function escapeAttr(text) {
    return escapeHtml(text).replace(/"/g, "&quot;");
  }

  function saveCards() {
    const raw = els.newCardInput.value;

    if (!raw.trim()) {
      showCardFeedback("字卡内容不能为空。", true);
      els.newCardInput.focus();
      return;
    }

    const lines = raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      showCardFeedback("没有找到有效字卡。", true);
      return;
    }

    const category = currentTargetCategory();
    const result = CardDeck.importFromArray(lines, category);

    if (!result.ok) {
      showCardFeedback(result.msg, true);
      return;
    }

    els.newCardInput.value = "";
    renderCategorySelect();
    renderCards();

    const skipped = lines.length - result.added;

    if (lines.length === 1) {
      if (result.added === 1) {
        showCardFeedback(`已保存到「${category}」。`);
      } else {
        showCardFeedback(`「${category}」里已经有这张字卡了。`, true);
      }
    } else {
      const parts = [`已添加 ${result.added} 张到「${category}」`];
      if (skipped > 0) parts.push(`跳过 ${skipped} 张重复`);
      parts.push(`当前共 ${result.total} 张`);
      showCardFeedback(parts.join("，") + "。");
    }

    els.newCardInput.focus();
  }

  function addCategory() {
    const name = els.newCategoryInput.value.trim();
    if (!name) {
      showCardFeedback("分类名不能为空。", true);
      return;
    }

    const exists = CardDeck.getCategories().includes(name);
    if (exists) {
      showCardFeedback("这个分类已经存在。", true);
      return;
    }

    activeCategory = name;
    els.newCategoryInput.value = "";
    renderCategorySelect();
    renderCards();
    showCardFeedback(`已切换到新分类「${name}」，现在添加的字卡会放进去。`);
    els.newCardInput.focus();
  }

  function fillProfileForm() {
    const profile = ProfileStore.get();
    if (els.inputTaName) els.inputTaName.value = profile.taName || "";
    if (els.inputUserName) els.inputUserName.value = profile.userName || "";
    if (els.inputTaCall) els.inputTaCall.value = profile.taCall || "";
    if (els.inputUserCall) els.inputUserCall.value = profile.userCall || "";
  }

  function saveProfile() {
    const ok = ProfileStore.update({
      taName: els.inputTaName.value,
      userName: els.inputUserName.value,
      taCall: els.inputTaCall.value,
      userCall: els.inputUserCall.value
    });

    if (!ok) {
      showProfileFeedback("保存失败，可能是存储空间不足。", true);
      return;
    }

    fillProfileForm();
    Chat.refreshAppearance();
    showProfileFeedback("设置已保存。");
  }

  function renderAvatarPreview(el, role) {
    if (!el) return;
    const dataUrl = AvatarStore.get(role);
    const profile = ProfileStore.get();
    const name =
      role === "user"
        ? profile.userName || window.APP_CONFIG.userName || "我"
        : profile.taName || window.APP_CONFIG.taName || "TA";

    el.classList.toggle(
      role === "user" ? "avatar--user-default" : "avatar--ta-default",
      !dataUrl
    );
    el.style.backgroundImage = dataUrl ? `url('${dataUrl}')` : "";
    el.textContent = dataUrl ? "" : name.slice(0, 1);
  }

  function renderAvatarSettings() {
    renderAvatarPreview(els.settingsTaAvatar, "ta");
    renderAvatarPreview(els.settingsUserAvatar, "user");
  }

  function readImageFile(file, maxSize, onSuccess, onError) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return onError("请选择图片文件。");
    if (file.size > maxSize) {
      return onError(
        `图片太大，请选择 ${Math.floor(maxSize / 1024 / 1024)}MB 以内的图片。`
      );
    }
    const reader = new FileReader();
    reader.onload = () => onSuccess(String(reader.result || ""));
    reader.onerror = () => onError("读取图片失败，请重试。");
    reader.readAsDataURL(file);
  }

  function onAvatarPicked() {
    const file = els.avatarFileInput.files && els.avatarFileInput.files[0];
    const role = pickingRole;
    if (!file || !role) return;

    readImageFile(
      file,
      2 * 1024 * 1024,
      (dataUrl) => {
        if (!AvatarStore.set(role, dataUrl)) {
          showProfileFeedback("保存失败，可能是存储空间不足。", true);
          return;
        }
        renderAvatarSettings();
        Chat.refreshAppearance();
        showProfileFeedback(role === "ta" ? "TA 的头像已更新。" : "你的头像已更新。");
      },
      (message) => showProfileFeedback(message, true)
    );
  }

  function onBackgroundPicked() {
    const file = els.backgroundFileInput.files && els.backgroundFileInput.files[0];
    if (!file) return;

    readImageFile(
      file,
      2 * 1024 * 1024,
      (dataUrl) => {
        const ok = ProfileStore.update({ chatBackground: dataUrl });
        if (!ok) {
          showProfileFeedback("背景保存失败，可能是存储空间不足。", true);
          return;
        }
        Chat.refreshAppearance();
        showProfileFeedback("聊天背景已更新。");
      },
      (message) => showProfileFeedback(message, true)
    );
  }

  function clearBackground() {
    ProfileStore.clearBackground();
    Chat.refreshAppearance();
    showProfileFeedback("已恢复默认聊天背景。");
  }

  return { init };
})();
