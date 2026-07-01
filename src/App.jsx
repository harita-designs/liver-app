import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { PATIENTS } from './data/patients';

import Login from './pages/Login';
import Home from './pages/Home';
import Patients from './pages/Patients';
import AddPatient from './pages/AddPatient';
import Result from './pages/Result';

export default function App() {
  const [email, setEmail] = useState('');
  const [patients, setPatients] = useState(PATIENTS);
  const [selected, setSelected] = useState({ patient: null, result: null });

  function handleLogin(e) { setEmail(e); }
  function handleLogout() { setEmail(''); }
  function handleAddPatient(p) { setPatients(prev => [p, ...prev]); }
  function handleSelect(patient, result) { setSelected({ patient, result }); }

  const authed = !!email;

  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Navigate to={authed ? '/home' : '/login'} replace/>}/>
          <Route path="/login" element={
            authed ? <Navigate to="/home" replace/> :
            <Login onLogin={handleLogin}/>
          }/>
          <Route path="/home" element={
            !authed ? <Navigate to="/login" replace/> :
            <Home email={email} onLogout={handleLogout}/>
          }/>
          <Route path="/patients" element={
            !authed ? <Navigate to="/login" replace/> :
            <Patients email={email} patients={patients} onLogout={handleLogout} onSelectPatient={handleSelect}/>
          }/>
          <Route path="/add" element={
            !authed ? <Navigate to="/login" replace/> :
            <AddPatient email={email} onLogout={handleLogout} onAddPatient={handleAddPatient} onSelectPatient={handleSelect}/>
          }/>
          <Route path="/result" element={
            !authed ? <Navigate to="/login" replace/> :
            <Result email={email} patient={selected.patient} result={selected.result} onLogout={handleLogout}/>
          }/>
          <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}
