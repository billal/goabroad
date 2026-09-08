export const en = {
  home: 'Home',
  student: 'Student assessment',
  jobSeeker: 'Job-seeker questionnaire',
  jobAction: 'I want to work abroad',
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
    'Explore our student and job-seeker questionnaires. Job listings and work-visa assessments are not available.',
  eyebrow: 'For people in Bangladesh planning their next step',
  headline: 'A bigger world. A clearer next step.',
  intro:
    'Turn your ambition to study or work abroad into a thoughtful plan. Start with your background, your interests, and where you want to go.',
  studentAction: 'I am a student',
  explore: 'Explore the program preview',
  journey: 'Start with a clearer picture of your goals',
  profileTitle: 'Start with your profile',
  profileText: 'Choose the student or job-seeker questionnaire for your goal.',
  optionsTitle: 'Review your answers',
  optionsText: 'Check your background and preferences before completing the questionnaire.',
  decisionTitle: 'Research with confidence',
  decisionText: 'Consult official sources before deciding your next steps.',
  comingSoon: 'This section is being prepared.',
  placeholder:
    'This is a route preview, not a published listing or an assessment. No program, institution, visa, or agency information is available here yet.',
  missingText: 'We could not find this page. Check the address or return to the home page.',
  backHome: 'Back to home',
  footer:
    'A thoughtful starting point for your study and work ambitions abroad. Made for people in Bangladesh.',
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
  jobSeeker: 'চাকরিপ্রার্থীর প্রশ্নমালা',
  jobAction: 'আমি বিদেশে কাজ করতে চাই',
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
  previewNotice:
    'উন্নয়নাধীন সংস্করণ: শিক্ষার্থী বা চাকরিপ্রার্থীর প্রশ্নমালায় নিজের পটভূমি জানান। চাকরির তালিকা বা কর্মভিসার মূল্যায়ন চালু নেই।',
  eyebrow: 'বাংলাদেশে যারা পরবর্তী পদক্ষেপের পরিকল্পনা করছেন',
  headline: 'আরও বড় পৃথিবী। আরও স্পষ্ট পরবর্তী পদক্ষেপ।',
  intro:
    'বিদেশে পড়াশোনা বা কাজের স্বপ্নকে ভেবেচিন্তে পরিকল্পনায় রূপ দিন। শুরু করুন আপনার পটভূমি, আগ্রহ ও গন্তব্য দিয়ে।',
  studentAction: 'আমি একজন শিক্ষার্থী',
  explore: 'প্রোগ্রাম বিভাগের প্রাথমিক সংস্করণ দেখুন',
  journey: 'নিজের লক্ষ্য স্পষ্ট করে শুরু করুন',
  profileTitle: 'শুরু করুন নিজের তথ্য দিয়ে',
  profileText: 'আপনার লক্ষ্য অনুযায়ী শিক্ষার্থী বা চাকরিপ্রার্থীর প্রশ্নমালা বেছে নিন।',
  optionsTitle: 'উত্তরগুলো পর্যালোচনা করুন',
  optionsText: 'প্রশ্নমালা সম্পন্ন করার আগে আপনার পটভূমি ও পছন্দ যাচাই করুন।',
  decisionTitle: 'জেনে সিদ্ধান্ত নিন',
  decisionText: 'পরবর্তী পদক্ষেপ নেওয়ার আগে সরকারি ও সংশ্লিষ্ট প্রতিষ্ঠানের সূত্র দেখুন।',
  comingSoon: 'এই বিভাগটি প্রস্তুত করা হচ্ছে।',
  placeholder:
    'এটি পৃষ্ঠার একটি প্রাথমিক সংস্করণ, প্রকাশিত তালিকা বা মূল্যায়ন নয়। এখানে এখনো প্রোগ্রাম, শিক্ষাপ্রতিষ্ঠান, ভিসা বা এজেন্সির তথ্য দেওয়া হয়নি।',
  missingText: 'এই পৃষ্ঠাটি খুঁজে পাওয়া যায়নি। ঠিকানাটি যাচাই করুন অথবা হোম পৃষ্ঠায় ফিরে যান।',
  backHome: 'হোমে ফিরে যান',
  footer: 'বিদেশে পড়াশোনা ও কাজের স্বপ্নের একটি চিন্তাশীল শুরু। বাংলাদেশের মানুষের জন্য।',
  disclaimer:
    'Go Abroad শুধু তথ্যভিত্তিক দিকনির্দেশনা দেয়। ভর্তি, বৃত্তি, ভিসা বা এজেন্সির সেবার ফলাফলের কোনো নিশ্চয়তা দেওয়া হয় না।',
  loading: 'পৃষ্ঠাটি লোড হচ্ছে…',
  navigationError: 'পৃষ্ঠাটি লোড করা যায়নি। আবার চেষ্টা করুন।',
  retry: 'আবার চেষ্টা করুন',
};

export type PageKey =
  | 'home'
  | 'student'
  | 'jobSeeker'
  | 'programs'
  | 'program'
  | 'institution'
  | 'country'
  | 'visa'
  | 'agencies'
  | 'agency'
  | 'compare'
  | 'notFound';
