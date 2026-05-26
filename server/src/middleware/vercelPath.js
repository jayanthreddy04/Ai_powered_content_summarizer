/**
 * Normalize request paths for Vercel serverless → Express.
 * Vercel may send /api/summarize/file, /summarize/file, or ?path=summarize&path=file
 */
export const vercelPathNormalizer = (req, _res, next) => {
  const queryString = req.url?.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  let pathname = req.url?.split('?')[0] || '/';

  if (req.query?.path) {
    const segments = Array.isArray(req.query.path) ? req.query.path : [req.query.path];
    pathname = `/${segments.join('/')}`;
  } else if (pathname.startsWith('/api/')) {
    pathname = pathname.slice(4);
  } else if (pathname === '/api') {
    pathname = '/';
  }

  if (!pathname.startsWith('/')) {
    pathname = `/${pathname}`;
  }

  req.url = pathname + queryString;
  next();
};
