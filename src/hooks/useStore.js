import { useState, useCallback } from 'react';
import { PATIENTS } from '../data/patients';

let _patients = [...PATIENTS];
let _email = '';
let _listeners = [];

function notify() { _listeners.forEach(fn => fn()); }

export function useStore() {
  const [, rerender] = useState(0);
  const sub = useCallback(() => {
    _listeners.push(() => rerender(n => n + 1));
    return () => { _listeners = _listeners.filter(fn => fn !== (() => rerender(n => n + 1))); };
  }, []);

  return {
    email: _email,
    patients: _patients,
    setEmail(e) { _email = e; notify(); },
    addPatient(p) { _patients = [p, ..._patients]; notify(); },
  };
}
