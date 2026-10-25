export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  subject: string;
  passage?: string;
  imageUrl?: string;
  text: string;
  options: QuestionOption[];
  correctAnswerId: string;
  explanation?: string;
}

export const tkaQuestions: Question[] = [
  // =========================================================================
  // SUBTES 1: BAHASA INGGRIS (25 Soal)
  // =========================================================================
  // Passage 1: The Lion and the Mouse (Questions 1-5)
  {
    id: "en_1", subject: "Bahasa Inggris",
    passage: "The Lion and the Mouse\n\nOnce upon a time, in a thick jungle in Africa, there lived a strong and fierce lion. Every afternoon, the lion would rest under the cool shade of a big tree after walking through the forest.\nOne day, while he was sleeping, a playful little mouse passed by. The mouse saw the lion's thick mane and was curious. He climbed up and began to jump around on the lion's head, playing in his mane.\nThe lion woke up suddenly and was not happy at all. He quickly caught the mouse in his big paw and roared, \"Who dares to wake me up?\" He was very angry and almost killed the mouse.\nScared and shaking, the mouse begged the lion, \"Please don't kill me! I didn't mean to bother you. If you let me go, I promise I'll help you one day.\"\nThe lion laughed loudly. \"You? Help me? That's funny.\" But the lion was feeling kind, so he let the mouse go free.\nA few days later, the lion was walking through the jungle again when he fell into a trap. A net set by hunters caught him, and he couldn't escape. He tried to bite and tear the ropes, but they were too strong. The lion roared loudly, hoping someone would come.\nThe mouse heard the roar and ran to help. He saw the lion trapped and quickly started to chew the ropes with his sharp teeth. After some time, the net broke, and the lion was free.\nThe lion looked at the mouse with surprise and said, \"Thank you! You really saved my life.\"\nThe mouse smiled and said, \"I told you I would help you one day.\"\nFrom that moment on, the lion and the mouse became close friends. The lion learned that even small creatures can do great things, and we all need help sometimes.",
    text: "Which option best summarizes the story?",
    options: [
      { id: "a", text: "Beginning: A lion was walking through the jungle.\nProblem: The mouse got lost and couldn't find food.\nSolution: The lion gave food to the mouse.\nLesson: Always be generous to those in need." },
      { id: "b", text: "Beginning: A mouse accidentally disturbed a sleeping lion.\nProblem: The lion was caught in a hunter's net.\nSolution: The mouse chewed through the net and set the lion free.\nLesson: Even the smallest creature can be a great help." },
      { id: "c", text: "Beginning: The lion and mouse were best friends.\nProblem: The lion got hurt in a fight.\nSolution: The mouse helped him find water.\nLesson: Friendship is built on adventure." },
      { id: "d", text: "Beginning: A mouse was building a home near a tree.\nProblem: A storm destroyed the tree and trapped the lion.\nSolution: The mouse called for help from the jungle.\nLesson: Teamwork solves big problems." },
      { id: "e", text: "Beginning: A lion was hungry and searching for food.\nProblem: He couldn't catch any prey.\nSolution: The mouse helped him find food.\nLesson: Hunger teaches humility." }
    ],
    correctAnswerId: "b",
    explanation: "Ringkasan kronologis yang tepat mencakup awal mula tikus membangunkan singa (Beginning), singa terperangkap jaring pemburu (Problem), tikus menggigit tali jaring hingga putus (Solution), dan pesan moral bahwa makhluk kecil pun dapat memberi pertolongan besar (Lesson)."
  },
  {
    id: "en_2", subject: "Bahasa Inggris",
    passage: "The Lion and the Mouse\n\n(See previous passage)",
    text: "Which of the following statements best conveys the message of the story?",
    options: [
      { id: "a", text: "We should never wake up a sleeping animal." },
      { id: "b", text: "Even the small and weak can help the strong." },
      { id: "c", text: "It's always good to ask for help when we need it." },
      { id: "d", text: "Lions are dangerous animals and should be avoided." },
      { id: "e", text: "Never trust anyone who plays with your hair." }
    ],
    correctAnswerId: "b",
    explanation: "Kalimat terakhir teks menegaskan: 'The lion learned that even small creatures can do great things', yang sejalan dengan pernyataan bahwa yang kecil dan lemah pun dapat menolong yang kuat."
  },
  {
    id: "en_3", subject: "Bahasa Inggris",
    passage: "The Lion and the Mouse\n\n(See previous passage)",
    text: "Why did the lion trust the mouse and decide to let him go instead of eating him?",
    options: [
      { id: "a", text: "The lion was too tired to eat the mouse." },
      { id: "b", text: "The mouse told the lion he might help him one day." },
      { id: "c", text: "The lion was feeling happy to see the mouse." },
      { id: "d", text: "The lion heard someone coming and got scared." },
      { id: "e", text: "The lion was amused at the mouse's words and felt kind." }
    ],
    correctAnswerId: "e",
    explanation: "Pada paragraf ke-5 tertulis: 'The lion laughed loudly... But the lion was feeling kind, so he let the mouse go free.' Artinya singa terhibur oleh ucapan tikus dan merasa berbelas kasih."
  },
  {
    id: "en_4", subject: "Bahasa Inggris",
    passage: "The Lion and the Mouse\n\n(See previous passage)",
    text: "As you read the part where the lion let the mouse go, which of the following endings do you anticipate?",
    options: [
      { id: "a", text: "The mouse will forget his promise." },
      { id: "b", text: "The lion will hunt the mouse later." },
      { id: "c", text: "The mouse will keep his promise and help the lion." },
      { id: "d", text: "The lion will become the king of the jungle." },
      { id: "e", text: "The mouse will bring food for the lion." }
    ],
    correctAnswerId: "c",
    explanation: "Dalam struktur fabel klasik, janji tokoh yang diampuni ('I promise I'll help you one day') merupakan foreshadowing bahwa tikus akan menepati janjinya di akhir cerita."
  },
  {
    id: "en_5", subject: "Bahasa Inggris",
    passage: "The Lion and the Mouse\n\n(See previous passage)",
    text: "Which of the following sentences from the story help you understand the lion's character?",
    options: [
      { id: "a", text: "\"The mouse saw the lion's thick mane and was curious.\"" },
      { id: "b", text: "\"He climbed up and began to jump around on the lion's head.\"" },
      { id: "c", text: "\"But the lion was feeling kind, so he let the mouse go free.\"" },
      { id: "d", text: "\"A few days later, the lion was walking through the jungle again.\"" },
      { id: "e", text: "\"The lion roared loudly, hoping someone would come.\"" }
    ],
    correctAnswerId: "c",
    explanation: "Kalimat 'But the lion was feeling kind, so he let the mouse go free' secara langsung menunjukkan sifat pemaaf dan baik hati dari karakter singa."
  },

  // Passage 2: Effective Study Techniques (Questions 6-10)
  {
    id: "en_6", subject: "Bahasa Inggris",
    imageUrl: "/pdf_images/pdf1_page1_img0.png",
    passage: "Effective Study Techniques\n\n1. Know Your Learning Style: Understand whether you learn best by reading, listening, or watching.\n2. Set a Consistent Study Schedule: Study at the same time every day. Regularity helps build strong habits.\n3. Create a Comfortable Study Space: Find a quiet, well-lit, and distraction-free area. Have all your materials ready.\n4. Use the Pomodoro Technique: Study for 25 minutes, then take a 5-minute break. This keeps your mind fresh and focused.\n5. Take Effective Notes: Write key points using methods like mind maps or tables to help remember important information.\n6. Practice and Repeat: Regularly review your material and do practice questions to deepen understanding.\n7. Join a Study Group: Discuss topics with friends to gain new insights and solve problems together.\n8. Leverage Technology: Use apps and websites for flashcards, video lessons, and online quizzes to support your routine.\n9. Get Enough Sleep: Aim for 7-8 hours.\n10. Be Patient and Persistent: Learning takes time.",
    text: "Based on the information given, we can keep our mind focused and fresh by ....",
    options: [
      { id: "a", text: "knowing your learning style" },
      { id: "b", text: "using Pomodoro Technique" },
      { id: "c", text: "using online quizzes apps" },
      { id: "d", text: "by reviewing materials" },
      { id: "e", text: "by creating mind maps" }
    ],
    correctAnswerId: "b",
    explanation: "Poin ke-4 secara eksplisit menyatakan: 'Use the Pomodoro Technique: Study for 25 minutes, then take a 5-minute break. This keeps your mind fresh and focused.'"
  },
  {
    id: "en_7", subject: "Bahasa Inggris",
    imageUrl: "/pdf_images/pdf1_page1_img0.png",
    passage: "Effective Study Techniques\n\n(See previous passage)",
    text: "Which of the following best categorizes 'Set a Consistent Study Schedule'?",
    options: [
      { id: "a", text: "Self Management" },
      { id: "b", text: "Time Management" },
      { id: "c", text: "Resource Management" },
      { id: "d", text: "Technology Use" },
      { id: "e", text: "Physical Environment" }
    ],
    correctAnswerId: "b",
    explanation: "Mengatur jadwal belajar pada waktu yang konsisten setiap hari merupakan inti dari manajemen waktu (Time Management)."
  },
  {
    id: "en_8", subject: "Bahasa Inggris",
    imageUrl: "/pdf_images/pdf1_page1_img0.png",
    passage: "Effective Study Techniques\n\n(See previous passage)",
    text: "Which of the following statements best reflect the author's purpose in writing the text?",
    options: [
      { id: "a", text: "To entertain students with stories of successful studying." },
      { id: "b", text: "To persuade schools to adopt the Pomodoro Technique." },
      { id: "c", text: "To provide practical tips on how to study effectively." },
      { id: "d", text: "To argue that technology is the only way to learn." },
      { id: "e", text: "To describe the scientific mechanism of the human brain." }
    ],
    correctAnswerId: "c",
    explanation: "Teks berbentuk daftar instruksional 10 langkah yang bertujuan memberikan panduan praktis agar siswa dapat belajar secara efektif."
  },
  {
    id: "en_9", subject: "Bahasa Inggris",
    imageUrl: "/pdf_images/pdf1_page1_img0.png",
    passage: "Effective Study Techniques\n\n(See previous passage)",
    text: "If you are preparing for an important exam and want to improve your study routine, which of the following techniques helps you build strong habits?",
    options: [
      { id: "a", text: "Joining a Study Group" },
      { id: "b", text: "Setting a Consistent Study Schedule" },
      { id: "c", text: "Using flashcards apps" },
      { id: "d", text: "Getting 7-8 hours of sleep" },
      { id: "e", text: "Taking effective notes" }
    ],
    correctAnswerId: "b",
    explanation: "Pada poin ke-2 disebutkan: 'Set a Consistent Study Schedule: Study at the same time every day. Regularity helps build strong habits.'"
  },
  {
    id: "en_10", subject: "Bahasa Inggris",
    imageUrl: "/pdf_images/pdf1_page1_img0.png",
    passage: "Effective Study Techniques\n\n(See previous passage)",
    text: "According to the text, what is the main benefit of joining a study group?",
    options: [
      { id: "a", text: "To share personal stories." },
      { id: "b", text: "To gain new insights and solve problems together." },
      { id: "c", text: "To borrow notes from friends." },
      { id: "d", text: "To complain about difficult teachers." },
      { id: "e", text: "To compete for the highest grades." }
    ],
    correctAnswerId: "b",
    explanation: "Poin ke-7 menyebutkan: 'Join a Study Group: Discuss topics with friends to gain new insights and solve problems together.'"
  },

  // Passage 3: The False Lion King (Questions 11-15)
  {
    id: "en_11", subject: "Bahasa Inggris",
    passage: "The False Lion King\n\nOnce upon a time, in Africa, there lived two lion kings. One was named Hera and the other was Shero. Hera was very strong and handsome. He had a loud roar that could be heard for miles. All the animals respected him. Shero, on the other hand, was not as strong. He liked to pretend he was as powerful as Hera, but he was actually quite clumsy and often made silly mistakes.\nOne day, the animals heard that some hyenas were causing trouble near the river. Hera decided to go and chase them away. Shero also wanted to come. He wanted to show everyone that he was strong too.\nWhen they reached the river, Hera roared loudly. His roar was so powerful that the hyenas got scared. Shero also tried to roar, but his voice was high and silly. The hyenas laughed at him. They weren't scared of Shero at all.\nHera stayed calm and smiled. He stepped forward and chased the hyenas away himself. At the end of the day, the hyenas left, still laughing about Shero.\nHera told Shero, \"You are not like me, but you make everyone happy with your jokes.\" From that day, Shero became the kingdom's jester. He and Hera ruled together — one with strength, and one with laughter.",
    text: "Which statement provides the most accurate chronological summary of the story's main events?",
    options: [
      { id: "a", text: "Shero chased the hyenas, Hera laughed at him, and they became kings together." },
      { id: "b", text: "Hyenas caused trouble, Hera roared to scare them, Shero tried but failed, and they ruled together using their unique strengths." },
      { id: "c", text: "Hera and Shero fought over the kingdom, the hyenas attacked, and Shero saved the day." },
      { id: "d", text: "Shero made silly mistakes, the animals laughed at him, and Hera banished him from the kingdom." },
      { id: "e", text: "The hyenas respected Shero's roar, but Hera was jealous and chased them away himself." }
    ],
    correctAnswerId: "b",
    explanation: "Urutan peristiwa yang benar adalah: kawanan hyena membuat ulah di sungai -> Hera mengaum keras -> Shero mencoba mengaum tetapi ditertawakan -> Hera mengusir hyena -> keduanya memimpin bersama sesuai keunikan masing-masing."
  },
  {
    id: "en_12", subject: "Bahasa Inggris",
    passage: "The False Lion King\n\n(See previous passage)",
    text: "What can we learn from the story of Hera and Shero?",
    options: [
      { id: "a", text: "Everyone has something special to give, even if they are not the leader." },
      { id: "b", text: "Being funny and making others smile is a sign of weakness." },
      { id: "c", text: "Good friends will always compete with you." },
      { id: "d", text: "Working together is impossible when people have different talents." },
      { id: "e", text: "Only the strongest can rule a kingdom." }
    ],
    correctAnswerId: "a",
    explanation: "Cerita ini mengajarkan bahwa setiap individu punya keunikan dan peran berharga (Hera dengan kekuatan, Shero dengan humor/kebahagiaan)."
  },
  {
    id: "en_13", subject: "Bahasa Inggris",
    passage: "The False Lion King\n\n(See previous passage)",
    text: "The hyenas laugh so much when Shero tries to roar like Hera because ....",
    options: [
      { id: "a", text: "Shero's roar was as loud as Hera's." },
      { id: "b", text: "Shero told them a very funny joke." },
      { id: "c", text: "Shero's voice was high and silly instead of scary." },
      { id: "d", text: "Hera asked the hyenas to laugh at Shero." },
      { id: "e", text: "The hyenas were not afraid of lions anymore." }
    ],
    correctAnswerId: "c",
    explanation: "Paragraf ke-3 menjelaskan: 'Shero also tried to roar, but his voice was high and silly. The hyenas laughed at him.'"
  },
  {
    id: "en_14", subject: "Bahasa Inggris",
    passage: "The False Lion King\n\n(See previous passage)",
    text: "If in the beginning of the story, Shero is a strong lion with a loud roar, just like Hera. What would most likely happen at the river?",
    options: [
      { id: "a", text: "The hyenas would laugh at both of them." },
      { id: "b", text: "Both lions would scare the hyenas away easily." },
      { id: "c", text: "Shero would become the jester of the kingdom." },
      { id: "d", text: "Hera would run away from the hyenas." },
      { id: "e", text: "The hyenas would attack them because they are not scared." }
    ],
    correctAnswerId: "b",
    explanation: "Jika Shero sama kuatnya dan memiliki auman menggelegar seperti Hera, maka kedua singa tersebut akan langsung membuat para hyena ketakutan dan kabur."
  },
  {
    id: "en_15", subject: "Bahasa Inggris",
    passage: "The False Lion King\n\n(See previous passage)",
    text: "Shero is clumsy and funny, this is shown when he ....",
    options: [
      { id: "a", text: "roared powerfully at the river." },
      { id: "b", text: "chased the hyenas away." },
      { id: "c", text: "tried to roar but made a high and silly sound." },
      { id: "d", text: "stayed calm and smiled at the hyenas." },
      { id: "e", text: "refused to go with Hera to the river." }
    ],
    correctAnswerId: "c",
    explanation: "Sifat konyol Shero tampak jelas ketika ia berusaha mengaum garang namun justru mengeluarkan suara melengking yang lucu."
  },

  // Passage 4: The Great Barrier Reef (Questions 16-20)
  {
    id: "en_16", subject: "Bahasa Inggris",
    passage: "The Great Barrier Reef\n\nThe Great Barrier Reef is the largest coral reef system in the world, located off the coast of Australia. It is made up of thousands of individual reefs and islands, stretching over 2,300 kilometers. The reef is home to an incredible variety of marine life, including colorful fish, sea turtles, sharks, and dolphins.\nBecause of its bright colors and clear waters, it is a popular destination for divers and snorkelers. It feels like a different world under the sea, full of moving shapes and vibrant colors.\nHowever, the Great Barrier Reef is facing serious threats. Climate change is causing the ocean's water to get warmer, which leads to coral bleaching. When corals bleach, they lose their bright colors and turn white, often dying if the water doesn't cool down. Pollution from rivers and plastic waste also damages the fragile ecosystem.\nMany scientists and environmental groups are working hard to protect the reef. They are trying to reduce pollution, study the corals, and find ways to help them survive warmer temperatures. Saving the Great Barrier Reef is important not just for Australia, but for the whole world, as it is a vital part of the ocean's health.",
    text: "Which of the following descriptions are mentioned clearly in the text?",
    options: [
      { id: "a", text: "The Great Barrier Reef stretches over 3,200 kilometers." },
      { id: "b", text: "It is located off the coast of New Zealand." },
      { id: "c", text: "It is home to colorful fish, sea turtles, sharks, and dolphins." },
      { id: "d", text: "Coral bleaching is caused by freezing ocean temperatures." },
      { id: "e", text: "Pollution has completely destroyed the ecosystem." }
    ],
    correctAnswerId: "c",
    explanation: "Kalimat terakhir paragraf pertama menyebutkan secara persis: 'The reef is home to an incredible variety of marine life, including colorful fish, sea turtles, sharks, and dolphins.'"
  },
  {
    id: "en_17", subject: "Bahasa Inggris",
    passage: "The Great Barrier Reef\n\n(See previous passage)",
    text: "The author mentioned 'It feels like a different world under the sea'. What does the phrase 'a different world under the sea' most likely mean?",
    options: [
      { id: "a", text: "The underwater environment is extremely dangerous and hostile." },
      { id: "b", text: "The sea is full of alien creatures from other planets." },
      { id: "c", text: "The underwater scenery is uniquely beautiful, vibrant, and surreal." },
      { id: "d", text: "Humans cannot survive under the sea without special equipment." },
      { id: "e", text: "The underwater world is completely dark and silent." }
    ],
    correctAnswerId: "c",
    explanation: "Ungkapan 'a different world under the sea, full of moving shapes and vibrant colors' menggambarkan keindahan bawah laut yang luar biasa, penuh warna, dan terasa magis/berbeda dari daratan."
  },
  {
    id: "en_18", subject: "Bahasa Inggris",
    passage: "The Great Barrier Reef\n\n(See previous passage)",
    text: "Which of the following best represents the main idea implied by the text?",
    options: [
      { id: "a", text: "The Great Barrier Reef is a popular tourist spot that generates a lot of money." },
      { id: "b", text: "Climate change is a myth because scientists are still studying the corals." },
      { id: "c", text: "The Great Barrier Reef is a magnificent but fragile ecosystem that urgently needs protection." },
      { id: "d", text: "Australia is the only country responsible for the ocean's health." },
      { id: "e", text: "Coral bleaching makes the reef look more beautiful." }
    ],
    correctAnswerId: "c",
    explanation: "Keseluruhan teks memaparkan keindahan dan keanekaragaman hayati Great Barrier Reef sekaligus ancaman pemutihan karang dan polusi yang mengharuskan upaya pelestarian segera."
  },
  {
    id: "en_19", subject: "Bahasa Inggris",
    passage: "The Great Barrier Reef\n\n(See previous passage)",
    text: "Which detail would best encourage people to visit the Great Barrier Reef?",
    options: [
      { id: "a", text: "Climate change is causing the ocean's water to get warmer." },
      { id: "b", text: "Pollution from rivers and plastic waste damages the ecosystem." },
      { id: "c", text: "When corals bleach, they lose their bright colors and turn white." },
      { id: "d", text: "It is full of bright colors, clear waters, and an incredible variety of marine life." },
      { id: "e", text: "Scientists are trying to find ways to help corals survive." }
    ],
    correctAnswerId: "d",
    explanation: "Daya tarik wisata utama bagi penyelam adalah air yang jernih, warna terumbu karang yang cerah, dan keanekaragaman biota lautnya."
  },
  {
    id: "en_20", subject: "Bahasa Inggris",
    passage: "The Great Barrier Reef\n\n(See previous passage)",
    text: "Which parts of the text best support the idea that the Great Barrier Reef is both beautiful and important?",
    options: [
      { id: "a", text: "It stretches over 2,300 kilometers and faces serious threats." },
      { id: "b", text: "It has vibrant colors and is a vital part of the ocean's health." },
      { id: "c", text: "Corals turn white and pollution damages the ecosystem." },
      { id: "d", text: "Scientists are studying corals and it is located in Australia." },
      { id: "e", text: "It is a popular destination and plastic waste is a problem." }
    ],
    correctAnswerId: "b",
    explanation: "Frasa 'vibrant colors' mewakili aspek keindahan (beautiful) dan 'vital part of the ocean's health' mewakili aspek pentingnya (important)."
  },

  // Passage 5: Why Teenagers Should Learn to Manage Their Money (Questions 21-25)
  {
    id: "en_21", subject: "Bahasa Inggris",
    passage: "Why Teenagers Should Learn to Manage Their Money\n\nManaging money is one of the most important skills a teenager can learn. While many teens rely on their parents for allowances or daily needs, understanding how to budget, save, and spend wisely can set them up for a successful future.\nFirst, learning to manage money teaches responsibility. When teens get an allowance or earn money from a part-time job, they have to make choices. If they spend all their money on clothes or video games right away, they won't have anything left for hanging out with friends later in the month. This helps them understand the difference between 'needs' and 'wants.'\nSecond, it builds a habit of saving. Teenagers who learn to put aside a little money regularly will find it easier to save for big goals later, like a car or college. Saving also provides a safety net for unexpected expenses.\nFinally, understanding money helps prevent debt. If teens learn how to use credit cards properly and understand interest rates now, they are less likely to fall into serious debt when they become adults.\nIn conclusion, financial education should start early. Teenagers who know how to manage their money are better prepared to face the real world with confidence and independence.",
    text: "What is the primary purpose of the text?",
    options: [
      { id: "a", text: "To persuade teenagers to get a part-time job." },
      { id: "b", text: "To argue that parents should stop giving allowances to their teenagers." },
      { id: "c", text: "To explain the importance and benefits of financial management for teenagers." },
      { id: "d", text: "To warn teenagers about the dangers of buying video games." },
      { id: "e", text: "To advertise a new credit card for young adults." }
    ],
    correctAnswerId: "c",
    explanation: "Teks eksposisi analitis ini bertujuan menjelaskan pentingnya literasi finansial dan manfaat mengelola uang bagi remaja."
  },
  {
    id: "en_22", subject: "Bahasa Inggris",
    passage: "Why Teenagers Should Learn to Manage Their Money\n\n(See previous passage)",
    text: "According to the text, what happens if a teenager spends all their money right away?",
    options: [
      { id: "a", text: "They will immediately fall into serious debt." },
      { id: "b", text: "Their parents will give them more money." },
      { id: "c", text: "They won't have anything left for other activities later." },
      { id: "d", text: "They will be able to buy a car sooner." },
      { id: "e", text: "They will learn how to use a credit card properly." }
    ],
    correctAnswerId: "c",
    explanation: "Paragraf kedua menyebutkan: 'If they spend all their money on clothes or video games right away, they won't have anything left for hanging out with friends later in the month.'"
  },
  {
    id: "en_23", subject: "Bahasa Inggris",
    passage: "Why Teenagers Should Learn to Manage Their Money\n\n(See previous passage)",
    text: "Which of the following is NOT mentioned as a benefit of learning to manage money?",
    options: [
      { id: "a", text: "It teaches responsibility." },
      { id: "b", text: "It builds a habit of saving." },
      { id: "c", text: "It helps prevent debt." },
      { id: "d", text: "It guarantees a high-paying job in the future." },
      { id: "e", text: "It helps distinguish between needs and wants." }
    ],
    correctAnswerId: "d",
    explanation: "Teks menyebutkan tanggung jawab, kebiasaan menabung, mencegah utang, serta membedakan kebutuhan dan keinginan. Teks tidak pernah menjamin pekerjaan bergaji tinggi."
  },
  {
    id: "en_24", subject: "Bahasa Inggris",
    passage: "Why Teenagers Should Learn to Manage Their Money\n\n(See previous passage)",
    text: "Based on paragraph 3, saving money provides a safety net for ....",
    options: [
      { id: "a", text: "buying video games" },
      { id: "b", text: "unexpected expenses" },
      { id: "c", text: "paying off credit card debt" },
      { id: "d", text: "getting a part-time job" },
      { id: "e", text: "understanding interest rates" }
    ],
    correctAnswerId: "b",
    explanation: "Kalimat terakhir paragraf ke-3 menyatakan: 'Saving also provides a safety net for unexpected expenses.'"
  },
  {
    id: "en_25", subject: "Bahasa Inggris",
    passage: "Why Teenagers Should Learn to Manage Their Money\n\n(See previous passage)",
    text: "What does the author conclude about financial education?",
    options: [
      { id: "a", text: "It should only be taught in college." },
      { id: "b", text: "It is the sole responsibility of the parents." },
      { id: "c", text: "It should start early so teens are prepared for the real world." },
      { id: "d", text: "It makes teenagers overly anxious about money." },
      { id: "e", text: "It is unnecessary if teens have wealthy parents." }
    ],
    correctAnswerId: "c",
    explanation: "Pada paragraf penutup teks, penulis menekankan pentingnya pendidikan keuangan sedini mungkin bagi remaja agar mereka memiliki kesiapan menghadapi tantangan dunia nyata."
  },

  // =========================================================================
  // SUBTES 2: PENALARAN UMUM (PU) — 6 Soal
  // =========================================================================
  {
    id: "pu_1",
    subject: "Penalaran Umum (PU)",
    text: "Semua peserta ujian yang lulus dengan predikat memuaskan belajar secara teratur setiap hari. Sebagian peserta ujian yang memiliki mentor belajar secara teratur setiap hari. Kesimpulan yang paling tepat adalah ....",
    options: [
      { id: "a", text: "Semua peserta yang memiliki mentor lulus dengan predikat memuaskan." },
      { id: "b", text: "Sebagian peserta yang memiliki mentor lulus dengan predikat memuaskan." },
      { id: "c", text: "Peserta yang tidak memiliki mentor pasti tidak lulus ujian." },
      { id: "d", text: "Semua peserta yang belajar teratur setiap hari memiliki mentor." },
      { id: "e", text: "Sebagian peserta ujian yang belajar secara teratur setiap hari memiliki mentor." }
    ],
    correctAnswerId: "e",
    explanation: "Premis 2 menyatakan 'Sebagian peserta ujian yang memiliki mentor belajar secara teratur setiap hari'. Konversi logis yang ekuivalen dari proposisi partikular afirmatif (Sebagian A adalah B) adalah 'Sebagian B adalah A', yakni sebagian peserta yang belajar teratur setiap hari memiliki mentor."
  },
  {
    id: "pu_2",
    subject: "Penalaran Umum (PU)",
    text: "Perhatikan pola barisan bilangan berikut:\n3, 5, 9, 17, 33, X\nNilai X yang memenuhi pola tersebut adalah ....",
    options: [
      { id: "a", text: "49" },
      { id: "b", text: "65" },
      { id: "c", text: "67" },
      { id: "d", text: "71" },
      { id: "e", text: "81" }
    ],
    correctAnswerId: "b",
    explanation: "Selisih antarsuku berturut-turut adalah:\n5 - 3 = 2\n9 - 5 = 4\n17 - 9 = 8\n33 - 17 = 16\nPola selisih berlipat ganda (2, 4, 8, 16, 32).\nMaka X = 33 + 32 = 65."
  },
  {
    id: "pu_3",
    subject: "Penalaran Umum (PU)",
    text: "KAMERA : FOTO = PENA : ....",
    options: [
      { id: "a", text: "Tinta" },
      { id: "b", text: "Kertas" },
      { id: "c", text: "Tulisan" },
      { id: "d", text: "Penulis" },
      { id: "e", text: "Buku" }
    ],
    correctAnswerId: "c",
    explanation: "Hubungan analogi alat dan hasil langsungnya: Kamera digunakan untuk menghasilkan Foto, sedangkan Pena digunakan untuk menghasilkan Tulisan."
  },
  {
    id: "pu_4",
    subject: "Penalaran Umum (PU)",
    text: "Jika hujan turun deras selama lebih dari dua jam, maka debit air sungai meningkat tajam. Jika debit air sungai meningkat tajam, maka pintu air utama dibuka penuh. Hari ini pintu air utama TIDAK dibuka penuh. Simpulan yang sah adalah ....",
    options: [
      { id: "a", text: "Hari ini hujan turun rintik-rintik." },
      { id: "b", text: "Hari ini hujan tidak turun deras selama lebih dari dua jam." },
      { id: "c", text: "Debit air sungai meningkat tajam tetapi pintu air rusak." },
      { id: "d", text: "Petugas lupa membuka pintu air utama." },
      { id: "e", text: "Hujan turun deras tepat dua jam." }
    ],
    correctAnswerId: "b",
    explanation: "Dengan Silogisme (P -> Q, Q -> R maka P -> R) dan Modus Tollens (~R maka ~P): karena pintu air utama tidak dibuka penuh (~R), maka hujan tidak turun deras selama lebih dari dua jam (~P)."
  },
  {
    id: "pu_5",
    subject: "Penalaran Umum (PU)",
    text: "Lima siswa (Aldi, Bela, Citra, Dodi, dan Eka) duduk berderet dalam satu baris kursi dari kiri ke kanan.\n• Aldi duduk tepat di sebelah kiri Citra.\n• Dodi duduk di salah satu ujung baris.\n• Bela duduk di antara Citra dan Eka.\nJika Dodi duduk di ujung paling kiri, siapakah yang duduk tepat di tengah barisan?",
    options: [
      { id: "a", text: "Aldi" },
      { id: "b", text: "Bela" },
      { id: "c", text: "Citra" },
      { id: "d", text: "Dodi" },
      { id: "e", text: "Eka" }
    ],
    correctAnswerId: "c",
    explanation: "Posisi 1 (ujung kiri) = Dodi. Karena Aldi tepat di kiri Citra dan Bela di antara Citra dan Eka, maka urutan dari kiri ke kanan (1 s.d. 5) adalah: 1. Dodi, 2. Aldi, 3. Citra, 4. Bela, 5. Eka. Jadi yang duduk tepat di tengah (posisi ke-3) adalah Citra."
  },
  {
    id: "pu_6",
    subject: "Penalaran Umum (PU)",
    text: "Data Kementerian Pendidikan menunjukkan bahwa sekolah yang menerapkan perpustakaan digital interaktif mengalami peningkatan rata-rata minat baca siswa sebesar 38% dalam satu semester. Kepala Sekolah SMA Nusantara berencana meluncurkan perpustakaan digital interaktif bulan depan.\nManakah pernyataan yang PALING MEMPERKUAT rencana Kepala Sekolah tersebut?",
    options: [
      { id: "a", text: "Sebagian siswa SMA Nusantara lebih suka bermain gim daripada membaca buku cetak." },
      { id: "b", text: "Seluruh siswa SMA Nusantara telah memiliki perangkat gawai dan akses Wi-Fi sekolah yang memadai." },
      { id: "c", text: "Biaya langganan e-book tahunan lebih murah dibandingkan membeli buku fisik." },
      { id: "d", text: "Sekolah lain di kabupaten yang sama belum memiliki perpustakaan digital." },
      { id: "e", text: "Guru Bahasa Indonesia mewajibkan siswa merangkum satu buku setiap bulan." }
    ],
    correctAnswerId: "b",
    explanation: "Ketersediaan perangkat dan jaringan Wi-Fi yang memadai bagi seluruh siswa memastikan perpustakaan digital interaktif benar-benar dapat diakses secara optimal sehingga efek peningkatan minat baca dapat tercapai."
  },

  // =========================================================================
  // SUBTES 3: PENGETAHUAN KUANTITATIF (PK) — 6 Soal
  // =========================================================================
  {
    id: "pk_1",
    subject: "Pengetahuan Kuantitatif (PK)",
    text: "Jika x + 1/x = 4, maka nilai dari x² + 1/x² adalah ....",
    options: [
      { id: "a", text: "12" },
      { id: "b", text: "14" },
      { id: "c", text: "16" },
      { id: "d", text: "18" },
      { id: "e", text: "20" }
    ],
    correctAnswerId: "b",
    explanation: "Kuadratkan kedua ruas persamaan:\n(x + 1/x)² = 4²\nx² + 2(x)(1/x) + 1/x² = 16\nx² + 2 + 1/x² = 16\nx² + 1/x² = 16 - 2 = 14."
  },
  {
    id: "pk_2",
    subject: "Pengetahuan Kuantitatif (PK)",
    text: "Sebuah segitiga siku-siku memiliki panjang sisi miring (hipotenusa) 25 cm. Jika salah satu sisi tegaknya memiliki panjang 7 cm, berapakah luas segitiga tersebut?",
    options: [
      { id: "a", text: "84 cm²" },
      { id: "b", text: "96 cm²" },
      { id: "c", text: "168 cm²" },
      { id: "d", text: "175 cm²" },
      { id: "e", text: "300 cm²" }
    ],
    correctAnswerId: "a",
    explanation: "Berdasarkan teorema Pythagoras:\nSisi tegak kedua = √(25² - 7²) = √(625 - 49) = √576 = 24 cm.\nLuas segitiga = 1/2 × alas × tinggi = 1/2 × 7 × 24 = 84 cm²."
  },
  {
    id: "pk_3",
    subject: "Pengetahuan Kuantitatif (PK)",
    text: "Diketahui fungsi f(x) = 3x - 5 dan g(x) = x² + 2. Nilai dari komposisi fungsi (g ∘ f)(2) adalah ....",
    options: [
      { id: "a", text: "1" },
      { id: "b", text: "3" },
      { id: "c", text: "6" },
      { id: "d", text: "11" },
      { id: "e", text: "13" }
    ],
    correctAnswerId: "b",
    explanation: "Hitung f(2) terlebih dahulu:\nf(2) = 3(2) - 5 = 6 - 5 = 1.\nSubstitusikan ke fungsi g:\n(g ∘ f)(2) = g(f(2)) = g(1) = 1² + 2 = 3."
  },
  {
    id: "pk_4",
    subject: "Pengetahuan Kuantitatif (PK)",
    text: "Rata-rata nilai ujian matematika dari 8 siswa adalah 75. Ketika nilai dari 2 siswa baru digabungkan, rata-rata keseluruhan menjadi 78. Berapakah rata-rata nilai dari kedua siswa baru tersebut?",
    options: [
      { id: "a", text: "85" },
      { id: "b", text: "88" },
      { id: "c", text: "90" },
      { id: "d", text: "92" },
      { id: "e", text: "95" }
    ],
    correctAnswerId: "c",
    explanation: "Total nilai 8 siswa awal = 8 × 75 = 600.\nTotal nilai 10 siswa = 10 × 78 = 780.\nJumlah nilai 2 siswa baru = 780 - 600 = 180.\nRata-rata kedua siswa baru = 180 / 2 = 90."
  },
  {
    id: "pk_5",
    subject: "Pengetahuan Kuantitatif (PK)",
    text: "Jika 2^(x+1) + 2^(x-1) = 20, maka nilai dari x adalah ....",
    options: [
      { id: "a", text: "2" },
      { id: "b", text: "3" },
      { id: "c", text: "4" },
      { id: "d", text: "5" },
      { id: "e", text: "6" }
    ],
    correctAnswerId: "b",
    explanation: "Ubah bentuk eksponen:\n2^x · 2^1 + 2^x · 2^(-1) = 20\n2^x (2 + 1/2) = 20\n2^x (5/2) = 20\n2^x = 20 × (2/5) = 8 = 2^3.\nMaka x = 3."
  },
  {
    id: "pk_6",
    subject: "Pengetahuan Kuantitatif (PK)",
    text: "Dalam sebuah kotak terdapat 5 bola merah dan 3 bola biru. Jika diambil 2 bola sekaligus secara acak, berapakah peluang terambilnya 1 bola merah dan 1 bola biru?",
    options: [
      { id: "a", text: "15/28" },
      { id: "b", text: "15/56" },
      { id: "c", text: "10/28" },
      { id: "d", text: "3/14" },
      { id: "e", text: "5/14" }
    ],
    correctAnswerId: "a",
    explanation: "Total bola = 8. Banyak cara mengambil 2 bola dari 8: C(8,2) = (8 × 7)/2 = 28.\nBanyak cara mengambil 1 merah dari 5 dan 1 biru dari 3: C(5,1) × C(3,1) = 5 × 3 = 15.\nJadi peluangnya adalah 15/28."
  },

  // =========================================================================
  // SUBTES 4: LITERASI BAHASA INDONESIA — 5 Soal
  // =========================================================================
  {
    id: "lit_id_1",
    subject: "Literasi Bahasa Indonesia",
    passage: "Transisi energi menuju energi baru dan terbarukan (EBT) kini menjadi keniscayaan global demi menekan laju emisi gas rumah kaca. Indonesia memiliki potensi luar biasa dari tenaga surya, bayu, hidro, dan panas bumi. Kendati demikian, tantangan terbesar terletak pada tingginya biaya investasi awal serta integrasi jaringan transmisi listrik kepulauan yang belum merata. Dibutuhkan regulasi yang adaptif dan kepastian iklim investasi untuk mendorong partisipasi sektor privat.",
    text: "Gagasan pokok paragraf di atas adalah ....",
    options: [
      { id: "a", text: "Penurunan emisi gas rumah kaca di Indonesia." },
      { id: "b", text: "Besarnya potensi energi surya dan panas bumi di Indonesia." },
      { id: "c", text: "Urgensi, potensi, dan tantangan transisi energi baru terbarukan di Indonesia." },
      { id: "d", text: "Biaya investasi infrastruktur kelistrikan kepulauan." },
      { id: "e", text: "Peran sektor swasta dalam pengembangan pembangkit listrik." }
    ],
    correctAnswerId: "c",
    explanation: "Paragraf tersebut membahas mengapa transisi EBT merupakan keniscayaan (urgensi), potensi alam Indonesia, sekaligus memaparkan kendala investasi dan jaringan (tantangan) yang dihadapi."
  },
  {
    id: "lit_id_2",
    subject: "Literasi Bahasa Indonesia",
    passage: "Kecerdasan buatan (Artificial Intelligence/AI) generatif telah mengubah lanskap pendidikan tinggi secara drastis dalam tiga tahun terakhir. Di satu sisi, teknologi ini memungkinkan personalisasi materi pembelajaran dan mempercepat riset literatur. Di sisi lain, ketergantungan berlebih tanpa verifikasi kritis berisiko menumpulkan kemampuan analisis mahasiswa serta memicu halusinasi informasi ilmiah. Oleh sebab itu, perguruan tinggi tidak seharusnya melarang penggunaan AI secara total, melainkan menyusun pedoman etika akademik yang mengintegrasikan literasi AI ke dalam kurikulum.",
    text: "Sikap penulis terhadap penggunaan kecerdasan buatan (AI) di pendidikan tinggi adalah ....",
    options: [
      { id: "a", text: "Menolak tegas karena merusak daya kritis mahasiswa." },
      { id: "b", text: "Mendukung penuh tanpa syarat demi efisiensi riset." },
      { id: "c", text: "Kritis dan solutif dengan mendorong regulasi etika serta integrasi kurikulum." },
      { id: "d", text: "Apatis karena teknologi tidak dapat dibendung." },
      { id: "e", text: "Pesimistis terhadap masa depan integritas akademik kampus." }
    ],
    correctAnswerId: "c",
    explanation: "Penulis menimbang manfaat dan risiko secara objektif (kritis), lalu memberikan jalan keluar berupa penyusunan pedoman etika akademik dan integrasi literasi AI (solutif)."
  },
  {
    id: "lit_id_3",
    subject: "Literasi Bahasa Indonesia",
    passage: "Stunting atau tengkes bukan sekadar persoalan tinggi badan anak yang berada di bawah standar kurva pertumbuhan WHO, melainkan indikator defisiensi nutrisi kronis sejak seribu hari pertama kehidupan (1.000 HPK). Dampaknya menjalar hingga perkembangan kognitif otak, kerentanan terhadap penyakit metabolik saat dewasa, serta penurunan produktivitas ekonomi nasional. Intervensi spesifik seperti pemberian protein hewani harus berjalan beriringan dengan intervensi sensitif seperti penyediaan air bersih dan sanitasi layak.",
    text: "Pernyataan manakah yang TIDAK SESUAI dengan isi bacaan di atas?",
    options: [
      { id: "a", text: "Stunting berkaitan erat dengan kekurangan gizi kronis pada 1.000 hari pertama kehidupan." },
      { id: "b", text: "Dampak stunting hanya terbatas pada pertumbuhan fisik tinggi badan anak semata." },
      { id: "c", text: "Pemberian protein hewani termasuk bentuk intervensi spesifik." },
      { id: "d", text: "Penyediaan sanitasi dan air bersih merupakan bagian dari intervensi sensitif." },
      { id: "e", text: "Stunting dapat berdampak pada penurunan produktivitas ekonomi di masa depan." }
    ],
    correctAnswerId: "b",
    explanation: "Kalimat pertama dan kedua secara tegas menyatakan bahwa stunting BUKAN sekadar persoalan tinggi badan, melainkan berdampak hingga perkembangan kognitif otak dan penyakit metabolik."
  },
  {
    id: "lit_id_4",
    subject: "Literasi Bahasa Indonesia",
    passage: "Ekosistem mangrove di pesisir nusantara memiliki kapasitas penyerapan karbon biru (blue carbon) hingga empat kali lipat lebih besar dibandingkan hutan hujan tropis daratan pada luasan yang sama. Selain menjadi benteng alami peredam abrasi dan gelombang pasang, akar-akar bakau menjadi tempat pemijahan (nursery ground) bagi berbagai komoditas perikanan bernilai ekonomi tinggi. Sayangnya, alih fungsi lahan menjadi tambak intensif yang tidak ramah lingkungan masih terus menggerus luasan hutan mangrove kita.",
    text: "Makna istilah 'pemijahan' pada teks tersebut paling dekat dengan ....",
    options: [
      { id: "a", text: "Tempat berlindung dari badai laut" },
      { id: "b", text: "Proses pelepasan telur dan perkembangbiakan biota air" },
      { id: "c", text: "Kawasan penangkapan ikan oleh nelayan tradisional" },
      { id: "d", text: "Penyerapan zat pencemar oleh akar tumbuhan" },
      { id: "e", text: "Perdagangan hasil laut bernilai ekspor" }
    ],
    correctAnswerId: "b",
    explanation: "Dalam biologi perikanan, pemijahan (spawning/nursery ground) merujuk pada proses pengembangbiakan, pelepasan telur, dan pembesaran anakan ikan/udang."
  },
  {
    id: "lit_id_5",
    subject: "Literasi Bahasa Indonesia",
    text: "Manakah di antara kalimat berikut yang merupakan kalimat efektif dan sesuai dengan kaidah ejaan Bahasa Indonesia (EYD Edisi V)?",
    options: [
      { id: "a", text: "Para siswa-siswi diharapkan segera berkumpul di aula utama." },
      { id: "b", text: "Meskipun hujan deras, namun kegiatan gladi bersih TKA tetap berjalan lancar." },
      { id: "c", text: "Pemerintah mengoptimalkan infrastruktur digital guna menunjang pelaksanaan ujian nasional berbasis komputer." },
      { id: "d", text: "Bagi peserta yang terlambat hadir lebih dari lima belas menit tidak diperkenankan masuk ruangan." },
      { id: "e", text: "Sekolah itu dimana tempat kami menimba ilmu selama tiga tahun." }
    ],
    correctAnswerId: "c",
    explanation: "Opsi C memiliki subjek (Pemerintah), predikat (mengoptimalkan), objek (infrastruktur digital), dan keterangan tujuan yang baku. Opsi A pleonasme ('Para siswa-siswi'), B konjungsi ganda ('Meskipun... namun'), D kehilangan subjek akibat preposisi 'Bagi' di awal kalimat, E tidak baku ('dimana tempat')."
  },

  // =========================================================================
  // SUBTES 5: PENALARAN MATEMATIKA (PM) — 5 Soal
  // =========================================================================
  {
    id: "pm_1",
    subject: "Penalaran Matematika",
    text: "Sebuah toko buku memberikan diskon beruntun untuk pembelian paket belajar: Diskon pertama sebesar 20%, kemudian dari harga sisa diberikan diskon tambahan sebesar 10%. Jika harga awal paket adalah Rp 500.000, berapakah harga akhir yang harus dibayar pembeli?",
    options: [
      { id: "a", text: "Rp 350.000" },
      { id: "b", text: "Rp 360.000" },
      { id: "c", text: "Rp 375.000" },
      { id: "d", text: "Rp 380.000" },
      { id: "e", text: "Rp 400.000" }
    ],
    correctAnswerId: "b",
    explanation: "Langkah 1: Diskon 20% dari Rp 500.000 = Rp 100.000. Harga setelah diskon 1 = Rp 400.000.\nLangkah 2: Diskon tambahan 10% dari Rp 400.000 = Rp 40.000.\nHarga akhir = Rp 400.000 - Rp 40.000 = Rp 360.000."
  },
  {
    id: "pm_2",
    subject: "Penalaran Matematika",
    text: "Sebuah tangki air berkapasitas 1.200 liter diisi menggunakan dua keran. Keran A mengalirkan air dengan debit 15 liter/menit, sedangkan Keran B mengalirkan air dengan debit 10 liter/menit. Pada bagian dasar tangki terdapat kebocoran kecil yang mengeluarkan air dengan laju 5 liter/menit. Jika tangki awalnya kosong dan kedua keran dibuka bersamaan, berapa waktu yang dibutuhkan hingga tangki terisi penuh?",
    options: [
      { id: "a", text: "40 menit" },
      { id: "b", text: "48 menit" },
      { id: "c", text: "50 menit" },
      { id: "d", text: "60 menit" },
      { id: "e", text: "80 menit" }
    ],
    correctAnswerId: "d",
    explanation: "Debit bersih (netto) pengisian tangki = Debit A + Debit B - Debit Bocor = 15 + 10 - 5 = 20 liter/menit.\nWaktu hingga penuh = Volume / Debit Bersih = 1.200 / 20 = 60 menit."
  },
  {
    id: "pm_3",
    subject: "Penalaran Matematika",
    text: "Proyek renovasi gedung laboratorium sekolah direncanakan selesai dalam waktu 40 hari oleh 15 orang pekerja. Setelah dikerjakan selama 12 hari, proyek terhenti selama 7 hari akibat cuaca ekstrem. Agar proyek tetap selesai tepat waktu sesuai rencana awal, berapa banyak pekerja tambahan yang harus direkrut?",
    options: [
      { id: "a", text: "3 orang" },
      { id: "b", text: "5 orang" },
      { id: "c", text: "6 orang" },
      { id: "d", text: "8 orang" },
      { id: "e", text: "20 orang" }
    ],
    correctAnswerId: "b",
    explanation: "Sisa beban kerja setelah 12 hari = (40 - 12) hari × 15 pekerja = 28 × 15 = 420 hari-orang.\nSisa waktu efektif setelah terhenti 7 hari = 28 - 7 = 21 hari.\nJumlah pekerja yang dibutuhkan = 420 / 21 = 20 orang.\nMaka pekerja tambahan = 20 - 15 = 5 orang."
  },
  {
    id: "pm_4",
    subject: "Penalaran Matematika",
    text: "Panitia Bazar Sekolah menjual dua jenis tiket masuk: Tiket Reguler seharga Rp 15.000 dan Tiket VIP seharga Rp 25.000. Pada hari pertama terjual total 180 tiket dengan total pendapatan sebesar Rp 3.300.000. Berapakah jumlah Tiket VIP yang terjual pada hari tersebut?",
    options: [
      { id: "a", text: "50 tiket" },
      { id: "b", text: "60 tiket" },
      { id: "c", text: "75 tiket" },
      { id: "d", text: "90 tiket" },
      { id: "e", text: "120 tiket" }
    ],
    correctAnswerId: "b",
    explanation: "Misalkan R = jumlah tiket Reguler dan V = jumlah tiket VIP.\nR + V = 180 -> R = 180 - V.\n15.000R + 25.000V = 3.300.000 (bagi 1.000) -> 15R + 25V = 3.300.\n15(180 - V) + 25V = 3.300\n2.700 - 15V + 25V = 3.300\n10V = 600 -> V = 60 tiket."
  },
  {
    id: "pm_5",
    subject: "Penalaran Matematika",
    text: "Seorang siswa menargetkan rata-rata skor minimal 750 dari 4 kali TryOut TKA untuk lolos ke jurusan impiannya. Pada tiga TryOut pertama, ia memperoleh skor berturut-turut: 710, 735, dan 755. Berapakah skor minimal yang harus ia raih pada TryOut ke-4 agar targetnya tercapai?",
    options: [
      { id: "a", text: "775" },
      { id: "b", text: "785" },
      { id: "c", text: "790" },
      { id: "d", text: "800" },
      { id: "e", text: "815" }
    ],
    correctAnswerId: "d",
    explanation: "Total skor minimal untuk 4 TryOut = 4 × 750 = 3.000.\nJumlah skor 3 TryOut pertama = 710 + 735 + 755 = 2.200.\nSkor minimal TryOut ke-4 = 3.000 - 2.200 = 800."
  }
];
