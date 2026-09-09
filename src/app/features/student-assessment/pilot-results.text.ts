export const pilotText = {
  allCountries: ['All available countries', 'সব দেশ'],
  resultIntro: [
    'Based on your answers, here are your study options.',
    'আপনার উত্তরের ভিত্তিতে পড়াশোনার বিকল্পগুলো দেখানো হচ্ছে।',
  ],
  destination: ['Destination country', 'গন্তব্য দেশ'],
  submittedDestination: ['My submitted destination', 'আমার জমা দেওয়া গন্তব্য'],
  sampleLabel: ['Sample options · awaiting review', 'নমুনা বিকল্প · পর্যালোচনার অপেক্ষায়'],
  about: ['How these options are selected', 'বিকল্পগুলো যেভাবে বাছাই করা হয়েছে'],
  title: ['Sample study options', 'পড়াশোনার নমুনা বিকল্প'],
  intro: [
    'A limited research pilot, not a complete catalog or admission recommendation. These real programs are draft information awaiting independent review.',
    'এটি সীমিত গবেষণামূলক পাইলট, পূর্ণ তালিকা বা ভর্তির সুপারিশ নয়। বাস্তব প্রোগ্রামগুলোর খসড়া তথ্য পৃথক পর্যালোচনার অপেক্ষায়।',
  ],
  selection: [
    'Initially showing your selected destination and degree level where known. Subjects, cities, additional countries and scholarship preferences are not matched automatically.',
    'জানা থাকলে আপনার নির্বাচিত গন্তব্য ও ডিগ্রির স্তর অনুযায়ী দেখানো হচ্ছে। বিষয়, শহর, অতিরিক্ত দেশ ও বৃত্তির পছন্দ স্বয়ংক্রিয়ভাবে মেলানো হয়নি।',
  ],
  limited: [
    'Published notes may contain conditions the questionnaire cannot assess, including qualification recognition, prerequisite courses, test validity and exemptions. An unknown result is not a rejection.',
    'প্রকাশিত শর্তের মধ্যে ডিগ্রির স্বীকৃতি, পূর্বশর্তের কোর্স, পরীক্ষার মেয়াদ ও ছাড় থাকতে পারে যা প্রশ্নমালা যাচাই করতে পারে না। অজানা ফল প্রত্যাখ্যান নয়।',
  ],
  empty: [
    'No pilot programs cover this destination and degree combination. This does not mean you have no study options.',
    'এই গন্তব্য ও ডিগ্রির সমন্বয়ের প্রোগ্রাম পাইলটে নেই। এর মানে আপনার পড়াশোনার বিকল্প নেই এমন নয়।',
  ],
  noData: ['No sample programs are available yet.', 'এখনো নমুনা প্রোগ্রাম নেই।'],
  showAll: ['Show all pilot examples', 'সব পাইলট উদাহরণ দেখুন'],
  showSelected: ['Use my destination and degree', 'আমার গন্তব্য ও ডিগ্রি অনুযায়ী দেখুন'],
  allNotice: [
    'Showing all pilot examples, including programs outside your preferences. These are not personalized matches.',
    'আপনার পছন্দের বাইরেও সব পাইলট উদাহরণ দেখানো হচ্ছে। এগুলো ব্যক্তিগতভাবে মেলানো ফল নয়।',
  ],
  found: ['Examples shown', 'প্রদর্শিত উদাহরণ'],
  detail: ['Requirements and sources', 'শর্ত ও উৎস'],
  academic: ['Academic admission notes', 'শিক্ষাগত ভর্তির শর্ত'],
  language: ['Language admission notes', 'ভাষাভিত্তিক ভর্তির শর্ত'],
  intake: ['Intake and deadline notes', 'ভর্তির পর্ব ও সময়সীমা'],
  fees: ['Fee context', 'ফি সম্পর্কিত তথ্য'],
  checks: ['Requirement checks', 'শর্ত যাচাই'],
  official: ['Official course information', 'কোর্সের সরকারি তথ্য'],
  duration: ['Duration (months)', 'সময়কাল (মাস)'],
  testScope: [
    'Only supported structured requirements are calculated. Read the admission notes even when a check is met.',
    'শুধু সমর্থিত কাঠামোবদ্ধ শর্ত হিসাব করা হয়। কোনো শর্ত পূরণ হলেও ভর্তির নোট পড়ুন।',
  ],
  restart: ['Start another assessment', 'আবার মূল্যায়ন শুরু করুন'],
} as const;
export type PilotTextKey = keyof typeof pilotText;
