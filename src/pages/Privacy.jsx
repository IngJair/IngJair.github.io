import { Link } from 'react-router';
import PageTransition from '../components/PageTransition';
import './InfoPage.css';

export default function Privacy() {
  return (
    <PageTransition>
      <section className="info-hero section-padding">
        <div className="container info-hero__inner">
          <span className="text-label-sm info-page__eyebrow">Información</span>
          <h1 className="text-display-lg">Privacidad</h1>
          <p className="text-body-lg">Cómo se utilizan los datos que compartes con Elky Studios.</p>
        </div>
      </section>

      <section className="info-page section-padding">
        <article className="container info-page__article">
          <p className="info-page__updated">Última actualización: 30 de julio de 2026</p>

          <h2>Datos que recibimos</h2>
          <p>
            Cuando envías una consulta, una solicitud de reserva o una reseña, podemos recibir tu nombre,
            correo, teléfono, fecha y tipo de evento, mensaje, calificación y el contenido que decidas adjuntar.
          </p>

          <h2>Para qué se utilizan</h2>
          <p>
            Utilizamos estos datos para responder consultas, preparar cotizaciones, comprobar disponibilidad,
            organizar reservas y moderar reseñas. No solicitamos información bancaria desde este sitio.
          </p>

          <h2>Almacenamiento y acceso</h2>
          <p>
            Las solicitudes y el contenido administrativo se almacenan mediante Supabase. El acceso de edición
            está protegido por autenticación y se limita a las cuentas administrativas autorizadas.
          </p>

          <h2>Publicación de reseñas</h2>
          <p>
            Las reseñas enviadas pasan por moderación antes de mostrarse públicamente. No publicamos una reseña
            pendiente sin revisión administrativa.
          </p>

          <h2>Enlaces externos</h2>
          <p>
            El sitio puede abrir servicios externos como WhatsApp, Instagram y mapas. Esos servicios aplican
            sus propias condiciones y políticas de privacidad.
          </p>

          <h2>Consultas sobre tus datos</h2>
          <p>
            Puedes pedir información, corrección o eliminación de una solicitud mediante los canales oficiales
            publicados en la página de contacto.
          </p>

          <div className="info-page__cta info-page__cta--inline">
            <h2>¿Necesitas comunicarte con nosotros?</h2>
            <Link className="btn-primary" to="/contact">Ir a contacto</Link>
          </div>
        </article>
      </section>
    </PageTransition>
  );
}
