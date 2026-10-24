// Bogotá is UTC-5: a date computed in UTC instead of local time shows up here as the wrong day,
// whatever timezone the machine running the tests is in.
process.env.TZ = 'America/Bogota';

import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
