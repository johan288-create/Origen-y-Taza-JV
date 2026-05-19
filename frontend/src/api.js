import { API_BASE_URL } from './config';

// LOGIN
export async function loginUsuario(email, password) {
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

// OBTENER CAFÉS
export async function getCafes() {
  const res = await fetch(`${API_BASE_URL}/cafes`);
  return res.json();
}

// CREAR PEDIDO
export async function crearPedido(datos) {
  const res = await fetch(`${API_BASE_URL}/pedidos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  return res.json();
}

// OBTENER PEDIDOS
export async function getPedidos() {
  const res = await fetch(`${API_BASE_URL}/pedidos`);
  return res.json();
}

// ACTUALIZAR ESTADO PEDIDO
export async function actualizarPedido(id, estado) {
  const res = await fetch(`${API_BASE_URL}/pedidos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado }),
  });
  return res.json();
}

// CREAR VALORACIÓN
export async function crearValoracion(datos) {
  const res = await fetch(`${API_BASE_URL}/valoraciones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  return res.json();
}

// OBTENER ESTADÍSTICAS
export async function getStats() {
  const res = await fetch(`${API_BASE_URL}/stats`);
  return res.json();
}
// REGISTRO DE USUARIO
export async function registrarUsuario(nombre, email, password, rol) {
  const res = await fetch(`${API_BASE_URL}/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, email, password, rol }),
  });
  return res.json();
}
// OBTENER SOLICITUDES PENDIENTES
export async function getSolicitudes() {
  const res = await fetch(`${API_BASE_URL}/solicitudes`);
  return res.json();
}

// OBTENER TODOS LOS USUARIOS
export async function getUsuarios() {
  const res = await fetch(`${API_BASE_URL}/usuarios`);
  return res.json();
}

// APROBAR O RECHAZAR SOLICITUD
export async function responderSolicitud(id, estado, rol) {
  const res = await fetch(`${API_BASE_URL}/solicitudes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado, rol }),
  });
  return res.json();
}

// CAMBIAR ROL DE USUARIO
export async function cambiarRolUsuario(id, rol, es_super_admin) {
  const res = await fetch(`${API_BASE_URL}/usuarios/${id}/rol`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rol, es_super_admin }),
  });
  return res.json();
}