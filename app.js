/**
 * TIỆM CHÈ NA - APPLICATION LOGIC & STATE MANAGEMENT
 */

// Master Menu Database
const MENU_DATA = [
  {
    id: "nem-nuong",
    name: "Nem Nướng Nha Trang Đặc Biệt",
    category: "hot",
    price: 35000,
    image: "images/img_06.jpg",
    badge: "BEST-SELLER",
    badgeType: "hot",
    description: "Nem nướng than hoa thơm lừng, cuốn kèm bánh tráng mềm, ram giòn rụm, dưa leo, xoài xanh và nước chấm thịt băm béo bùi gia truyền."
  },
  {
    id: "che-xoai",
    name: "Chè Xoài Caramen Núng Nính",
    category: "cold",
    price: 30000,
    image: "images/img_02.jpg",
    badge: "MÁT LẠNH",
    badgeType: "cold",
    description: "Caramen mịn màng núng nính, thịt xoài tươi vàng mọng ngọt thanh quyện cùng nước cốt dừa thơm ngậy và thạch giòn sần sật."
  },
  {
    id: "my-tron",
    name: "Mỳ Trộn Sốt Cay Đậm Đà",
    category: "hot",
    price: 35000,
    image: "images/img_07.jpg",
    badge: "ĐẬM VỊ",
    badgeType: "hot",
    description: "Sợi mỳ dai mềm thấm đẫm sốt chua ngọt cay tê, topping trứng cút, thịt bò khô, chả viên, rau thơm và hành phi thơm nức mũi."
  },
  {
    id: "chan-ga",
    name: "Chân Gà Sốt Thái Xoài Cóc",
    category: "hot",
    price: 35000,
    image: "images/img_04.jpg",
    badge: "CỰC CUỐN",
    badgeType: "hot",
    description: "Chân gà giòn sần sật rút xương, ngập trong sốt Thái chua cay tê lưỡi, thơm mùi sả quất và quả xoài, cóc tươi giòn rụm."
  },
  {
    id: "my-cay",
    name: "Mỳ Cay 7 Cấp Độ Hải Sản/Bò",
    category: "hot",
    price: 35000,
    image: "images/img_05.jpg",
    badge: "CAY TÊ",
    badgeType: "hot",
    description: "Nước dùng chua cay kim chi đậm đà, tôm sú tươi, xúc xích, mực viên, nấm kim châm và rau cải tươi mát kích thích vị giác."
  },
  {
    id: "tra-sua",
    name: "Trà Sữa Trân Châu Đường Đen",
    category: "cold",
    price: 25000,
    image: "images/img_01.jpg",
    badge: "THƠM BÉO",
    badgeType: "cold",
    description: "Trà sữa pha mới đậm vị trà thơm lừng, ngọt thanh dịu nhẹ, trân châu dẻo dai nấu đường đen ấm nóng ngậy béo."
  },
  {
    id: "che-dua-dam",
    name: "Chè Dừa Dầm Hải Phòng",
    category: "cold",
    price: 25000,
    image: "images/img_03.jpg",
    badge: "THANH MÁT",
    badgeType: "cold",
    description: "Cơm dừa non giòn bùi, thạch dừa thanh mát, trân châu dừa nhân cùi dừa tươi chan đẫm sữa dừa béo ngậy đặc biệt."
  },
  {
    id: "banh-mi-chao",
    name: "Bánh Mì Chảo Thập Cẩm",
    category: "hot",
    price: 35000,
    image: "images/img_09.jpg",
    badge: "NÓNG GIÒN",
    badgeType: "hot",
    description: "Chảo sốt nóng hổi xèo xèo gồm trứng ốp la lòng đào, pate béo ngậy, xúc xích rán giòn, chả lụa kèm bánh mì giòn tan."
  },
  {
    id: "ga-ran-kimbap",
    name: "Mẹt Đồ Chiên & Gà Rán Cay",
    category: "hot",
    price: 45000,
    image: "images/img_08.jpg",
    badge: "GIÒN RỤM",
    badgeType: "hot",
    description: "Gà rán sốt cay Hàn Quốc đậm vị, nem chua rán béo ngậy, xúc xích và khoai tây lắc phô mai giòn rụm chấm tương ớt cay."
  },
  {
    id: "tao-pho-caramen",
    name: "Tào Phớ Caramen Thạch Trắng",
    category: "cold",
    price: 20000,
    image: "images/img_10.jpg",
    badge: "MỀM MƯỚT",
    badgeType: "cold",
    description: "Tào phớ mướt mịn tự làm từ đậu nành nguyên chất, nước đường hoa nhài thanh dịu kết hợp bánh caramen béo ngậy thơm ngon."
  },
  {
    id: "sua-chua-mit",
    name: "Sữa Chua Mít Hạt Đác Rim",
    category: "cold",
    price: 25000,
    image: "images/img_10.jpg",
    badge: "GIẢI NHIỆT",
    badgeType: "cold",
    description: "Mít dai ngọt thơm lừng, sữa chua lên men tự nhiên, trân châu giòn sần sật và hạt đác rim đường phèn dẻo bùi."
  },
  {
    id: "tra-chanh-quat",
    name: "Trà Chanh Giã Tay & Nước Ép",
    category: "cold",
    price: 20000,
    image: "images/img_13.jpg",
    badge: "TƯƠI MÁT",
    badgeType: "cold",
    description: "Trà chanh Quảng Đông thơm nồng tinh dầu chanh giã tay tươi mới, chua thanh ngọt mát giải ngấy tức thì."
  },
  {
    id: "pack-nem-nuong",
    name: "Nem Nướng Túi Hút Chân Không",
    category: "pack",
    price: 95000,
    image: "images/img_14.jpg",
    badge: "CHUẨN ATTP",
    badgeType: "hot",
    description: "Gói nem nướng Nha Trang đóng gói vô trùng hút chân không (10 xiên lớn), có tem mác ATTP và tặng kèm túi nước chấm gia truyền."
  },
  {
    id: "pack-nem-lui",
    name: "Nem Lụi Huế Que Sả Hút Chân Không",
    category: "pack",
    price: 95000,
    image: "images/img_15.jpg",
    badge: "CHUẨN ATTP",
    badgeType: "hot",
    description: "Gói nem lụi bọc que sả tươi đóng gói hút chân không (10 que), có nhãn mác rõ ràng, tặng kèm túi nước lèo đậu phộng thơm bùi."
  }
];

// Shopping Cart State (saved to LocalStorage)
let cart = {};

// Filter & Search State
let activeCategory = 'all';
let searchQuery = '';
let currentCustomizingId = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  loadCartFromStorage();
  updateCategoryCounts();
  renderMenu();
  updateCartUI();
  initStoreHours();
});

// Format VND Money
function formatMoney(amount) {
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
}

// Check Opening Hours (09:00 - 22:30)
function initStoreHours() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const time = hours + minutes / 60;
  const statusDot = document.querySelector('.status-dot');
  const statusText = document.getElementById('statusText');

  if (statusText && statusDot) {
    if (time >= 9 && time <= 22.5) {
      statusDot.style.background = '#27AE60';
      statusText.textContent = 'Đang mở cửa phục vụ nóng hổi • 09:00 - 22:30';
    } else {
      statusDot.style.background = '#E67E22';
      statusText.textContent = 'Tiệm nhận đặt trước cho ngày mai • Mở cửa lúc 09:00';
    }
  }
}

// Update category item counts
function updateCategoryCounts() {
  const allCount = MENU_DATA.length;
  const hotCount = MENU_DATA.filter(i => i.category === 'hot').length;
  const coldCount = MENU_DATA.filter(i => i.category === 'cold').length;
  const packCount = MENU_DATA.filter(i => i.category === 'pack').length;

  if (document.getElementById('countAll')) document.getElementById('countAll').textContent = allCount;
  if (document.getElementById('countHot')) document.getElementById('countHot').textContent = hotCount;
  if (document.getElementById('countCold')) document.getElementById('countCold').textContent = coldCount;
  if (document.getElementById('countPack')) document.getElementById('countPack').textContent = packCount;
}

// Render Menu Items
function renderMenu() {
  const container = document.getElementById('menuGridContainer');
  const emptyState = document.getElementById('menuEmptyState');
  if (!container) return;

  const filtered = MENU_DATA.filter(item => {
    const matchCategory = (activeCategory === 'all') || (item.category === activeCategory);
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  container.innerHTML = filtered.map(item => `
    <div class="menu-card" data-id="${item.id}">
      <div class="menu-card-img-wrap" onclick="openLightbox('${item.image}', '${item.name}')">
        ${item.badge ? `<span class="menu-card-tag badge-${item.badgeType}">${item.badge}</span>` : ''}
        <img src="${item.image}" alt="${item.name}" loading="lazy">
      </div>
      <div class="menu-card-body">
        <h4 class="menu-card-title">${item.name}</h4>
        <p class="menu-card-desc">${item.description}</p>
        <div class="menu-card-footer">
          <span class="menu-card-price">${formatMoney(item.price)}</span>
          <button class="btn-card-add" onclick="addToCart('${item.id}')">
            <i class="fa-solid fa-plus"></i> Chọn Món
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// Category Filter Actions
function filterCategory(category) {
  activeCategory = category;
  document.querySelectorAll('.cat-btn').forEach(btn => {
    if (btn.getAttribute('data-category') === category) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  renderMenu();
}

function filterAndScroll(category) {
  filterCategory(category);
  const menuEl = document.getElementById('menu');
  if (menuEl) {
    menuEl.scrollIntoView({ behavior: 'smooth' });
  }
}

// Search Actions
function handleSearch(val) {
  searchQuery = val.trim();
  const clearBtn = document.getElementById('clearSearchBtn');
  if (clearBtn) {
    clearBtn.style.display = searchQuery ? 'block' : 'none';
  }
  renderMenu();
}

function clearSearch() {
  const input = document.getElementById('menuSearchInput');
  if (input) {
    input.value = '';
    handleSearch('');
  }
}

// ==========================================================================
// CART OPERATIONS
// ==========================================================================

function loadCartFromStorage() {
  try {
    const saved = localStorage.getItem('tiemchena_cart');
    if (saved) {
      cart = JSON.parse(saved);
    }
  } catch (e) {
    cart = {};
  }
}

function saveCartToStorage() {
  try {
    localStorage.setItem('tiemchena_cart', JSON.stringify(cart));
  } catch (e) {}
}

function addToCart(itemId, note = '') {
  const item = MENU_DATA.find(i => i.id === itemId);
  if (!item) return;

  const cartKey = itemId + (note ? '_' + note : '');

  if (cart[cartKey]) {
    cart[cartKey].qty++;
  } else {
    cart[cartKey] = {
      id: itemId,
      name: item.name,
      price: item.price,
      image: item.image,
      note: note,
      qty: 1
    };
  }

  saveCartToStorage();
  updateCartUI();
  showToast(`Đã thêm "${item.name}" vào giỏ!`);
}

function updateCartQty(cartKey, change) {
  if (!cart[cartKey]) return;

  cart[cartKey].qty += change;
  if (cart[cartKey].qty <= 0) {
    delete cart[cartKey];
  }

  saveCartToStorage();
  updateCartUI();
}

function updateCartUI() {
  const keys = Object.keys(cart);
  let totalCount = 0;
  let subtotal = 0;

  keys.forEach(k => {
    totalCount += cart[k].qty;
    subtotal += cart[k].price * cart[k].qty;
  });

  // Calculate 10% discount promo
  const discount = Math.round(subtotal * 0.10);
  const finalTotal = subtotal - discount;

  // Header & Mobile Badges
  const cartBadge = document.getElementById('cartBadge');
  const mobileCartCount = document.getElementById('mobileCartCount');
  const mobileCartTotal = document.getElementById('mobileCartTotal');
  const cartDrawerCount = document.getElementById('cartDrawerCount');

  if (cartBadge) cartBadge.textContent = totalCount;
  if (mobileCartCount) mobileCartCount.textContent = totalCount;
  if (mobileCartTotal) mobileCartTotal.textContent = formatMoney(finalTotal > 0 ? finalTotal : 0);
  if (cartDrawerCount) cartDrawerCount.textContent = `(${totalCount} món)`;

  // Summary fields
  const subtotalEl = document.getElementById('cartSubtotal');
  const discountEl = document.getElementById('cartDiscount');
  const finalTotalEl = document.getElementById('cartFinalTotal');

  if (subtotalEl) subtotalEl.textContent = formatMoney(subtotal);
  if (discountEl) discountEl.textContent = '-' + formatMoney(discount);
  if (finalTotalEl) finalTotalEl.textContent = formatMoney(finalTotal > 0 ? finalTotal : 0);

  // Render items list inside drawer
  const cartList = document.getElementById('cartItemsList');
  const cartFooter = document.getElementById('cartFooter');

  if (cartList) {
    if (keys.length === 0) {
      cartList.innerHTML = `
        <div class="cart-empty-box">
          <i class="fa-solid fa-cart-arrow-down"></i>
          <h4>Giỏ hàng của bạn đang trống!</h4>
          <p>Hãy chọn những món ăn vặt giòn ngon hoặc chè thanh mát ở menu nhé.</p>
          <button class="btn btn-primary btn-sm mt-4" onclick="closeCartDrawer()">Xem Menu Ngay</button>
        </div>
      `;
      if (cartFooter) cartFooter.style.display = 'none';
    } else {
      if (cartFooter) cartFooter.style.display = 'block';
      cartList.innerHTML = keys.map(k => {
        const it = cart[k];
        return `
          <div class="cart-item-row">
            <img src="${it.image}" alt="${it.name}" class="cart-item-thumb">
            <div class="cart-item-details">
              <div class="cart-item-name">${it.name}</div>
              ${it.note ? `<div class="cart-item-note"><i class="fa-solid fa-pen"></i> ${it.note}</div>` : ''}
              <div class="cart-item-price">${formatMoney(it.price * it.qty)}</div>
            </div>
            <div class="cart-qty-ctrl">
              <button class="qty-btn" onclick="updateCartQty('${k}', -1)" title="Giảm">-</button>
              <span class="qty-val">${it.qty}</span>
              <button class="qty-btn" onclick="updateCartQty('${k}', 1)" title="Tăng">+</button>
            </div>
          </div>
        `;
      }).join('');
    }
  }
}

// Drawer Toggle
function openCartDrawer() {
  const backdrop = document.getElementById('cartBackdrop');
  if (backdrop) backdrop.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCartDrawer() {
  const backdrop = document.getElementById('cartBackdrop');
  if (backdrop) backdrop.classList.remove('active');
  document.body.style.overflow = '';
}

function handleBackdropClick(e) {
  if (e.target.id === 'cartBackdrop') {
    closeCartDrawer();
  }
}

// ==========================================================================
// ITEM CUSTOMIZATION MODAL
// ==========================================================================

function openCustomizeModal(itemId) {
  const item = MENU_DATA.find(i => i.id === itemId);
  if (!item) return;

  currentCustomizingId = itemId;
  const modalBackdrop = document.getElementById('customizeModalBackdrop');
  const title = document.getElementById('custItemTitle');
  const body = document.getElementById('custModalBody');
  const saveBtn = document.getElementById('custSaveBtn');

  if (title) title.textContent = `Tùy chọn: ${item.name}`;

  let optionsHtml = '';
  if (item.category === 'hot') {
    optionsHtml = `
      <div class="form-group">
        <label><strong>Độ Cay / Gia Vị:</strong></label>
        <select id="custSpiceOption" class="form-input" style="margin-top:6px;">
          <option value="Cay vừa (Mặc định)">Cay vừa (Chuẩn vị ngon)</option>
          <option value="Không cay / Ít cay">Không cay / Ít cay</option>
          <option value="Cay nhiều (Tê lưỡi)">Cay nhiều (Tê lưỡi)</option>
        </select>
      </div>
      <div class="form-group">
        <label><strong>Ghi chú riêng:</strong></label>
        <input type="text" id="custCustomNote" class="form-input" placeholder="VD: Thêm nhiều ram giòn, nhiều nước sốt..." style="margin-top:6px;">
      </div>
    `;
  } else if (item.category === 'cold') {
    optionsHtml = `
      <div class="form-group">
        <label><strong>Lượng Đá:</strong></label>
        <select id="custIceOption" class="form-input" style="margin-top:6px;">
          <option value="Đá riêng (Mặc định)">Đá để riêng (Giữ trọn vị)</option>
          <option value="Đá chung (Ăn ngay)">Đá chung (Ăn ngay)</option>
          <option value="Ít đá">Ít đá</option>
        </select>
      </div>
      <div class="form-group">
        <label><strong>Ghi chú riêng:</strong></label>
        <input type="text" id="custCustomNote" class="form-input" placeholder="VD: Ít ngọt, thêm cốt dừa..." style="margin-top:6px;">
      </div>
    `;
  } else {
    optionsHtml = `
      <div class="form-group">
        <label><strong>Ghi chú đơn hàng:</strong></label>
        <input type="text" id="custCustomNote" class="form-input" placeholder="VD: Cần gấp trong 20 phút..." style="margin-top:6px;">
      </div>
    `;
  }

  if (body) body.innerHTML = optionsHtml;

  if (saveBtn) {
    saveBtn.onclick = () => {
      let notes = [];
      const spice = document.getElementById('custSpiceOption');
      const ice = document.getElementById('custIceOption');
      const customNote = document.getElementById('custCustomNote');

      if (spice && spice.value) notes.push(spice.value);
      if (ice && ice.value) notes.push(ice.value);
      if (customNote && customNote.value.trim()) notes.push(customNote.value.trim());

      addToCart(currentCustomizingId, notes.join(' • '));
      closeCustomizeModal();
    };
  }

  if (modalBackdrop) modalBackdrop.classList.add('active');
}

function closeCustomizeModal() {
  const modalBackdrop = document.getElementById('customizeModalBackdrop');
  if (modalBackdrop) modalBackdrop.classList.remove('active');
}

function handleCustomizeBackdropClick(e) {
  if (e.target.id === 'customizeModalBackdrop') {
    closeCustomizeModal();
  }
}

// ==========================================================================
// CHECKOUT & ZALO ORDER CREATOR
// ==========================================================================

let lastGeneratedZaloOrder = "";

function submitOrderToZalo() {
  const keys = Object.keys(cart);
  if (keys.length === 0) {
    showToast('Giỏ hàng của bạn đang trống!', 'warning');
    return;
  }

  const nameInput = document.getElementById('orderCustomerName');
  const phoneInput = document.getElementById('orderCustomerPhone');
  const addressInput = document.getElementById('orderCustomerAddress');
  const noteInput = document.getElementById('orderCustomerNote');

  const customerName = nameInput ? nameInput.value.trim() : '';
  const customerPhone = phoneInput ? phoneInput.value.trim() : '';
  const customerAddress = addressInput ? addressInput.value.trim() : '';
  const customerNote = noteInput ? noteInput.value.trim() : '';

  if (!customerPhone || !customerAddress) {
    showToast('Vui lòng điền Số điện thoại & Địa chỉ nhận hàng!', 'warning');
    if (!customerPhone && phoneInput) phoneInput.focus();
    else if (!customerAddress && addressInput) addressInput.focus();
    return;
  }

  let subtotal = 0;
  let itemsText = '';

  keys.forEach((k, idx) => {
    const item = cart[k];
    const itemTotal = item.price * item.qty;
    subtotal += itemTotal;
    itemsText += `${idx + 1}. ${item.name} x${item.qty} (${formatMoney(itemTotal)})${item.note ? ` [${item.note}]` : ''}\n`;
  });

  const discount = Math.round(subtotal * 0.10);
  const finalTotal = subtotal - discount;

  // Build structured Zalo order message
  lastGeneratedZaloOrder = 
`🍲 ĐƠN HÀNG TỪ WEBSITE TIỆM CHÈ NA 🍲
---------------------------------------
👤 Khách hàng: ${customerName || 'Khách đặt online'}
📞 Điện thoại: ${customerPhone}
📍 Địa chỉ: ${customerAddress}
${customerNote ? `📝 Ghi chú: ${customerNote}\n` : ''}
📋 DANH SÁCH MÓN:
${itemsText}
---------------------------------------
💵 Tạm tính: ${formatMoney(subtotal)}
🎁 Ưu đãi đặt trước (-10%): -${formatMoney(discount)}
👉 TỔNG THANH TOÁN: ${formatMoney(finalTotal)}
---------------------------------------
(Tiệm Chè Na Vũ Lăng, Ngũ Hiệp • Giao nóng 30 phút)`;

  // Copy to clipboard
  try {
    navigator.clipboard.writeText(lastGeneratedZaloOrder);
  } catch (err) {}

  // Close Cart Drawer
  closeCartDrawer();

  // Show Order Success Modal with preview
  const successModal = document.getElementById('orderSuccessModal');
  const previewContent = document.getElementById('orderPreviewContent');
  if (previewContent) {
    previewContent.textContent = lastGeneratedZaloOrder;
  }
  if (successModal) {
    successModal.classList.add('active');
  }

  showToast('Đã sao chép đơn hàng! Đang mở Zalo Tiệm Na...');

  // Open Zalo chat
  setTimeout(() => {
    window.open('https://zalo.me/0986479285', '_blank');
  }, 1000);
}

function copyOrderAgain() {
  if (lastGeneratedZaloOrder) {
    try {
      navigator.clipboard.writeText(lastGeneratedZaloOrder);
      showToast('Đã sao chép lại đơn hàng!');
    } catch (e) {
      showToast('Không thể sao chép tự động.', 'warning');
    }
  }
}

function closeOrderSuccessModal() {
  const modal = document.getElementById('orderSuccessModal');
  if (modal) modal.classList.remove('active');
}

function handleOrderSuccessBackdropClick(e) {
  if (e.target.id === 'orderSuccessModal') {
    closeOrderSuccessModal();
  }
}


// ==========================================================================
// LIGHTBOX MODAL
// ==========================================================================

function openLightbox(imgSrc, caption = '') {
  const modal = document.getElementById('lightboxModal');
  const img = document.getElementById('lightboxImage');
  const cap = document.getElementById('lightboxCaption');

  if (img) img.src = imgSrc;
  if (cap) cap.textContent = caption;
  if (modal) modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const modal = document.getElementById('lightboxModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

// ==========================================================================
// TOAST NOTIFICATION
// ==========================================================================

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type === 'warning' ? 'toast-warning' : ''}`;
  toast.innerHTML = `
    <i class="fa-solid ${type === 'warning' ? 'fa-circle-exclamation text-accent' : 'fa-circle-check text-secondary'}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}
