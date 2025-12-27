(function () {
  Storage.initIfEmpty();

  // =========================================================
  // Admin Gate (Password)
  // =========================================================
  const GATE_SESSION_KEY = "LQS_ADMIN_AUTH";
  const ADMIN_PASSWORD = "Kaleem7364";

  const gate = document.getElementById("adminGate");
  const passInput = document.getElementById("adminPinInput");
  const btnLogin = document.getElementById("btnAdminLogin");
  const gateMsg = document.getElementById("adminGateMsg");

  function isAuthed() {
    return sessionStorage.getItem(GATE_SESSION_KEY) === "1";
  }

  function showGate(msg) {
    gate?.classList.add("show");
    if (gateMsg) gateMsg.textContent = msg || "";
    setTimeout(() => passInput?.focus(), 60);
  }

  function hideGate() {
    gate?.classList.remove("show");
    if (gateMsg) gateMsg.textContent = "";
  }

  function showToast(msg) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 2600);
  }

  function handleLogin() {
    const p = (passInput?.value || "").trim();
    if (!p) return showGate("أدخل كلمة المرور.");
    if (p !== ADMIN_PASSWORD) return showGate("كلمة المرور غير صحيحة.");
    sessionStorage.setItem(GATE_SESSION_KEY, "1");
    hideGate();
    showToast("تم تسجيل الدخول كإدمن.");
    boot();
  }

  if (!isAuthed()) {
    showGate("");
    btnLogin?.addEventListener("click", handleLogin);
    passInput?.addEventListener("keydown", (e) => { if (e.key === "Enter") handleLogin(); });
    return;
  }

  // إذا مصدّق بالفعل
  boot();

  // =========================================================
  // Main Admin Boot
  // =========================================================
  function boot() {
    // ---------- DOM ----------
    const elOpenBadge = document.getElementById("openBadgeAdmin");
    const elDelivery = document.getElementById("deliveryFeeInput");
    const elMinOrder = document.getElementById("minOrderInput");
    const elHours = document.getElementById("hoursInput");
    const elSave = document.getElementById("btnSaveSettings");
    const elReset = document.getElementById("btnResetDemo");

    const elOrders = document.getElementById("ordersList");
    const elFilter = document.getElementById("orderFilter");
    const elSearch = document.getElementById("orderSearch");

    const elMenuAdmin = document.getElementById("menuAdmin");
    const elMenuSearchAdmin = document.getElementById("menuSearchAdmin");
    const btnOpenAddItem = document.getElementById("btnOpenAddItem");

    // Modal elements
    const itemModal = document.getElementById("itemModal");
    const itemModalTitle = document.getElementById("itemModalTitle");
    const itemModalMsg = document.getElementById("itemModalMsg");
    const btnCloseItemModal = document.getElementById("btnCloseItemModal");
    const btnSaveItem = document.getElementById("btnSaveItem");

    const fCat = document.getElementById("itemCat");
    const fName = document.getElementById("itemName");
    const fDesc = document.getElementById("itemDesc");
    const fPrice = document.getElementById("itemPrice");
    const fImg = document.getElementById("itemImg");
    const fAvail = document.getElementById("itemAvailable");

    // state for modal
    let editingItemId = null; // null => add new

    // ---------- Helpers ----------
    function statusLabel(s) {
      switch (s) {
        case "RECEIVED": return "تم الاستلام";
        case "PREPARING": return "قيد التحضير";
        case "ON_THE_WAY": return "بالطريق";
        case "DELIVERED": return "تم التسليم";
        case "CANCELED": return "ملغي";
        default: return s;
      }
    }

    function statusPillStyle(status) {
      switch (status) {
        case "RECEIVED": return { bg: "rgba(91,140,255,.12)", bd: "rgba(91,140,255,.35)" };
        case "PREPARING": return { bg: "rgba(242,201,76,.12)", bd: "rgba(242,201,76,.35)" };
        case "ON_THE_WAY": return { bg: "rgba(33,199,126,.12)", bd: "rgba(33,199,126,.35)" };
        case "DELIVERED": return { bg: "rgba(33,199,126,.16)", bd: "rgba(33,199,126,.45)" };
        case "CANCELED": return { bg: "rgba(255,77,77,.12)", bd: "rgba(255,77,77,.40)" };
        default: return { bg: "rgba(255,255,255,.06)", bd: "rgba(255,255,255,.14)" };
      }
    }

    function renderOpenBadge() {
      if (!elOpenBadge) return;
      const st = Storage.getState();
      const isOpen = !!st.settings.isOpenNow;

      elOpenBadge.textContent = isOpen
        ? `مفتوح الآن • ${st.settings.workingHoursText}`
        : `مغلق الآن • ${st.settings.workingHoursText}`;

      elOpenBadge.style.borderColor = isOpen
        ? "rgba(33,199,126,.45)"
        : "rgba(255,77,77,.45)";
      elOpenBadge.style.background = isOpen
        ? "rgba(33,199,126,.12)"
        : "rgba(255,77,77,.12)";
    }

    // ---------- Settings ----------
    function loadSettingsUI() {
      const st = Storage.getState();
      if (elDelivery) elDelivery.value = Number(st.settings.deliveryFeeJOD || 0);
      if (elMinOrder) elMinOrder.value = Number(st.settings.minOrderJOD || 0);
      if (elHours) elHours.value = st.settings.workingHoursText || "";

      const radios = document.querySelectorAll('input[name="isOpen"]');
      radios.forEach((r) => { r.checked = String(st.settings.isOpenNow) === r.value; });

      renderOpenBadge();
    }

    function saveSettings() {
      const radio = document.querySelector('input[name="isOpen"]:checked');
      const isOpen = radio ? radio.value === "true" : true;

      const delivery = Math.max(0, Number(elDelivery?.value || 0));
      const minOrder = Math.max(0, Number(elMinOrder?.value || 0));
      const hours = (elHours?.value || "").trim();

      Storage.setState((s) => {
        s.settings.isOpenNow = isOpen;
        s.settings.deliveryFeeJOD = delivery;
        s.settings.minOrderJOD = minOrder;
        if (hours) s.settings.workingHoursText = hours;
        return s;
      });

      renderOpenBadge();
      showToast("تم حفظ الإعدادات.");
    }

    function resetDemo() {
      localStorage.removeItem("LQS_JO_V1");
      Storage.initIfEmpty();
      loadSettingsUI();
      renderOrders();
      renderMenuAdmin();
      showToast("تمت إعادة ضبط بيانات العرض.");
    }

    elSave?.addEventListener("click", saveSettings);
    elReset?.addEventListener("click", resetDemo);

    // ---------- Orders ----------
    function getOrdersFiltered() {
      const st = Storage.getState();
      const filter = elFilter?.value || "ALL";
      const q = (elSearch?.value || "").trim().toLowerCase();

      return (st.orders || [])
        .filter((o) => (filter === "ALL" ? true : o.status === filter))
        .filter((o) => {
          if (!q) return true;
          const a = (o.orderNumber || "").toLowerCase();
          const b = (o.customerPhone || "").toLowerCase();
          return a.includes(q) || b.includes(q);
        });
    }

    function updateOrderStatus(orderId, newStatus) {
      Storage.setState((s) => {
        const o = (s.orders || []).find((x) => x.id === orderId);
        if (!o) return s;
        o.status = newStatus;
        o.history = o.history || [];
        o.history.push({ at: new Date().toISOString(), status: newStatus });
        return s;
      });

      renderOrders();
      showToast(`تم تحديث الحالة إلى: ${statusLabel(newStatus)}`);
    }

    function mkBtn(text, onClick, cls = "btn btn-secondary") {
      const b = document.createElement("button");
      b.type = "button";
      b.className = cls;
      b.textContent = text;
      b.addEventListener("click", onClick);
      return b;
    }

    function renderOrders() {
      if (!elOrders) return;
      const orders = getOrdersFiltered();

      elOrders.innerHTML = "";
      if (!orders.length) {
        elOrders.innerHTML = `<div class="muted">لا توجد طلبات حالياً.</div>`;
        return;
      }

      for (const o of orders) {
        const box = document.createElement("div");
        box.className = "order";

        const head = document.createElement("div");
        head.className = "order-head";

        const left = document.createElement("div");
        const h3 = document.createElement("h3");
        h3.textContent = `${o.orderNumber} • ${statusLabel(o.status)}`;

        const meta = document.createElement("div");
        meta.className = "meta";
        const createdAt = o.createdAt ? new Date(o.createdAt).toLocaleString("ar-JO") : "-";
        meta.innerHTML = `
          الهاتف: <strong>${o.customerPhone || "-"}</strong>
          ${o.customerName ? ` • الاسم: <strong>${o.customerName}</strong>` : ""}
          <br/>الوقت: ${createdAt}
          <br/>الإجمالي: <strong>${Storage.formatJOD(o.totalJOD || 0)}</strong>
        `;

        left.appendChild(h3);
        left.appendChild(meta);

        const right = document.createElement("div");
        const pill = document.createElement("span");
        pill.className = "badge";
        pill.textContent = statusLabel(o.status);
        const sty = statusPillStyle(o.status);
        pill.style.background = sty.bg;
        pill.style.borderColor = sty.bd;
        right.appendChild(pill);

        head.appendChild(left);
        head.appendChild(right);

        const items = document.createElement("div");
        items.className = "items";
        items.innerHTML = (o.items || [])
          .map((i) => `• ${i.nameSnapshot || "صنف"} × ${i.qty || 0}`)
          .join("<br/>");

        const addr = document.createElement("div");
        addr.className = "meta";
        addr.innerHTML = `
          الموقع: <strong>${Number(o.lat || 0).toFixed(5)}, ${Number(o.lng || 0).toFixed(5)}</strong>
          ${o.addressText ? `<br/>العنوان: <strong>${o.addressText}</strong>` : ""}
          ${o.notes ? `<br/>ملاحظات: <strong>${o.notes}</strong>` : ""}
        `;

        const controls = document.createElement("div");
        controls.className = "controls";
        controls.append(
          mkBtn("تم الاستلام", () => updateOrderStatus(o.id, "RECEIVED")),
          mkBtn("قيد التحضير", () => updateOrderStatus(o.id, "PREPARING")),
          mkBtn("بالطريق", () => updateOrderStatus(o.id, "ON_THE_WAY")),
          mkBtn("تم التسليم", () => updateOrderStatus(o.id, "DELIVERED"), "btn btn-primary"),
          mkBtn("إلغاء", () => updateOrderStatus(o.id, "CANCELED"), "btn btn-danger")
        );

        box.appendChild(head);
        box.appendChild(items);
        box.appendChild(addr);
        box.appendChild(controls);

        elOrders.appendChild(box);
      }
    }

    elFilter?.addEventListener("change", renderOrders);
    elSearch?.addEventListener("input", renderOrders);

    // ---------- Menu CRUD ----------
    function fillCategoryDropdown(selectedId) {
      const st = Storage.getState();
      const cats = (st.categories || []).filter(c => c.isActive);

      fCat.innerHTML = "";
      for (const c of cats) {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = c.name;
        fCat.appendChild(opt);
      }
      if (selectedId) fCat.value = selectedId;
    }

    function openItemModal(mode, item = null) {
      editingItemId = mode === "edit" ? item?.id : null;
      itemModalTitle.textContent = mode === "edit" ? "تعديل صنف" : "إضافة صنف";
      itemModalMsg.textContent = "";

      fillCategoryDropdown(item?.categoryId);

      fName.value = item?.name || "";
      fDesc.value = item?.desc || "";
      fPrice.value = String(item?.priceJOD ?? "");
      fImg.value = item?.imageUrl || "";
      fAvail.checked = item?.isAvailable ?? true;

      itemModal.classList.add("show");
      setTimeout(() => fName.focus(), 80);
    }

    function closeItemModal() {
      itemModal.classList.remove("show");
      editingItemId = null;
    }

    btnCloseItemModal?.addEventListener("click", closeItemModal);

    // Click outside modal closes it (اختياري ومريح)
    itemModal?.addEventListener("click", (e) => {
      if (e.target === itemModal) closeItemModal();
    });

    btnOpenAddItem?.addEventListener("click", () => {
      openItemModal("add");
    });

    function validateItemForm() {
      const name = (fName.value || "").trim();
      const cat = fCat.value;
      const price = Number(fPrice.value);

      if (!cat) return { ok: false, msg: "اختر القسم." };
      if (!name) return { ok: false, msg: "أدخل اسم الصنف." };
      if (!Number.isFinite(price) || price < 0) return { ok: false, msg: "أدخل سعر صحيح." };

      const img = (fImg.value || "").trim();
      if (img && !/^https?:\/\//i.test(img)) {
        return { ok: false, msg: "رابط الصورة يجب أن يبدأ بـ http أو https." };
      }

      return { ok: true };
    }

    function saveItemFromModal() {
      const check = validateItemForm();
      if (!check.ok) {
        itemModalMsg.textContent = check.msg;
        return;
      }

      const payload = {
        categoryId: fCat.value,
        name: (fName.value || "").trim(),
        desc: (fDesc.value || "").trim(),
        priceJOD: Math.max(0, Number(fPrice.value || 0)),
        imageUrl: (fImg.value || "").trim() || "https://images.unsplash.com/photo-1550547660-d9450f859349?w=1400&q=80",
        isAvailable: !!fAvail.checked
      };

      if (editingItemId) {
        // update
        Storage.setState(s => {
          const x = (s.items || []).find(z => z.id === editingItemId);
          if (!x) return s;
          Object.assign(x, payload);
          return s;
        });
        showToast("تم تعديل الصنف.");
      } else {
        // create
        Storage.setState(s => {
          const newItem = {
            id: "it_" + crypto.randomUUID().slice(0, 8),
            ...payload
          };
          s.items.unshift(newItem);
          return s;
        });
        showToast("تمت إضافة صنف جديد.");
      }

      closeItemModal();
      renderMenuAdmin();
    }

    btnSaveItem?.addEventListener("click", saveItemFromModal);

    function toggleAvailability(itemId) {
      Storage.setState(s => {
        const x = (s.items || []).find(z => z.id === itemId);
        if (!x) return s;
        x.isAvailable = !x.isAvailable;
        return s;
      });
      renderMenuAdmin();
      showToast("تم تحديث توفر الصنف.");
    }

    function deleteItem(itemId) {
      const ok = confirm("هل أنت متأكد من حذف هذا الصنف؟");
      if (!ok) return;

      Storage.setState(s => {
        s.items = (s.items || []).filter(z => z.id !== itemId);
        // إزالة أي أثر له في سلة المستخدم (احتياطي)
        s.cart = (s.cart || []).filter(ci => ci.itemId !== itemId);
        return s;
      });

      renderMenuAdmin();
      showToast("تم حذف الصنف.");
    }

    function getAdminMenuFiltered() {
      const st = Storage.getState();
      const q = (elMenuSearchAdmin?.value || "").trim().toLowerCase();

      let items = (st.items || []).slice();

      if (q) {
        items = items.filter(it =>
          (it.name || "").toLowerCase().includes(q) ||
          (it.desc || "").toLowerCase().includes(q)
        );
      }

      // ترتيب أبجدي
      items.sort((a, b) => (a.name || "").localeCompare(b.name || "", "ar"));
      return items;
    }

    function renderMenuAdmin() {
      if (!elMenuAdmin) return;

      const st = Storage.getState();
      const catsById = Object.fromEntries((st.categories || []).map(c => [c.id, c.name]));
      const items = getAdminMenuFiltered();

      elMenuAdmin.innerHTML = "";

      if (!items.length) {
        elMenuAdmin.innerHTML = `<div class="muted">لا توجد أصناف.</div>`;
        return;
      }

      for (const it of items) {
        const c = document.createElement("div");
        c.className = "menu-card";

        const catName = catsById[it.categoryId] || "قسم غير معروف";

        c.innerHTML = `
          <div style="display:flex; gap:10px; align-items:center;">
            <img src="${it.imageUrl}" alt="${it.name}" style="width:64px;height:64px;border-radius:16px;object-fit:cover;border:1px solid rgba(255,255,255,.10);">
            <div style="flex:1">
              <h3 style="margin:0;">${it.name}</h3>
              <div class="muted small">${catName}</div>
            </div>
            <span class="badge" style="background:${it.isAvailable ? "rgba(33,199,126,.12)" : "rgba(255,77,77,.12)"}; border-color:${it.isAvailable ? "rgba(33,199,126,.35)" : "rgba(255,77,77,.35)"}">
              ${it.isAvailable ? "متاح" : "موقوف"}
            </span>
          </div>

          <div class="muted small" style="margin-top:10px; line-height:1.8;">
            ${it.desc || "—"}
          </div>

          <div class="row">
            <span class="muted small">السعر (د.أ)</span>
            <input class="input" type="number" step="0.05" min="0" value="${Number(it.priceJOD || 0)}">
          </div>

          <div class="controls" style="margin-top:12px;">
            <button class="btn btn-primary" type="button" data-act="savePrice">
              <i class="fa-solid fa-floppy-disk"></i> حفظ السعر
            </button>
            <button class="btn btn-secondary" type="button" data-act="edit">
              <i class="fa-solid fa-pen"></i> تعديل كامل
            </button>
            <button class="btn ${it.isAvailable ? "btn-secondary" : "btn-danger"}" type="button" data-act="toggle">
              <i class="fa-solid fa-power-off"></i> ${it.isAvailable ? "إيقاف" : "تشغيل"}
            </button>
            <button class="btn btn-danger" type="button" data-act="delete">
              <i class="fa-solid fa-trash"></i> حذف
            </button>
          </div>
        `;

        const priceInput = c.querySelector("input");
        c.querySelector('[data-act="savePrice"]').addEventListener("click", () => {
          const newPrice = Math.max(0, Number(priceInput.value || 0));
          Storage.setState(s => {
            const x = (s.items || []).find(z => z.id === it.id);
            if (!x) return s;
            x.priceJOD = newPrice;
            return s;
          });
          showToast("تم حفظ السعر.");
        });

        c.querySelector('[data-act="edit"]').addEventListener("click", () => openItemModal("edit", it));
        c.querySelector('[data-act="toggle"]').addEventListener("click", () => toggleAvailability(it.id));
        c.querySelector('[data-act="delete"]').addEventListener("click", () => deleteItem(it.id));

        elMenuAdmin.appendChild(c);
      }
    }

    elMenuSearchAdmin?.addEventListener("input", renderMenuAdmin);

    // ---------- Init ----------
    loadSettingsUI();
    renderOpenBadge();
    renderOrders();
    renderMenuAdmin();

    // تحديث دوري للطلبات
    setInterval(() => { renderOrders(); }, 2000);
  }
})();
