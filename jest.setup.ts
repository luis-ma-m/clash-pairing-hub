import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill TextEncoder/TextDecoder for testing environment
if (!global.TextEncoder) {
  (global as unknown as { TextEncoder: typeof TextEncoder }).TextEncoder =
    TextEncoder;
}
if (!global.TextDecoder) {
  (global as unknown as { TextDecoder: typeof TextDecoder }).TextDecoder =
    TextDecoder;
}
