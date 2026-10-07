/* =====================================================================
   CHATBOT "NA" – nhân viên bán hàng 24/7 của Tiệm Chè Na
   Trả lời theo kịch bản sales_script.md (bản nội bộ, không public).
   Không gọi API ngoài: khớp từ khóa → trả câu trả lời có sẵn.
   ===================================================================== */
(function () {
  const ZALO = 'https://zalo.me/0986479285';

  const BTN = {
    menu: { label: '📋 Xem menu & giá', href: '#menu' },
    order: { label: '🛒 Đặt món & thanh toán QR', href: 'https://datmon.tiemchena.life', external: true },
    zalo: { label: '💬 Đặt qua Zalo', href: ZALO, external: true },
    form: { label: '💛 Vào danh sách khách quen', href: '#khach-quen' },
    combo: { label: '🎁 Combo & ưu đãi', say: 'Có combo không?' },
    ship: { label: '🛵 Ship tới đâu?', say: 'Ship tới đâu, bao lâu?' },
    best: { label: '🍜 Món nào ngon nhất?', say: 'Món nào ngon nhất?' },
    buy: { label: '🛒 Đặt món ngay', say: 'Em muốn đặt món' }
  };

  const CLOSE_LINE = 'Đặt ngay hôm nay <b>giảm 5%</b>, trong 2km freeship nha 👇';

  // Thứ tự quan trọng: ý định cụ thể đứng trước ý định chung
  const INTENTS = [
    {
      id: 'think', keys: ['nghi them', 'de nghi', 'suy nghi', 'luc khac', 'xem da', 'chua doi', 'de sau', 'chua can', 'chua mua', 'hom khac', 'tinh sau'],
      reply: 'Dạ thoải mái ak, không vội đâu 🥰<br>Bác để lại <b>tên + số Zalo</b> vào <b>Danh sách khách quen</b> nha, mất 30 giây thôi. Có món mới hay ưu đãi riêng tiệm nhắn bác đầu tiên, không spam đâu ak.',
      buttons: ['form']
    },
    {
      id: 'expensive', keys: ['dat qua', 'dat the', 'hoi dat', 'mac qua', 're hon', 'ben kia', 'quan khac', 'cho khac'],
      reply: 'Dạ bên đó rẻ thật ak 😊 Ở tiệm <b>65k</b> là có đủ <b>nem nướng nóng giòn + chè xoài caramen</b>, sốt chấm tặng kèm, 1 lần ship là xong. Đặt 2 quán riêng tốn 2 lần ship lại chờ lâu hơn ak.',
      buttons: ['order', 'zalo']
    },
    {
      id: 'buy', keys: ['dat mon', 'dat hang', 'dat don', 'muon dat', 'minh dat', 'em dat', 'toi dat', 'cho dat', 'dat 1', 'dat 2', 'dat 3', 'suat', 'order', 'mua', 'lay 1', 'lay mot', 'chot', 'ship cho', 'giao cho'],
      reply: 'Đơn giản thôi bác ơi 🥰<br>' + CLOSE_LINE + '<br>Thèm cả mặn lẫn ngọt thì lấy luôn <b>combo nem nướng + chè xoài 65k</b> cho đủ vị ak 🔥❄️',
      buttons: ['order', 'zalo']
    },
    {
      id: 'combo', keys: ['combo', 'giam gia', 'uu dai', 'khuyen mai', 'sale', 'freeship', 'mien phi ship', 'giam'],
      reply: 'Có ak 🎁<br>• <b>Combo Nóng–Lạnh</b>: nem nướng + chè xoài caramen = <b>65k</b><br>• Đặt trước qua web/Zalo <b>giảm thêm 5%</b><br>• Trong 2km (Vũ Lăng, Ngũ Hiệp) <b>freeship</b><br>• Sốt chấm tặng kèm<br>' + CLOSE_LINE,
      buttons: ['order', 'zalo']
    },
    {
      id: 'ship', keys: ['ship', 'giao', 'bao lau', 'may phut', 'tu hiep', 'ngoc hoi', 'van dien', 'dong my', 'ngu hiep', 'vu lang', 'phi van chuyen', 'xa khong', 'o xa'],
      reply: 'Tiệm ở ngay Vũ Lăng nên ship nhanh lắm ak 🛵<br>• Vũ Lăng, Ngũ Hiệp: <b>15–20 phút, freeship</b><br>• Tứ Hiệp, Ngọc Hồi: 20–25 phút<br>• Văn Điển, Đông Mỹ: 25–35 phút<br>Khu xa thì phí ship tiệm báo khi chốt đơn trên Zalo nha.',
      buttons: ['order', 'zalo']
    },
    {
      id: 'cold', keys: ['bi nguoi', 'nguoi khong', 'nguoi mat', 'nguoi het', 'tan da', 'loang', 'con nong', 'con lanh', 'dong goi'],
      reply: 'Bác yên tâm ak 👍 Đồ nóng hộp giấy riêng, chè đậy kín, <b>đá đóng túi riêng</b> – tới nơi nem vẫn giòn, chè vẫn còn đá. Khách Đức Nam ở Tecco Diamond khen "ship tới vẫn mát lạnh" đó ak.',
      buttons: ['order']
    },
    {
      id: 'clean', keys: ['sach', 've sinh', 'attp', 'an toan', 'dau chien', 'chien lai', 'bao quan'],
      reply: 'Thật ra đây là điều tiệm kỹ nhất ak 💯<br>• Dầu chiên <b>thay mới mỗi ngày</b><br>• Rau rửa nước muối<br>• Chè nấu mới mỗi ngày, không chất bảo quản<br>• Nem hút chân không <b>có tem ATTP</b>',
      buttons: ['menu']
    },
    {
      id: 'spicy', keys: ['cay', 'cap do', 'my cay', 'mi cay'],
      reply: 'Mỳ cay có <b>7 cấp độ</b> 🌶️, 35k – bác ghi cấp độ vào ghi chú khi đặt nha. Mới ăn thì thử cấp 1–2 cho chắc ak 😆<br>Không ăn cay thì có <b>nem nướng</b>, <b>bánh mì chảo</b> hoặc chè mát lạnh.',
      buttons: ['menu', 'buy']
    },
    {
      id: 'vacuum', keys: ['hut chan khong', 'mang ve', 'tu nuong', 'nem song', 'nem tui', 'qua bieu', 'tui nem'],
      reply: 'Có ak 📦 Túi <b>nem nướng Nha Trang 10 xiên</b> và <b>nem lụi Huế 10 que</b> hút chân không, <b>95k/túi</b>, có tem ATTP, tặng nước chấm gia truyền. Mua về tự nướng tiện lắm.',
      buttons: ['order', 'zalo']
    },
    {
      id: 'best', keys: ['ngon nhat', 'nen an', 'goi y', 'tu van', 'mon nao', 'best', 'ban chay', 'dac san', 'an gi'],
      reply: 'Khách mới thử ngay bộ đôi bán chạy nhất tiệm nha 😋<br>🔥 <b>Nem nướng Nha Trang 35k</b> – nướng than hoa, sốt thịt băm gia truyền<br>❄️ <b>Chè xoài caramen 30k</b> – caramen tự làm, xoài tươi<br>Gộp lại đúng <b>combo 65k</b> luôn ak!',
      buttons: ['buy', 'menu']
    },
    {
      id: 'fit', keys: ['phu hop', 'hop voi', 'an nhom', 'an chung', 'may nguoi', '2 nguoi', '3 nguoi', '4 nguoi', '5 nguoi', 'nhieu nguoi', 'ca nha', 'gia dinh', 'tre con', 'tre em', 'em be', 'an nhe', 'an kieng', 'it ngot'],
      reply: 'Em gợi ý theo nhu cầu nha 👇<br>• <b>Ăn nhóm 2–3 người</b>: mẹt đồ chiên 45k + chè/trà sữa<br>• <b>Cặp đôi / cả nhà mê cay</b>: 🆕 chân gà xào cay size to 65k, tặng 2 ổ bánh mỳ<br>• <b>Ăn nhẹ, không cay</b>: nem nướng, tào phớ caramen 20k, chè dừa dầm 25k<br>• <b>Mê cay</b>: mỳ cay 7 cấp độ, chân gà sốt Thái<br>Chưa chắc món nào hợp thì nhắn Zalo, tiệm tư vấn trực tiếp ak.',
      buttons: ['menu', 'zalo']
    },
    {
      id: 'price', keys: ['gia', 'bao nhieu', 'menu', 'thuc don', 'bang gia', 'nhieu tien', 'nghin', 'tien'],
      reply: '📋 Giá ở tiệm nè bác:<br>🔥 <b>Ăn vặt nóng 35k</b>: nem nướng, mỳ trộn, mỳ cay 7 cấp độ, chân gà sốt Thái, bánh mì chảo · mẹt đồ chiên 45k<br>❄️ <b>Chè & đồ uống 20–30k</b>: chè xoài caramen 30k, trà sữa 25k, chè dừa dầm 25k, sữa chua mít 25k, tào phớ 20k<br>' + CLOSE_LINE,
      buttons: ['order', 'combo']
    },
    {
      id: 'xaocay', keys: ['xao cay', 'chan ga xao', 'mon moi', 'co gi moi', 'banh my tang', 'tang banh my'],
      reply: '🆕 Món mới nè bác: <b>Chân gà xào cay</b> 🌶️ – chân gà <b>mềm, thấm đẫm sốt xào</b> sả ớt, cay cay đậm vị!<br>• <b>Size nhỏ 45k</b> – tặng <b>1 ổ bánh mỳ</b> (1 người ăn)<br>• <b>Size to 65k</b> – tặng <b>2 ổ bánh mỳ</b>, vừa cho <b>2 người, cặp đôi hay cả nhà</b><br>Bánh mỳ giòn chấm sốt là vét sạch đĩa luôn ak 🤤',
      buttons: ['zalo', 'menu']
    },
    {
      id: 'changa', keys: ['chan ga', 'chan ga sot thai', 'chan ga rut xuong'],
      reply: 'Có ak 🍗 Tiệm có 2 kiểu chân gà:<br>• <b>Chân gà sốt Thái xoài cóc</b> – rút xương, chua cay, sả, quất, xoài, cóc. Suất nhỏ <b>35k</b>, suất lớn 55–65k<br>• 🆕 <b>Chân gà xào cay</b> – chân gà mềm, thấm sốt xào sả ớt: <b>45k tặng 1 ổ bánh mỳ</b> · <b>65k tặng 2 ổ bánh mỳ</b>',
      buttons: ['buy', 'menu']
    },
    {
      id: 'nem', keys: ['nem', 'nem nuong', 'nem lui'],
      reply: '<b>Nem nướng Nha Trang 35k</b> – món số 1 của tiệm 🔥 Nướng than hoa, cuốn bánh tráng, ram giòn, dưa leo, xoài xanh, rau thơm. <b>Sốt thịt băm gia truyền tặng kèm</b>, không tính thêm ak.',
      buttons: ['buy', 'combo']
    },
    {
      id: 'che', keys: ['che', 'tra sua', 'caramen', 'do uong', 'nuoc', 'tao pho', 'sua chua', 'tra chanh'],
      reply: '❄️ Chè & đồ uống nấu mới mỗi ngày:<br>• Chè xoài caramen <b>30k</b> (món vedette)<br>• Trà sữa trân châu đường đen 25k · Chè dừa dầm 25k · Sữa chua mít 25k<br>• Tào phớ caramen 20k · Trà chanh giã tay 20k<br>Đá đóng túi riêng nên ship tới chè vẫn mát ak.',
      buttons: ['buy', 'combo']
    },
    {
      id: 'hours', keys: ['gio', 'mo cua', 'dong cua', 'may gio', 'con ban', 'con mo', 'toi nay'],
      reply: 'Tiệm mở <b>9h – 22h30</b> tất cả các ngày ak ⏰ Đặt trước 20–30 phút còn được giảm 5% nha.',
      buttons: ['buy']
    },
    {
      id: 'pay', keys: ['thanh toan', 'chuyen khoan', 'cod', 'tien mat', 'qr', 'stk', 'tai khoan'],
      reply: 'Bác thanh toán kiểu nào cũng được ak 💳<br>• Chuyển khoản quét <b>QR MB Bank</b> (hiện ngay khi đặt trên web)<br>• Hoặc <b>tiền mặt khi nhận hàng</b> (COD)',
      buttons: ['order']
    },
    {
      id: 'where', keys: ['dia chi', 'o dau', 'quan o', 'cho nao', 'ban do', 'tiem o'],
      reply: '📍 Tiệm ở <b>Vũ Lăng, Ngũ Hiệp, Thanh Trì, Hà Nội</b>. Hotline/Zalo <b>0986.479.285</b> – ghé quán hay gọi ship đều được ak.',
      buttons: ['zalo']
    },
    // ---- 3 lời chê hay gặp nhất (chủ tiệm xác nhận) ----
    {
      id: 'late', keys: ['lau qua', 'cham qua', 'giao tre', 'ship tre', 'cho lau', 'doi lau', 'gio chua toi', 'van chua toi', 'chua thay ship', 'chua nhan duoc', 'tre qua', 'mai chua'],
      reply: 'Dạ tiệm <b>xin lỗi bác đã phải chờ lâu</b> ak 🙏<br>Bác nhắn Zalo <b>tên + số điện thoại đặt đơn</b> để tiệm kiểm tra liền nha. Lỗi do tiệm thì tiệm bù cho bác: <b>giao bù món</b>, <b>tặng món / giảm giá đơn sau</b> hoặc <b>hoàn tiền</b> – bác thấy cách nào ổn cứ nói tiệm ak.',
      buttons: ['zalo']
    },
    {
      id: 'coldcomplain', keys: ['nguoi roi', 'nguoi het roi', 'nguoi ngat', 'nguoi tanh', 'tan het da', 'tan da roi', 'het da roi', 'iu roi', 'mem het', 'khong con gion', 'loang roi'],
      reply: 'Dạ tiệm <b>xin lỗi bác</b>, món tới không còn ngon là lỗi của tiệm ak 🙏<br>Bác <b>chụp ảnh gửi Zalo</b> giúp tiệm nha, tiệm xử lý liền: <b>làm lại / giao bù món</b>, <b>tặng món / giảm giá đơn sau</b> hoặc <b>hoàn tiền</b> món bị lỗi.',
      buttons: ['zalo']
    },
    {
      id: 'taste', keys: ['cay qua', 'qua cay', 'ngot qua', 'qua ngot', 'nhat qua', 'qua nhat', 'man qua', 'qua man', 'it topping', 'it qua', 'khong vua', 'khong hop vi', 'khong hop khau vi', 'beo qua', 'ngay qua'],
      reply: 'Dạ tiệm xin lỗi bác ak, khẩu vị mỗi người mỗi khác 🙏<br>Bác nói tiệm biết cụ thể (cay quá, ngọt quá, ít topping…) qua Zalo để tiệm <b>bù cho bác</b> và <b>ghi chú khẩu vị riêng của bác</b> – lần sau tiệm làm đúng ý luôn nha.<br>💡 Lần sau đặt, bác ghi "ít cay / ít ngọt" vào ô ghi chú đơn hàng là được ak.',
      buttons: ['zalo']
    },
    {
      // Cách chủ tiệm làm thật: khách chê → xin lỗi + hỏi cần khắc phục gì
      id: 'complain', keys: ['do qua', 'khong ngon', 'chan qua', 'an chan', 'te qua', 'that vong', 'lau qua', 'cham qua', 'sai mon', 'nham mon', 'thieu mon', 'bi thieu', 'giao thieu', 'nguoi ngat', 'phan nan', 'khieu nai', 'khong hai long', 'boc phot', 'kem qua', 'mat ve sinh'],
      reply: 'Dạ tiệm <b>xin lỗi bác nhiều</b> ak 🙏<br>Bác cho tiệm biết <b>bác muốn tiệm khắc phục thế nào</b> nha: <b>làm lại / giao bù món</b>, <b>tặng món / giảm giá đơn sau</b> hoặc <b>hoàn tiền</b>.<br>Bác nhắn Zalo <b>0986.479.285</b> (kèm ảnh nếu có) để tiệm xử lý trực tiếp cho bác liền ak.',
      buttons: ['zalo']
    },
    {
      // Cách chủ tiệm làm thật: khách khen → luôn cảm ơn
      id: 'thanks', keys: ['cam on', 'thank', 'thanks', 'ok', 'oke', 'duoc roi', 'tuyet', 'ngon qua', 'ngon lam', 'ngon that', 'qua ngon', 'hai long', 'thich lam', 'tot qua', 'xuat sac', 'khen'],
      reply: 'Dạ tiệm <b>cảm ơn bác nhiều lắm</b> ak 🥰 Được bác khen là cả bếp vui cả ngày luôn! Lần sau thèm cứ ghé tiệm nha.',
      buttons: ['form', 'buy']
    },
    {
      // Câu khách hỏi nhiều nhất ngoài đời: "quán có những món gì?"
      id: 'menu', keys: ['mon gi', 'nhung mon', 'co gi', 'ban gi', 'co mon', 'dac trung', 'mon chinh'],
      reply: '📋 Tiệm có 2 nhóm món nè bác:<br>🔥 <b>Ăn vặt nóng</b>: nem nướng, mỳ trộn, mỳ cay 7 cấp độ, chân gà sốt Thái, bánh mì chảo, mẹt đồ chiên<br>❄️ <b>Chè & đồ uống</b>: chè xoài caramen, trà sữa, chè dừa dầm, sữa chua mít, tào phớ, trà chanh<br>⭐ <b>Món đặc trưng của quán</b>: <b>nem nướng Nha Trang 35k</b> (sốt thịt băm gia truyền) + <b>chè xoài caramen 30k</b> – gộp lại combo 65k luôn ak!',
      buttons: ['menu', 'buy']
    },
    {
      id: 'hello', keys: ['chao', 'hello', 'hi', 'alo', 'xin chao', 'shop oi', 'tiem oi', 'ad oi'],
      reply: 'Chào bác 🥰 Em là Na đây! Bác muốn xem menu, hỏi combo hay đặt món luôn ak?',
      buttons: ['menu', 'combo', 'buy']
    }
  ];

  // Ý định cụ thể được xét trước ý định chung
  const PRIORITY = ['late', 'coldcomplain', 'taste', 'complain', 'think', 'expensive', 'cold', 'fit', 'buy', 'combo', 'ship', 'clean', 'xaocay', 'spicy', 'vacuum', 'best', 'menu', 'changa', 'price', 'nem', 'che', 'hours', 'pay', 'where', 'thanks', 'hello'];
  INTENTS.sort((a, b) => PRIORITY.indexOf(a.id) - PRIORITY.indexOf(b.id));

  const FALLBACK = {
    reply: 'Câu này em chưa chắc ak 😅 Bác nhắn Zalo <b>0986.479.285</b> để tiệm trả lời chính xác nha. Hoặc bác chọn nhanh bên dưới 👇',
    buttons: ['menu', 'combo', 'ship', 'zalo']
  };

  const GREETING = {
    reply: 'Chào bác 🥰 Em là <b>Na</b> – trợ lý của Tiệm Chè Na ở Vũ Lăng, Ngũ Hiệp đây ak.<br>Thèm mặn có nem nướng nóng giòn, thèm ngọt có chè xoài mát lạnh – <b>1 đơn là đủ, ship 30 phút</b> nha.<br>Bác cần em tư vấn gì nè? 👇',
    buttons: ['menu', 'combo', 'ship', 'best', 'buy']
  };

  // Bỏ dấu tiếng Việt để khớp cả khi khách gõ không dấu
  const norm = s => ' ' + s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ') + ' ';

  function findIntent(text) {
    const t = norm(text);
    // Câu hỏi "có ... không?" trước khi mua (vd "có cay quá không") không phải lời chê
    const isQuestion = / co .* khong (a |ak |vay |nhi |shop |ha )?$/.test(t);
    const COMPLAINTS = ['late', 'coldcomplain', 'taste', 'complain'];
    // Khớp nguyên từ/cụm từ (có khoảng trắng 2 đầu) để "gia" không dính "giao"
    return INTENTS.find(it => !(isQuestion && COMPLAINTS.includes(it.id)) && it.keys.some(k => t.includes(' ' + k + ' '))) || FALLBACK;
  }

  // ---------- Giao diện ----------
  const root = document.createElement('div');
  root.className = 'na-chat';
  root.innerHTML = `
    <button class="na-chat-toggle" aria-label="Chat với Tiệm Chè Na" aria-expanded="false">
      <span class="na-chat-toggle-icon"><i class="fa-solid fa-comment-dots"></i></span>
      <span class="na-chat-toggle-text">Hỏi Na nè!</span>
    </button>
    <div class="na-chat-window" role="dialog" aria-label="Chat tư vấn Tiệm Chè Na" hidden>
      <div class="na-chat-header">
        <div class="na-chat-avatar">🍵</div>
        <div class="na-chat-title"><strong>Na – Tiệm Chè Na</strong><small><span class="na-dot"></span> Tư vấn tự động 24/7</small></div>
        <button class="na-chat-close" aria-label="Đóng chat"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="na-chat-body" aria-live="polite"></div>
      <form class="na-chat-input">
        <input type="text" placeholder="Hỏi giá, combo, ship…" aria-label="Nhập câu hỏi" autocomplete="off" maxlength="200">
        <button type="submit" aria-label="Gửi"><i class="fa-solid fa-paper-plane"></i></button>
      </form>
    </div>`;
  document.body.appendChild(root);

  const toggle = root.querySelector('.na-chat-toggle');
  const win = root.querySelector('.na-chat-window');
  const body = root.querySelector('.na-chat-body');
  const form = root.querySelector('.na-chat-input');
  const input = form.querySelector('input');
  let greeted = false;

  function addMsg(html, who) {
    const el = document.createElement('div');
    el.className = 'na-msg na-msg-' + who;
    if (who === 'user') el.textContent = html; else el.innerHTML = html;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  }

  function addButtons(keys) {
    const wrap = document.createElement('div');
    wrap.className = 'na-quick';
    keys.forEach(k => {
      const b = BTN[k];
      const el = document.createElement(b.href ? 'a' : 'button');
      el.className = 'na-quick-btn' + (b.href ? ' na-quick-link' : '');
      el.textContent = b.label;
      if (b.href) {
        el.href = b.href;
        if (b.external) { el.target = '_blank'; el.rel = 'noopener noreferrer'; }
        else el.addEventListener('click', () => setOpen(false));
      } else {
        el.type = 'button';
        el.addEventListener('click', () => ask(b.say));
      }
      wrap.appendChild(el);
    });
    body.appendChild(wrap);
    body.scrollTop = body.scrollHeight;
  }

  function botSay(answer) {
    const typing = addMsg('<span class="na-typing"><i></i><i></i><i></i></span>', 'bot');
    setTimeout(() => {
      typing.remove();
      addMsg(answer.reply, 'bot');
      if (answer.buttons) addButtons(answer.buttons);
    }, 550);
  }

  function ask(text) {
    if (!text.trim()) return;
    addMsg(text, 'user');
    botSay(findIntent(text));
  }

  function setOpen(open) {
    win.hidden = !open;
    root.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open);
    if (open) {
      if (!greeted) { greeted = true; botSay(GREETING); }
      setTimeout(() => input.focus(), 50);
    }
  }

  toggle.addEventListener('click', () => setOpen(win.hidden));
  root.querySelector('.na-chat-close').addEventListener('click', () => setOpen(false));
  form.addEventListener('submit', e => {
    e.preventDefault();
    ask(input.value);
    input.value = '';
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !win.hidden) setOpen(false); });

  // Link tiemchena.life/#chat mở sẵn khung chat (dùng trong bài đăng)
  if (location.hash === '#chat') setOpen(true);
  window.addEventListener('hashchange', () => { if (location.hash === '#chat') setOpen(true); });

  // Cho phép test từ console: NaChat.match('giá bao nhiêu')
  window.NaChat = { match: text => findIntent(text).id || 'fallback', open: () => setOpen(true) };
})();
