CREATE DATABASE Airlink;
USE Airlink;

DROP TABLE Rol;

CREATE TABLE Rol (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Nombre VARCHAR(50) NOT NULL
);

CREATE TABLE Usuario (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Nombre VARCHAR(100) NOT NULL,
  Email VARCHAR(150) NOT NULL UNIQUE,
  Contrasena VARCHAR(255), -- NULL ya que ocuparemos google
  GoogleId VARCHAR(255),   -- NULL si es usuario corriente
  RolId INT NOT NULL,
  FOREIGN KEY (RolId) REFERENCES Rol(Id)
);

CREATE TABLE estado (
  idEstado INT AUTO_INCREMENT PRIMARY KEY,
  nombreEstado VARCHAR(120)
);

CREATE TABLE tipo_categoria (
  idTipoCategoria INT AUTO_INCREMENT PRIMARY KEY,
  nombreTipoCategoria VARCHAR(120)
);

CREATE TABLE usuario (
  idUsuario INT AUTO_INCREMENT PRIMARY KEY,
  nombreUsuario VARCHAR(120),
  email VARCHAR(150) UNIQUE,
  contrasena VARCHAR(255),
  rol VARCHAR(50)
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

-- Si prefieres que la tabla se llame 'equipo', usa 'CREATE TABLE equipo (...)'
-- y ajusta abajo cualquier FK que la use.

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