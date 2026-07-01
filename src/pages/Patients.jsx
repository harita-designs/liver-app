import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, ChevronRight, SlidersHorizontal, Check } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { predict } from '../utils/predict';
import styles from './Patients.module.css';

function initials(n) { return n.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase(); }

const FILTER_OPTIONS = [
  { key: null,       label: 'All Patients' },
  { key: 'high',     label: 'High & Elevated', color: 'var(--danger)' },
  { key: 'moderate', label: 'Moderate Risk',   color: 'var(--warn)'   },
  { key: 'low',      label: 'Low Risk',        color: 'var(--ok)'     },
];

export default function Patients({ email, patients, onLogout, onSelectPatient }) {
  const [q, setQ] = useState('');
  const [filterRisk, setFilterRisk] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const nav = useNavigate();
  const heroRef = useRef(null);
  const filterRef = useRef(null);

  // close dropdown on outside click
  useEffect(() => {
    function handle(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const searched = patients.filter(p =>
    p.name.toLowerCase().includes(q.toLowerCase()) || p.id.toLowerCase().includes(q.toLowerCase())
  );

  const filtered = searched.filter(p => {
    if (!filterRisk) return true;
    const r = predict(p);
    if (filterRisk === 'high')     return r.score >= 50;
    if (filterRisk === 'moderate') return r.score >= 25 && r.score < 50;
    if (filterRisk === 'low')      return r.score < 25;
    return true;
  });

  const allResults = patients.map(p => predict(p));
  const highCount = allResults.filter(r => r.score >= 50).length;
  const modCount  = allResults.filter(r => r.score >= 25 && r.score < 50).length;
  const lowCount  = allResults.filter(r => r.score < 25).length;

  function pick(p) {
    onSelectPatient(p, predict(p));
    nav('/result');
  }

  return (
    <div className={styles.page}>
      <Navbar email={email} onLogout={onLogout} heroRef={heroRef}/>

      {/* ── DARK HEADER ── */}
      <header ref={heroRef} className={styles.hero}>
        <div className={styles.heroBg}/>

        <div className={styles.heroContent}>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .5, ease: [.22,1,.36,1] }}>
            <h1 className={styles.title}>Patients</h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .5, delay: .15, ease: [.22,1,.36,1] }}>
            <div className={styles.statRow}>
              <div className={styles.statItem}>
                <span className={styles.statNum}>{patients.length}</span>
                <span className={styles.statLbl}>Total</span>
              </div>
              <span className={styles.statSep}/>
              <div className={styles.statItem}>
                <span className={styles.statDot} style={{ background: 'var(--danger)' }}/>
                <span className={styles.statNum}>{highCount}</span>
                <span className={styles.statLbl}>High</span>
              </div>
              <span className={styles.statSep}/>
              <div className={styles.statItem}>
                <span className={styles.statDot} style={{ background: 'var(--warn)' }}/>
                <span className={styles.statNum}>{modCount}</span>
                <span className={styles.statLbl}>Moderate</span>
              </div>
              <span className={styles.statSep}/>
              <div className={styles.statItem}>
                <span className={styles.statDot} style={{ background: 'var(--ok)' }}/>
                <span className={styles.statNum}>{lowCount}</span>
                <span className={styles.statLbl}>Low</span>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* ── SEARCH & ADD ── */}
      <motion.section className={styles.toolbar}
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .45, delay: .25, ease: [.22,1,.36,1] }}>

        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon}/>
          <input
            className={styles.searchInput}
            value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search by name or ID…"
          />
          {q && <button className={styles.clearBtn} onClick={() => setQ('')}>×</button>}
        </div>

        {/* ── FILTER ── */}
        <div className={styles.filterWrap} ref={filterRef}>
          <motion.button
            className={`${styles.filterBtn} ${filterRisk ? styles.filterActive : ''}`}
            onClick={() => setFilterOpen(o => !o)}
            whileTap={{ scale: .97 }}
          >
            <SlidersHorizontal size={14}/>
            Filter
            {filterRisk && (
              <span className={styles.filterDot}
                style={{ background: FILTER_OPTIONS.find(o => o.key === filterRisk)?.color }}/>
            )}
          </motion.button>

          <AnimatePresence>
            {filterOpen && (
              <motion.div
                className={styles.filterDropdown}
                initial={{ opacity: 0, y: 6, scale: .97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: .97 }}
                transition={{ duration: .18, ease: [.22,1,.36,1] }}>
                {FILTER_OPTIONS.map(opt => (
                  <button
                    key={String(opt.key)}
                    className={`${styles.filterOption} ${filterRisk === opt.key ? styles.filterOptionActive : ''}`}
                    onClick={() => { setFilterRisk(opt.key); setFilterOpen(false); }}>
                    {opt.color && (
                      <span className={styles.filterOptionDot} style={{ background: opt.color }}/>
                    )}
                    <span className={styles.filterOptionLabel}>{opt.label}</span>
                    {filterRisk === opt.key && <Check size={13} className={styles.filterCheck}/>}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button className={styles.addBtn} onClick={() => nav('/add')}
          whileTap={{ scale: .97 }}>
          <Plus size={15}/> New Patient
        </motion.button>
      </motion.section>

      {/* ── PATIENT LIST ── */}
      <main className={styles.listWrap}>
        <div className={styles.list}>
          <AnimatePresence>
            {filtered.length === 0 && (
              <motion.div className={styles.empty}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className={styles.emptyTitle}>No results</p>
                <p className={styles.emptySub}>
                  {q ? `No patients match "${q}"` : 'No patients in this category'}
                </p>
              </motion.div>
            )}
            {filtered.map((p, i) => {
              const r = predict(p);
              return (
                <motion.div key={p.id} className={styles.card} onClick={() => pick(p)}
                  style={{ '--rc': r.color }}
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * .05, duration: .4, ease: [.22,1,.36,1] }}
                  whileHover={{ x: 4 }}>
                  <div className={styles.cardAccent}/>
                  <div className={styles.cardLeft}>
                    <div className={styles.avatar}>{initials(p.name)}</div>
                    <div className={styles.patientInfo}>
                      <div className={styles.name}>{p.name}</div>
                      <div className={styles.meta}>
                        <span>{p.id}</span>
                        <span className={styles.dot}>·</span>
                        <span>Age {p.age}</span>
                        <span className={styles.dot}>·</span>
                        <span>{p.g === 'M' ? 'Male' : 'Female'}</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.cardRight}>
                    <div className={styles.riskBadge}>
                      <span className={styles.riskDot}/>
                      <span className={styles.riskLabel}>{r.level}</span>
                    </div>
                    <ChevronRight size={18} className={styles.arrow}/>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </main>

      <Footer email={email}/>
    </div>
  );
}
