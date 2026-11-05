'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const NAV = [
  { href: '/search', label: 'Search' },
  { href: '/roles', label: 'Roles' },
  { href: '/companies', label: 'Companies' },
  { href: '/topics', label: 'Topics' },
];

export default function MainNav({ onNavigate, className, label = 'Main' }) {
  const path = usePathname() || '';
  return (
    <nav className={className} aria-label={label}>
      {NAV.map((n) => (
        <Link key={n.href} href={n.href} onClick={onNavigate} aria-current={path === n.href || path.startsWith(`${n.href}/`) ? 'page' : undefined}>
          {n.label}
        </Link>
      ))}
    </nav>
  );
}
