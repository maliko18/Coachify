#!/bin/bash
set -e

echo "=========================================="
echo "Starting Laravel application..."
echo "=========================================="

# Vérifier et générer APP_KEY si manquant
if [ -z "$APP_KEY" ]; then
    echo "⚠️ APP_KEY not set, generating..."
    php artisan key:generate
else
    echo "✓ APP_KEY is set"
fi

# Créer les répertoires de cache s'ils n'existent pas
mkdir -p /var/www/html/storage/logs
mkdir -p /var/www/html/bootstrap/cache

# Donner les permissions correctes
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Nettoyer les caches
echo "Clearing caches..."
php artisan config:clear || true
php artisan cache:clear || true

# Exécuter les migrations
echo "Running database migrations..."
php artisan migrate --force 2>&1 || echo "⚠️ Migration failed, continuing anyway..."

echo "=========================================="
echo "✓ Setup complete, starting Apache..."
echo "=========================================="

# Lancer Apache
exec apache2-foreground
