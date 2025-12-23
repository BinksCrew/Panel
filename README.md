# Panel Administrativo

Aplicación de panel administrativo para gestión de usuarios y preguntas.

## Instalación

Instala las dependencias:

```bash
npm install
```

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
docker build -t panel-admin .

# Ejecuta el contenedor
docker run -p 3000:3000 panel-admin
```

La aplicación containerizada puede ser desplegada en cualquier plataforma que soporte Docker.

### Despliegue DIY

Si estás familiarizado con el despliegue de aplicaciones Node, el servidor de aplicación integrado está listo para producción.

Asegúrate de desplegar la salida de `npm run build`.

## Estilos

Esta aplicación utiliza [Tailwind CSS](https://tailwindcss.com/) para el estilo.
