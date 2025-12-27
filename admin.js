(function () {
  Storage.initIfEmpty();

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
  const toast = document.getElementById("toast");

  // ---------- Helpers ----------
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 2600);
  }

  function statusLabel(s) {
    switch (s) {
      case "RECEIVED":
        return "تم الاستلام";
      case "PREPARING":
        return "قيد التحضير";
      case "ON_THE_WAY":
        return "بالطريق";
      case "DELIVERED":
        return "تم التسليم";
      case "CANCELED":
        return "ملغي";
      default:
        return s;
    }
  }

  function statusPillStyle(status) {
    // أسلوب بسيط بألوان Inline حتى يعمل دون تعديل CSS إضافي
    switch (status) {
      case "RECEIVED":
        return { bg: "rgba(91,140,255,.12)", bd: "rgba(91,140,255,.35)" };
      case "PREPARING":
        return { bg: "rgba(242,201,76,.12)", bd: "rgba(242,201,76,.35)" };
      case "ON_THE_WAY":
        return { bg: "rgba(33,199,126,.12)", bd: "rgba(33,199,126,.35)" };
      case "DELIVERED":
        return { bg: "rgba(33,199,126,.16)", bd: "rgba(33,199,126,.45)" };
      case "CANCELED":
        return { bg: "rgba(255,77,77,.12)", bd: "rgba(255,77,77,.40)" };
      default:
        return { bg: "rgba(255,255,255,.06)", bd: "rgba(255,255,255,.14)" };
    }
  }

  // ---------- Badge ----------
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

    if (elDelivery) elDelivery.value = Number(st.settings.deliveryFeeIQD || 0);
    if (elMinOrder) elMinOrder.value = Number(st.settings.minOrderIQD || 0);
    if (elHours) elHours.value = st.settings.workingHoursText || "";

    const radios = document.querySelectorAll('input[name="isOpen"]');
    radios.forEach((r) => {
      r.checked = String(st.settings.isOpenNow) === r.value;
    });

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
      s.settings.deliveryFeeIQD = delivery;
      s.settings.minOrderIQD = minOrder;
      if (hours) s.settings.workingHoursText = hours;
      return s;
    });

    renderOpenBadge();
    showToast("تم حفظ الإعدادات.");
  }

  function resetDemo() {
    // إعادة ضبط كاملة إلى DEMO_SEED
    localStorage.removeItem("LQS_APP_V1");
    Storage.initIfEmpty();
    loadSettingsUI();
    renderOrders();
    renderMenuAdmin();
    showToast("تمت إعادة ضبط بيانات العرض.");
  }

  if (elSave) elSave.addEventListener("click", saveSettings);
  if (elReset) elReset.addEventListener("click", resetDemo);

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

  function renderOrders() {
    const orders = getOrdersFiltered();

    if (!elOrders) return;

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

      const createdAt = o.createdAt ? new Date(o.createdAt).toLocaleString("ar-IQ") : "-";
      meta.innerHTML = `
        الهاتف: <strong>${o.customerPhone || "-"}</strong>
        ${o.customerName ? ` • الاسم: <strong>${o.customerName}</strong>` : ""}
        <br/>الوقت: ${createdAt}
        <br/>الإجمالي: <strong>${Storage.formatIQD(o.totalIQD || 0)}</strong>
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

      const btnRec = mkBtn("تم الاستلام", () => updateOrderStatus(o.id, "RECEIVED"), "btn btn-secondary");
      const btnPrep = mkBtn("قيد التحضير", () => updateOrderStatus(o.id, "PREPARING"), "btn btn-secondary");
      const btnWay = mkBtn("بالطريق", () => updateOrderStatus(o.id, "ON_THE_WAY"), "btn btn-secondary");
      const btnDel = mkBtn("تم التسليم", () => updateOrderStatus(o.id, "DELIVERED"), "btn btn-primary");
      const btnCan = mkBtn("إلغاء", () => updateOrderStatus(o.id, "CANCELED"), "btn btn-danger");

      controls.append(btnRec, btnPrep, btnWay, btnDel, btnCan);

      box.appendChild(head);
      box.appendChild(items);
      box.appendChild(addr);
      box.appendChild(controls);

      elOrders.appendChild(box);
    }
  }

  function mkBtn(text, onClick, cls = "btn btn-secondary") {
    const b = document.createElement("button");
    b.type = "button";
    b.className = cls;
    b.textContent = text;
    b.addEventListener("click", onClick);
    return b;
  }

  if (elFilter) elFilter.addEventListener("change", renderOrders);
  if (elSearch) elSearch.addEventListener("input", renderOrders);

  // ---------- Menu Admin ----------
  function renderMenuAdmin() {
    const st = Storage.getState();
    const items = (st.items || []).slice().sort((a, b) => (a.name || "").localeCompare(b.name || "", "ar"));

    if (!elMenuAdmin) return;

    elMenuAdmin.innerHTML = "";

    for (const it of items) {
      const c = document.createElement("div");
      c.className = "menu-card";

      const h = document.createElement("h3");
      h.textContent = it.name || "صنف";

      const desc = document.createElement("div");
      desc.className = "muted small";
      desc.textContent = it.desc || "";

      const r1 = document.createElement("div");
      r1.className = "row";

      const priceLabel = document.createElement("span");
      priceLabel.className = "muted small";
      priceLabel.textContent = "السعر (د.ع)";

      const priceInput = document.createElement("input");
      priceInput.className = "input";
      priceInput.type = "number";
      priceInput.min = "0";
      priceInput.value = String(it.priceIQD || 0);

      r1.appendChild(priceLabel);
      r1.appendChild(priceInput);

      const r2 = document.createElement("div");
      r2.className = "row";

      const availLabel = document.createElement("span");
      availLabel.className = "muted small";
      availLabel.textContent = "التوفر";

      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = it.isAvailable ? "btn btn-secondary" : "btn btn-danger";
      toggle.textContent = it.isAvailable ? "مُفعّل" : "مُوقّف";

      r2.appendChild(availLabel);
      r2.appendChild(toggle);

      const r3 = document.createElement("div");
      r3.className = "row";

      const saveBtn = document.createElement("button");
      saveBtn.type = "button";
      saveBtn.className = "btn btn-primary";
      saveBtn.textContent = "حفظ";

      r3.appendChild(document.createElement("span"));
      r3.appendChild(saveBtn);

      toggle.addEventListener("click", () => {
        Storage.setState((s) => {
          const x = (s.items || []).find((z) => z.id === it.id);
          if (!x) return s;
          x.isAvailable = !x.isAvailable;
          return s;
        });
        renderMenuAdmin();
        showToast("تم تحديث حالة الصنف.");
      });

      saveBtn.addEventListener("click", () => {
        const newPrice = Math.max(0, Number(priceInput.value || 0));
        Storage.setState((s) => {
          const x = (s.items || []).find((z) => z.id === it.id);
          if (!x) return s;
          x.priceIQD = newPrice;
          return s;
        });
        showToast("تم حفظ السعر.");
      });

      c.appendChild(h);
      c.appendChild(desc);
      c.appendChild(r1);
      c.appendChild(r2);
      c.appendChild(r3);

      elMenuAdmin.appendChild(c);
    }
  }

  // ---------- Init ----------
  loadSettingsUI();
  renderOrders();
  renderMenuAdmin();

  // تحديث تلقائي لالتقاط طلبات جديدة (ضمن نفس localStorage)
  setInterval(() => {
    renderOrders();
  }, 2000);
})();
