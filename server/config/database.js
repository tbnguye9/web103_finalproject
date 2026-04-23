import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const isSslRequired = String(process.env.PGSSLMODE || "").toLowerCase() === "require";

const pool = new pg.Pool({
  database: process.env.PGDATABASE,
  host: process.env.PGHOST,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER,
  ssl: isSslRequired ? { rejectUnauthorized: false } : false,
});

export const query = (text, params) => pool.query(text, params);
export const getClient = () => pool.connect();
export default pool;