import { useSiteContent } from '../../context/useSiteContent';
import { AdminSection, AdminField } from './AdminField';

const FONT_DISPLAY_OPTIONS = [
  'Playfair Display', 'Cormorant Garamond', 'Libre Baskerville',
  'Merriweather', 'EB Garamond', 'Lora', 'DM Serif Display',
];
const FONT_BODY_OPTIONS = [
  'Montserrat', 'Inter', 'Raleway', 'Nunito', 'Lato', 'Open Sans', 'Poppins',
];
const FONT_CURSIVE_OPTIONS = [
  'Great Vibes', 'Dancing Script', 'Pacifico', 'Sacramento', 'Pinyon Script',
];

const COLOR_PRESETS = [
  { label: 'Lujo Dorado', primary: '#0a0a0a', secondary: '#bf953f', bg: '#fafafa' },
  { label: 'Negro Plata', primary: '#1a1a2e', secondary: '#c0c0c0', bg: '#f8f8f8' },
  { label: 'Blanco Rosado', primary: '#2d2d2d', secondary: '#d4a5a5', bg: '#fffaf9' },
  { label: 'Marino Champagne', primary: '#1b2a4a', secondary: '#c9a96e', bg: '#fdfbf7' },
  { label: 'Esmeralda', primary: '#1a2f1a', secondary: '#5a8a5a', bg: '#f7faf7' },
  { label: 'Burdeos', primary: '#1a0a0a', secondary: '#8b2635', bg: '#faf8f8' },
];

export default function ThemePanel() {
  const { content, updateContent } = useSiteContent();
  const { theme } = content;

  return (
    <div>
      <AdminSection title="Colores" description="Paleta de colores del sitio">
        {/* Presets rápidos */}
        <AdminField label="Presets de color rápidos">
          <div className="admin-color-presets">
            {COLOR_PRESETS.map(preset => (
              <button
                key={preset.label}
                className="admin-color-preset"
                onClick={() => {
                  updateContent('theme.primaryColor', preset.primary);
                  updateContent('theme.secondaryColor', preset.secondary);
                  updateContent('theme.backgroundColor', preset.bg);
                }}
                title={preset.label}
              >
                <span style={{ background: preset.primary }} className="admin-color-swatch" />
                <span style={{ background: preset.secondary }} className="admin-color-swatch" />
                <span style={{ background: preset.bg, border: '1px solid #ddd' }} className="admin-color-swatch" />
                <span className="admin-color-preset__label">{preset.label}</span>
              </button>
            ))}
          </div>
        </AdminField>

        <div className="admin-color-row">
          <AdminField label="Color primario (textos, botones)">
            <div className="admin-color-input-wrap">
              <input type="color" className="admin-color-picker" value={theme.primaryColor}
                onChange={e => updateContent('theme.primaryColor', e.target.value)} />
              <input type="text" className="admin-input admin-input--sm" value={theme.primaryColor}
                onChange={e => updateContent('theme.primaryColor', e.target.value)} />
            </div>
          </AdminField>
          <AdminField label="Color secundario (acentos, dorado)">
            <div className="admin-color-input-wrap">
              <input type="color" className="admin-color-picker" value={theme.secondaryColor}
                onChange={e => updateContent('theme.secondaryColor', e.target.value)} />
              <input type="text" className="admin-input admin-input--sm" value={theme.secondaryColor}
                onChange={e => updateContent('theme.secondaryColor', e.target.value)} />
            </div>
          </AdminField>
          <AdminField label="Color de fondo">
            <div className="admin-color-input-wrap">
              <input type="color" className="admin-color-picker" value={theme.backgroundColor}
                onChange={e => updateContent('theme.backgroundColor', e.target.value)} />
              <input type="text" className="admin-input admin-input--sm" value={theme.backgroundColor}
                onChange={e => updateContent('theme.backgroundColor', e.target.value)} />
            </div>
          </AdminField>
        </div>
      </AdminSection>

      <AdminSection title="Tipografía" description="Fuentes del sitio. Se cargan desde Google Fonts.">
        <AdminField label="Fuente de títulos grandes (Display)" hint="Para H1, títulos principales">
          <div className="admin-font-selector">
            {FONT_DISPLAY_OPTIONS.map(font => (
              <button
                key={font}
                className={`admin-font-option ${theme.fontDisplay === font ? 'admin-font-option--active' : ''}`}
                onClick={() => updateContent('theme.fontDisplay', font)}
                style={{ fontFamily: font }}
              >
                {font}
              </button>
            ))}
          </div>
        </AdminField>

        <AdminField label="Fuente de cuerpo (Body)" hint="Para párrafos, labels, botones">
          <div className="admin-font-selector">
            {FONT_BODY_OPTIONS.map(font => (
              <button
                key={font}
                className={`admin-font-option ${theme.fontBody === font ? 'admin-font-option--active' : ''}`}
                onClick={() => updateContent('theme.fontBody', font)}
                style={{ fontFamily: font }}
              >
                {font}
              </button>
            ))}
          </div>
        </AdminField>

        <AdminField label="Fuente del logo (Script/Cursiva)" hint="Para el nombre en el Navbar">
          <div className="admin-font-selector">
            {FONT_CURSIVE_OPTIONS.map(font => (
              <button
                key={font}
                className={`admin-font-option ${theme.fontCursive === font ? 'admin-font-option--active' : ''}`}
                onClick={() => updateContent('theme.fontCursive', font)}
                style={{ fontFamily: font, fontSize: '22px' }}
              >
                {font}
              </button>
            ))}
          </div>
        </AdminField>

        {/* Preview de tipografía */}
        <AdminField label="Preview en vivo">
          <div className="admin-font-preview" style={{
            fontFamily: theme.fontDisplay,
            background: theme.backgroundColor,
            color: theme.primaryColor,
            borderColor: theme.secondaryColor
          }}>
            <p style={{ fontFamily: theme.fontCursive, fontSize: '2rem', color: theme.secondaryColor }}>
              {content.brand.logo.elky}
            </p>
            <h2 style={{ fontFamily: theme.fontDisplay, fontSize: '1.8rem' }}>
              {content.hero?.title}
            </h2>
            <p style={{ fontFamily: theme.fontBody, fontSize: '1rem', opacity: 0.7, marginTop: 8 }}>
              {content.hero?.subtitle}
            </p>
          </div>
        </AdminField>
      </AdminSection>
    </div>
  );
}
