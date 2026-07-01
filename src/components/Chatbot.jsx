import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Chatbot.module.css';

// ── Q&A engine ────────────────────────────────────────────────
const REPLIES = {
  alt:      'ALT (SGPT) is a liver-specific enzyme. Elevated levels (>40 U/L) indicate hepatocellular damage from hepatitis, fatty liver disease, or toxin exposure.',
  ast:      'AST (SGOT) is present in liver and muscle cells. Elevated AST alongside ALT strongly suggests hepatic involvement — consider hepatitis or toxic liver injury.',
  bilirubin:'Bilirubin is a haemoglobin breakdown product cleared by the liver. Elevated levels indicate impaired clearance or haemolysis and may cause jaundice. Normal range: 0.2–1.2 mg/dL.',
  alkaline: 'Alkaline Phosphatase (ALP) rises with bile duct obstruction, infiltrative liver disease, or bone disorders. Normal: 44–147 IU/L.',
  albumin:  'Albumin is synthesised exclusively by the liver. Low levels (<3.5 g/dL) are a marker of impaired hepatic synthetic function — seen in chronic liver disease or malnutrition.',
  tp:       'Total Protein reflects the sum of albumin and globulins. Normal: 6.0–8.3 g/dL. Deviations may point to liver, kidney, or protein-metabolism disorders.',
  risk:     (r) => r ? `Risk score: ${r.score}% — ${r.level}. ${r.score >= 70 ? 'Urgent clinical review is recommended.' : r.score >= 50 ? 'A follow-up consultation is advised.' : 'Continue routine monitoring.'}` : 'The risk score estimates liver disease likelihood based on lab biomarkers. Scores ≥70% suggest elevated risk requiring clinical attention.',
  book:     'Opening the appointment scheduler for you.',
  default:  'I can explain any biomarker in this report — ALT, AST, bilirubin, ALP, albumin, or total protein. Ask about the risk score, or type "book" to schedule a consultation.',
};

function getReply(msg, result) {
  const m = msg.toLowerCase();
  if (m.match(/\balt\b|\bsgpt\b/))              return REPLIES.alt;
  if (m.match(/\bast\b|\bsgot\b/))              return REPLIES.ast;
  if (m.includes('bilirubin'))                   return REPLIES.bilirubin;
  if (m.match(/alkaline|phosphatase|\balp\b/))   return REPLIES.alkaline;
  if (m.includes('albumin'))                     return REPLIES.albumin;
  if (m.match(/\btp\b|total protein/))           return REPLIES.tp;
  if (m.match(/risk|score|predict/))             return typeof REPLIES.risk === 'function' ? REPLIES.risk(result) : REPLIES.risk;
  if (m.match(/hello|hi\b|hey/))                 return 'Hello! Ask me about any biomarker or value shown in the panel above.';
  if (m.includes('thank'))                       return "You're welcome! I'm here if you have further questions about these results.";
  return REPLIES.default;
}

// ── Biomarker row inside the panel ───────────────────────────
function BiomarkerRow({ label, val, unit, lo, hi, pct, dir, danger }) {
  const [barW, setBarW] = useState(0);
  const isHigh   = dir === 'high';
  const isLow    = dir === 'low';
  const isNormal = dir === 'normal';

  const accentHex  = isNormal ? '#2f855a' : (danger ? '#e53e3e' : '#dd6b20');
  const targetBarW = isNormal ? 0 : Math.min(88, pct * 0.45 + 10);

  useEffect(() => {
    const t = setTimeout(() => setBarW(targetBarW), 120);
    return () => clearTimeout(t);
  }, [targetBarW]);

  return (
    <div className={styles.bioRow}>
      <span className={styles.bioAccent} style={{ background: accentHex }}/>
      <div className={styles.bioMain}>
        <span className={styles.bioLabel}>{label}</span>
        <div className={styles.bioBar}>
          <div className={styles.bioBarTrack}>
            {!isNormal && (
              <div className={styles.bioBarFill} style={{
                width: `${barW}%`,
                background: danger
                  ? 'linear-gradient(90deg,rgba(229,62,62,.5),#e53e3e)'
                  : 'linear-gradient(90deg,rgba(221,107,32,.5),#dd6b20)',
                transition: 'width .85s cubic-bezier(.4,0,.2,1)',
              }}/>
            )}
          </div>
          <span className={styles.bioRange}>{lo}–{hi} {unit}</span>
        </div>
      </div>
      <div className={styles.bioRight}>
        <span className={styles.bioVal}>{val} <span className={styles.bioUnit}>{unit}</span></span>
        {isNormal
          ? <span className={styles.bioNormal}><CheckCircle size={10}/> Normal</span>
          : <span className={styles.bioAbnormal} style={{ color: accentHex }}>
              {isHigh ? <TrendingUp size={10}/> : <TrendingDown size={10}/>}
              {isHigh ? `+${pct}%` : `-${pct}%`}
            </span>
        }
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export default function Chatbot({ open, onClose, result, onBookAppt, reportRows }) {
  const isReport = !!reportRows && reportRows.length > 0;

  const initGreeting = isReport
    ? "I have access to this patient's complete biomarker panel. Ask me to explain any value, compare it to the normal range, or book a follow-up appointment."
    : "Hi! Ask me anything about liver health, these test results, or type 'book' to schedule an appointment.";

  const [msgs,   setMsgs]   = useState([{ role: 'bot', text: initGreeting }]);
  const [input,  setInput]  = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    setMsgs([{ role: 'bot', text: initGreeting }]);
    setInput('');
  }, [isReport]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, typing]);

  function send() {
    const txt = input.trim();
    if (!txt) return;
    setInput('');
    setMsgs(m => [...m, { role: 'user', text: txt }]);
    setTyping(true);
    const isBook = txt.toLowerCase().match(/book|appoint|doctor/);
    setTimeout(() => {
      setTyping(false);
      setMsgs(prev => [...prev, { role: 'bot', text: getReply(txt, result) }]);
      if (isBook) setTimeout(onBookAppt, 400);
    }, 700);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: .22 }}
          onClick={onClose}
        >
        <motion.div
          className={`${styles.panel} ${isReport ? styles.panelWide : ''}`}
          initial={{ opacity: 0, scale: .95, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: .95, y: 18 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div className={styles.head}>
            <div className={styles.headLeft}>
              <div className={styles.headIconRow}>
                <div className={styles.headIconWrap}>
                  <Bot size={14}/>
                </div>
                <div>
                  <p className={styles.title}>Access Full Report</p>
                  <p className={styles.subtitle}>
                    {isReport
                      ? 'AI-assisted · Biomarker panel'
                      : 'AI-assisted · Liver health Q&A'}
                  </p>
                </div>
              </div>
            </div>
            <button className={styles.close} onClick={onClose}><X size={17}/></button>
          </div>

          {/* ── Biomarker data panel (report mode only) ── */}
          {isReport && (
            <div className={styles.dataPanel}>
              <div className={styles.dataPanelHead}>
                <span className={styles.dataPanelLabel}>Biomarker Panel</span>
                <span className={styles.dataPanelSub}>{reportRows.length} values</span>
              </div>
              <div className={styles.dataRowsWrap}>
                <div className={styles.dataRows}>
                  {reportRows.map(row => <BiomarkerRow key={row.key} {...row}/>)}
                </div>
              </div>
            </div>
          )}

          {/* ── Chat thread ── */}
          <div className={styles.msgs}>
            {msgs.map((m, i) => (
              <motion.div
                key={i}
                className={`${styles.msg} ${styles[m.role]}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: .2 }}
              >
                {m.text}
              </motion.div>
            ))}
            {typing && (
              <div className={`${styles.msg} ${styles.bot} ${styles.typing}`}>
                <span/><span/><span/>
              </div>
            )}
            <div ref={endRef}/>
          </div>

          {/* ── Input ── */}
          <div className={styles.foot}>
            <input
              className={styles.input}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder={isReport ? 'Ask about any biomarker…' : 'Ask about your results…'}
              autoFocus={open}
            />
            <button className={styles.send} onClick={send}><Send size={15}/></button>
          </div>
        </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
