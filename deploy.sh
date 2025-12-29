#!/bin/bash
# Script de despliegue para el panel administrativo

echo "🚀 Desplegando Panel Administrativo de Binks..."

# Verificar que existe el archivo .env
if [ ! -f .env ]; then
    echo "❌ Error: Archivo .env no encontrado. Copia .env.example a .env y configura las variables."
    exit 1
fi

# Construir la imagen Docker
echo "📦 Construyendo imagen Docker..."
docker build -t panel-admin .

# Verificar que la construcción fue exitosa
if [ $? -eq 0 ]; then
    echo "✅ Imagen construida exitosamente"

    # Ejecutar el contenedor
    echo "🏃 Ejecutando contenedor..."
    docker run -d \
        --name panel-admin \
        -p 3000:3000 \
        --env-file .env \
        --restart unless-stopped \
        panel-admin

    echo "✅ Panel administrativo desplegado en http://localhost:3000"
    echo "📋 Para ver logs: docker logs -f panel-admin"
    echo "🛑 Para detener: docker stop panel-admin"
else
    echo "❌ Error al construir la imagen"
    exit 1
fi