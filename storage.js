/* =========================================================
   storage.js
   Simple LocalStorage Layer for Demo Food Ordering App
   Restaurant: لقمان أبو صليح
   ========================================================= */

const Storage = (() => {
  const STORAGE_KEY = "LQS_APP_V1";

  /* ---------- Internal Helpers ---------- */

  function loadRaw() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error("Failed to parse storage data", e);
      return null;
    }
  }

  function saveRaw(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function deepClone(obj) {
    return structuredClone
      ? structuredClone(obj)
      : JSON.parse(JSON.stringify(obj));
  }

  /* ---------- Initialization ---------- */

  function initIfEmpty(seed = DEMO_SEED) {
    const existing = loadRaw();
    if (existing) return existing;

    const initialState = {
      // إعدادات المطعم
      settings: {
        restaurantName: seed.settings.restaurantName,
        isOpenNow: seed.settings.isOpenNow,
        deliveryFeeIQD: seed.settings.deliveryFeeIQD,
        minOrderIQD: seed.settings.minOrderIQD,
        workingHoursText: seed.settings.workingHoursText
      },

      // المنيو
      categories: seed.categories || [],
      items: seed.items || [],

      // السلة الحالية (للزبون)
      cart: [],

      // الطلبات
      orders: [],

      // آخر رقم طلب (للتتبع السريع)
      lastOrderNumber: null,

      // عدّاد تسلسلي للطلبات
      seq: 100
    };

    saveRaw(initialState);
    return initialState;
  }

  /* ---------- Public API ---------- */

  function getState() {
    return initIfEmpty();
  }

  function setState(updaterFn) {
    const current = initIfEmpty();
    const next = updaterFn(deepClone(current));
    saveRaw(next);
    return next;
  }

  /* ---------- Utilities ---------- */

  function formatIQD(value) {
    const n = Number(value || 0);
    return n.toLocaleString("ar-IQ") + " د.ع";
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

  /* ---------- Exposed Object ---------- */

  return {
    // core
    initIfEmpty,
    getState,
    setState,

    // helpers
    formatIQD,
    nextOrderNumber,
    clearAll
  };
})();
