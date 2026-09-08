import { FieldName } from './assessment-form';

export const assessmentEnglish = {
  intro:
    'Tell us about your education and study preferences. You can review everything before finishing.',
  privacy:
    'Do not enter your name, contact details, passport number, or financial documents. An unfinished draft stays in this browser tab for up to 24 hours after your last activity.',
  sample:
    'The reference lists are development samples, not verified guidance. Choose “Not listed” to enter your own answer. Self-reported names are not treated as verified references.',
  loading: 'Loading reference options…',
  loadError: 'Reference options could not be loaded.',
  retry: 'Try again',
  empty: 'No reference options are available. You can use “Not listed”.',
  steps: [
    'Your background',
    'Academic details',
    'Language tests',
    'Study preferences',
    'Review',
  ] as readonly string[],
  select: 'Choose an answer',
  other: 'Not listed — enter below',
  unknown: 'Unknown / not available',
  none: 'No test yet',
  yes: 'Yes',
  no: 'No',
  optional: 'Optional',
  next: 'Next',
  back: 'Back',
  edit: 'Edit',
  finish: 'Finish questionnaire',
  review: 'Review your answers',
  done: 'Questionnaire complete',
  doneText:
    'Your profile has been collected for this session. Eligibility matching is not available yet. No information has been submitted to an institution or agency.',
  new: 'Start a new questionnaire',
  reset: 'Clear and start again',
  confirmReset: 'Clear this draft?',
  cancel: 'Keep my answers',
  resumed: 'Your unfinished draft has been restored.',
  storage:
    'Browser storage is unavailable. You can continue, but your draft may not survive a refresh.',
  validation: 'Please correct the highlighted answers before continuing.',
  required: 'Please provide an answer.',
  number: 'Enter a valid non-negative number in the allowed range.',
  choice: 'Choose an available option or “Not listed”.',
  scale: 'The score cannot exceed its stated scale.',
  gap: 'The study gap cannot exceed the time since graduation.',
  intakeError: 'Enter a future or current intake month as YYYY-MM, within the next 10 years.',
  listError: 'Enter up to 10 items separated by commas (100 characters per item).',
  long: 'Keep this answer under 500 characters.',
  scoreHint:
    'Use the score and maximum scale printed on your result. Component scores are optional; if entered, provide their maximum scale too. No scores are converted.',
  academicHint:
    'Enter your result in its original scale. Leave optional values blank if unknown; enter 0 only when it is known to be zero. Study gap means years not studying since your last completed qualification.',
  preferencesHint:
    'For several destinations, choose “Not listed” and separate country names with commas. Separate optional city names and intended subjects with commas. Tuition budget excludes living costs.',
  intakeHint:
    'Intake month: YYYY-MM, for example the year and month you intend to begin. This is a preference, not a confirmed program intake.',
  notProvided: 'Not provided',
  step: 'Step',
  of: 'of',
};
export type AssessmentText = {
  readonly [
    K in keyof typeof assessmentEnglish
  ]: (typeof assessmentEnglish)[K] extends readonly string[] ? readonly string[] : string;
};
export const assessmentBengali: AssessmentText = {
  intro: 'আপনার শিক্ষা ও পড়াশোনার পছন্দ সম্পর্কে জানান। শেষ করার আগে সব উত্তর দেখে নিতে পারবেন।',
  privacy:
    'নাম, যোগাযোগের তথ্য, পাসপোর্ট নম্বর বা আর্থিক নথি দেবেন না। সর্বশেষ ব্যবহারের পর সর্বোচ্চ ২৪ ঘণ্টা এই ব্রাউজার ট্যাবে অসমাপ্ত খসড়া থাকবে।',
  sample:
    'তালিকাগুলো উন্নয়নের নমুনা, যাচাইকৃত নির্দেশনা নয়। নিজের উত্তর দিতে “তালিকায় নেই” বেছে নিন। নিজের লেখা নামকে যাচাইকৃত তথ্য ধরা হবে না।',
  loading: 'বিকল্পগুলো লোড হচ্ছে…',
  loadError: 'বিকল্পগুলো লোড করা যায়নি।',
  retry: 'আবার চেষ্টা করুন',
  empty: 'কোনো বিকল্প নেই। “তালিকায় নেই” ব্যবহার করতে পারেন।',
  steps: ['আপনার পরিচিতি', 'শিক্ষাগত তথ্য', 'ভাষা পরীক্ষা', 'পড়াশোনার পছন্দ', 'পর্যালোচনা'],
  select: 'একটি উত্তর বেছে নিন',
  other: 'তালিকায় নেই — নিচে লিখুন',
  unknown: 'অজানা / তথ্য নেই',
  none: 'এখনো পরীক্ষা দিইনি',
  yes: 'হ্যাঁ',
  no: 'না',
  optional: 'ঐচ্ছিক',
  next: 'পরবর্তী',
  back: 'পূর্ববর্তী',
  edit: 'সম্পাদনা',
  finish: 'প্রশ্নমালা শেষ করুন',
  review: 'উত্তরগুলো পর্যালোচনা করুন',
  done: 'প্রশ্নমালা সম্পন্ন',
  doneText:
    'এই সেশনের জন্য আপনার তথ্য নেওয়া হয়েছে। যোগ্যতা যাচাই এখনো চালু হয়নি। কোনো প্রতিষ্ঠান বা এজেন্সিতে তথ্য পাঠানো হয়নি।',
  new: 'নতুন প্রশ্নমালা শুরু করুন',
  reset: 'মুছে আবার শুরু করুন',
  confirmReset: 'এই খসড়া মুছবেন?',
  cancel: 'উত্তরগুলো রাখুন',
  resumed: 'আপনার অসমাপ্ত খসড়া ফিরিয়ে আনা হয়েছে।',
  storage:
    'ব্রাউজারে সংরক্ষণ করা যাচ্ছে না। চালিয়ে যেতে পারেন, তবে রিফ্রেশ করলে খসড়া হারিয়ে যেতে পারে।',
  validation: 'চালিয়ে যাওয়ার আগে চিহ্নিত উত্তরগুলো ঠিক করুন।',
  required: 'একটি উত্তর দিন।',
  number: 'অনুমোদিত সীমার মধ্যে শূন্য বা ধনাত্মক সংখ্যা লিখুন।',
  choice: 'একটি বিকল্প অথবা “তালিকায় নেই” বেছে নিন।',
  scale: 'স্কোর তার সর্বোচ্চ স্কেলের চেয়ে বেশি হতে পারে না।',
  gap: 'বিরতি শেষ যোগ্যতা অর্জনের পর কেটে যাওয়া সময়ের চেয়ে বেশি হতে পারে না।',
  intakeError: 'বর্তমান বা ভবিষ্যতের শুরুর মাস YYYY-MM আকারে লিখুন, আগামী ১০ বছরের মধ্যে।',
  listError: 'কমা দিয়ে আলাদা করে সর্বোচ্চ ১০টি নাম লিখুন (প্রতিটি ১০০ অক্ষরের মধ্যে)।',
  long: 'উত্তরটি ৫০০ অক্ষরের মধ্যে রাখুন।',
  scoreHint:
    'ফলাফলে দেওয়া স্কোর ও সর্বোচ্চ স্কেল লিখুন। বিভাগভিত্তিক স্কোর ঐচ্ছিক; দিলে সেগুলোর সর্বোচ্চ স্কেলও লিখুন। কোনো স্কোর রূপান্তর করা হবে না।',
  academicHint:
    'মূল স্কেলে আপনার ফলাফল লিখুন। অজানা হলে ঐচ্ছিক ঘর ফাঁকা রাখুন; নিশ্চিতভাবে শূন্য হলেই ০ লিখুন। পড়াশোনায় বিরতি হলো শেষ যোগ্যতা অর্জনের পর পড়াশোনা না করার সময়, বছরে।',
  preferencesHint:
    'একাধিক দেশের জন্য “তালিকায় নেই” বেছে কমা দিয়ে নাম লিখুন। শহর ও পছন্দের বিষয়গুলোও কমা দিয়ে আলাদা করুন। টিউশন বাজেটে জীবনযাপনের খরচ অন্তর্ভুক্ত নয়।',
  intakeHint:
    'শুরুর মাস: YYYY-MM, অর্থাৎ যে বছর ও মাসে পড়াশোনা শুরু করতে চান। এটি আপনার পছন্দ, নিশ্চিত ভর্তি মৌসুম নয়।',
  notProvided: 'দেওয়া হয়নি',
  step: 'ধাপ',
  of: '/',
};
export const labels: Record<FieldName, readonly [string, string]> = {
  nationality: ['Nationality (country)', 'জাতীয়তা (দেশ)'],
  nationalityOther: ['Your nationality country', 'আপনার জাতীয়তার দেশ'],
  residence: ['Current country', 'বর্তমান দেশ'],
  residenceOther: ['Your current country', 'বর্তমানে বসবাসের দেশ'],
  education: ['Last completed education level', 'সর্বশেষ সম্পন্ন শিক্ষাস্তর'],
  educationOther: ['Your qualification', 'আপনার শিক্ষাগত যোগ্যতা'],
  background: ['Academic background', 'শিক্ষাগত বিষয়'],
  backgroundOther: ['Your academic subject', 'আপনার শিক্ষাগত বিষয়ের নাম'],
  resultKnown: [
    'Is a numeric academic result available?',
    'সংখ্যায় প্রকাশিত শিক্ষাগত ফলাফল আছে কি?',
  ],
  gpa: ['GPA or equivalent result', 'জিপিএ বা সমমানের ফলাফল'],
  gpaScale: ['Maximum result scale', 'ফলাফলের সর্বোচ্চ স্কেল'],
  graduationYear: ['Graduation year', 'পাসের বছর'],
  studyGapYears: ['Study gap (years)', 'পড়াশোনায় বিরতি (বছর)'],
  workMonths: ['Work experience (months)', 'কাজের অভিজ্ঞতা (মাস)'],
  test: ['Language test', 'ভাষা পরীক্ষা'],
  testOther: ['Test name', 'পরীক্ষার নাম'],
  overall: ['Overall score', 'মোট স্কোর'],
  overallScale: ['Maximum overall scale', 'মোট স্কোরের সর্বোচ্চ স্কেল'],
  reading: ['Reading score', 'পড়ার স্কোর'],
  writing: ['Writing score', 'লেখার স্কোর'],
  listening: ['Listening score', 'শোনার স্কোর'],
  speaking: ['Speaking score', 'বলার স্কোর'],
  componentScale: ['Maximum component score scale', 'বিভাগভিত্তিক স্কোরের সর্বোচ্চ স্কেল'],
  destination: ['Preferred destination country', 'পছন্দের গন্তব্য দেশ'],
  destinationOther: [
    'Preferred countries (comma-separated)',
    'পছন্দের দেশগুলো (কমা দিয়ে আলাদা করুন)',
  ],
  cities: ['Preferred cities (comma-separated)', 'পছন্দের শহরগুলো (কমা দিয়ে আলাদা করুন)'],
  degree: ['Intended degree level', 'কাঙ্ক্ষিত ডিগ্রির স্তর'],
  degreeOther: ['Your intended degree', 'আপনার কাঙ্ক্ষিত ডিগ্রি'],
  subjects: ['Intended subjects (comma-separated)', 'কাঙ্ক্ষিত বিষয়গুলো (কমা দিয়ে আলাদা করুন)'],
  budget: ['Maximum annual tuition budget', 'সর্বোচ্চ বার্ষিক টিউশন বাজেট'],
  currency: ['Budget currency', 'বাজেটের মুদ্রা'],
  intake: ['Preferred intake (YYYY-MM)', 'পছন্দের শুরুর মাস (YYYY-MM)'],
  scholarship: ['Is a scholarship required?', 'বৃত্তি কি প্রয়োজন?'],
};
