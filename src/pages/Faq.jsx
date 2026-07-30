import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router';
import PageTransition from '../components/PageTransition';
import './InfoPage.css';

const QUESTIONS = [
  {
    question: '¿Cómo consulto si mi fecha está disponible?',
    answer: 'Puedes revisar el calendario de la página de contacto y enviar tu solicitud por WhatsApp. La fecha se confirma cuando Elky Studios valida la disponibilidad y las condiciones del servicio.',
  },
  {
    question: '¿Los paquetes se pueden personalizar?',
    answer: 'Sí. La duración, la cantidad de fotógrafos, el video, el álbum y otros adicionales pueden ajustarse a las necesidades del evento.',
  },
  {
    question: '¿Trabajan fuera de Collique y Comas?',
    answer: 'Sí. Elky Studios puede atender otras zonas de Lima y evaluar viajes. La movilidad y cualquier costo adicional se informan antes de confirmar la reserva.',
  },
  {
    question: '¿Cuándo se entregan las fotografías y videos?',
    answer: 'El plazo depende del tipo de evento y del paquete contratado. La fecha estimada de entrega se incluye en la cotización o acuerdo de servicio.',
  },
  {
    question: '¿Cómo se confirma una reserva?',
    answer: 'Después de validar la fecha, Elky Studios envía las condiciones del servicio y el método de confirmación. No realices pagos a números o cuentas que no hayan sido confirmados por los canales oficiales.',
  },
  {
    question: '¿Puedo solicitar una cotización sin compromiso?',
    answer: 'Sí. Indica la fecha, el tipo de evento, la zona y el servicio que necesitas para recibir una propuesta adecuada.',
  },
];

export default function Faq() {
  const [openItem, setOpenItem] = useState(0);

  return (
    <PageTransition>
      <section className="info-hero section-padding">
        <div className="container info-hero__inner">
          <span className="text-label-sm info-page__eyebrow">Ayuda</span>
          <h1 className="text-display-lg">Preguntas frecuentes</h1>
          <p className="text-body-lg">Información clara antes de reservar tu sesión o evento.</p>
        </div>
      </section>

      <section className="info-page section-padding">
        <div className="container info-page__content">
          <div className="info-faq">
            {QUESTIONS.map((item, index) => {
              const isOpen = openItem === index;
              return (
                <article className={`info-faq__item ${isOpen ? 'info-faq__item--open' : ''}`} key={item.question}>
                  <button
                    className="info-faq__question"
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenItem(isOpen ? null : index)}
                  >
                    <span>{item.question}</span>
                    <span className="material-symbols-outlined" aria-hidden="true">
                      {isOpen ? 'remove' : 'add'}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        className="info-faq__answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <p>{item.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </article>
              );
            })}
          </div>

          <aside className="info-page__cta">
            <h2>¿Tienes otra consulta?</h2>
            <p>Cuéntanos los detalles y te responderemos por nuestros canales oficiales.</p>
            <Link className="btn-primary" to="/contact">Contactar</Link>
          </aside>
        </div>
      </section>
    </PageTransition>
  );
}
