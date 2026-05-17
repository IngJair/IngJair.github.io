import { useSiteContent } from '../../context/SiteContentContext';
import { AdminSection, AdminField } from './AdminField';

export default function ServicesPanel() {
  const { content, updateContent } = useSiteContent();
  const { services } = content;

  const updatePackage = (index, field, value) => {
    const updated = [...services.packages];
    updated[index] = { ...updated[index], [field]: value };
    updateContent('services.packages', updated);
  };

  const updateFeature = (pkgIndex, featIndex, value) => {
    const updated = [...services.packages];
    const feats = [...updated[pkgIndex].features];
    feats[featIndex] = value;
    updated[pkgIndex] = { ...updated[pkgIndex], features: feats };
    updateContent('services.packages', updated);
  };

  const addFeature = (pkgIndex) => {
    const updated = [...services.packages];
    updated[pkgIndex].features.push('Nueva característica');
    updateContent('services.packages', updated);
  };

  const removeFeature = (pkgIndex, featIndex) => {
    const updated = [...services.packages];
    updated[pkgIndex].features.splice(featIndex, 1);
    updateContent('services.packages', updated);
  };

  const addPackage = () => {
    const newPkg = {
      id: `pkg-${Date.now()}`,
      title: 'Nuevo Paquete',
      subtitle: 'Descripción corta',
      basePrice: 1000,
      currency: '€',
      isPrimary: false,
      features: ['Característica 1', 'Característica 2'],
    };
    updateContent('services.packages', [...services.packages, newPkg]);
  };

  const removePackage = (index) => {
    if (!confirm('¿Eliminar este paquete?')) return;
    const updated = services.packages.filter((_, i) => i !== index);
    updateContent('services.packages', updated);
  };

  return (
    <div>
      <AdminSection title="Banner de Oferta" description="El banner destacado en la página de servicios">
        <AdminField label="Etiqueta del banner">
          <input className="admin-input" value={services.banner.tag}
            onChange={e => updateContent('services.banner.tag', e.target.value)} />
        </AdminField>
        <AdminField label="Título del banner">
          <input className="admin-input" value={services.banner.title}
            onChange={e => updateContent('services.banner.title', e.target.value)} />
        </AdminField>
        <AdminField label="Descripción del banner">
          <textarea className="admin-textarea" rows={2} value={services.banner.description}
            onChange={e => updateContent('services.banner.description', e.target.value)} />
        </AdminField>
      </AdminSection>

      <AdminSection title="Paquetes de Servicios" description="Agrega, edita o elimina paquetes">
        {services.packages.map((pkg, i) => (
          <div key={pkg.id} className="admin-package-card">
            <div className="admin-package-card__header">
              <h3 className="admin-package-card__title">{pkg.title}</h3>
              <div className="admin-package-card__actions">
                <label className="admin-toggle">
                  <input type="checkbox" checked={pkg.isPrimary}
                    onChange={e => updatePackage(i, 'isPrimary', e.target.checked)} />
                  <span>Destacado</span>
                </label>
                <button className="admin-icon-btn admin-icon-btn--danger" onClick={() => removePackage(i)}>
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>

            <div className="admin-row">
              <AdminField label="Título">
                <input className="admin-input" value={pkg.title}
                  onChange={e => updatePackage(i, 'title', e.target.value)} />
              </AdminField>
              <AdminField label="Subtítulo">
                <input className="admin-input" value={pkg.subtitle}
                  onChange={e => updatePackage(i, 'subtitle', e.target.value)} />
              </AdminField>
            </div>

            <div className="admin-row">
              <AdminField label="Precio base">
                <input className="admin-input" type="number" value={pkg.basePrice}
                  onChange={e => updatePackage(i, 'basePrice', Number(e.target.value))} />
              </AdminField>
              <AdminField label="Moneda">
                <select className="admin-input" value={pkg.currency}
                  onChange={e => updatePackage(i, 'currency', e.target.value)}>
                  <option value="€">€ Euro</option>
                  <option value="$">$ Dólar</option>
                  <option value="S/">S/ Sol</option>
                  <option value="£">£ Libra</option>
                </select>
              </AdminField>
            </div>

            <AdminField label="Características incluidas">
              <div className="admin-features-list">
                {pkg.features.map((feat, j) => (
                  <div key={j} className="admin-feature-item">
                    <input className="admin-input" value={feat}
                      onChange={e => updateFeature(i, j, e.target.value)} />
                    <button className="admin-icon-btn admin-icon-btn--sm admin-icon-btn--danger"
                      onClick={() => removeFeature(i, j)}>
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                ))}
                <button className="admin-add-btn" onClick={() => addFeature(i)}>
                  <span className="material-symbols-outlined">add</span>
                  Agregar característica
                </button>
              </div>
            </AdminField>
          </div>
        ))}

        <button className="admin-add-package-btn" onClick={addPackage}>
          <span className="material-symbols-outlined">add_circle</span>
          Agregar nuevo paquete
        </button>
      </AdminSection>
    </div>
  );
}
