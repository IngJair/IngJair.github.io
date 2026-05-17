import { useSiteContent } from '../../context/SiteContentContext';
import { AdminSection, AdminField } from './AdminField';

export default function FooterPanel() {
  const { content, updateContent } = useSiteContent();
  const { footer } = content;

  return (
    <AdminSection title="Footer" description="Texto del pie de página">
      <AdminField label="Tagline del footer">
        <textarea className="admin-textarea" rows={2} value={footer.tagline}
          onChange={e => updateContent('footer.tagline', e.target.value)} />
      </AdminField>
      <AdminField label="Texto de copyright">
        <input className="admin-input" value={footer.copyright}
          onChange={e => updateContent('footer.copyright', e.target.value)} />
      </AdminField>
    </AdminSection>
  );
}
