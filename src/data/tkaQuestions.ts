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
  {
    id: "q1",
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
    id: "q2",
    subject: "Bahasa Indonesia",
    passage: `Tradisi Buwuhan: Antara Gotong Royong dan Utang Piutang\n\nTradisi buwuhan merupakan bagian dari budaya masyarakat Jawa, khususnya di kota-kota besar seperti Surabaya. Tradisi ini dilakukan ketika ada acara penting seperti pernikahan atau khitanan yang diadakan di daerah tersebut. Buwuhan merujuk pada kegiatan memberi bantuan, baik berupa barang, uang, maupun tenaga kepada seseorang yang sedang mengadakan hajatan, atau bisa juga disebut sebagai kegiatan menyumbang. Tradisi ini mencerminkan nilai gotong royong dan solidaritas sosial karena keluarga dan tetangga saling bahu-membahu dalam membantu sesama. Namun, praktik buwuhan tidak lepas dari unsur pertukaran atau dipandang sebagai utang. Masyarakat meyakini bahwa segala bentuk bantuan yang diberikan akan kembali dalam bentuk yang setara ketika si pemberi mengadakan hajatan serupa. Hal ini menyebabkan buwuhan tidak lagi dipandang murni sebagai hibah atau sedekah, tetapi sebagai bentuk "utang tidak tertulis" yang menimbulkan kewajiban moral untuk membalas.\nDalam praktiknya, buwuhan memang meringankan beban tuan rumah, tetapi dapat menimbulkan tekanan psikologis bagi penerima bantuan. Rasa malu dan kekhawatiran kehilangan harga diri mendorong sebagian orang untuk berutang demi mengembalikan buwuhan. Hal ini menyebabkan terbaginya cara pandang terhadap buwuhan. Ada yang melihatnya sebagai bentuk tolong-menolong, tetapi ada juga yang justru menganggapnya menjadi sistem utang piutang berbasis sosial. Sebagian pihak berpendapat bahwa buwuhan adalah hibah karena tujuannya adalah untuk membantu. Namun, apabila ada keharusan pengembalian, maka secara hukum dan etika, buwuhan telah bergeser dari semangat gotong royong menjadi sebuah kewajiban ekonomi yang membebani. Oleh karena itu, pemahaman masyarakat terhadap tradisi buwuhan perlu diluruskan agar nilai luhur tolong-menolong tetap terjaga tanpa menimbulkan beban yang tidak perlu.`,
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
    id: "q3",
    subject: "Bahasa Indonesia",
    passage: `(Teks Tradisi Buwuhan yang sama)`,
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
    id: "q4",
    subject: "Matematika",
    passage: "Pak Andi memiliki beberapa sapi dan kambing. Semua hewan ternaknya selalu diberikan pakan berupa campuran rumput gajah dan rumput gamal. Setiap hari, ia selalu menyediakan 38 kg rumput gajah dan 34 kg rumput gamal untuk seluruh kambing dan sapi miliknya tanpa sisa.\n\nSapi: Butuh 10 kg rumput gajah, 10 kg rumput gamal.\nKambing: Butuh 2 kg rumput gajah, 1 kg rumput gamal.\n\nJika banyaknya sapi dan kambing yang dipelihara berturut-turut adalah x dan y...",
    text: "Maka (x y) adalah ...",
    options: [
      { id: "a", text: "(-1 1 \\ 10 -5) (19 \\ 34) = (15 \\ 20)" },
      { id: "b", text: "(10 -10 \\ -1 2) (38 \\ 34) = (4 \\ 3)" },
      { id: "c", text: "(-1/10 2/10 \\ 1 -1) (34 \\ 38) = (4 \\ 3)" },
      { id: "d", text: "(-1 2 \\ 10 -10) (38 \\ 34) = (3 \\ 4)" },
      { id: "e", text: "(-1/5 1/5 \\ 2 -1) (19 \\ 34) = (3 \\ 4)" }
    ],
    correctAnswerId: "c"
  }
];
