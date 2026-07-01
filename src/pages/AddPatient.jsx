import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import { predict } from '../utils/predict';
import styles from './AddPatient.module.css';

const PATIENT_FIELDS = [
  { id:'name', label:'Full Name',  type:'text',   placeholder:'e.g. James Carter', col:'full' },
  { id:'pid',  label:'Patient ID', type:'text',   placeholder:'e.g. 52684001' },
  { id:'age',  label:'Age',        type:'number', placeholder:'42', min:1, max:120 },
  { id:'g',    label:'Gender',     type:'select', options:['Male','Female','Other'] },
];

const LAB_GROUPS = [
  {
    id: 'bilirubin',
    label: 'Bilirubin',
    fields: [
      { id:'tb', label:'Total Bilirubin',  unit:'mg/dL', normal:'0.2–1.2', step:.1 },
      { id:'db', label:'Direct Bilirubin', unit:'mg/dL', normal:'0.0–0.3', step:.1 },
    ],
  },
  {
    id: 'enzymes',
    label: 'Liver Enzymes',
    fields: [
      { id:'alt',  label:'ALT / SGPT',          unit:'U/L',  normal:'7–40' },
      { id:'ast',  label:'AST / SGOT',           unit:'U/L',  normal:'10–40' },
      { id:'alkp', label:'Alkaline Phosphatase', unit:'IU/L', normal:'44–147' },
    ],
  },
  {
    id: 'proteins',
    label: 'Proteins',
    fields: [
      { id:'tp',  label:'Total Protein', unit:'g/dL', normal:'6.0–8.3', step:.1 },
      { id:'alb', label:'Albumin',       unit:'g/dL', normal:'3.5–5.0', step:.1 },
      { id:'agr', label:'A/G Ratio',     unit:'',     normal:'1.0–2.5', step:.01 },
    ],
  },
];

const ALL_LAB_FIELDS = LAB_GROUPS.flatMap(g => g.fields);

function initials(n) {
  if (!n?.trim()) return null;
  return n.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

function summaryText(score, topMarkers) {
  if (topMarkers.length === 0) return 'All biomarkers are within normal ranges. Low likelihood of liver disease.';
  const top = topMarkers[0];
  if (score >= 70) return `Significantly elevated ${top.label} is the primary driver. Immediate clinical review is recommended.`;
  if (score >= 50) return `Elevated ${top.label} indicates possible liver involvement. Further evaluation is advised.`;
  if (score >= 25) return `Mild elevations in ${topMarkers.map(m => m.label).join(' and ')} detected. Monitor over time.`;
  return 'Values are largely within normal ranges. Standard follow-up is sufficient.';
}

export default function AddPatient({ email, onLogout, onAddPatient, onSelectPatient }) {
  const [vals, setVals]     = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const heroRef = useRef(null);

  function set(id, v) {
    setVals(p => ({ ...p, [id]: v }));
    setErrors(p => ({ ...p, [id]: '' }));
  }

  // Live prediction state
  const filledLabs  = ALL_LAB_FIELDS.filter(f => vals[f.id] !== '' && vals[f.id] !== undefined);
  const missingLabs = ALL_LAB_FIELDS.filter(f => vals[f.id] === '' || vals[f.id] === undefined);
  const labComplete = missingLabs.length === 0;
  const progressPct = Math.round((filledLabs.length / ALL_LAB_FIELDS.length) * 100);

  let liveResult = null;
  if (labComplete) {
    liveResult = predict({
      id: 'live', name: vals.name || '', age: +(vals.age || 0), g: vals.g || '',
      tb: +vals.tb, db: +vals.db, alkp: +vals.alkp,
      alt: +vals.alt, ast: +vals.ast, tp: +vals.tp, alb: +vals.alb, agr: +vals.agr,
    });
  }

  function validate() {
    const e = {};
    if (!vals.name?.trim()) e.name = 'Required';
    if (!vals.pid?.trim())  e.pid  = 'Required';
    if (!vals.age || +vals.age < 1) e.age = 'Enter valid age';
    if (!vals.g) e.g = 'Required';
    ALL_LAB_FIELDS.forEach(f => {
      if (vals[f.id] === '' || vals[f.id] === undefined) e[f.id] = 'Required';
    });
    return e;
  }

  async function save(goToResult) {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const p = {
      id: 'P' + vals.pid, name: vals.name, age: +vals.age, g: vals.g,
      tb: +vals.tb, db: +vals.db, alkp: +vals.alkp,
      alt: +vals.alt, ast: +vals.ast, tp: +vals.tp, alb: +vals.alb, agr: +vals.agr,
    };
    onAddPatient(p);
    if (goToResult) {
      onSelectPatient(p, predict(p));
      nav('/result');
    } else {
      nav('/patients');
    }
  }

  const ini = initials(vals.name);

  return (
    <div className={styles.page}>
      <Navbar email={email} onLogout={onLogout} heroRef={heroRef}/>

      {/* ── DARK HERO ── */}
      <header ref={heroRef} className={styles.hero}>
        <div className={styles.heroBg}/>
        <motion.div className={styles.heroContent}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .5, ease: [.22,1,.36,1] }}>
          <h1 className={styles.title}>Add Patient</h1>
        </motion.div>
      </header>

      {/* ── TWO-COLUMN LAYOUT ── */}
      <div className={styles.layout}>

        {/* ── FORM COLUMN ── */}
        <motion.form
          onSubmit={e => { e.preventDefault(); save(true); }}
          noValidate className={styles.formCol}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .45, delay: .2, ease: [.22,1,.36,1] }}>

          {/* Patient info */}
          <section className={styles.section}>
            <div className={styles.sectionHeadRow}>
              <h2 className={styles.sectionHead}>Patient Information</h2>
              <span className={styles.sectionSub}>Enter biomarker values to generate an instant liver disease risk prediction.</span>
            </div>
            <div className={styles.grid}>
              {PATIENT_FIELDS.map(f => (
                <div key={f.id} className={`${styles.field} ${f.col === 'full' ? styles.full : ''}`}>
                  <label className={styles.label} htmlFor={f.id}>{f.label}</label>
                  {f.type === 'select' ? (
                    <select id={f.id}
                      className={`${styles.inp} ${errors[f.id] ? styles.inpErr : ''}`}
                      value={vals[f.id] ?? ''} onChange={e => set(f.id, e.target.value)}>
                      <option value="">Select…</option>
                      {f.options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input id={f.id} type={f.type}
                      className={`${styles.inp} ${errors[f.id] ? styles.inpErr : ''}`}
                      placeholder={f.placeholder} min={f.min} max={f.max}
                      value={vals[f.id] ?? ''} onChange={e => set(f.id, e.target.value)}
                    />
                  )}
                  {errors[f.id] && <span className={styles.err}>{errors[f.id]}</span>}
                </div>
              ))}
            </div>
          </section>

          {/* Biomarker groups */}
          {LAB_GROUPS.map((group, gi) => (
            <section key={group.id}
              className={`${styles.section} ${gi === LAB_GROUPS.length - 1 ? styles.sectionLast : ''}`}>
              <h2 className={styles.sectionHead}>{group.label}</h2>
              <div className={styles.labGrid}>
                {group.fields.map(f => (
                  <div key={f.id} className={styles.field}>
                    <label className={styles.label} htmlFor={f.id}>{f.label}</label>
                    <div className={styles.inpWrap}>
                      <input id={f.id} type="number" step={f.step || 1} min="0"
                        className={`${styles.inp} ${f.unit ? styles.inpHasUnit : ''} ${errors[f.id] ? styles.inpErr : ''}`}
                        placeholder="—"
                        value={vals[f.id] ?? ''}
                        onChange={e => set(f.id, e.target.value)}
                      />
                      {f.unit && <span className={styles.inpUnit}>{f.unit}</span>}
                    </div>
                    {f.normal && (
                      <span className={styles.rangeHint}>
                        Normal: {f.normal}{f.unit ? ` ${f.unit}` : ''}
                      </span>
                    )}
                    {errors[f.id] && <span className={styles.err}>{errors[f.id]}</span>}
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* Actions */}
          <div className={styles.actions}>
            <button type="button" className={styles.btnCancel}
              onClick={() => nav('/patients')}>Cancel</button>
            <motion.button type="submit" className={styles.btnPrimary} disabled={loading}
              whileTap={{ scale: .97 }}>
              {loading ? <span className={styles.spinner}/> : 'Save & Finish'}
            </motion.button>
          </div>
        </motion.form>

        {/* ── SUMMARY PANEL ── */}
        <motion.aside className={styles.summaryCol}
          initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: .5, delay: .35, ease: [.22,1,.36,1] }}>

          {/* Patient preview */}
          <div className={styles.summaryCard}>
            <p className={styles.cardLabel}>Patient Preview</p>
            <div className={styles.patientPreview}>
              <div className={styles.previewAvatar}>
                {ini || <span style={{ opacity: .35, fontSize: '1.1rem' }}>?</span>}
              </div>
              <div>
                <p className={styles.previewName}>
                  {vals.name?.trim() || <span className={styles.placeholder}>Full name</span>}
                </p>
                <p className={styles.previewMeta}>
                  {vals.pid ? `P${vals.pid}` : <span className={styles.placeholder}>ID</span>}
                  {vals.age ? ` · Age ${vals.age}` : ''}
                  {vals.g   ? ` · ${vals.g}` : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Assessment panel */}
          <div className={styles.summaryCard}>
            <p className={styles.cardLabel}>
              Assessment
              {labComplete && liveResult && (
                <span className={styles.readyPill} style={{ color: liveResult.color }}>Complete</span>
              )}
            </p>

            <AnimatePresence mode="wait">
              {filledLabs.length === 0 ? (
                <motion.div key="idle" className={styles.waitingState}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <p className={styles.waitingTitle}>Waiting for required data</p>
                  <p className={styles.waitingSub}>Complete all required biomarkers.</p>
                </motion.div>
              ) : !labComplete ? (
                <motion.div key="progress"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className={styles.progressRow}>
                    <span className={styles.progressLabel}>{filledLabs.length} of {ALL_LAB_FIELDS.length} biomarkers entered</span>
                    <span className={styles.progressPct}>{progressPct}%</span>
                  </div>
                  <div className={styles.progressTrack}>
                    <div className={styles.progressFill} style={{ width: `${progressPct}%` }}/>
                  </div>
                  <div className={styles.missingList}>
                    <p className={styles.miniLabel}>Still needed</p>
                    {missingLabs.map(f => (
                      <div key={f.id} className={styles.missingItem}>
                        <span className={styles.missingDot}/>
                        {f.label}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="result"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className={styles.liveRisk} style={{ '--rc': liveResult.color }}>
                    <div className={styles.liveRiskBadge}>
                      <span className={styles.liveRiskDot}/>
                      <span className={styles.liveRiskLevel}>{liveResult.level}</span>
                    </div>
                    <span className={styles.liveScore}>{liveResult.score}%</span>
                  </div>
                  <div className={styles.scoreTrack}>
                    <div className={styles.scoreFill}
                      style={{ width: `${liveResult.score}%`, background: liveResult.color }}/>
                  </div>
                  {liveResult.topMarkers.length > 0 && (
                    <div className={styles.markerList}>
                      <p className={styles.miniLabel}>Key findings</p>
                      {liveResult.topMarkers.map(m => (
                        <div key={m.key} className={styles.markerRow}>
                          <span className={styles.markerDot}
                            style={{ background: m.danger ? 'var(--danger)' : 'var(--warn)' }}/>
                          <span className={styles.markerLabel}>{m.label}</span>
                          <span className={styles.markerVal}>
                            {m.val} {m.unit}
                            <span className={styles.markerDir}> {m.dir === 'high' ? '↑' : '↓'}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className={styles.aiSummary}>
                    {summaryText(liveResult.score, liveResult.topMarkers)}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Normal ranges reference */}
          <div className={styles.summaryCard}>
            <p className={styles.cardLabel}>Normal Ranges</p>
            <div className={styles.rangeRef}>
              {LAB_GROUPS.map((group, gi) => (
                <div key={group.id}
                  className={`${styles.rangeGroup} ${gi === LAB_GROUPS.length - 1 ? styles.rangeGroupLast : ''}`}>
                  <p className={styles.rangeGroupLabel}>{group.label}</p>
                  {group.fields.map(f => (
                    <div key={f.id} className={styles.rangeRow}>
                      <span className={styles.rangeName}>{f.label}</span>
                      <span className={styles.rangeValue}>{f.normal}{f.unit ? ` ${f.unit}` : ''}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}
