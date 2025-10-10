CREATE DATABASE Airlink;
USE Airlink;

/*Drops Tables*/
DROP TABLE pasajero_asiento;
DROP TABLE equipaje;
DROP TABLE viaje_tramo;
DROP TABLE reserva_impuesto;
DROP TABLE factura;
DROP TABLE reserva_cupon;
DROP TABLE viaje_tarifa;
DROP TABLE pasajero;
DROP TABLE asiento;
DROP TABLE pago;
DROP TABLE ticket;
DROP TABLE favorito;
DROP TABLE resena;
DROP TABLE soporte_ticket;
DROP TABLE notificacion;
DROP TABLE auditoria;
DROP TABLE sesion;
DROP TABLE perfil_viajero;
DROP TABLE direccion;
DROP TABLE empresa_equipo;
DROP TABLE ruta;
DROP TABLE tarifa;
DROP TABLE cupon_descuento;
DROP TABLE impuesto;
DROP TABLE reserva;
DROP TABLE viaje;
DROP TABLE terminal;
DROP TABLE empresa;
DROP TABLE cabina_clase;
DROP TABLE usuario;
DROP TABLE rol;
DROP TABLE metodo_pago;
DROP TABLE estado;
DROP TABLE tipo_categoria;
/*Alters Tables*/

/*Creates Tables*/
CREATE TABLE estado (
  idEstado INT AUTO_INCREMENT PRIMARY KEY,
  nombreEstado VARCHAR(120)
);

CREATE TABLE tipo_categoria (
  idTipoCategoria INT AUTO_INCREMENT PRIMARY KEY,
  nombreTipoCategoria VARCHAR(120)
);

CREATE TABLE rol (
  idRol INT AUTO_INCREMENT PRIMARY KEY,
  nombreRol VARCHAR(50) UNIQUE
);

CREATE TABLE usuario (
  idUsuario INT AUTO_INCREMENT PRIMARY KEY,
  nombreUsuario VARCHAR(120),
  email VARCHAR(150) UNIQUE,
  contrasena VARCHAR(255),
  googleId VARCHAR(255),
  idRol INT,
  creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (idRol) REFERENCES rol(idRol)
);

CREATE TABLE empresa (
  idEmpresa INT AUTO_INCREMENT PRIMARY KEY,
  nombreEmpresa VARCHAR(120),
  tipoEmpresa VARCHAR(20)
);

CREATE TABLE terminal (
  idTerminal INT AUTO_INCREMENT PRIMARY KEY,
  nombreTerminal VARCHAR(120),
  ciudad VARCHAR(120),
  pais VARCHAR(120),
  codigo VARCHAR(10),
  tipo VARCHAR(20)
);

CREATE TABLE cabina_clase (
  idCabinaClase INT AUTO_INCREMENT PRIMARY KEY,
  nombreCabinaClase VARCHAR(50),
  prioridad INT
);

CREATE TABLE tarifa (
  idTarifa INT AUTO_INCREMENT PRIMARY KEY,
  codigoTarifa VARCHAR(20),
  nombreTarifa VARCHAR(100),
  idCabinaClase INT,
  equipaje_incl_kg INT,
  cambios TINYINT(1),
  reembolsable TINYINT(1),
  condiciones TEXT,
  FOREIGN KEY (idCabinaClase) REFERENCES cabina_clase(idCabinaClase)
);

CREATE TABLE empresa_equipo (
  idEquipo INT AUTO_INCREMENT PRIMARY KEY,
  idEmpresa INT,
  tipo VARCHAR(20),
  modelo VARCHAR(50),
  matricula VARCHAR(30),
  capacidad_total INT,
  FOREIGN KEY (idEmpresa) REFERENCES empresa(idEmpresa)
);

CREATE TABLE viaje (
  idViaje INT AUTO_INCREMENT PRIMARY KEY,
  fecha_salida DATETIME,
  fecha_llegada DATETIME,
  precio DECIMAL(10,2)
);

CREATE TABLE viaje_tramo (
  idViajeTramo INT AUTO_INCREMENT PRIMARY KEY,
  idViaje INT,
  orden INT,
  idTerminalSalida INT,
  idTerminalLlegada INT,
  hora_salida DATETIME,
  hora_llegada DATETIME,
  FOREIGN KEY (idViaje) REFERENCES viaje(idViaje),
  FOREIGN KEY (idTerminalSalida) REFERENCES terminal(idTerminal),
  FOREIGN KEY (idTerminalLlegada) REFERENCES terminal(idTerminal)
);

CREATE TABLE reserva (
  idReserva INT AUTO_INCREMENT PRIMARY KEY,
  idUsuario INT,
  idViaje INT,
  fecha_reserva DATETIME,
  estado VARCHAR(20),
  FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario),
  FOREIGN KEY (idViaje) REFERENCES viaje(idViaje)
);

CREATE TABLE pasajero (
  idPasajero INT AUTO_INCREMENT PRIMARY KEY,
  idReserva INT,
  nombrePasajero VARCHAR(120),
  apellidoPasajero VARCHAR(120),
  documento VARCHAR(50),
  FOREIGN KEY (idReserva) REFERENCES reserva(idReserva)
);

CREATE TABLE asiento (
  idAsiento INT AUTO_INCREMENT PRIMARY KEY,
  idViaje INT,
  numero VARCHAR(10),
  clase VARCHAR(20),
  disponible TINYINT(1),
  FOREIGN KEY (idViaje) REFERENCES viaje(idViaje)
);

CREATE TABLE pago (
  idPago INT AUTO_INCREMENT PRIMARY KEY,
  idReserva INT,
  monto DECIMAL(10,2),
  metodo VARCHAR(50),
  estado VARCHAR(20),
  fecha_pago DATETIME,
  FOREIGN KEY (idReserva) REFERENCES reserva(idReserva)
);

CREATE TABLE ticket (
  idTicket INT AUTO_INCREMENT PRIMARY KEY,
  idReserva INT,
  numero_ticket VARCHAR(50),
  emitido_en DATETIME,
  estado VARCHAR(20),
  FOREIGN KEY (idReserva) REFERENCES reserva(idReserva)
);

CREATE TABLE impuesto (
  idImpuesto INT AUTO_INCREMENT PRIMARY KEY,
  nombreImpuesto VARCHAR(120),
  codigo VARCHAR(20),
  porcentaje DECIMAL(6,3),
  fijo_monto DECIMAL(10,2),
  moneda VARCHAR(10)
);

CREATE TABLE cupon_descuento (
  idCuponDescuento INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(30) UNIQUE,
  tipo VARCHAR(20),
  valor DECIMAL(10,2),
  moneda VARCHAR(10),
  uso_max INT,
  uso_actual INT,
  vigencia_desde DATE,
  vigencia_hasta DATE,
  activo TINYINT(1)
);

CREATE TABLE pasajero_asiento (
  idPasajeroAsiento INT AUTO_INCREMENT PRIMARY KEY,
  idPasajero INT,
  idAsiento INT,
  fecha_seleccion DATETIME,
  cargo_extra DECIMAL(10,2),
  FOREIGN KEY (idPasajero) REFERENCES pasajero(idPasajero),
  FOREIGN KEY (idAsiento) REFERENCES asiento(idAsiento)
);

CREATE TABLE equipaje (
  idEquipaje INT AUTO_INCREMENT PRIMARY KEY,
  idPasajero INT,
  tipo VARCHAR(20),
  peso_kg DECIMAL(5,2),
  largo_cm INT,
  ancho_cm INT,
  alto_cm INT,
  cargo_extra DECIMAL(10,2),
  FOREIGN KEY (idPasajero) REFERENCES pasajero(idPasajero)
);



CREATE TABLE ruta (
  idRuta INT AUTO_INCREMENT PRIMARY KEY,
  idTerminalOrigen INT,
  idTerminalDestino INT,
  distanciaKm DECIMAL(7,2),
  duracionEstimadaMin INT,
  activo TINYINT(1),
  FOREIGN KEY (idTerminalOrigen) REFERENCES terminal(idTerminal),
  FOREIGN KEY (idTerminalDestino) REFERENCES terminal(idTerminal)
);

CREATE TABLE viaje_tarifa (
  idViajeTarifa INT AUTO_INCREMENT PRIMARY KEY,
  idViaje INT,
  idTarifa INT,
  precio DECIMAL(10,2),
  moneda VARCHAR(10),
  cupos INT,
  FOREIGN KEY (idViaje) REFERENCES viaje(idViaje),
  FOREIGN KEY (idTarifa) REFERENCES tarifa(idTarifa)
);

CREATE TABLE metodo_pago (
  idMetodoPago INT AUTO_INCREMENT PRIMARY KEY,
  nombreMetodoPago VARCHAR(50),
  activo TINYINT(1)
);

CREATE TABLE reserva_impuesto (
  idReservaImpuesto INT AUTO_INCREMENT PRIMARY KEY,
  idReserva INT,
  idImpuesto INT,
  monto DECIMAL(10,2),
  FOREIGN KEY (idReserva) REFERENCES reserva(idReserva),
  FOREIGN KEY (idImpuesto) REFERENCES impuesto(idImpuesto)
);

CREATE TABLE factura (
  idFactura INT AUTO_INCREMENT PRIMARY KEY,
  idReserva INT,
  numeroFactura VARCHAR(30),
  razonSocial VARCHAR(150),
  rucNif VARCHAR(30),
  direccionFiscal VARCHAR(200),
  fechaEmision DATETIME,
  moneda VARCHAR(10),
  montoTotal DECIMAL(10,2),
  pdfUrl VARCHAR(255),
  FOREIGN KEY (idReserva) REFERENCES reserva(idReserva)
);

CREATE TABLE reserva_cupon (
  idReservaCupon INT AUTO_INCREMENT PRIMARY KEY,
  idReserva INT,
  idCuponDescuento INT,
  montoAplicado DECIMAL(10,2),
  FOREIGN KEY (idReserva) REFERENCES reserva(idReserva),
  FOREIGN KEY (idCuponDescuento) REFERENCES cupon_descuento(idCuponDescuento)
);

CREATE TABLE perfil_viajero (
  idPerfilViajero INT AUTO_INCREMENT PRIMARY KEY,
  idUsuario INT,
  documento VARCHAR(50),
  nacionalidad VARCHAR(80),
  fechaNacimiento DATE,
  frecuenteCodigo VARCHAR(50),
  FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario)
);

CREATE TABLE direccion (
  idDireccion INT AUTO_INCREMENT PRIMARY KEY,
  idUsuario INT,
  linea1 VARCHAR(120),
  linea2 VARCHAR(120),
  ciudad VARCHAR(120),
  region VARCHAR(120),
  pais VARCHAR(120),
  zip VARCHAR(20),
  predeterminada TINYINT(1),
  FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario)
);

CREATE TABLE favorito (
  idFavorito INT AUTO_INCREMENT PRIMARY KEY,
  idUsuario INT,
  idRuta INT,
  alias VARCHAR(120),
  created_at DATETIME,
  FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario),
  FOREIGN KEY (idRuta) REFERENCES ruta(idRuta)
);

CREATE TABLE resena (
  idResena INT AUTO_INCREMENT PRIMARY KEY,
  idUsuario INT,
  idEmpresa INT,
  puntaje INT,
  comentario TEXT,
  created_at DATETIME,
  FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario),
  FOREIGN KEY (idEmpresa) REFERENCES empresa(idEmpresa)
);

CREATE TABLE soporte_ticket (
  idSoporteTicket INT AUTO_INCREMENT PRIMARY KEY,
  idUsuario INT,
  idReserva INT,
  asunto VARCHAR(150),
  descripcion TEXT,
  estado VARCHAR(20),
  prioridad VARCHAR(20),
  created_at DATETIME,
  FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario),
  FOREIGN KEY (idReserva) REFERENCES reserva(idReserva)
);

CREATE TABLE notificacion (
  idNotificacion INT AUTO_INCREMENT PRIMARY KEY,
  idUsuario INT,
  tipo VARCHAR(20),
  titulo VARCHAR(150),
  mensaje TEXT,
  enviado_en DATETIME,
  estado VARCHAR(20),
  FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario)
);

CREATE TABLE auditoria (
  idAuditoria INT AUTO_INCREMENT PRIMARY KEY,
  idUsuario INT,
  entidad VARCHAR(50),
  idEntidad INT,
  accion VARCHAR(20),
  cambios_json TEXT,
  created_at DATETIME,
  FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario)
);

CREATE TABLE sesion (
  idSesion INT AUTO_INCREMENT PRIMARY KEY,
  idUsuario INT,
  token VARCHAR(255),
  ip VARCHAR(45),
  user_agent VARCHAR(255),
  expira_en DATETIME,
  revocada TINYINT(1),
  FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario)
);
/*Secuence Tables*/