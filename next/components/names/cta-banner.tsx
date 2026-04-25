// TODO i18n: port hardcoded strings to t(...) using next-intl
import type { ReactElement } from 'react';
import { Icon } from '@/components/ui/icon';

export function CtaBanner(): ReactElement {
  return (
    <section
      className="card"
      style={{
        marginTop: 32,
        padding: 32,
        textAlign: 'center',
        background:
          'linear-gradient(135deg, var(--primary-50) 0%, var(--accent-warm-soft) 100%)',
        border: '1px solid transparent',
      }}
    >
      <h3 style={{ fontSize: 22, fontWeight: 700 }}>Не нашли нужное имя?</h3>
      <p
        style={{
          color: 'var(--text-muted)',
          margin: '8px 0 18px',
          fontSize: 14,
        }}
      >
        Помогите расширить базу — предложите имя или историю своей семьи
      </p>
      <div
        style={{
          display: 'inline-flex',
          gap: 8,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <button type="button" className="btn btn-primary">
          <Icon name="plus" size={14} /> Предложить имя
        </button>
        <button type="button" className="btn btn-secondary">
          Скачать список
        </button>
      </div>
    </section>
  );
}
