*** Begin Patch
*** Update File: jest.setup.ts
@@
-import '@testing-library/jest-dom';
-import { TextEncoder, TextDecoder } from 'util';
+import '@testing-library/jest-dom';
+import { TextEncoder, TextDecoder } from 'util';

-<<<<<<< codex/update-createteam-handler-with-validation-and-error-handling
-// Polyfill TextEncoder/TextDecoder for the test environment before requiring jsdom
-=======
// Polyfill TextEncoder/TextDecoder before importing jsdom
->>>>>>> main
+// Polyfill TextEncoder/TextDecoder before requiring jsdom

 if (typeof global.TextEncoder === 'undefined') {
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   (global as any).TextEncoder = TextEncoder;
 }
 if (typeof global.TextDecoder === 'undefined') {
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   (global as any).TextDecoder = TextDecoder;
 }

 import { JSDOM } from 'jsdom';

-<<<<<<< codex/update-createteam-handler-with-validation-and-error-handling
-
-=======
->>>>>>> main
 // Basic DOM polyfill for the test runner
 if (typeof document === 'undefined') {
   const dom = new JSDOM('<!doctype html><html><body></body></html>');
@@
 // Ensure TextEncoder/TextDecoder exist in the JSDOM environment
 if (typeof globalThis.TextEncoder === 'undefined') {
   // @ts-ignore
   globalThis.TextEncoder = TextEncoder;
 }
 if (typeof globalThis.TextDecoder === 'undefined') {
   // @ts-ignore
   globalThis.TextDecoder = TextDecoder;
 }
*** End Patch
