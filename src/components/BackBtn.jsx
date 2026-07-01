import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import styles from './BackBtn.module.css';

export default function BackBtn({ to }) {
  const nav = useNavigate();
  return (
    <button className={styles.btn} onClick={() => nav(to)}>
      <ArrowLeft size={20} strokeWidth={2.5} />
    </button>
  );
}
