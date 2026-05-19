FROM php:8.2-apache

# Installer les dépendances système requises
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    libpng-dev \
    libonig-dev \
    libicu-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Extensions PHP requises
RUN docker-php-ext-install pdo pdo_mysql mbstring zip intl

# Copier Composer depuis l'image officielle
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Activer mod_rewrite d'Apache
RUN a2enmod rewrite

WORKDIR /var/www/html

# Copier le code
COPY . /var/www/html

# Installer les dépendances PHP
RUN composer install --no-dev --optimize-autoloader --no-interaction || true

# Permissions (storage + cache)
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache || true

EXPOSE 80

# Lancer Apache (commande par défaut de l'image php:apache)
CMD ["apache2-foreground"]
