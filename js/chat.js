const Chat = (() => {
  let messages = Storage.getHistory();
  if (!Array.isArray(messages)) messages = [];

  let els = {};
  let replying = false;
  let replyTimer = null;
  let cardCategory = CardDeck.ALL_CATEGORY;

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

    applyProfile();
    applyBackground();
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

  function profileName(role) {
    const profile = ProfileStore.get();

    if (role === "user") {
      return profile.userName || window.APP_CONFIG.userName || "我";
    }

    return profile.taName || window.APP_CONFIG.taName || "TA";
  }

  function avatarInitial(role) {
    return profileName(role).slice(0, 1);
  }

  function renderAvatarHtml(role, sizeClass) {
    const dataUrl = AvatarStore.get(role);
    const initial = avatarInitial(role);
    const defaultClass = role === "user" ? "avatar--user-default" : "avatar--ta-default";
    const content = dataUrl ? "" : escapeHtml(initial);

    return `<div class="avatar ${sizeClass} ${dataUrl ? "" : defaultClass}" ${avatarStyle(dataUrl)} aria-hidden="true">${content}</div>`;
  }

  function renderHeaderAvatar() {
    if (!els.headerTaAvatar) return;
    const dataUrl = AvatarStore.get("ta");
    els.headerTaAvatar.classList.toggle("avatar--ta-default", !dataUrl);
    els.headerTaAvatar.style.backgroundImage = dataUrl ? `url('${dataUrl}')` : "";
    els.headerTaAvatar.textContent = dataUrl ? "" : avatarInitial("ta");
  }

  function applyProfile() {
    const profile = ProfileStore.get();

    if (els.taName) {
      els.taName.textContent = profile.taName || "TA";
    }

    document.title = window.APP_CONFIG.siteTitle;
    renderHeaderAvatar();
  }

  function applyBackground() {
    const profile = ProfileStore.get();
    const list = els.list;

    if (!list) return;

    if (profile.chatBackground) {
      list.style.backgroundImage = `url('${profile.chatBackground}')`;
      list.style.backgroundSize = "cover";
      list.style.backgroundPosition = "center";
      list.classList.add("message-list--custom-bg");
    } else {
      list.style.backgroundImage = "";
      list.classList.remove("message-list--custom-bg");
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
        return `
          <div class="message message--${role}">
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
    requestAnimationFrame(() => {
      els.list.scrollTop = els.list.scrollHeight;
    });
  }

  function append(role, text) {
    messages.push({
      role,
      text,
      time: Date.now()
    });

    messages = messages.slice(-window.APP_CONFIG.maxHistory);
    Storage.saveHistory(messages);
    render();
  }

  function updateStatus() {
    if (!els.status) return;
    els.status.textContent = replying ? "正在输入…" : "在线";
  }

  function send() {
    const text = els.input.value.trim();
    if (!text || replying) return;

    els.input.value = "";
    resizeInput();
    append("user", text);

    replying = true;
    updateStatus();
    els.send.disabled = true;

    const delay =
      window.APP_CONFIG.replyDelayMin +
      Math.random() *
        (window.APP_CONFIG.replyDelayMax - window.APP_CONFIG.replyDelayMin);

    replyTimer = window.setTimeout(() => {
      const reply = CardDeck.draw(cardCategory);
      append("ta", reply);

      replying = false;
      replyTimer = null;
      updateStatus();
      els.send.disabled = false;
      els.input.focus();
    }, delay);
  }

  function clear() {
    if (replyTimer) {
      clearTimeout(replyTimer);
      replyTimer = null;
    }

    replying = false;
    els.send.disabled = false;
    messages = [];
    Storage.clearHistory();
    updateStatus();
    render();
  }

  function getHistory() {
    return [...messages];
  }

  function setCardCategory(category) {
    cardCategory = category || CardDeck.ALL_CATEGORY;
  }

  function refreshAppearance() {
    applyProfile();
    applyBackground();
    render();
  }

  return {
    init,
    clear,
    getHistory,
    setCardCategory,
    refreshAvatars: refreshAppearance,
    refreshAppearance
  };
})();
