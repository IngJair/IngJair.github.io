import { Link } from 'react-router';
import PageTransition from '../components/PageTransition';
import './InfoPage.css';

export default function NotFound() {
  return (
    <PageTransition>
      <section className="info-hero section-padding">
        <div className="container info-hero__inner">
          <span className="text-label-sm info-page__eyebrow">Error 404</span>
          <h1 className="text-display-lg">Página no encontrada</h1>
          <p className="text-body-lg">
            El enlace puede haber cambiado o la página ya no está disponible.
          </p>
          <Link className="btn-primary" to="/" style={{ marginTop: 30 }}>
            Volver al inicio
          </Link>
        </div>
      </section>
    </PageTransition>
  );
}
