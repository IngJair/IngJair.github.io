import { useSiteContent } from '../../context/SiteContentContext';
import { AdminSection, AdminField } from './AdminField';

export default function ContactPanel() {
  const { content, updateContent } = useSiteContent();
  const { contact } = content;

  return (
    <AdminSection title="Información de Contacto" description="Estos datos aparecen en la página de Contact y el Footer">
      <div className="admin-row">
        <AdminField label="Número WhatsApp (con código de país)" hint="Ej: +34600000000">
          <input className="admin-input" value={contact.whatsapp}
            onChange={e => updateContent('contact.whatsapp', e.target.value)} />
        </AdminField>
        <AdminField label="Link WhatsApp completo" hint="https://wa.me/34600000000">
          <input className="admin-input" value={contact.whatsappLink}
            onChange={e => updateContent('contact.whatsappLink', e.target.value)} />
        </AdminField>
      </div>
      <div className="admin-row">
        <AdminField label="Email">
          <input className="admin-input" type="email" value={contact.email}
            onChange={e => updateContent('contact.email', e.target.value)} />
        </AdminField>
        <AdminField label="Instagram (@usuario)">
          <input className="admin-input" value={contact.instagram}
            onChange={e => updateContent('contact.instagram', e.target.value)} />
        </AdminField>
      </div>
      <div className="admin-row">
        <AdminField label="Dirección">
          <input className="admin-input" value={contact.address}
            onChange={e => updateContent('contact.address', e.target.value)} />
        </AdminField>
        <AdminField label="Ciudad, País">
          <input className="admin-input" value={contact.city}
            onChange={e => updateContent('contact.city', e.target.value)} />
        </AdminField>
      </div>
    </AdminSection>
  );
}
