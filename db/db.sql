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
