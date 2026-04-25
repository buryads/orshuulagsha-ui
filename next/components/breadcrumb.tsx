// TODO i18n: port hardcoded strings to t(...) using next-intl
import { Link } from '@/i18n/navigation';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-2">
            {item.href ? (
              <Link href={item.href} className="hover:text-primary">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
            {idx < items.length - 1 && <span aria-hidden="true">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
