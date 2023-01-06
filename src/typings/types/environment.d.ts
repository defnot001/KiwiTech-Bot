declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BOT_TOKEN: string;
      CLIENT_ID: string;
      GUILD_ID: string;
      URL: string;
      API_KEY: string;
      SMP_RCON_PASSWORD: string;
      CMP_RCON_PASSWORD: string;
      CMP2_RCON_PASSWORD: string;
      COPY_RCON_PASSWORD: string;
      SNAPSHOTS_RCON_PASSWORD: string;
    }
  }
}

export {};
