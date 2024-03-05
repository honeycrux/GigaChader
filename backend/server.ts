// express server

import express from 'express'
import { apiRouter } from './routes';
import { ENV } from './lib/env';
import { generateOpenApi } from '@ts-rest/open-api';
import { apiContract } from "#/shared/contracts"
import * as swaggerUi from 'swagger-ui-express';
import { createExpressEndpoints } from '@ts-rest/express';

// construct express app

const app = express();

app.use(express.json());

createExpressEndpoints(apiContract, apiRouter, app);

// generate swagger docs

const openApiDocument = generateOpenApi(apiContract, {
  info: {
    title: 'Posts API',
    version: '1.0.0',
  },
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

// start express app

const server = app.listen(ENV.PORT, () =>
  console.log(`
🚀 Server ready at: ${ENV.BACKEND_API_BASEURL}
⭐️ See sample requests: http://pris.ly/e/ts/rest-express#3-using-the-rest-api`),
);