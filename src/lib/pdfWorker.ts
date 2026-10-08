// The worker pdf.js does its parsing in. Older browsers lack a few very new JavaScript features
// pdf.js 6 relies on (needed to open locked PDFs), so they are added here before pdf.js starts.
import './polyfills';
import 'pdfjs-dist/build/pdf.worker.min.mjs';
