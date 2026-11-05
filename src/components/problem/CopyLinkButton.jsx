'use client';
import { useState } from 'react';
import Icon from '@/components/ui/Icon';

export default function CopyLinkButton() {
  const [done, setDone] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href.split('#')[0]);
      setDone(true);
      setTimeout(() => setDone(false), 1800);
    } catch {}
  }
  return (
    <button type="button" className="btn" onClick={copy}>
      <Icon name={done ? 'check' : 'copy'} />
      <span aria-live="polite">{done ? 'Link copied' : 'Copy link'}</span>
    </button>
  );
}
