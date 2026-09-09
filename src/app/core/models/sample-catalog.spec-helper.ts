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

export const shippedCatalog = {
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

// Stable minimal fixtures for validation/matching edge cases; pilot contents are tested separately.
export const sampleCatalog = {
  ...shippedCatalog,
  countries: {
    ...countries,
    data: countries.data.slice(0, 1),
    pagination: { ...countries.pagination, totalItems: 1, totalPages: 1 },
  },
  cities: {
    ...cities,
    data: [],
    pagination: { ...cities.pagination, totalItems: 0, totalPages: 0 },
  },
  subjects: {
    ...subjects,
    data: subjects.data.slice(0, 2),
    pagination: { ...subjects.pagination, totalItems: 2, totalPages: 1 },
  },
  institutions: {
    ...institutions,
    data: [],
    pagination: { ...institutions.pagination, totalItems: 0, totalPages: 0 },
  },
  programs: {
    ...programs,
    data: [],
    pagination: { ...programs.pagination, totalItems: 0, totalPages: 0 },
  },
};
