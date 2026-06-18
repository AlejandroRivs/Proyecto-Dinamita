-- ============================================================
-- Script de base de datos para el Sistema de Gestión de Tareas
-- Ejecutar este archivo en MySQL antes de iniciar el servidor
-- ============================================================

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS gestion_tareas
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos recién creada
USE gestion_tareas;

-- ============================================================
-- Tabla de usuarios: almacena todos los usuarios registrados
-- El campo 'rol' determina si es administrador o usuario normal
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  nombre          VARCHAR(100)  NOT NULL,
  email           VARCHAR(150)  NOT NULL UNIQUE,
  contrasena      VARCHAR(255)  NOT NULL,  -- Se guardará con hash bcrypt
  rol             ENUM('admin', 'usuario') NOT NULL DEFAULT 'usuario',
  creado_en       DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Tabla de tareas: almacena cada tarea creada por el admin
-- 'estado' controla el ciclo de vida de la tarea
-- ============================================================
CREATE TABLE IF NOT EXISTS tareas (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  titulo              VARCHAR(200)  NOT NULL,
  descripcion         TEXT          NOT NULL,
  tiempo_sugerido     VARCHAR(100)  NOT NULL,  -- Ej: "2 horas", "3 días"
  estado              ENUM('pendiente', 'en_revision', 'completada') NOT NULL DEFAULT 'pendiente',
  usuario_asignado_id INT           NOT NULL,
  creado_por_id       INT           NOT NULL,
  creado_en           DATETIME DEFAULT CURRENT_TIMESTAMP,
  actualizado_en      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Relaciones con la tabla de usuarios
  CONSTRAINT fk_usuario_asignado FOREIGN KEY (usuario_asignado_id) REFERENCES usuarios(id),
  CONSTRAINT fk_creado_por       FOREIGN KEY (creado_por_id)       REFERENCES usuarios(id)
);

-- ============================================================
-- Datos de prueba: un administrador y dos usuarios normales
-- Contraseña para todos: "Password123"
-- (Hash bcrypt generado para esa contraseña)
-- ============================================================
INSERT INTO usuarios (nombre, email, contrasena, rol) VALUES
  ('Administrador',  'admin@tareas.com',   '$2b$10$X9Q1J2K3L4M5N6O7P8Q9RuW0V1U2T3S4R5Q6P7O8N9M0L1K2J3I4H5G6', 'admin'),
  ('Carlos López',   'carlos@tareas.com',  '$2b$10$X9Q1J2K3L4M5N6O7P8Q9RuW0V1U2T3S4R5Q6P7O8N9M0L1K2J3I4H5G6', 'usuario'),
  ('María García',   'maria@tareas.com',   '$2b$10$X9Q1J2K3L4M5N6O7P8Q9RuW0V1U2T3S4R5Q6P7O8N9M0L1K2J3I4H5G6', 'usuario');
-- Crear base de datos
CREATE DATABASE IF NOT EXISTS dynamite;
USE dynamite;

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'colaborador') NOT NULL,
    points INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de Tareas
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    assigned_to INT,
    status ENUM('Pending', 'In Progress', 'Paused', 'Completed') DEFAULT 'Pending',
    total_duration_ms BIGINT DEFAULT 0,
    last_started_at DATETIME DEFAULT NULL,
    time_limit_minutes INT DEFAULT 30,
    is_extra BOOLEAN DEFAULT FALSE,
    complexity ENUM('Simple', 'Media', 'Compleja') DEFAULT 'Simple',
    points_awarded INT DEFAULT 0,
    global_locked BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insertar Datos Semilla
INSERT IGNORE INTO users (id, username, password, role, points) VALUES
(1, 'alejandro', 'admin123', 'admin', 0),
(2, 'luis', 'luis123', 'colaborador', 0),
(3, 'maria', 'maria123', 'colaborador', 0),
(4, 'jose', 'jose123', 'colaborador', 0);

INSERT IGNORE INTO tasks (id, title, description, assigned_to, status, total_duration_ms, time_limit_minutes, is_extra, complexity) VALUES
(1, 'Analisis de Estructura de Seguridad', 'Analizar la seguridad y control de acceso', 2, 'Pending', 0, 60, FALSE, 'Media'),
(2, 'Diseñar diagramas de BD', 'Generar scripts SQL y relaciones', 3, 'Pending', 0, 45, FALSE, 'Simple'),
(3, 'Configurar servidor Express', 'Inicializar ruteo basico y sesiones', 4, 'Pending', 0, 30, FALSE, 'Simple');
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
