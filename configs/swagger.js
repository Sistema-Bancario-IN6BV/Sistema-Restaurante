'use strict';

import swaggerUi from 'swagger-ui-express';
import yaml from 'js-yaml';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const setupSwagger = (app, basePath) => {
    // Cargar el archivo swagger.yml
    const swaggerPath = join(__dirname, '..', 'swagger.yml');
    const swaggerDocument = yaml.load(readFileSync(swaggerPath, 'utf-8'));

    // Actualizar la URL del servidor con el puerto configurado
    if (swaggerDocument.servers && swaggerDocument.servers.length > 0) {
        swaggerDocument.servers[0].url = `http://localhost:${process.env.PORT || 3000}${basePath}`;
    }

    // Configurar Swagger UI
    app.use(`${basePath}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
        explorer: true,
        customSiteTitle: 'Sistema Restaurante API Docs',
        customCss: '.swagger-ui .topbar { display: none }',
        customfavIcon: '/favicon.ico'
    }));

    // Endpoint para obtener el JSON de la documentación
    app.get(`${basePath}/docs.json`, (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerDocument);
    });

    // Endpoint para obtener el YAML de la documentación
    app.get(`${basePath}/docs.yaml`, (_req, res) => {
        res.setHeader('Content-Type', 'application/x-yaml');
        res.send(yaml.dump(swaggerDocument));
    });
};
