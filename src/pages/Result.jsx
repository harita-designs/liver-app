import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarPlus, Bot, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Chatbot from '../components/Chatbot';
import ApptModal from '../components/ApptModal';
import styles from './Result.module.css';

// ── GAUGE ──────────────────────────────────────────────────────
const R_G      = 78;
const ARC_LEN  = 2 * Math.PI * R_G * 0.75;
const _s = (a) => ({
  x: +(100 + R_G * Math.cos(a * Math.PI / 180)).toFixed(2),
  y: +(100 + R_G * Math.sin(a * Math.PI / 180)).toFixed(2),
});
const SP         = _s(135);
const EP         = _s(45);
const GAUGE_PATH = `M ${SP.x},${SP.y} A ${R_G},${R_G} 0 1 1 ${EP.x},${EP.y}`;

function colorToHex(color) {
  if (color === 'var(--danger)') return '#e53e3e';
  if (color === 'var(--warn)')   return '#dd6b20';
  return '#2f855a';
}

// All reference ranges — mirrors predict.js NORMS
const ALL_NORMS = {
  alt:  { label: 'ALT (SGPT)',         unit: 'U/L',   lo: 7,   hi: 40  },
  ast:  { label: 'AST (SGOT)',         unit: 'U/L',   lo: 10,  hi: 40  },
  tb:   { label: 'Total Bilirubin',    unit: 'mg/dL', lo: 0.2, hi: 1.2 },
  db:   { label: 'Direct Bilirubin',   unit: 'mg/dL', lo: 0,   hi: 0.3 },
  alkp: { label: 'Alk. Phosphatase',   unit: 'IU/L',  lo: 44,  hi: 147 },
  tp:   { label: 'Total Protein',      unit: 'g/dL',  lo: 6.0, hi: 8.3 },
  alb:  { label: 'Albumin',            unit: 'g/dL',  lo: 3.5, hi: 5.0 },
};

function buildReport(patient, markers) {
  return Object.entries(ALL_NORMS).map(([key, n]) => {
    const val = patient[key];
    if (val == null) return null;
    const m   = markers.find(mk => mk.key === key);
    return {
      key,
      label:  n.label,
      val,
      unit:   n.unit,
      lo:     n.lo,
      hi:     n.hi,
      pct:    m?.pct  ?? 0,
      dir:    m?.dir  ?? 'normal',
      danger: m?.danger ?? false,
    };
  }).filter(Boolean);
}

function GaugeChart({ score, color }) {
  const [fill, setFill] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setFill((score / 100) * ARC_LEN), 150);
    return () => clearTimeout(t);
  }, [score]);
  const hex = colorToHex(color);

  return (
    <div className={styles.gaugeWrap} style={{ cursor: 'default' }}>
      <svg viewBox="0 0 200 172" className={styles.gaugeSvg}>
        <defs>
          <filter id="gaugeGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={3} result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <path d={GAUGE_PATH} fill="none" stroke="var(--p10)" strokeWidth="14" strokeLinecap="round"/>
        <path
          d={GAUGE_PATH} fill="none" stroke={hex} strokeWidth="14" strokeLinecap="round"
          strokeDasharray={`${fill} ${ARC_LEN}`}
          filter="url(#gaugeGlow)"
          style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)' }}
        />
        {/* Score + % share the same baseline, slightly below ring center */}
        <text x="100" y="108" textAnchor="middle"
          style={{
            fontFamily: 'Nunito Sans, sans-serif',
            fontWeight: 700,
            fontSize: 48,
            fill: hex,
            letterSpacing: -2,
          }}>
          {score}<tspan style={{ fontSize: 18, fontWeight: 400, opacity: .48, letterSpacing: 0 }}>%</tspan>
        </text>
        <text x="100" y="127" textAnchor="middle"
          style={{
            fontFamily: 'Nunito Sans, sans-serif', fontWeight: 600, fontSize: 9,
            fill: 'rgba(20,33,61,.32)',
            letterSpacing: .8,
          }}>
          Risk Score
        </text>
      </svg>
    </div>
  );
}

// ── VERTICAL BAR GROUP — wide bars, labels inside, Figma-style ──
const CHART_H = 220; // fixed chart area height in px

function BarGroup({ label, val, unit, pct, danger, norm, delay }) {
  const [patPx, setPatPx] = useState(0);
  const maxVal   = Math.max(val, norm.hi) * 1.18;
  const targetPx = Math.round((val     / maxVal) * CHART_H);
  const normPx   = Math.round((norm.hi / maxVal) * CHART_H);
  const hex      = danger ? '#e53e3e' : '#dd6b20';

  useEffect(() => {
    const t = setTimeout(() => setPatPx(targetPx), delay ?? 200);
    return () => clearTimeout(t);
  }, [targetPx, delay]);

  return (
    <div className={styles.barGroup}>
      <div className={styles.barGroupTop}>
        <span className={styles.barGroupPctNum} style={{ color: hex }}>{pct}%</span>
        <span className={styles.barGroupPctWord}>higher</span>
        <span className={styles.barGroupPctSub}>than normal</span>
      </div>

      <div className={styles.barGroupChart}>
        <div className={styles.bar}
          style={{ height: normPx, background: '#12B9DE', minHeight: 52 }}>
          <span className={styles.barLabel} style={{ color: 'rgba(255,255,255,.92)' }}>
            {norm.hi}<br/><span className={styles.barUnit}>{unit}</span>
          </span>
        </div>

        <div className={styles.bar}
          style={{
            height: patPx, minHeight: 52,
            background: danger
              ? 'linear-gradient(to top, rgba(229,62,62,.82), #e53e3e)'
              : 'linear-gradient(to top, rgba(221,107,32,.82), #dd6b20)',
            transition: 'height 1.1s cubic-bezier(.4,0,.2,1)',
          }}>
          <span className={styles.barLabel} style={{ color: 'rgba(255,255,255,.92)' }}>
            {val}<br/><span className={styles.barUnit}>{unit}</span>
          </span>
        </div>
      </div>

      <span className={styles.barGroupFooter}>{label}</span>
    </div>
  );
}

// ── FINDINGS & METADATA ────────────────────────────────────────
const FINDINGS = {
  alt:  ['Elevated ALT',              'Suggests hepatocellular injury or active liver inflammation.'],
  ast:  ['High AST',                  'Indicates liver cell damage; when elevated with ALT, consider hepatitis or toxic injury.'],
  tb:   ['Elevated Total Bilirubin',  'Reflects impaired bilirubin clearance or increased haemolysis.'],
  db:   ['Elevated Direct Bilirubin', 'Associated with impaired bile flow; consider cholestatic liver disease.'],
  alkp: ['Elevated ALP',              'Linked to bile duct obstruction or infiltrative hepatic disease.'],
  alb:  ['Low Albumin',               'Reflects reduced hepatic synthetic function — a marker of chronic liver disease.'],
};

function RiskIcon({ score, size = 16 }) {
  if (score >= 70) return <AlertTriangle size={size} style={{ color: 'var(--danger)' }}/>;
  if (score >= 50) return <Info size={size} style={{ color: 'var(--warn)' }}/>;
  return <CheckCircle size={size} style={{ color: 'var(--ok)' }}/>;
}

function clinicalSummary(score, topMarkers) {
  if (topMarkers.length === 0)
    return 'All assessed biomarkers fall within normal reference ranges. Current data does not indicate elevated liver disease risk. Standard follow-up is advised.';
  if (score >= 70)
    return 'Multiple liver biomarkers are significantly outside normal ranges, indicating a high likelihood of liver disease. Review highlighted values and consider further clinical evaluation.';
  if (score >= 50)
    return 'Several liver biomarkers fall outside normal reference ranges, suggesting possible liver involvement. Further diagnostic evaluation is recommended.';
  return 'Mild deviations from normal ranges have been detected. While not immediately alarming, monitoring over time is advised.';
}

function getNextSteps(score) {
  if (score >= 70) return [
    'Repeat liver function tests within 1–2 weeks',
    'Schedule hepatology or gastroenterology consultation',
    'Consider abdominal ultrasound or CT imaging',
    'Review current medications for hepatotoxic agents',
    'Monitor bilirubin and transaminase levels closely',
  ];
  if (score >= 50) return [
    'Repeat liver function tests within 4–6 weeks',
    'Consider hepatology referral if values persist',
    'Evaluate for alcohol use, medications, and metabolic risk factors',
    'Monitor bilirubin and enzyme trends over time',
  ];
  return [
    'Continue standard follow-up schedule',
    'Repeat liver function panel at next annual visit',
    'Maintain healthy lifestyle — diet, exercise, alcohol moderation',
  ];
}

function genderLabel(g) {
  if (g === 'M' || g === 'Male')   return 'Male';
  if (g === 'F' || g === 'Female') return 'Female';
  return g || '';
}

// Compact labels for the KPI strip
const SHORT_LABEL = {
  alt: 'ALT', ast: 'AST', tb: 'Bilirubin', db: 'Dir. Bili.',
  alkp: 'ALP', tp: 'Protein', alb: 'Albumin',
};

// ── MAIN COMPONENT ─────────────────────────────────────────────
export default function Result({ email, patient, result, onLogout }) {
  const heroRef    = useRef(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMode, setChatMode] = useState('chat'); // 'chat' | 'report'
  const [apptOpen,    setApptOpen]    = useState(false);
  const [bookings,    setBookings]    = useState([]);
  const [changingIdx, setChangingIdx] = useState(null);
  const [prevApptCount, setPrevApptCount] = useState(0);

  useEffect(() => {
    if (patient?.id) {
      setPrevApptCount(parseInt(localStorage.getItem(`apptCount_${patient.id}`) || '0', 10));
    }
  }, [patient?.id]);

  const score = result?.score ?? 0;

  function openReport() { setChatMode('report'); setChatOpen(true); }
  function openChat()   { setChatMode('chat');   setChatOpen(true); }

  if (!patient || !result) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'var(--fb)', color: 'var(--p50)' }}>
      No patient selected.{' '}<a href="/patients" style={{ color: 'var(--a)' }}>Go to patient list</a>
    </div>
  );

  const { level, color, topMarkers } = result;
  const hex       = colorToHex(color);
  const gender    = genderLabel(patient.g);
  const nextSteps = getNextSteps(score);
  const reportRows = chatMode === 'report' ? buildReport(patient, result.markers) : null;

  function handleApptConfirm(bookingData) {
    if (changingIdx !== null) {
      setBookings(prev => prev.map((b, i) => i === changingIdx ? bookingData : b));
      setChangingIdx(null);
    } else {
      if (bookings.length === 0 && patient?.id) {
        const key = `apptCount_${patient.id}`;
        const prev = parseInt(localStorage.getItem(key) || '0', 10);
        setPrevApptCount(prev);
        localStorage.setItem(key, String(prev + 1));
      }
      setBookings(prev => [...prev, bookingData]);
    }
  }

  return (
    <div className={styles.page}>

      {/* Ambient orbs — fixed, behind everything */}
      <div className={styles.dynBg} aria-hidden="true">
        <div className={styles.orb1}/><div className={styles.orb2}/>
        <div className={styles.orb3}/><div className={styles.orb4}/>
      </div>

      <Navbar email={email} onLogout={onLogout} heroRef={heroRef}/>

      {/* ── HERO ────────────────────────────────────────────── */}
      <header ref={heroRef} className={styles.hero}>
        {/* hero-bg.png + gradient overlays via ::before / ::after */}

        <div className={styles.heroInner}>

          {/* LEFT — patient name + meta only */}
          <motion.div className={styles.heroLeft}
            initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .5, ease: [.22,1,.36,1] }}>
            <h1 className={styles.heroName}>{patient.name}</h1>
            <p className={styles.heroMeta}>
              {patient.id} · Age {patient.age}{gender ? ` · ${gender}` : ''}
            </p>
          </motion.div>

          {/* RIGHT — live chip only */}
          <motion.div className={styles.heroRiskRight}
            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: .5, delay: .2, ease: [.22,1,.36,1] }}>
            <div className={styles.liveChip}>
              <span className={styles.liveDot}/>
              Live Analysis
            </div>
          </motion.div>
        </div>
      </header>

      {/* ── CONTENT ─────────────────────────────────────────── */}
      <motion.div className={styles.content}
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .45, delay: .26, ease: [.22,1,.36,1] }}>

        {/* ── Risk Assessment Card ── */}
        <div className={styles.riskCard} style={{ '--risk-c': hex }}>

          {/* ── Zone 1 · Header ── */}
          <div className={styles.riskCardHead}>
            <span className={styles.cardEyebrow}>Risk Assessment</span>
            <span className={styles.riskPill}
              style={{ color: hex, background: `${hex}12`, borderColor: `${hex}2e` }}>
              <span className={styles.riskPillDot} style={{ background: hex }}/>
              {level}
            </span>
          </div>

          {/* ── Zone 2 · Gauge + Summary ── */}
          <div className={styles.riskInner}>
            <GaugeChart score={score} color={color}/>
            <div className={styles.riskSummary}>
              <span className={styles.riskLevel} style={{ color: hex }}>{level}</span>

              {/* KPI strip — markers at a glance */}
              {topMarkers.length > 0 && (
                <div className={styles.riskKpi}>
                  <div className={styles.riskKpiItem}>
                    <span className={styles.riskKpiVal} style={{ color: hex }}>
                      {topMarkers.length}
                    </span>
                    <span className={styles.riskKpiLabel}>
                      value{topMarkers.length !== 1 ? 's' : ''} outside range
                    </span>
                  </div>
                  <span className={styles.riskKpiSep}/>
                  <div className={styles.riskKpiItem}>
                    <span className={styles.riskKpiVal}>
                      {SHORT_LABEL[topMarkers[0]?.key] ?? topMarkers[0]?.label}
                    </span>
                    <span className={styles.riskKpiLabel}>most elevated</span>
                  </div>
                </div>
              )}

              <p className={styles.riskDesc}>{clinicalSummary(score, topMarkers)}</p>
            </div>
          </div>

          {/* ── Zone 3 · Actions ── */}
          <div className={styles.riskActions}>
            {color !== 'var(--ok)' && (
              <AnimatePresence mode="wait" initial={false}>
                {bookings.length === 0 ? (
                  <motion.button key="book"
                    className={styles.btnBook}
                    onClick={() => { setChangingIdx(null); setApptOpen(true); }}
                    whileTap={{ scale: .97 }}
                    exit={{ opacity: 0, scale: .94, transition: { duration: .15 } }}>
                    <CalendarPlus size={15}/> Book Appointment
                  </motion.button>
                ) : (
                  <motion.div key="booked-group"
                    className={styles.bookedGroup}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: .22, ease: [.22,1,.36,1] }}>
                    {bookings.map((b, i) => (
                      <div key={i} className={styles.btnBooked}>
                        <CheckCircle size={14} className={styles.btnBookedCheck}/>
                        <div className={styles.btnBookedAvatar}
                          style={{ background: b.doctor.accentColor }}>
                          {b.doctor.initials}
                        </div>
                        <div className={styles.btnBookedInfo}>
                          <p className={styles.btnBookedName}>{b.doctor.name}</p>
                          <p className={styles.btnBookedMeta}>
                            {b.shortDate} · {b.time} · {b.mode}
                            {i === 0 && prevApptCount === 0
                              ? <span className={styles.btnBookedFirst}> · First visit</span>
                              : i === 0
                              ? <span> · {prevApptCount} previous {prevApptCount === 1 ? 'visit' : 'visits'}</span>
                              : null}
                          </p>
                        </div>
                        <button className={styles.btnBookedChange}
                          onClick={() => { setChangingIdx(i); setApptOpen(true); }}>
                          Change
                        </button>
                      </div>
                    ))}
                    <button className={styles.btnAddAppt}
                      onClick={() => { setChangingIdx(null); setApptOpen(true); }}>
                      <CalendarPlus size={13}/> Add appointment
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
            <motion.button className={styles.btnReport}
              style={bookings.length > 0 ? { marginLeft: 'auto' } : undefined}
              onClick={openReport} whileHover={{ scale: 1.03 }} whileTap={{ scale: .97 }}>
              <Bot size={15}/> Full Report
            </motion.button>
          </div>

          {/* ── Zone 4 · Disclaimer footer ── */}
          <div className={styles.riskFooter}>
            <Info size={12}/>
            This prediction is based on statistical patterns in historical liver test data. Please consider clinical context before taking action.
          </div>
        </div>

        {/* ── Contributing Biomarkers ── */}
        {topMarkers.length > 0 && (
          <motion.div className={styles.card}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .4, delay: .35, ease: [.22,1,.36,1] }}>
            <p className={styles.cardEyebrow}>Highlighted Abnormal Values</p>

            <div className={styles.barGroups}>
              {topMarkers.map(({ key: mKey, ...mProps }, i) => (
                <BarGroup
                  key={mKey} {...mProps}
                  norm={ALL_NORMS[mKey] ?? { hi: mProps.val }}
                  delay={160 + i * 120}
                />
              ))}
            </div>

            <div className={styles.findingsSep}/>

            <ul className={styles.findingsList}>
              {result.markers.slice(0, 4).map(m => {
                const [bold, desc] = FINDINGS[m.key] || [`Elevated ${m.label}`, 'Requires further clinical evaluation.'];
                const mHex = m.danger ? '#e53e3e' : '#dd6b20';
                return (
                  <li key={m.key} className={styles.finding}>
                    <span className={styles.findingAccent} style={{ background: mHex }}/>
                    <div>
                      <div className={styles.findingHead}>
                        <strong className={styles.findingBold}>{bold}</strong>
                        <span className={styles.findingPct} style={{ color: mHex }}>
                          {m.pct}% above normal
                        </span>
                      </div>
                      <p className={styles.findingDesc}>{desc}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}

        {/* ── Recommended Next Steps ── */}
        <motion.div className={styles.card}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .4, delay: .45, ease: [.22,1,.36,1] }}>
          <div className={styles.stepsHead}>
            <p className={styles.cardEyebrow}>Recommended Next Steps</p>
            <span className={styles.stepsCount}>{nextSteps.length} actions</span>
          </div>
          <div className={styles.stepsList}>
            {nextSteps.map((step, i) => (
              <motion.div key={i} className={styles.step}
                initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: .3, delay: .52 + i * .07, ease: [.22,1,.36,1] }}>
                <div className={styles.stepNum}
                  style={{ background: i === 0 ? hex : '#00115D' }}>
                  {i + 1}
                </div>
                <div className={styles.stepBody}>
                  {i === 0 && color !== 'var(--ok)' && (
                    <span className={styles.stepTag}
                      style={{ color: hex, background: `${hex}18` }}>
                      Priority
                    </span>
                  )}
                  <p className={styles.stepText}>{step}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className={styles.stepsNote}>
            <Info size={11}/>
            <span>Based on your {level.toLowerCase()} assessment</span>
          </div>
        </motion.div>

        <Footer email={email}/>
      </motion.div>

      <Chatbot
        open={chatOpen} onClose={() => setChatOpen(false)}
        result={result} onBookAppt={() => setApptOpen(true)}
        reportRows={reportRows}
      />
      <ApptModal open={apptOpen} onClose={() => setApptOpen(false)} onConfirm={handleApptConfirm}/>
    </div>
  );
}
