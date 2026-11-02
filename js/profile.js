const ProfileStore = (() => {
  const KEY = "private_chat_profile_v1";

  const DEFAULTS = {
    taName: window.APP_CONFIG.taName || "TA",
    userName: window.APP_CONFIG.userName || "我",
    taCall: "",
    userCall: "",
    chatBackground: ""
  };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { ...DEFAULTS };
      const parsed = JSON.parse(raw);
      return {
        taName: typeof parsed.taName === "string" && parsed.taName.trim()
          ? parsed.taName.trim()
          : DEFAULTS.taName,
        userName: typeof parsed.userName === "string" && parsed.userName.trim()
          ? parsed.userName.trim()
          : DEFAULTS.userName,
        taCall: typeof parsed.taCall === "string" ? parsed.taCall : "",
        userCall: typeof parsed.userCall === "string" ? parsed.userCall : "",
        chatBackground:
          typeof parsed.chatBackground === "string" ? parsed.chatBackground : ""
      };
    } catch (error) {
      return { ...DEFAULTS };
    }
  }

  let profile = load();

  function persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify(profile));
      return true;
    } catch (error) {
      console.warn("设置保存失败，可能是存储空间不足", error);
      return false;
    }
  }

  function get() {
    return { ...profile };
  }

  function update(patch) {
    if (!patch || typeof patch !== "object") return false;

    if (typeof patch.taName === "string" && patch.taName.trim()) {
      profile.taName = patch.taName.trim();
    }

    if (typeof patch.userName === "string" && patch.userName.trim()) {
      profile.userName = patch.userName.trim();
    }

    if (typeof patch.taCall === "string") {
      profile.taCall = patch.taCall.trim();
    }

    if (typeof patch.userCall === "string") {
      profile.userCall = patch.userCall.trim();
    }

    if (typeof patch.chatBackground === "string") {
      profile.chatBackground = patch.chatBackground;
    }

    return persist();
  }

  function clearBackground() {
    profile.chatBackground = "";
    return persist();
  }

  return { get, update, clearBackground };
})();
