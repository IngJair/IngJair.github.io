import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSiteContent } from '../../context/useSiteContent';
import { EditableSection, EditableText } from './EditorHelpers';

export default function AdminServices() {
  const { content, update } = useSiteContent();
  const [editingSection, setEditingSection] = useState(null);
  const isEditing = (key) => editingSection === key;

  const servicesContent = content.services || {};
  const portfolio = content.portfolio || {};
  const portfolioCategories = (portfolio.categories || []).filter(c => c !== 'Todos');

  return (
    <div className="admin-page-content">
      {/* HERO */}
      <EditableSection sectionKey="svc-hero" label="Hero de Servicios"
        onEdit={setEditingSection} isEditing={isEditing('svc-hero')}>
        <section style={{ padding: 'clamp(60px,10vw,120px) clamp(24px,8vw,120px)', textAlign: 'center', background: '#fafafa' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 8 }}>
            <EditableText tag="h1"
              value={servicesContent.hero?.title || 'Servicios y Paquetes'}
              onChange={v => update('services.hero.title', v)}
              isEditing={isEditing('svc-hero')}
              style={{ fontSize: 'clamp(2.5rem,6vw,4rem)', fontFamily: 'Playfair Display,serif', color: '#0a0a0a', marginBottom: 24 }} />
          </div>
          <EditableText tag="p"
            value={servicesContent.hero?.subtitle || ''}
            onChange={v => update('services.hero.subtitle', v)}
            isEditing={isEditing('svc-hero')}
            style={{ fontSize: 16, color: '#666', maxWidth: 700, margin: '0 auto', lineHeight: 1.7 }} />
        </section>
      </EditableSection>

      {/* BANNER */}
      <EditableSection sectionKey="svc-banner" label="Banner de Oferta"
        onEdit={setEditingSection} isEditing={isEditing('svc-banner')}>
        <section style={{ background: '#0a0a0a', padding: '24px clamp(24px,8vw,120px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 32, maxWidth: 1200, margin: '0 auto' }}>
            <div>
              <EditableText tag="span"
                value={servicesContent.banner?.tag || 'Oferta de Temporada'}
                onChange={v => update('services.banner.tag', v)}
                isEditing={isEditing('svc-banner')}
                style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#bf953f', marginBottom: 8 }} />
              <EditableText tag="h3"
                value={servicesContent.banner?.title || ''}
                onChange={v => update('services.banner.title', v)}
                isEditing={isEditing('svc-banner')}
                style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontFamily: 'Playfair Display,serif', color: '#fff', marginBottom: 8 }} />
              <EditableText tag="p"
                value={servicesContent.banner?.description || ''}
                onChange={v => update('services.banner.description', v)}
                isEditing={isEditing('svc-banner')}
                style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }} />
            </div>
            {isEditing('svc-banner') && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontSize: 13, cursor: 'pointer', flexShrink: 0 }}>
                <input type="checkbox" checked={servicesContent.banner?.active !== false}
                  onChange={e => update('services.banner.active', e.target.checked)} />
                Banner visible
              </label>
            )}

          </div>
        </section>
      </EditableSection>

      {/* PAQUETES POR CATEGORÍA — SECCIÓN PRINCIPAL */}
      <EditableSection sectionKey="svc-packages" label="Paquetes de Precios"
        onEdit={setEditingSection} isEditing={isEditing('svc-packages')}>
        <section style={{ padding: 'clamp(60px,10vw,120px) clamp(24px,8vw,120px)', background: '#fff' }}>
          {isEditing('svc-packages') ? (
            <PackagesCategoryEditor
              basePackages={servicesContent.basePackages || []}
              categoryOverrides={servicesContent.categoryOverrides || {}}
              portfolioCategories={portfolioCategories}
              onUpdateBase={pkgs => update('services.basePackages', pkgs)}
              onUpdateOverride={(cat, data) => update(`services.categoryOverrides.${cat}`, data)}
            />
          ) : (
            <PackagesPreview
              basePackages={servicesContent.basePackages || []}
              categoryOverrides={servicesContent.categoryOverrides || {}}
              portfolioCategories={portfolioCategories}
            />
          )}
        </section>
      </EditableSection>

      {/* MENSAJE DE WHATSAPP */}
      <EditableSection sectionKey="svc-whatsapp" label="Mensaje de WhatsApp"
        onEdit={setEditingSection} isEditing={isEditing('svc-whatsapp')}>
        <section style={{ padding: '40px clamp(24px,8vw,120px)', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <span className="material-symbols-outlined" style={{ color: '#bf953f', fontSize: 28 }}>chat_bubble</span>
              <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontFamily: 'Playfair Display,serif', margin: 0 }}>Mensaje de WhatsApp al consultar paquete</h2>
            </div>

            {isEditing('svc-whatsapp') ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* INSTRUCCIONES */}
                <div style={{ background: '#f5f5f5', borderRadius: 8, padding: '12px 16px' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#666', marginBottom: 8 }}>
                    Variables disponibles (cópialas tal cual):
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {['{{paquete}}', '{{seccion}}', '{{descripcion}}', '{{precio}}', '{{negocio}}'].map(v => (
                      <code key={v} style={{
                        background: '#e8e8e8', padding: '3px 8px',
                        borderRadius: 4, fontSize: 12, fontFamily: 'monospace',
                        cursor: 'pointer', userSelect: 'all'
                      }}
                      onClick={() => navigator.clipboard?.writeText(v)}
                      title="Clic para copiar"
                      >{v}</code>
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: '#aaa', marginTop: 8 }}>
                    Haz clic en una variable para copiarla al portapapeles.
                  </p>
                </div>

                {/* TEXTAREA */}
                <textarea
                  value={content.contact?.whatsappMessageTemplate || ''}
                  onChange={e => update('contact.whatsappMessageTemplate', e.target.value)}
                  rows={10}
                  style={{
                    width: '100%', padding: '12px', border: '1px solid #e0e0e0',
                    borderRadius: 8, fontSize: 13, fontFamily: 'monospace',
                    lineHeight: 1.6, resize: 'vertical', boxSizing: 'border-box'
                  }}
                  placeholder="Escribe aquí la plantilla del mensaje..."
                />

                {/* VISTA PREVIA */}
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: 12 }}>Vista previa (con datos de ejemplo):</h4>
                  <div style={{
                    background: '#dcf8c6', borderRadius: '0 12px 12px 12px',
                    padding: '12px 16px', fontSize: 13, lineHeight: 1.7,
                    whiteSpace: 'pre-wrap', maxWidth: 380,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    fontFamily: 'system-ui, sans-serif'
                  }}>
                    {(content.contact?.whatsappMessageTemplate || '')
                      .replace(/{{paquete}}/g, 'Fotos y Video Premium')
                      .replace(/{{seccion}}/g, 'Bodas')
                      .replace(/{{descripcion}}/g, '• Grabacion completa\n• Edicion profesional\n• Entrega en USB')
                      .replace(/{{precio}}/g, 'S/600')
                      .replace(/{{negocio}}/g, content.brand?.name || 'Elky Studio')}
                  </div>
                  <p style={{ fontSize: 11, color: '#aaa', marginTop: 8 }}>
                    Así verá el mensaje el cliente en WhatsApp antes de enviarlo.
                  </p>
                </div>

                {/* BOTÓN RESET */}
                <button
                  onClick={() => {
                    if (confirm('¿Restaurar el mensaje por defecto?')) {
                      update('contact.whatsappMessageTemplate', `Hola! Me interesa el siguiente paquete:

Paquete: {{paquete}}
Seccion: {{seccion}}
Incluye:
{{descripcion}}
Precio: {{precio}}

Podrias darme mas informacion?`);
                    }
                  }}
                  style={{
                    alignSelf: 'flex-start', background: 'none', border: '1px solid #e0e0e0',
                    padding: '6px 12px', borderRadius: 4, fontSize: 11, cursor: 'pointer', color: '#666'
                  }}
                >
                  Restaurar mensaje por defecto
                </button>
              </div>
            ) : (
              <div style={{ padding: '16px', background: '#f9f9f9', borderRadius: 8, border: '1px solid #eee' }}>
                <p style={{ margin: 0, color: content.contact?.whatsappMessageTemplate ? '#2e7d32' : '#d32f2f', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                    {content.contact?.whatsappMessageTemplate ? 'check_circle' : 'warning'}
                  </span>
                  {content.contact?.whatsappMessageTemplate ? 'Mensaje personalizado configurado' : 'Sin mensaje configurado'}
                </p>
              </div>
            )}
          </div>
        </section>
      </EditableSection>
    </div>

  );
}

function PackagesCategoryEditor({ basePackages, categoryOverrides, portfolioCategories, onUpdateBase, onUpdateOverride }) {
  const [activeTab, setActiveTab] = useState('base');
  const tabs = [
    { id: 'base', label: 'Paquetes Base', icon: 'package_2' },
    ...portfolioCategories.map(cat => ({ id: cat, label: cat, icon: getCategoryIcon(cat) })),
  ];

  return (
    <motion.div className="inline-editor-panel" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #f0e8d0' }}>
        {tabs.map(tab => (
          <button key={tab.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', border: '1px solid',
              borderColor: activeTab === tab.id ? '#bf953f' : '#e0e0e0',
              background: activeTab === tab.id ? '#fef9ee' : '#fff',
              color: activeTab === tab.id ? '#bf953f' : '#555',
              borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 600,
            }}
            onClick={() => setActiveTab(tab.id)}>
            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
        <span style={{ fontSize: 11, color: '#aaa', display: 'flex', alignItems: 'center', marginLeft: 8 }}>
          (Las categorías se gestionan en el editor del Portafolio)
        </span>
      </div>

      {activeTab === 'base' && (
        <BasePackagesEditor
          packages={basePackages}
          onUpdate={onUpdateBase}
        />
      )}

      {activeTab !== 'base' && (
        <CategoryPackageEditor
          categoryName={activeTab}
          basePackages={basePackages}
          override={categoryOverrides[activeTab] || {
            multiplier: 1, note: '', active: true,
            packageOverrides: {}, extraPackages: []
          }}
          onUpdate={(data) => onUpdateOverride(activeTab, data)}
        />
      )}
    </motion.div>
  );
}

function BasePackagesEditor({ packages, onUpdate }) {
  const updatePkg = (index, field, value) => {
    const updated = [...packages];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate(updated);
  };

  const updateFeature = (pkgIdx, featIdx, value) => {
    const updated = [...packages];
    const feats = [...updated[pkgIdx].features];
    feats[featIdx] = value;
    updated[pkgIdx] = { ...updated[pkgIdx], features: feats };
    onUpdate(updated);
  };

  const addFeature = (pkgIdx) => {
    const updated = [...packages];
    updated[pkgIdx].features.push('Nueva característica');
    onUpdate([...updated]);
  };

  const removeFeature = (pkgIdx, featIdx) => {
    const updated = [...packages];
    updated[pkgIdx].features.splice(featIdx, 1);
    onUpdate([...updated]);
  };

  const addPackage = () => {
    const newPkg = {
      id: `pkg-${Date.now()}`, title: 'Nuevo Paquete', subtitle: 'Descripción',
      basePrice: 1000, currency: 'S/', isPrimary: false, image: '', features: ['Característica 1']
    };
    onUpdate([...packages, newPkg]);
  };

  const removePkg = (index) => {
    if (!confirm('¿Eliminar este paquete base?')) return;
    onUpdate(packages.filter((_, i) => i !== index));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <p style={{ fontSize: 13, color: '#888' }}>
        Los paquetes base son la plantilla para todas las categorías. Puedes ajustar precios e imágenes por categoría en cada tab.
      </p>

      {packages.map((pkg, i) => (
        <div key={pkg.id} style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: 20, background: pkg.isPrimary ? '#fef9ee' : '#fafafa' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#bf953f', textTransform: 'uppercase' }}>Paquete {i + 1}</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                <input type="checkbox" checked={pkg.isPrimary}
                  onChange={e => updatePkg(i, 'isPrimary', e.target.checked)} />
                Destacado
              </label>
              <button onClick={() => removePkg(i)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c62828', display: 'flex', padding: 4 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Imagen del paquete</label>
            <label htmlFor={`pkg-img-${pkg.id}`} style={{ display: 'block', cursor: 'pointer', border: '2px dashed #e0e0e0', borderRadius: 6, overflow: 'hidden', height: 100 }}>
              {pkg.image
                ? <img src={pkg.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#aaa', fontSize: 13 }}>
                    <span className="material-symbols-outlined">add_photo_alternate</span>Subir imagen
                  </div>
              }
            </label>
            <input id={`pkg-img-${pkg.id}`} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => {
                const file = e.target.files[0]; if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => updatePkg(i, 'image', ev.target.result);
                reader.readAsDataURL(file);
              }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Título</label>
              <input style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }}
                value={pkg.title} onChange={e => updatePkg(i, 'title', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Subtítulo</label>
              <input style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }}
                value={pkg.subtitle} onChange={e => updatePkg(i, 'subtitle', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Precio base</label>
              <input type="number" style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }}
                value={pkg.basePrice} onChange={e => updatePkg(i, 'basePrice', Number(e.target.value))} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Moneda</label>
              <select style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }}
                value={pkg.currency} onChange={e => updatePkg(i, 'currency', e.target.value)}>
                <option value="€">€ Euro</option>
                <option value="$">$ Dólar</option>
                <option value="S/">S/ Sol</option>
                <option value="£">£ Libra</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Características</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {pkg.features.map((feat, j) => (
                <div key={j} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input style={{ flex: 1, padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13 }}
                    value={feat} onChange={e => updateFeature(i, j, e.target.value)} />
                  <button onClick={() => removeFeature(i, j)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ddd', display: 'flex', padding: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                  </button>
                </div>
              ))}
              <button onClick={() => addFeature(i)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: '1px dashed #ccc', borderRadius: 6, background: 'transparent', cursor: 'pointer', color: '#888', fontSize: 12 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                Agregar característica
              </button>
            </div>
          </div>
        </div>
      ))}

      <button onClick={addPackage}
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 24px', border: '2px dashed #bf953f', borderRadius: 8, background: 'transparent', cursor: 'pointer', color: '#bf953f', fontSize: 14, fontWeight: 700, width: '100%', justifyContent: 'center' }}>
        <span className="material-symbols-outlined">add_circle</span>
        Agregar nuevo paquete base
      </button>
    </div>
  );
}

function CategoryPackageEditor({ categoryName, basePackages, override, onUpdate }) {
  const updateOverride = (field, value) => onUpdate({ ...override, [field]: value });

  const updatePkgOverride = (pkgId, field, value) => {
    const pkgOverrides = override.packageOverrides || {};
    onUpdate({
      ...override,
      packageOverrides: {
        ...pkgOverrides,
        [pkgId]: { ...(pkgOverrides[pkgId] || {}), [field]: value }
      }
    });
  };

  const deletePkgFromCategory = (pkgId) => {
    if (!confirm(
      '¿Eliminar este paquete de ' + categoryName + '?\n\n' +
      'Solo se elimina en esta categoría. El paquete base sigue ' +
      'existiendo y puedes restaurarlo desde "Paquetes Base".'
    )) return
    onUpdate({
      ...override,
      packageOverrides: {
        ...(override.packageOverrides || {}),
        [pkgId]: {
          ...(override.packageOverrides?.[pkgId] || {}),
          deleted: true
        }
      }
    })
  }

  const restorePkg = (pkgId) => {
    onUpdate({
      ...override,
      packageOverrides: {
        ...(override.packageOverrides || {}),
        [pkgId]: {
          ...(override.packageOverrides?.[pkgId] || {}),
          deleted: false,
          hidden: false
        }
      }
    })
  }

  const addExtraPackage = () => {
    const extras = override.extraPackages || [];
    const newPkg = {
      id: `extra-${Date.now()}`, title: 'Paquete Exclusivo', subtitle: `Solo para ${categoryName}`,
      basePrice: 1200, currency: 'S/', isPrimary: false, image: '', features: ['Característica exclusiva']
    };
    onUpdate({ ...override, extraPackages: [...extras, newPkg] });
  };

  const updateExtraPkg = (index, field, value) => {
    const extras = [...(override.extraPackages || [])];
    extras[index] = { ...extras[index], [field]: value };
    onUpdate({ ...override, extraPackages: extras });
  };

  const removeExtraPkg = (index) => {
    if (!confirm('¿Eliminar este paquete exclusivo?')) return;
    onUpdate({ ...override, extraPackages: override.extraPackages.filter((_, i) => i !== index) });
  };

  const pkgOverrides = override.packageOverrides || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ padding: 16, background: '#fef9ee', borderRadius: 8, border: '1px solid #e8d9b5' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0a0a0a' }}>Configuración de {categoryName}</h3>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" checked={override.active !== false}
              onChange={e => updateOverride('active', e.target.checked)} />
            Activo en Servicios
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Multiplicador de precio ({override.multiplier || 1}x)
            </label>
            <input type="range" min="0.3" max="3" step="0.05"
              value={override.multiplier || 1}
              onChange={e => updateOverride('multiplier', parseFloat(e.target.value))}
              style={{ width: '100%' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#aaa', marginTop: 2 }}>
              <span>0.3x (descuento)</span>
              <span style={{ fontWeight: 700, color: '#bf953f' }}>{override.multiplier || 1}x</span>
              <span>3x (premium)</span>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Nota especial</label>
            <input style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }}
              placeholder={`Ej: Incluye sesión de ${categoryName}`}
              value={override.note || ''}
              onChange={e => updateOverride('note', e.target.value)} />
          </div>
        </div>
      </div>

      <div>
        <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0a0a0a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#bf953f' }}>tune</span>
          Ajustes por paquete para {categoryName}
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {basePackages.map(pkg => {
            const pkgOvr = pkgOverrides[pkg.id] || {}
            const calculatedPrice = Math.round(pkg.basePrice * (override.multiplier || 1))
            const isHidden = pkgOvr.hidden === true
            const isDeleted = pkgOvr.deleted === true

            if (isDeleted) return (
              <div key={pkg.id} style={{
                border: '1px dashed #e0e0e0', borderRadius: 8,
                padding: '12px 16px', background: '#fafafa',
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span className="material-symbols-outlined"
                    style={{ fontSize:18, color:'#ddd' }}>
                    delete
                  </span>
                  <span style={{ fontSize:13, color:'#aaa',
                    textDecoration:'line-through' }}>
                    {pkg.title}
                  </span>
                  <span style={{ fontSize:11, color:'#ccc' }}>
                    (eliminado de {categoryName})
                  </span>
                </div>
                <button onClick={() => restorePkg(pkg.id)} style={{
                  fontSize:12, padding:'4px 12px',
                  background:'#fff', border:'1px solid #e0e0e0',
                  borderRadius:6, cursor:'pointer', color:'#666',
                  display:'flex', alignItems:'center', gap:4
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize:14 }}>
                    restore
                  </span>
                  Restaurar
                </button>
              </div>
            )

            return (
              <div key={pkg.id} style={{
                border: '1px solid',
                borderColor: isHidden ? '#ffcdd2' : '#e0e0e0',
                borderRadius: 8, padding: 16,
                background: isHidden ? '#fff8f8' : '#fff',
                opacity: isHidden ? 0.75 : 1,
                transition: 'all 0.2s'
              }}>

                {/* ── FILA SUPERIOR: nombre del paquete base + toggle ocultar ── */}
                <div style={{ display:'flex', justifyContent:'space-between',
                  alignItems:'center', marginBottom:14 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:14, fontWeight:700, color:'#0a0a0a' }}>
                      {pkgOvr.customTitle || pkg.title}
                    </span>
                    <span style={{ fontSize:11, color:'#aaa' }}>
                      (base: {pkg.title})
                    </span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:12, color:'#888' }}>
                      Precio calculado: {pkgOvr.currency || pkg.currency || 'S/'}{calculatedPrice.toLocaleString()}
                    </span>
                    
                    <button
                      onClick={() => deletePkgFromCategory(pkg.id)}
                      title="Eliminar este paquete de esta categoría"
                      style={{
                        display:'flex', alignItems:'center', gap:4,
                        padding:'4px 10px',
                        background:'#fff', border:'1px solid #ffcdd2',
                        borderRadius:20, cursor:'pointer',
                        fontSize:12, fontWeight:600, color:'#e53935'
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize:14 }}>
                        delete
                      </span>
                      Eliminar
                    </button>

                    {/* Toggle ocultar */}
                    <label style={{
                      display:'flex', alignItems:'center', gap:6,
                      padding:'4px 10px',
                      background: isHidden ? '#ffebee' : '#e8f5e9',
                      borderRadius:20, cursor:'pointer', fontSize:12, fontWeight:600,
                      color: isHidden ? '#c62828' : '#2e7d32',
                      userSelect:'none'
                    }}>
                      <input type="checkbox"
                        checked={!isHidden}
                        onChange={e => updatePkgOverride(pkg.id, 'hidden', !e.target.checked)}
                        style={{ width:13, height:13 }}
                      />
                      {isHidden ? 'Oculto' : 'Visible'}
                    </label>
                  </div>
                </div>

                {/* Si está oculto, mostrar solo el toggle y un mensaje */}
                {isHidden && (
                  <p style={{ fontSize:12, color:'#e57373', margin:'0 0 8px',
                    display:'flex', alignItems:'center', gap:6 }}>
                    <span className="material-symbols-outlined" style={{ fontSize:15 }}>
                      visibility_off
                    </span>
                    Este paquete no aparece en {categoryName}. Actívalo para mostrarlo.
                  </p>
                )}

                {/* El resto del card solo se muestra si NO está oculto */}
                {!isHidden && (
                  <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

                    {/* Título y subtítulo personalizados */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      <div>
                        <label style={{ fontSize:11, fontWeight:700, color:'#888',
                          textTransform:'uppercase', display:'block', marginBottom:4 }}>
                          Título en {categoryName}
                        </label>
                        <input
                          style={{ width:'100%', padding:'7px 10px',
                            border:'1px solid #e0e0e0', borderRadius:6,
                            fontSize:13, boxSizing:'border-box' }}
                          placeholder={pkg.title}
                          value={pkgOvr.customTitle || ''}
                          onChange={e => updatePkgOverride(pkg.id, 'customTitle', e.target.value)}
                        />
                        <p style={{ fontSize:10, color:'#bbb', marginTop:3 }}>
                          Vacío = usa "{pkg.title}"
                        </p>
                      </div>
                      <div>
                        <label style={{ fontSize:11, fontWeight:700, color:'#888',
                          textTransform:'uppercase', display:'block', marginBottom:4 }}>
                          Subtítulo en {categoryName}
                        </label>
                        <input
                          style={{ width:'100%', padding:'7px 10px',
                            border:'1px solid #e0e0e0', borderRadius:6,
                            fontSize:13, boxSizing:'border-box' }}
                          placeholder={pkg.subtitle || ''}
                          value={pkgOvr.customSubtitle || ''}
                          onChange={e => updatePkgOverride(pkg.id, 'customSubtitle', e.target.value)}
                        />
                        <p style={{ fontSize:10, color:'#bbb', marginTop:3 }}>
                          Vacío = usa el subtítulo base
                        </p>
                      </div>
                    </div>

                    {/* Precio personalizado + moneda */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      <div>
                        <label style={{ fontSize:11, fontWeight:700, color:'#888',
                          textTransform:'uppercase', display:'block', marginBottom:4 }}>
                          Precio personalizado
                        </label>
                        <input type="number"
                          placeholder={`${calculatedPrice} (calculado)`}
                          style={{ width:'100%', padding:'7px 10px',
                            border:'1px solid #e0e0e0', borderRadius:6,
                            fontSize:13, boxSizing:'border-box' }}
                          value={pkgOvr.customPrice || ''}
                          onChange={e => updatePkgOverride(pkg.id, 'customPrice',
                            e.target.value ? Number(e.target.value) : null)}
                        />
                        <p style={{ fontSize:10, color:'#bbb', marginTop:3 }}>
                          Vacío = usa multiplicador
                        </p>
                      </div>
                      <div>
                        <label style={{ fontSize:11, fontWeight:700, color:'#888',
                          textTransform:'uppercase', display:'block', marginBottom:4 }}>
                          Moneda
                        </label>
                        <select
                          style={{ width:'100%', padding:'7px 10px',
                            border:'1px solid #e0e0e0', borderRadius:6, fontSize:13 }}
                          value={pkgOvr.currency || pkg.currency || 'S/'}
                          onChange={e => updatePkgOverride(pkg.id, 'currency', e.target.value)}
                        >
                          <option value="S/">S/ Sol</option>
                          <option value="$">$ Dólar</option>
                          <option value="€">€ Euro</option>
                          <option value="£">£ Libra</option>
                        </select>
                      </div>
                    </div>

                    {/* Imagen específica */}
                    <div>
                      <label style={{ fontSize:11, fontWeight:700, color:'#888',
                        textTransform:'uppercase', display:'block', marginBottom:4 }}>
                        Imagen para {categoryName} (opcional)
                      </label>
                      <label htmlFor={`cat-img-${pkg.id}-${categoryName}`}
                        style={{ display:'block', cursor:'pointer',
                          border:'2px dashed #e0e0e0', borderRadius:6,
                          overflow:'hidden', height:80 }}>
                        {pkgOvr.image
                          ? <img src={pkgOvr.image}
                              style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                          : <div style={{ height:'100%', display:'flex',
                              alignItems:'center', justifyContent:'center',
                              gap:8, color:'#aaa', fontSize:12 }}>
                              <span className="material-symbols-outlined" style={{ fontSize:18 }}>
                                add_photo_alternate
                              </span>
                              Imagen específica para {categoryName}
                            </div>
                        }
                      </label>
                      <input id={`cat-img-${pkg.id}-${categoryName}`}
                        type="file" accept="image/*" style={{ display:'none' }}
                        onChange={e => {
                          const file = e.target.files[0]; if (!file) return
                          const reader = new FileReader()
                          reader.onload = ev => updatePkgOverride(pkg.id, 'image', ev.target.result)
                          reader.readAsDataURL(file)
                        }} />
                      {pkgOvr.image && (
                        <button onClick={() => updatePkgOverride(pkg.id, 'image', '')}
                          style={{ fontSize:11, color:'#e57373', background:'none',
                            border:'none', cursor:'pointer', marginTop:4, padding:0 }}>
                          × Quitar imagen
                        </button>
                      )}
                    </div>

                    {/* Características de esta categoría */}
                    <div>
                      <div style={{ display:'flex', justifyContent:'space-between',
                        alignItems:'center', marginBottom:6 }}>
                        <label style={{ fontSize:11, fontWeight:700, color:'#888',
                          textTransform:'uppercase' }}>
                          Características en {categoryName}
                        </label>
                        {pkgOvr.customFeatures == null
                          ? (
                            <button
                              onClick={() => updatePkgOverride(pkg.id, 'customFeatures', [...pkg.features])}
                              style={{ fontSize:11, padding:'3px 10px',
                                background:'#bf953f', color:'#fff',
                                border:'none', borderRadius:4, cursor:'pointer', fontWeight:700 }}>
                              Personalizar características
                            </button>
                          ) : (
                            <button
                              onClick={() => updatePkgOverride(pkg.id, 'customFeatures', null)}
                              style={{ fontSize:11, padding:'3px 10px',
                                background:'#f5f5f5', color:'#666',
                                border:'1px solid #e0e0e0', borderRadius:4, cursor:'pointer' }}>
                              Usar características base
                            </button>
                          )
                        }
                      </div>

                      {/* Si customFeatures es null → mostrar las base como chips */}
                      {pkgOvr.customFeatures == null && (
                        <div style={{ display:'flex', flexWrap:'wrap', gap:6,
                          padding:'10px 12px', background:'#f9f9f9',
                          borderRadius:6, border:'1px solid #f0f0f0' }}>
                          {pkg.features.map((f, i) => (
                            <span key={i} style={{
                              padding:'3px 10px', background:'#e8e8e8',
                              borderRadius:12, fontSize:12, color:'#555'
                            }}>{f}</span>
                          ))}
                          <p style={{ width:'100%', fontSize:11,
                            color:'#bbb', margin:'6px 0 0' }}>
                            Usando características base. Haz clic en
                            "Personalizar características" para editarlas.
                          </p>
                        </div>
                      )}

                      {/* Si customFeatures es array → editor completo */}
                      {Array.isArray(pkgOvr.customFeatures) && (
                        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                          {pkgOvr.customFeatures.map((feat, j) => (
                            <div key={j} style={{ display:'flex', gap:8, alignItems:'center' }}>
                              <input
                                style={{ flex:1, padding:'6px 9px',
                                  border:'1px solid #e0e0e0', borderRadius:5, fontSize:13 }}
                                value={feat}
                                onChange={e => {
                                  const arr = [...pkgOvr.customFeatures]
                                  arr[j] = e.target.value
                                  updatePkgOverride(pkg.id, 'customFeatures', arr)
                                }}
                              />
                              <button
                                onClick={() => updatePkgOverride(pkg.id, 'customFeatures',
                                  pkgOvr.customFeatures.filter((_, fi) => fi !== j))}
                                style={{ background:'none', border:'none',
                                  cursor:'pointer', color:'#ddd', padding:2 }}>
                                <span className="material-symbols-outlined" style={{ fontSize:15 }}>
                                  close
                                </span>
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => updatePkgOverride(pkg.id, 'customFeatures',
                              [...pkgOvr.customFeatures, ''])}
                            style={{ display:'flex', alignItems:'center', gap:6,
                              padding:'5px 10px', border:'1px dashed #ccc',
                              borderRadius:5, background:'transparent',
                              cursor:'pointer', color:'#bf953f',
                              fontSize:11, width:'fit-content' }}>
                            <span className="material-symbols-outlined" style={{ fontSize:14 }}>
                              add
                            </span>
                            Agregar característica
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Características EXTRA (se suman a las anteriores) */}
                    <div>
                      <label style={{ fontSize:11, fontWeight:700, color:'#888',
                        textTransform:'uppercase', display:'block', marginBottom:6 }}>
                        Características extra adicionales
                      </label>
                      <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                        {(pkgOvr.extraFeatures || []).map((feat, j) => (
                          <div key={j} style={{ display:'flex', gap:8, alignItems:'center' }}>
                            <input
                              style={{ flex:1, padding:'5px 8px',
                                border:'1px solid #e0e0e0', borderRadius:4, fontSize:12 }}
                              value={feat}
                              onChange={e => {
                                const feats = [...(pkgOvr.extraFeatures || [])]
                                feats[j] = e.target.value
                                updatePkgOverride(pkg.id, 'extraFeatures', feats)
                              }}
                            />
                            <button
                              onClick={() => updatePkgOverride(pkg.id, 'extraFeatures',
                                (pkgOvr.extraFeatures || []).filter((_, fi) => fi !== j))}
                              style={{ background:'none', border:'none',
                                cursor:'pointer', color:'#ddd', padding:2 }}>
                              <span className="material-symbols-outlined" style={{ fontSize:14 }}>
                                close
                              </span>
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => updatePkgOverride(pkg.id, 'extraFeatures',
                            [...(pkgOvr.extraFeatures || []), ''])}
                          style={{ display:'flex', alignItems:'center', gap:6,
                            padding:'5px 10px', border:'1px dashed #ccc',
                            borderRadius:4, background:'transparent',
                            cursor:'pointer', color:'#bf953f',
                            fontSize:11, width:'fit-content' }}>
                          <span className="material-symbols-outlined" style={{ fontSize:14 }}>add</span>
                          Agregar característica extra
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0a0a0a', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#bf953f' }}>star</span>
          Paquetes exclusivos de {categoryName}
        </h4>

        {(override.extraPackages || []).map((pkg, i) => (
          <div key={pkg.id} style={{ border: '1px solid #e8d9b5', borderRadius: 8, padding: 16, background: '#fef9ee', marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#bf953f', textTransform: 'uppercase' }}>Exclusivo {i + 1}</span>
              <button onClick={() => removeExtraPkg(i)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c62828', display: 'flex', padding: 2 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
              </button>
            </div>

            <label htmlFor={`extra-img-${pkg.id}`} style={{ display: 'block', cursor: 'pointer', border: '2px dashed #e8d9b5', borderRadius: 6, overflow: 'hidden', height: 80, marginBottom: 12 }}>
              {pkg.image
                ? <img src={pkg.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#bf953f', fontSize: 12 }}>
                    <span className="material-symbols-outlined">add_photo_alternate</span>Imagen del paquete
                  </div>}
            </label>
            <input id={`extra-img-${pkg.id}`} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => {
                const file = e.target.files[0]; if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => updateExtraPkg(i, 'image', ev.target.result);
                reader.readAsDataURL(file);
              }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: 3 }}>Título</label>
                <input style={{ width: '100%', padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, boxSizing: 'border-box' }}
                  value={pkg.title} onChange={e => updateExtraPkg(i, 'title', e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: 3 }}>Subtítulo</label>
                <input style={{ width: '100%', padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, boxSizing: 'border-box' }}
                  value={pkg.subtitle} onChange={e => updateExtraPkg(i, 'subtitle', e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: 3 }}>Precio</label>
                <input type="number" style={{ width: '100%', padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, boxSizing: 'border-box' }}
                  value={pkg.basePrice} onChange={e => updateExtraPkg(i, 'basePrice', Number(e.target.value))} />
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: 3 }}>Moneda</label>
                <select style={{ width: '100%', padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12 }}
                  value={pkg.currency} onChange={e => updateExtraPkg(i, 'currency', e.target.value)}>
                  <option value="€">€ Euro</option>
                  <option value="$">$ Dólar</option>
                  <option value="S/">S/ Sol</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Características</label>
              {(pkg.features || []).map((feat, j) => (
                <div key={j} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                  <input style={{ flex: 1, padding: '5px 8px', border: '1px solid #e0e0e0', borderRadius: 4, fontSize: 12 }}
                    value={feat}
                    onChange={e => {
                      const feats = [...(pkg.features || [])];
                      feats[j] = e.target.value;
                      updateExtraPkg(i, 'features', feats);
                    }} />
                  <button onClick={() => updateExtraPkg(i, 'features', pkg.features.filter((_, fi) => fi !== j))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ddd', padding: 2 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
                  </button>
                </div>
              ))}
              <button onClick={() => updateExtraPkg(i, 'features', [...(pkg.features || []), ''])}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', border: '1px dashed #e8d9b5', borderRadius: 4, background: 'transparent', cursor: 'pointer', color: '#bf953f', fontSize: 11 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>+ Característica
              </button>
            </div>
          </div>
        ))}

        <button onClick={addExtraPackage}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', border: '2px dashed #bf953f', borderRadius: 8, background: 'transparent', cursor: 'pointer', color: '#bf953f', fontSize: 13, fontWeight: 700, width: '100%', justifyContent: 'center' }}>
          <span className="material-symbols-outlined">add_circle</span>
          Agregar paquete exclusivo para {categoryName}
        </button>
      </div>
    </div>
  );
}

function PackagesPreview({ basePackages, categoryOverrides, portfolioCategories }) {
  const [previewCat, setPreviewCat] = useState('all');
  const override = previewCat !== 'all' ? categoryOverrides[previewCat] : null;
  const multiplier = override?.multiplier || 1;

  const packages = basePackages
    .filter(pkg => !categoryOverrides[previewCat]?.packageOverrides?.[pkg.id]?.hidden)
    .map(pkg => ({
      ...pkg,
      title: categoryOverrides[previewCat]?.packageOverrides?.[pkg.id]?.customTitle || pkg.title,
      finalPrice: categoryOverrides[previewCat]?.packageOverrides?.[pkg.id]?.customPrice || Math.round(pkg.basePrice * multiplier),
      image: categoryOverrides[previewCat]?.packageOverrides?.[pkg.id]?.image || pkg.image,
    }));

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
        {['all', ...portfolioCategories].map(cat => (
          <button key={cat}
            style={{ padding: '6px 16px', border: '1px solid', borderColor: previewCat === cat ? '#bf953f' : '#e0e0e0', background: previewCat === cat ? '#fef9ee' : '#fff', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: previewCat === cat ? '#bf953f' : '#555' }}
            onClick={() => setPreviewCat(cat)}>
            {cat === 'all' ? 'Todos los Eventos' : cat}
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
        {packages.map(pkg => (
          <div key={pkg.id} style={{ border: '1px solid #e0e0e0', borderRadius: 8, overflow: 'hidden', background: '#fafafa' }}>
            <div style={{ height: 140, overflow: 'hidden' }}>
              {pkg.image
                ? <img src={pkg.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ height: '100%', background: 'linear-gradient(135deg,#1a1a1a,#333)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 32 }}>photo_camera</span>
                  </div>}
            </div>
            <div style={{ padding: 16 }}>
              <h3 style={{ fontSize: 16, fontFamily: 'Playfair Display,serif', marginBottom: 4 }}>{pkg.title}</h3>
              <p style={{ fontSize: 22, fontWeight: 800 }}>{pkg.currency}{pkg.finalPrice?.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getCategoryIcon(cat) {
  const icons = {
    'Bodas': 'favorite', 'Quinceañeros': 'auto_awesome',
    'Fiestas Infantiles': 'celebration', 'Compromisos': 'diamond',
    'Bautizos': 'church', 'Eventos Corporativos': 'business_center',
    'Sesiones Personales': 'portrait', 'Cumpleaños': 'cake',
    'Graduaciones': 'school',
  };
  return icons[cat] || 'photo_camera';
}
