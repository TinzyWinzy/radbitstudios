declare module 'sql.js' {
  interface Database {
    run(sql: string, params?: any[]): Database;
    exec(sql: string): QueryExecResult[];
    prepare(sql: string): Statement;
    export(): Uint8Array;
    close(): void;
  }
  interface Statement {
    bind(params?: any[]): boolean;
    step(): boolean;
    getAsObject<T = any>(): T;
    run(params?: any): void;
    free(): boolean;
  }
  interface QueryExecResult {
    columns: string[];
    values: any[][];
  }
  interface SqlJsStatic {
    new (data?: ArrayLike<number> | Buffer | null): Database;
    (data?: ArrayLike<number> | Buffer | null): Database;
    Database: new (data?: ArrayLike<number> | Buffer | null) => Database;
  }
  export type { Database, SqlJsStatic };
  export default function initSqlJs(config?: {
    locateFile?: (file: string) => string;
  }): Promise<SqlJsStatic>;
}