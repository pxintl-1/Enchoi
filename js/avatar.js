const AvatarStore = (() => {
  const KEY = "private_chat_avatars_v1";
  const DEFAULTS = {
    user: "",
    ta: ""
  };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { ...DEFAULTS };
      const parsed = JSON.parse(raw);
      return {
        user: typeof parsed.user === "string" ? parsed.user : "",
        ta: typeof parsed.ta === "string" ? parsed.ta : ""
      };
    } catch (error) {
      return { ...DEFAULTS };
    }
  }

  let avatars = load();

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(avatars));
      return true;
    } catch (error) {
      console.warn("头像保存失败，可能是图片太大或存储已满", error);
      return false;
    }
  }

  function get(role) {
    return avatars[role] || "";
  }

  function set(role, dataUrl) {
    if (role !== "user" && role !== "ta") return false;
    avatars[role] = dataUrl || "";
    return save();
  }

  function clear(role) {
    return set(role, "");
  }

  return { get, set, clear };
})();
