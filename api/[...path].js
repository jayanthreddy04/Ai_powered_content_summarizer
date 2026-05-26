/**
 * Vercel catch-all entry for /api/* routes.
 *
 * Keep this separate from api/index.js so both /api and nested API paths
 * resolve to the same Express app without flattening the request URL.
 */
export { config, default } from './index.js';
