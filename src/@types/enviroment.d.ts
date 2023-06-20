declare namespace NodeJS {
    export interface ProcessEnv {
      AWS_ACCESS_KEY: string;
      AWS_SECRET_KEY: string;
      BOT_KEY: string;
      DB_CONN_STRING: string;
      SECRET_KEY: string;
      PHOTOS_BUCKET_NAME: string;
      STRIPE_API_KEY:string
    }
  }