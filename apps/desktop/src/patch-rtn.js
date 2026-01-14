import { Buffer } from 'buffer';
import process from 'process';

if (typeof window.global === 'undefined') {
  window.global = window;
}

window.Buffer = Buffer;
window.process = process;
