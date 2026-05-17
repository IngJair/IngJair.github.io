import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import InteractiveMap from '../components/InteractiveMap';
import { useSiteContent } from '../context/SiteContentContext';
import { EVENT_TYPES } from '../config';
import './Contact.css';

// Hook useCalendar actualizado para leer del contexto
function useCalendar() {
  const { content } = useSiteContent();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  const bookedDates = (content.calendar?.bookedDates || [])
    .filter(b => b.year === year && b.month === month)
    .map(b => b.day);

  const consultDaysForMonth = (content.calendar?.reservationRequests || [])
    .filter(r => r.status === 'pending' && r.year === year && r.month === month)
    .map(r => r.day);

  const getDaysInMonth = () => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = () => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Ajuste para que lunes sea 0 y domingo 6
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth();
    const firstDay = getFirstDayOfMonth();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];
    
    // Días del mes anterior
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ d: daysInPrevMonth - i, prev: true });
    }

    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      let status = null;
      if (bookedDates.includes(i)) status = 'booked';
      else if (consultDaysForMonth.includes(i)) status = 'consult';
      days.push({ d: i, status });
    }

    // Días del mes siguiente
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ d: i, next: true });
    }

    return days;
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const monthName = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(new Date(year, month, 1));

  return {
    month,
    year,
    monthName: monthName.charAt(0).toUpperCase() + monthName.slice(1),
    days: generateCalendarDays(),
    nextMonth,
    prevMonth
  };
}

const daysHeader = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];

export default function Contact() {
  const { content } = useSiteContent();
  const contactInfo = content.contact || {};
  const formRef = useRef(null);
  
  const [form, setForm] = useState({ name:'', email:'', phone:'', date:'', type: EVENT_TYPES[0], message:'' });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(null);

  const today = new Date();
  const calendar = useCalendar();

  const validateForm = (data) => {
    const newErrors = {};
    if (!data.name || data.name.length < 2) newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) newErrors.email = 'Introduce un email válido';
    if (data.phone && !/^[\d\s()+-]+$/.test(data.phone)) newErrors.phone = 'Formato de teléfono no válido';
    if (!data.date || new Date(data.date) < new Date(today.setHours(0,0,0,0))) newErrors.date = 'La fecha no puede ser anterior a hoy';
    if (!data.message || data.message.length < 10) newErrors.message = 'El mensaje debe tener al menos 10 caracteres';
    return newErrors;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleDayClick = (day) => {
    if (day.prev || day.next || day.status === 'booked') return;
    
    setSelectedCalendarDay(day.d);
    const dateStr = `${calendar.year}-${String(calendar.month + 1).padStart(2, '0')}-${String(day.d).padStart(2, '0')}`;
    setForm(prev => ({ ...prev, date: dateStr }));
    
    // Scroll suave al formulario
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    if (errors.date) {
      setErrors({ ...errors, date: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm(form);
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setLoading(true);
    await new Promise(r => setTimeout(r, 800));

    // 1. Guardar solicitud de reserva localmente para el editor
    if (form.date) {
      const selectedDate = new Date(form.date + 'T00:00:00');
      const reservationRequest = {
        id: Date.now(),
        clientName: form.name,
        email: form.email,
        phone: form.phone,
        eventType: form.type,
        message: form.message,
        year: selectedDate.getFullYear(),
        month: selectedDate.getMonth(),
        day: selectedDate.getDate(),
        status: 'pending',
        submittedAt: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      };

      const existing = JSON.parse(localStorage.getItem('luxe_reservation_requests') || '[]');
      existing.push(reservationRequest);
      localStorage.setItem('luxe_reservation_requests', JSON.stringify(existing));
    }

    // 2. Generar mensaje WhatsApp
    const whatsappNumber = (contactInfo.whatsapp || '+34600000000').replace(/[^0-9]/g, '');
    const message = `
🎬 *NUEVA SOLICITUD DE EVENTO*
━━━━━━━━━━━━━━━━━━━━━

👤 *Nombre:* ${form.name}
📧 *Email:* ${form.email}
📱 *Teléfono:* ${form.phone || 'No indicado'}
📅 *Fecha del evento:* ${form.date || 'Por confirmar'}
🎯 *Tipo de evento:* ${form.type}

💬 *Mensaje:*
${form.message}

━━━━━━━━━━━━━━━━━━━━━
_Enviado desde el sitio web de Elky Studio_
    `.trim();

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    
    setSubmitted(true);
    setLoading(false);
    
    setForm({ name: '', email: '', phone: '', date: '', type: EVENT_TYPES[0], message: '' });
    setSelectedCalendarDay(null);
    setTimeout(() => setSubmitted(false), 8000);
  };

  const getResponseTime = () => {
    const day = new Date().getDay();
    if (day === 0 || day === 6) return { text: 'Respondemos el lunes', icon: 'schedule' };
    return { text: 'Respuesta en menos de 24h', icon: 'bolt' };
  };
  const responseInfo = getResponseTime();

  return (
    <PageTransition>
      <motion.section 
        className="contact-hero"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-display-lg">Hablemos de tu próximo evento</h1>
        <p className="text-body-lg contact-hero__sub">
          Capturamos la esencia de tus momentos más importantes con una mirada
          artística y técnica excepcional. Reserva tu fecha hoy mismo.
        </p>
      </motion.section>

      <section className="contact-main container" style={{ paddingBottom: 'var(--section-gap)' }}>
        <div className="contact-form-wrap" ref={formRef}>
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                className="contact-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                style={{ textAlign: 'center', padding: '40px 20px' }}
              >
                <div className="contact-success__icon-wrap">
                  <span className="material-symbols-outlined contact-success__icon" style={{ fontSize: 64, color: '#4caf50' }}>check_circle</span>
                </div>
                <h3 className="text-headline-lg" style={{ marginTop: 24 }}>¡Mensaje listo!</h3>
                <p className="text-body-lg" style={{ color: 'var(--on-surface-variant)', marginTop: 12, maxWidth: 400, marginInline: 'auto' }}>
                  Se abrió WhatsApp con tu solicitud preparada. Si no se abrió automáticamente,
                  <a href={`https://wa.me/${(contactInfo.whatsapp || '').replace(/[^0-9]/g, '')}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ color: '#bf953f', marginLeft: 4, fontWeight: 700 }}>
                    haz click aquí
                  </a>
                </p>
                <button className="btn-outline" onClick={() => setSubmitted(false)} style={{ marginTop: 32 }}>
                  Enviar otra solicitud
                </button>
              </motion.div>
            ) : (
              <motion.form 
                key="form"
                className="contact-form" 
                onSubmit={handleSubmit}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <div className="contact-form__row">
                  <div className="contact-form__field">
                    <label className="text-label-sm">Nombre Completo</label>
                    <input 
                      type="text" name="name" placeholder="Tu nombre" 
                      value={form.name} onChange={handleChange} 
                      className={`contact-form__input ${errors.name ? 'contact-form__input--error' : ''}`} 
                    />
                    {errors.name && <span className="contact-form__error-msg">{errors.name}</span>}
                  </div>
                  <div className="contact-form__field">
                    <label className="text-label-sm">Correo Electrónico</label>
                    <input 
                      type="email" name="email" placeholder="email@ejemplo.com" 
                      value={form.email} onChange={handleChange} 
                      className={`contact-form__input ${errors.email ? 'contact-form__input--error' : ''}`} 
                    />
                    {errors.email && <span className="contact-form__error-msg">{errors.email}</span>}
                  </div>
                </div>
                <div className="contact-form__row">
                  <div className="contact-form__field">
                    <label className="text-label-sm">Teléfono (Opcional)</label>
                    <input 
                      type="tel" name="phone" placeholder="+51 999 999 999" 
                      value={form.phone} onChange={handleChange} 
                      className={`contact-form__input ${errors.phone ? 'contact-form__input--error' : ''}`} 
                    />
                  </div>
                  <div className="contact-form__field">
                    <label className="text-label-sm">Fecha del Evento</label>
                    <input 
                      type="date" name="date" 
                      value={form.date} onChange={handleChange} 
                      className={`contact-form__input ${errors.date ? 'contact-form__input--error' : ''}`} 
                    />
                    {errors.date && <span className="contact-form__error-msg">{errors.date}</span>}
                  </div>
                </div>
                <div className="contact-form__field">
                  <label className="text-label-sm">Tipo de Evento</label>
                  <select name="type" value={form.type} onChange={handleChange} className="contact-form__input contact-form__select">
                    {EVENT_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="contact-form__field">
                  <label className="text-label-sm">Mensaje</label>
                  <textarea 
                    name="message" placeholder="Cuéntanos más sobre tu visión..." 
                    rows={4} maxLength={500}
                    value={form.message} onChange={handleChange} 
                    className={`contact-form__input contact-form__textarea ${errors.message ? 'contact-form__input--error' : ''}`} 
                  />
                  <div className="contact-form__char-count">
                    <span>{form.message.length}</span>/500
                  </div>
                  {errors.message && <span className="contact-form__error-msg">{errors.message}</span>}
                </div>
                
                <div className="contact-form__response-time">
                  <span className="material-symbols-outlined">{responseInfo.icon}</span>
                  <span className="text-label-sm">{responseInfo.text}</span>
                </div>

                <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 8, verticalAlign: 'middle' }}>
                    {loading ? 'progress_activity' : 'send'}
                  </span>
                  {loading ? 'Preparando mensaje...' : 'Enviar por WhatsApp'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <motion.div 
          className="contact-info"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h3 className="text-headline-md contact-info__title">Información Directa</h3>
          <div className="contact-info__items">
            <a href={`https://wa.me/${(contactInfo.whatsapp || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hola, me gustaría consultar sobre vuestros servicios fotográficos.')}`}
               target="_blank" rel="noopener noreferrer" className="contact-info__item contact-info__item--link">
              <span className="material-symbols-outlined contact-info__icon">chat_bubble</span>
              <div>
                <p className="text-label-sm contact-info__label">WhatsApp</p>
                <p className="text-body-lg">{contactInfo.whatsapp || '+34 600 000 000'}</p>
              </div>
              <span className="material-symbols-outlined contact-info__arrow">arrow_outward</span>
            </a>
            <a href={`mailto:${contactInfo.email || 'contacto@elkystudios.com'}`} className="contact-info__item contact-info__item--link">
              <span className="material-symbols-outlined contact-info__icon">mail</span>
              <div>
                <p className="text-label-sm contact-info__label">Email</p>
                <p className="text-body-lg">{contactInfo.email || 'contacto@elkystudios.com'}</p>
              </div>
              <span className="material-symbols-outlined contact-info__arrow">arrow_outward</span>
            </a>

            {/* Redes Sociales Dinámicas */}
            {[
              { key: 'instagram', label: 'Instagram', linkKey: 'instagramLink', icon: 'camera' },
              { key: 'facebook', label: 'Facebook', linkKey: 'facebookLink', icon: 'groups' },
              { key: 'tiktok', label: 'TikTok', linkKey: 'tiktokLink', icon: 'play_circle' },
              { key: 'youtube', label: 'YouTube', linkKey: 'youtubeLink', icon: 'smart_display' },
              { key: 'pinterest', label: 'Pinterest', linkKey: 'pinterestLink', icon: 'push_pin' },
            ].filter(s => contactInfo[s.linkKey]).map(s => (
              <a key={s.key} href={contactInfo[s.linkKey]} target="_blank" rel="noopener noreferrer" className="contact-info__item contact-info__item--link">
                <span className="material-symbols-outlined contact-info__icon">{s.icon}</span>
                <div>
                  <p className="text-label-sm contact-info__label">{s.label}</p>
                  <p className="text-body-lg">{contactInfo[s.key] || contactInfo[s.linkKey]}</p>
                </div>
                <span className="material-symbols-outlined contact-info__arrow">arrow_outward</span>
              </a>
            ))}
          </div>

          <div className="contact-map">
            <p className="text-label-sm contact-map__label" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#bf953f' }}>location_on</span>
              Zona de cobertura
            </p>
            
            {(contactInfo.workZones || []).length === 0 ? (
              <p style={{ color:'#888', fontSize:14 }}>
                Cobertura disponible — contáctanos para consultar tu zona
              </p>
            ) : (
              <>
                <InteractiveMap
                  mode="zones"
                  zones={contactInfo.workZones}
                  interactive={false}
                  defaultCenter={[-11.9175, -77.0543]}
                  defaultZoom={12}
                />

                {/* Chips de zonas */}
                <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:16 }}>
                  {(contactInfo.workZones || []).map(zone => (
                    <div key={zone.id} style={{
                      display:'flex', alignItems:'center', gap:6,
                      padding:'6px 14px',
                      background:'#f9f4ea',
                      border:'1px solid #e8d9b5',
                      borderRadius:20
                    }}>
                      <span style={{
                        width:8, height:8, borderRadius:'50%',
                        background: zone.color || '#bf953f',
                        display:'inline-block', flexShrink:0
                      }} />
                      <div>
                        <span style={{ fontSize:13, fontWeight:700 }}>{zone.name}</span>
                        {zone.description && (
                          <span style={{ fontSize:12, color:'#888', marginLeft:6 }}>
                            — {zone.description}
                          </span>
                        )}
                        <span style={{ fontSize:11, color:'#bf953f', marginLeft:6 }}>
                          ({zone.radiusKm} km)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Texto de cobertura */}
                <p style={{ fontSize:12, color:'#aaa', marginTop:12, display:'flex', alignItems:'center', gap:4 }}>
                  <span className="material-symbols-outlined" style={{ fontSize:14 }}>info</span>
                  También realizamos viajes a otras zonas. Consúltanos.
                </p>
              </>
            )}
          </div>
        </motion.div>
      </section>

      <motion.section 
        className="contact-calendar section-padding" 
        style={{ background: 'var(--surface-container-low)' }}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="container">
          <div className="contact-calendar__header">
            <h2 className="text-headline-xl">Consultar disponibilidad</h2>
            <p className="text-body-lg contact-calendar__desc">
              Nuestras fechas se reservan con hasta 12 meses de antelación. Revisa nuestra agenda actual.
            </p>
          </div>
          
          <div className="contact-calendar__box">
            <div className="contact-calendar__nav">
              <h4 className="text-headline-md">{calendar.monthName} {calendar.year}</h4>
              <div className="contact-calendar__arrows">
                <button className="contact-calendar__arrow" onClick={calendar.prevMonth}><span className="material-symbols-outlined">chevron_left</span></button>
                <button className="contact-calendar__arrow" onClick={calendar.nextMonth}><span className="material-symbols-outlined">chevron_right</span></button>
              </div>
            </div>
            <div className="contact-calendar__grid">
              {daysHeader.map(d => <div key={d} className="text-label-sm contact-calendar__day-header">{d}</div>)}
              {calendar.days.map((day, i) => (
                <div 
                  key={i} 
                  className={`contact-calendar__day 
                    ${day.prev || day.next ? 'contact-calendar__day--prev' : ''} 
                    ${day.status === 'booked' ? 'contact-calendar__day--booked' : ''} 
                    ${day.status === 'consult' ? 'contact-calendar__day--consult' : ''}
                    ${selectedCalendarDay === day.d && !day.prev && !day.next ? 'contact-calendar__day--selected' : ''}`}
                  onClick={() => handleDayClick(day)}
                  style={{ cursor: day.prev || day.next || day.status === 'booked' ? 'default' : 'pointer' }}
                >
                  {day.d}
                  {day.status === 'consult' && <span className="contact-calendar__dot"></span>}
                </div>
              ))}
            </div>
            <div className="contact-calendar__legend">
              <div className="contact-calendar__legend-item">
                <span className="contact-calendar__legend-box contact-calendar__legend-box--booked"></span>
                <span className="text-label-sm">Reservado</span>
              </div>
              <div className="contact-calendar__legend-item">
                <span className="contact-calendar__legend-box contact-calendar__legend-box--available"></span>
                <span className="text-label-sm">Disponible</span>
              </div>
              <div className="contact-calendar__legend-item">
                <span className="contact-calendar__legend-box contact-calendar__legend-box--consult"></span>
                <span className="text-label-sm">En Consulta</span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.a
        href={`https://wa.me/${(contactInfo.whatsapp || '').replace(/[^0-9]/g, '')}`}
        target="_blank" rel="noopener noreferrer"
        className="contact-whatsapp-fab"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.5, type: 'spring' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="material-symbols-outlined">chat_bubble</span>
      </motion.a>
    </PageTransition>
  );
}
