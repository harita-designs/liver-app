import { useNavigate } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer({ email }) {
  const nav = useNavigate();
  return (
    <footer className={styles.footer}>
      <div className={styles.brand}>
        <div className={styles.brandName}>Liver<br/>Disease<br/>Prediction</div>
        <div className={styles.email}>{email}</div>
      </div>
      <nav className={styles.links}>
        {[['Home', '/home'], ['Predict', '/patients'], ['About', '#'], ['Terms', '#'], ['Contact', '#']].map(([label, to]) => (
          <a key={label} href="#" className={styles.link} onClick={e => { e.preventDefault(); nav(to); }}>{label}</a>
        ))}
      </nav>
    </footer>
  );
}
