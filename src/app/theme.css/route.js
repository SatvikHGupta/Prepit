import { THEME_CSS } from '@/theme/css.js';

export const dynamic = 'force-static';

export function GET() {
  return new Response(THEME_CSS, {
    headers: { 'content-type': 'text/css; charset=utf-8', 'cache-control': 'public, max-age=31536000, immutable' },
  });
}
