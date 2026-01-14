// apps/desktop/src/patch-rtn.js
import { Buffer } from 'buffer';

// Polyfill global de Buffer para el navegador
if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer;
}
