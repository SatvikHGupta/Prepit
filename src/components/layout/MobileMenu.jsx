'use client';
import { useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import MainNav from './MainNav';

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <button type="button" className="icon-btn menu-btn" aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((o) => !o)}>
        <Icon name={open ? 'close' : 'menu'} />
      </button>
      <div id="mobile-nav" className="mobile-nav" hidden={!open}>
        <div className="container">
          <form action="/search" role="search" className="header-search">
            <Icon name="search" />
            <input type="search" name="q" placeholder="Search problems" aria-label="Search problems" />
          </form>
          <MainNav label="Mobile" onNavigate={close} />
          <Link href="/bookmarks" onClick={close}>Saved problems</Link>
          <Link href="/appearance" onClick={close}>Appearance</Link>
        </div>
      </div>
    </>
  );
}
