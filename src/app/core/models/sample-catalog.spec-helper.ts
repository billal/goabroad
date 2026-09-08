// Test-only imports validate the actual shipped files; application code loads via HttpClient.
import countries from '../../../../public/data/countries.json';
import cities from '../../../../public/data/cities.json';
import educationLevels from '../../../../public/data/education-levels.json';
import degreeLevels from '../../../../public/data/degree-levels.json';
import subjects from '../../../../public/data/subjects.json';
import institutions from '../../../../public/data/institutions.json';
import programs from '../../../../public/data/programs.json';
import countryGuides from '../../../../public/data/country-guides.json';
import visaGuides from '../../../../public/data/visa-guides.json';
import agencies from '../../../../public/data/agencies.json';

export const sampleCatalog = {
  countries,
  cities,
  educationLevels,
  degreeLevels,
  subjects,
  institutions,
  programs,
  countryGuides,
  visaGuides,
  agencies,
};
