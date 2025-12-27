(function () {
  Storage.initIfEmpty();

  const elMenuGrid = document.getElementById("menuGrid");
  const elCategory = document.getElementById("categorySelect");
  const elSearch = document.getElementById("searchInput");

  const elCartItems = document.getElementById("cartItems");
  const elCartMeta = document.getElementById("cartMeta");

  const elPhone = document.getElementById("phoneInput");
  const elName = document.getElementById("nameInput");
  const elNotes = document.getElementById("notesInput");
  const elAddress = document.getElementById("addressInput");

  const elSubtotal = document.getElementById("subtotalText");
  const elDelivery = document.getElementById("deliveryText");
  const elTotal = document.getElementById("totalText");

  const elSubtotal2 = document.getElementById("subtotalText2");
  const elDelivery2 = document.getElementById("deliveryText2");
  const elTotal2 = document.getElementById("totalText2");

  const elOpenBadge = document.getElementById("openBadge");
  const elBtnPlace = document.getElementById("btnPlaceOrder");

  const elFeaturedGrid = document.getElementById("featuredGrid");
  const elCartCount = document.getElementById("cartCount");

  const elTrackInput = document.getElementById("trackInput");
  const elBtnTrack = document.getElementById("btnTrack");
  const elBtnLastOrder = document.getElementById("btnLastOrder");
  const elTrackBox = document.getElementById("trackBox");

  const toast = document.getElementById("toast");

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 2600);
  }

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

  function getSelectedPayment() {
    const r = document.querySelector('input[name="pay"]:checked');
    return r ? r.value : "COD";
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

  function renderCategorySelect() {
    const st = Storage.getState();
    const cats = st.categories
      .filter(c => c.isActive)
      .sort((a,b) => (a.sort||0)-(b.sort||0));

    elCategory.innerHTML = "";
    const optAll = document.createElement("option");
    optAll.value = "ALL";
    optAll.textContent = "كل الأقسام";
    elCategory.appendChild(optAll);

    for (const c of cats) {
      const o = document.createElement("option");
      o.value = c.id;
      o.textContent = c.name;
      elCategory.appendChild(o);
    }
  }

  function getFilteredItems() {
    const st = Storage.getState();
    const q = (elSearch.value || "").trim().toLowerCase();
    const cat = elCategory.value || "ALL";

    return st.items
      .filter(it => it.isAvailable)
      .filter(it => (cat === "ALL" ? true : it.categoryId === cat))
      .filter(it => {
        if (!q) return true;
        return it.name.toLowerCase().includes(q) || (it.desc||"").toLowerCase().includes(q);
      });
  }

  function renderMenu() {
    const items = getFilteredItems();
    elMenuGrid.innerHTML = "";

    if (!items.length) {
      elMenuGrid.innerHTML = `<div class="muted">لا توجد أصناف مطابقة.</div>`;
      return;
    }

    for (const it of items) {
      const card = document.createElement("div");
      card.className = "item";

      card.innerHTML = `
        <img src="${it.imageUrl}" alt="${it.name}">
        <div class="body">
          <p class="title">${it.name}</p>
          <p class="desc">${it.desc || ""}</p>
          <div class="meta">
            <span class="price">${Storage.formatJOD(it.priceJOD)}</span>
            <button class="btn btn-primary" type="button">
              <i class="fa-solid fa-plus"></i> أضف
            </button>
          </div>
        </div>
      `;

      card.querySelector("button").addEventListener("click", () => addToCart(it.id));
      elMenuGrid.appendChild(card);
    }
  }

  function renderFeatured() {
    if (!elFeaturedGrid) return;
    const st = Storage.getState();
    const featured = st.items.filter(x => x.isAvailable).slice(0, 3);

    elFeaturedGrid.innerHTML = "";
    for (const it of featured) {
      const box = document.createElement("div");
      box.className = "featured";
      box.innerHTML = `
        <img src="${it.imageUrl}" alt="${it.name}">
        <div style="flex:1">
          <p class="f-title">${it.name}</p>
          <div class="f-sub">${it.desc || ""}</div>
          <div class="f-meta">
            <span class="price">${Storage.formatJOD(it.priceJOD)}</span>
            <span class="pill">شائع</span>
          </div>
        </div>
      `;
      box.addEventListener("click", () => addToCart(it.id));
      elFeaturedGrid.appendChild(box);
    }
  }

  function addToCart(itemId) {
    const st = Storage.getState();
    const item = st.items.find(x => x.id === itemId);
    if (!item || !item.isAvailable) {
      showToast("هذا الصنف غير متاح.");
      return;
    }

    Storage.setState(s => {
      const row = s.cart.find(ci => ci.itemId === itemId);
      if (row) row.qty += 1;
      else s.cart.push({ itemId, qty: 1 });
      return s;
    });

    renderCart();
    showToast("تمت الإضافة إلى السلة.");
  }

  function changeQty(itemId, delta) {
    Storage.setState(s => {
      const row = s.cart.find(ci => ci.itemId === itemId);
      if (!row) return s;
      row.qty += delta;
      if (row.qty <= 0) s.cart = s.cart.filter(ci => ci.itemId !== itemId);
      return s;
    });
    renderCart();
  }

  function removeFromCart(itemId) {
    Storage.setState(s => {
      s.cart = s.cart.filter(ci => ci.itemId !== itemId);
      return s;
    });
    renderCart();
  }

  function computeTotals() {
    const st = Storage.getState();
    let subtotal = 0;

    for (const ci of st.cart) {
      const it = st.items.find(x => x.id === ci.itemId);
      if (!it) continue;
      subtotal += (it.priceJOD || 0) * (ci.qty || 0);
    }

    const delivery = Number(st.settings.deliveryFeeJOD || 0);
    const total = subtotal + delivery;
    return { subtotal, delivery, total };
  }

  function renderCart() {
    const st = Storage.getState();
    elCartItems.innerHTML = "";

    if (!st.cart.length) {
      elCartItems.innerHTML = `<div class="muted">السلة فارغة. ابدأ بإضافة أصناف من المنيو.</div>`;
    } else {
      for (const ci of st.cart) {
        const it = st.items.find(x => x.id === ci.itemId);
        if (!it) continue;

        const row = document.createElement("div");
        row.className = "cart-row";

        row.innerHTML = `
          <div class="left">
            <h3>${it.name}</h3>
            <div class="muted small">
              السعر: ${Storage.formatJOD(it.priceJOD)} •
              الإجمالي: ${Storage.formatJOD((it.priceJOD||0) * (ci.qty||0))}
            </div>
          </div>
          <div class="right">
            <div class="qty">
              <button type="button" data-act="minus">−</button>
              <strong>${ci.qty}</strong>
              <button type="button" data-act="plus">+</button>
            </div>
            <button class="btn btn-danger" type="button" data-act="del">حذف</button>
          </div>
        `;

        row.querySelector('[data-act="minus"]').addEventListener("click", ()=> changeQty(ci.itemId, -1));
        row.querySelector('[data-act="plus"]').addEventListener("click", ()=> changeQty(ci.itemId, 1));
        row.querySelector('[data-act="del"]').addEventListener("click", ()=> removeFromCart(ci.itemId));

        elCartItems.appendChild(row);
      }
    }

    const { subtotal, delivery, total } = computeTotals();

    if (elSubtotal) elSubtotal.textContent = Storage.formatJOD(subtotal);
    if (elDelivery) elDelivery.textContent = Storage.formatJOD(delivery);
    if (elTotal) elTotal.textContent = Storage.formatJOD(total);

    if (elSubtotal2) elSubtotal2.textContent = Storage.formatJOD(subtotal);
    if (elDelivery2) elDelivery2.textContent = Storage.formatJOD(delivery);
    if (elTotal2) elTotal2.textContent = Storage.formatJOD(total);

    const minOrder = Number(st.settings.minOrderJOD || 0);
    if (elCartMeta) {
      elCartMeta.textContent = `حد أدنى للطلب: ${Storage.formatJOD(minOrder)} • أجرة التوصيل: ${Storage.formatJOD(delivery)}`;
    }

    if (elCartCount) {
      const count = st.cart.reduce((acc, x) => acc + (x.qty || 0), 0);
      elCartCount.textContent = String(count);
    }
  }

  // Map (Amman)
  let map, marker = null;
  let pickedLatLng = null;

  function initMap() {
    const center = [31.9539, 35.9106]; // عمّان
    map = L.map("map").setView(center, 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    map.on("click", (e) => setMarker(e.latlng.lat, e.latlng.lng));
  }

  function setMarker(lat, lng) {
    pickedLatLng = { lat, lng };
    if (marker) marker.remove();
    marker = L.marker([lat, lng]).addTo(map);
    map.setView([lat, lng], 15);
    showToast("تم تحديد موقعك.");
  }

  const btnMyLocation = document.getElementById("btnMyLocation");
  if (btnMyLocation) {
    btnMyLocation.addEventListener("click", () => {
      if (!navigator.geolocation) return showToast("ميزة الموقع غير مدعومة.");
      navigator.geolocation.getCurrentPosition(
        (pos) => setMarker(pos.coords.latitude, pos.coords.longitude),
        () => showToast("تعذر الحصول على موقعك. فعّل الأذونات.")
      );
    });
  }

  function validateBeforeOrder() {
    const st = Storage.getState();
    if (!st.settings.isOpenNow) return { ok:false, msg:"المطعم مغلق حاليًا." };
    if (!st.cart.length) return { ok:false, msg:"السلة فارغة." };

    const phone = (elPhone.value || "").trim();
    if (!phone || phone.length < 8) return { ok:false, msg:"أدخل رقم هاتف صحيح." };

    if (!pickedLatLng) return { ok:false, msg:"حدد موقعك على الخريطة أولًا." };

    const { subtotal } = computeTotals();
    const minOrder = Number(st.settings.minOrderJOD || 0);
    if (subtotal < minOrder) {
      return { ok:false, msg:`الحد الأدنى للطلب هو ${Storage.formatJOD(minOrder)}.` };
    }

    return { ok:true };
  }

  function tryNotify(message) {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      new Notification("لقمان أبو صليح", { body: message });
      return;
    }
    if (Notification.permission !== "denied") {
      Notification.requestPermission().then((p) => {
        if (p === "granted") new Notification("لقمان أبو صليح", { body: message });
      });
    }
  }

  function placeOrder() {
    const check = validateBeforeOrder();
    if (!check.ok) return showToast(check.msg);

    const st = Storage.getState();
    const { subtotal, delivery, total } = computeTotals();

    const orderNumber = Storage.nextOrderNumber();
    const now = new Date().toISOString();

    const phone = (elPhone.value || "").trim();
    const name = (elName.value || "").trim();
    const notes = (elNotes.value || "").trim();
    const address = (elAddress.value || "").trim();
    const pay = getSelectedPayment();

    const orderItems = st.cart.map((ci) => {
      const it = st.items.find((x) => x.id === ci.itemId);
      return {
        itemId: ci.itemId,
        nameSnapshot: it ? it.name : "عنصر",
        unitPriceJOD: it ? it.priceJOD : 0,
        qty: ci.qty,
        lineTotalJOD: (it ? it.priceJOD : 0) * ci.qty,
      };
    });

    const order = {
      id: crypto.randomUUID(),
      orderNumber,
      status: "RECEIVED",
      createdAt: now,
      customerPhone: phone,
      customerName: name || null,
      notes: notes || null,
      addressText: address || null,
      lat: pickedLatLng.lat,
      lng: pickedLatLng.lng,
      paymentMethod: pay,
      subtotalJOD: subtotal,
      deliveryFeeJOD: delivery,
      totalJOD: total,
      items: orderItems,
      history: [{ at: now, status: "RECEIVED" }],
    };

    Storage.setState((s) => {
      s.orders.unshift(order);
      s.lastOrderNumber = orderNumber;
      s.cart = [];
      return s;
    });

    renderCart();
    showToast(`تم تأكيد الطلب. رقم الطلب: ${orderNumber}`);
    tryNotify(`تم استلام طلبك ${orderNumber}.`);

    if (elTrackInput) elTrackInput.value = orderNumber;
    renderTracking(orderNumber);
  }

  if (elBtnPlace) elBtnPlace.addEventListener("click", placeOrder);

  function renderTracking(orderNumber) {
    const st = Storage.getState();
    const o = st.orders.find((x) => x.orderNumber === orderNumber);

    if (!elTrackBox) return;

    if (!o) {
      elTrackBox.classList.remove("hidden");
      elTrackBox.innerHTML = `<div class="muted">لم يتم العثور على هذا الطلب.</div>`;
      return;
    }

    const itemsHtml = o.items
      .map((i) => `• ${i.nameSnapshot} × ${i.qty} = ${Storage.formatJOD(i.lineTotalJOD)}`)
      .join("<br/>");

    const histHtml = (o.history || [])
      .map((h) => `- ${statusLabel(h.status)} (${new Date(h.at).toLocaleString("ar-JO")})`)
      .join("<br/>");

    elTrackBox.classList.remove("hidden");
    elTrackBox.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
        <div><strong>رقم الطلب:</strong> ${o.orderNumber}</div>
        <div class="pill"><strong>${statusLabel(o.status)}</strong></div>
      </div>
      <div class="muted small" style="margin-top:6px;">
        الوقت: ${new Date(o.createdAt).toLocaleString("ar-JO")} •
        الإجمالي: <strong>${Storage.formatJOD(o.totalJOD)}</strong>
      </div>
      <div style="margin-top:10px;">
        <strong>تفاصيل الطلب:</strong><br/>
        ${itemsHtml}
      </div>
      <div style="margin-top:10px;">
        <strong>العنوان والموقع:</strong><br/>
        ${o.addressText ? `العنوان: ${o.addressText}<br/>` : ""}
        الإحداثيات: ${o.lat.toFixed(5)}, ${o.lng.toFixed(5)}
      </div>
      ${o.notes ? `<div style="margin-top:10px;"><strong>ملاحظات:</strong><br/>${o.notes}</div>` : ""}
      <div style="margin-top:10px;">
        <strong>سجل الحالات:</strong><br/>
        ${histHtml}
      </div>
    `;
  }

  if (elBtnTrack) {
    elBtnTrack.addEventListener("click", () => {
      const num = (elTrackInput.value || "").trim();
      if (!num) return showToast("أدخل رقم الطلب.");
      renderTracking(num);
    });
  }

  if (elBtnLastOrder) {
    elBtnLastOrder.addEventListener("click", () => {
      const st = Storage.getState();
      if (!st.lastOrderNumber) return showToast("لا يوجد طلب سابق.");
      elTrackInput.value = st.lastOrderNumber;
      renderTracking(st.lastOrderNumber);
    });
  }

  let lastTrackedStatus = null;
  setInterval(() => {
    const num = (elTrackInput?.value || "").trim();
    if (!num) return;

    const st = Storage.getState();
    const o = st.orders.find((x) => x.orderNumber === num);
    if (!o) return;

    if (lastTrackedStatus && lastTrackedStatus !== o.status) {
      tryNotify(`تحديث حالة الطلب ${num}: ${statusLabel(o.status)}`);
    }
    lastTrackedStatus = o.status;
    renderTracking(num);
  }, 2500);

  renderOpenBadge();
  renderCategorySelect();
  renderMenu();
  renderFeatured();
  renderCart();
  initMap();

  elCategory?.addEventListener("change", renderMenu);
  elSearch?.addEventListener("input", renderMenu);
})();
