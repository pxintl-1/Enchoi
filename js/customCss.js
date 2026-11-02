const CustomCssStore = (() => {
  const KEY = "private_chat_custom_css_v1";
  const STYLE_ID = "user-custom-css";

  function load() {
    try {
      return localStorage.getItem(KEY) || "";
    } catch (error) {
      return "";
    }
  }

  let css = load();

  function apply() {
    let styleEl = document.getElementById(STYLE_ID);

    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = STYLE_ID;
      document.head.appendChild(styleEl);
    }

    styleEl.textContent = css;
  }

  function save() {
    try {
      localStorage.setItem(KEY, css);
      return true;
    } catch (error) {
      console.warn("自定义 CSS 保存失败", error);
      return false;
    }
  }

  function get() {
    return css;
  }

  function set(next) {
    css = String(next == null ? "" : next);
    apply();
    return save();
  }

  function clear() {
    css = "";
    apply();
    try {
      localStorage.removeItem(KEY);
    } catch (error) {
      // 忽略
    }
  }

  apply();

  return { get, set, clear };
})();
