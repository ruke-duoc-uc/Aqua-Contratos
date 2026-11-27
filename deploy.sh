#!/bin/bash
# ========================================================
# Script de Despliegue Automatizado - Aqua-Contratos (Opción A)
# Servidor: ajoloserver
# ========================================================

set -e

echo "🐟 ========================================================"
echo "🚀 Iniciando despliegue de Aqua-Contratos en ajoloserver"
echo "🐟 ========================================================"

# 1. Instalar dependencias backend
echo "📦 1/4 Instalando dependencias de Backend..."
cd backend
npm install --production=false
cd ..

# 2. Instalar dependencias y compilar frontend
echo "🎨 2/4 Compilando Frontend Vite..."
cd vcm-psicolaboral
npm install
npm run build
cd ..

# 3. Comprobar PM2
echo "⚙️ 3/4 Verificando PM2..."
if ! command -v pm2 &> /dev/null; then
    echo "⚠️ PM2 no encontrado. Instalando pm2 globalmente..."
    sudo npm install -g pm2
fi

# 4. Iniciar o recargar el servicio en segundo plano
echo "🔄 4/4 Iniciando servicio con PM2..."
pm2 startOrReload ecosystem.config.cjs

echo "💾 Guardando configuración de PM2..."
pm2 save

echo ""
echo "✅ ========================================================"
echo "🎉 ¡Aqua-Contratos desplegado con éxito en el puerto 4000!"
echo "🌐 Acceso local/Tailscale: http://100.124.162.2:4000"
echo "📊 Monitoreo: pm2 status | pm2 logs aqua-contratos"
echo "=========================================================="
