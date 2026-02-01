import Link from 'next/link';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-content">
          <p className="footer-tagline">
            <strong>habitat-intermédiaire.fr</strong> — Parce que bien vieillir, c&apos;est d&apos;abord bien choisir.
          </p>
          <div className="footer-links">
            <Link href="/mentions-legales" className="footer-link">
              Mentions légales
            </Link>
            <span className="footer-separator">•</span>
            <Link href="/politique-confidentialite" className="footer-link">
              Politique de confidentialité
            </Link>
            <span className="footer-separator">•</span>
            <Link href="/contact" className="footer-link">
              Contact
            </Link>
          </div>
          <p className="footer-copyright">
            © {new Date().getFullYear()} <a href="https://confidensia.fr" target="_blank" rel="noopener noreferrer" className="footer-link">ConfidensIA SAS</a> — Tous droits réservés
          </p>
        </div>
      </div>
    </footer>
  );
}
