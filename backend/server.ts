// express server

import express from "express";
import { apiRouter } from "./routes";
import { generateOpenApi } from "@ts-rest/open-api";
import { apiContract } from "#/shared/contracts";
import * as swaggerUi from "swagger-ui-express";
import { createExpressEndpoints } from "@ts-rest/express";
import { createLog, csrfProtection, validateUser } from "./middlewares/auth";

// construct express app

const app = express();

// add app-level middleware

app.use(express.json());

app.use(csrfProtection, validateUser, createLog);

createExpressEndpoints(apiContract, apiRouter, app);

// generate swagger docs

const openApiDocument = generateOpenApi(apiContract, {
    info: {
        title: "Backend API",
        version: "1.0.0",
    },
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

// start express app

if (!Number(process.env.PORT)) {
    throw TypeError("process.env.PORT is not a number");
}

const server = app.listen(Number(process.env.PORT), () =>
    console.log(`
🚀 Server ready at: ${process.env.BACKEND_URL}
⭐️ See sample requests: http://pris.ly/e/ts/rest-express#3-using-the-rest-api`)
);
