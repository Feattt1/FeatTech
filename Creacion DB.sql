-- Creación de la base de datos
CREATE DATABASE IF NOT EXISTS SistemaPaqueteria;
USE SistemaPaqueteria;

-- Creación de tablas

-- Tabla Empleados
CREATE TABLE IF NOT EXISTS Empleados (
    CI INT PRIMARY KEY,
    Nombre VARCHAR(25) NOT NULL,
    Apellido VARCHAR(25) NOT NULL,
    Cargo VARCHAR(20) NOT NULL CHECK (Cargo IN ('Administrativo', 'Almacenero', 'Chofer')),
    Fecha_Contratacion DATE NOT NULL,
    Pass VARCHAR(20) NOT NULL,
    Email VARCHAR(60) UNIQUE,
    Telefono VARCHAR(9),
    Direccion VARCHAR(80),
    isDeleted BOOLEAN
);

-- Tabla Ruta
CREATE TABLE IF NOT EXISTS Ruta (
    ID_Ruta INT PRIMARY KEY,
    Origen VARCHAR(70) NOT NULL,
    Destino VARCHAR(70) NOT NULL,
    Distancia DECIMAL(10, 2) NOT NULL,
    Duracion_Estimada DECIMAL(5, 2) NOT NULL
);

-- Tabla Clientes
CREATE TABLE IF NOT EXISTS Clientes (
    Ci INT PRIMARY KEY,
    Nombre VARCHAR(25) NOT NULL,
    Apellido VARCHAR(25) NOT NULL,
    Email VARCHAR(60) UNIQUE,
    Telefono VARCHAR(9),
    Direccion VARCHAR(80)
);

-- Tabla Transportes
CREATE TABLE IF NOT EXISTS Transportes (
    Matricula VARCHAR(7) PRIMARY KEY CHECK (Matricula REGEXP '^[A-Za-z]{3}[0-9]{4}$'),
    Tipo VARCHAR(50) NOT NULL CHECK (Tipo IN ('Camioneta', 'Camión')),
    Capacidad DECIMAL(10, 2) NOT NULL,
    Estado VARCHAR(20) NOT NULL
);

-- Tabla Almacenes
CREATE TABLE IF NOT EXISTS Almacenes (
    ID_Almacen INT AUTO_INCREMENT PRIMARY KEY,
    Ubicacion VARCHAR(80) NOT NULL,
    Responsable INT,
    IDRuta INT,
    FOREIGN KEY (Responsable) REFERENCES Empleados(CI),
    FOREIGN KEY (IDRuta) REFERENCES Ruta(ID_Ruta)
);

-- Tabla Lotes
CREATE TABLE IF NOT EXISTS Lotes (
    ID_Lote INT AUTO_INCREMENT PRIMARY KEY,
    Fecha_Creacion DATE NOT NULL,
    ID_Almacen INT,
    Estado VARCHAR(25) NOT NULL,
    AlmacenDestino INT,
    FOREIGN KEY (ID_Almacen) REFERENCES Almacenes(ID_Almacen),
    FOREIGN KEY (AlmacenDestino) REFERENCES Almacenes(ID_Almacen)
);

-- Tabla Paquetes
CREATE TABLE IF NOT EXISTS Paquetes (
    ID_Paquete INT AUTO_INCREMENT PRIMARY KEY,
    Descripcion TEXT,
    Peso DECIMAL(10, 2) NOT NULL,
    Estado VARCHAR(20) NOT NULL CHECK (Estado IN ('En almacén', 'En tránsito', 'Entregado')),
    Ci INT,
    ID_Lote INT,
    ID_Almacen INT,
    FOREIGN KEY (Ci) REFERENCES Clientes(Ci),
    FOREIGN KEY (ID_Lote) REFERENCES Lotes(ID_Lote),
    FOREIGN KEY (ID_Almacen) REFERENCES Almacenes(ID_Almacen)
);

-- Tabla Eventos
CREATE TABLE IF NOT EXISTS Eventos (
    ID_Evento INT AUTO_INCREMENT PRIMARY KEY,
    ID_Paquete INT,
    Tipo_Evento VARCHAR(30) NOT NULL CHECK (Tipo_Evento IN ('Recepción', 'Salida', 'Entrega')),
    Fecha_Hora DATETIME NOT NULL,
    Notas TEXT,
    FOREIGN KEY (ID_Paquete) REFERENCES Paquetes(ID_Paquete)
);

-- Tabla de relación para Paquetes y Lotes
CREATE TABLE IF NOT EXISTS Paquete_Lote (
    ID_Paquete INT,
    ID_Lote INT,
    PRIMARY KEY (ID_Paquete, ID_Lote),
    FOREIGN KEY (ID_Paquete) REFERENCES Paquetes(ID_Paquete),
    FOREIGN KEY (ID_Lote) REFERENCES Lotes(ID_Lote)
);

CREATE TABLE IF NOT EXISTS RutasAsignadas (
    ID_Asignacion INT AUTO_INCREMENT PRIMARY KEY, 
    ID_Ruta INT NOT NULL,
    CiChofer INT NOT NULL,
    Fecha DATE NOT NULL,
    Estado VARCHAR(20) DEFAULT 'Pendiente' CHECK (Estado IN ('Pendiente', 'En curso', 'Completada')),
    Notas TEXT,
    FOREIGN KEY (ID_Ruta) REFERENCES Ruta(ID_Ruta),
    FOREIGN KEY (CiChofer) REFERENCES Empleados(CI)
);

-- Creación de usuarios y asignación de permisos
CREATE USER IF NOT EXISTS 'chofer' IDENTIFIED BY 'chofer123';
CREATE USER IF NOT EXISTS 'almacenero' IDENTIFIED BY 'almacenero123';
CREATE USER IF NOT EXISTS 'administrador' IDENTIFIED BY 'admin123';

GRANT SELECT ON sistemapaqueteria.transportes TO 'chofer'@'%';
GRANT INSERT, SELECT ON sistemapaqueteria.eventos TO 'chofer'@'%';
GRANT SELECT ON sistemapaqueteria.almacenes TO 'chofer'@'%';
GRANT INSERT, SELECT ON sistemapaqueteria.paquete_lote TO 'chofer'@'%';
GRANT SELECT ON sistemapaqueteria.paquetes TO 'chofer'@'%';
GRANT SELECT ON sistemapaqueteria.ruta TO 'chofer'@'%';
GRANT SELECT ON sistemapaqueteria.rutasasignadas TO 'chofer'@'%';

GRANT INSERT, SELECT, UPDATE ON sistemapaqueteria.lotes TO 'almacenero'@'%';
GRANT INSERT, SELECT ON sistemapaqueteria.eventos TO 'almacenero'@'%';
GRANT INSERT, SELECT ON sistemapaqueteria.almacenes TO 'almacenero'@'%';
GRANT INSERT, SELECT, UPDATE ON sistemapaqueteria.paquete_lote TO 'almacenero'@'%';
GRANT INSERT, SELECT, UPDATE ON sistemapaqueteria.paquetes TO 'almacenero'@'%';
GRANT SELECT ON sistemapaqueteria.ruta TO 'almacenero'@'%';
GRANT SELECT ON sistemapaqueteria.transportes TO 'almacenero'@'%';

GRANT ALL PRIVILEGES ON sistemapaqueteria.* TO 'administrador'@'%';
GRANT GRANT OPTION ON sistemapaqueteria.* TO 'administrador'@'%';

FLUSH PRIVILEGES;

-- Inserción de datos de prueba

-- Inserción en la tabla Empleados primero
INSERT INTO Empleados (CI, Nombre, Apellido, Cargo, Fecha_Contratacion, Pass, Email, Telefono, Direccion, isDeleted)
VALUES 
(54673665, 'Roberto', 'Silva', 'Almacenero', '2023-11-01', 'passwordrobert', 'roberto.silva@example.com', '099123456', 'Direccion 1', 0),
(35564736, 'Fernanda', 'Gomez', 'Almacenero', '2023-11-01', 'ferandaaa', 'fernanda.gomez@example.com', '099123457', 'Direccion 2', 0),
(22232345, 'Mauricio', 'Lopez', 'Almacenero', '2023-11-01', 'mamarracho11221', 'mauricio.lopez@example.com', '099123458', 'Direccion 3', 0),
(77636526, 'Lucia', 'Fernandez', 'Almacenero', '2023-11-01', 'akakakak', 'lucia.fernandez@example.com', '099123459', 'Direccion 4', 0),
(55488732, 'Carlos', 'Martinez', 'Almacenero', '2023-11-01', 'carlitoooos', 'carlos.martinez@example.com', '099123460', 'Direccion 5', 0),
(22423453, 'Andrea', 'Rodriguez', 'Almacenero', '2023-11-01', 'annannana', 'andrea.rodriguez@example.com', '099123461', 'Direccion 6', 0),
(11122241, 'Maringa', 'Fernandez', 'Almacenero', '2023-11-01', 'perrito123123', 'maringa.fernandez@example.com', '099123462', 'Direccion 7', 0),
(88787822, 'Perrito', 'Madrigal', 'Almacenero', '2023-11-01', 'mariaiaiaiai', 'perrytheplatypus@example.com', '099123463', 'Direccion 8', 0),
(12345567, 'Miau', 'Woof', 'Almacenero', '2023-11-01', 'skibididop', 'jotarokujo@example.com', '099123464', 'Direccion 9', 0),
(22423410, 'Laufey', 'Kid', 'Almacenero', '2023-11-01', 'goodkid', 'pepe.rodriguez@example.com', '099123465', 'Direccion 10', 0),
(11442134, 'Santiago', 'Alvarez', 'Administrativo', '2023-11-01', 'santiagoadmin', 'santiagoalv@gmail.com', '099123465', 'Direccion 10', 0),
(88293817, 'Juan', 'Rodrigo', 'Chofer', '2023-11-01', 'juanchofer', 'juanelchofer@example.com', '099123463', 'Direccion 10', 0);

-- Inserción en la tabla Ruta
INSERT INTO Ruta (ID_Ruta, Origen, Destino, Distancia, Duracion_Estimada) VALUES
(1, 'Montevideo', 'Canelones', 29.50, 0.50),
(3, 'Montevideo', 'Paysandú', 368.00, 4.50),
(4, 'Montevideo', 'Salto', 496.00, 6.00),
(5, 'Montevideo', 'Maldonado', 139.00, 2.00),
(7, 'Montevideo', 'Tacuarembó', 390.00, 5.00),
(8, 'Montevideo', 'Colonia', 177.00, 2.50),
(9, 'Montevideo', 'Treinta y Tres', 289.00, 4.00),
(10, 'Montevideo', 'Punta del Este', 134.00, 2.00),
(15, 'Montevideo', 'Rocha', 215.00, 3.00),
(26, 'Montevideo', 'Rivera', 501.00, 6.00);

-- Inserción en la tabla Clientes
INSERT INTO clientes (CI, Nombre, Apellido, Email, Telefono, Direccion) VALUES
(12345678, 'Juan', 'Perez', 'juan.perez@example.com', '12345678', 'Calle Falsas 123'),
(12345679, 'Carmen', 'Dominguez', 'carmen.dominguez@example.com', '12345679', 'Callejón de la Paz 101'),
(23456789, 'Laura', 'Garcia', 'laura.garcia@example.com', '23456789', 'Avenida Siempre Viva 742'),
(34567890, 'Carlos', 'Martinez', 'carlos.martinez@example.com', '34567890', 'Diagonal 456'),
(45678901, 'Ana', 'Lopez', 'ana.lopez@example.com', '45678901', 'Calle del Olvido 789'),
(56789012, 'David', 'Gomez', 'david.gomez@example.com', '56789012', 'Avenida de la Luz 321'),
(67890123, 'Luisa', 'Fernandez', 'luisa.fernandez@example.com', '67890123', 'Paseo del Mar 567'),
(78901234, 'Fernando', 'Torres', 'fernando.torres@example.com', '78901234', 'Camino Largo 890'),
(89012345, 'Sofia', 'Rodriguez', 'sofia.rodriguez@example.com', '89012345', 'Ronda del Valle 654'),
(90123456, 'Javier', 'Hernandez', 'javier.hernandez@example.com', '90123456', 'Plaza Central 432');

-- Inserción en la tabla Transportes
INSERT INTO Transportes (Matricula, Tipo, Capacidad, Estado) VALUES
('ABC1234', 'Camioneta', 1000.00, 'Disponible'),
('DEF5678', 'Camión', 5000.00, 'Disponible'),
('AAA6393', 'Camión', 6000.00, 'Disponible'),
('AAK1551', 'Camioneta', 1500.00, 'Disponible'),
('ABA9999', 'Camión', 4000.00, 'Disponible'),
('DAA9878', 'Camioneta', 5000.00, 'Disponible');

-- Inserción en la tabla Almacenes
INSERT INTO Almacenes (Ubicacion, Responsable, IDRuta) VALUES
('Montevideo', 54673665, NULL),
('Canelones', 35564736, 1),
('Maldonado', 22232345, 5),
('Colonia', 77636526, 8),
('Paysandú', 55488732, 3),
('Punta del Este', 22423453, 10),
('Rivera', 11122241, 26),
('Rocha', 88787822, 15),
('Salto', 12345567, 4),
('Tacuarembó', 22423410, 7);

-- Inserción en la tabla Paquetes
 INSERT INTO Paquetes (Descripcion, Peso, Estado, Ci, ID_Lote, ID_Almacen) VALUES
('Nuevo paquete de libros', 5.00, 'En almacén', 12345678, NULL, 1),
('Nuevo paquete de ropa', 2.00, 'En almacén', 23456789, NULL, 2),
('Nuevo equipo deportivo', 7.50, 'En almacén', 34567890, NULL, 3),
('Nuevo paquete de juguetes', 3.50, 'En almacén', 45678901, NULL, 4),
('Nuevo instrumento musical', 6.00, 'En almacén', 56789012, NULL, 5),
('Nuevo paquete de alimentos', 4.00, 'En almacén', 67890123, NULL, 6),
('Artículos de decoración', 3.20, 'En almacén', 78901234, NULL, 7),
('Equipaje personal adicional', 10.00, 'En almacén', 89012345, NULL, 8);

/*
-- CONSULTAS SQL
-- 1 Paquetes entregados en Mayo 2023 con destino a Melo:
SELECT P.ID_Paquete, P.Descripcion
FROM Paquetes P
JOIN Eventos E ON P.ID_Paquete = E.ID_Paquete
JOIN RutasAsignadas RA ON P.ID_Almacen = RA.CiChofer
JOIN Ruta R ON RA.ID_Ruta = R.ID_Ruta
WHERE E.Tipo_Evento = 'Entregado'
AND MONTH(E.Fecha_Hora) = 5
AND YEAR(E.Fecha_Hora) = 2023
AND R.Destino = 'Melo';
-- 2 Todos los almacenes y los paquetes entregados durante 2023, ordenados por cantidad de paquetes:
SELECT A.ID_Almacen, A.Ubicacion, COUNT(P.ID_Paquete) AS CantidadPaquetes
FROM Almacenes A
LEFT JOIN Paquetes P ON A.ID_Almacen = P.ID_Almacen
JOIN Eventos E ON P.ID_Paquete = E.ID_Paquete
WHERE E.Tipo_Evento = 'Entregado' AND YEAR(E.Fecha_Hora) = 2023
GROUP BY A.ID_Almacen
ORDER BY CantidadPaquetes DESC;
-- 3 Todos los camiones registrados y qué tarea se encuentran realizando en este momento:
SELECT T.Matricula, T.Tipo, T.Estado, RA.Estado AS EstadoRuta
FROM Transportes T
LEFT JOIN RutasAsignadas RA ON T.Matricula = RA.CiChofer
WHERE RA.Fecha = CURDATE() OR RA.Fecha IS NULL;
-- 4 Todos los camiones que visitaron durante el mes de Junio un almacén dado:
SELECT DISTINCT T.Matricula
FROM Transportes T
JOIN RutasAsignadas RA ON T.Matricula = RA.CiChofer
JOIN Almacenes A ON RA.ID_Ruta = A.IDRuta
WHERE MONTH(RA.Fecha) = 6
AND YEAR(RA.Fecha) = 2023
AND A.ID_Almacen = 1; 
-- 5 Destino, lote, almacén de destino y camión que transporta un paquete dado:
SELECT R.Destino, L.ID_Lote, L.AlmacenDestino, T.Matricula
FROM Paquetes P
JOIN Lotes L ON P.ID_Lote = L.ID_Lote
JOIN Almacenes A ON L.AlmacenDestino = A.ID_Almacen
JOIN RutasAsignadas RA ON A.IDRuta = RA.ID_Ruta
JOIN Ruta R ON RA.ID_Ruta = R.ID_Ruta
JOIN Transportes T ON RA.CiChofer = T.Matricula
WHERE P.ID_Paquete = 1; 
-- 6 Identificador del paquete, identificador de lote, matrícula del camión que lo transporta, almacén de destino, dirección final y el estado del envío, para los paquetes que se recibieron hace más de 3 días:
SELECT 
    P.ID_Paquete, 
    P.ID_Lote, 
    T.Matricula, 
    A.Ubicacion AS AlmacenDestino, 
    C.Direccion AS DireccionFinal, 
    P.Estado,
    E.Fecha_Hora AS FechaRecepcion
FROM Paquetes P
JOIN Clientes C ON P.Ci = C.Ci
LEFT JOIN Lotes L ON P.ID_Lote = L.ID_Lote
LEFT JOIN Almacenes A ON P.ID_Almacen = A.ID_Almacen
LEFT JOIN RutasAsignadas RA ON A.ID_Almacen = RA.ID_Ruta
LEFT JOIN Transportes T ON RA.CiChofer = T.Matricula
JOIN Eventos E ON P.ID_Paquete = E.ID_Paquete AND E.Tipo_Evento = 'Recepción'
WHERE DATEDIFF(CURDATE(), E.Fecha_Hora) > 3;

-- 7 Todos los paquetes a los que aún no se les ha asignado un lote y la fecha en la que fueron recibidos:
SELECT P.ID_Paquete
FROM Paquetes P
WHERE P.ID_Lote IS NULL;
-- 8 Matrícula de los camiones que se encuentran fuera de servicio:
SELECT Matricula
FROM Transportes
WHERE Estado = 'Fuera de Servicio';
-- 9 Todos los camiones que no tienen un conductor asignado y su estado operativo:
SELECT T.Matricula, T.Estado
FROM Transportes T
LEFT JOIN RutasAsignadas RA ON T.Matricula = RA.CiChofer
WHERE RA.CiChofer IS NULL;
-- 10 Todos los almacenes que se encuentran en un recorrido dado:
SELECT A.ID_Almacen, A.Ubicacion
FROM Almacenes A
WHERE A.IDRuta = 2;

-- CONSULTAS OPCIONALES
-- Lista de los paquetes y su estado en un almacén específico:
SELECT ID_Paquete, Estado
FROM Paquetes
WHERE ID_Almacen = 1; 
-- Lotes que llegaron a un almacén específico durante agosto del 2023:
SELECT ID_Lote, Fecha_Creacion
FROM Lotes
WHERE AlmacenDestino = [ID del Almacén] -- Reemplaza [ID del Almacén] con el ID específico
AND MONTH(Fecha_Creacion) = 8
AND YEAR(Fecha_Creacion) = 2023;
-- Información de los camiones que actualmente se encuentran en ruta:
SELECT T.Matricula, P.Descripcion AS Carga, R.Destino, R.Duracion_Estimada
FROM Transportes T
JOIN RutasAsignadas RA ON T.Matricula = RA.CiChofer
JOIN Ruta R ON RA.ID_Ruta = R.ID_Ruta
JOIN Paquetes P ON RA.ID_Asignacion = P.ID_Almacen -- Asumiendo que se relaciona así
WHERE RA.Estado = 'En curso';
-- Recorridos realizados y almacenes visitados por un camión en el último mes:
SELECT RA.ID_Ruta, A.ID_Almacen
FROM RutasAsignadas RA
JOIN Almacenes A ON RA.ID_Ruta = A.IDRuta
WHERE RA.CiChofer = [Matricula del Camión] 
AND RA.Fecha BETWEEN DATE_SUB(CURDATE(), INTERVAL 1 MONTH) AND CURDATE();
-- Paquetes entregados en julio de 2023, ordenados por fecha de entrega descendente:
SELECT P.ID_Paquete, E.Fecha_Hora AS FechaEntrega
FROM Paquetes P
JOIN Eventos E ON P.ID_Paquete = E.ID_Paquete
WHERE E.Tipo_Evento = 'Entregado'
AND MONTH(E.Fecha_Hora) = 7
AND YEAR(E.Fecha_Hora) = 2023
ORDER BY E.Fecha_Hora DESC;
-- Camiones que no hicieron ningún recorrido entre el 10 y 17 de julio de 2023:
SELECT T.Matricula
FROM Transportes T
LEFT JOIN RutasAsignadas RA ON T.Matricula = RA.CiChofer
WHERE (RA.Fecha IS NULL OR RA.Fecha NOT BETWEEN '2023-07-10' AND '2023-07-17')
AND T.Matricula NOT IN (
  SELECT RA.CiChofer
  FROM RutasAsignadas RA
  WHERE RA.Fecha BETWEEN '2023-07-10' AND '2023-07-17'
);
-- Lista de almacenes que pertenecen a un recorrido dado y su distancia con el centro de distribución:
SELECT A.ID_Almacen, A.Ubicacion, R.Distancia
FROM Almacenes A
JOIN Ruta R ON A.IDRuta = R.ID_Ruta
WHERE R.ID_Ruta = [ID de la Ruta]; 
-- Recorridos utilizados en mayo del 2023, ordenados por la cantidad de camiones:
SELECT RA.ID_Ruta, COUNT(DISTINCT RA.CiChofer) AS CantidadCamiones
FROM RutasAsignadas RA
WHERE MONTH(RA.Fecha) = 5 AND YEAR(RA.Fecha) = 2023
GROUP BY RA.ID_Ruta
ORDER BY CantidadCamiones DESC;

*/
