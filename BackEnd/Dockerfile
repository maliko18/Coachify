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
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Extensions PHP requises
RUN docker-php-ext-install pdo pdo_mysql pdo_pgsql mbstring zip intl

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

# Copier et configurer le script d'entrypoint
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Configurer Apache : DocumentRoot vers public/
RUN echo '<VirtualHost *:80>\n\
    ServerName localhost\n\
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

# Activer les logs d'erreur PHP
RUN echo "php_value error_log /var/www/html/storage/logs/php-error.log" > /var/www/html/public/.htaccess.php \
 && echo "php_value display_errors Off" >> /var/www/html/public/.htaccess.php

EXPOSE 80

# Utiliser le script d'entrypoint pour les migrations et démarrage
ENTRYPOINT ["docker-entrypoint.sh"]
