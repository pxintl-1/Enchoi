const Settings = (() => {
  let els = {};
  let feedbackTimer = null;
  let profileFeedbackTimer = null;
  let contactFeedbackTimer = null;
  let transferFeedbackTimer = null;
  let themeFeedbackTimer = null;
  let bubbleFeedbackTimer = null;
  let customCssFeedbackTimer = null;
  let proactiveFeedbackTimer = null;
  let pickingRole = null;

  let activeCategory = CardDeck.ALL_CATEGORY;
  let chatCategory = CardDeck.ALL_CATEGORY;
  let saveCategory = CardDeck.DEFAULT_CATEGORY;
  let exportSelected = new Set();
  let editingContactId = null;

  let cardsOrigin = "home";
  let settingsOrigin = "contacts";

  function init() {
    els.viewHome = document.getElementById("view-home");
    els.viewContacts = document.getElementById("view-contacts");
    els.viewChat = document.getElementById("view-chat");
    els.viewCards = document.getElementById("view-cards");
    els.viewSettings = document.getElementById("view-settings");

    els.contactsToHome = document.getElementById("contacts-to-home");
    els.contactsToSettings = document.getElementById("contacts-to-settings");
    els.cardsBack = document.getElementById("cards-back");
    els.cardsToHome = document.getElementById("cards-to-home");
    els.settingsToHome = document.getElementById("settings-to-home");
    els.backContacts = document.getElementById("back-contacts");
    els.backToChat2 = document.getElementById("back-to-chat-2");

    els.appChatDock = document.getElementById("app-chat-dock");

    els.newContactInput = document.getElementById("new-contact-input");
    els.addContactBtn = document.getElementById("add-contact-btn");
    els.contactFeedback = document.getElementById("contact-feedback");
    els.contactList = document.getElementById("contact-list");
    els.contactEmpty = document.getElementById("contact-empty");

    els.openCardsBtn2 = document.getElementById("open-cards-page-2");
    els.openSettingsBtn = document.getElementById("open-settings-page");

    els.cardsOwnerSelect = document.getElementById("cards-owner-select");
    els.categorySelect = document.getElementById("card-category-select");
    els.saveCategorySelect = document.getElementById("save-category-select");
    els.exportCategoryList = document.getElementById("export-category-list");
    els.exportSelectAll = document.getElementById("export-select-all");
    els.exportSelectNone = document.getElementById("export-select-none");
    els.exportSelectedHint = document.getElementById("export-selected-hint");

    els.newCardInput = document.getElementById("new-card-input");
    els.saveCardBtn = document.getElementById("save-card-btn");
    els.cardFeedback = document.getElementById("card-feedback");
    els.cardList = document.getElementById("card-list");
    els.cardEmpty = document.getElementById("card-empty");
    els.categoryTabs = document.getElementById("category-tabs");
    els.newCategoryInput = document.getElementById("new-category-input");
    els.addCategoryBtn = document.getElementById("add-category-btn");

    els.exportCardsBtn = document.getElementById("export-cards-btn");
    els.importCardsBtn = document.getElementById("import-cards-btn");
    els.importCardsFile = document.getElementById("import-cards-file");
    els.transferFeedback = document.getElementById("transfer-feedback");

    els.inputTaName = document.getElementById("input-ta-name");
    els.inputUserName = document.getElementById("input-user-name");
    els.inputTaCall = document.getElementById("input-ta-call");
    els.inputUserCall = document.getElementById("input-user-call");
    els.saveProfileBtn = document.getElementById("save-profile-btn");
    els.profileFeedback = document.getElementById("profile-feedback");

    els.themeToggle = document.getElementById("theme-toggle");
    els.settingsThemeToggle = document.getElementById("settings-theme-toggle");
    els.themeFeedback = document.getElementById("theme-feedback");

    els.proactiveToggle = document.getElementById("proactive-toggle");
    els.proactiveStatus = document.getElementById("proactive-status");
    els.proactiveInterval = document.getElementById("proactive-interval");
    els.proactiveIntervalValue = document.getElementById("proactive-interval-value");
    els.proactiveChance = document.getElementById("proactive-chance");
    els.proactiveChanceValue = document.getElementById("proactive-chance-value");
    els.proactiveFeedback = document.getElementById("proactive-feedback");

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

    if (els.appChatDock) {
      els.appChatDock.addEventListener("click", () => Home.show("contacts"));
    }
    if (els.contactsToHome) {
      els.contactsToHome.addEventListener("click", () => Home.showHome());
    }
    if (els.contactsToSettings) {
      els.contactsToSettings.addEventListener("click", () => {
        settingsOrigin = "contacts";
        Home.show("settings");
      });
    }
    if (els.cardsBack) {
      els.cardsBack.addEventListener("click", () => {
        if (cardsOrigin === "chat") {
          Home.show("chat");
        } else if (cardsOrigin === "home") {
          Home.showHome();
        } else {
          Home.show("contacts");
        }
      });
    }
    if (els.cardsToHome) {
      els.cardsToHome.addEventListener("click", () => Home.showHome());
    }
    if (els.settingsToHome) {
      els.settingsToHome.addEventListener("click", () => Home.showHome());
    }
    if (els.backContacts) {
      els.backContacts.addEventListener("click", () => Home.show("contacts"));
    }
    if (els.backToChat2) {
      els.backToChat2.addEventListener("click", () => {
        if (settingsOrigin === "chat") {
          Home.show("chat");
        } else {
          Home.show("contacts");
        }
      });
    }

    if (els.openCardsBtn2) {
      els.openCardsBtn2.addEventListener("click", () => {
        cardsOrigin = "chat";
        openCardsView();
      });
    }
    if (els.openSettingsBtn) {
      els.openSettingsBtn.addEventListener("click", () => {
        settingsOrigin = "chat";
        Home.show("settings");
      });
    }

    if (els.addContactBtn) {
      els.addContactBtn.addEventListener("click", addContact);
    }
    if (els.newContactInput) {
      els.newContactInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          addContact();
        }
      });
    }
    if (els.contactList) {
      els.contactList.addEventListener("click", onContactListClick);
    }

    if (els.saveCardBtn) {
      els.saveCardBtn.addEventListener("click", saveCards);
    }
    if (els.newCardInput) {
      els.newCardInput.addEventListener("keydown", (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
          event.preventDefault();
          saveCards();
        }
      });
    }
    if (els.addCategoryBtn) {
      els.addCategoryBtn.addEventListener("click", addCategory);
    }
    if (els.newCategoryInput) {
      els.newCategoryInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          addCategory();
        }
      });
    }
    if (els.categoryTabs) {
      els.categoryTabs.addEventListener("click", onCategoryTabClick);
    }
    if (els.cardList) {
      els.cardList.addEventListener("click", onCardListClick);
    }
    if (els.categorySelect) {
      els.categorySelect.addEventListener("change", onChatCategoryChange);
    }
    if (els.saveCategorySelect) {
      els.saveCategorySelect.addEventListener("change", () => {
        saveCategory = els.saveCategorySelect.value || CardDeck.DEFAULT_CATEGORY;
        els.saveCategorySelect.blur();
      });
    }
    if (els.cardsOwnerSelect) {
      els.cardsOwnerSelect.addEventListener("change", onCardsOwnerChange);
    }

    if (els.exportCategoryList) {
      els.exportCategoryList.addEventListener("change", (event) => {
        const input = event.target.closest("[data-export-category]");
        if (!input) return;
        const name = input.dataset.exportCategory;

        if (input.checked) {
          exportSelected.add(name);
        } else {
          exportSelected.delete(name);
        }

        updateExportSelectedHint();
      });
    }
    if (els.exportSelectAll) {
      els.exportSelectAll.addEventListener("click", () => {
        CardDeck.getCategories().forEach((cat) => exportSelected.add(cat));
        renderExportCategoryList();
      });
    }
    if (els.exportSelectNone) {
      els.exportSelectNone.addEventListener("click", () => {
        exportSelected.clear();
        renderExportCategoryList();
      });
    }

    if (els.exportCardsBtn) {
      els.exportCardsBtn.addEventListener("click", exportCards);
    }
    if (els.importCardsBtn) {
      els.importCardsBtn.addEventListener("click", () => {
        els.importCardsFile.value = "";
        els.importCardsFile.click();
      });
    }
    if (els.importCardsFile) {
      els.importCardsFile.addEventListener("change", onImportFilePicked);
    }

    if (els.themeToggle) {
      els.themeToggle.addEventListener("click", toggleTheme);
    }
    if (els.settingsThemeToggle) {
      els.settingsThemeToggle.addEventListener("click", toggleTheme);
    }

    if (els.proactiveToggle) {
      els.proactiveToggle.addEventListener("click", toggleProactive);
    }
    if (els.proactiveInterval) {
      els.proactiveInterval.addEventListener("input", onProactiveIntervalInput);
      els.proactiveInterval.addEventListener("change", onProactiveIntervalChange);
    }
    if (els.proactiveChance) {
      els.proactiveChance.addEventListener("input", onProactiveChanceInput);
      els.proactiveChance.addEventListener("change", onProactiveChanceChange);
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

    if (els.saveProfileBtn) {
      els.saveProfileBtn.addEventListener("click", saveProfile);
    }
    if (els.avatarFileInput) {
      els.avatarFileInput.addEventListener("change", onAvatarPicked);
    }
    if (els.backgroundFileInput) {
      els.backgroundFileInput.addEventListener("change", onBackgroundPicked);
    }
    if (els.pickBackgroundBtn) {
      els.pickBackgroundBtn.addEventListener("click", () => {
        els.backgroundFileInput.value = "";
        els.backgroundFileInput.click();
      });
    }
    if (els.clearBackgroundBtn) {
      els.clearBackgroundBtn.addEventListener("click", clearBackground);
    }

    document.querySelectorAll("[data-pick-avatar]").forEach((button) => {
      button.addEventListener("click", () => {
        pickingRole = button.dataset.pickAvatar;
        els.avatarFileInput.value = "";
        els.avatarFileInput.click();
      });
    });

    document.querySelectorAll("[data-clear-avatar]").forEach((button) => {
      button.addEventListener("click", () => {
        clearAvatar(button.dataset.clearAvatar);
      });
    });

    document.addEventListener("app:viewchange", (event) => {
      const view = event.detail && event.detail.view;
      if (view === "contacts") renderContacts();
      if (view === "cards") refreshCardsView();
      if (view === "settings") refreshSettingsView();
      if (view === "chat") Chat.refreshAppearance();
    });

    updateThemeButton();
    renderProactive();
    renderContacts();
    updateHomeClock();
  }

  function openCardsView() {
    editingContactId = Contacts.getActiveId();
    CardDeck.loadFor(editingContactId);
    activeCategory = CardDeck.ALL_CATEGORY;
    exportSelected = new Set();
    Home.show("cards");
  }

  function currentContact() {
    return Contacts.getActive();
  }

  function editingContact() {
    if (editingContactId) {
      const found = Contacts.get(editingContactId);
      if (found) return found;
    }
    return currentContact();
  }

  function switchContact(id) {
    if (!Contacts.setActive(id)) return;
    const c = Contacts.getActive();
    CardDeck.loadFor(c.id);
    activeCategory = CardDeck.ALL_CATEGORY;
    chatCategory = CardDeck.ALL_CATEGORY;
    saveCategory = CardDeck.DEFAULT_CATEGORY;
    exportSelected = new Set();
    editingContactId = c.id;
    Chat.setContact(c.id);
    renderContacts();
    renderCategorySelect();
    renderSaveCategorySelect();
    renderExportCategoryList();
    renderCards();
  }

  function onCardsOwnerChange() {
    const id = els.cardsOwnerSelect.value;
    if (!Contacts.get(id)) return;

    editingContactId = id;
    CardDeck.loadFor(id);
    activeCategory = CardDeck.ALL_CATEGORY;
    chatCategory = CardDeck.ALL_CATEGORY;
    saveCategory = CardDeck.DEFAULT_CATEGORY;
    exportSelected = new Set();
    renderCategorySelect();
    renderSaveCategorySelect();
    renderExportCategoryList();
    renderCards();
  }

  function renderCardsOwnerSelect() {
    if (!els.cardsOwnerSelect) return;

    const contacts = Contacts.getAll();
    const target = editingContact();

    els.cardsOwnerSelect.innerHTML = contacts
      .map(
        (contact) =>
          `<option value="${escapeAttr(contact.id)}">${escapeHtml(contact.name)}</option>`
      )
      .join("");

    els.cardsOwnerSelect.value = target.id;
    editingContactId = target.id;
  }

  function renderContacts() {
    const list = Contacts.getAll();
    const activeId = Contacts.getActiveId();

    if (list.length === 0) {
      els.contactList.innerHTML = "";
      els.contactEmpty.hidden = false;
      return;
    }

    els.contactEmpty.hidden = true;

    els.contactList.innerHTML = list
      .map((contact) => {
        const dataUrl = contact.avatar || "";
        const initial = (contact.name || "T").slice(0, 1);
        const avatar = dataUrl
          ? `<div class="avatar avatar--md" style="background-image:url('${dataUrl}')"></div>`
          : `<div class="avatar avatar--md avatar--ta-default">${escapeHtml(initial)}</div>`;
        const activeClass = contact.id === activeId ? " is-active" : "";

        return `
          <li class="contact-item${activeClass}">
            <button type="button" class="contact-item__main" data-contact-open="${escapeAttr(contact.id)}">
              ${avatar}
              <span class="contact-item__name">${escapeHtml(contact.name)}</span>
            </button>
            <button type="button" class="small-btn small-btn--danger" data-contact-remove="${escapeAttr(contact.id)}">删除</button>
          </li>
        `;
      })
      .join("");
  }

  function onContactListClick(event) {
    const openBtn = event.target.closest("[data-contact-open]");
    if (openBtn) {
      const id = openBtn.dataset.contactOpen;
      switchContact(id);
      Home.show("chat");
      return;
    }

    const removeBtn = event.target.closest("[data-contact-remove]");
    if (removeBtn) {
      const id = removeBtn.dataset.contactRemove;
      const contact = Contacts.get(id);
      if (!contact) return;
      if (!window.confirm(`确定删除好友「${contact.name}」吗？`)) return;

      const result = Contacts.remove(id);
      if (!result.ok) {
        showContactFeedback(result.msg, true);
        return;
      }

      if (Contacts.getActiveId() === id) {
        const next = Contacts.getActive();
        Chat.setContact(next.id);
      }

      if (editingContactId === id) {
        editingContactId = Contacts.getActiveId();
      }

      renderContacts();
      showContactFeedback("好友已删除。");
    }
  }

  function addContact() {
    const name = els.newContactInput.value;
    const result = Contacts.add(name);

    if (!result.ok) {
      showContactFeedback(result.msg, true);
      return;
    }

    els.newContactInput.value = "";
    switchContact(result.contact.id);
    renderContacts();
    showContactFeedback(`已添加好友「${result.contact.name}」。`);
  }

  function showContactFeedback(message, isError) {
    if (!els.contactFeedback) return;
    els.contactFeedback.textContent = message;
    els.contactFeedback.classList.toggle("is-error", Boolean(isError));
    if (contactFeedbackTimer) clearTimeout(contactFeedbackTimer);
    contactFeedbackTimer = window.setTimeout(() => {
      els.contactFeedback.textContent = "";
      els.contactFeedback.classList.remove("is-error");
    }, 2600);
  }

  function showTransferFeedback(message, isError) {
    if (!els.transferFeedback) return;
    els.transferFeedback.textContent = message;
    els.transferFeedback.classList.toggle("is-error", Boolean(isError));
    if (transferFeedbackTimer) clearTimeout(transferFeedbackTimer);
    transferFeedbackTimer = window.setTimeout(() => {
      els.transferFeedback.textContent = "";
      els.transferFeedback.classList.remove("is-error");
    }, 3600);
  }

  function showProactiveFeedback(message) {
    if (!els.proactiveFeedback) return;
    els.proactiveFeedback.textContent = message;
    if (proactiveFeedbackTimer) clearTimeout(proactiveFeedbackTimer);
    proactiveFeedbackTimer = window.setTimeout(() => {
      els.proactiveFeedback.textContent = "";
    }, 2200);
  }

  function renderProactive() {
    const cfg = Proactive.get();

    if (els.proactiveToggle) {
      els.proactiveToggle.textContent = cfg.enabled ? "已开启" : "未开启";
      els.proactiveToggle.classList.toggle("is-on", cfg.enabled);
    }

    if (els.proactiveStatus) {
      els.proactiveStatus.textContent = cfg.enabled
        ? `开启中 · 每 ${cfg.intervalMin} 分钟判断一次`
        : "关闭中";
    }

    if (els.proactiveInterval) {
      els.proactiveInterval.value = cfg.intervalMin;
    }

    if (els.proactiveIntervalValue) {
      els.proactiveIntervalValue.textContent = `每 ${cfg.intervalMin} 分钟判断一次`;
    }

    if (els.proactiveChance) {
      els.proactiveChance.value = Math.round(cfg.chance * 100);
    }

    if (els.proactiveChanceValue) {
      els.proactiveChanceValue.textContent = `每次判断有 ${Math.round(cfg.chance * 100)}% 概率发出`;
    }
  }

  function toggleProactive() {
    const cfg = Proactive.get();
    Proactive.set({ enabled: !cfg.enabled });
    renderProactive();
    showProactiveFeedback(
      Proactive.get().enabled ? "已开启主动发消息。" : "已关闭主动发消息。"
    );
  }

  function onProactiveIntervalInput() {
    const value = Number(els.proactiveInterval.value) || 5;
    if (els.proactiveIntervalValue) {
      els.proactiveIntervalValue.textContent = `每 ${value} 分钟判断一次`;
    }
  }

  function onProactiveIntervalChange() {
    const value = Number(els.proactiveInterval.value) || 5;
    Proactive.set({ intervalMin: value });
    renderProactive();
    showProactiveFeedback(`间隔已改为 ${value} 分钟。`);
  }

  function onProactiveChanceInput() {
    const value = Number(els.proactiveChance.value) || 60;
    if (els.proactiveChanceValue) {
      els.proactiveChanceValue.textContent = `每次判断有 ${value}% 概率发出`;
    }
  }

  function onProactiveChanceChange() {
    const value = Number(els.proactiveChance.value) || 60;
    Proactive.set({ chance: value / 100 });
    renderProactive();
    showProactiveFeedback(`触发概率已改为 ${value}%。`);
  }

  function refreshCardsView() {
    if (!editingContactId || !Contacts.get(editingContactId)) {
      editingContactId = Contacts.getActiveId();
    }
    CardDeck.loadFor(editingContactId);
    renderCardsOwnerSelect();
    renderCategorySelect();
    renderSaveCategorySelect();
    renderExportCategoryList();
    renderCards();
  }

  function refreshSettingsView() {
    renderAvatarSettings();
    fillProfileForm();
    renderProactive();
    if (els.customCssInput) {
      els.customCssInput.value = CustomCssStore.get();
    }
  }

  function renderExportCategoryList() {
    if (!els.exportCategoryList) return;

    const categories = CardDeck.getCategories();

    [...exportSelected].forEach((name) => {
      if (!categories.includes(name)) exportSelected.delete(name);
    });

    if (categories.length === 0) {
      els.exportCategoryList.innerHTML =
        '<p class="hint">当前好友还没有任何分类。</p>';
      updateExportSelectedHint();
      return;
    }

    els.exportCategoryList.innerHTML = categories
      .map((cat) => {
        const checked = exportSelected.has(cat) ? " checked" : "";
        return `
          <label>
            <input type="checkbox" data-export-category="${escapeAttr(cat)}"${checked}>
            <span>${escapeHtml(cat)}</span>
          </label>
        `;
      })
      .join("");

    updateExportSelectedHint();
  }

  function updateExportSelectedHint() {
    if (!els.exportSelectedHint) return;

    if (exportSelected.size === 0) {
      els.exportSelectedHint.textContent = "未选择时默认导出全部分类。";
      return;
    }

    els.exportSelectedHint.textContent = `已选择：${[...exportSelected].join(
      "、"
    )}`;
  }

  function exportCards() {
    const contact = editingContact();
    const all = CardDeck.getAll();

    const selected = [...exportSelected];
    const cards =
      selected.length === 0
        ? all
        : all.filter((card) => selected.includes(card.category));

    if (cards.length === 0) {
      showTransferFeedback(
        selected.length === 0
          ? "当前好友字卡库是空的，没有可导出的内容。"
          : "所选分类下没有字卡。",
        true
      );
      return;
    }

    const payload = {
      type: "private-chat-cards",
      version: 1,
      contactName: contact.name || "TA",
      categories: selected.length === 0 ? "全部分类" : selected,
      exportedAt: new Date().toISOString(),
      cards
    };

    try {
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json;charset=utf-8"
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const suffix =
        selected.length === 0
          ? "all"
          : selected.map((s) => s.replace(/\s+/g, "_")).join("_");
      link.href = url;
      link.download = `cards-${(contact.name || "TA")}-${suffix}-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      showTransferFeedback(
        `已导出 ${cards.length} 张字卡（${
          selected.length === 0 ? "全部分类" : selected.join("、")
        }）。`
      );
    } catch (error) {
      console.warn("导出失败", error);
      showTransferFeedback("导出失败，请重试。", true);
    }
  }

  function parseImportPayload(text) {
    const raw = String(text || "").trim();
    if (!raw) return null;

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      return null;
    }

    function normalizeList(list) {
      if (!Array.isArray(list)) return null;
      return list
        .map((item) => {
          if (typeof item === "string") {
            return { category: CardDeck.DEFAULT_CATEGORY, text: item.trim() };
          }
          if (item && typeof item === "object") {
            const text = String(item.text == null ? "" : item.text).trim();
            if (!text) return null;
            const category = String(
              item.category == null ? "" : item.category
            ).trim();
            return { category: category || CardDeck.DEFAULT_CATEGORY, text };
          }
          return null;
        })
        .filter(Boolean);
    }

    if (Array.isArray(parsed)) {
      return normalizeList(parsed);
    }

    if (parsed && Array.isArray(parsed.cards)) {
      return normalizeList(parsed.cards);
    }

    return null;
  }

  function onImportFilePicked() {
    const file = els.importCardsFile.files && els.importCardsFile.files[0];
    if (!file) return;

    if (!/\.json$/i.test(file.name) && file.type !== "application/json") {
      showTransferFeedback("请选择 JSON 文件。", true);
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const list = parseImportPayload(String(reader.result || ""));

      if (!list || list.length === 0) {
        showTransferFeedback("文件里没有可导入的字卡。", true);
        return;
      }

      const byCategory = new Map();
      list.forEach((item) => {
        const cat = item.category || CardDeck.DEFAULT_CATEGORY;
        if (!byCategory.has(cat)) byCategory.set(cat, []);
        byCategory.get(cat).push(item.text);
      });

      let added = 0;
      let total = 0;
      const touchedCategories = [];

      byCategory.forEach((texts, category) => {
        CardDeck.addCategory(category);
        const result = CardDeck.importFromArray(texts, category);
        if (result.ok) {
          added += result.added;
          total = result.total;
          if (result.added > 0) touchedCategories.push(category);
        }
      });

      renderCategorySelect();
      renderSaveCategorySelect();
      renderExportCategoryList();
      renderCards();

      const skipped = list.length - added;
      const parts = [`已导入 ${added} 张字卡`];

      if (touchedCategories.length > 0) {
        parts.push(`分类：${touchedCategories.join("、")}`);
      }

      if (skipped > 0) parts.push(`跳过 ${skipped} 张重复`);
      parts.push(`当前共 ${total} 张`);
      showTransferFeedback(parts.join("；") + "。");
    };

    reader.onerror = () => {
      showTransferFeedback("读取文件失败，请重试。", true);
    };

    reader.readAsText(file, "utf-8");
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
    const ok = CustomCssStore.set(els.customCssInput.value);
    if (!els.customCssFeedback) return;
    els.customCssFeedback.textContent = ok ? "已应用，聊天页立即生效。" : "保存失败，可能是存储空间不足。";
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
    const categories = CardDeck.getCategories();
    if (!categories.includes(saveCategory)) {
      saveCategory = CardDeck.DEFAULT_CATEGORY;
    }
    els.saveCategorySelect.innerHTML = categories
      .map((cat) => `<option value="${escapeAttr(cat)}">${escapeHtml(cat)}</option>`)
      .join("");
    els.saveCategorySelect.value = saveCategory;
  }

  function onChatCategoryChange() {
    chatCategory = els.categorySelect.value;
    els.categorySelect.blur();

    const target = editingContact();
    if (target && target.id === Contacts.getActiveId()) {
      Chat.setCardCategory(chatCategory);
    }

    showCardFeedback(
      chatCategory === CardDeck.ALL_CATEGORY
        ? "聊天将从全部分类里抽取。"
        : `聊天只从「${chatCategory}」里抽取。`
    );
  }

  function onCategoryTabClick(event) {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    activeCategory = button.dataset.category;
    renderCards();
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

    const result = CardDeck.updateAt(index, {
      text: trimmed,
      category: nextCategory.trim() || category
    });

    if (!result.ok) {
      showCardFeedback(result.msg, true);
      return;
    }

    renderCategorySelect();
    renderSaveCategorySelect();
    renderExportCategoryList();
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
    renderExportCategoryList();
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

    const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
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
    renderExportCategoryList();
    renderCards();

    const skipped = lines.length - result.added;
    if (lines.length === 1) {
      showCardFeedback(
        result.added === 1
          ? `已保存到「${targetCategory}」。`
          : `「${targetCategory}」里已经有这张字卡了。`,
        result.added !== 1
      );
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
    renderExportCategoryList();
    renderCards();
    showCardFeedback(`已创建分类「${result.category}」。`);
  }

  function fillProfileForm() {
    const profile = ProfileStore.get();
    const contact = currentContact();
    if (els.inputTaName) els.inputTaName.value = contact.name || "";
    if (els.inputUserName) els.inputUserName.value = profile.userName || "";
    if (els.inputTaCall) els.inputTaCall.value = contact.taCall || "";
    if (els.inputUserCall) els.inputUserCall.value = profile.userCall || "";
  }

  function saveProfile() {
    const profileOk = ProfileStore.update({
      userName: els.inputUserName.value,
      userCall: els.inputUserCall.value
    });

    if (!profileOk) {
      showProfileFeedback("保存失败，可能是存储空间不足。", true);
      return;
    }

    const contact = currentContact();
    const contactOk = Contacts.update(contact.id, {
      name: els.inputTaName.value,
      taCall: els.inputTaCall.value
    });

    if (!contactOk.ok) {
      showProfileFeedback(contactOk.msg, true);
      return;
    }

    fillProfileForm();
    Chat.refreshAppearance();
    renderContacts();
    showProfileFeedback("设置已保存。");
  }

  function renderAvatarPreview(el, role) {
    if (!el) return;

    if (role === "user") {
      const dataUrl = AvatarStore.get("user");
      const profile = ProfileStore.get();
      const name = profile.userName || window.APP_CONFIG.userName || "我";
      el.classList.toggle("avatar--user-default", !dataUrl);
      el.style.backgroundImage = dataUrl ? `url('${dataUrl}')` : "";
      el.textContent = dataUrl ? "" : name.slice(0, 1);
      return;
    }

    const contact = currentContact();
    const dataUrl = contact.avatar || "";
    el.classList.toggle("avatar--ta-default", !dataUrl);
    el.style.backgroundImage = dataUrl ? `url('${dataUrl}')` : "";
    el.textContent = dataUrl ? "" : (contact.name || "TA").slice(0, 1);
  }

  function renderAvatarSettings() {
    renderAvatarPreview(els.settingsTaAvatar, "ta");
    renderAvatarPreview(els.settingsUserAvatar, "user");
  }

  function readImageFile(file, maxSize, onSuccess, onError) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return onError("请选择图片文件。");
    if (file.size > maxSize) {
      return onError(`图片太大，请选择 ${Math.floor(maxSize / 1024 / 1024)}MB 以内的图片。`);
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
        if (role === "user") {
          if (!AvatarStore.set("user", dataUrl)) {
            showProfileFeedback("保存失败，可能是存储空间不足。", true);
            return;
          }
        } else {
          const contact = currentContact();
          const result = Contacts.update(contact.id, { avatar: dataUrl });
          if (!result.ok) {
            showProfileFeedback(result.msg, true);
            return;
          }
        }

        renderAvatarSettings();
        renderContacts();
        Chat.refreshAppearance();
        showProfileFeedback(role === "ta" ? "好友头像已更新。" : "你的头像已更新。");
      },
      (message) => showProfileFeedback(message, true)
    );
  }

  function clearAvatar(role) {
    if (role === "user") {
      AvatarStore.clear("user");
    } else {
      const contact = currentContact();
      Contacts.update(contact.id, { avatar: "" });
    }

    renderAvatarSettings();
    renderContacts();
    Chat.refreshAppearance();
    showProfileFeedback("已恢复默认头像。");
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
