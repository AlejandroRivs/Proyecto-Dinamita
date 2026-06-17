-- Script SQL para la creación de la tabla 'usuario' compatible con MySQL 8.0.46
-- Proyecto Dinamita - Flujo de Login Modular

CREATE DATABASE IF NOT EXISTS proyecto_dinamita;
USE proyecto_dinamita;

CREATE TABLE IF NOT EXISTS usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'lider', 'colaborador') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Semillas de prueba (Seeders) para cada rol
-- Contraseñas almacenadas de forma directa para el prototipo/pruebas
INSERT INTO usuario (nombre, email, password, rol) VALUES
('Administrador Sistema', 'admin@dinamita.com', 'admin123', 'admin'),
('Líder de Grupo', 'lider@dinamita.com', 'lider123', 'lider'),
('Colaborador Técnico', 'colaborador@dinamita.com', 'colaborador123', 'colaborador')
AS nuevo 
ON DUPLICATE KEY UPDATE 
    nombre = nuevo.nombre,
    password = nuevo.password,
    rol = nuevo.rol;
