const Storage = (() => {
  const STORAGE_KEY = "LQS_JO_V1";

  function loadRaw() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  function saveRaw(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function deepClone(obj) {
    return typeof structuredClone === "function"
      ? structuredClone(obj)
      : JSON.parse(JSON.stringify(obj));
  }

  function initIfEmpty(seed = DEMO_SEED) {
    const existing = loadRaw();
    if (existing) return existing;

    const initialState = {
      settings: {
        restaurantName: seed.settings.restaurantName,
        isOpenNow: seed.settings.isOpenNow,
        deliveryFeeJOD: seed.settings.deliveryFeeJOD,
        minOrderJOD: seed.settings.minOrderJOD,
        workingHoursText: seed.settings.workingHoursText,
        countryLabel: seed.settings.countryLabel || "الأردن",
        cityLabel: seed.settings.cityLabel || "عمّان"
      },
      categories: seed.categories || [],
      items: seed.items || [],
      cart: [],
      orders: [],
      lastOrderNumber: null,
      seq: 100
    };

    saveRaw(initialState);
    return initialState;
  }

  function getState() {
    return initIfEmpty();
  }

  function setState(updaterFn) {
    const current = initIfEmpty();
    const next = updaterFn(deepClone(current));
    saveRaw(next);
    return next;
  }

  function formatJOD(value) {
    const n = Number(value || 0);
    // تنسيق أردني بسيط مع خانتين
    return n.toLocaleString("ar-JO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " د.أ";
  }

  function nextOrderNumber() {
    const state = getState();
    const nextSeq = (state.seq || 0) + 1;
    const orderNumber = `LQS-${String(nextSeq).padStart(6, "0")}`;

    setState(s => {
      s.seq = nextSeq;
      return s;
    });

    return orderNumber;
  }

  function clearAll() {
    localStorage.removeItem(STORAGE_KEY);
  }

  return {
    initIfEmpty,
    getState,
    setState,
    formatJOD,
    nextOrderNumber,
    clearAll
  };
})();
