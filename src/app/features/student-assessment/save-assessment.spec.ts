import { TestBed } from '@angular/core/testing';
import { SaveAssessment } from './save-assessment';

describe('Save assessment popup', () => {
  it('validates matching credentials without claiming to save them and clears on close', () => {
    const fixture = TestBed.createComponent(SaveAssessment);
    fixture.detectChanges();
    const app = fixture.componentInstance;
    app.form.setValue({ email: 'invalid', password: '123', confirm: '456' });
    app.submit();
    expect(app.invalid()).toBe(true);
    app.form.setValue({
      email: 'student@example.com',
      password: 'sample-password',
      confirm: 'different',
    });
    expect(app.invalid()).toBe(true);
    app.form.controls.confirm.setValue('sample-password');
    app.submit();
    fixture.detectChanges();
    expect(app.invalid()).toBe(false);
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('[role="alert"]')?.textContent).toContain('not available yet');
    root.querySelector('dialog')!.dispatchEvent(new Event('cancel'));
    expect(app.form.getRawValue()).toEqual({ email: '', password: '', confirm: '' });
    expect(app.attempted()).toBe(false);
    expect(root.querySelectorAll('.agency-grid article')).toHaveLength(2);
  });
});
