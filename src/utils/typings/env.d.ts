declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TOKEN: string;
      VINTED_BASE_URL: string;
      VINTED_OLD_REFRESH_TOKEN: string;
    }
  }
}

// // If this file has no import/export statements (i.e. is a script)
// // convert it into a module by adding an empty export statement.
export {};
