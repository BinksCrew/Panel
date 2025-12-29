# Panel Administrativo

Aplicación de panel administrativo para gestión de usuarios y preguntas.

## Instalación

Instala las dependencias:

```bash
npm install
```

## Configuración

### Variables de Entorno

Copia el archivo `.env.example` a `.env` y configura las variables necesarias:

```bash
cp .env.example .env
```

Variables disponibles:

- `VITE_API_URL`: URL completa de la API del backend
  - Desarrollo: `http://localhost:3000/api`
  - Producción: `https://serverbinks.onrender.com/api`

## Desarrollo

Inicia el servidor de desarrollo con HMR:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

## Construcción para Producción

Crea una construcción de producción:

```bash
npm run build
```

## Despliegue

### Despliegue con Docker

Para construir y ejecutar usando Docker:

```bash
# Opción 1: Usar el script de despliegue
./deploy.sh

# Opción 2: Construir y ejecutar manualmente
docker build -t panel-admin .

# Ejecuta el contenedor con variables de entorno
docker run -p 3000:3000 --env-file .env panel-admin
```

O establece las variables directamente:

```bash
docker run -p 3000:3000 -e VITE_API_URL=https://serverbinks.onrender.com/api panel-admin
```

La aplicación containerizada puede ser desplegada en cualquier plataforma que soporte Docker.

### Despliegue DIY

Si estás familiarizado con el despliegue de aplicaciones Node, el servidor de aplicación integrado está listo para producción.

Asegúrate de desplegar la salida de `npm run build`.

## Estilos

Esta aplicación utiliza [Tailwind CSS](https://tailwindcss.com/) para el estilo.
