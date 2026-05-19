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

# Supprimer la config Apache par défaut
RUN rm /etc/apache2/sites-enabled/000-default.conf

WORKDIR /var/www/html

# Copier le code
COPY . /var/www/html

# Installer les dépendances PHP
RUN composer install --no-dev --optimize-autoloader --no-interaction || true

# Permissions (storage + cache)
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache || true

# Configurer Apache : DocumentRoot vers public/
RUN echo '<VirtualHost *:80>\n\
    DocumentRoot /var/www/html/public\n\
    <Directory /var/www/html/public>\n\
        AllowOverride All\n\
        Require all granted\n\
        <IfModule mod_rewrite.c>\n\
            RewriteEngine On\n\
            RewriteCond %{REQUEST_FILENAME} !-f\n\
            RewriteCond %{REQUEST_FILENAME} !-d\n\
            RewriteRule ^ index.php [QSA,L]\n\
        </IfModule>\n\
    </Directory>\n\
    ErrorLog ${APACHE_LOG_DIR}/error.log\n\
    CustomLog ${APACHE_LOG_DIR}/access.log combined\n\
</VirtualHost>' > /etc/apache2/sites-available/laravel.conf

RUN a2ensite laravel.conf

EXPOSE 80

# Lancer Apache (commande par défaut de l'image php:apache)
CMD ["apache2-foreground"]
