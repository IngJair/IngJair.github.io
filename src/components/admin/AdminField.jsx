export function AdminField({ label, hint, children }) {
  return (
    <div className="admin-field">
      <label className="admin-field__label">{label}</label>
      {hint && <p className="admin-field__hint">{hint}</p>}
      <div className="admin-field__control">{children}</div>
    </div>
  );
}

export function AdminSection({ title, description, children }) {
  return (
    <section className="admin-section">
      <div className="admin-section__header">
        <h2 className="admin-section__title">{title}</h2>
        {description && <p className="admin-section__desc">{description}</p>}
      </div>
      <div className="admin-section__body">{children}</div>
    </section>
  );
}
