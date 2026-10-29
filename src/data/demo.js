import { initialContent } from './initialContent';

// Explicit read-only preview of supplied information. Production never enables
// demo and cannot save changes to these bundled records.
export const demoContent = structuredClone(initialContent);
