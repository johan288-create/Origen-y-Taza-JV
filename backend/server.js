const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();
const app = express();
const corsOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
app.use(
  cors(
    corsOrigins.length > 0
      ? { origin: corsOrigins }
      : { origin: '*' }
  )
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const db = new Pool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port:     5432,
});

async function ensureOtjSchema() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS cafe_cosechas (
      id SERIAL PRIMARY KEY,
      cafe_id INTEGER NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
      nombre TEXT NOT NULL,
      anio INTEGER,
      notas TEXT,
      creado_en TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS otj_degustacion (
      id SERIAL PRIMARY KEY,
      qr_vaso_token TEXT NOT NULL UNIQUE,
      aroma INTEGER,
      sabor INTEGER,
      acidez INTEGER,
      cuerpo INTEGER,
      retrogusto INTEGER,
      creado_en TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}

async function seedOrigenTazaJV() {
  const JV_EMAIL = 'jv.seed@origenyj.app';
  let owner = await db.query('SELECT id FROM usuarios WHERE email = $1', [JV_EMAIL]);
  let dueno_id;
  if (owner.rows.length === 0) {
    const h = bcrypt.hashSync('JV-Seed-2026', 10);
    const ins = await db.query(
      `INSERT INTO usuarios (email, password, nombre, rol, estado, es_super_admin)
       VALUES ($1,$2,$3,'dueno_cafeteria','activo',false) RETURNING id`,
      [JV_EMAIL, h, 'Dueño semilla Origen y Taza JV']
    );
    dueno_id = ins.rows[0].id;
  } else {
    dueno_id = owner.rows[0].id;
  }

  const LIST = [
    { nombre: 'Hacienda Coloma', direccion: 'Av. Las Palmas, Tibacuy, La Serena', ubicacion: 'Tibacuy, Cundinamarca', lat: 4.328, lng: -74.477 },
    { nombre: 'Tayrona Café', direccion: 'Calle 7 #7-15', ubicacion: 'Fusagasugá', lat: 4.3371, lng: -74.3638 },
    { nombre: 'Cundinamarca Café', direccion: 'Calle 8a #23-45', ubicacion: 'Fusagasugá', lat: 4.3365, lng: -74.3645 },
    { nombre: 'El Maná Coffee and Brunch', direccion: 'Carrera 6 #9-48', ubicacion: 'Fusagasugá', lat: 4.3358, lng: -74.3629 },
    { nombre: 'Café Rojas + Bar', direccion: 'Carrera 6 #11-15', ubicacion: 'Fusagasugá', lat: 4.3352, lng: -74.3632 },
    { nombre: 'La Ramona Restaurante & Cafe', direccion: 'Calle 6 #4-38', ubicacion: 'Fusagasugá', lat: 4.3360, lng: -74.3620 },
    { nombre: 'Aroma de Café', direccion: 'Carrera 6 #6-39', ubicacion: 'Fusagasugá', lat: 4.3346, lng: -74.3636 },
    { nombre: 'Café de la Colina', direccion: 'Carrera 6 #17-25', ubicacion: 'Fusagasugá', lat: 4.3339, lng: -74.3640 },
  ];

  for (const row of LIST) {
    const ex = await db.query('SELECT id FROM cafeterias WHERE nombre = $1', [row.nombre]);
    if (ex.rows.length > 0) continue;
    const qr_token = `otj-${row.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`;
    await db.query(
      `INSERT INTO cafeterias (nombre, ubicacion, descripcion, direccion, telefono, dueno_id, qr_token, latitud, longitud, activa)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,TRUE)`,
      [row.nombre, row.ubicacion, 'Cafetería semilla — Origen y Taza JV', row.direccion, null, dueno_id, qr_token, row.lat, row.lng]
    );
  }
}

db.connect()
  .then(() => console.log('✅ Conectado a PostgreSQL - coffee_experience'))
  .then(async () => {
    try {
      await ensureOtjSchema();
      await seedOrigenTazaJV();
    } catch (e) {
      console.warn('Origen y Taza JV (schema/semilla):', e.message);
    }
  })
  .catch(err => console.error('❌ Error:', err.message));

// ── USUARIOS ──────────────────────────────────────────────────────────────────

app.post('/api/registro', async (req, res) => {
  const { email, password, nombre, rol } = req.body;
  if (!email || !password || !nombre)
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  try {
    const existe = await db.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (existe.rows.length > 0)
      return res.status(400).json({ error: 'Este correo ya está registrado' });
    const rolFinal = rol || 'cliente';
    const estado = rolFinal === 'cliente' ? 'activo' : 'pendiente';
    const passwordHash = bcrypt.hashSync(password, 10);
    const result = await db.query(
      'INSERT INTO usuarios (email, password, nombre, rol, estado, es_super_admin) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',
      [email, passwordHash, nombre, rolFinal, estado, false]
    );
    if (estado === 'pendiente')
      return res.json({ pendiente: true, mensaje: `Solicitud como ${rolFinal} pendiente.` });
    const token = jwt.sign({ id: result.rows[0].id, email, rol: rolFinal }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, usuario: { id: result.rows[0].id, email, nombre, rol: rolFinal } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (result.rows.length === 0)
      return res.status(401).json({ error: 'Usuario no encontrado' });
    const usuario = result.rows[0];
    if (usuario.estado === 'pendiente')
      return res.status(403).json({ error: 'Tu cuenta está pendiente de aprobación por el administrador.' });
    if (usuario.estado === 'rechazado')
      return res.status(403).json({ error: 'Tu solicitud fue rechazada. Contacta al administrador.' });
    const passwordValida = bcrypt.compareSync(password, usuario.password) || password === usuario.password;
    if (!passwordValida)
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    const token = jwt.sign({ id: usuario.id, email: usuario.email, rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, usuario: { id: usuario.id, email: usuario.email, rol: usuario.rol, nombre: usuario.nombre, es_super_admin: usuario.es_super_admin } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/solicitudes', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, email, nombre, rol, estado, es_super_admin, creado_en
      FROM usuarios WHERE estado IN ('pendiente','rechazado') ORDER BY creado_en DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/usuarios', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, email, nombre, rol, estado, es_super_admin, creado_en
      FROM usuarios ORDER BY creado_en DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/solicitudes/:id', async (req, res) => {
  const { estado, rol } = req.body;
  try {
    await db.query('UPDATE usuarios SET estado = $1, rol = $2 WHERE id = $3', [estado, rol, req.params.id]);
    res.json({ mensaje: 'Usuario actualizado correctamente' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/usuarios/:id/rol', async (req, res) => {
  const { rol, es_super_admin } = req.body;
  try {
    await db.query('UPDATE usuarios SET rol = $1, es_super_admin = $2 WHERE id = $3', [rol, es_super_admin || false, req.params.id]);
    res.json({ mensaje: 'Rol actualizado correctamente' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── CAFÉS ─────────────────────────────────────────────────────────────────────

app.get('/api/cafes', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.*, STRING_AGG(cs.sabor, ',') as sabores
      FROM cafes c
      LEFT JOIN cafe_sabores cs ON c.id = cs.cafe_id
      WHERE c.disponible = TRUE
      GROUP BY c.id
      ORDER BY c.id
    `);
    res.json(result.rows.map(c => ({ ...c, sabores: c.sabores ? c.sabores.split(',') : [] })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/cafes/nuevo', async (req, res) => {
  const { nombre, origen, variedad, proceso, altitud, precio, intensidad, acidez, cuerpo, dulzor, amargor, descripcion, caficultor_id, sabores } = req.body;
  if (!nombre || !caficultor_id)
    return res.status(400).json({ error: 'nombre y caficultor_id son obligatorios' });
  try {
    const result = await db.query(
      `INSERT INTO cafes (nombre, origen, variedad, proceso, altitud, precio, intensidad, acidez, cuerpo, dulzor, amargor, descripcion, disponible)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,TRUE) RETURNING id`,
      [nombre, origen||null, variedad||null, proceso||null, altitud||null,
       precio||0, intensidad||5, acidez||5, cuerpo||5, dulzor||5, amargor||5, descripcion||null]
    );
    const cafe_id = result.rows[0].id;
    await db.query(
      'INSERT INTO caficultor_cafes (caficultor_id, cafe_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
      [caficultor_id, cafe_id]
    );
    if (sabores && sabores.length > 0) {
      for (const sabor of sabores) {
        await db.query('INSERT INTO cafe_sabores (cafe_id, sabor) VALUES ($1,$2)', [cafe_id, sabor.trim()]);
      }
    }
    res.json({ id: cafe_id, mensaje: `Café "${nombre}" creado y agregado a tu perfil` });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/cafes/:id/historia', (req, res) => {
  const historias = {
    1: `Café Valentina nació del sueño de una familia fusagasugueña que apostó por el café de especialidad. Con más de 20 años en el campo cafetero, los padres de Valentina transformaron una pequeña parcela en un referente de calidad en el Sumapaz.`,
    2: `Hernando Poveda lleva treinta años cultivando café en Silvania. Su finca Los Nevados produce café Castillo bajo proceso Honey. El proceso genera sabores a naranja, panela y vainilla que equilibran acidez y dulzor.`,
    3: `Rodrigo Vargas trabaja en su finca de Pasca desde los quince años. Su proceso lavado garantiza una taza limpia con notas a cacao amargo y nuez tostada.`,
    4: `Ana Lucía Herrera estudió agronomía y regresó a la tierra familiar. Su café Caturra bajo sistema agroforestal produce una taza fresca con notas a limón, manzana verde y flores blancas.`,
    5: `María Inés Suárez heredó la Finca La Esperanza. Produce café Tabi bajo proceso natural. El proceso concentra azúcares y produce sabores a chocolate negro y ciruela madura.`,
    6: `Don Carlos Martínez cultiva en la Finca El Paraíso a 1850 metros. Su Geisha Sumapaz ha sido catada con puntajes superiores a 88 en la escala SCA.`,
    7: `El Pink Bourbon de la Finca La Esperanza ha superado todas las expectativas con notas a fresa, rosa y frutas tropicales.`,
    8: `El Sidra Natural de Hernando Poveda tiene notas a vino tinto, ciruela madura y especias orientales tras 35 días de fermentación.`,
    9: `El Wush Wush de Rodrigo Vargas sembrado a 1950 metros tiene notas de bergamota y flores blancas únicas en Colombia.`,
    10: `El Maragogipe de Finca La Esperanza tiene cuerpo cremoso excepcional con notas a panela y chocolate con leche.`,
  };
  const historia = historias[req.params.id] || 'Historia del caficultor próximamente disponible.';
  res.json({ historia });
});

app.get('/api/cafes/:id/trazabilidad', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM trazabilidad WHERE cafe_id = $1 ORDER BY orden ASC', [req.params.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/trazabilidad', async (req, res) => {
  const { cafe_id, etapa, fecha, descripcion, icono, orden } = req.body;
  if (!cafe_id || !etapa || !fecha || !descripcion || !icono || orden === undefined)
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  try {
    const result = await db.query(
      'INSERT INTO trazabilidad (cafe_id, etapa, fecha, descripcion, icono, orden) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',
      [cafe_id, etapa, fecha, descripcion, icono, orden]
    );
    res.json({ id: result.rows[0].id, mensaje: 'Etapa agregada correctamente' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/cafes/:id/sincronizar-trazabilidad', async (req, res) => {
  const cafe_id = req.params.id;
  const MAPA = {
    siembra:   { etapa: 'Siembra',       icono: '🌱', orden: 1 },
    cosecha:   { etapa: 'Cosecha',       icono: '🍒', orden: 2 },
    beneficio: { etapa: 'Procesamiento', icono: '⚙️', orden: 3 },
    secado:    { etapa: 'Secado',        icono: '☀️', orden: 4 },
    tostion:   { etapa: 'Tostión',       icono: '🔥', orden: 5 },
    empaque:   { etapa: 'En taza',       icono: '☕', orden: 6 },
  };
  try {
    const procesos = await db.query('SELECT * FROM proceso_productivo WHERE cafe_id = $1 ORDER BY creado_en ASC', [cafe_id]);
    for (const proc of procesos.rows) {
      const info = MAPA[proc.etapa];
      if (!info) continue;
      const existe = await db.query('SELECT id FROM trazabilidad WHERE cafe_id = $1 AND etapa = $2', [cafe_id, info.etapa]);
      if (existe.rows.length > 0) {
        await db.query(
          'UPDATE trazabilidad SET descripcion=$1, completada=$2, fecha=$3 WHERE cafe_id=$4 AND etapa=$5',
          [proc.descripcion || info.etapa + ' completada', proc.completada, proc.fecha, cafe_id, info.etapa]
        );
      } else {
        await db.query(
          'INSERT INTO trazabilidad (cafe_id, etapa, fecha, descripcion, icono, completada, orden) VALUES ($1,$2,$3,$4,$5,$6,$7)',
          [cafe_id, info.etapa, proc.fecha, proc.descripcion || info.etapa + ' completada', info.icono, proc.completada, info.orden]
        );
      }
    }
    res.json({ mensaje: 'Trazabilidad sincronizada correctamente' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── PREPARACIONES ─────────────────────────────────────────────────────────────

app.get('/api/cafes/:id/preparaciones', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM preparaciones WHERE cafe_id = $1 ORDER BY creado_en ASC', [req.params.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/cafes/:id/preparaciones', async (req, res) => {
  const { caficultor_id, metodo, temperatura, molienda, dosis_gr, agua_ml, tiempo, notas } = req.body;
  if (!caficultor_id || !metodo)
    return res.status(400).json({ error: 'caficultor_id y metodo son obligatorios' });
  try {
    const result = await db.query(
      `INSERT INTO preparaciones (cafe_id, caficultor_id, metodo, temperatura, molienda, dosis_gr, agua_ml, tiempo, notas)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [req.params.id, caficultor_id, metodo, temperatura||null, molienda||null, dosis_gr||null, agua_ml||null, tiempo||null, notas||null]
    );
    res.json({ id: result.rows[0].id, mensaje: 'Preparación guardada correctamente' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/preparaciones/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM preparaciones WHERE id = $1', [req.params.id]);
    res.json({ mensaje: 'Preparación eliminada' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── HISTORIA NARRADA ──────────────────────────────────────────────────────────

app.get('/api/cafes/:id/historia-narrada', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM historia_cafe WHERE cafe_id = $1', [req.params.id]);
    res.json(result.rows[0] || null);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/cafes/:id/historia-narrada', async (req, res) => {
  const { caficultor_id, texto, audio_base64, audio_tipo } = req.body;
  if (!caficultor_id)
    return res.status(400).json({ error: 'caficultor_id es obligatorio' });
  try {
    const existe = await db.query('SELECT id FROM historia_cafe WHERE cafe_id = $1 AND caficultor_id = $2', [req.params.id, caficultor_id]);
    if (existe.rows.length > 0) {
      await db.query(
        'UPDATE historia_cafe SET texto=$1, audio_base64=$2, audio_tipo=$3 WHERE cafe_id=$4 AND caficultor_id=$5',
        [texto||null, audio_base64||null, audio_tipo||'audio/webm', req.params.id, caficultor_id]
      );
    } else {
      await db.query(
        'INSERT INTO historia_cafe (cafe_id, caficultor_id, texto, audio_base64, audio_tipo) VALUES ($1,$2,$3,$4,$5)',
        [req.params.id, caficultor_id, texto||null, audio_base64||null, audio_tipo||'audio/webm']
      );
    }
    res.json({ mensaje: 'Historia guardada correctamente' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── PEDIDOS ───────────────────────────────────────────────────────────────────

app.post('/api/pedidos', async (req, res) => {
  const {
    cafeteria_id, cafe_id, cliente_id, tipo_preparacion, observaciones,
    mesa, metodo,
  } = req.body;

  if (cafeteria_id != null && cafeteria_id !== '' && cafe_id && cliente_id) {
    try {
      const r = await db.query(
        `INSERT INTO pedidos (cafeteria_id, cafe_id, cliente_id, tipo_preparacion, observaciones, estado)
         VALUES ($1,$2,$3,$4,$5,'pendiente')
         RETURNING id, cafeteria_id, cafe_id, cliente_id, tipo_preparacion, observaciones, estado, creado_en`,
        [cafeteria_id, cafe_id, cliente_id, tipo_preparacion || null, observaciones || null]
      );
      return res.json(r.rows[0]);
    } catch (e) {
      return res.status(500).json({ error: 'Error creando pedido' });
    }
  }

  if (cafe_id && cliente_id) {
    try {
      const result = await db.query(
        'INSERT INTO pedidos (cliente_id, cafe_id, mesa, metodo) VALUES ($1,$2,$3,$4) RETURNING id',
        [cliente_id, cafe_id, mesa || null, metodo || null]
      );
      return res.json({ id: result.rows[0].id, mensaje: 'Pedido creado correctamente' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(400).json({ error: 'Faltan datos obligatorios (café, cliente o cafetería).' });
});

app.get('/api/pedidos', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.*, c.nombre as cafe_nombre, u.nombre as cliente_nombre
      FROM pedidos p
      JOIN cafes c ON p.cafe_id = c.id
      JOIN usuarios u ON p.cliente_id = u.id
      ORDER BY p.creado_en DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/pedidos/:id', async (req, res) => {
  const { estado } = req.body;
  try {
    await db.query('UPDATE pedidos SET estado = $1 WHERE id = $2', [estado, req.params.id]);
    res.json({ mensaje: 'Estado actualizado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── VALORACIONES ──────────────────────────────────────────────────────────────

app.post('/api/valoraciones', async (req, res) => {
  const { cliente_id, cafe_id, pedido_id, rating, comentario } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO valoraciones (cliente_id, cafe_id, pedido_id, rating, comentario) VALUES ($1,$2,$3,$4,$5) RETURNING id',
      [cliente_id, cafe_id, pedido_id, rating, comentario]
    );
    res.json({ id: result.rows[0].id, mensaje: 'Valoración guardada' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/valoraciones/:cafe_id', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT v.*, u.nombre as cliente_nombre
      FROM valoraciones v
      JOIN usuarios u ON v.cliente_id = u.id
      WHERE v.cafe_id = $1 ORDER BY v.creado_en DESC
    `, [req.params.cafe_id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── ESTADÍSTICAS ADMIN ────────────────────────────────────────────────────────

app.get('/api/stats', async (req, res) => {
  try {
    const r1 = await db.query('SELECT COUNT(*) as total FROM pedidos');
    const r2 = await db.query('SELECT COUNT(*) as total FROM valoraciones');
    const r3 = await db.query('SELECT AVG(rating) as promedio FROM valoraciones');
    const r4 = await db.query(`
      SELECT c.nombre, COUNT(p.id) as pedidos
      FROM pedidos p JOIN cafes c ON p.cafe_id = c.id
      GROUP BY c.id, c.nombre ORDER BY pedidos DESC LIMIT 5
    `);
    res.json({
      totalPedidos:      r1.rows[0].total,
      totalValoraciones: r2.rows[0].total,
      ratingPromedio:    parseFloat(r3.rows[0].promedio || 0).toFixed(1),
      topCafes:          r4.rows
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── PROCESO PRODUCTIVO ────────────────────────────────────────────────────────

app.get('/api/proceso-productivo/cafe/:cafe_id', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM proceso_productivo WHERE cafe_id = $1
      ORDER BY CASE etapa
        WHEN 'siembra'   THEN 1 WHEN 'cosecha'   THEN 2
        WHEN 'beneficio' THEN 3 WHEN 'secado'    THEN 4
        WHEN 'tostion'   THEN 5 WHEN 'empaque'   THEN 6 ELSE 7
      END
    `, [req.params.cafe_id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/proceso-productivo/resumen/:cafe_id', async (req, res) => {
  const etapas = ['siembra','cosecha','beneficio','secado','tostion','empaque'];
  try {
    const result = await db.query(
      'SELECT etapa, completada, fecha, creado_en FROM proceso_productivo WHERE cafe_id = $1 ORDER BY creado_en DESC',
      [req.params.cafe_id]
    );
    const resumen = etapas.map(e => {
      const reg = result.rows.find(r => r.etapa === e);
      return { etapa: e, registrada: !!reg, completada: reg ? reg.completada : false, fecha: reg ? reg.fecha : null };
    });
    const porcentaje = Math.round((resumen.filter(r => r.registrada).length / etapas.length) * 100);
    res.json({ etapas: resumen, porcentaje_completado: porcentaje });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/proceso-productivo/:caficultor_id', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT pp.*, c.nombre as cafe_nombre
      FROM proceso_productivo pp
      JOIN cafes c ON pp.cafe_id = c.id
      WHERE pp.caficultor_id = $1
      ORDER BY pp.creado_en DESC
    `, [req.params.caficultor_id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/proceso-productivo', async (req, res) => {
  const {
    cafe_id, caficultor_id, etapa, fecha, descripcion, observaciones,
    variedad, num_plantas, altitud_siembra, tipo_suelo, sistema_siembra,
    tipo_cosecha, kg_recolectados, num_recolectores, dias_cosecha, brix_promedio,
    proceso_beneficio, horas_fermentacion, ph_fermentacion, agua_usada_litros,
    metodo_secado, dias_secado, humedad_inicial, humedad_final, temperatura_promedio,
    perfil_tueste, temperatura_tueste, tiempo_tueste_min, perdida_peso_pct,
    tipo_empaque, peso_empaque_gr, num_unidades, fecha_vencimiento, certificacion, completada
  } = req.body;
  if (!cafe_id || !caficultor_id || !etapa || !fecha)
    return res.status(400).json({ error: 'cafe_id, caficultor_id, etapa y fecha son obligatorios' });
  try {
    const result = await db.query(
      `INSERT INTO proceso_productivo
       (cafe_id, caficultor_id, etapa, fecha, descripcion, observaciones,
        variedad, num_plantas, altitud_siembra, tipo_suelo, sistema_siembra,
        tipo_cosecha, kg_recolectados, num_recolectores, dias_cosecha, brix_promedio,
        proceso_beneficio, horas_fermentacion, ph_fermentacion, agua_usada_litros,
        metodo_secado, dias_secado, humedad_inicial, humedad_final, temperatura_promedio,
        perfil_tueste, temperatura_tueste, tiempo_tueste_min, perdida_peso_pct,
        tipo_empaque, peso_empaque_gr, num_unidades, fecha_vencimiento, certificacion, completada)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
               $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35) RETURNING id`,
      [cafe_id, caficultor_id, etapa, fecha, descripcion||null, observaciones||null,
       variedad||null, num_plantas||null, altitud_siembra||null, tipo_suelo||null, sistema_siembra||null,
       tipo_cosecha||null, kg_recolectados||null, num_recolectores||null, dias_cosecha||null, brix_promedio||null,
       proceso_beneficio||null, horas_fermentacion||null, ph_fermentacion||null, agua_usada_litros||null,
       metodo_secado||null, dias_secado||null, humedad_inicial||null, humedad_final||null, temperatura_promedio||null,
       perfil_tueste||null, temperatura_tueste||null, tiempo_tueste_min||null, perdida_peso_pct||null,
       tipo_empaque||null, peso_empaque_gr||null, num_unidades||null, fecha_vencimiento||null, certificacion||null,
       completada||false]
    );
    res.json({ id: result.rows[0].id, mensaje: `Etapa de ${etapa} registrada correctamente` });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/proceso-productivo/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM proceso_productivo WHERE id = $1', [req.params.id]);
    res.json({ mensaje: 'Registro eliminado correctamente' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── CAFICULTOR — MIS CAFÉS ────────────────────────────────────────────────────

app.get('/api/caficultor/:id/mis-cafes', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.*, STRING_AGG(cs.sabor, ',') as sabores
      FROM caficultor_cafes cc
      JOIN cafes c ON cc.cafe_id = c.id
      LEFT JOIN cafe_sabores cs ON c.id = cs.cafe_id
      WHERE cc.caficultor_id = $1
      GROUP BY c.id
    `, [req.params.id]);
    res.json(result.rows.map(c => ({ ...c, sabores: c.sabores ? c.sabores.split(',') : [] })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/caficultor/:id/vincular-cafe', async (req, res) => {
  const { cafe_id } = req.body;
  if (!cafe_id) return res.status(400).json({ error: 'cafe_id es obligatorio' });
  try {
    await db.query(
      'INSERT INTO caficultor_cafes (caficultor_id, cafe_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
      [req.params.id, cafe_id]
    );
    res.json({ mensaje: 'Café agregado a tu perfil correctamente' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/caficultor/:id/vincular-cafe/:cafe_id', async (req, res) => {
  try {
    await db.query(
      'DELETE FROM caficultor_cafes WHERE caficultor_id = $1 AND cafe_id = $2',
      [req.params.id, req.params.cafe_id]
    );
    res.json({ mensaje: 'Café eliminado de tu perfil' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── CATACIONES ────────────────────────────────────────────────────────────────

app.get('/api/cataciones/catador/:catador_id', async (req, res) => {
  try {
    const cafesResult = await db.query(`
      SELECT c.*, STRING_AGG(cs.sabor, ',') as sabores
      FROM cafes c
      LEFT JOIN cafe_sabores cs ON c.id = cs.cafe_id
      WHERE c.disponible = TRUE
      GROUP BY c.id
      ORDER BY c.id
    `);
    const cataciones = await db.query(
      'SELECT * FROM cataciones WHERE catador_id = $1',
      [req.params.catador_id]
    );
    const catMap = {};
    cataciones.rows.forEach(cat => { catMap[cat.cafe_id] = cat; });
    const resultado = cafesResult.rows.map(cafe => {
      const cat = catMap[cafe.id];
      return {
        ...cafe,
        sabores:         cafe.sabores ? cafe.sabores.split(',') : [],
        catacion_id:     cat?.id              || null,
        cat_acidez:      cat?.acidez          || null,
        cat_cuerpo:      cat?.cuerpo          || null,
        cat_dulzor:      cat?.dulzor          || null,
        cat_amargor:     cat?.amargor         || null,
        cat_intensidad:  cat?.intensidad      || null,
        cat_aroma:       cat?.aroma           || null,
        cat_balance:     cat?.balance         || null,
        puntaje_total:   cat?.puntaje_total   || null,
        notas:           cat?.notas           || null,
        descriptores:    cat?.descriptores    || null,
        metodo_catacion: cat?.metodo_catacion || null,
        fecha:           cat?.fecha           || null,
      };
    });
    res.json(resultado);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/cataciones/stats/:catador_id', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        COUNT(*)                     as total_cataciones,
        ROUND(AVG(puntaje_total), 1) as puntaje_promedio,
        MAX(puntaje_total)           as puntaje_maximo,
        MIN(puntaje_total)           as puntaje_minimo
      FROM cataciones WHERE catador_id = $1
    `, [req.params.catador_id]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/cataciones', async (req, res) => {
  const { cafe_id, catador_id, acidez, cuerpo, dulzor, amargor, intensidad, aroma, balance, notas, descriptores, metodo_catacion } = req.body;
  if (!cafe_id || !catador_id)
    return res.status(400).json({ error: 'cafe_id y catador_id son obligatorios' });
  const valores = [acidez, cuerpo, dulzor, amargor, intensidad, aroma, balance].filter(v => v !== null && v !== undefined);
  const puntaje_total = valores.length > 0
    ? (valores.reduce((a, b) => a + Number(b), 0) / valores.length).toFixed(1)
    : null;
  try {
    const existe = await db.query(
      'SELECT id FROM cataciones WHERE cafe_id = $1 AND catador_id = $2',
      [cafe_id, catador_id]
    );
    if (existe.rows.length > 0) {
      await db.query(`
        UPDATE cataciones
        SET acidez=$1, cuerpo=$2, dulzor=$3, amargor=$4, intensidad=$5,
            aroma=$6, balance=$7, puntaje_total=$8, notas=$9,
            descriptores=$10, metodo_catacion=$11, fecha=CURRENT_DATE
        WHERE cafe_id=$12 AND catador_id=$13
      `, [acidez||null, cuerpo||null, dulzor||null, amargor||null, intensidad||null,
          aroma||null, balance||null, puntaje_total, notas||null,
          descriptores||null, metodo_catacion||null, cafe_id, catador_id]);
    } else {
      await db.query(`
        INSERT INTO cataciones
        (cafe_id, catador_id, acidez, cuerpo, dulzor, amargor,
         intensidad, aroma, balance, puntaje_total, notas, descriptores, metodo_catacion)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      `, [cafe_id, catador_id, acidez||null, cuerpo||null, dulzor||null, amargor||null,
          intensidad||null, aroma||null, balance||null, puntaje_total,
          notas||null, descriptores||null, metodo_catacion||null]);
    }
    await actualizarPerfilCafe(cafe_id);
    res.json({ mensaje: existe.rows.length > 0 ? 'Catación actualizada' : 'Catación guardada correctamente' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

async function actualizarPerfilCafe(cafe_id) {
  const promedios = await db.query(`
    SELECT
      ROUND(AVG(acidez))::int     as acidez,
      ROUND(AVG(cuerpo))::int     as cuerpo,
      ROUND(AVG(dulzor))::int     as dulzor,
      ROUND(AVG(amargor))::int    as amargor,
      ROUND(AVG(intensidad))::int as intensidad
    FROM cataciones WHERE cafe_id = $1
  `, [cafe_id]);
  const p = promedios.rows[0];
  if (p.acidez !== null) {
    await db.query(
      'UPDATE cafes SET acidez=$1, cuerpo=$2, dulzor=$3, amargor=$4, intensidad=$5 WHERE id=$6',
      [p.acidez, p.cuerpo, p.dulzor, p.amargor, p.intensidad, cafe_id]
    );
  }
}

app.delete('/api/cataciones/:id', async (req, res) => {
  try {
    const cat = await db.query('SELECT cafe_id FROM cataciones WHERE id = $1', [req.params.id]);
    await db.query('DELETE FROM cataciones WHERE id = $1', [req.params.id]);
    if (cat.rows.length > 0) await actualizarPerfilCafe(cat.rows[0].cafe_id);
    res.json({ mensaje: 'Catación eliminada' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── CAFETERÍAS ────────────────────────────────────────────────────────────────

// CREAR CAFETERÍA (genera QR automáticamente)
app.post('/api/cafeterias', async (req, res) => {
  const { nombre, ubicacion, descripcion, direccion, telefono, dueno_id, latitud, longitud } = req.body;
  if (!nombre || !dueno_id)
    return res.status(400).json({ error: 'nombre y dueno_id son obligatorios' });
  try {
    const qr_token = `cafeteria-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const result = await db.query(
      `INSERT INTO cafeterias (nombre, ubicacion, descripcion, direccion, telefono, dueno_id, qr_token, latitud, longitud)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [nombre, ubicacion||null, descripcion||null, direccion||null, telefono||null, dueno_id, qr_token, latitud||null, longitud||null]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// OBTENER TODAS LAS CAFETERÍAS
app.get('/api/cafeterias', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.*, u.nombre as dueno_nombre
      FROM cafeterias c
      LEFT JOIN usuarios u ON c.dueno_id = u.id
      WHERE c.activa = TRUE
      ORDER BY c.creado_en DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// OBTENER CAFETERÍAS DE UN DUEÑO
app.get('/api/cafeterias/dueno/:dueno_id', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM cafeterias WHERE dueno_id = $1 ORDER BY creado_en DESC`,
      [req.params.dueno_id]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// OBTENER CAFETERÍA POR ID
app.get('/api/cafeterias/:id', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.*, u.nombre as dueno_nombre
      FROM cafeterias c
      LEFT JOIN usuarios u ON c.dueno_id = u.id
      WHERE c.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Cafetería no encontrada' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// OBTENER CAFETERÍA POR QR TOKEN (página pública)
app.get('/api/cafeterias/qr/:token', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.*, u.nombre as dueno_nombre
      FROM cafeterias c
      LEFT JOIN usuarios u ON c.dueno_id = u.id
      WHERE c.qr_token = $1 AND c.activa = TRUE
    `, [req.params.token]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Cafetería no encontrada' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ACTUALIZAR CAFETERÍA
app.put('/api/cafeterias/:id', async (req, res) => {
  const { nombre, ubicacion, descripcion, direccion, telefono, latitud, longitud } = req.body;
  try {
    const result = await db.query(`
      UPDATE cafeterias SET nombre=$1, ubicacion=$2, descripcion=$3, direccion=$4, telefono=$5, latitud=$6, longitud=$7
      WHERE id=$8 RETURNING *
    `, [nombre, ubicacion||null, descripcion||null, direccion||null, telefono||null, latitud||null, longitud||null, req.params.id]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── BARISTAS DE CAFETERÍA ─────────────────────────────────────────────────────

// OBTENER BARISTAS DE UNA CAFETERÍA
app.get('/api/cafeterias/:id/baristas', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.id, u.nombre, u.email, cb.activo, cb.creado_en
      FROM cafeteria_baristas cb
      JOIN usuarios u ON cb.barista_id = u.id
      WHERE cb.cafeteria_id = $1 AND cb.activo = TRUE
    `, [req.params.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// AGREGAR BARISTA A CAFETERÍA
app.post('/api/cafeterias/:id/baristas', async (req, res) => {
  const { barista_id } = req.body;
  const cafeteria_id = req.params.id;

  if (!barista_id) return res.status(400).json({ error: 'barista_id es obligatorio' });

  try {
    await db.query('BEGIN');

    // 1) Mantén tu relación en tabla intermedia
    await db.query(
      `INSERT INTO cafeteria_baristas (cafeteria_id, barista_id)
       VALUES ($1,$2)
       ON CONFLICT DO NOTHING`,
      [cafeteria_id, barista_id]
    );

    // 2) Refleja la asignación directa en usuarios
    await db.query(
      `UPDATE usuarios
       SET cafeteria_id = $1
       WHERE id = $2 AND rol = 'barista'`,
      [cafeteria_id, barista_id]
    );

    await db.query('COMMIT');
    res.json({ mensaje: 'Barista agregado correctamente' });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
// QUITAR BARISTA DE CAFETERÍA
app.delete('/api/cafeterias/:id/baristas/:barista_id', async (req, res) => {
  const cafeteria_id = req.params.id;
  const barista_id   = req.params.barista_id;

  try {
    await db.query('BEGIN');

    // 1) Quita la relación en intermedia
    await db.query(
      `DELETE FROM cafeteria_baristas
       WHERE cafeteria_id = $1 AND barista_id = $2`,
      [cafeteria_id, barista_id]
    );

    // 2) Refleja la desasignación directa en usuarios
    await db.query(
      `UPDATE usuarios
       SET cafeteria_id = NULL
       WHERE id = $1 AND rol = 'barista'`,
      [barista_id]
    );

    await db.query('COMMIT');
    res.json({ mensaje: 'Barista removido correctamente' });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// OBTENER CAFETERÍA DE UN BARISTA
app.get('/api/barista/:barista_id/cafeteria', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.*
      FROM cafeteria_baristas cb
      JOIN cafeterias c ON cb.cafeteria_id = c.id
      WHERE cb.barista_id = $1 AND cb.activo = TRUE AND c.activa = TRUE
      LIMIT 1
    `, [req.params.barista_id]);
    res.json(result.rows[0] || null);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── MENÚ DE CAFETERÍA ─────────────────────────────────────────────────────────

// OBTENER MENÚ DE CAFETERÍA (público)
app.get('/api/cafeterias/:id/menu', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT cm.*, ca.nombre, ca.origen, ca.variedad, ca.proceso,
             ca.altitud, ca.descripcion, ca.acidez, ca.cuerpo,
             ca.dulzor, ca.amargor, ca.intensidad,
             STRING_AGG(cs.sabor, ',') as sabores,
             f.nombre as finca_nombre, f.ubicacion as finca_ubicacion
      FROM cafeteria_menu cm
      JOIN cafes ca ON cm.cafe_id = ca.id
      LEFT JOIN cafe_sabores cs ON ca.id = cs.cafe_id
      LEFT JOIN fincas f ON ca.finca_id = f.id
      WHERE cm.cafeteria_id = $1 AND cm.disponible = TRUE
      GROUP BY cm.id, ca.id, f.id
      ORDER BY ca.nombre
    `, [req.params.id]);
    res.json(result.rows.map(c => ({ ...c, sabores: c.sabores ? c.sabores.split(',') : [] })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AGREGAR CAFÉ AL MENÚ
app.post('/api/cafeterias/:id/menu', async (req, res) => {
  const { cafe_id, precio, stock } = req.body;
  if (!cafe_id) return res.status(400).json({ error: 'cafe_id es obligatorio' });
  try {
    const result = await db.query(
      `INSERT INTO cafeteria_menu (cafeteria_id, cafe_id, precio, stock)
       VALUES ($1,$2,$3,$4) ON CONFLICT (cafeteria_id, cafe_id)
       DO UPDATE SET precio=$3, stock=$4, disponible=TRUE RETURNING *`,
      [req.params.id, cafe_id, precio||null, stock||0]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ACTUALIZAR INVENTARIO
app.put('/api/cafeterias/:id/menu/:cafe_id', async (req, res) => {
  const { precio, stock, disponible } = req.body;
  try {
    const result = await db.query(`
      UPDATE cafeteria_menu SET precio=$1, stock=$2, disponible=$3
      WHERE cafeteria_id=$4 AND cafe_id=$5 RETURNING *
    `, [precio||null, stock||0, disponible !== false, req.params.id, req.params.cafe_id]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// QUITAR CAFÉ DEL MENÚ
app.delete('/api/cafeterias/:id/menu/:cafe_id', async (req, res) => {
  try {
    await db.query(
      'DELETE FROM cafeteria_menu WHERE cafeteria_id=$1 AND cafe_id=$2',
      [req.params.id, req.params.cafe_id]
    );
    res.json({ mensaje: 'Café removido del menú' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── PEDIDOS CAFETERÍA ─────────────────────────────────────────────────────────

// CREAR PEDIDO DESDE QR
app.post('/api/pedidos-cafeteria', async (req, res) => {
  const { cafeteria_id, cafe_id, cliente_nombre, cliente_id, tipo_preparacion, observaciones } = req.body;
  if (!cafeteria_id || !cafe_id)
    return res.status(400).json({ error: 'cafeteria_id y cafe_id son obligatorios' });
  try {
    // Asignar barista disponible de esa cafetería
    const barista = await db.query(`
      SELECT barista_id FROM cafeteria_baristas
      WHERE cafeteria_id = $1 AND activo = TRUE LIMIT 1
    `, [cafeteria_id]);
    const barista_id = barista.rows[0]?.barista_id || null;
    const qr_vaso_token = `vaso-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const result = await db.query(`
      INSERT INTO pedidos_cafeteria
      (cafeteria_id, cafe_id, barista_id, cliente_nombre, cliente_id, tipo_preparacion, observaciones, qr_vaso_token)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *
    `, [cafeteria_id, cafe_id, barista_id, cliente_nombre||'Cliente', cliente_id||null, tipo_preparacion||null, observaciones||null, qr_vaso_token]);
    // Reducir stock
    await db.query(
      'UPDATE cafeteria_menu SET stock = GREATEST(stock - 1, 0) WHERE cafeteria_id=$1 AND cafe_id=$2',
      [cafeteria_id, cafe_id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// OBTENER PEDIDO POR QR VASO (ruta específica antes de :cafeteria_id)
app.get('/api/pedidos-cafeteria/vaso/:token', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT pc.*, ca.nombre as cafe_nombre, ca.origen, ca.variedad,
             ca.proceso, ca.altitud, ca.descripcion,
             ca.acidez, ca.cuerpo, ca.dulzor, ca.amargor, ca.intensidad,
             cf.nombre as cafeteria_nombre
      FROM pedidos_cafeteria pc
      JOIN cafes ca ON pc.cafe_id = ca.id
      JOIN cafeterias cf ON pc.cafeteria_id = cf.id
      WHERE pc.qr_vaso_token = $1
    `, [req.params.token]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// OBTENER PEDIDOS DE UNA CAFETERÍA (para barista / dueño)
app.get('/api/pedidos-cafeteria/:cafeteria_id', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT pc.*, ca.nombre as cafe_nombre, ca.origen,
             u.nombre as barista_nombre
      FROM pedidos_cafeteria pc
      JOIN cafes ca ON pc.cafe_id = ca.id
      LEFT JOIN usuarios u ON pc.barista_id = u.id
      WHERE pc.cafeteria_id = $1
      ORDER BY pc.creado_en DESC
    `, [req.params.cafeteria_id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ACTUALIZAR ESTADO PEDIDO CAFETERÍA
app.put('/api/pedidos-cafeteria/:id', async (req, res) => {
  const { estado } = req.body;
  try {
    const result = await db.query(
      'UPDATE pedidos_cafeteria SET estado=$1 WHERE id=$2 RETURNING *',
      [estado, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// OBTENER TODOS LOS BARISTAS DISPONIBLES
app.get('/api/baristas', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, nombre, email FROM usuarios WHERE rol = 'barista' AND estado = 'activo' ORDER BY nombre`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
// OBTENER BARISTA CON SU CAFETERÍA
app.get('/api/baristas/:barista_id', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.id, u.nombre, u.email, u.rol, cb.cafeteria_id
      FROM usuarios u
      LEFT JOIN cafeteria_baristas cb ON cb.barista_id = u.id AND cb.activo = TRUE
      WHERE u.id = $1
    `, [req.params.barista_id]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Barista no encontrado' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
// CAFETERÍAS CON COORDENADAS (para el mapa público)
app.get('/api/mapa/cafeterias', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, nombre, ubicacion, descripcion, direccion, telefono, qr_token, latitud, longitud
      FROM cafeterias
      WHERE activa = TRUE AND latitud IS NOT NULL AND longitud IS NOT NULL
      ORDER BY nombre
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// OBTENER CATA DE UN CAFÉ (promedio de todas las cataciones)
app.get('/api/cataciones/cafe/:cafe_id', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        ROUND(AVG(acidez),1)     as acidez,
        ROUND(AVG(cuerpo),1)     as cuerpo,
        ROUND(AVG(dulzor),1)     as dulzor,
        ROUND(AVG(amargor),1)    as amargor,
        ROUND(AVG(intensidad),1) as intensidad,
        ROUND(AVG(aroma),1)      as aroma,
        ROUND(AVG(balance),1)    as balance,
        ROUND(AVG(puntaje_total),1) as puntaje_total,
        STRING_AGG(DISTINCT descriptores, ',') as descriptores,
        MAX(notas) as notas,
        MAX(metodo_catacion) as metodo_catacion,
        COUNT(*) as num_cataciones,
        MAX(id) as id
      FROM cataciones WHERE cafe_id = $1
    `, [req.params.cafe_id]);
    if (result.rows.length === 0 || !result.rows[0].id)
      return res.status(404).json({ error: 'Sin cataciones' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
// EDITAR PREPARACIÓN
app.put('/api/preparaciones/:id', async (req, res) => {
  const { temperatura, molienda, dosis_gr, agua_ml, tiempo, notas } = req.body;
  try {
    await db.query(
      `UPDATE preparaciones SET temperatura=$1, molienda=$2, dosis_gr=$3, agua_ml=$4, tiempo=$5, notas=$6 WHERE id=$7`,
      [temperatura||null, molienda||null, dosis_gr||null, agua_ml||null, tiempo||null, notas||null, req.params.id]
    );
    res.json({ mensaje: 'Preparación actualizada' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── ORIGEN Y TAZA JV — COSECHAS (múltiples por café) ──────────────────────────

app.get('/api/cafes/:id/cosechas', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM cafe_cosechas WHERE cafe_id = $1 ORDER BY anio DESC NULLS LAST, id DESC',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/cafes/:id/cosechas', async (req, res) => {
  const { nombre, anio, notas } = req.body;
  if (!nombre) return res.status(400).json({ error: 'nombre es obligatorio' });
  try {
    const result = await db.query(
      'INSERT INTO cafe_cosechas (cafe_id, nombre, anio, notas) VALUES ($1,$2,$3,$4) RETURNING *',
      [req.params.id, nombre, anio || null, notas || null]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/taza/degustacion', async (req, res) => {
  const { qr_vaso_token, aroma, sabor, acidez, cuerpo, retrogusto } = req.body;
  if (!qr_vaso_token) return res.status(400).json({ error: 'qr_vaso_token es obligatorio' });
  try {
    await db.query(
      `INSERT INTO otj_degustacion (qr_vaso_token, aroma, sabor, acidez, cuerpo, retrogusto)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (qr_vaso_token) DO UPDATE SET
         aroma=$2, sabor=$3, acidez=$4, cuerpo=$5, retrogusto=$6, creado_en=NOW()`,
      [qr_vaso_token, aroma ?? null, sabor ?? null, acidez ?? null, cuerpo ?? null, retrogusto ?? null]
    );
    res.json({ mensaje: 'Degustación guardada' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── SERVIDOR ──────────────────────────────────────────────────────────────────

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
