import Link from 'next/link';
import Icon, { LogoMark } from '@/components/ui/Icon';
import MainNav from './MainNav';
import MobileMenu from './MobileMenu';
import SearchHotkey from './SearchHotkey';
import SavedLink from './SavedLink';

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-row">
        <Link href="/" className="logo" aria-label="Prepit home">
          <LogoMark />
          <span>Prepit</span>
        </Link>
        <MainNav className="main-nav" />
        <span className="header-spacer" />
        <form action="/search" role="search" className="header-search">
          <Icon name="search" />
          <input id="site-search" type="search" name="q" placeholder="Search problems" aria-label="Search problems" aria-keyshortcuts="/" autoComplete="off" />
          <kbd aria-hidden="true">/</kbd>
        </form>
        <SearchHotkey />
        <SavedLink />
        {/* one control for mode and accent: the Appearance page */}
        <Link href="/appearance" className="icon-btn" aria-label="Appearance: mode and colour"><Icon name="palette" /></Link>
        <MobileMenu />
      </div>
    </header>
  );
}
