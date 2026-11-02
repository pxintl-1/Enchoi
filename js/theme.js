const ThemeStore = (() => {
  const KEY = "private_chat_theme_v1";
  const LIGHT = "light";
  const DARK = "dark";

  function load() {
    try {
      const value = localStorage.getItem(KEY);
      return value === DARK ? DARK : LIGHT;
    } catch (error) {
      return LIGHT;
    }
  }

  let theme = load();

  function apply() {
    document.documentElement.dataset.theme = theme;
  }

  function save() {
    try {
      localStorage.setItem(KEY, theme);
      return true;
    } catch (error) {
      console.warn("主题保存失败", error);
      return false;
    }
  }

  function get() {
    return theme;
  }

  function set(next) {
    theme = next === DARK ? DARK : LIGHT;
    apply();
    save();
    return theme;
  }

  function toggle() {
    return set(theme === DARK ? LIGHT : DARK);
  }

  apply();

  return { get, set, toggle, LIGHT, DARK };
})();
