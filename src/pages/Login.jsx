import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import styles from './Login.module.css';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  function validate() {
    const e = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!pass) e.pass = 'Password is required';
    else if (pass.length < 4) e.pass = 'Password too short';
    return e;
  }

  async function submit(ev) {
    ev.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    onLogin(email || 'demo@clinic.com');
    nav('/home');
  }

  return (
    <div className={styles.page}>
      <motion.div className={styles.card}
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .45, ease: [.22,1,.36,1] }}
      >
        <div className={styles.badge}>Clinician Portal</div>
        <h1 className={styles.title}>
          Liver<br/><span className={styles.ac}>Disease</span><br/>Prediction
        </h1>
        <p className={styles.sub}>Fast, clear, clinician-first diagnosis support.</p>

        <form onSubmit={submit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email address</label>
            <input
              id="email" type="email" className={`${styles.inp} ${errors.email ? styles.inpErr : ''}`}
              placeholder="doctor@clinic.com" value={email}
              onChange={e => { setEmail(e.target.value); setErrors(p => ({...p, email: ''})); }}
            />
            {errors.email && <span className={styles.err}>{errors.email}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="pass">Password</label>
            <div className={styles.passWrap}>
              <input
                id="pass" type={showPass ? 'text' : 'password'}
                className={`${styles.inp} ${errors.pass ? styles.inpErr : ''}`}
                placeholder="••••••••" value={pass}
                onChange={e => { setPass(e.target.value); setErrors(p => ({...p, pass: ''})); }}
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(s => !s)} tabIndex={-1}>
                {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>
            {errors.pass && <span className={styles.err}>{errors.pass}</span>}
          </div>

          <div className={styles.btnSpotlight}>
            <motion.button
              type="submit" className={styles.btn} disabled={loading}
              whileHover={{ scale: 1.015 }} whileTap={{ scale: .985 }}
            >
              {loading
                ? <span className={styles.spinner}/>
                : <><span>Log in</span><ArrowRight size={18}/></>
              }
            </motion.button>
          </div>
        </form>

        <p className={styles.hint}>Demo: any email + any password</p>
      </motion.div>

      <div className={styles.bg}>
        <div className={styles.blob1}/>
        <div className={styles.blob2}/>
      </div>
    </div>
  );
}
