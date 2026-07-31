import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router';
import { useStorageUpload } from '../../lib/useStorageUpload';
import { FONT_FAMILIES, TEXT_STYLE_PRESETS, applyTextStyle } from '../../lib/textStyle';

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

export function EditableImage({ src, alt, onChange, isEditing, className = '', style = {}, folder = 'imagenes', label = 'Reemplazar Imagen' }) {
  const fileInputRef = useRef(null);
  const { uploadFile, uploading } = useStorageUpload();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    const url = await uploadFile(file, folder, src);
    if (url) onChange(url);
  };

  return (
    <div className={`editable-image ${isEditing ? 'editable-image--editing' : ''}`} style={{ position: 'relative', ...style }}>
      <img src={src} alt={alt} className={className} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      
      {isEditing && (
        <div className="editable-image__overlay" onClick={() => !uploading && fileInputRef.current.click()}>
          <span className="material-symbols-outlined" style={{ animation: uploading ? 'spin 1s linear infinite' : 'none' }}>
            {uploading ? 'sync' : 'add_photo_alternate'}
          </span>
          <span style={{ textAlign: 'center', padding: '0 8px' }}>{uploading ? 'Subiendo...' : label}</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={handleFileChange}
            disabled={uploading}
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
    { label: 'WhatsApp (Directo)', value: 'https://wa.me/51978752237' }
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

const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '40px', '48px', '56px', '64px', '72px', '80px', '96px'];
const COLOR_PALETTES = [
  {
    name: 'Marca',
    colors: ['#0a0a0a', '#ffffff', '#bf953f', '#d4af37', '#f5e6c8'],
  },
  {
    name: 'Romántica',
    colors: ['#6b3044', '#8c3d56', '#c9879d', '#f2d9df', '#fff4f6'],
  },
  {
    name: 'Natural',
    colors: ['#3f4b3b', '#6b4f3a', '#a67c52', '#d9c2a3', '#f2eadf'],
  },
  {
    name: 'Contemporánea',
    colors: ['#24364b', '#4f6d7a', '#4361ee', '#5a189a', '#0f766e'],
  },
];

const ALIGNMENTS = [
  { value: 'left', icon: 'format_align_left', label: 'Izquierda' },
  { value: 'center', icon: 'format_align_center', label: 'Centro' },
  { value: 'right', icon: 'format_align_right', label: 'Derecha' },
];

const EFFECTS = [
  { value: 'none', label: 'Sin efecto' },
  { value: 'soft', label: 'Sombra suave' },
  { value: 'cinematic', label: 'Cinematográfico' },
  { value: 'glow', label: 'Brillo luminoso' },
  { value: 'gold', label: 'Resplandor dorado' },
];

export function StyleMiniToolbar({ currentStyle, onChange, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const toolbarRef = useRef(null);
  const selectedSize = currentStyle.fontSize || '';
  const selectedColor = /^#[0-9a-f]{6}$/i.test(currentStyle.color || '')
    ? currentStyle.color
    : '#ffffff';
  const isCustomSize = selectedSize && !FONT_SIZES.includes(selectedSize);

  useEffect(() => {
    if (!isOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!toolbarRef.current?.contains(event.target)) setIsOpen(false);
    };

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  const updateStyle = (nextValues) => onChange({ ...currentStyle, ...nextValues });

  return (
    <div className="style-mini-toolbar" ref={toolbarRef}>
      <button 
        type="button"
        className={`style-mini-toolbar__trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title={`Estilos de ${label}`}
        aria-label={`Abrir estilos de ${label}`}
        aria-expanded={isOpen}
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
            role="dialog"
            aria-label={`Diseño de ${label}`}
          >
            <div className="style-mini-toolbar__header">
              <div>
                <strong>Diseño de texto</strong>
                <span>{label}</span>
              </div>
              <button
                type="button"
                className="style-mini-toolbar__close"
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar estilos"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <section className="style-mini-toolbar__section">
              <span className="style-mini-toolbar__section-title">Estilos rápidos</span>
              <div className="style-mini-toolbar__presets">
                {TEXT_STYLE_PRESETS.map((preset) => (
                  <button
                    type="button"
                    key={preset.id}
                    className="style-mini-preset"
                    style={applyTextStyle(preset.style)}
                    onClick={() => updateStyle(preset.style)}
                    title={`Aplicar estilo ${preset.name}`}
                  >
                    <span className="style-mini-preset__sample">{preset.sample}</span>
                    <span className="style-mini-preset__name">{preset.name}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="style-mini-toolbar__section">
              <label className="style-mini-toolbar__field">
                <span className="style-mini-toolbar__section-title">Tipografía</span>
                <select
                  value={currentStyle.fontFamily || ''}
                  onChange={(event) => updateStyle({ fontFamily: event.target.value || undefined })}
                  className="style-mini-select style-mini-select--font"
                  style={currentStyle.fontFamily ? applyTextStyle({ fontFamily: currentStyle.fontFamily }) : undefined}
                >
                  <option value="">Tipografía original</option>
                  {FONT_FAMILIES.map((group) => (
                    <optgroup key={group.group} label={group.group}>
                      {group.options.map((font) => (
                        <option key={font.value} value={font.value}>{font.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </label>

              <div className="style-mini-toolbar__two-columns">
                <label className="style-mini-toolbar__field">
                  <span className="style-mini-toolbar__section-title">Tamaño</span>
                  <select
                    value={selectedSize}
                    onChange={(event) => updateStyle({ fontSize: event.target.value || undefined })}
                    className="style-mini-select"
                  >
                    <option value="">Automático</option>
                    {isCustomSize && <option value={selectedSize}>{selectedSize}</option>}
                    {FONT_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
                  </select>
                </label>
                <label className="style-mini-toolbar__field">
                  <span className="style-mini-toolbar__section-title">Interlineado</span>
                  <select
                    value={currentStyle.lineHeight || ''}
                    onChange={(event) => updateStyle({ lineHeight: event.target.value || undefined })}
                    className="style-mini-select"
                  >
                    <option value="">Automático</option>
                    <option value="1">Compacto</option>
                    <option value="1.15">Corto</option>
                    <option value="1.35">Equilibrado</option>
                    <option value="1.55">Amplio</option>
                    <option value="1.8">Muy amplio</option>
                  </select>
                </label>
              </div>

              <div className="style-mini-toolbar__row style-mini-toolbar__row--format">
                <button
                  type="button"
                  className={`style-mini-btn ${currentStyle.bold ? 'active' : ''}`}
                  onClick={() => updateStyle({ bold: !currentStyle.bold })}
                  title="Negrita"
                  aria-label="Negrita"
                >
                  <strong>B</strong>
                </button>
                <button
                  type="button"
                  className={`style-mini-btn ${currentStyle.italic ? 'active' : ''}`}
                  onClick={() => updateStyle({ italic: !currentStyle.italic })}
                  title="Cursiva"
                  aria-label="Cursiva"
                >
                  <em>I</em>
                </button>
                <button
                  type="button"
                  className={`style-mini-btn ${currentStyle.underline ? 'active' : ''}`}
                  onClick={() => updateStyle({ underline: !currentStyle.underline })}
                  title="Subrayado"
                  aria-label="Subrayado"
                >
                  <span className="style-mini-underline">U</span>
                </button>
                <span className="style-mini-toolbar__divider" />
                {ALIGNMENTS.map((alignment) => (
                  <button
                    type="button"
                    key={alignment.value}
                    className={`style-mini-btn ${currentStyle.textAlign === alignment.value ? 'active' : ''}`}
                    onClick={() => updateStyle({ textAlign: alignment.value })}
                    title={alignment.label}
                    aria-label={`Alinear a la ${alignment.label.toLowerCase()}`}
                  >
                    <span className="material-symbols-outlined">{alignment.icon}</span>
                  </button>
                ))}
              </div>

              <div className="style-mini-toolbar__two-columns">
                <label className="style-mini-toolbar__field">
                  <span className="style-mini-toolbar__section-title">Espaciado</span>
                  <select
                    value={currentStyle.letterSpacing || ''}
                    onChange={(event) => updateStyle({ letterSpacing: event.target.value || undefined })}
                    className="style-mini-select"
                  >
                    <option value="">Normal</option>
                    <option value="-0.03em">Muy junto</option>
                    <option value="-0.01em">Junto</option>
                    <option value="0.03em">Ligero</option>
                    <option value="0.08em">Elegante</option>
                    <option value="0.14em">Amplio</option>
                  </select>
                </label>
                <label className="style-mini-toolbar__field">
                  <span className="style-mini-toolbar__section-title">Mayúsculas</span>
                  <select
                    value={currentStyle.textTransform || ''}
                    onChange={(event) => updateStyle({ textTransform: event.target.value || undefined })}
                    className="style-mini-select"
                  >
                    <option value="">Original</option>
                    <option value="none">Normal</option>
                    <option value="uppercase">MAYÚSCULAS</option>
                    <option value="capitalize">Iniciales</option>
                    <option value="lowercase">minúsculas</option>
                  </select>
                </label>
              </div>
            </section>

            <section className="style-mini-toolbar__section">
              <span className="style-mini-toolbar__section-title">Color personalizado</span>
              <div className="style-mini-toolbar__color-inputs">
                <input
                  type="color"
                  className="style-mini-color-picker"
                  value={selectedColor}
                  onChange={(event) => updateStyle({ color: event.target.value })}
                  aria-label="Elegir color personalizado"
                />
                <input
                  type="text"
                  className="style-mini-color-code"
                  value={currentStyle.color || ''}
                  placeholder="#ffffff"
                  maxLength={20}
                  onChange={(event) => updateStyle({ color: event.target.value })}
                  aria-label="Código del color"
                />
                <span className="style-mini-color-preview" style={{ background: currentStyle.color || '#ffffff' }} />
              </div>

              <div className="style-mini-toolbar__palettes">
                {COLOR_PALETTES.map((palette) => (
                  <div className="style-mini-toolbar__palette" key={palette.name}>
                    <span>{palette.name}</span>
                    <div className="style-mini-toolbar__colors">
                      {palette.colors.map((color) => (
                        <button
                          type="button"
                          key={color}
                          className={`style-mini-color ${currentStyle.color?.toLowerCase() === color.toLowerCase() ? 'active' : ''}`}
                          style={{ background: color }}
                          onClick={() => updateStyle({ color })}
                          title={`${palette.name}: ${color}`}
                          aria-label={`Usar color ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="style-mini-toolbar__section">
              <label className="style-mini-toolbar__field">
                <span className="style-mini-toolbar__section-title">Efecto visual</span>
                <select
                  value={currentStyle.effect || 'none'}
                  onChange={(event) => updateStyle({ effect: event.target.value })}
                  className="style-mini-select"
                >
                  {EFFECTS.map((effect) => (
                    <option key={effect.value} value={effect.value}>{effect.label}</option>
                  ))}
                </select>
              </label>
              <p className="style-mini-toolbar__hint">
                Los cambios se ven al instante. Usa “Guardar” en la barra superior para publicarlos.
              </p>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
