declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: string;
            BACKEND_URL: string;
            FRONTEND_URL: string;
            PORT: string;
            MONGODB_URL: string;
            AZURE_STORAGE_CONNECTION_STRING: string;
        }
    }
}

export {};
