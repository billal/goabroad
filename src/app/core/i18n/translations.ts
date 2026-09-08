export const en = {
  home: 'Home',
  student: 'Student assessment',
  programs: 'Programs',
  program: 'Program details',
  institution: 'Institution details',
  country: 'Country study guide',
  visa: 'Visa guidance',
  agencies: 'Agencies',
  agency: 'Agency details',
  compare: 'Compare programs',
  notFound: 'Page not found',
  skip: 'Skip to main content',
  navigation: 'Main navigation',
  language: 'Language',
  menu: 'Menu',
  closeMenu: 'Close menu',
  preview: 'Development preview',
  previewNotice:
    'Development preview: the student questionnaire is available. Eligibility matching, listings, and comparison are not available yet.',
  eyebrow: 'For students in Bangladesh',
  headline: 'Your next chapter starts with understanding your options.',
  intro:
    'Go Abroad is being built to help you explore overseas study, understand requirements, and make informed choices.',
  studentAction: 'I am a student',
  explore: 'Explore the program preview',
  journey: 'A clearer path to overseas study',
  profileTitle: 'Start with your profile',
  profileText: 'Describe your education and study preferences in the student questionnaire.',
  optionsTitle: 'Understand your options',
  optionsText: 'Program information will explain requirements and show what is known and unknown.',
  decisionTitle: 'Research with confidence',
  decisionText: 'Compare details and consult official sources before deciding your next steps.',
  comingSoon: 'This section is being prepared.',
  placeholder:
    'This is a route preview, not a published listing or an assessment. No program, institution, visa, or agency information is available here yet.',
  missingText: 'We could not find this page. Check the address or return to the home page.',
  backHome: 'Back to home',
  footer: 'Information to help you plan your studies abroad.',
  disclaimer:
    'Go Abroad provides informational guidance only. Admission, scholarships, visas, and agency outcomes are never guaranteed.',
  loading: 'Loading page…',
  navigationError: 'This page could not be loaded. Please try again.',
  retry: 'Try again',
} as const;

export type TranslationKey = keyof typeof en;
export type Translations = { readonly [K in TranslationKey]: string };
export type Language = 'en' | 'bn';
export const DEFAULT_LANGUAGE: Language = 'en';
export const isLanguage = (value: string | null | undefined): value is Language =>
  value === 'en' || value === 'bn';

export const bn: Translations = {
  home: 'হোম',
  student: 'শিক্ষার্থীর মূল্যায়ন',
  programs: 'প্রোগ্রাম',
  program: 'প্রোগ্রামের বিস্তারিত',
  institution: 'শিক্ষাপ্রতিষ্ঠানের বিস্তারিত',
  country: 'দেশভিত্তিক পড়াশোনার নির্দেশিকা',
  visa: 'ভিসা নির্দেশিকা',
  agencies: 'এজেন্সি',
  agency: 'এজেন্সির বিস্তারিত',
  compare: 'প্রোগ্রাম তুলনা',
  notFound: 'পৃষ্ঠাটি পাওয়া যায়নি',
  skip: 'মূল বিষয়বস্তুতে যান',
  navigation: 'প্রধান নেভিগেশন',
  language: 'ভাষা',
  menu: 'মেনু',
  closeMenu: 'মেনু বন্ধ করুন',
  preview: 'উন্নয়নাধীন সংস্করণ',
  previewNotice: 'উন্নয়নাধীন সংস্করণ: শিক্ষার্থীর প্রশ্নমালা চালু হয়েছে। যোগ্যতা যাচাই, তালিকা ও তুলনার সুবিধা এখনো চালু হয়নি।',
  eyebrow: 'বাংলাদেশের শিক্ষার্থীদের জন্য',
  headline: 'আপনার সম্ভাবনাগুলো জানার মধ্য দিয়েই শুরু হোক নতুন অধ্যায়।',
  intro:
    'বিদেশে পড়াশোনার সুযোগ খুঁজতে, প্রয়োজনীয় শর্ত বুঝতে এবং জেনে সিদ্ধান্ত নিতে সহায়তা করার জন্য Go Abroad তৈরি করা হচ্ছে।',
  studentAction: 'আমি একজন শিক্ষার্থী',
  explore: 'প্রোগ্রাম বিভাগের প্রাথমিক সংস্করণ দেখুন',
  journey: 'বিদেশে পড়াশোনার পথ হোক আরও স্পষ্ট',
  profileTitle: 'শুরু করুন নিজের তথ্য দিয়ে',
  profileText: 'শিক্ষার্থীর প্রশ্নমালায় আপনার শিক্ষাগত তথ্য ও পড়াশোনার পছন্দগুলো জানান।',
  optionsTitle: 'সুযোগগুলো বুঝে নিন',
  optionsText: 'প্রোগ্রামের তথ্যে প্রয়োজনীয় শর্ত এবং কোন তথ্য জানা বা অজানা তা স্পষ্ট করা হবে।',
  decisionTitle: 'জেনে সিদ্ধান্ত নিন',
  decisionText:
    'পরবর্তী পদক্ষেপ নেওয়ার আগে বিস্তারিত তুলনা করুন এবং সরকারি ও সংশ্লিষ্ট প্রতিষ্ঠানের সূত্র দেখুন।',
  comingSoon: 'এই বিভাগটি প্রস্তুত করা হচ্ছে।',
  placeholder:
    'এটি পৃষ্ঠার একটি প্রাথমিক সংস্করণ, প্রকাশিত তালিকা বা মূল্যায়ন নয়। এখানে এখনো প্রোগ্রাম, শিক্ষাপ্রতিষ্ঠান, ভিসা বা এজেন্সির তথ্য দেওয়া হয়নি।',
  missingText: 'এই পৃষ্ঠাটি খুঁজে পাওয়া যায়নি। ঠিকানাটি যাচাই করুন অথবা হোম পৃষ্ঠায় ফিরে যান।',
  backHome: 'হোমে ফিরে যান',
  footer: 'বিদেশে পড়াশোনার পরিকল্পনায় সহায়ক তথ্য।',
  disclaimer:
    'Go Abroad শুধু তথ্যভিত্তিক দিকনির্দেশনা দেয়। ভর্তি, বৃত্তি, ভিসা বা এজেন্সির সেবার ফলাফলের কোনো নিশ্চয়তা দেওয়া হয় না।',
  loading: 'পৃষ্ঠাটি লোড হচ্ছে…',
  navigationError: 'পৃষ্ঠাটি লোড করা যায়নি। আবার চেষ্টা করুন।',
  retry: 'আবার চেষ্টা করুন',
};

export type PageKey =
  | 'home'
  | 'student'
  | 'programs'
  | 'program'
  | 'institution'
  | 'country'
  | 'visa'
  | 'agencies'
  | 'agency'
  | 'compare'
  | 'notFound';
