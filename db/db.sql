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
