import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login               from './components/Login';
import MapaCafeterias      from './components/MapaCafeterias';
import DashboardCliente    from './components/DashboardCliente';
import DashboardBarista    from './components/DashboardBarista';
import DashboardAdmin      from './components/DashboardAdmin';
import DashboardCaficultor from './components/DashboardCaficultor';
import DashboardCatador    from './components/DashboardCatador';
import DashboardDueno      from './components/DashboardDueno';
import CafeteriaPublica    from './components/CafeteriaPublica';
import CafePublico         from './components/CafePublico';
import TazaJV              from './features/taza/TazaJV';
import QrEntrada           from './features/qr/QrEntrada';
import QrMapsRedirect      from './features/qr/QrMapsRedirect';

function AppInterna() {
  const [usuario,  setUsuario]  = useState(() => {
  
    try { return JSON.parse(localStorage.getItem('ce_session') || 'null'); } catch { return null; }
  });
  const [verLogin, setVerLogin] = useState(false);

  function handleLogin(u) {
    localStorage.setItem('ce_session', JSON.stringify(u));
    setUsuario(u);
    setVerLogin(false);
  }

  function handleLogout() {
    localStorage.removeItem('ce_session');
    setUsuario(null);
  }

  if (!usuario) {
    if (verLogin) return <Login onLogin={handleLogin} onVolver={() => setVerLogin(false)} />;
    return <MapaCafeterias onLogin={() => setVerLogin(true)} />;
  }

  if (usuario.rol === 'cliente')                                   return <DashboardCliente    usuario={usuario} onLogout={handleLogout} />;
  if (usuario.rol === 'barista')                                   return <DashboardBarista    usuario={usuario} onLogout={handleLogout} />;
  if (usuario.rol === 'admin')                                     return <DashboardAdmin      usuario={usuario} onLogout={handleLogout} />;
  if (usuario.rol === 'caficultor')                                return <DashboardCaficultor usuario={usuario} onLogout={handleLogout} />;
  if (usuario.rol === 'catador')                                   return <DashboardCatador    usuario={usuario} onLogout={handleLogout} />;
  if (usuario.rol === 'dueno_cafeteria' || usuario.rol === 'dueno') return <DashboardDueno     usuario={usuario} onLogout={handleLogout} />;

  return <div style={{ color: '#fff', padding: 40 }}>Rol no reconocido: {usuario.rol}</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/taza/:token"        element={<TazaJV />} />
        <Route path="/qr/entrada/:token"  element={<QrEntrada />} />
        <Route path="/qr/mapa/:id"        element={<QrMapsRedirect />} />
        <Route path="/cafeteria/:token" element={<CafeteriaPublica />} />
        <Route path="/cafe/:id"         element={<CafePublico />} />
        <Route path="/*"                element={<AppInterna />} />
      </Routes>
    </BrowserRouter>
  );
}