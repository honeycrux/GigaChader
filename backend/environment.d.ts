declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BACKEND_API_BASEURL: string;
      PORT: string;
    }
  }
}

export {}