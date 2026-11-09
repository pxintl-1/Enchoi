const Chat = (() => {
  let messages = [];
  let els = {};
  let replying = false;
  let replyTimer = null;
  let cardCategory = CardDeck.ALL_CATEGORY;
  let contactId = "default";

  const MULTI_KEY = "private_chat_multi_reply_v1";
  const MULTI_DEFAULT = 30;

  function loadMultiChance() {
    try {
      const raw = localStorage.getItem(MULTI_KEY);
      if (raw === null) return MULTI_DEFAULT;
      const num = Number(raw);
      if (!Number.isFinite(num)) return MULTI_DEFAULT;
      return Math.max(0, Math.min(100, Math.round(num)));
    } catch (error) {
      return MULTI_DEFAULT;
    }
  }

  function init() {
    els.list = document.getElementById("message-list");
    els.input = document.getElementById("message-input");
    els.send = document.getElementById("send-btn");
    els.status = document.getElementById("typing-status");
    els.headerTaAvatar = document.getElementById("header-ta-avatar");
    els.taName = document.getElementById("ta-name");

    els.send.addEventListener("click", send);

    els.input.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        send();
      }
    });

    els.input.addEventListener("input", resizeInput);
  }

  function setContact(id) {
    contactId = id || "default";
    messages = Storage.getHistory(contactId);
    if (!Array.isArray(messages)) messages = [];
    cardCategory = CardDeck.ALL_CATEGORY;
    CardDeck.loadFor(contactId);
    renderHeader();
    render();
    updateStatus();
  }

  function resizeInput() {
    els.input.style.height = "auto";
    els.input.style.height = Math.min(els.input.scrollHeight, 110) + "px";
  }

  function formatTime(timestamp) {
    const date = new Date(timestamp || Date.now());
    return date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = String(text == null ? "" : text);
    return div.innerHTML;
  }

  function avatarStyle(dataUrl) {
    return dataUrl ? `style="background-image:url('${dataUrl}')"` : "";
  }

  function contact() {
    return Contacts.get(contactId) || { name: "TA", avatar: "" };
  }

  function profileName(role) {
    const profile = ProfileStore.get();
    if (role === "user") {
      return profile.userName || window.APP_CONFIG.userName || "我";
    }
    return contact().name || window.APP_CONFIG.taName || "TA";
  }

  function avatarInitial(role) {
    return profileName(role).slice(0, 1);
  }

  function avatarFor(role) {
    if (role === "user") return AvatarStore.get("user");
    const c = contact();
    return c.avatar || "";
  }

  function renderAvatarHtml(role, sizeClass) {
    const dataUrl = avatarFor(role);
    const initial = avatarInitial(role);
    const defaultClass = role === "user" ? "avatar--user-default" : "avatar--ta-default";
    const content = dataUrl ? "" : escapeHtml(initial);

    return `<div class="avatar ${sizeClass} ${dataUrl ? "" : defaultClass}" ${avatarStyle(dataUrl)} aria-hidden="true">${content}</div>`;
  }

  function renderHeader() {
    const c = contact();

    if (els.taName) {
      els.taName.textContent = c.name || "TA";
    }

    if (els.headerTaAvatar) {
      const dataUrl = c.avatar || "";
      els.headerTaAvatar.classList.toggle("avatar--ta-default", !dataUrl);
      els.headerTaAvatar.style.backgroundImage = dataUrl ? `url('${dataUrl}')` : "";
      els.headerTaAvatar.textContent = dataUrl ? "" : (c.name || "TA").slice(0, 1);
    }

    document.title = window.APP_CONFIG.siteTitle;
  }

  function applyBackground() {
    const profile = ProfileStore.get();
    if (!els.list) return;

    if (profile.chatBackground) {
      els.list.style.backgroundImage = `url('${profile.chatBackground}')`;
      els.list.style.backgroundSize = "cover";
      els.list.style.backgroundPosition = "center";
      els.list.classList.add("message-list--custom-bg");
    } else {
      els.list.style.backgroundImage = "";
      els.list.classList.remove("message-list--custom-bg");
    }
  }

  function render() {
    if (!els.list) return;

    if (messages.length === 0) {
      els.list.innerHTML =
        '<div class="empty-state">这里只有你和 TA。<br>发一条消息，看看 TA 会说什么。</div>';
      return;
    }

    els.list.innerHTML = messages
      .map((message) => {
        const role = message.role === "user" ? "user" : "ta";
        const side = role === "user" ? "outgoing" : "incoming";
        return `
          <div class="message message--${role} ${side}">
            ${renderAvatarHtml(role, "avatar--md")}
            <div class="message__body">
              <div class="bubble">${escapeHtml(message.text)}</div>
              <div class="time">${formatTime(message.time)}</div>
            </div>
          </div>
        `;
      })
      .join("");

    scrollToBottom();
  }

  function scrollToBottom() {
    if (!els.list) return;
    requestAnimationFrame(() => {
      els.list.scrollTop = els.list.scrollHeight;
    });
  }

  function append(role, text) {
    messages.push({ role, text, time: Date.now() });
    messages = messages.slice(-window.APP_CONFIG.maxHistory);
    Storage.saveHistory(contactId, messages);
    render();
  }

  function updateStatus() {
    if (!els.status) return;
    els.status.textContent = replying ? "正在输入…" : "在线";
  }

  function baseDelay() {
    return (
      window.APP_CONFIG.replyDelayMin +
      Math.random() *
        (window.APP_CONFIG.replyDelayMax - window.APP_CONFIG.replyDelayMin)
    );
  }

  function pickSentences() {
    const chance = loadMultiChance();
    const roll = Math.random() * 100;

    if (chance <= 0 || roll >= chance) {
      return [CardDeck.draw(cardCategory)];
    }

    const count = Math.random() < 0.65 ? 2 : 3;
    const list = [];

    for (let i = 0; i < count; i += 1) {
      list.push(CardDeck.draw(cardCategory));
    }

    return list;
  }

  function scheduleReply() {
    if (replyTimer) clearTimeout(replyTimer);

    replying = true;
    updateStatus();
    if (els.send) els.send.disabled = true;

    replyTimer = window.setTimeout(() => {
      const sentences = pickSentences();
      let index = 0;

      function pushNext() {
        if (index >= sentences.length) {
          replying = false;
          replyTimer = null;
          updateStatus();
          if (els.send) els.send.disabled = false;
          return;
        }

        append("ta", sentences[index]);
        index += 1;

        if (index < sentences.length) {
          replyTimer = window.setTimeout(pushNext, 400 + Math.random() * 500);
        } else {
          replying = false;
          replyTimer = null;
          updateStatus();
          if (els.send) els.send.disabled = false;
        }
      }

      pushNext();
    }, baseDelay());
  }

  function send() {
    const text = els.input.value.trim();
    if (!text || replying) return;

    els.input.value = "";
    resizeInput();
    append("user", text);
    scheduleReply();
  }

  function sendUserMessage(text) {
    const value = String(text == null ? "" : text).trim();
    if (!value) return;

    append("user", value);
    scheduleReply();
  }

  function clear() {
    if (replyTimer) {
      clearTimeout(replyTimer);
      replyTimer = null;
    }

    replying = false;
    if (els.send) els.send.disabled = false;
    messages = [];
    Storage.clearHistory(contactId);
    updateStatus();
    render();
  }

  function getHistory() {
    return [...messages];
  }

  function setCardCategory(category) {
    cardCategory = category || CardDeck.ALL_CATEGORY;
  }

  function appendPartnerMessage(text) {
    const value = String(text == null ? "" : text).trim();
    if (!value) return;

    append("ta", value);
  }

  function refreshAppearance() {
    renderHeader();
    applyBackground();
    render();
  }

  return {
    init,
    setContact,
    clear,
    getHistory,
    setCardCategory,
    appendPartnerMessage,
    sendUserMessage,
    refreshAppearance,
    refreshAvatars: refreshAppearance
  };
})();
