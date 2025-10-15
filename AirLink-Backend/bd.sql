-- ==============================
-- AIRLINK - BASE DE DATOS COMPLETA
-- Sistema de Reservas de Viajes (Aéreos y Terrestres)
-- Con manejo de imágenes integrado
-- ==============================

DROP DATABASE IF EXISTS Airlink;
CREATE DATABASE Airlink;
USE Airlink;

/* ==============================
   TABLAS DE CATÁLOGOS/CONFIGURACIÓN
============================== */

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

-- Destinos destacados
INSERT INTO destino (nombre, precio, ciudad, pais, imagen, descripcion, destacado) VALUES 
('Machu Picchu Express', 599990, 'Cusco', 'Perú', '/uploads/destinos/machu-picchu.jpg', 
 'Descubre la maravilla del mundo. Incluye vuelo + hotel 3 noches', 1),
('Cancún Paradise', 899990, 'Cancún', 'México', '/uploads/destinos/cancun.jpg', 
 'Playas paradisíacas y todo incluido. Vuelo + hotel 5 noches', 1),
('Buenos Aires Cultural', 399990, 'Buenos Aires', 'Argentina', '/uploads/destinos/buenos-aires.jpg', 
 'La ciudad que nunca duerme. Vuelo + hotel 4 noches', 1),
('Patagonia Explorer', 1299990, 'Punta Arenas', 'Chile', '/uploads/destinos/patagonia.jpg', 
 'Aventura en el fin del mundo. Tour completo 7 días', 1);

/* ==============================
   QUERIES ÚTILES DE CONSULTA
============================== */

-- Ver todas las empresas con sus logos
-- SELECT idEmpresa, nombreEmpresa, tipoEmpresa, logo FROM empresa WHERE activo = 1;

-- Ver destinos destacados
-- SELECT * FROM destino WHERE destacado = 1 AND activo = 1 ORDER BY precio;

-- Ver usuarios con avatar
-- SELECT idUsuario, nombreUsuario, email, avatar, verificado FROM usuario;

-- Ver tickets activos con QR
-- SELECT t.*, r.codigo_reserva, u.nombreUsuario 
-- FROM ticket t
-- JOIN reserva r ON t.idReserva = r.idReserva
-- JOIN usuario u ON r.idUsuario = u.idUsuario
-- WHERE t.idEstadoTicket = 1;

-- Búsqueda de rutas disponibles
-- SELECT r.idRuta, 
--        t1.nombreTerminal AS origen, 
--        t2.nombreTerminal AS destino,
--        r.distanciaKm, r.duracionEstimadaMin
-- FROM ruta r
-- JOIN terminal t1 ON r.idTerminalOrigen = t1.idTerminal
-- JOIN terminal t2 ON r.idTerminalDestino = t2.idTerminal
-- WHERE r.activo = 1;