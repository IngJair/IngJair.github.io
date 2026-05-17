import { useState } from 'react';
import { useSiteContent } from '../../context/SiteContentContext';
import { AdminSection, AdminField } from './AdminField';

export default function CalendarPanel() {
  const { content, updateContent } = useSiteContent();
  const { calendar } = content;
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());

  const isBooked = (d) => calendar.bookedDates.some(b => b.year === viewYear && b.month === viewMonth && b.day === d);
  const isConsult = (d) => calendar.consultDates.some(b => b.year === viewYear && b.month === viewMonth && b.day === d);

  const toggleDay = (d, type) => {
    const key = type === 'booked' ? 'calendar.bookedDates' : 'calendar.consultDates';
    const arr = type === 'booked' ? calendar.bookedDates : calendar.consultDates;
    const exists = arr.some(b => b.year === viewYear && b.month === viewMonth && b.day === d);
    if (exists) {
      updateContent(key, arr.filter(b => !(b.year === viewYear && b.month === viewMonth && b.day === d)));
    } else {
      updateContent(key, [...arr, { year: viewYear, month: viewMonth, day: d }]);
    }
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const monthName = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' })
    .format(new Date(viewYear, viewMonth));

  return (
    <AdminSection title="Gestión del Calendario" description="Haz click en un día para marcarlo como reservado (negro) o en consulta (gris). Click derecho para en consulta.">
      <div className="admin-calendar">
        <div className="admin-calendar__nav">
          <button className="admin-icon-btn" onClick={() => {
            if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
            else setViewMonth(m => m - 1);
          }}>
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{monthName}</span>
          <button className="admin-icon-btn" onClick={() => {
            if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
            else setViewMonth(m => m + 1);
          }}>
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>

        <div className="admin-calendar__grid">
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => (
            <button
              key={d}
              className={`admin-calendar__day 
                ${isBooked(d) ? 'admin-calendar__day--booked' : ''}
                ${isConsult(d) ? 'admin-calendar__day--consult' : ''}`}
              onClick={() => toggleDay(d, 'booked')}
              onContextMenu={e => { e.preventDefault(); toggleDay(d, 'consult'); }}
              title="Click: reservado | Click derecho: en consulta"
            >
              {d}
            </button>
          ))}
        </div>

        <div className="admin-calendar__legend">
          <span><span className="admin-cal-dot admin-cal-dot--booked" /> Click izq. = Reservado</span>
          <span><span className="admin-cal-dot admin-cal-dot--consult" /> Click der. = En Consulta</span>
          <span><span className="admin-cal-dot" /> Click de nuevo = Disponible</span>
        </div>
      </div>
    </AdminSection>
  );
}
