import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, MessageCircle, Activity, Users, Shield, BarChart2, Calendar } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import styles from './Home.module.css';

function StepPanel1() {
  return (
    <div className={styles.panelUI}>
      {[['ALT','68',68,'rgba(0,212,232,.8)'],['AST','87',87,'rgba(255,90,70,.8)'],['GGT','91',91,'rgba(255,90,70,.8)']].map(([k,v,w,c]) => (
        <div key={k} className={styles.panelRow}>
          <span className={styles.panelKey}>{k}</span>
          <div className={styles.panelBar}><div className={styles.panelFill} style={{width:`${w}%`,background:c}}/></div>
          <span className={styles.panelVal}>{v}</span>
        </div>
      ))}
    </div>
  );
}

function StepPanel2() {
  return (
    <div className={`${styles.panelUI} ${styles.panelUICenter}`}>
      <svg viewBox="0 0 90 90" width="70" height="70">
        <circle cx="45" cy="45" r="32" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="6"/>
        <circle cx="45" cy="45" r="32" fill="none" stroke="rgba(0,212,232,.8)" strokeWidth="6"
          strokeDasharray="134 200" strokeLinecap="round" transform="rotate(-90 45 45)"/>
        <text x="45" y="50" textAnchor="middle" fill="white" fontSize="16" fontWeight="800">72</text>
      </svg>
      <span className={styles.panelRiskLabel}>Moderate Risk</span>
    </div>
  );
}

function StepPanel3() {
  return (
    <div className={styles.panelUI}>
      <div className={styles.panelMsg}>AST/ALT ratio suggests hepatic stress.</div>
      <div className={styles.panelMsgUser}>Book a follow-up?</div>
      <div className={styles.panelTyping}><span/><span/><span/></div>
    </div>
  );
}

const STEP_PANELS = [<StepPanel1/>, <StepPanel2/>, <StepPanel3/>];

const STATS = [
  { value: '94.2%', label: 'Accuracy' },
  { value: '11', label: 'Biomarkers' },
  { value: '<2s', label: 'Prediction' },
];

const FEATURES = [
  {
    tag: 'Risk Analysis',
    title: 'Instant Risk Scoring',
    desc: 'Analyze 11 biomarkers and receive a confidence-weighted liver risk score in under two seconds.',
  },
  {
    tag: 'AI Assistant',
    title: 'AI-Powered Chatbot',
    desc: 'Ask questions in plain language and get clinical answers, result explanations, and appointment booking in real time.',
  },
  {
    tag: 'Clinical Tools',
    title: 'Built for Clinicians',
    desc: 'Designed for the pace of semi-urban clinics. Fast input, unambiguous output, zero learning curve.',
  },
];

const STEPS = [
  { n: '01', icon: <Users size={20}/>,        title: 'Enter Patient Data',  desc: 'Input lab values manually or fetch from patient records. Clean, fast, and editable.' },
  { n: '02', icon: <Activity size={20}/>,     title: 'Get Risk Score',      desc: 'AI analyzes biomarkers and returns a confidence score with highlighted abnormal indicators.' },
  { n: '03', icon: <MessageCircle size={20}/>, title: 'Act with Chatbot',   desc: 'The built-in assistant explains results, books appointments, or drafts referrals in real time.' },
];


const fadeUp  = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: .1 } } };

export default function Home({ email, onLogout }) {
  const nav = useNavigate();

  return (
    <div className={styles.page}>
      <Navbar email={email} onLogout={onLogout}/>

      {/* ambient orbs */}
      <div className={styles.dynBg} aria-hidden="true">
        <div className={styles.orb1}/><div className={styles.orb2}/>
        <div className={styles.orb3}/><div className={styles.orb4}/>
      </div>

      {/* ─────────────── HERO ─────────────── */}
      <section className={styles.heroBg}>
        <div className={styles.hero}>
          <motion.div className={styles.heroLeft} variants={stagger} initial="hidden" animate="show">
            <motion.h1 className={styles.heroTitle} variants={fadeUp} transition={{ duration: .5, ease: [.22,1,.36,1] }}>
              Liver Insights,<br/><em className={styles.ac}>Simplified.</em>
            </motion.h1>

            <motion.p className={styles.heroSub} variants={fadeUp} transition={{ duration: .5, ease: [.22,1,.36,1] }}>
              Understand liver test results in seconds with accurate risk
              prediction and clear clinical interpretation.
            </motion.p>

            <motion.div className={styles.heroCtas} variants={fadeUp} transition={{ duration: .5, ease: [.22,1,.36,1] }}>
              <motion.div className={styles.btnSpotlight}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: .97 }}>
                <button className={styles.btnAI} onClick={() => nav('/patients')}>
                  Start Predicting <ArrowUpRight size={16}/>
                </button>
              </motion.div>
              <button className={styles.btnGhost}
                onClick={() => document.getElementById('how').scrollIntoView({ behavior: 'smooth' })}>
                How it works
              </button>
            </motion.div>

            <motion.div className={styles.heroStats} variants={fadeUp} transition={{ duration: .5, ease: [.22,1,.36,1] }}>
              {STATS.map((s, i) => (
                <div key={s.label} className={`${styles.heroStat} ${i < STATS.length - 1 ? styles.heroStatDivide : ''}`}>
                  <span className={styles.heroStatVal}>{s.value}</span>
                  <span className={styles.heroStatLbl}>{s.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div className={styles.heroRight}
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: .3, duration: .6, ease: [.22,1,.36,1] }}>
            <div className={styles.glassStack}>

              {/* Back: Book Appointment */}
              <div className={styles.glassCardL}>
                <div className={styles.cardHeader}>
                  <Calendar size={13}/>
                  <span className={styles.cardLabel}>Next Appointment</span>
                </div>
                <div className={styles.apptBlock}>
                  <div className={styles.apptCalDate}>
                    <span className={styles.apptMonth}>Jun</span>
                    <span className={styles.apptDay}>26</span>
                  </div>
                  <div className={styles.apptMeta}>
                    <span className={styles.apptDr}>Dr. S. Ramesh</span>
                    <span className={styles.apptSpec}>Hepatology</span>
                    <span className={styles.apptTime}>10:00 – 10:30 AM</span>
                  </div>
                </div>
                <button className={styles.apptBtn}>Book Appointment</button>
              </div>

              {/* Front: Prediction */}
              <div className={styles.glassCardC}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardDot}/>
                  <span className={styles.cardLabel}>Risk Assessment</span>
                  <span className={styles.cardLive}>live</span>
                </div>
                <div className={styles.scoreRingWrap}>
                  <svg viewBox="0 0 100 100" width="108" height="108">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="7"/>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="url(#rg)" strokeWidth="7"
                      strokeLinecap="round" strokeDasharray="181 251"
                      transform="rotate(-90 50 50)"/>
                    <defs>
                      <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00d4e8"/>
                        <stop offset="100%" stopColor="#4f8ef7"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className={styles.scoreInner}>
                    <span className={styles.scoreNum}>72</span>
                    <span className={styles.scoreSub}>/ 100</span>
                  </div>
                </div>
                <div className={styles.riskRow}>
                  <span className={styles.riskDot}/>
                  <span className={styles.riskText}>Moderate Risk</span>
                </div>
                <div className={styles.cardDivider}/>
                <div className={styles.miniRows}>
                  {[['ALT','68%','68',false],['AST','87%','87',true],['GGT','91%','91',true]].map(([n,w,pct,high]) => (
                    <div key={n} className={styles.miniRow}>
                      <span className={styles.miniLabel}>{n}</span>
                      <div className={styles.miniTrack}>
                        <div className={high ? styles.miniFillHigh : styles.miniFill} style={{width:w}}/>
                      </div>
                      <span className={high ? styles.miniPctHigh : styles.miniPct}>{pct}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Middle: Chatbot */}
              <div className={styles.glassCardR}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardDotGreen}/>
                  <span className={styles.cardLabel}>AI Assistant</span>
                </div>
                <div className={styles.chatThread}>
                  <div className={styles.chatBotMsg}>
                    Your AST/ALT ratio suggests hepatic stress. A follow-up is recommended.
                  </div>
                  <div className={styles.chatUserMsg}>What should I do?</div>
                  <div className={styles.chatTyping}>
                    <span/><span/><span/>
                  </div>
                </div>
                <div className={styles.chatInputRow}>
                  <span className={styles.chatInputText}>Ask anything…</span>
                  <button className={styles.chatSendBtn}>↑</button>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </section>

      {/* ─────────────── FEATURES ─────────────── */}
      <section className={styles.features}>
        <div className={styles.sectionHead}>
          <motion.p className={styles.eyebrow}
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: .4, ease: [.22,1,.36,1] }}>
            What we offer
          </motion.p>
          <div className={styles.titleClip}>
            <motion.h2 className={styles.sectionTitle}
              initial={{ y: '105%' }} whileInView={{ y: '0%' }}
              viewport={{ once: true }} transition={{ duration: .55, ease: [.22,1,.36,1], delay: .08 }}>
              Everything clinicians need.
            </motion.h2>
          </div>
        </div>

        <div className={styles.featureGrid}>
          {FEATURES.map((f, i) => {
            const card = (
              <motion.div key={f.title}
                className={`${styles.featureCard} ${i === 1 ? styles.featureCardHero : ''}`}
                initial={{ opacity: 0, y: 48, scale: .97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * .12, duration: .55, ease: [.22,1,.36,1] }}>
                <span className={styles.cardTag}>{f.tag}</span>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </motion.div>
            );
            return i === 1
              ? <div key={f.title} className={styles.heroWrap}>{card}</div>
              : card;
          })}
        </div>
      </section>

      {/* ─────────────── HOW IT WORKS ─────────────── */}
      <section className={styles.howSection} id="how">
        <div className={styles.howLayout}>
          <motion.div className={styles.howHeading}
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: .4, ease: [.22,1,.36,1] }}>
            <p className={styles.eyebrow}>The process</p>
            <h2 className={styles.sectionTitle}>Three steps to clarity</h2>
          </motion.div>

          <motion.div className={styles.steps}
            initial="hidden" whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={{ show: {} }}>
            {STEPS.map((s, i) => (
              <motion.div key={s.n} className={styles.step}
                variants={{
                  hidden: { opacity: 0, y: 36 },
                  show:   { opacity: 1, y: 0, transition: { duration: .6, ease: [.22,1,.36,1], delay: i * 1 } }
                }}>
                <div className={styles.stepContent}>
                  <span className={styles.stepNum}>{s.n}</span>
                  <p className={styles.stepTitle}>{s.title}</p>
                  <span className={styles.stepDash}>—</span>
                  <p className={styles.stepDesc}>{s.desc}</p>
                </div>
                <div className={styles.stepPanel}>{STEP_PANELS[i]}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─────────────── CTA BANNER ─────────────── */}
      <motion.section className={styles.ctaBanner}
        initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: .5 }}>
        <div className={styles.ctaBg}/>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>Ready to make faster<br/>clinical decisions?</h2>
          <p className={styles.ctaSub}>Join clinicians using Livr to predict liver disease risk with confidence.</p>
          <motion.div className={styles.btnSpotlight}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: .97 }}>
            <button className={styles.btnAI} onClick={() => nav('/patients')}>
              Get Started <ArrowUpRight size={16}/>
            </button>
          </motion.div>
        </div>
      </motion.section>

      <Footer email={email}/>
    </div>
  );
}
