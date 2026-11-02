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
    els.status = document.getElementById("typing-status");

    els.send.addEventListener("click", send);

    els.input.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        send();
      }
    });

    els.input.addEventListener("input", resizeInput);
    render();
    updateStatus();
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

  function render() {
    if (!els.list) return;

    if (messages.length === 0) {
      els.list.innerHTML =
        '<div class="empty-state">这里只有你和 TA。<br>发一条消息，看看 TA 会抽到哪张字卡。</div>';
      return;
    }

    els.list.innerHTML = messages
      .map((message) => {
        const role = message.role === "user" ? "user" : "ta";
        return `
          <div class="message message--${role}">
            <div class="bubble">${escapeHtml(message.text)}</div>
            <div class="time">${formatTime(message.time)}</div>
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
      const reply = CardDeck.draw();
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

  return {
    init,
    clear,
    getHistory
  };
})();
