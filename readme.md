# Backend PWA Commerce

Backend API para aplicación PWA de comercio local con soporte offline.

## Tecnologías

- Node.js + Express
- PostgreSQL
- Prisma 6
- JWT para autenticación
- bcryptjs para encriptación

## Instalación

1. Instalar dependencias:
```bash
cd backend
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
```

Editar `.env` con tus credenciales de PostgreSQL.

3. Generar cliente de Prisma:
```bash
npm run prisma:generate
```

4. Ejecutar migraciones:
```bash
npm run prisma:migrate
```

5. Seed inicial (opcional):
```bash
npm run prisma:seed
```

## Uso

Desarrollo:
```bash
npm run dev
```

Producción:
```bash
npm start
```

## Endpoints API

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil
- `POST /api/auth/change-password` - Cambiar contraseña

### Usuarios (Solo ADMIN)
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Productos
- `GET /api/products` - Listar productos
- `GET /api/products/:id` - Obtener producto
- `GET /api/products/low-stock` - Productos con stock bajo
- `POST /api/products` - Crear producto (ADMIN)
- `PUT /api/products/:id` - Actualizar producto (ADMIN)
- `DELETE /api/products/:id` - Eliminar producto (ADMIN)

### Categorías
- `GET /api/categories` - Listar categorías
- `POST /api/categories` - Crear categoría (ADMIN)
- `PUT /api/categories/:id` - Actualizar categoría (ADMIN)
- `DELETE /api/categories/:id` - Eliminar categoría (ADMIN)

### Clientes
- `GET /api/customers` - Listar clientes
- `GET /api/customers/:id` - Obtener cliente
- `POST /api/customers` - Crear cliente
- `PUT /api/customers/:id` - Actualizar cliente
- `DELETE /api/customers/:id` - Eliminar cliente

### Ventas
- `GET /api/sales` - Listar ventas
- `GET /api/sales/:id` - Obtener venta
- `POST /api/sales` - Crear venta
- `POST /api/sales/:id/cancel` - Cancelar venta (ADMIN)

### Sincronización
- `POST /api/sync/sales` - Sincronizar ventas offline
- `GET /api/sync/last-sync` - Última sincronización

### Reportes
- `GET /api/reports/dashboard` - Estadísticas del dashboard
- `GET /api/reports/sales` - Reporte de ventas
- `GET /api/reports/top-products` - Productos más vendidos

## Base de Datos

Ver schema completo en `prisma/schema.prisma`

### Modelos principales:
- **User**: Usuarios del sistema (Admin/Cajero)
- **Category**: Categorías de productos
- **Product**: Productos del inventario
- **Customer**: Clientes
- **Sale**: Ventas realizadas
- **SaleItem**: Ítems de cada venta
- **SyncLog**: Log de sincronización

## Credenciales por defecto (seed)

**Admin:**
- Email: admin@tienda.com
- Password: 123456

**Cajero:**
- Email: cajero@tienda.com
- Password: 123456
