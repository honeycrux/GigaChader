declare global {
    namespace NodeJS {
        interface ProcessEnv {
            BACKEND_URL: string;
            FRONTEND_URL: string;
            PORT: string;
            MONGODB_URL: string;
        }
    }
}

export {};
