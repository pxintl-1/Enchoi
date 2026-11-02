const Settings = (() => {
  let els = {};
  let feedbackTimer = null;
  let profileFeedbackTimer = null;
  let themeFeedbackTimer = null;
  let bubbleFeedbackTimer = null;
  let customCssFeedbackTimer = null;
  let pickingRole = null;

  let activeCategory = CardDeck.ALL_CATEGORY;
  let chatCategory = CardDeck.ALL_CATEGORY;
  let saveCategory = CardDeck.DEFAULT_CATEGORY;

  function init() {
    els.viewHome = document.getElementById("view-home");
    els.viewChat = document.getElementById("view-chat");
    els.viewCards = document.getElementById("view-cards");
    els.viewSettings = document.getElementById("view-settings");

    els.backHome = document.getElementById("back-home");
    els.appChatDock = document.getElementById("app-chat-dock");

    els.openCardsBtn = document.getElementById("open-cards-page");
    els.openSettingsBtn = document.getElementById("open-settings-page");
    els.backBtn = document.getElementById("back-to-chat");
    els.backBtn2 = document.getElementById("back-to-chat-2");
    els.cardsToHome = document.getElementById("cards-to-home");
    els.settingsToHome = document.getElementById("settings-to-home");

    els.cardCount = document.getElementById("card-count");
    els.categorySelect = document.getElementById("card-category-select");
    els.saveCategorySelect = document.getElementById("save-category-select");
    els.newCardInput = document.getElementById("new-card-input");
    els.saveCardBtn = document.getElementById("save-card-btn");
    els.cardFeedback = document.getElementById("card-feedback");
    els.cardList = document.getElementById("card-list");
    els.cardEmpty = document.getElementById("card-empty");
    els.categoryTabs = document.getElementById("category-tabs");
    els.newCategoryInput = document.getElementById("new-category-input");
    els.addCategoryBtn = document.getElementById("add-category-btn");

    els.inputTaName = document.getElementById("input-ta-name");
    els.inputUserName = document.getElementById("input-user-name");
    els.inputTaCall = document.getElementById("input-ta-call");
    els.inputUserCall = document.getElementById("input-user-call");
    els.saveProfileBtn = document.getElementById("save-profile-btn");
    els.profileFeedback = document.getElementById("profile-feedback");

    els.themeToggle = document.getElementById("theme-toggle");
    els.settingsThemeToggle = document.getElementById("settings-theme-toggle");
    els.themeFeedback = document.getElementById("theme-feedback");

    els.bubbleStyleSelect = document.getElementById("bubble-style-select");
    els.bubbleFeedback = document.getElementById("bubble-feedback");

    els.customCssInput = document.getElementById("custom-css-input");
    els.applyCustomCssBtn = document.getElementById("apply-custom-css-btn");
    els.clearCustomCssBtn = document.getElementById("clear-custom-css-btn");
    els.customCssFeedback = document.getElementById("custom-css-feedback");

    els.settingsTaAvatar = document.getElementById("settings-ta-avatar");
    els.settingsUserAvatar = document.getElementById("settings-user-avatar");
    els.avatarFileInput = document.getElementById("avatar-file-input");
    els.backgroundFileInput = document.getElementById("background-file-input");
    els.pickBackgroundBtn = document.getElementById("pick-background-btn");
    els.clearBackgroundBtn = document.getElementById("clear-background-btn");

    Home.init();

    els.backHome.addEventListener("click", () => Home.showHome());
    els.appChatDock.addEventListener("click", () => Home.show("chat"));

    if (els.cardsToHome) {
      els.cardsToHome.addEventListener("click", () => Home.showHome());
    }

    if (els.settingsToHome) {
      els.settingsToHome.addEventListener("click", () => Home.showHome());
    }

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

    els.saveCategorySelect.addEventListener("change", () => {
      saveCategory = els.saveCategorySelect.value || CardDeck.DEFAULT_CATEGORY;
      els.saveCategorySelect.blur();
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

    els.cardList.addEventListener("click", onCardListClick);

    if (els.themeToggle) {
      els.themeToggle.addEventListener("click", toggleTheme);
    }

    if (els.settingsThemeToggle) {
      els.settingsThemeToggle.addEventListener("click", toggleTheme);
    }

    if (els.bubbleStyleSelect) {
      els.bubbleStyleSelect.value = BubbleStore.get();
      els.bubbleStyleSelect.addEventListener("change", onBubbleStyleChange);
    }

    if (els.applyCustomCssBtn) {
      els.applyCustomCssBtn.addEventListener("click", applyCustomCss);
    }

    if (els.clearCustomCssBtn) {
      els.clearCustomCssBtn.addEventListener("click", clearCustomCss);
    }

    if (els.customCssInput) {
      els.customCssInput.value = CustomCssStore.get();
    }

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

    updateThemeButton();
    renderCategorySelect();
    renderSaveCategorySelect();
    renderCards();
    renderAvatarSettings();
    fillProfileForm();
    updateHomeClock();

    Chat.setCardCategory(chatCategory);
  }

  function showCardsView() {
    Home.show("cards");
    renderCategorySelect();
    renderSaveCategorySelect();
    renderCards();
  }

  function showSettingsView() {
    Home.show("settings");
    renderAvatarSettings();
    fillProfileForm();
    if (els.customCssInput) {
      els.customCssInput.value = CustomCssStore.get();
    }
  }

  function showChatView() {
    Home.show("chat");
  }

  function updateHomeClock() {
    const timeEl = document.getElementById("home-time");
    const dateEl = document.getElementById("home-date");
    if (!timeEl || !dateEl) return;

    function tick() {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      timeEl.textContent = `${hh}:${mm}`;
      dateEl.textContent = now.toLocaleDateString("zh-CN", {
        month: "long",
        day: "numeric",
        weekday: "long"
      });
    }

    tick();
    window.setInterval(tick, 30000);
  }

  function updateThemeButton() {
    if (!els.themeToggle) return;
    const isDark = ThemeStore.get() === ThemeStore.DARK;
    els.themeToggle.textContent = isDark ? "日间" : "夜间";
  }

  function toggleTheme() {
    const next = ThemeStore.toggle();
    updateThemeButton();

    if (!els.themeFeedback) return;

    els.themeFeedback.textContent =
      next === ThemeStore.DARK ? "已切换到夜间模式。" : "已切换到日间模式。";

    if (themeFeedbackTimer) clearTimeout(themeFeedbackTimer);

    themeFeedbackTimer = window.setTimeout(() => {
      els.themeFeedback.textContent = "";
    }, 2200);
  }

  function onBubbleStyleChange() {
    const next = els.bubbleStyleSelect.value;
    BubbleStore.set(next);

    if (!els.bubbleFeedback) return;

    const labels = {
      default: "微信经典",
      rounded: "大圆角",
      minimal: "极简无箭头",
      soft: "柔和阴影"
    };

    els.bubbleFeedback.textContent = `已切换为「${labels[next] || next}」。`;

    if (bubbleFeedbackTimer) clearTimeout(bubbleFeedbackTimer);

    bubbleFeedbackTimer = window.setTimeout(() => {
      els.bubbleFeedback.textContent = "";
    }, 2200);
  }

  function applyCustomCss() {
    const value = els.customCssInput.value;
    const ok = CustomCssStore.set(value);

    if (!els.customCssFeedback) return;

    els.customCssFeedback.textContent = ok
      ? "已应用，聊天页立即生效。"
      : "保存失败，可能是存储空间不足。";

    els.customCssFeedback.classList.toggle("is-error", !ok);

    if (customCssFeedbackTimer) clearTimeout(customCssFeedbackTimer);

    customCssFeedbackTimer = window.setTimeout(() => {
      els.customCssFeedback.textContent = "";
      els.customCssFeedback.classList.remove("is-error");
    }, 2600);
  }

  function clearCustomCss() {
    CustomCssStore.clear();
    els.customCssInput.value = "";

    if (!els.customCssFeedback) return;

    els.customCssFeedback.textContent = "已清空自定义 CSS。";
    els.customCssFeedback.classList.remove("is-error");

    if (customCssFeedbackTimer) clearTimeout(customCssFeedbackTimer);

    customCssFeedbackTimer = window.setTimeout(() => {
      els.customCssFeedback.textContent = "";
    }, 2600);
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

  function renderSaveCategorySelect() {
    if (!els.saveCategorySelect) return;

    const categories = CardDeck.getCategories();

    if (!categories.includes(saveCategory)) {
      saveCategory = CardDeck.DEFAULT_CATEGORY;
    }

    els.saveCategorySelect.innerHTML = categories
      .map(
        (cat) => `<option value="${escapeAttr(cat)}">${escapeHtml(cat)}</option>`
      )
      .join("");

    els.saveCategorySelect.value = saveCategory;
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

    if (els.cardCount) {
      els.cardCount.textContent = String(CardDeck.getAll().length);
    }

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
            <div class="card-list__main">
              <span class="card-list__category">${escapeHtml(card.category)}</span>
              <span class="card-list__text">${escapeHtml(card.text)}</span>
            </div>
            <div class="card-list__actions">
              <button type="button" class="small-btn" data-edit-category="${escapeAttr(card.category)}" data-edit-text="${escapeAttr(card.text)}">编辑</button>
              <button type="button" class="small-btn small-btn--danger" data-remove-category="${escapeAttr(card.category)}" data-remove-text="${escapeAttr(card.text)}">删除</button>
            </div>
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

  function onCardListClick(event) {
    const editBtn = event.target.closest("[data-edit-text]");
    if (editBtn) {
      editCard(editBtn.dataset.editCategory, editBtn.dataset.editText);
      return;
    }

    const removeBtn = event.target.closest("[data-remove-text]");
    if (removeBtn) {
      removeCard(removeBtn.dataset.removeCategory, removeBtn.dataset.removeText);
    }
  }

  function findCardIndex(category, text) {
    return CardDeck.getAll().findIndex(
      (card) => card.category === category && card.text === text
    );
  }

  function editCard(category, text) {
    const index = findCardIndex(category, text);

    if (index < 0) {
      showCardFeedback("找不到这张字卡，可能已经被删除。", true);
      return;
    }

    const nextText = window.prompt("修改字卡内容：", text);
    if (nextText === null) return;

    const trimmed = nextText.trim();
    if (!trimmed) {
      showCardFeedback("字卡内容不能为空。", true);
      return;
    }

    const categoryList = CardDeck.getCategories();
    const nextCategory = window.prompt(
      `修改分类（留空保持「${category}」）：\n可选：${categoryList.join(" / ")}`,
      category
    );

    if (nextCategory === null) return;

    const targetCategory = nextCategory.trim() || category;
    const result = CardDeck.updateAt(index, {
      text: trimmed,
      category: targetCategory
    });

    if (!result.ok) {
      showCardFeedback(result.msg, true);
      return;
    }

    renderCategorySelect();
    renderSaveCategorySelect();
    renderCards();
    showCardFeedback(`已更新为「${result.category}」下的字卡。`);
  }

  function removeCard(category, text) {
    const index = findCardIndex(category, text);

    if (index < 0) {
      showCardFeedback("找不到这张字卡，可能已经被删除。", true);
      return;
    }

    if (!window.confirm(`确定删除这张字卡吗？\n\n「${text}」`)) return;

    if (!CardDeck.removeAt(index)) {
      showCardFeedback("删除失败，请重试。", true);
      return;
    }

    renderCategorySelect();
    renderSaveCategorySelect();
    renderCards();
    showCardFeedback("字卡已删除。");
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

    const targetCategory = saveCategory || CardDeck.DEFAULT_CATEGORY;
    const result = CardDeck.importFromArray(lines, targetCategory);

    if (!result.ok) {
      showCardFeedback(result.msg, true);
      return;
    }

    els.newCardInput.value = "";
    renderCategorySelect();
    renderSaveCategorySelect();
    renderCards();

    const skipped = lines.length - result.added;

    if (lines.length === 1) {
      if (result.added === 1) {
        showCardFeedback(`已保存到「${targetCategory}」。`);
      } else {
        showCardFeedback(`「${targetCategory}」里已经有这张字卡了。`, true);
      }
    } else {
      const parts = [`已添加 ${result.added} 张到「${targetCategory}」`];
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

    const result = CardDeck.addCategory(name);

    if (!result.ok) {
      showCardFeedback(result.msg, true);
      return;
    }

    saveCategory = result.category;
    els.newCategoryInput.value = "";
    renderCategorySelect();
    renderSaveCategorySelect();
    renderCards();
    showCardFeedback(`已创建分类「${result.category}」，新增字卡默认保存到该分类。`);
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
