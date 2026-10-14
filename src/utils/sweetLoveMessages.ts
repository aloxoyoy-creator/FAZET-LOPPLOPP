export type SweetMessageType =
  | 'goodMorning'
  | 'eatMorning'
  | 'goodAfternoon'
  | 'eatAfternoon'
  | 'afternoonCare'
  | 'eatEvening'
  | 'goodNight'
  | 'sahur'
  | 'iftar';

export interface SweetGreeting {
  title: string;
  message: string;
}

const SWEET_GREETINGS: Record<SweetMessageType, SweetGreeting[]> = {
  goodMorning: [
    {
      title: "🌅 Semangat Pagi Kesayanganku! ✨",
      message: "Bangun yuk sayang! Hirup udara pagi yang segar. Hari baru menunggumu dengan sejuta senyuman. Awali harimu dengan bismillah yaa, love you so much! ❤️"
    },
    {
      title: "☕ Good Morning Bidadari Cantikku! 🌸",
      message: "Pagi manisku! Jangan buru-buru loncat dari kasur, regangkan badan dulu yaa. Aku selalu bangga punya kamu yang hebat dan pantang menyerah. Semangat!"
    },
    {
      title: "☀️ Cilukba! Pagi Sayangku! 🐣",
      message: "Ayo buka mata indahnya, jangan kelamaan meluk gulingnya yaa! Hari yang cerah udah nungguin senyum termanismu nih. Let's conquer today together!"
    },
    {
      title: "💖 Selamat Pagi Kesayangan Hatiku! 🌈",
      message: "Awali pagimu dengan senyuman dan hati yang lapang ya cinta. Apapun pelajaran atau agenda hari ini, kamu pasti bisa melewatinya dengan cemerlang!"
    },
    {
      title: "🌼 Pagi Ceria Bidadariku Tersayang! 🌻",
      message: "Senyum dulu dong sebelum beraktivitas! Kamu tahu kan, senyumanmu itu alasan utamaku selalu bahagia dan berenergi setiap hari? Have a wonderful day!"
    },
    {
      title: "🌤️ Udah Pagi Nih Manisku! 🧸",
      message: "Tarik nafas dalam-dalam, hembuskan sisa kantukmu! Hari baru ini siap menyambut pencapaian hebatmu selanjutnya. Aku selalu dukung kamu 100%!"
    },
    {
      title: "🌷 Pagi Penuh Berkah Sayang! ✨",
      message: "Semoga langkah kakimu hari ini selalu dipermudah, hatimu ditenangkan, dan ilmumu bertambah berkah ya cintaku. Doaku selalu menyertaimu!"
    },
    {
      title: "🕊️ Pagi yang Damai untuk Cintaku! 🍃",
      message: "Lihat indahnya fajar pagi ini, dunia bersyukur ada orang sebaik dan semanis kamu. Semangat sekolah dan belajarnya ya bidadariku!"
    },
    {
      title: "🍯 Good Morning Sweetheart! 🍯",
      message: "Semoga harimu semanis teh hangat dan sehangat pelukanku. Jangan lupa berdoa sebelum melangkah keluar rumah ya kesayanganku tercinta!"
    },
    {
      title: "🌟 Bintang Pagiku Udah Bangun Belum? ⭐",
      message: "Dunia butuh sinar ceriamu hari ini! Buka jendela, rasakan udara sejuk, dan siapkan senyuman termanismu. You are my greatest inspiration!"
    },
    {
      title: "🎨 Pagi Penuh Warna untuk Kamu! 🌺",
      message: "Lukis hari ini dengan semangat dan rasa syukur ya sayang. Apapun tantangannya, kamu punya potensi luar biasa di dalam dirimu. I'm rooting for you!"
    },
    {
      title: "🎈 Bangun Yuk Manis, Hari Indah Menanti! ☀️",
      message: "Yuk cuci muka dan gosok gigi biar makin segar! Semoga hari ini kamu bertemu banyak hal menyenangkan dan teman-teman yang baik yaa!"
    },
    {
      title: "💌 Surat Cinta Pagi Hari Buat Kamu! 💌",
      message: "Cuma mau ingetin kalau kamu itu sangat berharga, cantik, dan luar biasa. Jalani hari ini dengan percaya diri ya cinta, love you to the moon and back!"
    },
    {
      title: "🥞 Pagi Sayang, Jangan Lupa Senyum! 🍓",
      message: "Melek pelan-pelan yaa cinta. Jangan cemberut di pagi hari, nanti manisnya luntur lho! Senyum dikit dong, biar hariku juga ikut cerah!"
    },
    {
      title: "🌱 Semangat Membuka Lembaran Baru! 🌿",
      message: "Tinggalkan lelah kemarin di belakang. Pagi ini adalah awal baru yang bersih. Semoga harimu menyenangkan dan belajarmu mengasyikkan ya sayang!"
    },
    {
      title: "🎀 Pagi Manisku, Peluk Hangat dari Sini! 🤗",
      message: "Meski belum bisa ketemu langsung, doaku dan rasa sayangku selalu memelukmu dari kejauhan. Bangun dengan riang ya cintaku!"
    },
    {
      title: "🦋 Selamat Pagi Sayangku yang Rajin! 🌸",
      message: "Melihatmu bersemangat mengejar cita-cita selalu bikin aku kagum. Semoga tiap detik belajarmu hari ini membuahkan hasil terbaik yaa!"
    },
    {
      title: "🎵 Dendang Lagu Pagi Buat Cinta! 🎶",
      message: "Putar lagu favoritmu sambil bersiap ya sayang! Biar pagimu makin ceria dan berenergi. Semangat menjalani hari kesayanganku!"
    },
    {
      title: "👑 Pagi Sang Juara Hatiku! 🏆",
      message: "Siap jadi versi terbaik dirimu hari ini? Tentu siap dong! Jangan lupa bismillah ya manisku, kamu pasti bisa taklukkan hari ini!"
    },
    {
      title: "🧸 Buka Mata Sayang, Jangan Ditarik Selimutnya! 🛌",
      message: "Hayo ketahuan masih mau merem ya? Bangun yuk cinta, waktu bergerak terus nih. Nanti sore kita cerita-cerita lagi ya manis!"
    },
    {
      title: "💎 Selamat Pagi Permata Hatiku! ✨",
      message: "Kamu itu selalu bersinar terang di mataku. Semoga hari ini penuh dengan kemudahan dan kejutan manis untukmu ya sayangku!"
    },
    {
      title: "🍵 Teh Hangat & Sapaan Pagi! 🥐",
      message: "Nikmati pagimu dengan tenang, jangan terburu-buru. Siapkan barang bawaanmu dengan teliti ya manis, jangan ada yang tertinggal!"
    },
    {
      title: "🌞 Sinar Mentari Kalah Terang Sama Senyummu! 💛",
      message: "Beneran deh, senyumanmu itu bikin duniaku cerah seketika! Tetap tebarkan energi positifmu ke semua orang hari ini ya cintaku!"
    },
    {
      title: "🚀 Siap Mengarungi Hari yang Hebat? 🌌",
      message: "Pasang sabuk pengaman semangatmu! Hari ini bakal jadi petualangan belajar yang seru. Aku selalu ada di belakangmu untuk mendukungmu!"
    },
    {
      title: "🎁 Hari Ini Adalah Hadiah Indah untuk Kita! 🎀",
      message: "Syukuri nafas dan kesehatan pagi ini. Buka hari dengan bismillah dan optimisme tinggi ya kesayanganku tercinta!"
    },
    {
      title: "🪄 Keajaiban Pagi Buat Kamu! 🪄",
      message: "Tatap cermin dan katakan pada dirimu sendiri: 'Aku kuat, aku pintar, dan aku dicintai'. Karena semua itu memang benar adanya sayang!"
    },
    {
      title: "💐 Pagi Bidadari Tercantik di Dunia! 🌷",
      message: "Bunga-bunga aja iri sama kecantikan dan kebaikan hatimu. Semoga harimu penuh tawa dan kebahagiaan ya cinta!"
    },
    {
      title: "🕊️ Pagi yang Teduh & Sejuk! 🍃",
      message: "Hembusan angin pagi ini membawa salam rindu dan doaku untukmu. Jaga dirimu baik-baik seharian ini ya manisku!"
    },
    {
      title: "🍀 Semoga Penuh Keberuntungan Hari Ini! 🍀",
      message: "Semoga soal-soal atau tugas hari ini terasa gampang dipahami, gurunya ramah, dan harimu lancar tanpa hambatan ya sayang!"
    },
    {
      title: "🌟 Good Morning, My Favorite Person! 🌟",
      message: "Dari milyaran orang di dunia, kamu tetap yang nomor satu di hatiku. Semangat belajar ya cinta, buat dirimu dan aku bangga!"
    },
    {
      title: "❤️ Pagi Sayangku yang Tak Tergantikan! ❤️",
      message: "Setiap hari yang kulalui bersamamu selalu terasa istimewa. Awali hari dengan niat baik dan bismillah ya kesayanganku!"
    }
  ],

  eatMorning: [
    {
      title: "🍳 Sarapan Dulu Yuk Cintaku! ☕",
      message: "Sayang, udah sarapan belum? Jangan biarkan perut kosong yaa nanti lemas. Isi energi dulu biar belajarnya makin fokus dan semangat. Makan yang enak ya cinta! ❤️"
    },
    {
      title: "🥐 Waktunya Isi Bahan Bakar, Manisku! 🥛",
      message: "Kendaraan aja butuh bensin, apalagi bidadari tercantikku yang mau belajar seharian! Sarapan yang bergizi ya sayang, jangan cuma minum air putih aja!"
    },
    {
      title: "🥪 Jangan Skip Sarapan Ya Sayang! 🍓",
      message: "Sesibuk apa pun pagimu, luangkan waktu 10 menit untuk sarapan ya cinta. Perut kenyang, pikiran tenang, belajar pun jadi lancar jaya!"
    },
    {
      title: "🥣 Pagi-Pagi Enaknya Sarapan Nih! 🥞",
      message: "Udah sarapan belum hayoo? Awas ya kalau ditunda-tunda nanti maag-nya kambuh, aku yang sedih lho. Selamat makan kesayanganku!"
    },
    {
      title: "🍳 Energi Pagi Buat Bidadariku! 🥑",
      message: "Makan yang lahap ya manis! Semoga tiap suapan makananmu membawa berkah dan tenaga untuk melewati hari yang produktif. I love you!"
    },
    {
      title: "🧇 Menu Sarapan Terbaik Buat Cinta! 🍯",
      message: "Yuk santap sarapan favoritmu pagi ini! Makan perlahan, nikmati setiap gigitannya, dan jangan lupa ucap bismillah ya sayang!"
    },
    {
      title: "🥛 Jangan Lupa Minum Susu / Air Hangat! 🥛",
      message: "Selain sarapan makanan padat, jangan lupa minum air hangat atau susu ya sayang biar tenggorokanmu nyaman dan pencernaanmu lancar!"
    },
    {
      title: "🥪 Sarapan Biar Nggak Gampang Ngantuk! 🥱",
      message: "Tahu nggak, kalau nggak sarapan otak kekurangan glukosa dan jadi gampang ngantuk di kelas. Makanya sarapan dulu ya cintaku tercinta!"
    },
    {
      title: "🍛 Nasi Goreng / Roti Panggang Pagi Ini? 🍳",
      message: "Apapun menu sarapanmu pagi ini, nikmati dengan rasa syukur ya sayang. Makan yang cukup biar kuat menghadapi pelajaran yang padat!"
    },
    {
      title: "🍙 Bekal Sarapan Udah Siap Belum? 🍱",
      message: "Kalau makannya terburu-buru, bawa bekal atau roti ya cinta. Yang penting perutmu jangan sampai kosong melompong. Jaga lambungmu buat aku yaa!"
    },
    {
      title: "🧃 Nutrisi Penting Buat Otak Cantikmu! 🧠",
      message: "Otak cerdasmu butuh nutrisi terbaik pagi ini. Makan yang bergizi ya sayang, jangan makan yang terlalu pedas atau asem di pagi hari!"
    },
    {
      title: "🥖 Sarapan Santai Sebelum Berangkat! 🚶‍♀️",
      message: "Duduk manis dan nikmati sarapanmu. Jangan makan sambil lari-lari ya cinta, nanti tersedak. Selamat sarapan kesayanganku!"
    },
    {
      title: "🍳 Telur Mata Sapi Buat Mata Indahmu! 🍳",
      message: "Tatap sarapanmu dengan senyum lebar! Makan yang banyak ya manis, biar kamu punya stamina juara seharian ini!"
    },
    {
      title: "🥐 Pagi Manis Ditemani Sarapan Lezat! 🥐",
      message: "Selamat sarapan bidadari hatiku. Semoga makanan ini memberi kekuatan ekstra buat semua impian yang sedang kamu perjuangkan!"
    },
    {
      title: "🍉 Jangan Lupa Buah / Serat Pagi Ini! 🍎",
      message: "Kalau ada buah di meja makan, makan sedikit ya sayang. Biar pencernaan lancar dan kulitmu makin glowing berseri!"
    },
    {
      title: "☕ Kopi / Teh Hangat Penambah Mood! ☕",
      message: "Hirup aroma minuman hangatmu perlahan. Rasakan kehangatannya seperti pelukan sayangku untukmu pagi ini. Selamat makan sayang!"
    },
    {
      title: "🥪 Waktunya Sarapan, Kesayangan Hatiku! 💖",
      message: "Aku nggak mau dengar kamu lemes atau pusing di kelas karena telat makan yaa. Janji sama aku harus sarapan dulu sekarang!"
    },
    {
      title: "🥣 Bubur / Sereal Hangat Buat Cinta! 🥣",
      message: "Hangatkan perutmu dengan makanan lezat pagi ini. Semoga harimu semenyenangkan aroma makanan favoritmu ya sayang!"
    },
    {
      title: "🧀 Keju & Roti Siap Menemani Pagimu! 🍞",
      message: "Sarapan itu investasi energi terbaik untuk sepanjang hari. Nikmati sarapanmu dengan penuh kebahagiaan ya cintaku!"
    },
    {
      title: "🥗 Sayuran Segar & Sarapan Sehat! 🥗",
      message: "Tubuh sehat bikin belajarmu makin maksimal. Jaga pola makanmu ya manis, aku selalu ingin melihatmu bugar dan ceria!"
    },
    {
      title: "🍠 Ubi / Kentang Rebus Hangat! 🥔",
      message: "Makanan sederhana pun terasa nikmat jika disantap dengan syukur. Selamat sarapan kesayanganku, semoga harimu berkah!"
    },
    {
      title: "🍳 Siap-Siap Sarapan Sebelum Bel Masuk! ⏰",
      message: "Jangan sampai ketinggalan sarapan karena buru-buru yaa. Sisihkan waktu sejenak, perut kenyang belajar pun riang!"
    },
    {
      title: "🥯 Bagel & Senyuman Manis! 🥯",
      message: "Kunyah makananmu dengan tenang ya sayang. Awali dengan bismillah dan akhiri dengan alhamdulillah. Love you!"
    },
    {
      title: "🥑 Alpukat & Roti Buat Gadis Pintar! 🥑",
      message: "Pagi cerdas diawali dengan sarapan bergizi! Selamat sarapan cintaku, semoga pikiranmu jernih seharian ini!"
    },
    {
      title: "🥞 Pancake Manis Semanis Senyumanmu! 🍯",
      message: "Semoga sarapan pagimu terasa sangat lezat dan membangkitkan mood bahagiamu ya kesayanganku tercinta!"
    },
    {
      title: "🥟 Dimsum / Pangsit Hangat Pagi! 🥟",
      message: "Nikmati sarapanmu ya manis. Jangan lupa habiskan minumnya juga. Tubuhmu butuh cairan yang cukup sejak pagi hari!"
    },
    {
      title: "🍓 Strawberry Jam & Toast Time! 🍓",
      message: "Semoga pagimu secerah selai stroberi dan semanis rasa sayangku kepadamu. Makan yang kenyang ya cinta!"
    },
    {
      title: "🍛 Sarapan Nasi Biar Kenyang Mantap! 🍚",
      message: "Orang Indonesia belum makan kalau belum makan nasi, kan? Yuk makan sepiring nasi hangat biar tenagamu full 100%!"
    },
    {
      title: "🥨 Pretzel / Kudapan Pagi Buat Teman Belajar! 🥨",
      message: "Pastikan ada makanan yang masuk ke perut ya manis. Jangan sampai perutmu bernyanyi di tengah keheningan kelas!"
    },
    {
      title: "🥐 Sarapan Bersama Doa Restuku! 🥐",
      message: "Di setiap gigitan sarapanmu, terselip doaku agar kamu selalu sehat, ceria, dan dilindungi Allah SWT. Selamat makan sayang!"
    },
    {
      title: "🍳 Tuntaskan Sarapanmu Sekarang Ya Sayang! 🍳",
      message: "Ayo habiskan sarapannya, jangan disisain ya cinta! Terima kasih sudah merawat dirimu dengan baik buat kita berdua. Love you!"
    }
  ],

  goodAfternoon: [
    {
      title: "☀️ Semangat Siang Bidadariku! 🔥",
      message: "Matahari lagi terik-teriknya nih sayang! Jangan biarkan semangatmu ikutan layu yaa. Tarik nafas, kamu sudah hebat banget melewati setengah hari ini! ❤️"
    },
    {
      title: "✨ Rehat Sejenak di Tengah Hari! 🍃",
      message: "Siang manisku! Istirahatkan pandangan matamu dari buku dan layar sejenak yaa. Cuci muka atau minum air dingin biar pikiranmu segar kembali!"
    },
    {
      title: "🌈 Siang Ceria Kesayangan Hatiku! 🌤️",
      message: "Gimana harinya sampai siang ini? Masih aman kan? Kalau mulai ada yang bikin mumet, ingat ada aku yang selalu mendukungmu dari sini!"
    },
    {
      title: "🌴 Siang Adem Buat Hatimu yang Manis! 🌊",
      message: "Cuaca di luar boleh panas membara, tapi hati dan pikiranmu harus tetap sejuk dan damai ya cinta. Rileks sejenak yuk!"
    },
    {
      title: "⚡ Baterai Semangat Mulai Drop? 🔋",
      message: "Sini aku transfer energi cinta dan semangat buat kamu! Jangan lemes ya manis, tinggal sedikit lagi jam sekolah/kuliahnya selesai kok!"
    },
    {
      title: "🥤 Jangan Lupa Minum Air Dingin / Segar! 🧊",
      message: "Dehidrasi di siang hari bisa bikin sakit kepala lho. Segera ambil botol minummu dan habiskan ya kesayanganku tercinta!"
    },
    {
      title: "⛅ Siang yang Penuh Apresiasi! 👏",
      message: "Kamu sudah bekerja keras dari tadi pagi. Aku bangga sekali melihat dedikasimu. Tetap percaya diri ya bidadari pintarku!"
    },
    {
      title: "🎈 Tetap Ceria di Tengah Padatnya Hari! 🎈",
      message: "Tarik nafas panjang, hembuskan rasa penat. Yuk pasang senyuman manismu lagi, hari ini pasti berakhir dengan kepuasan!"
    },
    {
      title: "🍧 Manisnya Siang Hari Bersamamu! 🍨",
      message: "Mikirin kamu di siang bolong gini bikin hariku terasa jauh lebih adem. Kamu juga jangan lupa bahagia ya sayangku!"
    },
    {
      title: "🌸 Istirahat Siang yang Menyejukkan! 🌸",
      message: "Duduk santai di tempat teduh, sandarkan punggungmu sejenak. Kamu berhak mendapatkan jeda istirahat yang berkualitas cinta!"
    },
    {
      title: "🎵 Putar Lagu Penyemangat Siang! 🎧",
      message: "Pasang earphone dan dengarkan lagu yang bikin mood kamu naik lagi ya manis. Biar sesi siang nanti tetap asyik dijalani!"
    },
    {
      title: "🌤️ Siang Hangat untuk Cintaku! 🌤️",
      message: "Semoga setiap penjelasan guru/dosen siang ini gampang masuk ke memori otakmu ya sayang. Semangat terus belajarnya!"
    },
    {
      title: "🧸 Peluk Semangat Siang Hari! 🤗",
      message: "Kalau lagi ngerasa jenuh, bayangkan aku lagi kasih jempol dan senyuman bangga di depanmu. You're doing amazing, honey!"
    },
    {
      title: "💡 Jernihkan Pikiranmu Sejenak! 💡",
      message: "Jangan biarkan kepalamu pusing dengan banyak tugas sekaligus. Kerjakan satu per satu dengan tenang ya manisku!"
    },
    {
      title: "🕊️ Siang yang Tenang & Damai! 🌿",
      message: "Semoga harimu tetap berada dalam lindungan dan keberkahan Allah. Jaga sopan santun dan tutur katamu ya bidadariku!"
    },
    {
      title: "🍉 Siang Segar Buat Kesayanganku! 🍉",
      message: "Semangka potong dingin kayaknya enak banget ya siang gini? Jangan lupa segarkan dirimu dengan minuman favoritmu ya cinta!"
    },
    {
      title: "🎯 Tetap Fokus Pada Tujuanmu! 🎯",
      message: "Cita-citamu tinggi dan mulia, dan setiap usaha siang ini membawamu satu langkah lebih dekat ke sana. Terus melangkah sayang!"
    },
    {
      title: "🦋 Senyum Siangmu Itu Candu! 🦋",
      message: "Jangan cemberut gitu dong manis, nanti cantiknya berkurang lho! Senyum dikit yaa, biar duniaku ikut berputar indah!"
    },
    {
      title: "🌻 Mekar Indah di Tengah Hari! 🌻",
      message: "Seperti bunga matahari yang selalu menghadap cahaya, jadikan siang ini penuh dengan aura positif dan semangat belajar!"
    },
    {
      title: "🧘‍♀️ Rilekskan Otot Bahu & Lehermu! 🧘‍♀️",
      message: "Nunduk kelamaan di meja bikin pegal ya? Regangkan tangan ke atas dan putar leher perlahan ya cinta. Jaga postur tubuhmu!"
    },
    {
      title: "💌 Sapaan Cinta di Jam Kritis Siang! 💌",
      message: "Jam-jam segini biasanya paling rawan ngantuk kan? Cuci muka air dingin yuk manis, biar matanya seger kembali!"
    },
    {
      title: "🍰 Hadiah Manis Menunggumu Nanti Sore! 🍰",
      message: "Selesaikan aktivitas siangmu dengan baik ya sayang, nanti sore saat istirahat kita bisa santai tanpa beban!"
    },
    {
      title: "🌊 Hembusan Angin Segar untuk Kamu! 🌊",
      message: "Semoga rasa letihmu diterbangkan angin siang ini. Kamu luar biasa, kuat, dan selalu bikin aku terpana!"
    },
    {
      title: "💎 Siang Berharga untuk Masa Depan Kita! ✨",
      message: "Setiap lembar ilmu yang kamu pelajari siang ini adalah bekal indah untuk masa depan kita nanti. Semangat belajarnya cinta!"
    },
    {
      title: "☕ Es Kopi Susu / Es Teh Buat Penyegar? 🧋",
      message: "Kalau butuh yang seger-seger, beli minuman kesukaanmu ya sayang. Manjakan dirimu sedikit biar harimu makin manis!"
    },
    {
      title: "🌟 Kamu Adalah Inspirasiku Siang Ini! ⭐",
      message: "Melihat kerja kerasmu bikin aku juga nggak mau kalah buat selalu produktif. Mari berjuang bersama ya kesayanganku!"
    },
    {
      title: "🏹 Taklukkan Sesi Pelajaran Siang Ini! 🏹",
      message: "Fokus mendengarkan penjelasan materi ya cinta. Kamu pintar dan cepat paham, aku yakin kamu bisa menguasainya!"
    },
    {
      title: "🍃 Udara Sejuk Buat Bidadariku! 🍃",
      message: "Cari tempat berteduh yang adem kalau sedang di luar ruangan ya sayang. Jangan kepanasan kelamaan di bawah terik matahari!"
    },
    {
      title: "🧡 Siang Penuh Cinta & Dukungan! 🧡",
      message: "Walau kita sedang sibuk masing-masing, hatiku nggak pernah berhenti mendoakan yang terbaik buatmu. Semangat sayang!"
    },
    {
      title: "🌞 Separuh Hari Sudah Terlewati dengan Keren! 🌞",
      message: "Tinggal beberapa jam lagi menuju sore santai. Pertahankan performa hebatmu sampai akhir ya manisku!"
    },
    {
      title: "❤️ Aku Selalu Menemanimu dalam Doa! ❤️",
      message: "Selamat menjalani sisa siang ini ya cintaku tersayang. Semoga harimu penuh kelancaran dan senyuman manis!"
    }
  ],

  eatAfternoon: [
    {
      title: "🍱 Rehat & Makan Siang Yuk Sayang! 🥗",
      message: "Tinggalkan dulu urusan tugas dan layarmu sejenak ya cinta. Waktunya makan siang! Perut kenyang bikin mood langsung ceria lagi lho. Selamat makan! ❤️"
    },
    {
      title: "🍛 Jangan Tunda Makan Siang, Manisku! 🍲",
      message: "Udah jam istirahat nih! Cari makanan yang enak dan bersih yaa. Jangan makan yang terlalu pedas nanti lambungmu protes. Sehat selalu kesayanganku!"
    },
    {
      title: "🥗 Waktunya Lunch Break Bidadariku! 🥤",
      message: "Makan yang lahap ya manis! Istirahat santai 30 menit tanpa mikirin deadline. Kamu butuh energi baru buat sesi nanti sore. Love you!"
    },
    {
      title: "🍜 Perut Keroncongan Bukan Kode Alam Sayang! 🥢",
      message: "Bunyi krucuk-krucuk di perut itu bukan misteri alam semesta ya, itu kode keras harus makan sekarang! Yuk santap siang cintaku!"
    },
    {
      title: "🍗 Santap Siang Enak Buat Penakluk Hari! 🍚",
      message: "Nikmati makanan siangmu dengan tenang ya sayang. Makan yang cukup, kunyah perlahan, dan syukuri rezeki hari ini. Selamat makan sayangku!"
    },
    {
      title: "🥢 Jangan Makan Sambil Ngetik Tugas Ya! 🙅‍♀️",
      message: "Makan siang itu hak tubuhmu! Nikmati rasa makanannya, jangan disambi mikir soal ujian atau deadline. Refreshing dulu 20 menit ya cinta!"
    },
    {
      title: "🍛 Sepiring Nasi Hangat Buat Tenaga Baru! 🍛",
      message: "Isi energimu sampai penuh lagi ya manis! Jangan sampai pulang sekolah/kuliah nanti dalam keadaan kelaparan dan lemas!"
    },
    {
      title: "🥩 Protein & Sayur Buat Kesayanganku! 🥦",
      message: "Pilih menu makan siang yang bernutrisi ya sayang. Tubuhmu butuh banyak gizi setelah terkuras berpikir keras seharian!"
    },
    {
      title: "🍱 Makan Bareng Teman Sambil Ketawa! 👭",
      message: "Ngobrol santai sambil makan siang bareng teman pasti seru. Nikmati momen kebersamaanmu ya bidadariku yang ramah!"
    },
    {
      title: "🥪 Sandwich / Nasi Kotak Hari Ini? 🥪",
      message: "Apapun menunya, jangan lupa berdoa sebelum makan ya sayang. Semoga makananmu jadi berkah dan sumber kesehatan!"
    },
    {
      title: "🥤 Minum Air Putih yang Banyak Ya Manis! 💧",
      message: "Setelah makan siang, habiskan segelas besar air putih yaa. Biar sistem pencernaanmu lancar dan tubuhmu tetap segar terhidrasi!"
    },
    {
      title: "🍲 Sup Hangat Buat Badan yang Segar! 🍲",
      message: "Kuah hangat sup rasanya pas banget buat siang ini. Selamat menikmati makan siangmu ya kesayangan hatiku!"
    },
    {
      title: "🍙 Bekal Cinta dari Rumah Sudah Dimakan? 🍱",
      message: "Kalau bawa bekal, buka sekarang yuk! Makanan rumahan selalu paling sehat dan bikin kangen. Selamat makan manisku!"
    },
    {
      title: "🍕 Manjakan Lidahmu di Waktu Istirahat! 🍕",
      message: "Sekali-kali boleh kok jajan makanan favoritmu buat reward belajar rajin tadi pagi. Makan yang kenyang ya cintaku!"
    },
    {
      title: "🥘 Harum Makanan Menggoda Selera! 🥘",
      message: "Yuk cuci tangan pakai sabun dulu sebelum makan ya sayang. Kebersihan nomer satu biar kamu tetap sehat selalu!"
    },
    {
      title: "🍚 Habiskan Porsimu Jangan Disisa Ya! 🍚",
      message: "Makan yang lahap ya cinta, jangan ada nasi yang tercecer. Tubuh mungilmu butuh banyak energi biar nggak gampang capek!"
    },
    {
      title: "🥟 Siomay / Bakso Hangat Siang Ini? 🍢",
      message: "Kalau lagi pengen yang berkuah gurih, selamat menikmati ya sayang! Tapi ingat jangan kebanyakan sambal yaa!"
    },
    {
      title: "🥗 Sayur Bening & Lauk Lezat! 🥗",
      message: "Makan siang sehat bikin pikiran cerdas! Selamat makan kesayanganku tercinta, semoga harimu makin asyik!"
    },
    {
      title: "🍉 Penutup Manis: Buah Potong Segar! 🍍",
      message: "Segarkan lidahmu dengan potongan buah manis ya sayang. Vitamin alami buat kulit cantik dan stamina primamu!"
    },
    {
      title: "🥢 Jangan Buru-Buru Nelan Makanannya! 🐢",
      message: "Kunyah makananmu sampai lembut ya manis, biar lambungmu nggak bekerja terlalu keras. Selamat bersantap siang!"
    },
    {
      title: "🍛 Makan Siang Tenang di Sudut Favorit! 🌿",
      message: "Temukan tempat yang nyaman untuk makan dan bersantai sejenak. Aku temani dari kejauhan dengan segenap rasa sayang!"
    },
    {
      title: "🍗 Nikmati Setiap Gigitan Penuh Syukur! 🍗",
      message: "Alhamdulillah untuk santapan siang hari ini. Semoga berkah makanan ini menyertai setiap usahamu menuntut ilmu sayang!"
    },
    {
      title: "🥞 Jangan Cuma Jajan Cilok Ya Manis! 🍡",
      message: "Jajan boleh, tapi tetap harus makan makanan yang beneran padat gizi ya cinta! Kesehatanmu nomor satu buat aku!"
    },
    {
      title: "🍣 Hidangan Istimewa untuk Bidadari Istimewa! 🍣",
      message: "Selamat makan siang cintaku tersayang. Semoga harimu penuh kelezatan dan ketenangan lahir batin!"
    },
    {
      title: "🍜 Mie Ayam Hangat / Nasi Padang? 🍛",
      message: "Pilihan apapun pasti mantap kalau disantap pas lagi lapar-laparnya. Selamat menikmati makan siangmu ya sayang!"
    },
    {
      title: "🥤 Jangan Lupa Teh Manis / Jus Buah! 🍹",
      message: "Lengkapi makan siangmu dengan minuman yang menyegarkan dahaga. Segarkan tubuhmu untuk aktivitas berikutnya!"
    },
    {
      title: "🍱 Makan Siang Cepat Tapi Sehat! 🍱",
      message: "Walau waktu istirahat terbatas, pastikan perutmu terisi dengan baik ya sayang. Jangan biarkan lambungmu kosong melompong!"
    },
    {
      title: "🍔 Burger / Nasi Uduk Pilihanmu! 🍔",
      message: "Apapun santapanmu siang ini, semoga bikin senyummu mengembang lagi ya manis. Selamat makan sayangku!"
    },
    {
      title: "🍛 Makan Siang Bareng Pikiran Rindu! 💭",
      message: "Sambil makan siang, aku kepikiran senyummu terus nih. Makan yang banyak ya cinta, biar makin menggemaskan!"
    },
    {
      title: "🥪 Waktunya Rehat & Bersyukur! 🥪",
      message: "Jadikan momen makan siang ini jeda untuk menghela nafas panjang dan bersyukur atas segala nikmat hari ini. Love you!"
    },
    {
      title: "❤️ Selamat Makan Siang Belahan Jiwaku! ❤️",
      message: "Habiskan makananmu dengan bahagia ya cinta. Nanti kalau sudah selesai makan, istirahat santai sejenak sebelum kelas mulai lagi!"
    }
  ],

  afternoonCare: [
    {
      title: "⛅ Rehat Sore Manisku yang Hebat! 🧃",
      message: "Sore sudah tiba sayang! Regangkan pundakmu, hembuskan rasa lelah seharian. Kamu udah berjuang luar biasa keren hari ini. Bangga banget deh sama kamu! ❤️"
    },
    {
      title: "🧃 Sore Adem Kesayangan Hatiku! 🍃",
      message: "Udah jam segini, jangan lupa minum air putih dan istirahatkan matamu yaa. Capek ya hari ini? Duduk santai dulu yuk, nikmati angin sore!"
    },
    {
      title: "🌅 Menjelang Senja Bersamamu! ☕",
      message: "Langit sore mulai temaram nih manis. Kalau capek setelah seharian sekolah/kuliah, mandi air hangat yuk biar badan kembali segar!"
    },
    {
      title: "🌤️ Cuci Muka & Tarik Nafas Lega! 🧘‍♀️",
      message: "Aktivitas siang tadi pasti menguras tenaga. Yuk bersantai sejenak di teras, biarkan pikiranmu kembali tenang dan rileks ya cinta!"
    },
    {
      title: "🌇 Sore Indah untuk Bidadari Tercantik! 🌸",
      message: "Semoga penatmu ikut hilang bersama terbenamnya matahari sore ini. Kamu hebat banget hari ini, terima kasih sudah berusaha yang terbaik sayang!"
    },
    {
      title: "🍃 Duduk Santai Sambil Dengar Musik Sore! 🎶",
      message: "Waktunya santai sejenak sebelum malam tiba. Putar playlist santai favoritmu, rebahkan badan, dan biarkan pikiranmu istirahat sejenak!"
    },
    {
      title: "🕊️ Selamat Tiba di Rumah / Kosan! 🏠",
      message: "Kalau baru sampai, lepas sepatu, ganti baju yang nyaman, dan cuci tangan kaki ya sayang. Selamat beristirahat di tempat ternyamanmu!"
    },
    {
      title: "☕ Secangkir Teh Hangat di Sore Hari! 🫖",
      message: "Sore-sore gini enak banget minum teh chamomile atau teh melati hangat. Nikmati waktu istirahat soremu dengan penuh kedamaian ya cintaku!"
    },
    {
      title: "🧸 Peluk Hangat Pengusir Lelah Sore! 🤗",
      message: "Capek ya sayang? Sini aku kirimkan pelukan virtual paling hangat dan nyaman untuk menghapus semua letih di pundakmu!"
    },
    {
      title: "🌤️ Senja Menyapa Kesayanganku! 🌤️",
      message: "Matahari perlahan tenggelam menandakan perjuangan belajarmu hari ini berhasil tuntas. Kamu luar biasa sayang, I'm so proud of you!"
    },
    {
      title: "🧃 Camilan Sore Biar Nggak Masuk Angin! 🍪",
      message: "Makan biskuit atau buah potong sambil santai yuk cinta. Jaga energimu sebelum nanti makan malam ya manisku!"
    },
    {
      title: "🧘‍♀️ Rilekskan Seluruh Tubuhmu! 🍃",
      message: "Tutup matamu 5 menit, atur pernapasan perlahan. Biarkan semua ketegangan seharian mengalir pergi. Kamu pantas dapat ketenangan ini!"
    },
    {
      title: "🌺 Kehangatan Sore Spesial Buat Kamu! 🌺",
      message: "Setiap sore rasanya selalu ingin cepat-cepat ngobrol dan dengar ceritamu tentang harimu tadi. Nanti kita cerita-cerita ya sayang!"
    },
    {
      title: "🚿 Segarkan Badan dengan Mandi Sore! 🧼",
      message: "Mandi sore air hangat bikin badan enteng dan wangi seketika lho! Jangan malas mandi sore ya manis, biar makin segar mempesona!"
    },
    {
      title: "🎈 Luangkan Waktu untuk Me-Time Sore Ini! 📖",
      message: "Baca buku favorit, nonton video lucu, atau sekadar scrolling santai. Beri dirimu ruang bernafas setelah seharian produktif ya cinta!"
    },
    {
      title: "🐱 Waktu Rebahan yang Hakiki! 🛋️",
      message: "Kasur empukmu sudah memanggil tuh! Rebahkan badan sejenak, luruskan kaki yang seharian melangkah kesana-kemari. Enak kan manis?"
    },
    {
      title: "🍵 Rehat Sore Sambil Hirup Udara Asri! 🌿",
      message: "Buka jendela kamar, biarkan sirkulasi udara sore masuk berganti. Rasakan hembusan angin yang sejuk membelai pipimu ya sayang!"
    },
    {
      title: "⛅ Senja Emas Mengagumi Senyummu! 💛",
      message: "Cahaya senja sore ini indah banget, tapi tetap kalah menawan dibanding senyuman bidadariku. Jangan lupa tersenyum ya cinta!"
    },
    {
      title: "🧺 Rapikan Meja Belajar Sejenak! 📚",
      message: "Setelah selesai aktivitas, rapikan bukumu perlahan ya sayang. Meja yang rapi bikin pikiran tenang dan nyaman buat istirahat nanti malam!"
    },
    {
      title: "💧 Rehidrasi Tubuhmu di Akhir Sore! 💧",
      message: "Segelas air putih segar buat mengganti cairan tubuh yang hilang seharian. Tetap jaga kesehatanmu ya kesayanganku tercinta!"
    },
    {
      title: "🎨 Sore yang Santai Tanpa Beban! 🎨",
      message: "Jangan bawa overthinking sekolah/kuliah ke waktu istirahat soremu yaa. Semuanya bisa diselesaikan satu per satu pada waktunya cinta!"
    },
    {
      title: "🕊️ Lepaskan Beban Pikiranmu! 🕊️",
      message: "Apapun yang tadi sempat bikin kesel atau capek, lepaskan perlahan ya sayang. Besok adalah hari baru dengan kesempatan baru!"
    },
    {
      title: "🌤️ Selamat Sore Bidadari Favorit Semesta! ✨",
      message: "Terima kasih sudah bertahan dan memberikan yang terbaik hari ini. Kamu selalu jadi orang yang paling aku kagumi!"
    },
    {
      title: "🧁 Kue Manis Peneman Rehat Sore! 🧁",
      message: "Manjakan dirimu dengan sedikit kudapan lezat sore ini. Kamu layak mendapatkan hadiah kecil setelah kerja kerasmu seharian!"
    },
    {
      title: "🌇 Salam Senja dari Lubuk Hatiku! 💌",
      message: "Walau jarak memisahkan kita saat ini, cintaku dan perhatianku selalu hadir menemanimu di setiap senja. Love you sayang!"
    },
    {
      title: "🧃 Santai Dulu Sebelum Maghrib Tiba! 🕌",
      message: "Manfaatkan waktu santai ini dengan baik ya cinta. Sebentar lagi waktu sholat Maghrib tiba, siapkan hati yang tenang yaa!"
    },
    {
      title: "🌻 Senja Ceria untuk Hatimu yang Cantik! 🌻",
      message: "Semoga sore harimu dipenuhi canda tawa dan kehangatan keluarga ya manisku. Senang rasanya tahu kamu baik-baik saja!"
    },
    {
      title: "🍃 Dinginkan Kepala & Hangatkan Hati! 🍃",
      message: "Semua kesibukan siang tadi sudah tuntas. Saatnya bernafas lega dan bersiap menyambut malam yang nyaman bersama orang tercinta!"
    },
    {
      title: "🧸 Rehat Manis untuk Kekasih Hatiku! 🧸",
      message: "Sandarkan kepalamu di bantal empuk ya sayang. Istirahat sejenak 15-20 menit biar tenagamu pulih untuk ibadah malam nanti!"
    },
    {
      title: "🌅 Mentari Pamit, Kasihku Tak Pernah Padam! 🌅",
      message: "Matahari boleh tenggelam di barat, tapi rasa sayangku padamu selalu terbit tanpa batas. Selamat menikmati sore ya cintaku!"
    },
    {
      title: "❤️ Selamat Beristirahat Sore Sayangku! ❤️",
      message: "Peluk erat dan cium hangat dari jauh. Nikmati soremu dengan tenang ya bidadariku tercinta!"
    }
  ],

  eatEvening: [
    {
      title: "🍛 Waktunya Makan Malam Santai! 🍲",
      message: "Malam sayangku! Yuk santap makan malam yang hangat dan lezat. Tubuhmu butuh asupan nutrisi setelah seharian capek beraktivitas. Selamat makan ya cinta! ❤️"
    },
    {
      title: "🍜 Dinner Time Kesayangan Hatiku! 🥢",
      message: "Jangan skip makan malam ya manis! Makan yang cukup biar tidurnya nanti nyenyak dan nggak terbangun kelaparan tengah malam. Love you!"
    },
    {
      title: "🍲 Hangatkan Badan dengan Makan Malam! 🥘",
      message: "Nikmati hidangan makan malammu dengan tenang ya sayang. Hari ini sudah selesai, saatnya memanjakan perut dan pikiranmu. Selamat makan!"
    },
    {
      title: "🍚 Udah Makan Malam Belum Cinta? 🥟",
      message: "Kalau belum, yuk cari makan sekarang yaa! Jangan malas makan, kesehatanmu itu prioritas nomer satu buat aku. Makan yang lahap ya sayang!"
    },
    {
      title: "🥗 Santap Malam Penuh Syukur! 🍱",
      message: "Alhamdulillah untuk hari yang telah dilalui. Nikmati hidangan malam ini dengan penuh berkah ya bidadariku tercinta!"
    },
    {
      title: "🍛 Malam Hangat Ditemani Makanan Enak! 🍲",
      message: "Makan malam bersama keluarga atau santai di kamar itu momen terbaik. Kunyah perlahan dan nikmati rasanya ya cintaku!"
    },
    {
      title: "🥘 Pilihan Makan Malam Terbaik Buat Sayang! 🥘",
      message: "Yuk makan yang bergizi malam ini! Makanan yang sehat bikin regenerasi sel tubuhmu saat tidur nanti berjalan maksimal lho!"
    },
    {
      title: "🍜 Semangkuk Sup / Mie Hangat di Malam Hari! 🍜",
      message: "Kuah hangatnya pasti bikin badanmu makin rileks setelah lelah seharian. Selamat bersantap malam bidadari cantiku!"
    },
    {
      title: "🍗 Dinner Enak Buat Pengisi Stamina! 🍚",
      message: "Makan yang cukup ya sayang, jangan diet berlebihan sampai lemas yaa! Kamu sudah sangat cantik apa adanya. Makan yang kenyang ya cinta!"
    },
    {
      title: "🥟 Kudapan Malam yang Menyenangkan! 🥟",
      message: "Habiskan makan malammu ya manis. Jangan lupa minum air putih hangat setelahnya biar perutmu terasa nyaman dan rileks!"
    },
    {
      title: "🍛 Perut Kenyang, Tidur Nyenyak Nanti Malam! 🍛",
      message: "Jangan sampai tidur dengan perut kosong ya sayang, nanti bisa kena asam lambung. Yuk makan malam dulu sekarang!"
    },
    {
      title: "🥢 Santap Santai Tanpa Gangguan Tugas! 🙅‍♀️",
      message: "Saat makan malam, simpan dulu tugas dan gawaimu. Fokus nikmati rezeki makanan di depanmu ya kesayangan hatiku!"
    },
    {
      title: "🍢 Sate Hangat / Nasi Goreng Malam Ini? 🍢",
      message: "Aroma makan malam menggoda banget nih! Makan dengan lahap ya sayang, semoga badanmu kembali segar dan berenergi!"
    },
    {
      title: "🫕 Hidangan Malam Spesial untuk Cintaku! 🫕",
      message: "Semoga tiap suapan membawa kebahagiaan dan mengusir sisa letih harimu. Selamat makan malam bidadari terindahku!"
    },
    {
      title: "🍞 Santap Malam Ringan & Nyaman! 🥪",
      message: "Kalau nggak terlalu lapar nasi, makan roti atau buah yang mengenyangkan ya sayang. Yang penting perutmu terisi dengan baik!"
    },
    {
      title: "🥩 Protein Malam Buat Pemulihan Otot! 🥩",
      message: "Tubuhmu sudah banyak bergerak hari ini. Asupan protein malam ini sangat bagus untuk memulihkan staminamu. Selamat makan cinta!"
    },
    {
      title: "🥗 Porsi Pas Buat Makan Malam! 🥗",
      message: "Makan secukupnya ya manis, jangan kekenyangan banget biar nanti tidurnya nggak begah. Nikmati makananmu sayang!"
    },
    {
      title: "🍵 Tutup Makan Malam dengan Minuman Hangat! 🍵",
      message: "Setelah makan, seruput teh hangat atau air putih ya sayang. Rasakan kehangatannya yang menenangkan jiwa!"
    },
    {
      title: "🍲 Makan Malam Hangat Bersama Keluarga! 👨‍👩‍👧",
      message: "Nikmati obrolan hangat di meja makan ya cinta. Kehangatan makan malam adalah penawar lelah terbaik!"
    },
    {
      title: "🥢 Jangan Tunda Makan Malam Terlalu Larut! ⏰",
      message: "Usahakan makan sebelum jam 8 malam ya manis, biar lambungmu punya waktu mencerna sebelum kamu tidur. Selamat makan!"
    },
    {
      title: "🍱 Makan Malam Praktis & Lezat! 🍱",
      message: "Apapun menunya malam ini, syukuri dengan senyuman ya sayang. Selamat santap malam cintaku!"
    },
    {
      title: "🍛 Aroma Nasi Hangat Menggugah Selera! 🍚",
      message: "Ayo makan sayang, jangan sampai aku khawatir kamu telat makan yaa. Selamat makan enak bidadari hatiku!"
    },
    {
      title: "🐟 Ikan Bakar / Ayam Goreng Malam Ini? 🍗",
      message: "Menu favoritmu pasti bikin nafsu makan bertambah. Makan yang lahap ya manisku sayang!"
    },
    {
      title: "🍉 Pencuci Mulut Segar Setelah Dinner! 🍇",
      message: "Makan sepotong buah segar setelah makan malam ya sayang, biar pencernaanmu lancar dan tubuhmu tetap fit!"
    },
    {
      title: "🍲 Soto Hangat Buat Malam yang Sejuk! 🍲",
      message: "Kuah rempah soto pasti bikin tubuhmu hangat dan nyaman. Selamat makan malam kesayangan hatiku tercinta!"
    },
    {
      title: "🍚 Bersihkan Piringmu dengan Senyuman! 🍚",
      message: "Habiskan makananmu ya sayang. Makanan yang dihabiskan adalah tanda syukur atas rezeki berkah hari ini. Love you!"
    },
    {
      title: "🥟 Cemilan Malam & Makanan Bergizi! 🥟",
      message: "Pastikan tubuhmu mendapatkan kalori yang cukup untuk memulihkan tenaga. Selamat makan malam bidadariku!"
    },
    {
      title: "🥢 Makan Santai Sambil Senyum Bahagia! 😊",
      message: "Hari yang panjang sudah berhasil kamu lewati. Hadiahi dirimu dengan santapan malam yang menyenangkan ini ya cinta!"
    },
    {
      title: "🍛 Malam Nikmat Bersama Rasa Syukur! 🍛",
      message: "Alhamdulillah untuk makan malam ini. Semoga kesehatan dan keceriaan selalu melimpahi hidupmu ya manisku!"
    },
    {
      title: "🍲 Dinner Romantis dalam Bayangan Rindu! 🕯️",
      message: "Walau makan di tempat terpisah, hatiku selalu makan malam bersamamu dalam doa dan rasa rindu. Selamat makan sayang!"
    },
    {
      title: "❤️ Selamat Makan Malam Cintaku Tersayang! ❤️",
      message: "Makan yang kenyang dan nikmati malam santaimu ya bidadariku tercinta. I love you so much!"
    }
  ],

  goodNight: [
    {
      title: "🌙 Selamat Tidur Sayangku, Mimpi Indah! 💤❤️",
      message: "Hari ini kamu luar biasa hebat! Sekarang tutup matamu perlahan, lepaskan semua lelah dan overthinking. Aku peluk dari jauh, bismillah mimpi indah ya cintaku! 💤❤️"
    },
    {
      title: "✨ Istirahat Nyenyak Bidadariku Tercinta! 🌌",
      message: "Jangan begadang lagi ya manis, kesehatanmu sangat berharga buat aku. Tarik selimutmu yang hangat, biarkan tubuh dan pikiranmu pulih sempurna. Good night my love!"
    },
    {
      title: "🌠 Bintang Malam Menyapa Bidadariku! 🪐",
      message: "Tutup hari ini dengan doa dan rasa syukur. Apapun yang terjadi hari ini, kamu sudah memberikan yang terbaik. Tidur yang pulas ya kesayanganku!"
    },
    {
      title: "🧸 Selamat Malam & Rehat Total Sayang! 🛌",
      message: "Matikan lampu, pasang posisi paling nyaman. Semoga esok hari kamu bangun dengan tubuh yang segar bugar dan senyuman baru. Love you always!"
    },
    {
      title: "🌌 Sleep Tight My Precious One! 🌙",
      message: "Malam sudah larut cinta. Jangan tatap layar HP terus yaa, istirahatkan matamu. Sampai jumpa di dalam mimpi manis malam ini ya sayang!"
    },
    {
      title: "🕯️ Hening Malam yang Menenangkan! 🕊️",
      message: "Biarkan malam memeluk lelahmu dan membawakan kedamaian bagi jiwamu. Istirahatlah bidadariku, esok ada aku yang selalu mencintaimu!"
    },
    {
      title: "💤 Bantal Empuk & Pelukan Hangat! 🤗",
      message: "Rebahkan kepalamu di bantal ternyaman. Hembuskan semua kekhawatiranmu ke udara malam. Tidurlah dengan tenang cintaku!"
    },
    {
      title: "🌸 Doa Malam untuk Kesayangan Hatiku! 🌸",
      message: "Semoga Allah menjaga tidurmu dari segala mimpi buruk dan menggantinya dengan mimpi-mimpi terindah. Selamat malam sayang!"
    },
    {
      title: "🌙 Rembulan Menjaga Tidur Cantikmu! 🌙",
      message: "Cahaya bulan malam ini lembut seperti belaian kasih sayangku padamu. Tidur nyenyak ya manis, jangan lupa baca doa sebelum tidur!"
    },
    {
      title: "🧸 Peluk Guling Sambil Ingat Aku Ya! 🧸",
      message: "Anggap gulingmu itu pelukan hangatku yang menjagamu sepanjang malam. Selamat tidur bidadari terfavoritku!"
    },
    {
      title: "✨ Padamkan Lampu, Nyalakan Mimpi Indah! ✨",
      message: "Waktunya matikan lampu dan pejamkan mata. Semoga lelahmu berubah menjadi pahala dan energi baru untuk esok hari ya cinta!"
    },
    {
      title: "🌌 Malam Syahdu Bersama Doa Rindu! 🌌",
      message: "Sebelum tidur, aku panjatkan rasa syukur karena telah memilikimu di hidupku. Selamat beristirahat kesayanganku tercinta!"
    },
    {
      title: "💤 Jangan Pikirkan Pelajaran Dulu Malam Ini! 💤",
      message: "Otakmu butuh istirahat total untuk memproses semua ilmu tadi siang. Lepaskan bukumu, saatnya tidur pulas sayang!"
    },
    {
      title: "🌠 Taburan Bintang Pengantar Tidurmu! ⭐",
      message: "Setiap bintang di langit malam ini adalah doa kebaikan yang kupanjatkan untuk keselamatan dan kebahagiaanmu. Good night love!"
    },
    {
      title: "🛌 Selimut Hangat Menyelimuti Cintaku! 🛌",
      message: "Tarik selimutmu rapat-rapat ya manis, jangan sampai kedinginan. Semoga tidurmu nyenyak sampai fajar menyapa!"
    },
    {
      title: "🕊️ Selamat Malam Bidadari Paling Sabar! 🕊️",
      message: "Terima kasih sudah melalui hari ini dengan penuh senyuman dan kesabaran. Istirahatlah, kamu sangat berharga bagiku!"
    },
    {
      title: "🌙 Tidur Cepat Biar Besok Pagi Segar! ⏰",
      message: "Tidur tepat waktu bikin wajahmu makin berseri dan badanmu kuat besok pagi. Bismillah tidur sekarang ya sayangku!"
    },
    {
      title: "🧸 Good Night My Sweet Princess! 👑",
      message: "Putri cantikku harus tidur cukup biar besok siap memimpin harinya lagi dengan gemilang. Mimpi indah ya manis!"
    },
    {
      title: "🪐 Dunia Boleh Istirahat, Cintaku Selalu Terjaga! 🪐",
      message: "Walau dunia tertidur lelap, cintaku padamu tak pernah berhenti berdetak. Selamat beristirahat belahan jiwaku!"
    },
    {
      title: "🕯️ Lilin Kedamaian Menemani Malammu! 🕯️",
      message: "Rasakan ketenangan malam ini meresap ke dalam hatimu. Lepaskan semua beban, esok adalah harapan baru yang cerah!"
    },
    {
      title: "🌸 Senandung Malam Pengantar Tidur! 🎶",
      message: "Semoga tidurmu diiringi mimpi-mimpi yang manis dan menyenangkan. Selamat malam permata hatiku tersayang!"
    },
    {
      title: "💤 Recharge Energimu Malam Ini Sayang! 🔋",
      message: "Tidur malam adalah saat terbaik untuk mengisi ulang tenaga dan pikiranmu. Istirahat yang nyenyak ya bidadariku!"
    },
    {
      title: "🌙 Bismillah, Pejamkan Matamu Cinta! 🤲",
      message: "Bismika Allahumma ahya wa amut. Berserah dirilah kepada-Nya, semoga esok kita dibangunkan dalam keadaan sehat wal afiat!"
    },
    {
      title: "🌌 Malam yang Tenang untuk Gadis Pintarku! 🌌",
      message: "Kamu sudah belajar dengan sangat tekun hari ini. Hadiahi dirimu dengan tidur yang nyenyak tanpa gangguan ya sayang!"
    },
    {
      title: "🧸 Sampai Bertemu di Mimpi Manis! 🧸",
      message: "Aku tunggu di mimpi indahmu ya cinta, kita jalan-jalan di tempat yang paling indah berdua. Good night sweetheart!"
    },
    {
      title: "✨ Tutup Hari Ini dengan Penuh Senyuman! ✨",
      message: "Tersenyumlah sebelum tidur, karena kamu dicintai dengan begitu tulus dan mendalam. Selamat tidur sayangku!"
    },
    {
      title: "🕊️ Damai Malam Menyelimuti Hatimu! 🍃",
      message: "Semoga rasa letih di tubuhmu mencair dan berganti menjadi rasa rileks yang luar biasa. Tidurlah bidadari tercantikku!"
    },
    {
      title: "🌙 Malam Sunyi Membawa Salam Cinta! 💌",
      message: "Di keheningan malam ini, rasa rinduku padamu tetap berbisik mesra. Selamat beristirahat kesayangan hatiku!"
    },
    {
      title: "🌠 Bintang Kejora Menjaga Hatimu! ⭐",
      message: "Semoga malam ini memberi tidur paling nyenyak yang pernah kamu rasakan. Sayang kamu selamanya cinta!"
    },
    {
      title: "💤 Selamat Tidur Kesayangan Semesta! 💤",
      message: "Tutup harimu dengan damai dan bahagia. Terima kasih untuk hari yang indah ini manisku. Peluk erat dari jauh!"
    },
    {
      title: "❤️ I Love You to the Moon and Back! ❤️",
      message: "Tidurlah bidadariku tersayang. Cintaku padamu takkan pernah berkurang sedetik pun. Selamat malam dan mimpi indah!"
    }
  ],

  sahur: [
    {
      title: "🍽️ Waktunya Sahur Sayangku! 🌙",
      message: "Bangun yuk manis, minum air putih yang banyak dan makan sahur yang bergizi yaa. Semoga puasanya lancar dan berkah hari ini, semangat cintaku! ❤️"
    },
    {
      title: "☕ Sahur Dulu Yuk Bidadariku! 🍲",
      message: "Buka matamu perlahan cinta, isi tenaga terbaikmu untuk puasa hari ini. Bismillah dilancarkan sampai maghrib nanti ya sayang!"
    },
    {
      title: "🍳 Bangun Sahur Kesayangan Hatiku! 🥛",
      message: "Jangan sampai kelewat imsak manis! Niatkan puasa karena Allah dan jaga niat baik kita. Peluk hangat dari jauh sayang!"
    },
    {
      title: "🥣 Santap Sahur Bernutrisi Buat Puasa Prima! 🥣",
      message: "Makan yang cukup ya cinta, perbanyak serat dan protein biar nggak lemas seharian. Selamat sahur bidadari cantiku!"
    },
    {
      title: "🌙 Keberkahan Sahur Menanti Kita! ✨",
      message: "Di dalam sahur ada keberkahan besar lho. Nikmati makanan sahurmu dengan rasa syukur ya kesayanganku tercinta!"
    },
    {
      title: "💧 Jangan Lupa Minum 2-3 Gelas Air Putih! 💧",
      message: "Biar nggak dehidrasi siang nanti, habiskan air putih yang cukup sebelum sirine imsak berbunyi ya sayang!"
    },
    {
      title: "🥪 Sahur Hangat Bersama Senyuman Manis! 🥪",
      message: "Walau masih ngantuk, yuk bangun dan cuci muka dulu cinta. Selamat santap sahur kesayanganku!"
    },
    {
      title: "⏰ Waktu Imsak Tinggal Sebentar Lagi! ⏰",
      message: "Ayo selesaikan makanan dan minummu ya sayang. Niat puasa dan siap-siap sholat Subuh berjamaah!"
    },
    {
      title: "🍲 Kurma & Air Hangat Pengisi Sahur! 🌴",
      message: "Sunnah makan kurma di waktu sahur rasanya manis banget, semanis senyum bidadariku. Selamat sahur sayang!"
    },
    {
      title: "🤲 Doa Sahur untuk Puasa Penuh Berkah! 🤲",
      message: "Semoga amal ibadah puasa kita hari ini diterima dan dilipatgandakan pahalanya oleh Allah SWT. Semangat sahurnya cinta!"
    }
  ],

  iftar: [
    {
      title: "🍹 Alhamdulillah Adzan Maghrib Tiba Sayang! 🍉",
      message: "Selamat berbuka puasa ya cintaku tercinta! Awali dengan yang manis-manis seperti senyumanmu. Selamat menikmati hidangan ya sayang! 🌟"
    },
    {
      title: "🍉 Selamat Berbuka Puasa Bidadariku! 🍹",
      message: "Lepaskan dahaga dan laparmu dengan penuh syukur. Semoga amal puasa hari ini diterima Allah SWT. Selamat makan enak sayang!"
    },
    {
      title: "🍽️ Waktunya Buka Puasa, Manisku! 🌴",
      message: "Jangan langsung makan porsi berat yaa sayang, minum air hangat dan makan kurma dulu. Selamat berbuka kesayanganku tercinta!"
    },
    {
      title: "🍧 Manisnya Es Buah Penyejuk Buka Puasa! 🍨",
      message: "Teguk air segar pertama setelah seharian berpuasa rasanya nikmat sekali. Syukuri nikmat berbuka ini bersama keluarga ya cinta!"
    },
    {
      title: "🌴 Buka Puasa dengan Kurma Manis! 🌴",
      message: "Dahaga telah pergi, urat-urat telah basah, dan pahala telah ditetapkan insya Allah. Selamat berbuka puasa bidadari hatiku!"
    },
    {
      title: "🍲 Santap Berbuka yang Penuh Berkah! 🍲",
      message: "Nikmati santapan berbuka dengan tenang dan bahagia ya sayang. Terima kasih sudah kuat dan ikhlas berpuasa seharian ini!"
    },
    {
      title: "🍵 Buka Puasa Hangat untuk Kesayangan Hatiku! 🍵",
      message: "Alhamdulillah perjuangan puasa hari ini selesai dengan indah. Selamat menikmati hidangan favoritmu ya bidadariku!"
    },
    {
      title: "🍉 Segarkan Dahaga di Waktu Maghrib! 🍉",
      message: "Semoga kesegaran hidangan berbuka mengembalikan energimu untuk ibadah tarawih dan malam nanti. Love you sayang!"
    },
    {
      title: "🥟 Gorengan & Kolak Manis Buat Cinta! 🥟",
      message: "Makan secukupnya ya manis, jangan sampai kekenyangan biar nanti shalatnya tetap khusyuk dan nyaman. Selamat berbuka!"
    },
    {
      title: "❤️ Selamat Berbuka Puasa Belahan Jiwaku! ❤️",
      message: "Peluk hangat dari jauh untukmu yang hebat berpuasa seharian. Selamat santap malam dan selamat berbuka cintaku!"
    }
  ]
};

/**
 * Returns a deterministic continuous day index for any date (default today WIB).
 * Ensures that day N, day N+1, day N+2 always have different indices with no random duplicates.
 */
export function getDayIndex(date: Date | string = new Date()): number {
  let d: Date;
  if (typeof date === 'string') {
    const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12, 0, 0);
    } else {
      d = new Date(date);
    }
  } else {
    d = date;
  }

  const jakartaStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(d);
  const [y, m, day] = jakartaStr.split('-').map(Number);
  
  // Continuous day count since 2026-01-01
  const epoch = Date.UTC(2026, 0, 1);
  const target = Date.UTC(y, m - 1, day);
  const diffDays = Math.floor((target - epoch) / 86400000);
  return Math.abs(diffDays);
}

/**
 * Get daily greeting object (both title and message) that changes deterministically every single day.
 * Ensures titles and messages never repeat on consecutive days and vary in tone.
 */
export function getDailySweetGreeting(type: SweetMessageType, date: Date | string = new Date()): SweetGreeting {
  const list = SWEET_GREETINGS[type] || SWEET_GREETINGS.goodMorning;
  const index = getDayIndex(date) % list.length;
  return list[index];
}

/**
 * Get a random sweet greeting (useful for simulator / testing).
 */
export function getRandomSweetGreeting(type: SweetMessageType): SweetGreeting {
  const list = SWEET_GREETINGS[type] || SWEET_GREETINGS.goodMorning;
  const index = Math.floor(Math.random() * list.length);
  return list[index];
}

/**
 * Backward compatibility helpers returning message string only.
 */
export function getRandomSweetMessage(type: SweetMessageType): string {
  return getRandomSweetGreeting(type).message;
}

export function getDailySweetMessage(type: SweetMessageType, dateStr?: string): string {
  return getDailySweetGreeting(type, dateStr || new Date()).message;
}
