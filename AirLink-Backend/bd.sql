DROP DATABASE IF EXISTS Airlink;
CREATE DATABASE Airlink;
USE Airlink;

/* ==============================
   TABLAS DE CATÁLOGOS/CONFIGURACIÓN
============================== */
select * from usuario;
select * from destino;
DROP TABLE empresa;

-- Estados de pago
CREATE TABLE estado_pago (
  idEstadoPago INT AUTO_INCREMENT PRIMARY KEY,
  nombreEstadoPago VARCHAR(40) UNIQUE NOT NULL
);

-- Estados de ticket
CREATE TABLE estado_ticket (
  idEstadoTicket INT AUTO_INCREMENT PRIMARY KEY,
  nombreEstadoTicket VARCHAR(40) UNIQUE NOT NULL
);

-- Estados de notificación
CREATE TABLE estado_notificacion (
  idEstadoNotificacion INT AUTO_INCREMENT PRIMARY KEY,
  nombreEstadoNotificacion VARCHAR(40) UNIQUE NOT NULL
);

-- Tipos de notificación
CREATE TABLE tipo_notificacion (
  idTipoNotificacion INT AUTO_INCREMENT PRIMARY KEY,
  nombreTipoNotificacion VARCHAR(40) UNIQUE NOT NULL
);

-- Tipos de terminal
CREATE TABLE tipo_terminal (
  idTipoTerminal INT AUTO_INCREMENT PRIMARY KEY,
  nombreTipoTerminal VARCHAR(40) UNIQUE NOT NULL
);

-- Tipos de equipo (avión/bus)
CREATE TABLE tipo_equipo (
  idTipoEquipo INT AUTO_INCREMENT PRIMARY KEY,
  nombreTipoEquipo VARCHAR(40) UNIQUE NOT NULL
);

-- Tipos de cupón
CREATE TABLE tipo_cupon (
  idTipoCupon INT AUTO_INCREMENT PRIMARY KEY,
  nombreTipoCupon VARCHAR(40) UNIQUE NOT NULL
);

-- Estados generales
CREATE TABLE estado (
  idEstado INT AUTO_INCREMENT PRIMARY KEY,
  nombreEstado VARCHAR(120) NOT NULL
);

-- Tipos de categoría
CREATE TABLE tipo_categoria (
  idTipoCategoria INT AUTO_INCREMENT PRIMARY KEY,
  nombreTipoCategoria VARCHAR(120) NOT NULL
);

-- Roles de usuario
CREATE TABLE rol (
  idRol INT AUTO_INCREMENT PRIMARY KEY,
  nombreRol VARCHAR(50) UNIQUE NOT NULL
);

/* ==============================
   TABLAS PRINCIPALES
============================== */

-- Usuarios del sistema
CREATE TABLE usuario (
  idUsuario INT AUTO_INCREMENT PRIMARY KEY,
  nombreUsuario VARCHAR(120) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  contrasena VARCHAR(255),
  googleId VARCHAR(255),
  avatar VARCHAR(255) DEFAULT '/uploads/avatars/default-avatar.png',
  verificado BOOLEAN DEFAULT FALSE,
  idRol INT NOT NULL,
  creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultima_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (idRol) REFERENCES rol(idRol),
  INDEX idx_email (email),
  INDEX idx_googleId (googleId)
);

-- Empresas (aerolíneas, buses)
CREATE TABLE empresa (
  idEmpresa INT AUTO_INCREMENT PRIMARY KEY,
  nombreEmpresa VARCHAR(120) NOT NULL,
  tipoEmpresa VARCHAR(20) NOT NULL,
  logo VARCHAR(255),
  descripcion TEXT,
  sitio_web VARCHAR(255),
  activo TINYINT(1) DEFAULT 1,
  creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tipo (tipoEmpresa),
  INDEX idx_activo (activo)
);

-- Terminales (aeropuertos, terminales de bus)
CREATE TABLE terminal (
  idTerminal INT AUTO_INCREMENT PRIMARY KEY,
  nombreTerminal VARCHAR(120) NOT NULL,
  codigo VARCHAR(30) UNIQUE NOT NULL,
  ciudad VARCHAR(120) NOT NULL,
  imagen VARCHAR(255),
  direccion VARCHAR(255),
  latitud DECIMAL(10, 8),
  longitud DECIMAL(11, 8),
  idTipoTerminal INT NOT NULL,
  activo TINYINT(1) DEFAULT 1,
  FOREIGN KEY (idTipoTerminal) REFERENCES tipo_terminal(idTipoTerminal),
  INDEX idx_codigo (codigo),
  INDEX idx_ciudad (ciudad)
);

-- Clases de cabina
CREATE TABLE cabina_clase (
  idCabinaClase INT AUTO_INCREMENT PRIMARY KEY,
  nombreCabinaClase VARCHAR(50) NOT NULL,
  prioridad INT DEFAULT 1,
  descripcion TEXT
);

-- Tarifas
CREATE TABLE tarifa (
  idTarifa INT AUTO_INCREMENT PRIMARY KEY,
  codigoTarifa VARCHAR(20) UNIQUE NOT NULL,
  nombreTarifa VARCHAR(100) NOT NULL,
  idCabinaClase INT NOT NULL,
  equipaje_incl_kg INT DEFAULT 0,
  cambios TINYINT(1) DEFAULT 0,
  reembolsable TINYINT(1) DEFAULT 0,
  condiciones TEXT,
  activo TINYINT(1) DEFAULT 1,
  FOREIGN KEY (idCabinaClase) REFERENCES cabina_clase(idCabinaClase)
);

-- Equipos de transporte (aviones, buses)
CREATE TABLE empresa_equipo (
  idEquipo INT AUTO_INCREMENT PRIMARY KEY,
  idEmpresa INT NOT NULL,
  modelo VARCHAR(120) NOT NULL,
  matricula VARCHAR(40) UNIQUE NOT NULL,
  imagen VARCHAR(255),
  capacidad INT NOT NULL,
  idTipoEquipo INT NOT NULL,
  anio_fabricacion YEAR,
  activo TINYINT(1) DEFAULT 1,
  FOREIGN KEY (idEmpresa) REFERENCES empresa(idEmpresa),
  FOREIGN KEY (idTipoEquipo) REFERENCES tipo_equipo(idTipoEquipo),
  INDEX idx_matricula (matricula)
);

-- Rutas
CREATE TABLE ruta (
  idRuta INT AUTO_INCREMENT PRIMARY KEY,
  idTerminalOrigen INT NOT NULL,
  idTerminalDestino INT NOT NULL,
  distanciaKm DECIMAL(7,2),
  duracionEstimadaMin INT,
  activo TINYINT(1) DEFAULT 1,
  FOREIGN KEY (idTerminalOrigen) REFERENCES terminal(idTerminal),
  FOREIGN KEY (idTerminalDestino) REFERENCES terminal(idTerminal),
  INDEX idx_origen (idTerminalOrigen),
  INDEX idx_destino (idTerminalDestino)
);

-- Viajes
CREATE TABLE viaje (
  idViaje INT AUTO_INCREMENT PRIMARY KEY,
  idRuta INT NOT NULL,
  salida DATETIME NOT NULL,
  llegada DATETIME NOT NULL,
  idEquipo INT NOT NULL,
  estado VARCHAR(30) DEFAULT 'programado',
  creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (idRuta) REFERENCES ruta(idRuta),
  FOREIGN KEY (idEquipo) REFERENCES empresa_equipo(idEquipo),
  INDEX idx_salida (salida),
  INDEX idx_estado (estado)
);

-- Tramos de viaje (escalas)
CREATE TABLE viaje_tramo (
  idViajeTramo INT AUTO_INCREMENT PRIMARY KEY,
  idViaje INT NOT NULL,
  orden INT NOT NULL,
  idTerminalSalida INT NOT NULL,
  idTerminalLlegada INT NOT NULL,
  hora_salida DATETIME NOT NULL,
  hora_llegada DATETIME NOT NULL,
  FOREIGN KEY (idViaje) REFERENCES viaje(idViaje),
  FOREIGN KEY (idTerminalSalida) REFERENCES terminal(idTerminal),
  FOREIGN KEY (idTerminalLlegada) REFERENCES terminal(idTerminal),
  INDEX idx_viaje (idViaje)
);

-- Asientos
CREATE TABLE asiento (
  idAsiento INT AUTO_INCREMENT PRIMARY KEY,
  idViaje INT NOT NULL,
  numero VARCHAR(10) NOT NULL,
  idCabinaClase INT NOT NULL,
  disponible TINYINT(1) DEFAULT 1,
  FOREIGN KEY (idViaje) REFERENCES viaje(idViaje),
  FOREIGN KEY (idCabinaClase) REFERENCES cabina_clase(idCabinaClase),
  UNIQUE KEY unique_asiento_viaje (idViaje, numero),
  INDEX idx_disponible (disponible)
);

-- Reservas
CREATE TABLE reserva (
  idReserva INT AUTO_INCREMENT PRIMARY KEY,
  codigo_reserva VARCHAR(20) UNIQUE NOT NULL,
  idUsuario INT NOT NULL,
  idViaje INT NOT NULL,
  fecha_reserva DATETIME DEFAULT CURRENT_TIMESTAMP,
  idTipoCategoria INT NOT NULL,
  estado VARCHAR(30) DEFAULT 'pendiente',
  monto_total DECIMAL(10,2),
  moneda VARCHAR(10) DEFAULT 'CLP',
  FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario),
  FOREIGN KEY (idViaje) REFERENCES viaje(idViaje),
  FOREIGN KEY (idTipoCategoria) REFERENCES tipo_categoria(idTipoCategoria),
  INDEX idx_codigo (codigo_reserva),
  INDEX idx_usuario (idUsuario),
  INDEX idx_estado (estado)
);

-- Pasajeros
CREATE TABLE pasajero (
  idPasajero INT AUTO_INCREMENT PRIMARY KEY,
  idReserva INT NOT NULL,
  nombrePasajero VARCHAR(120) NOT NULL,
  apellidoPasajero VARCHAR(120) NOT NULL,
  documento VARCHAR(50) NOT NULL,
  tipo_documento VARCHAR(20) DEFAULT 'DNI',
  fecha_nacimiento DATE,
  nacionalidad VARCHAR(80),
  FOREIGN KEY (idReserva) REFERENCES reserva(idReserva),
  INDEX idx_reserva (idReserva),
  INDEX idx_documento (documento)
);

-- Asignación de asientos a pasajeros
CREATE TABLE pasajero_asiento (
  idPasajeroAsiento INT AUTO_INCREMENT PRIMARY KEY,
  idPasajero INT NOT NULL,
  idAsiento INT NOT NULL,
  fecha_seleccion DATETIME DEFAULT CURRENT_TIMESTAMP,
  cargo_extra DECIMAL(10,2) DEFAULT 0,
  FOREIGN KEY (idPasajero) REFERENCES pasajero(idPasajero),
  FOREIGN KEY (idAsiento) REFERENCES asiento(idAsiento),
  UNIQUE KEY unique_asiento_pasajero (idAsiento)
);

-- Equipaje
CREATE TABLE equipaje (
  idEquipaje INT AUTO_INCREMENT PRIMARY KEY,
  idPasajero INT NOT NULL,
  tipo VARCHAR(20) NOT NULL,
  peso_kg DECIMAL(5,2),
  largo_cm INT,
  ancho_cm INT,
  alto_cm INT,
  cargo_extra DECIMAL(10,2) DEFAULT 0,
  FOREIGN KEY (idPasajero) REFERENCES pasajero(idPasajero),
  INDEX idx_pasajero (idPasajero)
);

-- Métodos de pago
CREATE TABLE metodo_pago (
  idMetodoPago INT AUTO_INCREMENT PRIMARY KEY,
  nombreMetodoPago VARCHAR(50) NOT NULL,
  descripcion TEXT,
  activo TINYINT(1) DEFAULT 1
);

-- Pagos
CREATE TABLE pago (
  idPago INT AUTO_INCREMENT PRIMARY KEY,
  idReserva INT NOT NULL,
  idMetodoPago INT NOT NULL,
  idEstadoPago INT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  moneda VARCHAR(10) DEFAULT 'CLP',
  referencia_externa VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (idReserva) REFERENCES reserva(idReserva),
  FOREIGN KEY (idMetodoPago) REFERENCES metodo_pago(idMetodoPago),
  FOREIGN KEY (idEstadoPago) REFERENCES estado_pago(idEstadoPago),
  INDEX idx_reserva (idReserva),
  INDEX idx_estado (idEstadoPago)
);

-- Tickets
CREATE TABLE ticket (
  idTicket INT AUTO_INCREMENT PRIMARY KEY,
  idReserva INT NOT NULL,
  idEstadoTicket INT NOT NULL,
  numero_ticket VARCHAR(50) UNIQUE NOT NULL,
  codigo_qr VARCHAR(255) UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_uso TIMESTAMP NULL,
  FOREIGN KEY (idReserva) REFERENCES reserva(idReserva),
  FOREIGN KEY (idEstadoTicket) REFERENCES estado_ticket(idEstadoTicket),
  INDEX idx_numero (numero_ticket),
  INDEX idx_qr (codigo_qr)
);

-- Impuestos
CREATE TABLE impuesto (
  idImpuesto INT AUTO_INCREMENT PRIMARY KEY,
  nombreImpuesto VARCHAR(120) NOT NULL,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  porcentaje DECIMAL(6,3),
  fijo_monto DECIMAL(10,2),
  moneda VARCHAR(10) DEFAULT 'CLP',
  activo TINYINT(1) DEFAULT 1
);

-- Cupones de descuento
CREATE TABLE cupon_descuento (
  idCuponDescuento INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(40) UNIQUE NOT NULL,
  idTipoCupon INT NOT NULL,
  valor DECIMAL(12,2) NOT NULL,
  uso_maximo INT DEFAULT 1,
  uso_actual INT DEFAULT 0,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  activo TINYINT(1) DEFAULT 1,
  FOREIGN KEY (idTipoCupon) REFERENCES tipo_cupon(idTipoCupon),
  INDEX idx_codigo (codigo),
  INDEX idx_activo (activo)
);

-- Relación viaje-tarifa (precios por viaje)
CREATE TABLE viaje_tarifa (
  idViajeTarifa INT AUTO_INCREMENT PRIMARY KEY,
  idViaje INT NOT NULL,
  idTarifa INT NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  moneda VARCHAR(10) DEFAULT 'CLP',
  cupos INT NOT NULL,
  FOREIGN KEY (idViaje) REFERENCES viaje(idViaje),
  FOREIGN KEY (idTarifa) REFERENCES tarifa(idTarifa),
  INDEX idx_viaje (idViaje)
);

-- Impuestos aplicados a reservas
CREATE TABLE reserva_impuesto (
  idReservaImpuesto INT AUTO_INCREMENT PRIMARY KEY,
  idReserva INT NOT NULL,
  idImpuesto INT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (idReserva) REFERENCES reserva(idReserva),
  FOREIGN KEY (idImpuesto) REFERENCES impuesto(idImpuesto)
);

-- Facturas
CREATE TABLE factura (
  idFactura INT AUTO_INCREMENT PRIMARY KEY,
  idReserva INT NOT NULL,
  numeroFactura VARCHAR(30) UNIQUE NOT NULL,
  razonSocial VARCHAR(150),
  rucNif VARCHAR(30),
  direccionFiscal VARCHAR(200),
  fechaEmision DATETIME DEFAULT CURRENT_TIMESTAMP,
  moneda VARCHAR(10) DEFAULT 'CLP',
  montoTotal DECIMAL(10,2) NOT NULL,
  pdfUrl VARCHAR(255),
  FOREIGN KEY (idReserva) REFERENCES reserva(idReserva),
  INDEX idx_numero (numeroFactura)
);

-- Cupones aplicados a reservas
CREATE TABLE reserva_cupon (
  idReservaCupon INT AUTO_INCREMENT PRIMARY KEY,
  idReserva INT NOT NULL,
  idCuponDescuento INT NOT NULL,
  montoAplicado DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (idReserva) REFERENCES reserva(idReserva),
  FOREIGN KEY (idCuponDescuento) REFERENCES cupon_descuento(idCuponDescuento)
);

-- Perfil de viajero frecuente
CREATE TABLE perfil_viajero (
  idPerfilViajero INT AUTO_INCREMENT PRIMARY KEY,
  idUsuario INT NOT NULL,
  documento VARCHAR(50) NOT NULL,
  tipo_documento VARCHAR(20) DEFAULT 'DNI',
  nacionalidad VARCHAR(80),
  fechaNacimiento DATE,
  frecuenteCodigo VARCHAR(50),
  FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario),
  INDEX idx_usuario (idUsuario)
);

-- Direcciones de usuario
CREATE TABLE direccion (
  idDireccion INT AUTO_INCREMENT PRIMARY KEY,
  idUsuario INT NOT NULL,
  linea1 VARCHAR(120) NOT NULL,
  linea2 VARCHAR(120),
  ciudad VARCHAR(120) NOT NULL,
  region VARCHAR(120),
  pais VARCHAR(120) NOT NULL,
  zip VARCHAR(20),
  predeterminada TINYINT(1) DEFAULT 0,
  FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario),
  INDEX idx_usuario (idUsuario)
);

-- Favoritos (rutas guardadas)
CREATE TABLE favorito (
  idFavorito INT AUTO_INCREMENT PRIMARY KEY,
  idUsuario INT NOT NULL,
  idRuta INT NOT NULL,
  alias VARCHAR(120),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario),
  FOREIGN KEY (idRuta) REFERENCES ruta(idRuta),
  UNIQUE KEY unique_favorito (idUsuario, idRuta)
);

-- Reseñas de empresas
CREATE TABLE resena (
  idResena INT AUTO_INCREMENT PRIMARY KEY,
  idUsuario INT NOT NULL,
  idEmpresa INT NOT NULL,
  puntaje INT NOT NULL CHECK (puntaje BETWEEN 1 AND 5),
  comentario TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario),
  FOREIGN KEY (idEmpresa) REFERENCES empresa(idEmpresa),
  INDEX idx_empresa (idEmpresa),
  INDEX idx_puntaje (puntaje)
);

-- Tickets de soporte
CREATE TABLE soporte_ticket (
  idSoporteTicket INT AUTO_INCREMENT PRIMARY KEY,
  idUsuario INT NOT NULL,
  idReserva INT,
  asunto VARCHAR(150) NOT NULL,
  descripcion TEXT NOT NULL,
  idEstado INT NOT NULL,
  prioridad VARCHAR(20) DEFAULT 'media',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario),
  FOREIGN KEY (idReserva) REFERENCES reserva(idReserva),
  FOREIGN KEY (idEstado) REFERENCES estado(idEstado),
  INDEX idx_usuario (idUsuario),
  INDEX idx_estado (idEstado)
);

-- Notificaciones
CREATE TABLE notificacion (
  idNotificacion INT AUTO_INCREMENT PRIMARY KEY,
  idUsuario INT NOT NULL,
  idEstadoNotificacion INT NOT NULL,
  idTipoNotificacion INT NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  mensaje TEXT NOT NULL,
  leida TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario),
  FOREIGN KEY (idEstadoNotificacion) REFERENCES estado_notificacion(idEstadoNotificacion),
  FOREIGN KEY (idTipoNotificacion) REFERENCES tipo_notificacion(idTipoNotificacion),
  INDEX idx_usuario (idUsuario),
  INDEX idx_leida (leida)
);

-- Auditoría
CREATE TABLE auditoria (
  idAuditoria INT AUTO_INCREMENT PRIMARY KEY,
  idUsuario INT,
  entidad VARCHAR(50) NOT NULL,
  idEntidad INT NOT NULL,
  accion VARCHAR(20) NOT NULL,
  cambios_json TEXT,
  ip VARCHAR(45),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario),
  INDEX idx_entidad (entidad, idEntidad),
  INDEX idx_usuario (idUsuario)
);

-- Sesiones
CREATE TABLE sesion (
  idSesion INT AUTO_INCREMENT PRIMARY KEY,
  idUsuario INT NOT NULL,
  token VARCHAR(255) NOT NULL,
  refresh_token VARCHAR(255),
  ip VARCHAR(45),
  user_agent VARCHAR(255),
  expira_en DATETIME NOT NULL,
  revocada TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario),
  INDEX idx_token (token),
  INDEX idx_usuario (idUsuario)
);

-- Destinos turísticos destacados
CREATE TABLE destino (
  idDestino INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  precio DECIMAL(12,2) NOT NULL,
  ciudad VARCHAR(120) NOT NULL,
  pais VARCHAR(120) NOT NULL,
  imagen VARCHAR(255) NOT NULL,
  descripcion TEXT,
  destacado TINYINT(1) DEFAULT 0,
  activo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_destacado (destacado),
  INDEX idx_activo (activo)
);

/* ==============================
   INSERTS INICIALES
============================== */

-- Roles
INSERT INTO rol (nombreRol) VALUES 
('Cliente'),
('Usuario'),
('Administrador');

-- Estados de pago
INSERT INTO estado_pago (nombreEstadoPago) VALUES 
('Pendiente'),
('Aprobado'),
('Rechazado'),
('Reembolsado');

-- Estados de ticket
INSERT INTO estado_ticket (nombreEstadoTicket) VALUES 
('Activo'),
('Usado'),
('Cancelado'),
('Vencido');

-- Estados de notificación
INSERT INTO estado_notificacion (nombreEstadoNotificacion) VALUES 
('Enviada'),
('Leída'),
('Eliminada');

-- Tipos de notificación
INSERT INTO tipo_notificacion (nombreTipoNotificacion) VALUES 
('Confirmación de Reserva'),
('Cambio de Vuelo'),
('Recordatorio'),
('Promoción'),
('Alerta');

-- Tipos de terminal
INSERT INTO tipo_terminal (nombreTipoTerminal) VALUES 
('Aeropuerto Internacional'),
('Aeropuerto Nacional'),
('Terminal Terrestre');

-- Tipos de equipo
INSERT INTO tipo_equipo (nombreTipoEquipo) VALUES 
('Avión'),
('Bus'),
('Bus Cama');

-- Tipos de cupón
INSERT INTO tipo_cupon (nombreTipoCupon) VALUES 
('Porcentaje'),
('Monto Fijo');

-- Estados generales
INSERT INTO estado (nombreEstado) VALUES 
('Abierto'),
('En Proceso'),
('Resuelto'),
('Cerrado');

-- Tipos de categoría de reserva
INSERT INTO tipo_categoria (nombreTipoCategoria) VALUES 
('Solo Ida'),
('Ida y Vuelta'),
('Multi-destino');

-- Clases de cabina
INSERT INTO cabina_clase (nombreCabinaClase, prioridad, descripcion) VALUES 
('Económica', 3, 'Asiento estándar con servicios básicos'),
('Económica Premium', 2, 'Mayor espacio para piernas y servicios mejorados'),
('Ejecutiva', 1, 'Asientos reclinables con servicios premium');

-- Métodos de pago
INSERT INTO metodo_pago (nombreMetodoPago, descripcion) VALUES 
('Tarjeta de Crédito', 'Visa, Mastercard, American Express'),
('Tarjeta de Débito', 'Débito bancario'),
('WebPay', 'Plataforma de pagos Transbank'),
('PayPal', 'Pago mediante cuenta PayPal'),
('Transferencia', 'Transferencia bancaria');

-- Impuestos comunes
INSERT INTO impuesto (nombreImpuesto, codigo, porcentaje) VALUES 
('IVA', 'IVA', 19.000),
('Tasa Aeroportuaria', 'TAE', NULL);

-- Usuario administrador por defecto
INSERT INTO usuario (nombreUsuario, email, contrasena, idRol, verificado) VALUES 
('Administrador', 'admin@airlink.cl', '$2b$10$P0wSbdO2EIEkUGvC7wNI4.VqgwprBcOB/UbeXaLF1RgqFrDgXpema', 3, TRUE);
-- Contraseña: 123456

/* ==============================
   DATOS DE EJEMPLO
============================== */
-- Empresas con logos
INSERT INTO empresa (nombreEmpresa, tipoEmpresa, logo, descripcion) VALUES 
('LATAM Airlines', 'Aerolinea', '/uploads/empresas/latam-logo.png', 'Principal aerolínea de Latinoamérica'),
('Sky Airline', 'Aerolinea', '/uploads/empresas/sky-logo.png', 'Aerolínea low-cost chilena'),
('JetSmart', 'Aerolinea', '/uploads/empresas/jetsmart-logo.png', 'Aerolínea ultra low-cost'),
('Turbus', 'Terrestre', '/uploads/empresas/turbus-logo.png', 'Empresa de buses líder en Chile');

-- Terminales
INSERT INTO terminal (nombreTerminal, codigo, ciudad, idTipoTerminal, direccion) VALUES 
('Aeropuerto Arturo Merino Benítez', 'SCL', 'Santiago', 1, 'Av. Armando Cortínez Ote. 1704, Pudahuel'),
('Aeropuerto Diego Aracena', 'IQQ', 'Iquique', 2, 'Av. Diego Aracena 2950, Alto Hospicio'),
('Terminal Sur Santiago', 'STS', 'Santiago', 3, 'Av. Libertador Bernardo OHiggins 3850'),
('Terminal de Buses Valparaíso', 'VAL', 'Valparaíso', 3, 'Av. Pedro Montt 2800');

INSERT INTO terminal (nombreTerminal, codigo, ciudad, imagen, direccion, idTipoTerminal, activo) VALUES 
('Aeropuerto El Tepual', 'PMC', 'Puerto Montt', NULL, 'Camino al Aeropuerto s/n', 2, 1),
('Aeropuerto Alejandro Velasco Astete', 'CUZ', 'Cusco', NULL, 'Av. Velasco Astete s/n', 1, 1),
('Aeropuerto Internacional Ezeiza', 'EZE', 'Buenos Aires', NULL, 'Autopista Riccheri', 1, 1),
('Aeropuerto Internacional CDMX', 'MEX', 'Ciudad de México', NULL, 'Av. Capitán Carlos León s/n', 1, 1);

-- Destinos destacados
INSERT INTO destino (nombre, precio, ciudad, pais, imagen, descripcion, destacado) VALUES 
('Puerto Montt city', 259990, 'Puerto Montt', 'Chile', '/uploads/puertomontt.jpg',
 'Descubre la cultura chilena. Incluye vuelo + hotel 2 noches', 1),
('Machu Picchu Express', 599990, 'Cusco', 'Perú', '/uploads/lima.jpg',
 'Descubre la maravilla del mundo. Incluye vuelo + hotel 3 noches', 1),
('Coquimbo city ', 129900, 'Coquimbo', 'Chile', '/uploads/coquimbo.jpg', 
 'Playas paradisíacas y todo incluido. Vuelo + hotel 5 noches', 1),
('Buenos Aires Cultural', 239990, 'Buenos Aires', 'Argentina', '/uploads/buenos-aires.jpeg', 
 'La ciudad que nunca duerme. Vuelo + hotel 4 noches', 1),
('Patagonia', 499900, 'Ciudad de Mexico', 'Mexico', '/uploads/mexico-city.jpg', 
 'Aventura en el fin del mundo. Tour completo 7 días', 1);
 
 -- testeo mike
 
 INSERT INTO tarifa (codigoTarifa, nombreTarifa, idCabinaClase, equipaje_incl_kg, cambios, reembolsable, condiciones) VALUES 
('ECO-LIGHT', 'Económica Light', 1, 0, 0, 0, 'Sin equipaje incluido, sin cambios'),
('ECO-FULL', 'Económica Full', 1, 23, 1, 0, 'Equipaje incluido, cambios con cargo'),
('PREMIUM', 'Premium Economy', 2, 32, 1, 1, 'Equipaje premium, cambios y reembolsos'),
('EJEC', 'Ejecutiva', 3, 32, 1, 1, 'Clase ejecutiva con todos los beneficios');

-- 2. Insertamos equipos (aviones) para las empresas
INSERT INTO empresa_equipo (idEmpresa, modelo, matricula, capacidad, idTipoEquipo, anio_fabricacion) VALUES 
-- LATAM (idEmpresa = 1)
(1, 'Boeing 787-9', 'CC-BGA', 280, 1, 2018),
(1, 'Airbus A320', 'CC-BAE', 174, 1, 2019),
(1, 'Boeing 767-300', 'CC-CWZ', 252, 1, 2015),
-- Sky Airline (idEmpresa = 2)
(2, 'Airbus A320neo', 'CC-AZA', 186, 1, 2020),
(2, 'Airbus A321', 'CC-AZB', 220, 1, 2021),
-- JetSmart (idEmpresa = 3)
(3, 'Airbus A320', 'CC-AWA', 186, 1, 2019),
(3, 'Airbus A320', 'CC-AWB', 186, 1, 2020);

-- 3. Insertamos rutas entre terminales
INSERT INTO ruta (idTerminalOrigen, idTerminalDestino, distanciaKm, duracionEstimadaMin) VALUES 
-- Desde Santiago (SCL - idTerminal = 1)
(1, 2, 1850, 135),  -- SCL -> IQQ (Iquique)
(1, 5, 1015, 105),  -- SCL -> PMC (Puerto Montt)
(1, 6, 3370, 210),  -- SCL -> CUZ (Cusco)
(1, 7, 1400, 125),  -- SCL -> EZE (Buenos Aires)
(1, 8, 7010, 540),  -- SCL -> MEX (Ciudad de México)

-- Rutas de regreso
(2, 1, 1850, 135),  -- IQQ -> SCL
(5, 1, 1015, 105),  -- PMC -> SCL
(6, 1, 3370, 210),  -- CUZ -> SCL
(7, 1, 1400, 125),  -- EZE -> SCL
(8, 1, 7010, 540);  -- MEX -> SCL

-- 4. Insertamos viajes (vuelos programados) para los próximos días
-- NOTA: Ajusta las fechas según necesites

-- Vuelos Santiago -> Puerto Montt (varios por día)
INSERT INTO viaje (idRuta, salida, llegada, idEquipo, estado) VALUES 
-- Hoy y mañana
(2, '2025-11-03 08:00:00', '2025-11-03 09:45:00', 2, 'programado'),
(2, '2025-11-03 12:30:00', '2025-11-03 14:15:00', 4, 'programado'),
(2, '2025-11-03 18:00:00', '2025-11-03 19:45:00', 6, 'programado'),
(2, '2025-11-04 09:00:00', '2025-11-04 10:45:00', 2, 'programado'),
(2, '2025-11-04 15:00:00', '2025-11-04 16:45:00', 5, 'programado'),

-- Vuelos Santiago -> Iquique
(1, '2025-11-03 10:00:00', '2025-11-03 12:15:00', 1, 'programado'),
(1, '2025-11-03 16:30:00', '2025-11-03 18:45:00', 7, 'programado'),
(1, '2025-11-04 07:30:00', '2025-11-04 09:45:00', 3, 'programado'),
(1, '2025-11-04 14:00:00', '2025-11-04 16:15:00', 6, 'programado'),

-- Vuelos Santiago -> Cusco
(3, '2025-11-03 11:00:00', '2025-11-03 14:30:00', 1, 'programado'),
(3, '2025-11-04 11:00:00', '2025-11-04 14:30:00', 3, 'programado'),
(3, '2025-11-05 11:00:00', '2025-11-05 14:30:00', 1, 'programado'),

-- Vuelos Santiago -> Buenos Aires
(4, '2025-11-03 13:00:00', '2025-11-03 15:05:00', 1, 'programado'),
(4, '2025-11-03 19:00:00', '2025-11-03 21:05:00', 5, 'programado'),
(4, '2025-11-04 08:00:00', '2025-11-04 10:05:00', 3, 'programado'),
(4, '2025-11-04 16:00:00', '2025-11-04 18:05:00', 7, 'programado'),

-- Vuelos Santiago -> Ciudad de México
(5, '2025-11-03 22:00:00', '2025-11-04 07:00:00', 1, 'programado'),
(5, '2025-11-04 22:30:00', '2025-11-05 07:30:00', 3, 'programado'),

-- Vuelos de regreso Puerto Montt -> Santiago
(6, '2025-11-03 11:00:00', '2025-11-03 12:45:00', 2, 'programado'),
(6, '2025-11-03 16:00:00', '2025-11-03 17:45:00', 4, 'programado'),
(6, '2025-11-04 10:30:00', '2025-11-04 12:15:00', 6, 'programado');

-- 5. Asignamos precios (tarifas) a cada vuelo
-- Para cada viaje, insertamos diferentes opciones de tarifa

-- Viaje 1 (SCL->PMC 08:00) - idViaje = 1
INSERT INTO viaje_tarifa (idViaje, idTarifa, precio, moneda, cupos) VALUES 
(1, 1, 89990, 'CLP', 50),   -- Económica Light
(1, 2, 129990, 'CLP', 80),  -- Económica Full
(1, 3, 189990, 'CLP', 30),  -- Premium
(1, 4, 349990, 'CLP', 20);  -- Ejecutiva

-- Viaje 2 (SCL->PMC 12:30) - idViaje = 2
INSERT INTO viaje_tarifa (idViaje, idTarifa, precio, moneda, cupos) VALUES 
(2, 1, 95990, 'CLP', 50),
(2, 2, 135990, 'CLP', 80),
(2, 3, 195990, 'CLP', 30),
(2, 4, 359990, 'CLP', 20);

-- Viaje 3 (SCL->PMC 18:00) - idViaje = 3
INSERT INTO viaje_tarifa (idViaje, idTarifa, precio, moneda, cupos) VALUES 
(3, 1, 79990, 'CLP', 50),
(3, 2, 119990, 'CLP', 80),
(3, 3, 179990, 'CLP', 30),
(3, 4, 339990, 'CLP', 20);

-- Viaje 4 (SCL->PMC siguiente día 09:00) - idViaje = 4
INSERT INTO viaje_tarifa (idViaje, idTarifa, precio, moneda, cupos) VALUES 
(4, 1, 92990, 'CLP', 50),
(4, 2, 132990, 'CLP', 80),
(4, 3, 192990, 'CLP', 30),
(4, 4, 352990, 'CLP', 20);

-- Viaje 5 (SCL->PMC 15:00) - idViaje = 5
INSERT INTO viaje_tarifa (idViaje, idTarifa, precio, moneda, cupos) VALUES 
(5, 1, 87990, 'CLP', 50),
(5, 2, 127990, 'CLP', 80),
(5, 3, 187990, 'CLP', 30),
(5, 4, 347990, 'CLP', 20);

-- Viaje 6 (SCL->IQQ 10:00) - idViaje = 6
INSERT INTO viaje_tarifa (idViaje, idTarifa, precio, moneda, cupos) VALUES 
(6, 1, 119990, 'CLP', 50),
(6, 2, 159990, 'CLP', 80),
(6, 3, 219990, 'CLP', 30),
(6, 4, 389990, 'CLP', 20);

-- Viaje 7 (SCL->IQQ 16:30) - idViaje = 7
INSERT INTO viaje_tarifa (idViaje, idTarifa, precio, moneda, cupos) VALUES 
(7, 1, 109990, 'CLP', 50),
(7, 2, 149990, 'CLP', 80),
(7, 3, 209990, 'CLP', 30),
(7, 4, 379990, 'CLP', 20);

-- Viaje 8 (SCL->IQQ siguiente día 07:30) - idViaje = 8
INSERT INTO viaje_tarifa (idViaje, idTarifa, precio, moneda, cupos) VALUES 
(8, 1, 115990, 'CLP', 50),
(8, 2, 155990, 'CLP', 80),
(8, 3, 215990, 'CLP', 30),
(8, 4, 385990, 'CLP', 20);

-- Viaje 9 (SCL->IQQ 14:00) - idViaje = 9
INSERT INTO viaje_tarifa (idViaje, idTarifa, precio, moneda, cupos) VALUES 
(9, 1, 112990, 'CLP', 50),
(9, 2, 152990, 'CLP', 80),
(9, 3, 212990, 'CLP', 30),
(9, 4, 382990, 'CLP', 20);

-- Viaje 10 (SCL->CUZ 11:00) - idViaje = 10
INSERT INTO viaje_tarifa (idViaje, idTarifa, precio, moneda, cupos) VALUES 
(10, 1, 299990, 'CLP', 50),
(10, 2, 399990, 'CLP', 80),
(10, 3, 549990, 'CLP', 30),
(10, 4, 799990, 'CLP', 20);

-- Viaje 11 (SCL->CUZ siguiente día) - idViaje = 11
INSERT INTO viaje_tarifa (idViaje, idTarifa, precio, moneda, cupos) VALUES 
(11, 1, 289990, 'CLP', 50),
(11, 2, 389990, 'CLP', 80),
(11, 3, 539990, 'CLP', 30),
(11, 4, 789990, 'CLP', 20);

-- Viaje 12 (SCL->CUZ día 5) - idViaje = 12
INSERT INTO viaje_tarifa (idViaje, idTarifa, precio, moneda, cupos) VALUES 
(12, 1, 309990, 'CLP', 50),
(12, 2, 409990, 'CLP', 80),
(12, 3, 559990, 'CLP', 30),
(12, 4, 809990, 'CLP', 20);

-- Viaje 13 (SCL->EZE 13:00) - idViaje = 13
INSERT INTO viaje_tarifa (idViaje, idTarifa, precio, moneda, cupos) VALUES 
(13, 1, 159990, 'CLP', 50),
(13, 2, 219990, 'CLP', 80),
(13, 3, 299990, 'CLP', 30),
(13, 4, 499990, 'CLP', 20);

-- Viaje 14 (SCL->EZE 19:00) - idViaje = 14
INSERT INTO viaje_tarifa (idViaje, idTarifa, precio, moneda, cupos) VALUES 
(14, 1, 149990, 'CLP', 50),
(14, 2, 209990, 'CLP', 80),
(14, 3, 289990, 'CLP', 30),
(14, 4, 489990, 'CLP', 20);

-- Viaje 15 (SCL->EZE siguiente día 08:00) - idViaje = 15
INSERT INTO viaje_tarifa (idViaje, idTarifa, precio, moneda, cupos) VALUES 
(15, 1, 165990, 'CLP', 50),
(15, 2, 225990, 'CLP', 80),
(15, 3, 305990, 'CLP', 30),
(15, 4, 505990, 'CLP', 20);

-- Viaje 16 (SCL->EZE 16:00) - idViaje = 16
INSERT INTO viaje_tarifa (idViaje, idTarifa, precio, moneda, cupos) VALUES 
(16, 1, 155990, 'CLP', 50),
(16, 2, 215990, 'CLP', 80),
(16, 3, 295990, 'CLP', 30),
(16, 4, 495990, 'CLP', 20);

-- Viaje 17 (SCL->MEX 22:00) - idViaje = 17
INSERT INTO viaje_tarifa (idViaje, idTarifa, precio, moneda, cupos) VALUES 
(17, 1, 449990, 'CLP', 50),
(17, 2, 599990, 'CLP', 80),
(17, 3, 799990, 'CLP', 30),
(17, 4, 1299990, 'CLP', 20);

-- Viaje 18 (SCL->MEX siguiente día 22:30) - idViaje = 18
INSERT INTO viaje_tarifa (idViaje, idTarifa, precio, moneda, cupos) VALUES 
(18, 1, 439990, 'CLP', 50),
(18, 2, 589990, 'CLP', 80),
(18, 3, 789990, 'CLP', 30),
(18, 4, 1289990, 'CLP', 20);

-- 6. Creamos asientos para algunos vuelos de ejemplo
-- Viaje 1: Asientos económicos
INSERT INTO asiento (idViaje, numero, idCabinaClase, disponible) VALUES 
(1, '1A', 1, 1), (1, '1B', 1, 1), (1, '1C', 1, 1),
(1, '2A', 1, 1), (1, '2B', 1, 1), (1, '2C', 1, 1),
(1, '3A', 1, 1), (1, '3B', 1, 1), (1, '3C', 1, 1),
-- Asientos premium
(1, '10A', 2, 1), (1, '10B', 2, 1), (1, '10C', 2, 1),
-- Asientos ejecutivos
(1, '20A', 3, 1), (1, '20B', 3, 1);

-- =====================================================
-- VERIFICACIÓN DE DATOS
-- =====================================================

SELECT '=== RESUMEN DE DATOS INSERTADOS ===' as '';

SELECT COUNT(*) as 'Total Rutas' FROM ruta;
SELECT COUNT(*) as 'Total Viajes' FROM viaje;
SELECT COUNT(*) as 'Total Tarifas Configuradas' FROM viaje_tarifa;
SELECT COUNT(*) as 'Total Equipos' FROM empresa_equipo;

SELECT '=== VUELOS DISPONIBLES PRÓXIMOS DÍAS ===' as '';

SELECT 
    v.idViaje,
    t_origen.codigo as Origen,
    t_destino.codigo as Destino,
    v.salida as 'Fecha Salida',
    v.llegada as 'Fecha Llegada',
    e.nombreEmpresa as Empresa,
    MIN(vt.precio) as 'Precio Desde'
FROM viaje v
JOIN ruta r ON v.idRuta = r.idRuta
JOIN terminal t_origen ON r.idTerminalOrigen = t_origen.idTerminal
JOIN terminal t_destino ON r.idTerminalDestino = t_destino.idTerminal
JOIN empresa_equipo eq ON v.idEquipo = eq.idEquipo
JOIN empresa e ON eq.idEmpresa = e.idEmpresa
JOIN viaje_tarifa vt ON v.idViaje = vt.idViaje
WHERE v.salida >= NOW()
GROUP BY v.idViaje
ORDER BY v.salida
LIMIT 20;

-- =====================================================
-- VUELOS DE VUELTA A SANTIAGO (SCL)
-- =====================================================

-- VUELOS PUERTO MONTT (PMC) -> SANTIAGO (SCL)
-- Ruta idRuta = 6 (PMC -> SCL)

INSERT INTO viaje (idRuta, salida, llegada, idEquipo, estado) VALUES 
-- Hoy (03 Nov 2025)
(6, '2025-11-03 20:00:00', '2025-11-03 21:45:00', 2, 'programado'),
(6, '2025-11-03 21:30:00', '2025-11-03 23:15:00', 5, 'programado'),

-- Mañana (04 Nov 2025)
(6, '2025-11-04 06:00:00', '2025-11-04 07:45:00', 4, 'programado'),
(6, '2025-11-04 13:00:00', '2025-11-04 14:45:00', 2, 'programado'),
(6, '2025-11-04 17:30:00', '2025-11-04 19:15:00', 6, 'programado'),
(6, '2025-11-04 20:00:00', '2025-11-04 21:45:00', 5, 'programado'),

-- Pasado mañana (05 Nov 2025)
(6, '2025-11-05 08:30:00', '2025-11-05 10:15:00', 2, 'programado'),
(6, '2025-11-05 12:00:00', '2025-11-05 13:45:00', 4, 'programado'),
(6, '2025-11-05 15:00:00', '2025-11-05 16:45:00', 6, 'programado'),
(6, '2025-11-05 19:00:00', '2025-11-05 20:45:00', 5, 'programado'),

-- 06 Nov 2025
(6, '2025-11-06 07:00:00', '2025-11-06 08:45:00', 2, 'programado'),
(6, '2025-11-06 14:00:00', '2025-11-06 15:45:00', 4, 'programado'),
(6, '2025-11-06 18:00:00', '2025-11-06 19:45:00', 6, 'programado');

-- VUELOS IQUIQUE (IQQ) -> SANTIAGO (SCL)
-- Ruta idRuta = 7 (IQQ -> SCL)

INSERT INTO viaje (idRuta, salida, llegada, idEquipo, estado) VALUES 
-- Hoy (03 Nov 2025)
(7, '2025-11-03 19:00:00', '2025-11-03 21:15:00', 1, 'programado'),
(7, '2025-11-03 22:00:00', '2025-11-04 00:15:00', 7, 'programado'),

-- Mañana (04 Nov 2025)
(7, '2025-11-04 10:00:00', '2025-11-04 12:15:00', 3, 'programado'),
(7, '2025-11-04 14:30:00', '2025-11-04 16:45:00', 6, 'programado'),
(7, '2025-11-04 18:00:00', '2025-11-04 20:15:00', 1, 'programado'),
(7, '2025-11-04 21:00:00', '2025-11-04 23:15:00', 7, 'programado'),

-- 05 Nov 2025
(7, '2025-11-05 09:00:00', '2025-11-05 11:15:00', 3, 'programado'),
(7, '2025-11-05 13:00:00', '2025-11-05 15:15:00', 1, 'programado'),
(7, '2025-11-05 17:00:00', '2025-11-05 19:15:00', 6, 'programado'),
(7, '2025-11-05 20:30:00', '2025-11-05 22:45:00', 7, 'programado'),

-- 06 Nov 2025
(7, '2025-11-06 08:00:00', '2025-11-06 10:15:00', 1, 'programado'),
(7, '2025-11-06 15:00:00', '2025-11-06 17:15:00', 3, 'programado'),
(7, '2025-11-06 19:30:00', '2025-11-06 21:45:00', 7, 'programado');

-- VUELOS CUSCO (CUZ) -> SANTIAGO (SCL)
-- Ruta idRuta = 8 (CUZ -> SCL)

INSERT INTO viaje (idRuta, salida, llegada, idEquipo, estado) VALUES 
-- 04 Nov 2025
(8, '2025-11-04 15:00:00', '2025-11-04 18:30:00', 1, 'programado'),
(8, '2025-11-04 20:00:00', '2025-11-04 23:30:00', 3, 'programado'),

-- 05 Nov 2025
(8, '2025-11-05 14:00:00', '2025-11-05 17:30:00', 1, 'programado'),
(8, '2025-11-05 19:00:00', '2025-11-05 22:30:00', 3, 'programado'),

-- 06 Nov 2025
(8, '2025-11-06 13:00:00', '2025-11-06 16:30:00', 1, 'programado'),
(8, '2025-11-06 18:00:00', '2025-11-06 21:30:00', 3, 'programado'),

-- 07 Nov 2025
(8, '2025-11-07 15:00:00', '2025-11-07 18:30:00', 1, 'programado'),
(8, '2025-11-07 20:00:00', '2025-11-07 23:30:00', 3, 'programado');

-- VUELOS BUENOS AIRES (EZE) -> SANTIAGO (SCL)
-- Ruta idRuta = 9 (EZE -> SCL)

INSERT INTO viaje (idRuta, salida, llegada, idEquipo, estado) VALUES 
-- Hoy (03 Nov 2025)
(9, '2025-11-03 16:00:00', '2025-11-03 18:05:00', 1, 'programado'),
(9, '2025-11-03 22:00:00', '2025-11-04 00:05:00', 5, 'programado'),

-- 04 Nov 2025
(9, '2025-11-04 11:00:00', '2025-11-04 13:05:00', 3, 'programado'),
(9, '2025-11-04 15:30:00', '2025-11-04 17:35:00', 7, 'programado'),
(9, '2025-11-04 19:00:00', '2025-11-04 21:05:00', 1, 'programado'),
(9, '2025-11-04 23:00:00', '2025-11-05 01:05:00', 5, 'programado'),

-- 05 Nov 2025
(9, '2025-11-05 10:00:00', '2025-11-05 12:05:00', 3, 'programado'),
(9, '2025-11-05 14:00:00', '2025-11-05 16:05:00', 1, 'programado'),
(9, '2025-11-05 18:00:00', '2025-11-05 20:05:00', 7, 'programado'),
(9, '2025-11-05 22:00:00', '2025-11-06 00:05:00', 5, 'programado'),

-- 06 Nov 2025
(9, '2025-11-06 09:00:00', '2025-11-06 11:05:00', 1, 'programado'),
(9, '2025-11-06 17:00:00', '2025-11-06 19:05:00', 3, 'programado'),
(9, '2025-11-06 21:00:00', '2025-11-06 23:05:00', 7, 'programado');

-- VUELOS CIUDAD DE MÉXICO (MEX) -> SANTIAGO (SCL)
-- Ruta idRuta = 10 (MEX -> SCL)

INSERT INTO viaje (idRuta, salida, llegada, idEquipo, estado) VALUES 
-- 05 Nov 2025
(10, '2025-11-05 09:00:00', '2025-11-05 18:00:00', 1, 'programado'),
(10, '2025-11-05 23:00:00', '2025-11-06 08:00:00', 3, 'programado'),

-- 06 Nov 2025
(10, '2025-11-06 10:00:00', '2025-11-06 19:00:00', 1, 'programado'),
(10, '2025-11-06 22:00:00', '2025-11-07 07:00:00', 3, 'programado'),

-- 07 Nov 2025
(10, '2025-11-07 09:30:00', '2025-11-07 18:30:00', 1, 'programado'),
(10, '2025-11-07 23:30:00', '2025-11-08 08:30:00', 3, 'programado');

-- =====================================================
-- ASIGNAR PRECIOS (TARIFAS) A LOS VUELOS DE VUELTA
-- =====================================================
-- Nota: Los idViaje empiezan desde el último insertado anteriormente
-- Ajusta estos números según tu base de datos

-- VUELOS PMC -> SCL (idViaje desde 19 en adelante)
-- Vuelo 19 (PMC->SCL 20:00)
INSERT INTO viaje_tarifa (idViaje, idTarifa, precio, moneda, cupos) VALUES 
(19, 1, 85990, 'CLP', 50),
(19, 2, 125990, 'CLP', 80),
(19, 3, 185990, 'CLP', 30),
(19, 4, 345990, 'CLP', 20);

-- Vuelo 20 (PMC->SCL 21:30)
INSERT INTO viaje_tarifa (idViaje, idTarifa, precio, moneda, cupos) VALUES 
(20, 1, 82990, 'CLP', 50),
(20, 2, 122990, 'CLP', 80),
(20, 3, 182990, 'CLP', 30),
(20, 4, 342990, 'CLP', 20);

-- Vuelo 21 (PMC->SCL 04 Nov 06:00)
INSERT INTO viaje_tarifa (idViaje, idTarifa, precio, moneda, cupos) VALUES 
(21, 1, 94990, 'CLP', 50),
(21, 2, 134990, 'CLP', 80),
(21, 3, 194990, 'CLP', 30),
(21, 4, 354990, 'CLP', 20);

-- Vuelo 22 (PMC->SCL 13:00)
INSERT INTO viaje_tarifa (idViaje, idTarifa, precio, moneda, cupos) VALUES 
(22, 1, 89990, 'CLP', 50),
(22, 2, 129990, 'CLP', 80),
(22, 3, 189990, 'CLP', 30),
(22, 4, 349990, 'CLP', 20);

-- Vuelo 23 (PMC->SCL 17:30)
INSERT INTO viaje_tarifa (idViaje, idTarifa, precio, moneda, cupos) VALUES 
(23, 1, 87990, 'CLP', 50),
(23, 2, 127990, 'CLP', 80),
(23, 3, 187990, 'CLP', 30),
(23, 4, 347990, 'CLP', 20);

-- Vuelo 24 (PMC->SCL 20:00)
INSERT INTO viaje_tarifa (idViaje, idTarifa, precio, moneda, cupos) VALUES 
(24, 1, 84990, 'CLP', 50),
(24, 2, 124990, 'CLP', 80),
(24, 3, 184990, 'CLP', 30),
(24, 4, 344990, 'CLP', 20);

-- Vuelos 25-30 (PMC->SCL días siguientes)
INSERT INTO viaje_tarifa (idViaje, idTarifa, precio, moneda, cupos) VALUES 
(25, 1, 91990, 'CLP', 50), (25, 2, 131990, 'CLP', 80), (25, 3, 191990, 'CLP', 30), (25, 4, 351990, 'CLP', 20),
(26, 1, 88990, 'CLP', 50), (26, 2, 128990, 'CLP', 80), (26, 3, 188990, 'CLP', 30), (26, 4, 348990, 'CLP', 20),
(27, 1, 86990, 'CLP', 50), (27, 2, 126990, 'CLP', 80), (27, 3, 186990, 'CLP', 30), (27, 4, 346990, 'CLP', 20),
(28, 1, 83990, 'CLP', 50), (28, 2, 123990, 'CLP', 80), (28, 3, 183990, 'CLP', 30), (28, 4, 343990, 'CLP', 20),
(29, 1, 92990, 'CLP', 50), (29, 2, 132990, 'CLP', 80), (29, 3, 192990, 'CLP', 30), (29, 4, 352990, 'CLP', 20),
(30, 1, 89990, 'CLP', 50), (30, 2, 129990, 'CLP', 80), (30, 3, 189990, 'CLP', 30), (30, 4, 349990, 'CLP', 20),
(31, 1, 87990, 'CLP', 50), (31, 2, 127990, 'CLP', 80), (31, 3, 187990, 'CLP', 30), (31, 4, 347990, 'CLP', 20);

-- VUELOS IQQ -> SCL (idViaje desde 32 en adelante)
INSERT INTO viaje_tarifa (idViaje, idTarifa, precio, moneda, cupos) VALUES 
(32, 1, 115990, 'CLP', 50), (32, 2, 155990, 'CLP', 80), (32, 3, 215990, 'CLP', 30), (32, 4, 385990, 'CLP', 20),
(33, 1, 109990, 'CLP', 50), (33, 2, 149990, 'CLP', 80), (33, 3, 209990, 'CLP', 30), (33, 4, 379990, 'CLP', 20),
(34, 1, 118990, 'CLP', 50), (34, 2, 158990, 'CLP', 80), (34, 3, 218990, 'CLP', 30), (34, 4, 388990, 'CLP', 20),
(35, 1, 112990, 'CLP', 50), (35, 2, 152990, 'CLP', 80), (35, 3, 212990, 'CLP', 30), (35, 4, 382990, 'CLP', 20),
(36, 1, 114990, 'CLP', 50), (36, 2, 154990, 'CLP', 80), (36, 3, 214990, 'CLP', 30), (36, 4, 384990, 'CLP', 20),
(37, 1, 110990, 'CLP', 50), (37, 2, 150990, 'CLP', 80), (37, 3, 210990, 'CLP', 30), (37, 4, 380990, 'CLP', 20),
(38, 1, 116990, 'CLP', 50), (38, 2, 156990, 'CLP', 80), (38, 3, 216990, 'CLP', 30), (38, 4, 386990, 'CLP', 20),
(39, 1, 113990, 'CLP', 50), (39, 2, 153990, 'CLP', 80), (39, 3, 213990, 'CLP', 30), (39, 4, 383990, 'CLP', 20),
(40, 1, 111990, 'CLP', 50), (40, 2, 151990, 'CLP', 80), (40, 3, 211990, 'CLP', 30), (40, 4, 381990, 'CLP', 20),
(41, 1, 108990, 'CLP', 50), (41, 2, 148990, 'CLP', 80), (41, 3, 208990, 'CLP', 30), (41, 4, 378990, 'CLP', 20),
(42, 1, 117990, 'CLP', 50), (42, 2, 157990, 'CLP', 80), (42, 3, 217990, 'CLP', 30), (42, 4, 387990, 'CLP', 20),
(43, 1, 114990, 'CLP', 50), (43, 2, 154990, 'CLP', 80), (43, 3, 214990, 'CLP', 30), (43, 4, 384990, 'CLP', 20),
(44, 1, 112990, 'CLP', 50), (44, 2, 152990, 'CLP', 80), (44, 3, 212990, 'CLP', 30), (44, 4, 382990, 'CLP', 20);

-- VUELOS CUZ -> SCL (idViaje desde 45 en adelante)
INSERT INTO viaje_tarifa (idViaje, idTarifa, precio, moneda, cupos) VALUES 
(45, 1, 295990, 'CLP', 50), (45, 2, 395990, 'CLP', 80), (45, 3, 545990, 'CLP', 30), (45, 4, 795990, 'CLP', 20),
(46, 1, 285990, 'CLP', 50), (46, 2, 385990, 'CLP', 80), (46, 3, 535990, 'CLP', 30), (46, 4, 785990, 'CLP', 20),
(47, 1, 292990, 'CLP', 50), (47, 2, 392990, 'CLP', 80), (47, 3, 542990, 'CLP', 30), (47, 4, 792990, 'CLP', 20),
(48, 1, 288990, 'CLP', 50), (48, 2, 388990, 'CLP', 80), (48, 3, 538990, 'CLP', 30), (48, 4, 788990, 'CLP', 20),
(49, 1, 305990, 'CLP', 50), (49, 2, 405990, 'CLP', 80), (49, 3, 555990, 'CLP', 30), (49, 4, 805990, 'CLP', 20),
(50, 1, 298990, 'CLP', 50), (50, 2, 398990, 'CLP', 80), (50, 3, 548990, 'CLP', 30), (50, 4, 798990, 'CLP', 20),
(51, 1, 302990, 'CLP', 50), (51, 2, 402990, 'CLP', 80), (51, 3, 552990, 'CLP', 30), (51, 4, 802990, 'CLP', 20),
(52, 1, 295990, 'CLP', 50), (52, 2, 395990, 'CLP', 80), (52, 3, 545990, 'CLP', 30), (52, 4, 795990, 'CLP', 20);

-- VUELOS EZE -> SCL (idViaje desde 53 en adelante)
INSERT INTO viaje_tarifa (idViaje, idTarifa, precio, moneda, cupos) VALUES 
(53, 1, 158990, 'CLP', 50), (53, 2, 218990, 'CLP', 80), (53, 3, 298990, 'CLP', 30), (53, 4, 498990, 'CLP', 20),
(54, 1, 152990, 'CLP', 50), (54, 2, 212990, 'CLP', 80), (54, 3, 292990, 'CLP', 30), (54, 4, 492990, 'CLP', 20),
(55, 1, 162990, 'CLP', 50), (55, 2, 222990, 'CLP', 80), (55, 3, 302990, 'CLP', 30), (55, 4, 502990, 'CLP', 20),
(56, 1, 156990, 'CLP', 50), (56, 2, 216990, 'CLP', 80), (56, 3, 296990, 'CLP', 30), (56, 4, 496990, 'CLP', 20),
(57, 1, 160990, 'CLP', 50), (57, 2, 220990, 'CLP', 80), (57, 3, 300990, 'CLP', 30), (57, 4, 500990, 'CLP', 20),
(58, 1, 154990, 'CLP', 50), (58, 2, 214990, 'CLP', 80), (58, 3, 294990, 'CLP', 30), (58, 4, 494990, 'CLP', 20),
(59, 1, 164990, 'CLP', 50), (59, 2, 224990, 'CLP', 80), (59, 3, 304990, 'CLP', 30), (59, 4, 504990, 'CLP', 20),
(60, 1, 159990, 'CLP', 50), (60, 2, 219990, 'CLP', 80), (60, 3, 299990, 'CLP', 30), (60, 4, 499990, 'CLP', 20),
(61, 1, 157990, 'CLP', 50), (61, 2, 217990, 'CLP', 80), (61, 3, 297990, 'CLP', 30), (61, 4, 497990, 'CLP', 20),
(62, 1, 155990, 'CLP', 50), (62, 2, 215990, 'CLP', 80), (62, 3, 295990, 'CLP', 30), (62, 4, 495990, 'CLP', 20),
(63, 1, 161990, 'CLP', 50), (63, 2, 221990, 'CLP', 80), (63, 3, 301990, 'CLP', 30), (63, 4, 501990, 'CLP', 20),
(64, 1, 163990, 'CLP', 50), (64, 2, 223990, 'CLP', 80), (64, 3, 303990, 'CLP', 30), (64, 4, 503990, 'CLP', 20),
(65, 1, 158990, 'CLP', 50), (65, 2, 218990, 'CLP', 80), (65, 3, 298990, 'CLP', 30), (65, 4, 498990, 'CLP', 20);

-- VUELOS MEX -> SCL (idViaje desde 66 en adelante)
INSERT INTO viaje_tarifa (idViaje, idTarifa, precio, moneda, cupos) VALUES 
(66, 1, 445990, 'CLP', 50), (66, 2, 595990, 'CLP', 80), (66, 3, 795990, 'CLP', 30), (66, 4, 1295990, 'CLP', 20),
(67, 1, 435990, 'CLP', 50), (67, 2, 585990, 'CLP', 80), (67, 3, 785990, 'CLP', 30), (67, 4, 1285990, 'CLP', 20),
(68, 1, 448990, 'CLP', 50), (68, 2, 598990, 'CLP', 80), (68, 3, 798990, 'CLP', 30), (68, 4, 1298990, 'CLP', 20),
(69, 1, 442990, 'CLP', 50), (69, 2, 592990, 'CLP', 80), (69, 3, 792990, 'CLP', 30), (69, 4, 1292990, 'CLP', 20),
(70, 1, 446990, 'CLP', 50), (70, 2, 596990, 'CLP', 80), (70, 3, 796990, 'CLP', 30), (70, 4, 1296990, 'CLP', 20),
(71, 1, 438990, 'CLP', 50), (71, 2, 588990, 'CLP', 80), (71, 3, 788990, 'CLP', 30), (71, 4, 1288990, 'CLP', 20);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

SELECT '=== VUELOS DE VUELTA A SANTIAGO AGREGADOS ===' as '';

SELECT 
    v.idViaje,
    t_origen.codigo as Origen,
    t_destino.codigo as Destino,
    DATE_FORMAT(v.salida, '%d/%m/%Y %H:%i') as 'Salida',
    DATE_FORMAT(v.llegada, '%d/%m/%Y %H:%i') as 'Llegada',
    e.nombreEmpresa as Empresa,
    MIN(vt.precio) as 'Precio Desde'
FROM viaje v
JOIN ruta r ON v.idRuta = r.idRuta
JOIN terminal t_origen ON r.idTerminalOrigen = t_origen.idTerminal
JOIN terminal t_destino ON r.idTerminalDestino = t_destino.idTerminal
JOIN empresa_equipo eq ON v.idEquipo = eq.idEquipo
JOIN empresa e ON eq.idEmpresa = e.idEmpresa
LEFT JOIN viaje_tarifa vt ON v.idViaje = vt.idViaje
WHERE t_destino.codigo = 'SCL' 
  AND v.salida >= NOW()
GROUP BY v.idViaje
ORDER BY t_origen.codigo, v.salida
LIMIT 50;