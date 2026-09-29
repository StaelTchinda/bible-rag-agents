import type { RetrievalEvalExample } from "../../packages/core/eval/rag/evaluation";

export const retrievalExamples: RetrievalEvalExample[] = [
  // JHN.3.16: "For God so loved the world, that he gave his one and only
  // Son, that whoever believes in him should not perish, but have eternal
  // life." 
  // Hard negatives
  // ROM.5.8: "But God commends his own love toward us,
  // in that while we were yet sinners, Christ died for us."
  {
    id: "love-of-god",
    query: "What Bible verse says that God loved the world and gave his Son?",
    relevant: ["JHN.3.16"],
    hardNegatives: ["ROM.5.8"],
    language: "en",
    category: "direct",
    difficulty: "easy",
    answerable: true,
  },
  // PSA.23.1: "Yahweh is my shepherd; I shall lack nothing." 
  // Hard negatives
  // JHN.10.11: "I am the good shepherd. The good shepherd lays down his life
  // for the sheep."
  {
    id: "shepherd-care",
    query: "Which passage describes the Lord as my shepherd who provides what I need?",
    relevant: ["PSA.23.1"],
    hardNegatives: ["JHN.10.11"],
    language: "en",
    category: "direct",
    difficulty: "easy",
    answerable: true,
  },
  // PHP.4.6: "In nothing be anxious, but in everything, by prayer and
  // petition with thanksgiving, let your requests be made known to God."
  // PHP.4.7: "And the peace of God, which surpasses all understanding, will
  // guard your hearts and your thoughts in Christ Jesus." 
  // Hard negatives
  // MAT.6.25: "Therefore I tell you, don't be anxious for your life, what you
  // will eat or what you will drink; nor yet for your body, what you will
  // wear. Isn't life more than food, and the body more than clothing?"
  {
    id: "anxiety-prayer",
    query: "Where does Scripture tell anxious people to pray and present their requests to God?",
    relevant: ["PHP.4.6", "PHP.4.7"],
    hardNegatives: ["MAT.6.25"],
    language: "en",
    category: "thematic",
    difficulty: "easy",
    answerable: true,
  },
  // ROM.8.38: "For I am persuaded, that neither death, nor life, nor angels,
  // nor principalities, nor things present, nor things to come, nor powers,"
  // ROM.8.39: "nor height, nor depth, nor any other created thing, will be
  // able to separate us from the love of God, which is in Christ Jesus our
  // Lord." 
  // Hard negatives 
  // JHN.10.28: "I give them eternal life. They will
  // never perish, and no one will snatch them out of my hand."
  {
    id: "nothing-separates",
    query: "What passage says that nothing can separate believers from God's love in Christ?",
    relevant: ["ROM.8.38", "ROM.8.39"],
    hardNegatives: ["JHN.10.28"],
    language: "en",
    category: "direct",
    difficulty: "easy",
    answerable: true,
  },
  // MAT.5.44: "But I tell you, love your enemies, bless those who curse you,
  // do good to those who hate you, and pray for those who mistreat you and
  // persecute you." 
  // Hard negatives 
  // ROM.12.20: "Therefore 'If your enemy is
  // hungry, feed him. If he is thirsty, give him a drink; for in doing this
  // you will heap coals of fire on his head.'"
  {
    id: "love-enemies",
    query: "Where did Jesus teach his followers to love their enemies?",
    relevant: ["MAT.5.44"],
    hardNegatives: ["ROM.12.20"],
    language: "en",
    category: "direct",
    difficulty: "easy",
    answerable: true,
  },
  // 1CO.13.4: "Love is patient and is kind. Love doesn't envy. Love doesn't
  // brag, is not proud,"
  // 1CO.13.5: "doesn't behave itself inappropriately, doesn't seek its own
  // way, is not provoked, takes no account of evil;"
  // 1CO.13.6: "doesn't rejoice in unrighteousness, but rejoices with the
  // truth;"
  // 1CO.13.7: "bears all things, believes all things, hopes all things, and
  // endures all things." 
  // Hard negatives 
  // 1JN.4.7: "Beloved, let us love one
  // another, for love is of God; and everyone who loves has been born of God,
  // and knows God."
  {
    id: "love-definition",
    query: "Which chapter describes love as patient, kind, and not boastful?",
    relevant: ["1CO.13.4", "1CO.13.5", "1CO.13.6", "1CO.13.7"],
    hardNegatives: ["1JN.4.7"],
    language: "en",
    category: "thematic",
    difficulty: "medium",
    answerable: true,
  },
  // GEN.1.1: "In the beginning God created the heavens and the earth." 
  // Hard negatives 
  // JHN.1.1: "In the beginning was the Word, and the Word was with
  // God, and the Word was God."
  {
    id: "creation-beginning",
    query: "What is the opening verse about God creating the heavens and the earth?",
    relevant: ["GEN.1.1"],
    hardNegatives: ["JHN.1.1"],
    language: "en",
    category: "direct",
    difficulty: "easy",
    answerable: true,
  },
  // JAS.2.17: "Even so faith, if it has no works, is dead in itself."
  // JAS.2.18: "Yes, a man will say, 'You have faith, and I have works.' Show
  // me your faith apart from your works, and I by my works will show you my
  // faith." 
  // Hard negatives
  // EPH.2.8: "For by grace you have been saved through
  // faith, and that not of yourselves; it is the gift of God,"
  {
    id: "faith-and-works",
    query: "Where does James discuss faith being shown by works?",
    relevant: ["JAS.2.17", "JAS.2.18"],
    hardNegatives: ["EPH.2.8"],
    language: "en",
    category: "thematic",
    difficulty: "medium",
    answerable: true,
  },
  // JHN.3.16 (Luther 1912): "Denn also hat Gott die Welt geliebt, daß er
  // seinen eingeborenen Sohn gab, auf daß alle, die an ihn glauben, nicht
  // verloren werden, sondern das ewige Leben haben." 
  // Hard negatives
  // ROM.5.8 (Luther 1912): "Darum preiset Gott seine Liebe gegen uns, daß Christus
  // für uns gestorben ist, da wir noch Sünder waren."
  {
    id: "german-gods-love",
    query:
      "Welche Bibelstelle sagt, dass Gott die Welt so sehr geliebt hat, dass er seinen Sohn gab?",
    relevant: ["JHN.3.16"],
    hardNegatives: ["ROM.5.8"],
    language: "de",
    category: "cross-lingual",
    difficulty: "easy",
    answerable: true,
  },
  // PSA.23.1 (Luther 1912): "Ein Psalm Davids. Der HERR ist mein Hirte; mir
  // wird nichts mangeln."
  // Hard negatives
  // JHN.10.11 (Luther 1912): "Ich bin der
  // gute Hirte. Der gute Hirte läßt sein Leben für seine Schafe."
  {
    id: "german-shepherd",
    query: "Wo steht, dass der Herr mein Hirte ist und mir nichts mangelt?",
    relevant: ["PSA.23.1"],
    hardNegatives: ["JHN.10.11"],
    language: "de",
    category: "cross-lingual",
    difficulty: "easy",
    answerable: true,
  },
  // PHP.4.6 (Luther 1912): "Sorget nichts! sondern in allen Dingen lasset
  // eure Bitten im Gebet und Flehen mit Danksagung vor Gott kund werden."
  // PHP.4.7 (Luther 1912): "Und der Friede Gottes, welcher höher ist denn
  // alle Vernunft, bewahre eure Herzen und Sinne in Christo Jesu." 
  // Hard negatives
  // MAT.6.25 (Luther 1912): "Darum sage ich euch: Sorget nicht für
  // euer Leben, was ihr essen und trinken werdet, auch nicht für euren Leib,
  // was ihr anziehen werdet. Ist nicht das Leben mehr denn die Speise und der
  // Leib mehr denn die Kleidung?"
  {
    id: "german-anxiety",
    query: "Welche Stelle sagt, dass wir uns um nichts sorgen, sondern im Gebet bitten sollen?",
    relevant: ["PHP.4.6", "PHP.4.7"],
    hardNegatives: ["MAT.6.25"],
    language: "de",
    category: "cross-lingual",
    difficulty: "medium",
    answerable: true,
  },
  // 1CO.13.4-7 (Luther 1912): "Die Liebe ist langmütig und freundlich, die
  // Liebe eifert nicht, die Liebe treibt nicht Mutwillen, sie blähet sich
  // nicht, sie stellet sich nicht ungebärdig, sie suchet nicht das Ihre, sie
  // läßt sich nicht erbittern, sie rechnet das Böse nicht zu, sie freuet sich
  // nicht der Ungerechtigkeit, sie freuet sich aber der Wahrheit; sie
  // verträgt alles, sie glaubet alles, sie hoffet alles, sie duldet alles."
  // Hard negatives
  // 1JN.4.7 (Luther 1912): "Ihr Lieben, lasset uns
  // untereinander liebhaben; denn die Liebe ist von Gott, und wer liebhat,
  // der ist von Gott geboren und kennt Gott."
  {
    id: "german-love-definition",
    query: "Wo wird die Liebe als geduldig und freundlich beschrieben?",
    relevant: ["1CO.13.4", "1CO.13.5", "1CO.13.6", "1CO.13.7"],
    hardNegatives: ["1JN.4.7"],
    language: "de",
    category: "cross-lingual",
    difficulty: "medium",
    answerable: true,
  },
  {
    id: "unanswerable-quantum",
    query: "Which Bible verse explains quantum entanglement?",
    relevant: [],
    hardNegatives: [],
    language: "en",
    category: "unanswerable",
    difficulty: "hard",
    answerable: false,
  },
  {
    id: "unanswerable-modern-country",
    query: "What does the Bible say about the 2026 election results in Canada?",
    relevant: [],
    hardNegatives: [],
    language: "en",
    category: "unanswerable",
    difficulty: "hard",
    answerable: false,
  },
  {
    id: "unanswerable-german-technology",
    query: "Welche Bibelstelle erklärt die Funktionsweise moderner Quantencomputer?",
    relevant: [],
    hardNegatives: [],
    language: "de",
    category: "unanswerable",
    difficulty: "hard",
    answerable: false,
  },
];
