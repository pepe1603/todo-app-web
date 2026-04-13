# TodoAppWeb

Aplicación web de gestión de tareas (To-Do List) con autenticación segura mediante OTP y panel de estadísticas en tiempo real.

---

## 🛠️ Tecnologías

### Frontend

- **Framework:** Angular 21
- **Estilos:** SCSS con diseño responsive
- **HTTP:** HttpClient con interceptores

### Backend (Spring Boot)

- **Framework:** Spring Boot 4.0
- **Base de datos:** PostgreSQL (Aiven)
- **Cache:** Redis
- **Seguridad:** JWT + Spring Security

---

## 📁 Estructura del Proyecto

```
todo-app-web/                    # Frontend Angular
├── src/app/
│   ├── core/
│   │   ├── guards/             # AuthGuard
│   │   ├── interceptors/       # AuthInterceptor
│   │   └── services/           # AuthService, TaskService
│   └── features/
│       ├── auth/
│       │   └── components/     # Login, Register, Verify
│       └── tasks/
│           ├── components/     # TasksComponent
│           └── models/         # TaskStats interface
└── angular.json

todo-app/                        # Backend Spring Boot
├── src/main/java/.../
│   ├── config/                 # SecurityConfig, CorsConfig
│   ├── controller/             # AuthController, TaskController
│   ├── service/                # AuthService, TaskService
│   ├── entity/                 # User, Task
│   └── security/               # JwtAuthenticationFilter
└── API_DOCUMENTATION.md
```

---

## 🚀 Ejecución del Proyecto

### Frontend

```bash
cd todo-app-web
npm install
npm start
# Acceder a http://localhost:4200
```

### Backend

```bash
cd todo-app

# Configurar variables de entorno antes de ejecutar
# URL_DATABASE_POSTGRESQL, DB_USERNAME, DB_PASSWORD
# REDIS_HOST, REDIS_PORT
# JWT_SECRET, MAIL_USERNAME, MAIL_PASSWORD

./mvnw.cmd spring-boot:run
# API disponible en http://localhost:9090
```

---

## 📡 Endpoints de la API

### Autenticación

| Método | Endpoint               | Descripción              |
| ------ | ---------------------- | ------------------------ |
| POST   | `/api/auth/register`   | Registrar usuario        |
| POST   | `/api/auth/verify`     | Verificar cuenta con OTP |
| POST   | `/api/auth/resend-otp` | Reenviar código OTP      |
| POST   | `/api/auth/login`      | Iniciar sesión           |

### Tareas (Requiere autenticación)

| Método | Endpoint                   | Descripción             |
| ------ | -------------------------- | ----------------------- |
| GET    | `/api/tasks`               | Listar todas las tareas |
| GET    | `/api/tasks/stats`         | Obtener estadísticas    |
| POST   | `/api/tasks`               | Crear nueva tarea       |
| PUT    | `/api/tasks/{id}`          | Actualizar tarea        |
| DELETE | `/api/tasks/{id}`          | Eliminar tarea          |
| PATCH  | `/api/tasks/{id}/status`   | Cambiar estado          |
| PATCH  | `/api/tasks/{id}/start`    | Iniciar tarea           |
| PATCH  | `/api/tasks/{id}/complete` | Completar tarea         |
| PATCH  | `/api/tasks/{id}/cancel`   | Cancelar tarea          |
| PATCH  | `/api/tasks/{id}/reopen`   | Reabrir tarea           |

---

## 🎯 Funcionalidades

### Módulo de Autenticación

- ✅ Registro de usuarios
- ✅ Verificación por código OTP (6 dígitos)
- ✅ Reenvío de código OTP (rate limiting: 60s)
- ✅ Login con JWT
- ✅ Protección de rutas con AuthGuard
- ✅ Interceptor automático de token

### Módulo de Tareas

- ✅ Panel de estadísticas (total, pendientes, progreso, completadas, canceladas, vencidas)
- ✅ Barra de progreso de completion
- ✅ Crear tareas (título, descripción, fecha límite)
- ✅ Editar tareas
- ✅ Eliminar tareas con confirmación
- ✅ Cambiar estado (PENDING → IN_PROGRESS → COMPLETED)
- ✅ Cancelar y reopen tareas
- ✅ Filtros por estado
- ✅ Acordeón de detalles
- ✅ Formato de fecha legible
- ✅ Días restantes / vencido
- ✅ UI moderna y responsive

---

## 🔐 Flujo de Autenticación

```
1. Usuario se registra → Usuario creado (no verificado)
2. Sistema envía OTP por email (validez: 5 min)
3. Usuario verifica cuenta con código OTP
4. Login disponible solo para usuarios verificados
5. Si login sin verificar → mostrar opción de reenviar OTP
```

---

## 🎨 Diseño UI

### Colores Principales

- Primario: `#667eea` (púrpura-azulado)
- Secundario: `#764ba2` (púrpura)
- Éxito: `#27ae60` (verde)
- Advertencia: `#f39c12` (naranja)
- Peligro: `#e74c3c` (rojo)
- Info: `#3498db` (azul)

### Componentes

- Tarjetas con sombras y bordes coloreados por estado
- Botones con gradientes y efectos hover
- Formularios con validación visual
- Loading spinner
- Modal de confirmación con backdrop blur

---

## ⚙️ Configuración

### Variables de Entorno (Backend)

```yaml
# Base de datos
URL_DATABASE_POSTGRESQL: postgresql://...
DB_USERNAME: postgres
DB_PASSWORD: password

# Redis
REDIS_HOST: localhost
REDIS_PORT: 6379

# Email
MAIL_USERNAME: your-email@gmail.com
MAIL_PASSWORD: app-password

# JWT
JWT_SECRET: your-secret-key
JWT_ACCESS_TOKEN_EXPIRATION: 900000
```

---

## 📄 Documentación API

- **Swagger UI:** [http://31.97.31.232:9090/swagger-ui/index.html](http://31.97.31.232:9090/swagger-ui/index.html)

Ver el archivo `API_DOCUMENTATION.md` en el directorio del backend para información detallada de todos los endpoints, incluyendo códigos de error y ejemplos de respuestas.

---

## 👤 Autor

Desarrollado como parte de la prueba técnica de TechnoPartner.

---

## 📝 Notas

- El backend tiene un problema de compilación en `SecurityConfig.java` que debe ser arreglado para producción.
- CORS configurado para permitir todas las origenes en desarrollo.
- Redis debe estar corriendo para el sistema de OTP y caché.

---

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
