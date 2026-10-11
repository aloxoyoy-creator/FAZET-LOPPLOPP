export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  subject: string;
  passage?: string;
  text: string;
  options: QuestionOption[];
  correctAnswerId: string;
}

export const tkaQuestions: Question[] = [
  // ENGLISH - The Lion and the Mouse
  {
    id: "en_1",
    subject: "Bahasa Inggris",
    passage: `The Lion and the Mouse\n\nOnce upon a time, in a thick jungle in Africa, there lived a strong and fierce lion. Every afternoon, the lion would rest under the cool shade of a big tree after walking through the forest.\nOne day, while he was sleeping, a playful little mouse passed by. The mouse saw the lion's thick mane and was curious. He climbed up and began to jump around on the lion's head, playing in his mane.\nThe lion woke up suddenly and was not happy at all. He quickly caught the mouse in his big paw and roared, "Who dares to wake me up?" He was very angry and almost killed the mouse.\nScared and shaking, the mouse begged the lion, "Please don't kill me! I didn't mean to bother you. If you let me go, I promise I'll help you one day."\nThe lion laughed loudly. "You? Help me? That's funny." But the lion was feeling kind, so he let the mouse go free.\nA few days later, the lion was walking through the jungle again when he fell into a trap. A net set by hunters caught him, and he couldn't escape. He tried to bite and tear the ropes, but they were too strong. The lion roared loudly, hoping someone would come.\nThe mouse heard the roar and ran to help. He saw the lion trapped and quickly started to chew the ropes with his sharp teeth. After some time, the net broke, and the lion was free.\nThe lion looked at the mouse with surprise and said, "Thank you! You really saved my life."\nThe mouse smiled and said, "I told you I would help you one day."\nFrom that moment on, the lion and the mouse became close friends. The lion learned that even small creatures can do great things, and we all need help sometimes.`,
    text: "Which option best summarizes the story?",
    options: [
      { id: "a", text: "Beginning: A lion was walking through the jungle.\nProblem: The mouse got lost and couldn't find food.\nSolution: The lion gave food to the mouse.\nLesson: Always be generous to those in need." },
      { id: "b", text: "Beginning: A mouse accidentally disturbed a sleeping lion.\nProblem: The lion was caught in a hunter's net.\nSolution: The mouse chewed through the net and set the lion free.\nLesson: Even the smallest creature can be a great help." },
      { id: "c", text: "Beginning: The lion and mouse were best friends.\nProblem: The lion got hurt in a fight.\nSolution: The mouse helped him find water.\nLesson: Friendship is built on adventure." },
      { id: "d", text: "Beginning: A mouse was building a home near a tree.\nProblem: A storm destroyed the tree and trapped the lion.\nSolution: The mouse called for help from the jungle.\nLesson: Teamwork solves big problems." },
      { id: "e", text: "Beginning: A lion was hungry and searching for food.\nProblem: He couldn't catch any prey.\nSolution: The mouse helped him find food.\nLesson: Hunger teaches humility." }
    ],
    correctAnswerId: "b"
  },
  {
    id: "en_2",
    subject: "Bahasa Inggris",
    passage: `The Lion and the Mouse\n\n(See previous passage)`,
    text: "Which of the following statements best conveys the message of the story?",
    options: [
      { id: "a", text: "We should never wake up a sleeping animal" },
      { id: "b", text: "Even the small and weak can help the strong" },
      { id: "c", text: "It's always good to ask for help when we need it" },
      { id: "d", text: "Lions are dangerous animals and should be avoided" },
      { id: "e", text: "Never trust anyone who plays with your hair" }
    ],
    correctAnswerId: "b"
  },
  {
    id: "en_3",
    subject: "Bahasa Inggris",
    passage: `The Lion and the Mouse\n\n(See previous passage)`,
    text: "Why did the lion trust the mouse and decide to let him go instead of eating him?",
    options: [
      { id: "a", text: "The lion was too tired to eat the mouse" },
      { id: "b", text: "The mouse told the lion he might help him one day" },
      { id: "c", text: "The lion was feeling happy to see the mouse" },
      { id: "d", text: "The lion heard someone coming and got scared" },
      { id: "e", text: "The lion was amused at the mouse's words and felt kind" }
    ],
    correctAnswerId: "e"
  },
  {
    id: "en_4",
    subject: "Bahasa Inggris",
    passage: `Effective Study Techniques\n\n1. Know Your Learning Style: Understand whether you learn best by reading, listening, or watching.\n2. Set a Consistent Study Schedule: Study at the same time every day. Regularity helps build strong habits.\n3. Create a Comfortable Study Space: Find a quiet, well-lit, and distraction-free area. Have all your materials ready.\n4. Use the Pomodoro Technique: Study for 25 minutes, then take a 5-minute break. This keeps your mind fresh and focused.\n5. Take Effective Notes: Write key points using methods like mind maps or tables to help remember important information.\n6. Practice and Repeat: Regularly review your material and do practice questions to deepen understanding.\n7. Join a Study Group: Discuss topics with friends to gain new insights and solve problems together.\n8. Leverage Technology: Use apps and websites for flashcards, video lessons, and online quizzes to support your routine.\n9. Get Enough Sleep: Aim for 7-8 hours.\n10. Be Patient and Persistent: Learning takes time.`,
    text: "Based on the information given, we can keep our mind focused and fresh by ....",
    options: [
      { id: "a", text: "knowing your learning style" },
      { id: "b", text: "using Pomodoro Technique" },
      { id: "c", text: "using online quizzes apps" },
      { id: "d", text: "by reviewing materials" },
      { id: "e", text: "by creating mind maps" }
    ],
    correctAnswerId: "b"
  },
  {
    id: "en_5",
    subject: "Bahasa Inggris",
    passage: `The False Lion King\n\nOnce upon a time, in Africa, there lived two lion kings. One was named Hera and the other was Shero. Hera was very strong and handsome... Shero liked to pretend he was as powerful as Hera... One day, the animals heard that some hyenas were causing trouble... Shero also wanted to come. He wanted to show everyone that he was strong too.\nWhen they reached the river, Hera roared loudly. His roar was so powerful that the hyenas got scared. Shero also tried to roar, but his voice was high and silly. The hyenas laughed at him... Hera stayed calm and smiled... At the end of the day, the hyenas left, still laughing about Shero. Hera told Shero, "You are not like me, but you make everyone happy with your jokes." From that day, Shero became the kingdom's jester. He and Hera ruled together — one with strength, and one with laughter.`,
    text: "What can we learn from the story of Hera and Shero?",
    options: [
      { id: "a", text: "Everyone has something special to give, even if they are not the leader" },
      { id: "b", text: "Being funny and making others smile is just as important as being strong" },
      { id: "c", text: "Good friends will support you and help you see your real strengths" },
      { id: "d", text: "Working together is better when people use their different talents" },
      { id: "e", text: "Trying your best to help others is more important than always being perfect" }
    ],
    correctAnswerId: "a"
  },
  // INDONESIAN
  {
    id: "id_1",
    subject: "Bahasa Indonesia",
    passage: `Tradisi Buwuhan: Antara Gotong Royong dan Utang Piutang\n\nTradisi buwuhan merupakan bagian dari budaya masyarakat Jawa, khususnya di kota-kota besar seperti Surabaya. Tradisi ini dilakukan ketika ada acara penting seperti pernikahan atau khitanan... Buwuhan merujuk pada kegiatan memberi bantuan... Namun, praktik buwuhan tidak lepas dari unsur pertukaran atau dipandang sebagai utang... Masyarakat meyakini bahwa segala bentuk bantuan yang diberikan akan kembali dalam bentuk yang setara...`,
    text: "Apa makna kata 'hajatan' pada teks tersebut?",
    options: [
      { id: "a", text: "Kegiatan kerja bakti membersihkan lingkungan sekitar." },
      { id: "b", text: "Pertemuan rutin warga untuk membahas masalah lingkungan." },
      { id: "c", text: "Diskusi keluarga besar untuk menentukan pembagian warisan." },
      { id: "d", text: "Permohonan bantuan yang dilakukan tuan rumah kepada tetangga." },
      { id: "e", text: "Acara atau pesta yang diadakan untuk memperingati hal penting." }
    ],
    correctAnswerId: "e"
  },
  {
    id: "id_2",
    subject: "Bahasa Indonesia",
    passage: `Tradisi Buwuhan: Antara Gotong Royong dan Utang Piutang\n\n(Lihat teks sebelumnya)`,
    text: "Manakah gagasan yang mendukung ide pokok bahwa buwuhan adalah bentuk utang?",
    options: [
      { id: "a", text: "Praktik buwuhan disertai dengan perjanjian utang piutang secara tertulis." },
      { id: "b", text: "Buwuhan disertai kesepakatan untuk selalu memberi lebih dari yang diterima." },
      { id: "c", text: "Bentuk buwuhan dapat berupa sedekah atau hibah yang harus dibayar kembali." },
      { id: "d", text: "Buwuhan dilakukan oleh tetangga dan kerabat sebagai bentuk pertukaran solidaritas." },
      { id: "e", text: "Penerima buwuhan merasa harus mengembalikan bantuan yang diterima di kemudian hari." }
    ],
    correctAnswerId: "e"
  },
  {
    id: "id_3",
    subject: "Bahasa Indonesia",
    passage: `Layur, Teruslah berlayar\n\n"Bapak, pulanglah," lirih Layur berharap. Ini hari keenam. Tiga hari adalah waktu terlama nelayan berada di laut... "Jangan-jangan..."\n"Tidak ... Aku tidak boleh berpikiran buruk. Bapak pasti pulang dengan selamat. Aku akan tetap menunggunya di sini sambil berdoa."\nLayur masih ingat masa-masa dulu, ketika Bapak berlayar pada malam hari dan keesokan harinya sudah merapat kembali di pantai dengan membawa ikan berlimpah... Sampai suatu ketika ... DUAAAR!\nSeparuh rumah Layur luluh lantak karena simpanan bondet di gudang meledak. Ledakan bondet di gudang tak hanya merusak rumah tetapi juga mencelakai anak semata wayang. Ia berteriak minta tolong... Lamat-lamat terlihat kibaran layar bercorak biru. Layur beringsut menuruni perahu tempatnya duduk. Lambaian tangan bapaknya semakin jelas dan semakin dekat. "Bapak dari mana? Bapak sudah tiga hari telat pulang!" Seru Layur kesal. Matanya berkaca-kaca...`,
    text: "Berdasarkan teks tersebut, bagaimana sifat yang dimiliki oleh Layur?",
    options: [
      { id: "a", text: "Nekat dan optimis" },
      { id: "b", text: "Mudah cemas dan tabah" },
      { id: "c", text: "Penuh harap dan kasih sayang" },
      { id: "d", text: "Suka menyendiri dan tegas" },
      { id: "e", text: "Cepat panik dan menyalahkan keadaan" }
    ],
    correctAnswerId: "c"
  },
  {
    id: "id_4",
    subject: "Bahasa Indonesia",
    passage: `Pantai Bersih Tanpa Sampah\n\nDi sebuah daerah wisata yang terkenal dengan pantainya yang indah, pemerintah setempat gencar mengampanyekan "Pantai Bersih Tanpa Sampah." Spanduk dan papan peringatan terpampang di berbagai sudut. Namun, kenyataannya seringkali berbeda.\nSuatu sore, Pak Wayan, seorang nelayan tua yang sudah puluhan tahun melaut, sedang membersihkan jaringnya di tepi pantai. Di sampingnya, sekelompok turis muda asyik berpose untuk berfoto. Mereka mengenakan topi pantai yang modis... "Wah, pantainya bersih banget ya, guys!" seru salah satu turis. "Pas banget buat konten 'liburan ramah lingkungan'!"... Namun mereka meninggalkan botol minuman plastik kosong, bungkus keripik, dan beberapa puntung rokok... Pak Wayan hanya bisa menggelengkan kepala... "Sudah biasa, Nak," jawab Pak Wayan. "Ini namanya 'sampah estetik'. Cuma bagus di foto, tapi busuk di mata dan bau di hidung."`,
    text: "Apa pesan moral yang disiratkan melalui dialog antara Pak Wayan dan petugas kebersihan?",
    options: [
      { id: "a", text: "Menjaga kebersihan pantai adalah tanggung jawab utama pemerintah dan petugas kebersihan" },
      { id: "b", text: "Wisatawan seringkali menikmati keindahan alam tanpa memiliki kepedulian yang mendalam" },
      { id: "c", text: "Kesadaran lingkungan sejati harus dibuktikan lewat tindakan, bukan hanya kata-kata di media sosial" },
      { id: "d", text: "Media sosial bisa menjadi sarana positif untuk mengampanyekan kepedulian terhadap lingkungan" },
      { id: "e", text: "Nelayan dan petugas kebersihan sering kali menjadi pihak yang terdampak langsung oleh sampah" }
    ],
    correctAnswerId: "c"
  },
  // MATH / LOGIC
  {
    id: "math_1",
    subject: "Matematika",
    passage: "Pak Andi memiliki beberapa sapi dan kambing. Semua hewan ternaknya selalu diberikan pakan berupa campuran rumput gajah dan rumput gamal. Setiap hari, ia selalu menyediakan 38 kg rumput gajah dan 34 kg rumput gamal untuk seluruh kambing dan sapi miliknya tanpa sisa.\n\nSapi: Butuh 10 kg rumput gajah, 10 kg rumput gamal.\nKambing: Butuh 2 kg rumput gajah, 1 kg rumput gamal.",
    text: "Jika banyaknya sapi dan kambing yang dipelihara berturut-turut adalah x dan y, maka (x y) adalah ...",
    options: [
      { id: "a", text: "(-1  1) (19) = (15)\n(10 -5) (34) = (20)" },
      { id: "b", text: "(10 -10) (38) = (4)\n(-1   2) (34) = (3)" },
      { id: "c", text: "(-1/10  2/10) (34) = (4)\n(  1      -1  ) (38) = (3)" },
      { id: "d", text: "(-1   2 ) (38) = (3)\n(10 -10) (34) = (4)" },
      { id: "e", text: "(-1/5  1/5) (19) = (3)\n(  2    -1  ) (34) = (4)" }
    ],
    correctAnswerId: "c"
  },
  {
    id: "math_2",
    subject: "Matematika",
    passage: "Diberikan tiga himpunan bilangan sebagai berikut:\n\nA = {x | x < 6, x adalah Bilangan Asli}\nB = {x | x bilangan genap, x adalah Bilangan Cacah}\nC = {x | x <= 10, x adalah Bilangan Prima}",
    text: "Berdasarkan himpunan-himpunan tersebut, hasil dari (A irisan B) gabung C adalah ....",
    options: [
      { id: "a", text: "{2, 3, 5, 7}" },
      { id: "b", text: "{0, 2, 3, 5, 7}" },
      { id: "c", text: "{2, 3, 4, 5, 7}" },
      { id: "d", text: "{0, 2, 3, 4, 5, 7}" },
      { id: "e", text: "{2, 3, 4, 5, 7, 10}" }
    ],
    correctAnswerId: "c"
  },
  {
    id: "math_3",
    subject: "Matematika",
    passage: "Di sebuah acara bazar yang diadakan oleh suatu sekolah, terdapat 5 stan yang masing-masing dikelola oleh pedagang yang berbeda.",
    text: "Dalam bazar tersebut, stan pedagang C ingin berada di antara pedagang A dan pedagang D. Banyak kemungkinan susunan atau penataan stan sesuai keinginan pedagang C tersebut adalah ....",
    options: [
      { id: "a", text: "6 susunan" },
      { id: "b", text: "12 susunan" },
      { id: "c", text: "120 susunan" },
      { id: "d", text: "240 susunan" },
      { id: "e", text: "720 susunan" }
    ],
    correctAnswerId: "b"
  },
  {
    id: "math_4",
    subject: "Matematika",
    passage: "Dalam rangka memperingati Tahun Baru Imlek, sebuah supermarket membuat kotak undian yang berisi hadiah untuk para pelanggannya. Terdapat 60 angpao yang dimasukkan ke dalam kotak tersebut. Hadiahnya terbagi dalam dua kategori, yaitu kupon belanja dan peralatan rumah tangga. Untuk hadiah kupon belanja, terdapat 15 angpao berisi kupon senilai Rp25.000,00 dan 12 angpao berisi kupon senilai Rp50.000,00. Untuk hadiah peralatan rumah tangga, terdapat 10 angpao berisi set sendok-garpu, 8 angpao berisi pemanas air, dan sisanya angpao kosong.",
    text: "Rini menjadi orang pertama yang berkesempatan mengambil satu angpao secara acak dari kotak tersebut. Berapakah peluang Rini mengambil angpao yang kosong?",
    options: [
      { id: "a", text: "1/15" },
      { id: "b", text: "1/5" },
      { id: "c", text: "1/4" },
      { id: "d", text: "1/3" },
      { id: "e", text: "5/11" }
    ],
    correctAnswerId: "c"
  }
];
