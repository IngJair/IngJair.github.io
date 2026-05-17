import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export function EditableSection({ children, sectionKey, label, onEdit, isEditing }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`editable-section ${isHovered ? 'editable-section--hovered' : ''} ${isEditing ? 'editable-section--editing' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence>
        {(isHovered || isEditing) && (
          <motion.div
            className="editable-section__toolbar"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <span className="editable-section__label">{label}</span>
            <button
              className={`editable-section__btn ${isEditing ? 'editable-section__btn--active' : ''}`}
              onClick={() => onEdit(isEditing ? null : sectionKey)}
            >
              <span className="material-symbols-outlined">{isEditing ? 'close' : 'edit'}</span>
              {isEditing ? 'Cerrar' : 'Editar'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </div>
  );
}

export function EditableText({ tag: Tag = 'div', value, onChange, isEditing, style = {} }) {
  const textRef = useRef(null);

  const handleBlur = () => {
    if (textRef.current) {
      onChange(textRef.current.innerText);
    }
  };

  return (
    <Tag
      ref={textRef}
      contentEditable={isEditing}
      suppressContentEditableWarning={true}
      onBlur={handleBlur}
      className={`editable-text ${isEditing ? 'editable-text--active' : ''}`}
      style={style}
    >
      {value}
    </Tag>
  );
}

export function EditableImage({ src, alt, onChange, isEditing, className = '', style = {} }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => onChange(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`editable-image ${isEditing ? 'editable-image--editing' : ''}`} style={{ position: 'relative', ...style }}>
      <img src={src} alt={alt} className={className} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      
      {isEditing && (
        <div className="editable-image__overlay" onClick={() => fileInputRef.current.click()}>
          <span className="material-symbols-outlined">add_photo_alternate</span>
          <span>Reemplazar Imagen</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>
      )}
    </div>
  );
}

export function EditableLink({ value, onChange, isEditing, className = '', style = {}, children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const destinations = [
    { label: 'Inicio', value: '/' },
    { label: 'Portafolio', value: '/portfolio' },
    { label: 'Servicios', value: '/services' },
    { label: 'Contacto', value: '/contact' },
    { label: 'WhatsApp (Directo)', value: 'https://wa.me/34600000000' }
  ];

  if (!isEditing) {
    const isExternal = value?.startsWith('http') || value?.startsWith('mailto:') || value?.startsWith('tel:');
    if (isExternal) {
      return (
        <a href={value} target="_blank" rel="noopener noreferrer" className={className} style={{ textDecoration: 'none', color: 'inherit', display: 'inline-block', ...style }}>
          {children}
        </a>
      );
    }
    return (
      <Link to={value || '/'} className={className} style={{ textDecoration: 'none', color: 'inherit', display: 'inline-block', ...style }}>
        {children}
      </Link>
    );
  }

  return (
    <div className={`editable-link ${className}`} style={{ position: 'relative', ...style }}>
      {children}
      <div className="editable-link__overlay" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        <span className="material-symbols-outlined">link</span>
        <span style={{ fontSize: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80px' }}>{value}</span>
      </div>
      
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className="editable-link__menu"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              zIndex: 1000,
              background: '#fff',
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              width: '220px'
            }}
          >
            <div style={{ marginBottom: '10px' }}>
              <input 
                type="text" 
                placeholder="URL personalizada..." 
                value={value} 
                onChange={(e) => onChange(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                style={{ width: '100%', padding: '6px', fontSize: '12px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {destinations.map(d => (
                <button 
                  key={d.value} 
                  onClick={(e) => { e.stopPropagation(); onChange(d.value); setIsMenuOpen(false); }}
                  style={{
                    padding: '6px 8px',
                    fontSize: '11px',
                    textAlign: 'left',
                    background: value === d.value ? '#bf953f' : 'transparent',
                    color: value === d.value ? '#fff' : '#333',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const FONT_SIZES = ['10px','12px','14px','16px','18px','20px','24px','28px','32px','36px','40px','48px','56px','64px','72px'];
const COLORS = ['#0a0a0a', '#ffffff', '#bf953f', '#555555', '#888888', '#f0f0f0', '#d4a843'];

export function StyleMiniToolbar({ currentStyle, onChange, label }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="style-mini-toolbar" style={{ position: 'relative' }}>
      <button 
        className={`style-mini-toolbar__trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title={`Estilos de ${label}`}
      >
        <span className="material-symbols-outlined">text_format</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="style-mini-toolbar__panel"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
          >
            <div className="style-mini-toolbar__row">
              <button 
                className={`style-mini-btn ${currentStyle.bold ? 'active' : ''}`}
                onClick={() => onChange({ ...currentStyle, bold: !currentStyle.bold })}
              >
                <strong>B</strong>
              </button>
              <button 
                className={`style-mini-btn ${currentStyle.italic ? 'active' : ''}`}
                onClick={() => onChange({ ...currentStyle, italic: !currentStyle.italic })}
              >
                <em>I</em>
              </button>
              <button 
                className={`style-mini-btn ${currentStyle.underline ? 'active' : ''}`}
                onClick={() => onChange({ ...currentStyle, underline: !currentStyle.underline })}
              >
                <span style={{ textDecoration: 'underline' }}>U</span>
              </button>
            </div>

            <div className="style-mini-toolbar__row">
              <select 
                value={currentStyle.fontSize || '16px'}
                onChange={(e) => onChange({ ...currentStyle, fontSize: e.target.value })}
                className="style-mini-select"
              >
                {FONT_SIZES.map(size => <option key={size} value={size}>{size}</option>)}
              </select>
            </div>

            <div className="style-mini-toolbar__colors">
              {COLORS.map(color => (
                <button
                  key={color}
                  className={`style-mini-color ${currentStyle.color === color ? 'active' : ''}`}
                  style={{ background: color }}
                  onClick={() => onChange({ ...currentStyle, color: color })}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
