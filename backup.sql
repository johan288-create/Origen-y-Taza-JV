--
-- PostgreSQL database dump
--

\restrict bsuLlM3yMUci2j3XIaxX050JYROEzdmmR0wCW9BaUjock5xAoDvDOJMMRYNbbvg

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cafe_cosechas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cafe_cosechas (
    id integer NOT NULL,
    cafe_id integer NOT NULL,
    nombre text NOT NULL,
    anio integer,
    notas text,
    creado_en timestamp with time zone DEFAULT now()
);


ALTER TABLE public.cafe_cosechas OWNER TO postgres;

--
-- Name: cafe_cosechas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cafe_cosechas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cafe_cosechas_id_seq OWNER TO postgres;

--
-- Name: cafe_cosechas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cafe_cosechas_id_seq OWNED BY public.cafe_cosechas.id;


--
-- Name: cafe_sabores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cafe_sabores (
    id integer NOT NULL,
    cafe_id integer,
    sabor character varying(50)
);


ALTER TABLE public.cafe_sabores OWNER TO postgres;

--
-- Name: cafe_sabores_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cafe_sabores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cafe_sabores_id_seq OWNER TO postgres;

--
-- Name: cafe_sabores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cafe_sabores_id_seq OWNED BY public.cafe_sabores.id;


--
-- Name: cafes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cafes (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    origen character varying(150),
    variedad character varying(100),
    proceso character varying(100),
    altitud character varying(50),
    precio integer NOT NULL,
    intensidad integer,
    acidez integer,
    cuerpo integer,
    dulzor integer,
    amargor integer,
    descripcion text,
    finca_id integer,
    disponible boolean DEFAULT true,
    caficultor_id integer
);


ALTER TABLE public.cafes OWNER TO postgres;

--
-- Name: cafes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cafes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cafes_id_seq OWNER TO postgres;

--
-- Name: cafes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cafes_id_seq OWNED BY public.cafes.id;


--
-- Name: cafeteria_baristas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cafeteria_baristas (
    id integer NOT NULL,
    cafeteria_id integer NOT NULL,
    barista_id integer NOT NULL,
    activo boolean DEFAULT true,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.cafeteria_baristas OWNER TO postgres;

--
-- Name: cafeteria_baristas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cafeteria_baristas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cafeteria_baristas_id_seq OWNER TO postgres;

--
-- Name: cafeteria_baristas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cafeteria_baristas_id_seq OWNED BY public.cafeteria_baristas.id;


--
-- Name: cafeteria_menu; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cafeteria_menu (
    id integer NOT NULL,
    cafeteria_id integer NOT NULL,
    cafe_id integer NOT NULL,
    precio integer,
    disponible boolean DEFAULT true,
    stock integer DEFAULT 0,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.cafeteria_menu OWNER TO postgres;

--
-- Name: cafeteria_menu_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cafeteria_menu_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cafeteria_menu_id_seq OWNER TO postgres;

--
-- Name: cafeteria_menu_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cafeteria_menu_id_seq OWNED BY public.cafeteria_menu.id;


--
-- Name: cafeterias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cafeterias (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    ubicacion character varying(200),
    descripcion text,
    direccion character varying(200),
    telefono character varying(20),
    logo_url text,
    dueno_id integer,
    activa boolean DEFAULT true,
    qr_token character varying(100),
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    latitud numeric(10,7),
    longitud numeric(10,7)
);


ALTER TABLE public.cafeterias OWNER TO postgres;

--
-- Name: cafeterias_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cafeterias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cafeterias_id_seq OWNER TO postgres;

--
-- Name: cafeterias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cafeterias_id_seq OWNED BY public.cafeterias.id;


--
-- Name: caficultor_cafes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.caficultor_cafes (
    id integer NOT NULL,
    caficultor_id integer NOT NULL,
    cafe_id integer NOT NULL,
    fecha_vinculacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.caficultor_cafes OWNER TO postgres;

--
-- Name: caficultor_cafes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.caficultor_cafes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.caficultor_cafes_id_seq OWNER TO postgres;

--
-- Name: caficultor_cafes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.caficultor_cafes_id_seq OWNED BY public.caficultor_cafes.id;


--
-- Name: cataciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cataciones (
    id integer NOT NULL,
    cafe_id integer NOT NULL,
    catador_id integer NOT NULL,
    acidez integer,
    cuerpo integer,
    dulzor integer,
    amargor integer,
    intensidad integer,
    aroma integer,
    balance integer,
    puntaje_total numeric(4,1),
    notas text,
    descriptores text,
    metodo_catacion character varying(50),
    fecha date DEFAULT CURRENT_DATE,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cataciones_acidez_check CHECK (((acidez >= 1) AND (acidez <= 10))),
    CONSTRAINT cataciones_amargor_check CHECK (((amargor >= 1) AND (amargor <= 10))),
    CONSTRAINT cataciones_aroma_check CHECK (((aroma >= 1) AND (aroma <= 10))),
    CONSTRAINT cataciones_balance_check CHECK (((balance >= 1) AND (balance <= 10))),
    CONSTRAINT cataciones_cuerpo_check CHECK (((cuerpo >= 1) AND (cuerpo <= 10))),
    CONSTRAINT cataciones_dulzor_check CHECK (((dulzor >= 1) AND (dulzor <= 10))),
    CONSTRAINT cataciones_intensidad_check CHECK (((intensidad >= 1) AND (intensidad <= 10)))
);


ALTER TABLE public.cataciones OWNER TO postgres;

--
-- Name: cataciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cataciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cataciones_id_seq OWNER TO postgres;

--
-- Name: cataciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cataciones_id_seq OWNED BY public.cataciones.id;


--
-- Name: fincas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fincas (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    ubicacion character varying(150),
    altitud character varying(50),
    propietario_id integer,
    descripcion text
);


ALTER TABLE public.fincas OWNER TO postgres;

--
-- Name: fincas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.fincas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.fincas_id_seq OWNER TO postgres;

--
-- Name: fincas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.fincas_id_seq OWNED BY public.fincas.id;


--
-- Name: historia_cafe; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historia_cafe (
    id integer NOT NULL,
    cafe_id integer NOT NULL,
    caficultor_id integer NOT NULL,
    texto text,
    audio_base64 text,
    audio_tipo character varying(20) DEFAULT 'audio/webm'::character varying,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.historia_cafe OWNER TO postgres;

--
-- Name: historia_cafe_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.historia_cafe_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.historia_cafe_id_seq OWNER TO postgres;

--
-- Name: historia_cafe_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.historia_cafe_id_seq OWNED BY public.historia_cafe.id;


--
-- Name: otj_degustacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.otj_degustacion (
    id integer NOT NULL,
    qr_vaso_token text NOT NULL,
    aroma integer,
    sabor integer,
    acidez integer,
    cuerpo integer,
    retrogusto integer,
    creado_en timestamp with time zone DEFAULT now()
);


ALTER TABLE public.otj_degustacion OWNER TO postgres;

--
-- Name: otj_degustacion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.otj_degustacion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.otj_degustacion_id_seq OWNER TO postgres;

--
-- Name: otj_degustacion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.otj_degustacion_id_seq OWNED BY public.otj_degustacion.id;


--
-- Name: pedidos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pedidos (
    id integer NOT NULL,
    cliente_id integer,
    cafe_id integer,
    mesa character varying(20),
    metodo character varying(50),
    estado character varying(20) DEFAULT 'pendiente'::character varying NOT NULL,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pedidos_estado_check CHECK (((estado)::text = ANY ((ARRAY['pendiente'::character varying, 'preparando'::character varying, 'listo'::character varying, 'entregado'::character varying])::text[])))
);


ALTER TABLE public.pedidos OWNER TO postgres;

--
-- Name: pedidos_cafeteria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pedidos_cafeteria (
    id integer NOT NULL,
    cafeteria_id integer NOT NULL,
    cafe_id integer NOT NULL,
    barista_id integer,
    cliente_nombre character varying(100),
    cliente_id integer,
    tipo_preparacion character varying(50),
    observaciones text,
    estado character varying(20) DEFAULT 'pendiente'::character varying,
    qr_vaso_token character varying(100),
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pedidos_cafeteria_estado_check CHECK (((estado)::text = ANY ((ARRAY['pendiente'::character varying, 'preparando'::character varying, 'listo'::character varying, 'entregado'::character varying, 'cancelado'::character varying])::text[])))
);


ALTER TABLE public.pedidos_cafeteria OWNER TO postgres;

--
-- Name: pedidos_cafeteria_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pedidos_cafeteria_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pedidos_cafeteria_id_seq OWNER TO postgres;

--
-- Name: pedidos_cafeteria_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pedidos_cafeteria_id_seq OWNED BY public.pedidos_cafeteria.id;


--
-- Name: pedidos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pedidos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pedidos_id_seq OWNER TO postgres;

--
-- Name: pedidos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pedidos_id_seq OWNED BY public.pedidos.id;


--
-- Name: preparaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.preparaciones (
    id integer NOT NULL,
    cafe_id integer NOT NULL,
    caficultor_id integer NOT NULL,
    metodo character varying(50) NOT NULL,
    temperatura character varying(20),
    molienda character varying(50),
    dosis_gr numeric(5,1),
    agua_ml integer,
    tiempo character varying(30),
    notas text,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.preparaciones OWNER TO postgres;

--
-- Name: preparaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.preparaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.preparaciones_id_seq OWNER TO postgres;

--
-- Name: preparaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.preparaciones_id_seq OWNED BY public.preparaciones.id;


--
-- Name: proceso_productivo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proceso_productivo (
    id integer NOT NULL,
    cafe_id integer NOT NULL,
    caficultor_id integer NOT NULL,
    etapa character varying(20) NOT NULL,
    fecha date NOT NULL,
    descripcion text,
    observaciones text,
    variedad character varying(100),
    num_plantas integer,
    altitud_siembra character varying(50),
    tipo_suelo character varying(100),
    sistema_siembra character varying(100),
    tipo_cosecha character varying(30),
    kg_recolectados numeric(10,2),
    num_recolectores integer,
    dias_cosecha integer,
    brix_promedio numeric(4,1),
    proceso_beneficio character varying(20),
    horas_fermentacion integer,
    ph_fermentacion numeric(3,1),
    agua_usada_litros numeric(10,2),
    metodo_secado character varying(30),
    dias_secado integer,
    humedad_inicial numeric(4,1),
    humedad_final numeric(4,1),
    temperatura_promedio numeric(4,1),
    perfil_tueste character varying(20),
    temperatura_tueste numeric(5,1),
    tiempo_tueste_min integer,
    perdida_peso_pct numeric(4,1),
    tipo_empaque character varying(100),
    peso_empaque_gr integer,
    num_unidades integer,
    fecha_vencimiento date,
    certificacion character varying(100),
    completada boolean DEFAULT false,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT proceso_productivo_etapa_check CHECK (((etapa)::text = ANY ((ARRAY['siembra'::character varying, 'cosecha'::character varying, 'beneficio'::character varying, 'secado'::character varying, 'tostion'::character varying, 'empaque'::character varying])::text[]))),
    CONSTRAINT proceso_productivo_metodo_secado_check CHECK (((metodo_secado)::text = ANY ((ARRAY['camas_africanas'::character varying, 'patio'::character varying, 'marquesina'::character varying, 'secador_mecanico'::character varying])::text[]))),
    CONSTRAINT proceso_productivo_perfil_tueste_check CHECK (((perfil_tueste)::text = ANY ((ARRAY['claro'::character varying, 'medio'::character varying, 'oscuro'::character varying, 'muy_oscuro'::character varying])::text[]))),
    CONSTRAINT proceso_productivo_proceso_beneficio_check CHECK (((proceso_beneficio)::text = ANY ((ARRAY['lavado'::character varying, 'natural'::character varying, 'honey'::character varying, 'anaeorobico'::character varying])::text[]))),
    CONSTRAINT proceso_productivo_tipo_cosecha_check CHECK (((tipo_cosecha)::text = ANY ((ARRAY['manual_selectiva'::character varying, 'mecanica'::character varying, 'por_bandeo'::character varying])::text[])))
);


ALTER TABLE public.proceso_productivo OWNER TO postgres;

--
-- Name: proceso_productivo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.proceso_productivo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.proceso_productivo_id_seq OWNER TO postgres;

--
-- Name: proceso_productivo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.proceso_productivo_id_seq OWNED BY public.proceso_productivo.id;


--
-- Name: trazabilidad; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trazabilidad (
    id integer NOT NULL,
    cafe_id integer NOT NULL,
    etapa character varying(50) NOT NULL,
    fecha date NOT NULL,
    descripcion text NOT NULL,
    icono character varying(10) DEFAULT '☕'::character varying,
    completada boolean DEFAULT true,
    orden integer NOT NULL
);


ALTER TABLE public.trazabilidad OWNER TO postgres;

--
-- Name: trazabilidad_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.trazabilidad_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.trazabilidad_id_seq OWNER TO postgres;

--
-- Name: trazabilidad_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.trazabilidad_id_seq OWNED BY public.trazabilidad.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    rol character varying(20) NOT NULL,
    nombre character varying(100),
    estado character varying(20) DEFAULT 'activo'::character varying NOT NULL,
    es_super_admin boolean DEFAULT false NOT NULL,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    cafeteria_id integer,
    CONSTRAINT usuarios_estado_check CHECK (((estado)::text = ANY ((ARRAY['activo'::character varying, 'pendiente'::character varying, 'rechazado'::character varying])::text[]))),
    CONSTRAINT usuarios_rol_check CHECK (((rol)::text = ANY ((ARRAY['cliente'::character varying, 'barista'::character varying, 'admin'::character varying, 'caficultor'::character varying, 'catador'::character varying, 'dueno'::character varying, 'dueno_cafeteria'::character varying])::text[])))
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: valoraciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.valoraciones (
    id integer NOT NULL,
    cliente_id integer,
    cafe_id integer,
    pedido_id integer,
    rating integer,
    comentario text,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valoraciones_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.valoraciones OWNER TO postgres;

--
-- Name: valoraciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.valoraciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.valoraciones_id_seq OWNER TO postgres;

--
-- Name: valoraciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.valoraciones_id_seq OWNED BY public.valoraciones.id;


--
-- Name: cafe_cosechas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cafe_cosechas ALTER COLUMN id SET DEFAULT nextval('public.cafe_cosechas_id_seq'::regclass);


--
-- Name: cafe_sabores id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cafe_sabores ALTER COLUMN id SET DEFAULT nextval('public.cafe_sabores_id_seq'::regclass);


--
-- Name: cafes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cafes ALTER COLUMN id SET DEFAULT nextval('public.cafes_id_seq'::regclass);


--
-- Name: cafeteria_baristas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cafeteria_baristas ALTER COLUMN id SET DEFAULT nextval('public.cafeteria_baristas_id_seq'::regclass);


--
-- Name: cafeteria_menu id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cafeteria_menu ALTER COLUMN id SET DEFAULT nextval('public.cafeteria_menu_id_seq'::regclass);


--
-- Name: cafeterias id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cafeterias ALTER COLUMN id SET DEFAULT nextval('public.cafeterias_id_seq'::regclass);


--
-- Name: caficultor_cafes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caficultor_cafes ALTER COLUMN id SET DEFAULT nextval('public.caficultor_cafes_id_seq'::regclass);


--
-- Name: cataciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cataciones ALTER COLUMN id SET DEFAULT nextval('public.cataciones_id_seq'::regclass);


--
-- Name: fincas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fincas ALTER COLUMN id SET DEFAULT nextval('public.fincas_id_seq'::regclass);


--
-- Name: historia_cafe id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historia_cafe ALTER COLUMN id SET DEFAULT nextval('public.historia_cafe_id_seq'::regclass);


--
-- Name: otj_degustacion id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.otj_degustacion ALTER COLUMN id SET DEFAULT nextval('public.otj_degustacion_id_seq'::regclass);


--
-- Name: pedidos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos ALTER COLUMN id SET DEFAULT nextval('public.pedidos_id_seq'::regclass);


--
-- Name: pedidos_cafeteria id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos_cafeteria ALTER COLUMN id SET DEFAULT nextval('public.pedidos_cafeteria_id_seq'::regclass);


--
-- Name: preparaciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preparaciones ALTER COLUMN id SET DEFAULT nextval('public.preparaciones_id_seq'::regclass);


--
-- Name: proceso_productivo id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proceso_productivo ALTER COLUMN id SET DEFAULT nextval('public.proceso_productivo_id_seq'::regclass);


--
-- Name: trazabilidad id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trazabilidad ALTER COLUMN id SET DEFAULT nextval('public.trazabilidad_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Name: valoraciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.valoraciones ALTER COLUMN id SET DEFAULT nextval('public.valoraciones_id_seq'::regclass);


--
-- Data for Name: cafe_cosechas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cafe_cosechas (id, cafe_id, nombre, anio, notas, creado_en) FROM stdin;
\.


--
-- Data for Name: cafe_sabores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cafe_sabores (id, cafe_id, sabor) FROM stdin;
1	1	Caramelo
2	1	Durazno
3	1	Almendra
4	2	Naranja
5	2	Panela
6	2	Vainilla
7	3	Cacao
8	3	Nuez
9	3	Tabaco
10	4	Limón
11	4	Manzana verde
12	4	Floral
13	5	Chocolate
14	5	Ciruela
15	5	Caramelo
16	6	Jazmín
17	6	Durazno
18	6	Miel
19	7	Fresa
20	7	Rosa
21	7	Frutas tropicales
22	8	Vino tinto
23	8	Ciruela
24	8	Especias
25	9	Bergamota
26	9	Flores blancas
27	9	Miel de abeja
28	10	Panela
29	10	Nuez
30	10	Chocolate con leche
31	11	Tempor quibusdam pro
\.


--
-- Data for Name: cafes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cafes (id, nombre, origen, variedad, proceso, altitud, precio, intensidad, acidez, cuerpo, dulzor, amargor, descripcion, finca_id, disponible, caficultor_id) FROM stdin;
2	Castillo Honey	Silvania, Cundinamarca	Castillo	Honey	1750 msnm	9000	3	7	6	8	3	Equilibrio perfecto entre dulzor y acidez con notas de naranja, panela y vainilla.	3	t	\N
3	Borbón Oscuro	Pasca, Cundinamarca	Borbón	Lavado	1900 msnm	11000	5	4	9	5	7	Cuerpo robusto ideal para espresso. Notas a cacao amargo, nuez tostada y tabaco.	1	t	\N
4	Caturra Fresco	Fusagasugá, Cundinamarca	Caturra	Lavado	1550 msnm	8000	2	9	4	6	2	Ligero y refrescante con notas de limón, manzana verde y flores blancas.	2	t	\N
5	Tabi Natural	Arbeláez, Cundinamarca	Tabi	Natural	1700 msnm	10000	4	6	8	7	4	Proceso natural que resalta el cuerpo y dulzor. Notas de chocolate, ciruela y caramelo.	2	t	\N
6	Geisha Sumapaz	Fusagasugá, Cundinamarca	Geisha	Lavado	1850 msnm	12000	6	9	5	8	3	Café de especialidad con notas florales de jazmín, durazno y té blanco. Acidez brillante.	1	t	\N
7	Pink Bourbon	Arbeláez, Cundinamarca	Pink Bourbon	Honey	1780 msnm	13000	5	8	6	9	2	Variedad rara con notas a fresa, rosa y frutas tropicales. Dulzor excepcional.	2	t	\N
8	Sidra Natural	Silvania, Cundinamarca	Sidra	Natural	1900 msnm	14000	7	7	7	8	4	Fermentación extendida con notas a vino tinto, ciruela y especias. Complejo y elegante.	3	t	\N
9	Wush Wush	Pasca, Cundinamarca	Wush Wush	Lavado	1950 msnm	15000	5	9	4	9	2	Variedad etíope adaptada al Sumapaz. Notas de bergamota, flores blancas y miel de abeja.	1	t	\N
10	Maragogipe	Fusagasugá, Cundinamarca	Maragogipe	Honey	1650 msnm	11000	7	6	8	7	5	El gigante del café. Notas a panela, nuez y chocolate con leche. Cuerpo excepcional.	2	t	\N
1	Café Valentina	Fusagasugá, Cundinamarca	Caturra	Lavado	1600 msnm	8500	1	3	5	10	8	Café de familia con notas de caramelo, durazno y almendra. Acidez suave y final dulce.	1	t	\N
11	cafe pedro	Qui ut officiis aspe	Vitae asperiores dol	Anaeróbico	15	94	9	9	10	9	10	Do incididunt ea dol	\N	t	\N
\.


--
-- Data for Name: cafeteria_baristas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cafeteria_baristas (id, cafeteria_id, barista_id, activo, creado_en) FROM stdin;
6	2	11	t	2026-03-25 22:19:36.281043
8	1	2	t	2026-03-26 09:19:45.671796
\.


--
-- Data for Name: cafeteria_menu; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cafeteria_menu (id, cafeteria_id, cafe_id, precio, disponible, stock, creado_en) FROM stdin;
2	2	1	2000	t	300	2026-03-25 22:20:15.109412
3	1	5	10000	t	2	2026-03-25 22:23:54.484958
4	3	3	\N	t	0	2026-05-12 19:48:14.980669
1	1	1	20000	t	0	2026-03-25 15:23:50.406991
\.


--
-- Data for Name: cafeterias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cafeterias (id, nombre, ubicacion, descripcion, direccion, telefono, logo_url, dueno_id, activa, qr_token, creado_en, latitud, longitud) FROM stdin;
1	Rico Cafe	Fusagasuga cundinamarca	la mas rica	Cr 9 #1A-11	3204398130	\N	9	t	cafeteria-1774470207756-tmw4d1	2026-03-25 15:23:27.798375	4.3371000	-74.3647000
2	cafe bru	Fusagasuga cundinamarca	Es unica en fusagasuga	cr6 #1A-24	324421722	\N	12	t	cafeteria-1774495159000-7j2wz3	2026-03-25 22:19:19.042088	4.3412320	-74.3616260
3	In ratione aspernatu	Fusagasuga cundinamarca	\N	Cr 9 #1A-11	3204398130	\N	13	t	cafeteria-1778633278657-tponcq	2026-05-12 19:47:58.692366	\N	\N
4	Hacienda Coloma	Tibacuy, Cundinamarca	Cafetería semilla — Origen y Taza JV	Av. Las Palmas, Tibacuy, La Serena	\N	\N	14	t	otj-hacienda-coloma-mp4v8d72	2026-05-13 21:24:51.663864	4.3280000	-74.4770000
5	Tayrona Café	Fusagasugá	Cafetería semilla — Origen y Taza JV	Calle 7 #7-15	\N	\N	14	t	otj-tayrona-caf--mp4v8d7a	2026-05-13 21:24:51.671475	4.3371000	-74.3638000
6	Cundinamarca Café	Fusagasugá	Cafetería semilla — Origen y Taza JV	Calle 8a #23-45	\N	\N	14	t	otj-cundinamarca-caf--mp4v8d7c	2026-05-13 21:24:51.673245	4.3365000	-74.3645000
7	El Maná Coffee and Brunch	Fusagasugá	Cafetería semilla — Origen y Taza JV	Carrera 6 #9-48	\N	\N	14	t	otj-el-man-coffee-and-brunch-mp4v8d7f	2026-05-13 21:24:51.676584	4.3358000	-74.3629000
8	Café Rojas + Bar	Fusagasugá	Cafetería semilla — Origen y Taza JV	Carrera 6 #11-15	\N	\N	14	t	otj-caf-rojas-bar-mp4v8d7h	2026-05-13 21:24:51.678055	4.3352000	-74.3632000
9	La Ramona Restaurante & Cafe	Fusagasugá	Cafetería semilla — Origen y Taza JV	Calle 6 #4-38	\N	\N	14	t	otj-la-ramona-restaurante-cafe-mp4v8d7i	2026-05-13 21:24:51.679359	4.3360000	-74.3620000
10	Aroma de Café	Fusagasugá	Cafetería semilla — Origen y Taza JV	Carrera 6 #6-39	\N	\N	14	t	otj-aroma-de-caf--mp4v8d7j	2026-05-13 21:24:51.680703	4.3346000	-74.3636000
11	Café de la Colina	Fusagasugá	Cafetería semilla — Origen y Taza JV	Carrera 6 #17-25	\N	\N	14	t	otj-caf-de-la-colina-mp4v8d7l	2026-05-13 21:24:51.681883	4.3339000	-74.3640000
\.


--
-- Data for Name: caficultor_cafes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.caficultor_cafes (id, caficultor_id, cafe_id, fecha_vinculacion) FROM stdin;
4	8	11	2026-03-18 09:18:08.124488
7	4	1	2026-05-13 21:27:45.566105
8	4	2	2026-05-16 13:53:13.338365
9	4	4	2026-05-16 13:53:16.508834
\.


--
-- Data for Name: cataciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cataciones (id, cafe_id, catador_id, acidez, cuerpo, dulzor, amargor, intensidad, aroma, balance, puntaje_total, notas, descriptores, metodo_catacion, fecha, creado_en) FROM stdin;
1	1	7	3	5	10	8	1	8	7	6.0	el mas delicioso	Vainilla,Chocolate,Nuez	Sin especificar	2026-03-15	2026-03-15 11:43:24.913865
2	11	7	9	10	9	10	9	9	9	9.3	Excelente 	Jazmín,Durazno	Sin especificar	2026-03-18	2026-03-18 09:22:25.627577
\.


--
-- Data for Name: fincas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fincas (id, nombre, ubicacion, altitud, propietario_id, descripcion) FROM stdin;
1	Finca El Paraíso	Fusagasugá, Cundinamarca	1850 msnm	4	Finca familiar con tradición cafetera de 3 generaciones.
2	Finca La Esperanza	Arbeláez, Cundinamarca	1700 msnm	4	Especializada en procesos naturales y honey.
3	Finca Los Nevados	Silvania, Cundinamarca	1600 msnm	4	Café de altura con vista al Sumapaz.
\.


--
-- Data for Name: historia_cafe; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.historia_cafe (id, cafe_id, caficultor_id, texto, audio_base64, audio_tipo, creado_en) FROM stdin;
1	4	4	probiene del monte	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	audio/webm	2026-03-15 11:08:33.854648
2	11	8	Excelente cafe	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	audio/webm	2026-03-18 09:19:40.610306
3	1	4	todo lo lindo	\N	audio/webm	2026-03-25 22:00:52.844834
\.


--
-- Data for Name: otj_degustacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.otj_degustacion (id, qr_vaso_token, aroma, sabor, acidez, cuerpo, retrogusto, creado_en) FROM stdin;
1	vaso-1778712071332-9qvsuj	6	6	5	5	5	2026-05-16 13:48:28.864032-05
2	vaso-1778711987522-4vdjxy	9	8	7	5	5	2026-05-16 13:54:28.550203-05
3	vaso-1779030029495-7vpnr1	8	6	8	5	5	2026-05-17 10:01:49.58647-05
4	vaso-1779152943177-z71zc4	5	5	5	5	5	2026-05-18 20:13:33.528661-05
\.


--
-- Data for Name: pedidos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pedidos (id, cliente_id, cafe_id, mesa, metodo, estado, creado_en) FROM stdin;
1	1	3	App	V60	pendiente	2026-03-15 12:39:03.758834
2	1	1	App	V60	pendiente	2026-03-25 16:21:48.574214
3	1	2	App	V60	pendiente	2026-03-25 16:47:04.986412
4	1	2	App	V60	pendiente	2026-03-25 16:48:38.01984
5	1	1	App	V60	pendiente	2026-03-25 17:36:20.191422
6	1	1	App	V60	pendiente	2026-03-25 22:30:24.735205
7	1	1	App	V60	pendiente	2026-05-12 19:49:14.383331
8	1	1	App	V60	pendiente	2026-05-16 13:47:46.869345
9	1	1	App	V60	pendiente	2026-05-16 13:52:43.991412
\.


--
-- Data for Name: pedidos_cafeteria; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pedidos_cafeteria (id, cafeteria_id, cafe_id, barista_id, cliente_nombre, cliente_id, tipo_preparacion, observaciones, estado, qr_vaso_token, creado_en) FROM stdin;
1	1	1	11	Cliente Demo	1	Espresso	Sin azucar con extra crema 	entregado	vaso-1774493727565-refd2t	2026-03-25 21:55:27.566195
2	1	1	11	Cliente Demo	1	Aeropress	\N	pendiente	vaso-1774495800282-6q28ve	2026-03-25 22:30:00.282824
3	1	1	11	Cliente Demo	1	Espresso	\N	pendiente	vaso-1774496080176-4si0xk	2026-03-25 22:34:40.177229
4	1	1	11	Cliente Demo	1	Filtrado	doble azucar	pendiente	vaso-1774496546626-twj4rl	2026-03-25 22:42:26.628441
5	1	1	11	Cliente Demo	1	Espresso	\N	pendiente	vaso-1774533634566-o18blc	2026-03-26 09:00:34.567593
6	1	1	11	Cliente Demo	1	Cold Brew	\N	pendiente	vaso-1774533681263-esqhtv	2026-03-26 09:01:21.264673
7	1	3	2	Cliente Demo	1	Americano	\N	pendiente	vaso-1774536378090-6egbb3	2026-03-26 09:46:18.092319
8	1	1	2	Cliente Demo	1	Espresso	sin aszucar	pendiente	vaso-1774536394100-rvwimv	2026-03-26 09:46:34.101462
10	1	3	2	Cliente Demo	1	Espresso	\N	entregado	vaso-1778712071332-9qvsuj	2026-05-13 17:41:11.334248
9	1	1	2	Cliente Demo	1	Espresso	no azucar extra cargao	entregado	vaso-1778711987522-4vdjxy	2026-05-13 17:39:47.523558
11	1	1	2	Cliente Demo	1	Espresso	\N	entregado	vaso-1779030029495-7vpnr1	2026-05-17 10:00:29.496795
12	2	2	11	Cliente Demo	1	Espresso	\N	pendiente	vaso-1779152830068-qqwffm	2026-05-18 20:07:10.070084
13	2	2	11	Cliente Demo	1	Prensa francesa	\N	pendiente	vaso-1779152943177-z71zc4	2026-05-18 20:09:03.178564
\.


--
-- Data for Name: preparaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.preparaciones (id, cafe_id, caficultor_id, metodo, temperatura, molienda, dosis_gr, agua_ml, tiempo, notas, creado_en) FROM stdin;
1	4	4	V60	92	media	15.0	250	3:30	\N	2026-03-15 11:08:14.575687
2	1	4	V60	92	media	12.0	232	333	ricorico	2026-03-25 22:01:11.175688
\.


--
-- Data for Name: proceso_productivo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proceso_productivo (id, cafe_id, caficultor_id, etapa, fecha, descripcion, observaciones, variedad, num_plantas, altitud_siembra, tipo_suelo, sistema_siembra, tipo_cosecha, kg_recolectados, num_recolectores, dias_cosecha, brix_promedio, proceso_beneficio, horas_fermentacion, ph_fermentacion, agua_usada_litros, metodo_secado, dias_secado, humedad_inicial, humedad_final, temperatura_promedio, perfil_tueste, temperatura_tueste, tiempo_tueste_min, perdida_peso_pct, tipo_empaque, peso_empaque_gr, num_unidades, fecha_vencimiento, certificacion, completada, creado_en) FROM stdin;
1	4	4	siembra	2026-03-15	\N	\N	caturra	1500	1800	franco	Agroforestal	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	2026-03-15 09:30:50.907355
2	4	4	cosecha	2026-03-15	\N	\N	\N	\N	\N	\N	\N	mecanica	56.00	2	2	22.0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	2026-03-15 11:06:46.888842
3	11	8	siembra	1994-07-01	Consequatur Sequi q	Eaque nisi voluptate	Aliquam quos similiq	44	Tenetur provident a	Fuga Adipisicing mo	Quis hic reprehender	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	2026-03-18 09:24:25.461272
4	11	8	cosecha	2024-06-05	Nisi ex quos incidid	Quia obcaecati venia	\N	\N	\N	\N	\N	por_bandeo	68.00	19	48	28.0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	2026-03-18 09:24:58.681863
5	11	8	beneficio	1989-08-15	Consectetur dolorem 	In debitis inventore	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	natural	95	73.0	86.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	2026-03-18 09:25:18.152195
6	11	8	secado	2009-11-15	Qui tenetur est ali	Dolorem consequat Q	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	camas_africanas	2	40.0	83.0	59.0	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	2026-03-18 09:25:28.649697
7	11	8	tostion	1976-11-01	Et esse suscipit bl	Eveniet id aliqua	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	claro	45.0	84	24.0	\N	\N	\N	\N	\N	t	2026-03-18 09:25:44.821558
8	11	8	empaque	1978-01-20	Enim dolores eligend	Porro laboriosam ne	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Dignissimos quae vol	47	30	1975-01-18	Et at possimus nequ	t	2026-03-18 09:26:01.756059
9	11	8	empaque	2022-07-07	Illo velit sapiente 	Et necessitatibus la	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Ex ab aut maiores om	16	5	1995-06-28	Qui quo voluptatem a	t	2026-03-18 09:27:06.644533
10	1	4	siembra	2026-03-26	\N	\N	caturra	12222	11222	franco	Agroforestal	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	2026-03-25 22:01:47.992606
11	1	4	cosecha	2026-03-26	\N	\N	\N	\N	\N	\N	\N	manual_selectiva	1232.00	123	123	123.0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	2026-03-25 22:01:59.786537
\.


--
-- Data for Name: trazabilidad; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trazabilidad (id, cafe_id, etapa, fecha, descripcion, icono, completada, orden) FROM stdin;
3	1	Despulpado	2023-10-05	Despulpado manual el mismo día de cosecha para garantizar frescura y evitar fermentaciones no controladas en el fruto.	⚙️	t	3
4	1	Fermentación	2023-10-06	Fermentación en tanque plástico durante 30 horas. Proceso controlado con medición de pH para obtener taza equilibrada y limpia.	🧪	t	4
5	1	Secado	2023-10-07	Secado en marquesina durante 14 días con volteo cada 3 horas. Humedad final controlada al 11% para conservación óptima.	☀️	t	5
6	1	Tostión	2023-11-20	Tostión media a 200°C en perfil de 12 minutos. Desarrollo equilibrado para resaltar dulzor natural y acidez moderada.	🔥	t	6
7	1	Taza	2023-11-25	Preparación recomendada: Goteo con 16g, 260ml a 92°C. Notas de caramelo, durazno y almendra con acidez suave y final dulce.	☕	t	7
8	2	Siembra	2022-11-20	Variedad Castillo sembrada en lotes renovados de la Finca Los Nevados, Silvania. Altitud 1750 msnm con microclima privilegiado de niebla matutina.	🌱	t	1
9	2	Cosecha	2023-09-18	Cosecha manual selectiva. Castillo presenta maduración uniforme permitiendo recolección eficiente con alta densidad de frutos maduros.	🍒	t	2
10	2	Despulpado	2023-09-18	Despulpado parcial para proceso Honey. Se retira la cáscara pero se conserva entre el 30-50% de la mucílago adherida al pergamino del grano.	⚙️	t	3
11	2	Fermentación	2023-09-19	La mucílago residual fermenta lentamente durante el secado aportando azúcares complejos. Proceso controlado para desarrollar notas a naranja y panela.	🧪	t	4
12	2	Secado	2023-09-19	Secado Honey en camas elevadas durante 18 días. Mayor cuidado en volteo para evitar pegado de granos por la mucílago. Humedad final 11.2%.	☀️	t	5
13	2	Tostión	2023-11-10	Tostión media a 199°C en 11.5 minutos. Desarrollo del 23% para resaltar el equilibrio entre acidez, dulzor y notas del proceso Honey.	🔥	t	6
14	2	Taza	2023-11-18	Preparación recomendada: Chemex con 20g, 320ml a 93°C, molienda media. Notas de naranja, panela y vainilla con acidez suave y dulzor prolongado.	☕	t	7
15	3	Siembra	2022-08-10	Variedad Borbón en lotes de alta pendiente en Pasca a 1900 msnm. El frío extremo ralentiza maduración concentrando azúcares en el grano.	🌱	t	1
16	3	Cosecha	2023-08-25	Cosecha en múltiples pases por terreno pendiente. Borbón presenta maduración escalonada requiriendo mano de obra especializada.	🍒	t	2
17	3	Despulpado	2023-08-25	Despulpado mecánico el día de cosecha. Proceso lavado estricto para taza limpia que exprese el terroir de alta montaña de Pasca.	⚙️	t	3
18	3	Fermentación	2023-08-26	Fermentación 48 horas en tanques de madera bajo agua. Tiempo extendido aporta complejidad y notas a cacao y frutos secos.	🧪	t	4
19	3	Secado	2023-08-28	Secado en patio de cemento 15 días con control de temperatura. Técnica tradicional perfeccionada por Rodrigo Vargas en 30 años.	☀️	t	5
20	3	Tostión	2023-10-20	Tostión media-oscura a 205°C en 13 minutos. Desarrollo del 26% para potenciar cuerpo y notas a cacao amargo y nuez tostada.	🔥	t	6
21	3	Taza	2023-10-28	Preparación recomendada: Espresso 18g en 36 segundos. Notas de cacao amargo, nuez tostada y tabaco. Ideal para cappuccino.	☕	t	7
24	4	Despulpado	2023-10-08	Despulpado en ecopulpador de bajo consumo. Sistema de recirculación de agua para reducir impacto ambiental del beneficio húmedo.	⚙️	t	3
25	4	Fermentación	2023-10-09	Fermentación corta de 24 horas en tanques plásticos. Tiempo reducido preserva acidez brillante y notas cítricas del Caturra.	🧪	t	4
26	4	Secado	2023-10-10	Secado en marquesina 12 días con ventilación controlada. Protección de lluvias garantiza uniformidad en el proceso de secado.	☀️	t	5
27	4	Tostión	2023-11-28	Tostión clara a 194°C en 10 minutos. Desarrollo del 20% para preservar acidez brillante y frescura característica del Caturra.	🔥	t	6
28	4	Taza	2023-12-05	Preparación recomendada: Aeropress 15g, 200ml a 88°C, 2 minutos. Notas de limón, manzana verde y flores blancas con cuerpo ligero.	☕	t	7
29	5	Siembra	2023-02-10	Tabi Natural sembrado en Finca La Esperanza, Arbeláez a 1700 msnm. Variedad colombiana resistente con potencial excepcional en proceso natural.	🌱	t	1
30	5	Cosecha	2023-10-15	Cosecha manual selectiva. Frutos Tabi más grandes que otras variedades facilitan selección visual en campo por su tamaño distintivo.	🍒	t	2
31	5	Despulpado	2023-10-15	Proceso natural omite despulpado. Frutos enteros van directamente a camas de secado con toda la pulpa intacta para máxima concentración.	⚙️	t	3
32	5	Fermentación	2023-10-16	Fermentación aeróbica dentro del fruto durante secado. Azúcares de la pulpa migran al grano generando notas a chocolate y frutas maduras.	🧪	t	4
33	5	Secado	2023-10-16	Secado natural 28 días en camas africanas. Volteo constante para evitar sobre-fermentación. Humedad final controlada al 10.5%.	☀️	t	5
34	5	Tostión	2023-12-05	Tostión media a 201°C en 12 minutos. Desarrollo del 24% para equilibrar dulzura natural con notas achocolatadas del proceso natural.	🔥	t	6
35	5	Taza	2023-12-12	Preparación recomendada: Prensa francesa 18g, 300ml a 92°C. Notas de chocolate oscuro, ciruela madura y caramelo con cuerpo pleno.	☕	t	7
36	6	Siembra	2023-03-15	Semillas de variedad Geisha seleccionadas y sembradas en almácigo bajo sombra controlada a 1850 msnm en la Finca El Paraíso, Fusagasugá.	🌱	t	1
37	6	Cosecha	2023-11-20	Cosecha manual selectiva de cerezas en su punto óptimo de maduración. Se recolectaron únicamente frutos rojos completamente maduros.	🍒	t	2
38	6	Despulpado	2023-11-21	Despulpado en seco dentro de las primeras 12 horas post-cosecha para preservar la integridad del grano y evitar fermentaciones no deseadas.	⚙️	t	3
39	6	Fermentación	2023-11-22	Fermentación controlada en tanques de concreto durante 36 horas. Temperatura monitoreada entre 18-22°C para desarrollar el perfil floral característico.	🧪	t	4
40	6	Secado	2023-11-25	Secado en camas africanas elevadas durante 21 días bajo luz solar directa. Volteo manual cada 4 horas para secado uniforme al 11% de humedad.	☀️	t	5
23	4	Cosecha	2026-03-15	Cosecha completada	🍒	t	2
2	1	Cosecha	2026-03-26	Cosecha completada	🍒	t	2
1	1	Siembra	2026-03-26	Siembra completada	🌱	t	1
41	6	Tostión	2024-01-10	Tostión media-clara en perfil de 11 minutos a 198°C. Desarrollo del 22% del tiempo total para resaltar notas florales y acidez brillante característica de la Geisha.	🔥	t	6
42	6	Taza	2024-01-15	Preparación recomendada: V60 con 15g de café, 250ml a 93°C, molienda media-fina. Notas de jazmín, durazno y té blanco con acidez cítrica brillante.	☕	t	7
43	7	Siembra	2023-04-20	Pink Bourbon sembrado en Finca La Esperanza, Arbeláez a 1780 msnm. Variedad de alta rareza con características genéticas únicas entre rojo y amarillo.	🌱	t	1
44	7	Cosecha	2024-01-10	Cosecha manual de cerezas rosadas en maduración perfecta. Color rosado distintivo facilita identificación del punto óptimo de recolección.	🍒	t	2
45	7	Despulpado	2024-01-10	Despulpado parcial Honey preservando mucílago rosada rica en azúcares frutales que aportarán notas a fresa y frutas tropicales en taza.	⚙️	t	3
46	7	Fermentación	2024-01-11	Fermentación controlada 40 horas en ambiente frío. La mucílago rosada aporta complejidad excepcional y notas a rosa y fruta de la pasión.	🧪	t	4
47	7	Secado	2024-01-12	Secado lento 22 días en camas elevadas con sombra parcial. Proceso delicado que preserva los azúcares complejos del Pink Bourbon.	☀️	t	5
48	7	Tostión	2024-02-20	Tostión clara a 192°C en 10.5 minutos. Perfil delicado que preserva la complejidad frutal y floral única del Pink Bourbon.	🔥	t	6
49	7	Taza	2024-02-28	Preparación recomendada: Kalita Wave 14g, 230ml a 91°C. Notas de fresa, rosa y frutas tropicales con dulzor excepcional y cuerpo sedoso.	☕	t	7
50	8	Siembra	2022-09-05	Sidra Natural en Finca Los Nevados, Silvania a 1900 msnm. Variedad colombiana de reciente desarrollo con potencial extraordinario en proceso natural.	🌱	t	1
51	8	Cosecha	2023-07-20	Cosecha selectiva de cerezas Sidra en maduración completa. Frutos de color rojo intenso con aroma pre-cosecha a frutas fermentadas.	🍒	t	2
52	8	Despulpado	2023-07-20	Proceso natural integral. Sin despulpado para maximizar transferencia de azúcares y compuestos aromáticos de la pulpa al grano durante secado.	⚙️	t	3
53	8	Fermentación	2023-07-21	Fermentación natural extendida 35 días con monitoreo diario. Desarrolla perfil complejo a vino tinto, ciruela y especias orientales.	🧪	t	4
54	8	Secado	2023-07-21	Secado natural en camas africanas bajo sombra controlada. Proceso lento que concentra compuestos aromáticos y genera cuerpo vínico excepcional.	☀️	t	5
55	8	Tostión	2023-09-15	Tostión media a 200°C en 12 minutos. Perfil diseñado para resaltar complejidad vínica sin perder la elegancia floral del Sidra Natural.	🔥	t	6
56	8	Taza	2023-09-22	Preparación recomendada: Sifón con 16g, 240ml a 90°C. Notas de vino tinto, ciruela y especias con elegancia extraordinaria y final interminable.	☕	t	7
57	9	Siembra	2022-10-15	Wush Wush etíope adaptado al Sumapaz en Pasca a 1950 msnm. Mayor altitud de producción de la red garantiza desarrollo lentísimo del grano.	🌱	t	1
58	9	Cosecha	2023-09-10	Cosecha manual en altitud extrema. Frutos Wush Wush pequeños y aromáticos con intenso perfume floral detectable desde metros de distancia.	🍒	t	2
59	9	Despulpado	2023-09-10	Despulpado cuidadoso el día de cosecha. Proceso lavado para obtener taza de máxima limpieza que exprese la pureza floral de la variedad.	⚙️	t	3
60	9	Fermentación	2023-09-11	Fermentación en agua fría de montaña durante 42 horas. Temperatura baja produce fermentación lenta que desarrolla notas florales extraordinarias.	🧪	t	4
61	9	Secado	2023-09-13	Secado en camas africanas a 1950 msnm durante 25 días. El viento frío de la montaña genera secado lento y uniforme de calidad excepcional.	☀️	t	5
62	9	Tostión	2023-10-30	Tostión muy clara a 190°C en 9.5 minutos. Perfil ultraligero para preservar la pureza floral y notas de bergamota únicas del Wush Wush.	🔥	t	6
63	9	Taza	2023-11-05	Preparación recomendada: Cold brew 20g en 350ml agua fría 18 horas. Notas de bergamota, flores blancas y miel de abeja con acidez etérea.	☕	t	7
64	10	Siembra	2023-02-28	Maragogipe sembrado en Finca La Esperanza, Fusagasugá a 1650 msnm. El gigante del café requiere mayor espacio entre plantas por tamaño excepcional del grano.	🌱	t	1
65	10	Cosecha	2023-11-15	Cosecha manual de los granos más grandes del mundo cafetero. Cada cereza Maragogipe es visiblemente mayor que cualquier otra variedad conocida.	🍒	t	2
66	10	Despulpado	2023-11-15	Despulpado Honey con retención de mucílago dorada rica en azúcares. El tamaño del grano requiere calibración especial de la despulpadora.	⚙️	t	3
67	10	Fermentación	2023-11-16	Fermentación media de 32 horas aprovechando la mucílago abundante del Maragogipe. Desarrolla notas a panela, nuez y chocolate con leche.	🧪	t	4
68	10	Secado	2023-11-17	Secado extendido 20 días por el tamaño excepcional del grano. Mayor masa requiere más tiempo para alcanzar humedad óptima del 11%.	☀️	t	5
69	10	Tostión	2024-01-05	Tostión media a 202°C en 13 minutos. El grano grande requiere más tiempo para desarrollo uniforme. Resultado: cuerpo excepcional y complejo.	🔥	t	6
70	10	Taza	2024-01-12	Preparación recomendada: Clever Dripper 22g, 350ml a 94°C, 4 minutos. Notas de panela, nuez y chocolate con leche. Cuerpo cremoso extraordinario.	☕	t	7
22	4	Siembra	2026-03-15	Siembra completada	🌱	t	1
76	11	En taza	2022-07-07	Illo velit sapiente 	☕	t	6
71	11	Siembra	1994-07-01	Consequatur Sequi q	🌱	t	1
72	11	Cosecha	2024-06-05	Nisi ex quos incidid	🍒	t	2
73	11	Procesamiento	1989-08-15	Consectetur dolorem 	⚙️	t	3
74	11	Secado	2009-11-15	Qui tenetur est ali	☀️	t	4
75	11	Tostión	1976-11-01	Et esse suscipit bl	🔥	t	5
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, email, password, rol, nombre, estado, es_super_admin, creado_en, cafeteria_id) FROM stdin;
1	cliente@cafe.co	demo1234	cliente	Cliente Demo	activo	f	2026-03-14 16:53:24.106705	\N
3	admin@cafe.co	demo1234	admin	Admin Demo	activo	t	2026-03-14 16:53:24.106705	\N
4	finca@cafe.co	demo1234	caficultor	Caficultor Demo	activo	f	2026-03-14 16:53:24.106705	\N
5	johan@gmail.com	123456	admin	Super Admin	activo	t	2025-03-14 16:53:24.106705	\N
6	vale@gmail.com	123456	admin	Super Admin	activo	t	2024-03-14 16:53:24.106705	\N
7	catador@cafe.co	demo1234	catador	Catador Demo	activo	f	2026-03-15 11:27:34.012675	\N
8	pedro@gmail.com	$2b$10$VZSUMbuRgJB/WtPsSbpiNe184lmekoXl1EIYXA.vUPlyy4QOaL.mK	caficultor	pedroluis	activo	f	2026-03-18 09:15:09.07803	\N
9	dueno@cafe.co	demo1234	dueno	Dueño Demo	activo	f	2026-03-24 18:47:00.641978	\N
12	jose@cafe.co	$2b$10$XWuKCtrwIrTg6jnOWrpKU.k2bQC6nZvWQvXZ914.inPmGLAMDPAUy	dueno_cafeteria	jose	activo	f	2026-03-25 22:11:08.211921	\N
2	barista@cafe.co	demo1234	barista	Barista Demo	activo	f	2026-03-14 16:53:24.106705	1
11	felipe@gmail.com	$2b$10$btOFL1MnUy4RRyJx1HI2B.qJX/VQDnuy/GQSpYTs3Sth5xrqlGsZ.	barista	Felipe	activo	f	2026-03-25 16:00:12.588927	\N
13	johan@cafe.co	$2b$10$G/SOI68MSjIfSEdqinuxreIHefdM8ZKjvOkA3mHuJ25PsLx7.YaGa	dueno_cafeteria	johan	activo	f	2026-03-26 09:52:46.678537	\N
14	jv.seed@origenyj.app	$2b$10$lX5DstpGFimrRzSa2YKi6OPUxopLlScWV/CE9e7/hQt/Rb16NlYwa	dueno_cafeteria	Dueño semilla Origen y Taza JV	activo	f	2026-05-13 21:24:51.649183	\N
\.


--
-- Data for Name: valoraciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.valoraciones (id, cliente_id, cafe_id, pedido_id, rating, comentario, creado_en) FROM stdin;
\.


--
-- Name: cafe_cosechas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cafe_cosechas_id_seq', 1, false);


--
-- Name: cafe_sabores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cafe_sabores_id_seq', 31, true);


--
-- Name: cafes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cafes_id_seq', 11, true);


--
-- Name: cafeteria_baristas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cafeteria_baristas_id_seq', 8, true);


--
-- Name: cafeteria_menu_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cafeteria_menu_id_seq', 4, true);


--
-- Name: cafeterias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cafeterias_id_seq', 11, true);


--
-- Name: caficultor_cafes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.caficultor_cafes_id_seq', 9, true);


--
-- Name: cataciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cataciones_id_seq', 2, true);


--
-- Name: fincas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.fincas_id_seq', 3, true);


--
-- Name: historia_cafe_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.historia_cafe_id_seq', 3, true);


--
-- Name: otj_degustacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.otj_degustacion_id_seq', 5, true);


--
-- Name: pedidos_cafeteria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pedidos_cafeteria_id_seq', 13, true);


--
-- Name: pedidos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pedidos_id_seq', 9, true);


--
-- Name: preparaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.preparaciones_id_seq', 2, true);


--
-- Name: proceso_productivo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.proceso_productivo_id_seq', 11, true);


--
-- Name: trazabilidad_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.trazabilidad_id_seq', 76, true);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 14, true);


--
-- Name: valoraciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.valoraciones_id_seq', 1, false);


--
-- Name: cafe_cosechas cafe_cosechas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cafe_cosechas
    ADD CONSTRAINT cafe_cosechas_pkey PRIMARY KEY (id);


--
-- Name: cafe_sabores cafe_sabores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cafe_sabores
    ADD CONSTRAINT cafe_sabores_pkey PRIMARY KEY (id);


--
-- Name: cafes cafes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cafes
    ADD CONSTRAINT cafes_pkey PRIMARY KEY (id);


--
-- Name: cafeteria_baristas cafeteria_baristas_cafeteria_id_barista_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cafeteria_baristas
    ADD CONSTRAINT cafeteria_baristas_cafeteria_id_barista_id_key UNIQUE (cafeteria_id, barista_id);


--
-- Name: cafeteria_baristas cafeteria_baristas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cafeteria_baristas
    ADD CONSTRAINT cafeteria_baristas_pkey PRIMARY KEY (id);


--
-- Name: cafeteria_menu cafeteria_menu_cafeteria_id_cafe_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cafeteria_menu
    ADD CONSTRAINT cafeteria_menu_cafeteria_id_cafe_id_key UNIQUE (cafeteria_id, cafe_id);


--
-- Name: cafeteria_menu cafeteria_menu_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cafeteria_menu
    ADD CONSTRAINT cafeteria_menu_pkey PRIMARY KEY (id);


--
-- Name: cafeterias cafeterias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cafeterias
    ADD CONSTRAINT cafeterias_pkey PRIMARY KEY (id);


--
-- Name: cafeterias cafeterias_qr_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cafeterias
    ADD CONSTRAINT cafeterias_qr_token_key UNIQUE (qr_token);


--
-- Name: caficultor_cafes caficultor_cafes_caficultor_id_cafe_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caficultor_cafes
    ADD CONSTRAINT caficultor_cafes_caficultor_id_cafe_id_key UNIQUE (caficultor_id, cafe_id);


--
-- Name: caficultor_cafes caficultor_cafes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caficultor_cafes
    ADD CONSTRAINT caficultor_cafes_pkey PRIMARY KEY (id);


--
-- Name: cataciones cataciones_cafe_id_catador_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cataciones
    ADD CONSTRAINT cataciones_cafe_id_catador_id_key UNIQUE (cafe_id, catador_id);


--
-- Name: cataciones cataciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cataciones
    ADD CONSTRAINT cataciones_pkey PRIMARY KEY (id);


--
-- Name: fincas fincas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fincas
    ADD CONSTRAINT fincas_pkey PRIMARY KEY (id);


--
-- Name: historia_cafe historia_cafe_cafe_id_caficultor_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historia_cafe
    ADD CONSTRAINT historia_cafe_cafe_id_caficultor_id_key UNIQUE (cafe_id, caficultor_id);


--
-- Name: historia_cafe historia_cafe_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historia_cafe
    ADD CONSTRAINT historia_cafe_pkey PRIMARY KEY (id);


--
-- Name: otj_degustacion otj_degustacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.otj_degustacion
    ADD CONSTRAINT otj_degustacion_pkey PRIMARY KEY (id);


--
-- Name: otj_degustacion otj_degustacion_qr_vaso_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.otj_degustacion
    ADD CONSTRAINT otj_degustacion_qr_vaso_token_key UNIQUE (qr_vaso_token);


--
-- Name: pedidos_cafeteria pedidos_cafeteria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos_cafeteria
    ADD CONSTRAINT pedidos_cafeteria_pkey PRIMARY KEY (id);


--
-- Name: pedidos_cafeteria pedidos_cafeteria_qr_vaso_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos_cafeteria
    ADD CONSTRAINT pedidos_cafeteria_qr_vaso_token_key UNIQUE (qr_vaso_token);


--
-- Name: pedidos pedidos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT pedidos_pkey PRIMARY KEY (id);


--
-- Name: preparaciones preparaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preparaciones
    ADD CONSTRAINT preparaciones_pkey PRIMARY KEY (id);


--
-- Name: proceso_productivo proceso_productivo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proceso_productivo
    ADD CONSTRAINT proceso_productivo_pkey PRIMARY KEY (id);


--
-- Name: trazabilidad trazabilidad_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trazabilidad
    ADD CONSTRAINT trazabilidad_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: valoraciones valoraciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.valoraciones
    ADD CONSTRAINT valoraciones_pkey PRIMARY KEY (id);


--
-- Name: cafe_cosechas cafe_cosechas_cafe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cafe_cosechas
    ADD CONSTRAINT cafe_cosechas_cafe_id_fkey FOREIGN KEY (cafe_id) REFERENCES public.cafes(id) ON DELETE CASCADE;


--
-- Name: cafe_sabores cafe_sabores_cafe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cafe_sabores
    ADD CONSTRAINT cafe_sabores_cafe_id_fkey FOREIGN KEY (cafe_id) REFERENCES public.cafes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cafes cafes_finca_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cafes
    ADD CONSTRAINT cafes_finca_id_fkey FOREIGN KEY (finca_id) REFERENCES public.fincas(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cafeteria_baristas cafeteria_baristas_barista_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cafeteria_baristas
    ADD CONSTRAINT cafeteria_baristas_barista_id_fkey FOREIGN KEY (barista_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: cafeteria_baristas cafeteria_baristas_cafeteria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cafeteria_baristas
    ADD CONSTRAINT cafeteria_baristas_cafeteria_id_fkey FOREIGN KEY (cafeteria_id) REFERENCES public.cafeterias(id) ON DELETE CASCADE;


--
-- Name: cafeteria_menu cafeteria_menu_cafe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cafeteria_menu
    ADD CONSTRAINT cafeteria_menu_cafe_id_fkey FOREIGN KEY (cafe_id) REFERENCES public.cafes(id) ON DELETE CASCADE;


--
-- Name: cafeteria_menu cafeteria_menu_cafeteria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cafeteria_menu
    ADD CONSTRAINT cafeteria_menu_cafeteria_id_fkey FOREIGN KEY (cafeteria_id) REFERENCES public.cafeterias(id) ON DELETE CASCADE;


--
-- Name: cafeterias cafeterias_dueno_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cafeterias
    ADD CONSTRAINT cafeterias_dueno_id_fkey FOREIGN KEY (dueno_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- Name: caficultor_cafes caficultor_cafes_cafe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caficultor_cafes
    ADD CONSTRAINT caficultor_cafes_cafe_id_fkey FOREIGN KEY (cafe_id) REFERENCES public.cafes(id) ON DELETE CASCADE;


--
-- Name: caficultor_cafes caficultor_cafes_caficultor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caficultor_cafes
    ADD CONSTRAINT caficultor_cafes_caficultor_id_fkey FOREIGN KEY (caficultor_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: cataciones cataciones_cafe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cataciones
    ADD CONSTRAINT cataciones_cafe_id_fkey FOREIGN KEY (cafe_id) REFERENCES public.cafes(id) ON DELETE CASCADE;


--
-- Name: cataciones cataciones_catador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cataciones
    ADD CONSTRAINT cataciones_catador_id_fkey FOREIGN KEY (catador_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: fincas fincas_propietario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fincas
    ADD CONSTRAINT fincas_propietario_id_fkey FOREIGN KEY (propietario_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cafes fk_cafes_caficultor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cafes
    ADD CONSTRAINT fk_cafes_caficultor FOREIGN KEY (caficultor_id) REFERENCES public.usuarios(id) ON DELETE RESTRICT;


--
-- Name: usuarios fk_usuarios_cafeteria; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT fk_usuarios_cafeteria FOREIGN KEY (cafeteria_id) REFERENCES public.cafeterias(id) ON DELETE SET NULL;


--
-- Name: historia_cafe historia_cafe_cafe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historia_cafe
    ADD CONSTRAINT historia_cafe_cafe_id_fkey FOREIGN KEY (cafe_id) REFERENCES public.cafes(id) ON DELETE CASCADE;


--
-- Name: historia_cafe historia_cafe_caficultor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historia_cafe
    ADD CONSTRAINT historia_cafe_caficultor_id_fkey FOREIGN KEY (caficultor_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: pedidos pedidos_cafe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT pedidos_cafe_id_fkey FOREIGN KEY (cafe_id) REFERENCES public.cafes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: pedidos_cafeteria pedidos_cafeteria_barista_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos_cafeteria
    ADD CONSTRAINT pedidos_cafeteria_barista_id_fkey FOREIGN KEY (barista_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- Name: pedidos_cafeteria pedidos_cafeteria_cafe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos_cafeteria
    ADD CONSTRAINT pedidos_cafeteria_cafe_id_fkey FOREIGN KEY (cafe_id) REFERENCES public.cafes(id) ON DELETE CASCADE;


--
-- Name: pedidos_cafeteria pedidos_cafeteria_cafeteria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos_cafeteria
    ADD CONSTRAINT pedidos_cafeteria_cafeteria_id_fkey FOREIGN KEY (cafeteria_id) REFERENCES public.cafeterias(id) ON DELETE CASCADE;


--
-- Name: pedidos_cafeteria pedidos_cafeteria_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos_cafeteria
    ADD CONSTRAINT pedidos_cafeteria_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- Name: pedidos pedidos_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT pedidos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: preparaciones preparaciones_cafe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preparaciones
    ADD CONSTRAINT preparaciones_cafe_id_fkey FOREIGN KEY (cafe_id) REFERENCES public.cafes(id) ON DELETE CASCADE;


--
-- Name: preparaciones preparaciones_caficultor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preparaciones
    ADD CONSTRAINT preparaciones_caficultor_id_fkey FOREIGN KEY (caficultor_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: proceso_productivo proceso_productivo_cafe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proceso_productivo
    ADD CONSTRAINT proceso_productivo_cafe_id_fkey FOREIGN KEY (cafe_id) REFERENCES public.cafes(id) ON DELETE CASCADE;


--
-- Name: proceso_productivo proceso_productivo_caficultor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proceso_productivo
    ADD CONSTRAINT proceso_productivo_caficultor_id_fkey FOREIGN KEY (caficultor_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: trazabilidad trazabilidad_cafe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trazabilidad
    ADD CONSTRAINT trazabilidad_cafe_id_fkey FOREIGN KEY (cafe_id) REFERENCES public.cafes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: valoraciones valoraciones_cafe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.valoraciones
    ADD CONSTRAINT valoraciones_cafe_id_fkey FOREIGN KEY (cafe_id) REFERENCES public.cafes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: valoraciones valoraciones_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.valoraciones
    ADD CONSTRAINT valoraciones_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: valoraciones valoraciones_pedido_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.valoraciones
    ADD CONSTRAINT valoraciones_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES public.pedidos(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict bsuLlM3yMUci2j3XIaxX050JYROEzdmmR0wCW9BaUjock5xAoDvDOJMMRYNbbvg

