import { Component, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LanguageService } from '../../core/i18n/language.service';

const copy = {
  warning: ['Warning', 'সতর্কতা'],
  agencyResponsibility: [
    'Go Abroad is not responsible for financial transactions or other agreements between you and an agency. Contact agencies at your own discretion, verify their credentials, and review all terms before paying or signing an agreement.',
    'আপনার ও কোনো এজেন্সির মধ্যে আর্থিক লেনদেন বা অন্য কোনো চুক্তির জন্য Go Abroad দায়ী নয়। নিজ দায়িত্বে এজেন্সির সঙ্গে যোগাযোগ করুন, তাদের পরিচয় ও যোগ্যতা যাচাই করুন এবং অর্থ প্রদান বা চুক্তি করার আগে সব শর্ত পর্যালোচনা করুন।',
  ],
  save: ['Save', 'সংরক্ষণ করুন'],
  title: ['Create an account to save', 'সংরক্ষণের জন্য অ্যাকাউন্ট তৈরি করুন'],
  email: ['Email address', 'ইমেইল ঠিকানা'],
  password: ['Password', 'পাসওয়ার্ড'],
  confirm: ['Confirm password', 'পাসওয়ার্ড নিশ্চিত করুন'],
  close: ['Close', 'বন্ধ করুন'],
  submit: ['Create account and save', 'অ্যাকাউন্ট তৈরি করে সংরক্ষণ করুন'],
  unavailable: [
    'Account saving is not available yet. This form does not create an account or save your answers.',
    'অ্যাকাউন্টে সংরক্ষণ এখনো চালু হয়নি। এই ফর্ম অ্যাকাউন্ট তৈরি বা উত্তর সংরক্ষণ করে না।',
  ],
  invalid: [
    'Enter a valid email address and matching passwords of at least 8 characters.',
    'সঠিক ইমেইল ঠিকানা এবং অন্তত ৮ অক্ষরের একই পাসওয়ার্ড দুবার লিখুন।',
  ],
  agencyTitle: ['Need help with your next step?', 'পরবর্তী পদক্ষেপে সহায়তা দরকার?'],
  agencyIntro: ['Recommended consultancy', 'আমাদের প্রস্তাবিত পরামর্শদাতা প্রতিষ্ঠান'],
  agencyEmpty: [
    'Consultancy details will appear here once available.',
    'পরামর্শদাতা প্রতিষ্ঠানের তথ্য পাওয়া গেলে এখানে দেখানো হবে।',
  ],
  exampleOne: ['Example consultancy 1', 'নমুনা পরামর্শদাতা ১'],
  exampleTwo: ['Example consultancy 2', 'নমুনা পরামর্শদাতা ২'],
  placeholder: [
    'Layout example only — not a real agency or endorsement.',
    'শুধু নকশার নমুনা — বাস্তব প্রতিষ্ঠান বা সুপারিশ নয়।',
  ],
} as const;

@Component({
  selector: 'app-save-assessment',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './save-assessment.html',
  styleUrl: './save-assessment.scss',
})
export class SaveAssessment {
  readonly showConsultancy = input(true);
  private readonly language = inject(LanguageService);
  readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  readonly attempted = signal(false);
  readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
    confirm: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  t(key: keyof typeof copy): string {
    return copy[key][this.language.language() === 'bn' ? 1 : 0];
  }
  invalid(): boolean {
    return (
      this.form.invalid || this.form.controls.password.value !== this.form.controls.confirm.value
    );
  }
  open(): void {
    this.clear();
    this.dialog().nativeElement.showModal();
  }
  close(): void {
    this.clear();
    this.dialog().nativeElement.close();
  }
  clear(): void {
    this.form.reset();
    this.attempted.set(false);
  }
  submit(): void {
    this.attempted.set(true);
    this.form.markAllAsTouched();
    // UI only: no credential persistence, account creation or successful-save claim.
  }
}
