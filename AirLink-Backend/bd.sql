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

CREATE TABLE Estado (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Nombre VARCHAR(50) NOT NULL,
);

INSERT INTO Rol (Nombre) VALUES ('Cliente'), ('Administrador');