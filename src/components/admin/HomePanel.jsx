import { useSiteContent } from '../../context/SiteContentContext';
import { AdminSection, AdminField } from './AdminField';
import { ImageUploadZone } from '../../lib/useStorageUpload';

export default function HomePanel() {
  const { content, update } = useSiteContent();
  const { hero, intro, cta } = content;

  return (
    <div>
      <AdminSection title="Hero Principal" description="La primera sección que ven los visitantes">
        <AdminField label="Imagen de fondo del Hero (JPG/PNG/WebP, máx 2MB — recomendado 1920×1080)">
          <ImageUploadZone
            currentUrl={hero.backgroundImage}
            onUploaded={url => update('hero.backgroundImage', url)}
            folder="imagenes"
            label="Click para subir imagen del hero (recomendado: 1920×1080)"
            aspectRatio="16/5"
          />
        </AdminField>

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


export default function HomePanel() {
  const { content, update } = useSiteContent();
  const { hero, intro, cta } = content;
  const heroImgRef = useRef(null);
  const introImgRef = useRef(null);

  const handleImageUpload = (e, path) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => update(path, ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <AdminSection title="Hero Principal" description="La primera sección que ven los visitantes">
        <AdminField label="Imagen de fondo del Hero">
          <div className="admin-image-upload" onClick={() => heroImgRef.current.click()}>
            {hero.backgroundImage
              ? <img src={hero.backgroundImage} alt="Hero" className="admin-image-preview" />
              : <div className="admin-image-placeholder">
                  <span className="material-symbols-outlined">add_photo_alternate</span>
                  <span>Click para subir imagen (recomendado: 1920×1080)</span>
                </div>
            }
          </div>
          <input ref={heroImgRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => handleImageUpload(e, 'hero.backgroundImage')} />
        </AdminField>

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
        <AdminField label="Foto del fotógrafo / equipo">
          <div className="admin-image-upload" onClick={() => introImgRef.current.click()}>
            {intro.image
              ? <img src={intro.image} alt="Intro" className="admin-image-preview" />
              : <div className="admin-image-placeholder">
                  <span className="material-symbols-outlined">add_photo_alternate</span>
                  <span>Click para subir imagen (recomendado: 600×800)</span>
                </div>
            }
          </div>
          <input ref={introImgRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => handleImageUpload(e, 'intro.image')} />
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
