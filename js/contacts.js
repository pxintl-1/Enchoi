const Contacts = (() => {
  const KEY = "private_chat_contacts_v1";
  const ACTIVE_KEY = "private_chat_active_contact_v1";

  const DEFAULT_CONTACT = {
    id: "default",
    name: "TA",
    avatar: "",
    userCall: "",
    taCall: "",
    createdAt: Date.now()
  };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return [DEFAULT_CONTACT];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) return [DEFAULT_CONTACT];
      return parsed
        .map((item) => ({
          id: String(item.id || "").trim(),
          name: String(item.name || "").trim() || "TA",
          avatar: typeof item.avatar === "string" ? item.avatar : "",
          userCall: typeof item.userCall === "string" ? item.userCall : "",
          taCall: typeof item.taCall === "string" ? item.taCall : "",
          createdAt: Number(item.createdAt) || Date.now()
        }))
        .filter((item) => item.id);
    } catch (error) {
      return [DEFAULT_CONTACT];
    }
  }

  let contacts = load();

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(contacts));
      return true;
    } catch (error) {
      console.warn("联系人保存失败", error);
      return false;
    }
  }

  function loadActive() {
    try {
      const id = localStorage.getItem(ACTIVE_KEY);
      if (id && contacts.some((c) => c.id === id)) return id;
    } catch (error) {
      // 忽略
    }
    return contacts[0] ? contacts[0].id : DEFAULT_CONTACT.id;
  }

  let activeId = loadActive();

  function saveActive() {
    try {
      localStorage.setItem(ACTIVE_KEY, activeId);
    } catch (error) {
      // 忽略
    }
  }

  function uid() {
    return "c_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function getAll() {
    return contacts.map((c) => ({ ...c }));
  }

  function get(id) {
    return contacts.find((c) => c.id === id) || null;
  }

  function getActive() {
    return get(activeId) || contacts[0] || { ...DEFAULT_CONTACT };
  }

  function setActive(id) {
    if (!get(id)) return false;
    activeId = id;
    saveActive();
    return true;
  }

  function getActiveId() {
    return getActive().id;
  }

  function add(name) {
    const value = String(name == null ? "" : name).trim();
    if (!value) return { ok: false, msg: "名字不能为空。" };

    const contact = {
      id: uid(),
      name: value,
      avatar: "",
      userCall: "",
      taCall: "",
      createdAt: Date.now()
    };

    contacts.push(contact);
    save();
    return { ok: true, contact };
  }

  function update(id, patch) {
    const target = get(id);
    if (!target) return { ok: false, msg: "联系人不存在。" };

    if (patch && typeof patch.name === "string") {
      const name = patch.name.trim();
      if (name) target.name = name;
    }

    if (patch && typeof patch.avatar === "string") {
      target.avatar = patch.avatar;
    }

    if (patch && typeof patch.userCall === "string") {
      target.userCall = patch.userCall.trim();
    }

    if (patch && typeof patch.taCall === "string") {
      target.taCall = patch.taCall.trim();
    }

    save();
    return { ok: true };
  }

  function remove(id) {
    if (contacts.length <= 1) {
      return { ok: false, msg: "至少保留一个联系人。" };
    }

    const index = contacts.findIndex((c) => c.id === id);
    if (index < 0) return { ok: false, msg: "联系人不存在。" };

    contacts.splice(index, 1);

    if (activeId === id) {
      activeId = contacts[0].id;
      saveActive();
    }

    save();
    return { ok: true };
  }

  return {
    getAll,
    get,
    getActive,
    getActiveId,
    setActive,
    add,
    update,
    remove
  };
})();
