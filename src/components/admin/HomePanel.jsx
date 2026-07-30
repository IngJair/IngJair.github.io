import { useSiteContent } from '../../context/useSiteContent';
import { AdminSection, AdminField } from './AdminField';
import ImageUploadZone from './ImageUploadZone';

export default function HomePanel() {
  const { content, update } = useSiteContent();
  const { hero, intro, cta } = content;

  return (
    <div>
      <AdminSection title="Hero Principal" description="La primera sección que ven los visitantes">
        <div className="admin-row" style={{ gap: 24, marginBottom: 24 }}>
          <div style={{ flex: 1 }}>
            <AdminField label="Imagen para PC / Desktop (Recomendado: 1920×1080 o 1600×900)">
              <ImageUploadZone
                currentUrl={hero.backgroundImage}
                onUploaded={url => update('hero.backgroundImage', url)}
                folder="imagenes"
                label="Click para subir imagen de PC (1920×1080)"
                aspectRatio="16/9"
                isHero={true}
              />
            </AdminField>
          </div>
          <div style={{ flex: 1 }}>
            <AdminField label="Imagen para móvil / Celular (Recomendado: 1080×1920 o 900×1600)">
              <ImageUploadZone
                currentUrl={hero.mobileBackgroundImage}
                onUploaded={url => update('hero.mobileBackgroundImage', url)}
                folder="imagenes"
                label="Click para subir imagen móvil (1080×1920)"
                aspectRatio="9/16"
                isHero={true}
              />
            </AdminField>
          </div>
        </div>

        <div className="admin-row">
          <div style={{ flex: 1 }}>
            <AdminField label="Enfoque de la imagen (Desktop)">
              <select className="admin-input" value={hero.imagePosition || 'center center'}
                onChange={e => update('hero.imagePosition', e.target.value)}>
                <option value="center center">Centro</option>
                <option value="center top">Arriba</option>
                <option value="center bottom">Abajo</option>
                <option value="left center">Izquierda</option>
                <option value="right center">Derecha</option>
              </select>
            </AdminField>
          </div>
          <div style={{ flex: 1 }}>
            <AdminField label="Enfoque de la imagen (Móvil)">
              <select className="admin-input" value={hero.mobileImagePosition || 'center center'}
                onChange={e => update('hero.mobileImagePosition', e.target.value)}>
                <option value="center center">Centro</option>
                <option value="center top">Arriba</option>
                <option value="center bottom">Abajo</option>
                <option value="left center">Izquierda</option>
                <option value="right center">Derecha</option>
              </select>
            </AdminField>
          </div>
        </div>

        <AdminField label="Título principal">
          <textarea className="admin-textarea" rows={2} value={hero.title}
            onChange={e => update('hero.title', e.target.value)} />
        </AdminField>

        <AdminField label="Subtítulo">
          <textarea className="admin-textarea" rows={2} value={hero.subtitle}
            onChange={e => update('hero.subtitle', e.target.value)} />
        </AdminField>

        <div className="admin-row">
          <div style={{ flex: 1 }}>
            <AdminField label="Texto botón primario">
              <input className="admin-input" value={hero.ctaPrimary}
                onChange={e => update('hero.ctaPrimary', e.target.value)} />
            </AdminField>
            <AdminField label="Link botón primario">
              <input className="admin-input" value={hero.ctaPrimaryDestination}
                onChange={e => update('hero.ctaPrimaryDestination', e.target.value)} placeholder="/portfolio" />
            </AdminField>
          </div>
          <div style={{ flex: 1 }}>
            <AdminField label="Texto botón secundario">
              <input className="admin-input" value={hero.ctaSecondary}
                onChange={e => update('hero.ctaSecondary', e.target.value)} />
            </AdminField>
            <AdminField label="Link botón secundario">
              <input className="admin-input" value={hero.ctaSecondaryDestination}
                onChange={e => update('hero.ctaSecondaryDestination', e.target.value)} placeholder="/contact" />
            </AdminField>
          </div>
        </div>
      </AdminSection>

      <AdminSection title="Sección 'El Arte detrás de la Lente'" description="Sección introductoria con foto y texto">
        <AdminField label="Foto del fotógrafo / equipo (JPG/PNG/WebP, máx 2MB — recomendado 600×800)">
          <ImageUploadZone
            currentUrl={intro.image}
            onUploaded={url => update('intro.image', url)}
            folder="imagenes"
            label="Click para subir imagen del equipo (recomendado: 600×800)"
            aspectRatio="3/4"
          />
        </AdminField>

        <AdminField label="Etiqueta (ej: NUESTRA HISTORIA)">
          <input className="admin-input" value={intro.tag}
            onChange={e => update('intro.tag', e.target.value)} />
        </AdminField>

        <AdminField label="Título">
          <input className="admin-input" value={intro.title}
            onChange={e => update('intro.title', e.target.value)} />
        </AdminField>

        <AdminField label="Texto descriptivo">
          <textarea className="admin-textarea" rows={4} value={intro.body}
            onChange={e => update('intro.body', e.target.value)} />
        </AdminField>
      </AdminSection>

      <AdminSection title="Sección CTA Final (fondo negro)">
        <AdminField label="Título">
          <textarea className="admin-textarea" rows={2} value={cta.title}
            onChange={e => update('cta.title', e.target.value)} />
        </AdminField>
        <AdminField label="Subtítulo">
          <input className="admin-input" value={cta.subtitle}
            onChange={e => update('cta.subtitle', e.target.value)} />
        </AdminField>
      </AdminSection>
    </div>
  );
}
