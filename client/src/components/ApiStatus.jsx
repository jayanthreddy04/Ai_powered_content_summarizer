import { useEffect, useState } from 'react';
import { healthCheck } from '../api/client';

export default function ApiStatus() {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    healthCheck()
      .then(() => setStatus('online'))
      .catch(() => setStatus('offline'));
  }, []);

  if (status === 'checking' || status === 'online') return null;

  return (
    <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
      <strong>Backend offline.</strong> Start the API:{' '}
      <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">
        cd server && npm run dev
      </code>{' '}
      — then refresh this page.
    </div>
  );
}
