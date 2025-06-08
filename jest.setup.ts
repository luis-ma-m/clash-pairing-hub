import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill TextEncoder/TextDecoder for testing environment
if (!global.TextEncoder) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).TextEncoder = TextEncoder;
}
if (!global.TextDecoder) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).TextDecoder = TextDecoder;
}
