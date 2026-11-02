const Chat = (() => {
  let messages = Storage.getHistory();
  if (!Array.isArray(messages)) messages = [];

  let els = {};
  let replying = false;
  let replyTimer = null;

  function init() {
    els.list = document.getElementById("message-list");
    els.input = document.getElementById("message-input");
    els.send = document.getElementById("send-btn");

    els.send.addEventListener("click", send);

    els.input.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        send();
      }
    });

    els.input.addEventListener("input", resizeInput);
    render();
  }

  function resizeInput() {
    els.input.style.height = "auto";
    els.input.style.height = Math.min(els.input.scrollHeight, 120) + "px";
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

  function renderAvatar(role) {
    const value =
      role === "user"
        ? window.APP_CONFIG.userAvatar
        : window.APP_CONFIG.taAvatar;

    const safe = String(value || "").trim();

    if (!safe) {
      return `<div class="avatar">${role === "user" ? "我" : "TA"}</div>`;
    }

    if (/^https?:\/\//i.test(safe) || safe.startsWith("./") || safe.startsWith("../")) {
      return `<div class="avatar"><img src="${escapeHtml(safe)}" alt=""></div>`;
    }

    return `<div class="avatar">${escapeHtml(safe)}</div>`;
  }

  function render() {
    if (!els.list) return;

    if (messages.length === 0) {
      els.list.innerHTML =
        '<div class="empty-state">这里只有你和 TA。<br>发一条消息，等 TA 回你。</div>';
      return;
    }

    const html = messages
      .map((message) => {
        const role = message.role === "user" ? "user" : "ta";
        return `
          <div class="message message--${role}">
            ${renderAvatar(role)}
            <div class="message__body">
              <div class="bubble">${escapeHtml(message.text)}</div>
              <div class="time">${formatTime(message.time)}</div>
            </div>
          </div>
        `;
      })
      .join("");

    els.list.innerHTML = html + (replying ? renderTyping() : "");
    scrollToBottom();
  }

  function renderTyping() {
    return `
      <div class="message message--ta" id="typing-row">
        ${renderAvatar("ta")}
        <div class="message__body">
          <div class="typing"><span></span><span></span><span></span></div>
        </div>
      </div>
    `;
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      els.list.scrollTop = els.list.scrollHeight;
    });
  }

  function append(role, text) {
    messages.push({ role, text, time: Date.now() });
    messages = messages.slice(-window.APP_CONFIG.maxHistory);
    Storage.saveHistory(messages);
    render();
  }

  function send() {
    const text = els.input.value.trim();
    if (!text || replying) return;

    els.input.value = "";
    resizeInput();
    append("user", text);

    replying = true;
    els.send.disabled = true;
    render();

    const delay =
      window.APP_CONFIG.replyDelayMin +
      Math.random() *
        (window.APP_CONFIG.replyDelayMax - window.APP_CONFIG.replyDelayMin);

    replyTimer = window.setTimeout(() => {
      const reply = CardDeck.draw();
      replying = false;
      replyTimer = null;
      els.send.disabled = false;
      append("ta", reply);
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
    render();
  }

  function getHistory() {
    return [...messages];
  }

  return { init, clear, getHistory };
})();
