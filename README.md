# Sistema de Restaurante API

API RESTful para la gestión integral de restaurantes, desarrollada con Node.js, Express y MongoDB.

## 📋 Descripción

Sistema de gestión de restaurantes que permite administrar múltiples aspectos del negocio gastronómico, incluyendo restaurantes, menús, pedidos, reservas, mesas, eventos, reseñas y reportes.

## 🛠️ Tecnologías

- **Runtime:** Node.js
- **Framework:** Express.js
- **Base de datos:** MongoDB con Mongoose
- **Autenticación:** JWT (JSON Web Tokens)
- **Validación:** express-validator
- **Seguridad:** Helmet, CORS, Rate Limiting
- **Almacenamiento:** Cloudinary (imágenes)
- **Logger:** Morgan

## 📦 Instalación

```bash
# Instalar dependencias
pnpm install

# Ejecutar en desarrollo
pnpm run dev

# Ejecutar en producción
pnpm start
```

## 📁 Estructura del Proyecto

```
Sistema-Restaurante/
├── configs/              # Configuraciones de la aplicación
│   ├── app.js           # Configuración principal
│   ├── cors-configuration.js
│   ├── db.js            # Conexión a MongoDB
│   └── helmet-configuration.js
├── middlewares/         # Middlewares de la aplicación
│   ├── checkValidators.js
│   ├── delete-file-on-error.js
│   ├── event-validators.js
│   ├── file-uploader.js
│   ├── handle-errors.js
│   ├── menuItem-validators.js
│   ├── order-validators.js
│   ├── orderDetail-validators.js
│   ├── report-validators.js
│   ├── reservation-validators.js
│   ├── restaurant-validators.js
│   ├── reviews-validators.js
│   ├── roles.js
│   ├── table-validators.js
│   ├── validate-JWT.js
│   └── validate-role.js
├── src/                 # Código fuente
│   ├── events/         # Gestión de eventos
│   ├── menuItems/      # Gestión del menú
│   ├── orderDetails/   # Detalles de pedidos
│   ├── orders/         # Gestión de pedidos
│   ├── reports/        # Reportes y estadísticas
│   ├── reservations/   # Gestión de reservas
│   ├── restaurants/    # Gestión de restaurantes
│   ├── reviews/        # Gestión de reseñas
│   └── tables/         # Gestión de mesas
├── index.js            # Punto de entrada
└── package.json        # Dependencias del proyecto
```

## 🔗 Módulos de la API

### 🍽️ Restaurantes
- CRUD completo de restaurantes
- Gestión de información del negocio

### 📋 Menú
- Catálogo de platos y bebidas
- Categorización de items
- Imágenes de platos

### 📝 Pedidos
- Creación y seguimiento de pedidos
- Estados de pedido (pendiente, en proceso, completado, cancelado)
- Detalles de cada pedido

### 🪑 Mesas
- Administración de mesas
- Asignación y disponibilidad
- Capacidad por mesa

### 📅 Reservas
- Sistema de reservas
- Control de disponibilidad
- Estados de reserva

### ⭐ Reseñas
- Opinions de clientes
- Calificaciones
- Respuestas del restaurante

### 🎉 Eventos
- Gestión de eventos especiales
- Reservas de eventos

### 📊 Reportes
- Estadísticas de ventas
- Reportes de pedidos
- Análisis de negocio

## 🔐 Autenticación

La API utiliza JWT para la autenticación. Los endpoints protegidos requieren un token de acceso válido en el header:

```
Authorization: Bearer <token_jwt>
```

## 📝 Colección de Postman

Se incluye una colección de Postman en el archivo `Sistema Restaurante API.postman_collection.json` para probar todos los endpoints de la API.

## 📄 Variables de Entorno

Crear un archivo `.env` con las siguientes variables:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/restaurante
JWT_SECRET=tu_secreto_jwt
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

## 📄 Licencia

ISC

## 👤 Autor

Sistema de Gestión de Restaurantes
