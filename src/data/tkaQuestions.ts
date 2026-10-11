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
}

export const tkaQuestions: Question[] = [
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
    correctAnswerId: "b"
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
    correctAnswerId: "b"
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
    correctAnswerId: "e"
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
    correctAnswerId: "c"
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
    correctAnswerId: "c"
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
    correctAnswerId: "b"
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
    correctAnswerId: "b"
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
    correctAnswerId: "c"
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
    correctAnswerId: "b"
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
    correctAnswerId: "b"
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
    correctAnswerId: "b"
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
    correctAnswerId: "a"
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
    correctAnswerId: "c"
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
    correctAnswerId: "b"
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
    correctAnswerId: "c"
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
    correctAnswerId: "c"
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
    correctAnswerId: "c"
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
    correctAnswerId: "c"
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
    correctAnswerId: "d"
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
    correctAnswerId: "b"
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
    correctAnswerId: "c"
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
    correctAnswerId: "c"
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
    correctAnswerId: "d"
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
    correctAnswerId: "b"
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
    correctAnswerId: "c"
  }
];
