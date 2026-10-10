export const LIFESTYLE_MESSAGES = {
  goodMorning: [
    "Selamat pagi, Sayang! ☀️ Jangan lupa senyum hari ini, dunia butuh energi positifmu.",
    "Pagi! Awali harimu dengan Bismillah dan rasa syukur. Semangat ya belajarnya! ❤️",
    "Good morning, cantik/gantengku! 🌹 Semoga hari ini berjalan lancar dan penuh berkah.",
    "Pagi ini cerah, secerah harapan kita ke depan. Jangan lupa sarapan ya! 🥞",
    "Selamat pagi! Buka mata, tarik napas panjang, dan yuk taklukkan hari ini bersama-sama. ✨",
    "Pagi sayangku! Ingat, setiap langkah kecilmu hari ini sangat berharga. Semangat terus! 🥰"
  ],
  goodNight: [
    "Selamat tidur, Sayang. 🌙 Maafkan semua lelah hari ini, besok kita mulai lagi dengan semangat baru.",
    "Good night! Jangan begadang ya, istirahat yang cukup biar besok badannya segar lagi. ❤️",
    "Malam telah tiba, waktunya mengistirahatkan pikiran. Mimpi indah ya, see you tomorrow! 🌌",
    "Selamat istirahat. Terima kasih sudah berjuang keras hari ini. Aku bangga padamu! 🥰",
    "Tidur yang nyenyak ya. Semoga besok harimu jauh lebih baik dari hari ini. Good night! ✨"
  ],
  eatMorning: [
    "Waktunya sarapan! 🍳 Jangan biarkan perut kosong, kamu butuh energi buat jalani hari yang padat.",
    "Jangan lupa sarapan sayang, nanti sakit loh. Sedikit aja gapapa, yang penting diisi. 🥪",
    "Hei, sudah sarapan belum? Jangan ditunda-tunda ya, kesehatanmu nomor satu! 🥛"
  ],
  eatAfternoon: [
    "Waktunya makan siang! 🍱 Istirahat sebentar yuk, jangan dipaksa terus belajarnya.",
    "Selamat makan siang, Sayang! Nikmati makanannya, rehat sejenak biar nanti semangat lagi. 🍲",
    "Jam segini perut pasti udah keroncongan. Jangan telat makan siang ya! 🍝"
  ],
  eatEvening: [
    "Udah makan malam? 🍛 Jangan malam-malam makannya biar pencernaan terjaga. Selamat makan!",
    "Makan malam yuk! Jangan sampai kelaparan di tengah malam. Jaga kesehatan terus ya. 🍜",
    "Waktunya dinner! Tutup hari ini dengan perut kenyang dan hati yang senang. 🥗"
  ],
  sahur: [
    "Waktunya sahur, Sayang! 🌙 Bangun yuk, isi energi dulu biar puasanya lancar seharian.",
    "Sahur sahur! Jangan sampai kelewatan ya, biar kuat jalanin harinya. Semangat puasanya! ✨",
    "Bangun sayang, waktunya sahur. Semoga puasanya hari ini penuh berkah dan lancar. 🍚"
  ],
  iftar: [
    "Alhamdulillah, waktunya berbuka! 🌅 Selamat berbuka puasa ya sayang. Awali dengan yang manis, semanis senyummu.",
    "Yeay, udah maghrib! Selamat berbuka puasa. Jangan lupa doa dan minum air putih dulu ya. 🍹",
    "Waktu buka puasa tiba! Selamat menikmati hidangannya. Semoga puasamu hari ini diterima Allah. 🍲"
  ]
};

export function getRandomMessage(category: keyof typeof LIFESTYLE_MESSAGES): string {
  const messages = LIFESTYLE_MESSAGES[category];
  return messages[Math.floor(Math.random() * messages.length)];
}
