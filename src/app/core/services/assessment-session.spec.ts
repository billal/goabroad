import { AssessmentSession } from './assessment-session';
import { profileFixture } from './eligibility.spec-helper';
describe('Completed assessment memory', () => {
  it('copies the profile, clears explicitly, and never persists across service recreation', () => {
    const session = new AssessmentSession();
    const profile = profileFixture();
    session.set(profile);
    expect(session.profile()).toEqual(profile);
    expect(session.profile()).not.toBe(profile);
    expect(new AssessmentSession().profile()).toBeNull();
    session.clear();
    expect(session.profile()).toBeNull();
  });
});
