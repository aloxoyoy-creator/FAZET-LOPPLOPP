export type SweetMessageType =
  | 'goodMorning'
  | 'eatMorning'
  | 'eatAfternoon'
  | 'afternoonCare'
  | 'eatEvening'
  | 'goodNight'
  | 'sahur'
  | 'iftar';

const SWEET_MESSAGES: Record<SweetMessageType, string[]> = {
  goodMorning: [
    "Selamat pagi cintaku sayang! ☀️ Bangun yuk manis, hari baru menunggumu dengan sejuta senyuman. Awali harimu dengan bismillah yaa, love you so much! ❤️",
    "Good morning bidadari tercantikku! 🌸 Semoga harimu penuh berkah, belajarnya dilancarkan, dan hatimu selalu bahagia. Aku selalu ada untukmu!",
    "Pagi manisku tercinta! ✨ Udah bangun belum hayo? Jangan lupa senyum manis dulu yaa. Kamu itu alasan terindah aku selalu semangat setiap hari!",
    "Morning my precious love! ☕ Bangun perlahan, hirup udara pagi yang segar. Hari ini bakal jadi hari yang luar biasa untuk kita berdua. Semangat sayangku!",
    "Selamat pagi kesayangan hatiku! 💖 Melek yuk cinta, jangan ditarik lagi selimutnya yaa. Kangen banget sama senyum manismu pagi ini!",
    "Pagi cintaku! 🌈 Semoga hari ini semua urusanmu dipermudah, tidak ada yang bikin pusing, dan harimu penuh kebahagiaan. Aku sayang kamu!",
    "Good morning sayangku tersayang! 🌼 Awali harimu dengan doa dan senyuman terbaikmu ya. Jangan lupa sarapan, I'm always thinking of you!",
    "Selamat pagi manis! ☀️ Buka matamu pelan-pelan yaa cinta. Ingat ya, ada aku di sini yang selalu bangga, sayang, dan mendoakan kebaikanmu setiap detik."
  ],
  eatMorning: [
    "Sayang, udah sarapan belum? 🍳 Jangan sampai perut kosong yaa nanti lemas. Isi energi dulu biar belajarnya makin fokus dan semangat. Makan yang enak ya cinta!",
    "Waktunya sarapan manisku! 🥐 Sesibuk apa pun, sarapan itu wajib ya sayang. Jaga kesehatanmu baik-baik buat aku yaa, love you!",
    "Sarapan dulu yuk cintaku! 🥣 Jangan ditunda-tunda yaa. Perut kenyang, otak tenang, belajar pun jadi gampang. Selamat makan sayangku!",
    "Pagi sayang, jangan lupa sarapan yaa! 🥪 Makan yang bergizi ya manis, jangan cuma minum air putih aja. Sehat-sehat terus kesayanganku!"
  ],
  eatAfternoon: [
    "Siang sayangku tercinta! 🍱 Rehat sejenak dari tugas yaa, waktunya makan siang. Jangan ditunda makannya nanti maag-nya kambuh aku sedih lho!",
    "Waktunya makan siang cintaku! 🍲 Tinggalkan dulu buku dan layarmu, isi energi dulu ya sayang. Semangat buat aktivitas siang nanti, aku selalu dukung kamu!",
    "Sayang, makan siang dulu yuk! 🍛 Istirahatkan pikiranmu sejenak ya manis. Makan yang lahap, jangan lupa minum air putih yang cukup ya cinta!",
    "Siang manisku! 🥗 Udah jam makan siang nih. Yuk cari makanan favoritmu, istirahat santai dulu 30 menit yaa sayang. Love you!"
  ],
  afternoonCare: [
    "Sore manisku! 🧃 Udah jam segini, jangan lupa minum air putih dan istirahatkan matamu sejenak yaa. Capek ya hari ini? Nanti kita ngobrol santai ya sayang!",
    "Sore cintaku! ⛅ Gimana harinya tadi? Tarik nafas dalam-dalam yaa, kamu udah berjuang hebat banget hari ini. Bangga banget sama kamu sayang!",
    "Rehat sore yuk sayang! 🍃 Rilekskan pundakmu, regangkan badan. Sebentar lagi malam tiba, jangan terlalu diforsir yaa manisku!"
  ],
  eatEvening: [
    "Malam sayangku! 🍛 Waktunya makan malam santai yaa. Nikmati makananmu dengan tenang, kamu udah berjuang hebat seharian ini!",
    "Sayang, udah makan malam belum? 🍜 Jangan skip makan malam ya cinta, tubuhmu butuh nutrisi setelah seharian capek beraktivitas. Selamat makan sayangku!",
    "Waktunya dinner manisku! 🍲 Santap malam yang lezat yaa, hangatkan badan dan rehatkan pikiran. Aku temani dari kejauhan ya cinta!"
  ],
  goodNight: [
    "Good night cintaku yang paling cantik & manis! 🌙 Hari ini kamu luar biasa banget. Sekarang tutup matamu, istirahat yang nyenyak yaa. Mimpiin aku ya sayang, I love you to the moon and back! 💤❤️",
    "Selamat malam bidadariku tercinta! ✨ Lepaskan semua lelah dan overthinking hari ini. Tarik selimutmu yang hangat, aku peluk dari jauh ya sayang. Bismillah mimpi indah cintaku!",
    "Tidur nyenyak ya sayangku! 🌌 Jangan begadang lagi ya manis, kesehatanmu itu berharga banget buat aku. Sampai jumpa di mimpiku malam ini ya cinta!",
    "Malam kesayangan hatiku! 💤 Tutup hari ini dengan rasa syukur dan doa terbaik. Kamu adalah hal terindah dalam hidupku. Tidur yang pulas ya manis, good night love! ❤️",
    "Waktunya istirahat sayangku! 🌠 Tarik nafas lega, hari ini sudah selesai dengan sempurna. Semoga tidurmu nyenyak dan besok bangun dengan tubuh yang segar. Love you always!"
  ],
  sahur: [
    "Waktunya sahur sayangku! ☕ Bangun yuk manis, minum air putih yang banyak dan makan sahur yang bergizi yaa. Semoga puasanya lancar dan berkah hari ini, semangat cintaku! 🌙",
    "Sahur dulu yuk cintaku tersayang! 🍽️ Buka matamu perlahan, isi tenaga terbaikmu untuk puasa hari ini. Bismillah dilancarkan sampai maghrib ya sayang!",
    "Sayangku bangun sahur yaa! 🍲 Jangan sampai kelewat imsak manis. Niatkan puasa karena Allah dan jaga niat baik kita. Peluk hangat dari jauh sayang!"
  ],
  iftar: [
    "Alhamdulillah adzan Maghrib tiba sayang! 🍹 Selamat berbuka puasa ya cintaku tercinta. Awali dengan yang manis-manis seperti senyumanmu. Selamat menikmati hidangan ya sayang! 🌟",
    "Selamat berbuka puasa manisku! 🍉 Lepaskan dahaga dan laparmu dengan penuh syukur. Semoga amal puasa hari ini diterima Allah SWT. Selamat makan enak sayang!",
    "Alhamdulillah waktunya buka puasa cinta! 🍽️ Jangan langsung makan berat yaa sayang, minum air hangat dulu. Selamat berbuka kesayanganku tercinta!"
  ]
};

export function getRandomSweetMessage(type: SweetMessageType): string {
  const list = SWEET_MESSAGES[type] || SWEET_MESSAGES.goodMorning;
  const index = Math.floor(Math.random() * list.length);
  return list[index];
}

export function getDailySweetMessage(type: SweetMessageType, dateStr?: string): string {
  const list = SWEET_MESSAGES[type] || SWEET_MESSAGES.goodMorning;
  const key = dateStr || new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % list.length;
  return list[index];
}
