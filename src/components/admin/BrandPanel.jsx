import { useSiteContent } from '../../context/useSiteContent';
import { AdminSection, AdminField } from './AdminField';

export default function BrandPanel() {
  const { content, updateContent } = useSiteContent();
  const { brand } = content;

  return (
    <div>
      <AdminSection title="Marca & Logo" description="Información principal de tu marca">
        <AdminField label="Nombre del negocio">
          <input
            className="admin-input"
            value={brand.name}
            onChange={e => updateContent('brand.name', e.target.value)}
          />
        </AdminField>
        <AdminField label="Tagline / Slogan" hint="Aparece en el hero y meta tags">
          <input
            className="admin-input"
            value={brand.tagline}
            onChange={e => updateContent('brand.tagline', e.target.value)}
          />
        </AdminField>
        <AdminField label="Descripción corta" hint="Aparece en el footer">
          <textarea
            className="admin-textarea"
            rows={3}
            value={brand.description}
            onChange={e => updateContent('brand.description', e.target.value)}
          />
        </AdminField>
        <AdminField label="Texto del logo — Script (Great Vibes)" hint='Ejemplo: "Elky"'>
          <input
            className="admin-input"
            value={brand.logo.elky}
            onChange={e => updateContent('brand.logo.elky', e.target.value)}
          />
        </AdminField>
        <AdminField label='Texto del logo — Caps (Montserrat)' hint='Ejemplo: "Studio"'>
          <input
            className="admin-input"
            value={brand.logo.studio}
            onChange={e => updateContent('brand.logo.studio', e.target.value)}
          />
        </AdminField>
      </AdminSection>
    </div>
  );
}
