import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';

function LivrIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
      <rect width="30" height="30" rx="8" fill="#002FFF"/>
      <rect x="7" y="7" width="5" height="16" rx="1.5" fill="white"/>
      <rect x="12" y="18" width="11" height="5" rx="1.5" fill="white"/>
      <circle cx="21" cy="9.5" r="2" fill="white" fillOpacity="0.45"/>
    </svg>
  );
}

const NAV_LINKS = ['About', 'How it Works', 'For Whom', 'Contacts'];

/* ── App bar (Patients, Result) ── */
function AppBar({ pageTitle, onLogout, scrolled }) {
  const nav = useNavigate();
  return (
    <nav className={`${styles.appBar} ${scrolled ? styles.appBarLight : styles.appBarDark}`}>
      <div className={styles.appBarLeft}>
        <button className={styles.appBarLogo} onClick={() => nav('/home')}>
          <LivrIcon />
        </button>
      </div>
      <button className={styles.appBarLogout} onClick={onLogout}>Logout</button>
    </nav>
  );
}

/* ── Marketing pill (Home) ── */
export default function Navbar({ email, onLogout, heroRef, pageTitle }) {
  const nav = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (heroRef?.current) {
      const obs = new IntersectionObserver(
        ([e]) => setScrolled(!e.isIntersecting),
        { threshold: 0 }
      );
      obs.observe(heroRef.current);
      return () => obs.disconnect();
    }
    const handle = () => setScrolled(window.scrollY > window.innerHeight * 0.88);
    handle();
    window.addEventListener('scroll', handle, { passive: true });
    return () => window.removeEventListener('scroll', handle);
  }, [heroRef]);

  if (pageTitle) return <AppBar pageTitle={pageTitle} onLogout={onLogout} scrolled={scrolled}/>;

  return (
    <nav className={styles.nav}>
      <div className={`${styles.pill} ${scrolled ? styles.pillScrolled : ''}`}>
        <button className={styles.logoWrap} onClick={() => nav('/home')}>
          <LivrIcon />
        </button>
        <div className={styles.links}>
          {NAV_LINKS.map(label => (
            <button key={label} className={styles.link}>{label}</button>
          ))}
        </div>
        <button className={styles.logout} onClick={onLogout}>Logout</button>
      </div>
    </nav>
  );
}
