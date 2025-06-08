import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill TextEncoder/TextDecoder before requiring jsdom
if (typeof globalThis.TextEncoder === 'undefined') {
  // @ts-ignore
  globalThis.TextEncoder = TextEncoder;
}
if (typeof globalThis.TextDecoder === 'undefined') {
  // @ts-ignore
  globalThis.TextDecoder = TextDecoder;
}

import { JSDOM } from 'jsdom';

// Basic DOM polyfill for bun test runner
if (typeof document === 'undefined') {
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  // @ts-ignore
  global.window = dom.window;
  // @ts-ignore
  global.document = dom.window.document;
  // @ts-ignore
  global.navigator = dom.window.navigator;
}
