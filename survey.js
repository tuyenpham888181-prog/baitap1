/* =====================================================================
   FORM DANH SÁCH KHÁCH QUEN - gửi data thẳng về Google Form → Google Sheets
   Không cần backend. Chỉ cần điền GOOGLE_FORM bên dưới (lấy từ Google Form).
   ===================================================================== */

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
    const digits = phone.replace(/\D/g, '');
    if (!name) return showError('Bạn điền giúp tiệm cái tên nha.');
    if (digits.length < 9 || digits.length > 11) return showError('Số điện thoại/Zalo chưa đúng, bạn kiểm tra lại giúp tiệm nha.');

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

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang gửi...';
    try {
      // Google Form không trả CORS → dùng no-cors, request vẫn tới và data vẫn vào Sheets
      await fetch(GOOGLE_FORM.action, { method: 'POST', mode: 'no-cors', body: data });
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
