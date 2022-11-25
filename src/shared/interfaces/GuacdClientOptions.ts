import { LogLevel } from '../enums/logLevel.enum'

export interface ClientOptions {
  crypt: {
    cypher: string;
    key: string;
  };
  log: {
    level: LogLevel;
  };
}
