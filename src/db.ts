import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import type { ColumnType } from 'kysely';

export interface Database {
  todos: TodosTable;
}

export interface TodosTable {
  id: ColumnType<number, never, never>;
  title: string;
  description: string | null;
  completed: ColumnType<boolean, boolean | undefined, boolean>;
  created_at: ColumnType<Date, never, never>;
  updated_at: ColumnType<Date, never, Date>;
}

const dialect = new PostgresDialect({
  pool: new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 6432,
    database: process.env.DB_NAME || 'honodb',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  }),
});

export const db = new Kysely<Database>({
  dialect,
});
