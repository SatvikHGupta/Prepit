// The visible breadcrumb strip is gone on purpose. Only the structured data stays, so search engines still get the trail.
export function breadcrumbLd(items, abs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.label, ...(it.href ? { item: abs(it.href) } : {}) })),
  };
}
