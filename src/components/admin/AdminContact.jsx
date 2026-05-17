import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { useSiteContent } from '../../context/SiteContentContext';
import { EditableSection } from './EditorHelpers';
import InteractiveMap from '../InteractiveMap';

export default function AdminContact() {
  const { content, update } = useSiteContent();
  const [editingSection, setEditingSection] = useState(null);
  const isEditing = (key) => editingSection === key;

  // Estados para nuevas zonas (form por nombre)
  const [inputZoneName, setInputZoneName] = useState('');
  const [inputZoneDesc, setInputZoneDesc] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geoError, setGeoError] = useState('');

  const contact = content.contact || {};
  const workZones = contact.workZones || [];

  // Cargar solicitudes de reserva desde Supabase (con fallback a localStorage)
  useEffect(() => {
    async function loadRequests() {
      let incoming = [];

      // 1. Intentar Supabase
      try {
        const { data, error } = await supabase
          .from('contact_requests')
          .select('*')
          .eq('status', 'pending')
          .order('submitted_at', { ascending: false });

        if (!error && data && data.length > 0) {
          incoming = data.map(r => ({
            id: r.id,
            clientName: r.client_name,
            email: r.email,
            phone: r.phone,
            eventType: r.event_type,
            message: r.message,
            year: r.year,
            month: r.month,
            day: r.day,
            status: r.status,
            submittedAt: r.submitted_at,
          }));
        }
      } catch (e) {
        console.warn('[Supabase] loadRequests fallback a localStorage:', e.message);
      }

      // 2. Fallback: localStorage (por si Supabase no responde o la tabla no existe aún)
      if (incoming.length === 0) {
        const stored = JSON.parse(localStorage.getItem('luxe_reservation_requests') || '[]');
        incoming = stored;
      }

      if (incoming.length > 0) {
        const existing = content.calendar?.reservationRequests || [];
        const alreadyIn = existing.map(r => r.id);
        const toAdd = incoming.filter(r => !alreadyIn.includes(r.id));
        if (toAdd.length > 0) {
          update('calendar.reservationRequests', [...existing, ...toAdd]);
          localStorage.removeItem('luxe_reservation_requests');
        }
      }
    }
    loadRequests();
  }, [content.calendar?.reservationRequests, update]);

  const labelStyle = { fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: 4 };
  const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' };

  const handleAddZoneByName = async () => {
    if (!inputZoneName.trim()) {
      setGeoError("Escribe el nombre de un distrito");
      return;
    }
    setGeoError('');
    setIsGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(inputZoneName + ', Lima, Peru')}&limit=1`);
      const data = await res.json();
      if (data && data[0]) {
        const newZone = {
          id: Date.now().toString(),
          name: inputZoneName,
          description: inputZoneDesc,
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          radiusKm: contact.defaultRadiusKm || 4,
          color: "#bf953f"
        };
        update('contact.workZones', [...workZones, newZone]);
        setInputZoneName('');
        setInputZoneDesc('');
      } else {
        setGeoError("No se encontró ese lugar. Intenta con el nombre completo del distrito.");
      }
    } catch (e) {
      setGeoError("Error al buscar la ubicación.");
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleMapClick = ({ lat, lng }) => {
    const newZone = {
      id: Date.now().toString(),
      name: `Zona (${lat.toFixed(3)}, ${lng.toFixed(3)})`,
      description: '',
      lat, lng,
      radiusKm: contact.defaultRadiusKm || 4,
      color: "#bf953f"
    };
    update('contact.workZones', [...workZones, newZone]);
  };

  const handleZoneMove = ({ id, lat, lng }) => {
    const updated = workZones.map(z => z.id === id ? { ...z, lat, lng } : z);
    update('contact.workZones', updated);
  };

  const updateZone = (id, field, value) => {
    const updated = workZones.map(z => z.id === id ? { ...z, [field]: value } : z);
    update('contact.workZones', updated);
  };

  const removeZone = (id) => {
    if (confirm('¿Eliminar esta zona de cobertura?')) {
      update('contact.workZones', workZones.filter(z => z.id !== id));
    }
  };

  return (
    <div className="admin-contact-editor">
      <EditableSection sectionKey="contact-info" label="Información de Contacto y Cobertura"
        onEdit={setEditingSection} isEditing={isEditing('contact-info')}>
        <section style={{ padding: '60px 24px', background: '#fff' }}>
          <div className="container" style={{ maxWidth: 800 }}>
            
            {!isEditing('contact-info') ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, textAlign: 'center' }}>
                  <div>
                    <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#bf953f', marginBottom: 12 }}>chat_bubble</span>
                    <p style={{ fontWeight: 700 }}>WhatsApp</p>
                    <p style={{ color: '#666' }}>{contact.whatsapp}</p>
                  </div>
                  <div>
                    <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#bf953f', marginBottom: 12 }}>mail</span>
                    <p style={{ fontWeight: 700 }}>Email</p>
                    <p style={{ color: '#666' }}>{contact.email}</p>
                  </div>
                  <div>
                    <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#bf953f', marginBottom: 12 }}>location_on</span>
                    <p style={{ fontWeight: 700 }}>Zonas</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 6 }}>
                      {workZones.length > 0 ? workZones.map(z => (
                        <span key={z.id} style={{ fontSize: 12, color: '#666', background: '#f5f5f5', padding: '2px 8px', borderRadius: 4 }}>
                          📍 {z.name} — {z.radiusKm} km
                        </span>
                      )) : 'Sin zonas configuradas'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                  {['instagram', 'facebook', 'tiktok', 'youtube', 'pinterest'].filter(k => contact[`${k}Link`]).map(k => (
                    <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: '#fef9ee', border: '1px solid #e8d9b5', borderRadius: 20, fontSize: 12, fontWeight: 600, color: '#bf953f' }}>
                      {contact[k] || k}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
                
                {/* BLOQUE 1: DATOS BÁSICOS */}
                <div>
                  <p style={{ fontSize: 12, fontWeight: 800, color: '#0a0a0a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#bf953f' }}>contact_page</span>
                    DATOS DE CONTACTO
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={labelStyle}>WhatsApp</label>
                      <input style={inputStyle} value={contact.whatsapp} onChange={e => update('contact.whatsapp', e.target.value)} />
                    </div>
                    <div>
                      <label style={labelStyle}>WhatsApp Link</label>
                      <input style={inputStyle} value={contact.whatsappLink} onChange={e => update('contact.whatsappLink', e.target.value)} />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={labelStyle}>Email</label>
                      <input style={inputStyle} value={contact.email} onChange={e => update('contact.email', e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* BLOQUE 2: REDES SOCIALES */}
                <div>
                  <p style={{ fontSize: 12, fontWeight: 800, color: '#0a0a0a', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#bf953f' }}>share</span>
                    REDES SOCIALES
                  </p>
                  <p style={{ fontSize: 11, color: '#888', marginBottom: 16 }}>Deja el link vacío para ocultar esa red en el sitio.</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { key: 'instagram', label: 'Instagram', icon: 'camera' },
                      { key: 'facebook', label: 'Facebook', icon: 'groups' },
                      { key: 'tiktok', label: 'TikTok', icon: 'play_circle' },
                      { key: 'youtube', label: 'YouTube', icon: 'smart_display' },
                      { key: 'pinterest', label: 'Pinterest', icon: 'push_pin' },
                    ].map(s => (
                      <div key={s.key} style={{ padding: 12, background: '#fcfcfc', border: '1px solid #eee', borderRadius: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#bf953f' }}>{s.icon}</span>
                          <span style={{ fontSize: 12, fontWeight: 700 }}>{s.label}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 10 }}>
                          <input style={inputStyle} placeholder="Usuario" value={contact[s.key]} onChange={e => update(`contact.${s.key}`, e.target.value)} />
                          <input style={inputStyle} placeholder="URL Link" value={contact[`${s.key}Link`]} onChange={e => update(`contact.${s.key}Link`, e.target.value)} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* BLOQUE 3: ZONAS DE COBERTURA */}
                <div>
                  <div style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: 14, fontWeight: 800, color: '#0a0a0a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#bf953f' }}>map</span>
                      ZONAS DE COBERTURA
                    </p>
                    <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                      Tu dirección privada nunca se muestra. Los clientes solo ven las zonas donde trabajas.
                    </p>
                  </div>

                  {/* PANEL CONFIG PREVIA */}
                  <div style={{ padding: 16, background: '#fcfcfc', border: '1px solid #eee', borderRadius: 10, marginBottom: 20 }}>
                    <label style={{ ...labelStyle, color: '#0a0a0a' }}>Radio por defecto al hacer clic: {contact.defaultRadiusKm || 4} km</label>
                    <input type="range" min={1} max={50} step={1} style={{ width: '100%', accentColor: '#bf953f', marginBottom: 8 }} 
                      value={contact.defaultRadiusKm || 4} onChange={e => update('contact.defaultRadiusKm', Number(e.target.value))} />
                    <p style={{ fontSize: 11, color: '#888', margin: 0 }}>Este radio se aplicará cada vez que hagas clic en el mapa. Puedes ajustarlo por zona después.</p>
                  </div>

                  {/* AGREGAR POR NOMBRE */}
                  <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                    <div style={{ flex: 1.5 }}>
                      <input style={inputStyle} placeholder="Nombre del distrito (ej: Miraflores)" value={inputZoneName} onChange={e => setInputZoneName(e.target.value)} />
                    </div>
                    <div style={{ flex: 2 }}>
                      <input style={inputStyle} placeholder="Descripción (opcional)" value={inputZoneDesc} onChange={e => setInputZoneDesc(e.target.value)} />
                    </div>
                    <button className="btn-primary" style={{ padding: '0 20px', whiteSpace: 'nowrap' }} onClick={handleAddZoneByName} disabled={isGeocoding}>
                      {isGeocoding ? "Buscando..." : "+ Agregar"}
                    </button>
                  </div>
                  {geoError && <p style={{ fontSize: 12, color: '#c62828', marginBottom: 16 }}>{geoError}</p>}

                  {/* MAPA INTERACTIVO */}
                  <div style={{ marginBottom: 24 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#bf953f', textAlign: 'center', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>info</span>
                      También puedes hacer clic directamente en el mapa para colocar una zona con el radio configurado arriba
                    </p>
                    <InteractiveMap mode="zones" zones={workZones} interactive={true} onMapClick={handleMapClick} onZoneMove={handleZoneMove} defaultCenter={[-11.9175, -77.0543]} defaultZoom={13} />
                  </div>

                  {/* LISTA DE ZONAS */}
                  <div>
                    {workZones.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 0', border: '1px dashed #ddd', borderRadius: 10 }}>
                        <p style={{ color: '#888', fontSize: 13 }}>Sin zonas configuradas. Escribe un distrito o haz clic en el mapa para agregar.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {workZones.map(z => (
                          <div key={z.id} style={{ padding: 16, background: '#fff', border: '1px solid #eee', borderRadius: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                              <div style={{ width: 8, height: 8, borderRadius: '50%', background: z.color || '#bf953f' }} />
                              <input style={{ ...inputStyle, flex: 1, fontWeight: 700 }} value={z.name} onChange={e => updateZone(z.id, 'name', e.target.value)} />
                              <button onClick={() => removeZone(z.id)} style={{ background: 'none', border: 'none', color: '#ffcdd2', cursor: 'pointer' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#c62828' }}>delete</span>
                              </button>
                            </div>
                            <div style={{ marginBottom: 12 }}>
                              <input style={inputStyle} placeholder="Descripción de esta zona" value={z.description} onChange={e => updateZone(z.id, 'description', e.target.value)} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <span style={{ fontSize: 11, color: '#666', minWidth: 80 }}>Radio: {z.radiusKm} km</span>
                              <input type="range" min={1} max={50} style={{ flex: 1, accentColor: '#bf953f' }} value={z.radiusKm} onChange={e => updateZone(z.id, 'radiusKm', Number(e.target.value))} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </section>
      </EditableSection>

      <EditableSection sectionKey="contact-calendar" label="Gestión del Calendario"
        onEdit={setEditingSection} isEditing={isEditing('contact-calendar')}>
        <section style={{ padding: '60px 24px', background: 'var(--surface-container-low)' }}>
          <div className="container" style={{ maxWidth: 800 }}>
            {isEditing('contact-calendar') ? (
              <FullCalendarManager />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#bf953f', marginBottom: 16 }}>calendar_month</span>
                <h3 className="text-headline-md">Gestión de Disponibilidad</h3>
                <p style={{ color: '#666', marginBottom: 20 }}>Haz clic en el icono de edición para gestionar fechas reservadas y solicitudes.</p>
              </div>
            )}
          </div>
        </section>
      </EditableSection>
    </div>
  );
}

function FullCalendarManager() {
  const { content, update } = useSiteContent();
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState('calendar');

  const bookedDates = content.calendar?.bookedDates || [];
  const consultDates = content.calendar?.consultDates || [];
  const reservationRequests = content.calendar?.reservationRequests || [];

  const pendingRequests = reservationRequests.filter(r => r.status === 'pending');
  const approvedRequests = reservationRequests.filter(r => r.status === 'approved');

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const monthName = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' })
    .format(new Date(viewYear, viewMonth));

  const getDayStatus = (day) => {
    if (bookedDates.some(b => b.year === viewYear && b.month === viewMonth && b.day === day)) return 'booked';
    if (approvedRequests.some(r => r.year === viewYear && r.month === viewMonth && r.day === day)) return 'approved';
    if (pendingRequests.some(r => r.year === viewYear && r.month === viewMonth && r.day === day)) return 'pending';
    if (consultDates.some(c => c.year === viewYear && c.month === viewMonth && c.day === day)) return 'consult';
    return 'available';
  };

  const toggleBooked = (day) => {
    const exists = bookedDates.some(b => b.year === viewYear && b.month === viewMonth && b.day === day);
    if (exists) {
      update('calendar.bookedDates', bookedDates.filter(b => !(b.year === viewYear && b.month === viewMonth && b.day === day)));
    } else {
      update('calendar.consultDates', consultDates.filter(c => !(c.year === viewYear && c.month === viewMonth && c.day === day)));
      update('calendar.bookedDates', [...bookedDates, { year: viewYear, month: viewMonth, day }]);
    }
  };

  const toggleConsult = (day) => {
    const exists = consultDates.some(c => c.year === viewYear && c.month === viewMonth && c.day === day);
    if (exists) {
      update('calendar.consultDates', consultDates.filter(c => !(c.year === viewYear && c.month === viewMonth && c.day === day)));
    } else {
      update('calendar.consultDates', [...consultDates, { year: viewYear, month: viewMonth, day }]);
    }
  };

  const approveRequest = (request) => {
    const updated = reservationRequests.map(r =>
      r.id === request.id ? { ...r, status: 'approved' } : r
    );
    update('calendar.reservationRequests', updated);
    update('calendar.bookedDates', [...bookedDates, { year: request.year, month: request.month, day: request.day }]);
  };

  const rejectRequest = (requestId) => {
    if (!confirm('¿Rechazar esta solicitud de reserva?')) return;
    update('calendar.reservationRequests', reservationRequests.map(r =>
      r.id === requestId ? { ...r, status: 'rejected' } : r
    ));
  };

  const removeBookedDate = (year, month, day) => {
    update('calendar.bookedDates', bookedDates.filter(b => !(b.year === year && b.month === month && b.day === day)));
  };

  const clearMonth = () => {
    if (!confirm(`¿Limpiar todos los estados del mes ${monthName}?`)) return;
    update('calendar.bookedDates', bookedDates.filter(b => !(b.year === viewYear && b.month === viewMonth)));
    update('calendar.consultDates', consultDates.filter(c => !(c.year === viewYear && c.month === viewMonth)));
  };

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  return (
    <motion.div className="inline-editor-panel" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '2px solid #f0e8d0' }}>
        {[
          { id: 'calendar', label: 'Gestionar Calendario', icon: 'calendar_month' },
          { id: 'requests', label: `Solicitudes${pendingRequests.length > 0 ? ` (${pendingRequests.length})` : ''}`, icon: 'inbox' },
        ].map(tab => (
          <button key={tab.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 16px', border: 'none',
              background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              color: activeTab === tab.id ? '#bf953f' : '#888',
              borderBottom: activeTab === tab.id ? '2px solid #bf953f' : '2px solid transparent',
              marginBottom: -2,
            }}
            onClick={() => setActiveTab(tab.id)}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'calendar' && (
        <div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 20, padding: '12px 16px', background: '#fef9ee', borderRadius: 8, border: '1px solid #e8d9b5' }}>
            <p style={{ fontSize: 12, color: '#666', margin: 0 }}>
              <strong>Click:</strong> Reservar (negro) | <strong>Click der:</strong> En consulta (gris) | <strong>Re-click:</strong> Liberar
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <button onClick={() => {
              if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
              else setViewMonth(m => m - 1);
            }} style={{ width: 36, height: 36, border: '1px solid #e0e0e0', background: '#fff', borderRadius: 6, cursor: 'pointer' }}>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <span style={{ fontWeight: 700, fontSize: 16, textTransform: 'capitalize' }}>{monthName}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={clearMonth} style={{ padding: '6px 12px', border: '1px solid #e0e0e0', background: '#fff', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>Limpiar</button>
              <button onClick={() => {
                if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
                else setViewMonth(m => m + 1);
              }} style={{ width: 36, height: 36, border: '1px solid #e0e0e0', background: '#fff', borderRadius: 6, cursor: 'pointer' }}>
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
            {weekDays.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#888', padding: '8px 0' }}>{d}</div>)}
            {Array.from({ length: adjustedFirstDay }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const status = getDayStatus(day);
              const isPending = status === 'pending';
              const isBooked = status === 'booked' || status === 'approved';
              const isConsult = status === 'consult';
              
              const getDayStyle = () => {
                if (isBooked) return { background: '#0a0a0a', color: '#fff', borderColor: '#0a0a0a' };
                if (isPending) return { background: '#fff3e0', color: '#e65100', borderColor: '#ffb74d' };
                if (isConsult) return { background: '#e0e0e0', color: '#555', borderColor: '#bdbdbd' };
                return { background: '#fff', color: '#0a0a0a', borderColor: '#e0e0e0' };
              };

              return (
                <button key={day} onClick={() => toggleBooked(day)} onContextMenu={(e) => { e.preventDefault(); toggleConsult(day); }}
                  style={{ aspectRatio: '1', border: '1px solid', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', ...getDayStyle() }}>
                  {day}
                  {isPending && <span style={{ width: 6, height: 6, background: '#e65100', borderRadius: '50%', marginTop: 2 }} />}
                  {isBooked && <span className="material-symbols-outlined" style={{ fontSize: 10, opacity: 0.6 }}>lock</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reservationRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#aaa' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>inbox</span>
              <p style={{ fontSize: 14 }}>Sin solicitudes todavía</p>
            </div>
          ) : (
            <>
              {pendingRequests.map(req => (
                <div key={req.id} style={{ padding: 16, background: '#fff3e0', border: '1px solid #ffb74d', borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 15 }}>{req.clientName} ({req.eventType})</p>
                      <p style={{ fontSize: 13, color: '#555' }}>Fecha: {new Intl.DateTimeFormat('es-ES', { dateStyle: 'long' }).format(new Date(req.year, req.month, req.day))}</p>
                      <p style={{ fontSize: 12, color: '#777', marginTop: 4 }}>"{req.message}"</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => approveRequest(req)} style={{ background: '#0a0a0a', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Aceptar</button>
                      <button onClick={() => rejectRequest(req.id)} style={{ background: '#ffebee', color: '#c62828', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Rechazar</button>
                    </div>
                  </div>
                </div>
              ))}
              {approvedRequests.map(req => (
                <div key={req.id} style={{ padding: '10px 14px', background: '#f1f8e9', border: '1px solid #c5e1a5', borderRadius: 6, display: 'flex', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: 13 }}><strong>{req.clientName}</strong> — {req.day}/{req.month + 1}/{req.year}</p>
                  <button onClick={() => {
                    update('calendar.reservationRequests', reservationRequests.filter(r => r.id !== req.id));
                    removeBookedDate(req.year, req.month, req.day);
                  }} style={{ background: 'none', border: 'none', color: '#c62828', cursor: 'pointer' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}
