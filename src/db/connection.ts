import postgres from "postgres";
import { env } from "../env";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from './schema'

const connection = postgres(env.DATABASE_URL)

export const db = drizzle(connection, { schema })