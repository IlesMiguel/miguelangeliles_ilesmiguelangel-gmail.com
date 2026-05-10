# Inventario Brangus
Aplicación web de inventario desarrollada con React + Vite, PHP y MySQL.

## Requisitos
- XAMPP (PHP + MySQL)
- Node.js 18+

## Instalación

### Base de datos
1. Abrir phpMyAdmin en http://localhost/phpmyadmin
2. Crear base de datos llamada `inventario_db`
3. Importar el archivo `inventario_db.sql`

### Backend
1. Copiar la carpeta `backend/` dentro de `htdocs/Prueba/` de XAMPP
2. Editar `backend/config/database.php` con tus credenciales MySQL
3. Iniciar Apache y MySQL en XAMPP

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Abrir http://localhost:5173

## Variables de conexión
En `backend/config/database.php`:
- `$host` = localhost
- `$db` = inventario_db
- `$user` = root
- `$pass` = (vacío por defecto en XAMPP)