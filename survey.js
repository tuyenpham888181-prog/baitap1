/* =====================================================================
   FORM DANH SÁCH KHÁCH QUEN – gửi data 2 nơi:
   1. Google Form → Google Sheets (như cũ)
   2. CRM của app đặt món (datmon.tiemchena.life/api/waitlist) → hiện trong /admin
      và tự gửi chuỗi 3 email chăm sóc qua Resend (email có "+test" → nhận cả 3 ngay)
   ===================================================================== */

const CRM_WAITLIST_API = 'https://datmon.tiemchena.life/api/waitlist';

// Giống kiểm tra phía server (app-nextjs/src/lib/orderValidation.ts)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
const VN_PHONE_RE = /^(03[2-9]|05[25689]|07[06-9]|08[1-9]|09[0-9])\d{7}$/;

const GOOGLE_FORM = {
  // Link dạng: https://docs.google.com/forms/d/e/XXXXXXXX/formResponse
  action: 'https://docs.google.com/forms/d/e/1FAIpQLSeXsEmFnILnVwR54qymdTmn5GOVLa7cSumBJm0kkCf4njx48w/formResponse',
  // Mã entry của từng câu hỏi trong Google Form (dạng 'entry.123456789')
  entries: {
    name: 'entry.524050234',
    phone: 'entry.257587026',
    area: 'entry.718783198',
    dishes: 'entry.951242940',
    time: 'entry.231495133',
    worry: 'entry.446679689',
    wish: 'entry.1334722451'
  }
};

// Đáp án phải GIỐNG HỆT đáp án trong Google Form thì Google mới nhận
const SURVEY_OPTIONS = {
  area: ['Vũ Lăng / Ngũ Hiệp', 'Tứ Hiệp / Ngọc Hồi', 'Văn Điển / Đông Mỹ', 'Khu khác'],
  dishes: ['Nem nướng / Nem lụi', 'Mỳ trộn / Mỳ cay', 'Chân gà sốt Thái', 'Chè xoài caramen', 'Trà sữa / Chè dừa / Tào phớ', 'Đồ chiên / Bánh mì chảo'],
  time: ['Buổi trưa (11h - 13h)', 'Buổi chiều (15h - 17h)', 'Buổi tối (19h - 22h)', 'Cuối tuần, lúc nào cũng thèm'],
  worry: ['Ship lâu, đồ ăn nguội / chè tan đá', 'Sợ đồ ăn không sạch', 'Giá hơi cao', 'Chưa biết quán nào ngon gần nhà']
};

(function initSurvey() {
  const form = document.getElementById('waitlistForm');
  if (!form) return;

  const renderChoices = (containerId, name, type) => {
    const box = document.getElementById(containerId);
    box.innerHTML = SURVEY_OPTIONS[name].map(opt => `
      <label class="wl-chip">
        <input type="${type}" name="${name}" value="${opt}">
        <span>${opt}</span>
      </label>`).join('');
  };
  renderChoices('wlArea', 'area', 'radio');
  renderChoices('wlDishes', 'dishes', 'checkbox');
  renderChoices('wlTime', 'time', 'radio');
  renderChoices('wlWorry', 'worry', 'radio');

  const errorBox = document.getElementById('wlError');
  const successBox = document.getElementById('wlSuccess');
  const submitBtn = document.getElementById('wlSubmitBtn');

  const showError = msg => {
    errorBox.textContent = msg;
    errorBox.classList.remove('hidden');
  };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    errorBox.classList.add('hidden');

    const name = form.elements.name.value.trim();
    const phone = form.elements.phone.value.trim();
    const cleanPhone = phone.replace(/[\s.-]/g, '');
    const email = form.elements.email.value.trim().toLowerCase();
    if (name.length < 2) return showError('Bạn điền giúp tiệm cái tên nha.');
    if (!VN_PHONE_RE.test(cleanPhone)) return showError('Số điện thoại/Zalo chưa đúng (10 số, ví dụ 0912 345 678), bạn kiểm tra lại giúp tiệm nha.');
    if (!email) return showError('Bạn điền email để nhận thư khách quen nha.');
    if (email.length > 100 || !EMAIL_RE.test(email)) return showError('Email chưa đúng (ví dụ: tenban@gmail.com), bạn kiểm tra lại giúp tiệm nha.');

    if (!GOOGLE_FORM.action) {
      return showError('Form chưa được nối với Google Sheets. Bạn nhắn Zalo 0986.479.285 giúp tiệm nha!');
    }

    const data = new URLSearchParams();
    const add = (key, value) => { if (GOOGLE_FORM.entries[key] && value) data.append(GOOGLE_FORM.entries[key], value); };
    add('name', name);
    add('phone', phone);
    form.querySelectorAll('input[name="area"]:checked, input[name="time"]:checked, input[name="worry"]:checked')
      .forEach(el => add(el.name, el.value));
    form.querySelectorAll('input[name="dishes"]:checked').forEach(el => add('dishes', el.value));
    add('wish', form.elements.wish.value.trim());

    // Ghi chú cho CRM: khu, món hay thèm, giờ thèm, điều ngại, món muốn thêm
    const picked = sel => Array.from(form.querySelectorAll(sel)).map(el => el.value).join(', ');
    const note = [
      ['Khu', picked('input[name="area"]:checked')],
      ['Thèm', picked('input[name="dishes"]:checked')],
      ['Lúc', picked('input[name="time"]:checked')],
      ['Ngại', picked('input[name="worry"]:checked')],
      ['Muốn thêm', form.elements.wish.value.trim()]
    ].filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(' | ').slice(0, 500);

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang gửi...';
    try {
      // Google Form không trả CORS → dùng no-cors, request vẫn tới và data vẫn vào Sheets
      const sheetReq = fetch(GOOGLE_FORM.action, { method: 'POST', mode: 'no-cors', body: data });
      const crmRes = await fetch(CRM_WAITLIST_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone: cleanPhone, email, note })
      }).then(r => r.json());
      await sheetReq.catch(() => {});
      if (!crmRes.success) return showError(crmRes.error || 'Chưa gửi được, bạn bấm gửi lại giúp tiệm nha.');

      // Lưu 1 bản vào brain.db trên VPS → agent Na (goClaw) tự nhắn chủ tiệm khi có khách mới
      fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone: cleanPhone, email, note }),
        keepalive: true
      }).catch(() => {});

      const emails = (crmRes.data && crmRes.data.emails) || {};
      if (emails.testMode) {
        document.getElementById('wlSuccessMail').textContent =
          `Chế độ test (+test): đã gửi ${emails.sent || 0}/3 email ngay vào ${email}.`;
      }
      form.classList.add('hidden');
      document.getElementById('wlSuccessName').textContent = name;
      successBox.classList.remove('hidden');
    } catch (err) {
      showError('Mạng đang chập chờn, bạn bấm gửi lại giúp tiệm nha.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Vào Danh Sách Khách Quen';
    }
  });
})();
