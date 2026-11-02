const BubbleStore = (() => {
  const KEY = "private_chat_bubble_v1";
  const DEFAULT = "default";
  const PRESETS = ["default", "rounded", "minimal", "soft"];

  function load() {
    try {
      const value = localStorage.getItem(KEY);
      return PRESETS.includes(value) ? value : DEFAULT;
    } catch (error) {
      return DEFAULT;
    }
  }

  let style = load();

  function apply() {
    document.documentElement.dataset.bubble = style;
  }

  function save() {
    try {
      localStorage.setItem(KEY, style);
      return true;
    } catch (error) {
      console.warn("气泡样式保存失败", error);
      return false;
    }
  }

  function get() {
    return style;
  }

  function set(next) {
    style = PRESETS.includes(next) ? next : DEFAULT;
    apply();
    save();
    return style;
  }

  apply();

  return { get, set, PRESETS };
})();
