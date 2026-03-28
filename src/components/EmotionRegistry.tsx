'use client';

import { useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

export function EmotionRegistry({ children }: { children: React.ReactNode }) {
  const [cache] = useState(() => {
    const c = createCache({ key: 'css' });
    c.compat = true;
    return c;
  });

  useServerInsertedHTML(() => {
    const entries = (cache as any).inserted;
    if (!entries || Object.keys(entries).length === 0) return null;

    const styles = Object.values(entries).join('');
    const dataEmotionAttribute = `${cache.key} ${Object.keys(entries).join(' ')}`;

    // Clear inserted styles so they aren't re-inserted
    (cache as any).inserted = {};

    return (
      <style
        data-emotion={dataEmotionAttribute}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
