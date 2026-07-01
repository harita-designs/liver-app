import { useState, useMemo } from 'react';
import { X, Check, CheckCircle, Calendar, Clock, MapPin, Video, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ApptModal.module.css';

const DOCTORS = [
  { id:1,  initials:'JM', accentColor:'#002FFF', category:'General',
    name:'Dr. James Mitchell',   tag:'Liver Diagnostics',
    short:'General Physician · Liver Diagnostics',
    clinic:'Houston Liver & Wellness Center', location:'Houston, TX',
    rating:4.7, avail:'today',    nextSlot:'2:00 PM' },
  { id:2,  initials:'SW', accentColor:'#12B9DE', category:'Hepatology',
    name:'Dr. Sarah Whitfield',  tag:'Hepatologist',
    short:'Hepatologist · Gastroenterology',
    clinic:'Mayo Clinic',                    location:'Rochester, MN',
    rating:4.9, avail:'today',    nextSlot:'10:30 AM' },
  { id:3,  initials:'RC', accentColor:'#172A3A', category:'General',
    name:'Dr. Robert Collins',   tag:'Liver Specialist',
    short:'Internal Medicine · Liver Specialist',
    clinic:'Cleveland Clinic',               location:'Cleveland, OH',
    rating:4.6, avail:'week',     nextSlot:null },
  { id:4,  initials:'EP', accentColor:'#00115D', category:'Gastroenterology',
    name:'Dr. Emily Parker',     tag:'Gastroenterology',
    short:'Gastroenterology · Hepatology',
    clinic:'Johns Hopkins Hospital',         location:'Baltimore, MD',
    rating:4.8, avail:'tomorrow', nextSlot:'3:30 PM' },
  { id:5,  initials:'DH', accentColor:'#002FFF', category:'Hepatology',
    name:'Dr. David Harrison',   tag:'Hepatologist',
    short:'Clinical Hepatology · Liver Transplant',
    clinic:'UCSF Medical Center',            location:'San Francisco, CA',
    rating:4.9, avail:'tomorrow', nextSlot:'9:00 AM' },
  { id:6,  initials:'LT', accentColor:'#12B9DE', category:'Gastroenterology',
    name:'Dr. Laura Thompson',   tag:'Gastroenterologist',
    short:'Gastroenterology · Digestive Diseases',
    clinic:'Northwestern Memorial Hospital', location:'Chicago, IL',
    rating:4.7, avail:'today',    nextSlot:'5:00 PM' },
  { id:7,  initials:'MR', accentColor:'#172A3A', category:'Hepatology',
    name:'Dr. Michael Reynolds', tag:'Liver Disease',
    short:'Hepatology · Liver Disease',
    clinic:'Stanford Health Care',           location:'Stanford, CA',
    rating:4.8, avail:'week',     nextSlot:null },
  { id:8,  initials:'AK', accentColor:'#00115D', category:'General',
    name:'Dr. Amanda Klein',     tag:'Internal Medicine',
    short:'Internal Medicine · Metabolic Liver',
    clinic:'Mass General Hospital',          location:'Boston, MA',
    rating:4.6, avail:'tomorrow', nextSlot:'12:00 PM' },
];

const CATEGORIES = ['All', 'Hepatology', 'Gastroenterology', 'General'];

const MORNING   = ['9:00 AM', '10:30 AM', '12:00 PM'];
const AFTERNOON = ['2:00 PM', '3:30 PM',  '5:00 PM'];

const STEP_NUM = { doctor: 1, datetime: 2, confirm: 3 };

function genRef() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const r = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `APPT-${r}-MGR`;
}

const slide = {
  enter:  { opacity: 0, x: 24 },
  center: { opacity: 1, x: 0  },
  exit:   { opacity: 0, x: -24 },
};

export default function ApptModal({ open, onClose, onConfirm }) {
  const today = new Date().toISOString().split('T')[0];
  const [step,    setStep]    = useState('doctor');
  const [docIdx,  setDocIdx]  = useState(0);
  const [search,  setSearch]  = useState('');
  const [catFilter, setCat]   = useState('All');
  const [date,    setDate]    = useState(today);
  const [time,    setTime]    = useState('');
  const [mode,    setMode]    = useState('In-person');
  const [refNo,   setRefNo]   = useState('');
  const [err,     setErr]     = useState('');

  const doctor = DOCTORS[docIdx];

  const filtered = useMemo(() => DOCTORS.filter(d => {
    const q = search.toLowerCase();
    const matchQ = !q || d.name.toLowerCase().includes(q)
                      || d.short.toLowerCase().includes(q)
                      || d.clinic.toLowerCase().includes(q)
                      || d.location.toLowerCase().includes(q);
    const matchC = catFilter === 'All' || d.category === catFilter;
    return matchQ && matchC;
  }), [search, catFilter]);

  const fmtDate = date
    ? new Date(date).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
    : '';

  const stepNum = STEP_NUM[step] ?? 0;

  function goSchedule()  { setErr(''); setStep('datetime'); }
  function goReview() {
    if (!date || !time) { setErr('Please pick a date and time slot.'); return; }
    setErr(''); setStep('confirm');
  }
  function confirmBooking() {
    const ref = genRef();
    setRefNo(ref);
    setStep('booked');
    const shortDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
    });
    onConfirm({ doctor, date, fmtDate, shortDate, time, mode, refNo: ref });
  }
  function handleClose() {
    onClose();
    setTimeout(() => {
      setStep('doctor'); setDocIdx(0); setSearch(''); setCat('All');
      setDate(today); setTime(''); setMode('In-person'); setErr('');
    }, 320);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className={styles.overlay}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={e => e.target === e.currentTarget && handleClose()}
        >
          <motion.div className={styles.box}
            initial={{ scale: .95, opacity: 0, y: 16 }}
            animate={{ scale: 1,   opacity: 1, y: 0  }}
            exit={{ scale: .95, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 290 }}
          >
            {/* ── Header ── */}
            <div className={styles.head}>
              <div className={styles.headLeft}>
                <div className={styles.headIconWrap}>
                  <Calendar size={15}/>
                </div>
                <div>
                  <h2 className={styles.title}>
                    {step === 'booked' ? 'Appointment confirmed!' : 'Book appointment'}
                  </h2>
                </div>
              </div>
              <button className={styles.close} onClick={handleClose}><X size={17}/></button>
            </div>

            {/* ── Step indicator ── */}
            {step !== 'booked' && (
              <div className={styles.stepper}>
                <div className={styles.stepperTrack}>
                  {[1, 2, 3].map((num, idx) => {
                    const isActive = stepNum === num;
                    const isDone   = stepNum > num;
                    return (
                      <span key={num} style={{ display: 'contents' }}>
                        <div className={`${styles.stepDot} ${isDone ? styles.stepDotDone : isActive ? styles.stepDotActive : ''}`}>
                          {isDone ? <Check size={8}/> : num}
                        </div>
                        {idx < 2 && <div className={`${styles.stepConnector} ${isDone ? styles.stepConnectorDone : ''}`}/>}
                      </span>
                    );
                  })}
                </div>
                <div className={styles.stepperLabels}>
                  {['Doctor', 'Schedule', 'Review'].map((label, idx) => (
                    <span key={label}
                      className={`${styles.stepperLabel} ${stepNum === idx+1 ? styles.stepperLabelActive : stepNum > idx+1 ? styles.stepperLabelDone : ''}`}>
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">

              {/* ── Step 1: Doctor search + list ── */}
              {step === 'doctor' && (
                <motion.div key="doctor"
                  variants={slide} initial="enter" animate="center" exit="exit"
                  transition={{ duration: .2 }}
                  className={styles.stepWrap}
                >
                  {/* Search */}
                  <div className={styles.searchBox}>
                    <Search size={15} className={styles.searchIcon}/>
                    <input
                      className={styles.searchInput}
                      placeholder="Search by name, specialty or clinic…"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      autoComplete="off"
                    />
                    {search && (
                      <button className={styles.searchClear} onClick={() => setSearch('')}>
                        <X size={13}/>
                      </button>
                    )}
                  </div>

                  {/* Category filter chips */}
                  <div className={styles.chips}>
                    {CATEGORIES.map(c => (
                      <button key={c}
                        className={`${styles.chip} ${catFilter === c ? styles.chipActive : ''}`}
                        onClick={() => setCat(c)}
                      >{c}</button>
                    ))}
                  </div>

                  {/* Scrollable doctor list */}
                  <div className={styles.doctorList}>
                    {filtered.length === 0 ? (
                      <div className={styles.emptyState}>
                        <p className={styles.emptyTitle}>No doctors found</p>
                        <p className={styles.emptySub}>Try a different name or specialty</p>
                      </div>
                    ) : filtered.map((doc) => {
                      const active = docIdx === DOCTORS.indexOf(doc);
                      return (
                        <motion.button key={doc.id}
                          className={`${styles.doctorRow} ${active ? styles.doctorRowActive : ''}`}
                          onClick={() => setDocIdx(DOCTORS.indexOf(doc))}
                          whileTap={{ scale: .99 }}
                          transition={{ duration: .12 }}
                        >
                          {/* ── Main info row ── */}
                          <div className={styles.doctorRowMain}>
                            <div className={styles.docAvatar} style={{ background: doc.accentColor }}>
                              {doc.initials}
                            </div>
                            <div className={styles.docInfo}>
                              <p className={styles.docName}>{doc.name}</p>
                              <div className={styles.docTagRow}>
                                <p className={styles.docTag}>{doc.short}</p>
                                <span className={styles.docRating}>★ {doc.rating}</span>
                              </div>
                              <p className={styles.docClinic}>
                                <MapPin size={9}/> {doc.clinic} · {doc.location}
                              </p>
                              <p className={`${styles.docAvail} ${doc.avail === 'today' ? styles.availToday : doc.avail === 'tomorrow' ? styles.availTomorrow : styles.availWeek}`}>
                                <span className={styles.docAvailDot}/>
                                {doc.avail === 'today'
                                  ? `Available Today${doc.nextSlot ? ` · ${doc.nextSlot}` : ''}`
                                  : doc.avail === 'tomorrow'
                                  ? `Tomorrow · ${doc.nextSlot}`
                                  : 'Next Week'}
                              </p>
                            </div>
                            <div className={`${styles.docRadio} ${active ? styles.docRadioActive : ''}`}>
                              <AnimatePresence>
                                {active && (
                                  <motion.span
                                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                    transition={{ type: 'spring', damping: 14, stiffness: 400 }}
                                  >
                                    <Check size={11} color="#fff"/>
                                  </motion.span>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>

                          {/* ── Earliest slot strip — expands when selected ── */}
                          <AnimatePresence>
                            {active && doc.nextSlot && (
                              <motion.div
                                className={styles.earliestSlot}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: .22, ease: [.22,1,.36,1] }}
                              >
                                <span className={styles.earliestLabel}>Earliest appointment</span>
                                <span className={styles.earliestTime}>
                                  {doc.avail === 'today' ? 'Today' : 'Tomorrow'} · {doc.nextSlot}
                                </span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      );
                    })}
                  </div>

                  <div className={styles.foot}>
                    <button className={styles.btnCancel} onClick={handleClose}>Cancel</button>
                    <button className={styles.btnPrimary} onClick={goSchedule}>Continue →</button>
                  </div>
                </motion.div>
              )}

              {/* ── Step 2: Schedule ── */}
              {step === 'datetime' && (
                <motion.div key="datetime"
                  variants={slide} initial="enter" animate="center" exit="exit"
                  transition={{ duration: .2 }}
                  className={styles.stepWrap}
                >
                  <div className={styles.contextRow}>
                    <div className={styles.ctxAvatar} style={{ background: doctor.accentColor }}>
                      {doctor.initials}
                    </div>
                    <div>
                      <p className={styles.ctxName}>{doctor.name}</p>
                      <p className={styles.ctxSpec}>{doctor.tag}</p>
                    </div>
                    <button className={styles.ctxChange} onClick={() => setStep('doctor')}>Change</button>
                  </div>

                  <label className={styles.fieldLabel}>
                    Preferred date
                    <input type="date" className={styles.inp} value={date} min={today}
                      onChange={e => { setDate(e.target.value); setTime(''); }}/>
                  </label>

                  <div className={styles.slotsWrap}>
                    <p className={styles.slotPeriod}>Morning</p>
                    <div className={styles.slots}>
                      {MORNING.map(t => (
                        <button key={t}
                          className={`${styles.slot} ${time === t ? styles.slotActive : ''}`}
                          onClick={() => setTime(t)}
                        ><Clock size={11}/> {t}</button>
                      ))}
                    </div>
                    <p className={styles.slotPeriod} style={{ marginTop: '.5rem' }}>Afternoon</p>
                    <div className={styles.slots}>
                      {AFTERNOON.map(t => (
                        <button key={t}
                          className={`${styles.slot} ${time === t ? styles.slotActive : ''}`}
                          onClick={() => setTime(t)}
                        ><Clock size={11}/> {t}</button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.modeRow}>
                    <button
                      className={`${styles.modeBtn} ${mode === 'In-person' ? styles.modeBtnActive : ''}`}
                      onClick={() => setMode('In-person')}
                    ><MapPin size={14}/> In-person</button>
                    <button
                      className={`${styles.modeBtn} ${mode === 'Virtual' ? styles.modeBtnActive : ''}`}
                      onClick={() => setMode('Virtual')}
                    ><Video size={14}/> Virtual</button>
                  </div>

                  {err && <p className={styles.err}>{err}</p>}

                  <div className={styles.foot}>
                    <button className={styles.btnCancel} onClick={() => setStep('doctor')}>← Back</button>
                    <button className={styles.btnPrimary} onClick={goReview}>Review →</button>
                  </div>
                </motion.div>
              )}

              {/* ── Step 3: Review ── */}
              {step === 'confirm' && (
                <motion.div key="confirm"
                  variants={slide} initial="enter" animate="center" exit="exit"
                  transition={{ duration: .2 }}
                  className={styles.stepWrap}
                >
                  <p className={styles.stepLabel}>Review your booking</p>

                  <div className={styles.confirmCard}>
                    <div className={styles.confirmDocRow}>
                      <div className={styles.ctxAvatar} style={{ background: doctor.accentColor }}>
                        {doctor.initials}
                      </div>
                      <div>
                        <p className={styles.confirmDocName}>{doctor.name}</p>
                        <p className={styles.confirmDocSpec}>{doctor.tag}</p>
                      </div>
                    </div>
                    <div className={styles.confirmSep}/>
                    <div className={styles.confirmMeta}>
                      <div className={styles.confirmRow}><Calendar size={13}/><span><strong>Date</strong> — {fmtDate}</span></div>
                      <div className={styles.confirmRow}><Clock size={13}/><span><strong>Time</strong> — {time}</span></div>
                      <div className={styles.confirmRow}>
                        {mode === 'Virtual' ? <Video size={13}/> : <MapPin size={13}/>}
                        <span><strong>Mode</strong> — {mode}</span>
                      </div>
                    </div>
                    <div className={styles.confirmSep}/>
                    <p className={styles.confirmClinic}>{doctor.clinic}</p>
                    <p className={styles.confirmLocation}><MapPin size={10}/> {doctor.location}</p>
                  </div>

                  <div className={styles.foot}>
                    <button className={styles.btnCancel} onClick={() => setStep('datetime')}>← Edit</button>
                    <button className={styles.btnPrimary} onClick={confirmBooking}>Confirm booking</button>
                  </div>
                </motion.div>
              )}

              {/* ── Step 4: Booked ── */}
              {step === 'booked' && (
                <motion.div key="booked"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ duration: .24 }}
                  className={styles.bookedWrap}
                >
                  <motion.div className={styles.bookedIconRing}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 12, stiffness: 280, delay: .08 }}
                  >
                    <CheckCircle size={44} className={styles.bookedCheckIcon}/>
                  </motion.div>

                  <motion.div className={styles.bookedHeadline}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: .28 }}
                  >
                    <p className={styles.bookedTitle}>All set!</p>
                    <p className={styles.bookedSub}>Your appointment is confirmed.</p>
                  </motion.div>

                  <motion.div className={styles.refBadge}
                    initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: .38 }}
                  >
                    {refNo}
                  </motion.div>

                  <motion.div className={styles.bookedDetails}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: .46 }}
                  >
                    <div className={styles.bookedDocRow}>
                      <div className={styles.ctxAvatar} style={{ background: doctor.accentColor }}>
                        {doctor.initials}
                      </div>
                      <div>
                        <p className={styles.bookedDocName}>{doctor.name}</p>
                        <p className={styles.bookedDocSpec}>{doctor.tag}</p>
                      </div>
                    </div>
                    <div className={styles.bookedMetaRow}><Calendar size={13}/> {fmtDate}</div>
                    <div className={styles.bookedMetaRow}><Clock size={13}/> {time} · {mode}</div>
                    <div className={styles.bookedMetaRow}><MapPin size={13}/> {doctor.clinic}</div>
                  </motion.div>

                  <motion.button className={styles.btnPrimary} style={{ width: '100%' }}
                    onClick={handleClose}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: .54 }}
                  >
                    Done
                  </motion.button>
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
