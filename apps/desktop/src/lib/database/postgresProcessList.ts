import type { DatabaseType, QueryResult } from "@/types/database";

/**
 * PostgreSQL "current activity / process list" helpers. Pure and framework-free
 * so they can be unit-tested in isolation; the generic panel component wires them
 * to the SQL bridge and the production-safety guard via the driver registry.
 *
 * The MySQL family lives in `./mysqlProcessList`; the generic, engine-agnostic
 * bits (coordinator, interval clamping, session counting) are shared from there.
 */

const PG_PROCESS_LIST_DB_TYPES = new Set<DatabaseType>(["postgres"]);

/**
 * One row per server-side backend. `now() - query_start` gives the age of the
 * currently running (or last) statement; we fall back to the transaction and
 * backend start so idle sessions still report a sensible age. Own session is
 * kept in the result set so the panel can dim it rather than hide it.
 */
export const PG_PROCESS_LIST_SQL = `SELECT pid,
       usename AS "user",
       datname AS db,
       coalesce(host(client_addr), client_hostname, 'local') AS client,
       application_name AS app,
       state,
       coalesce(nullif(wait_event_type, '') || ':' || wait_event, wait_event_type, '') AS wait,
       floor(extract(epoch FROM (now() - coalesce(query_start, xact_start, backend_start))))::bigint AS time,
       query
FROM pg_stat_activity
ORDER BY time DESC NULLS LAST`;

/** Scalar query that returns the viewer's own backend pid. */
export const PG_OWN_SESSION_SQL = "SELECT pg_backend_pid()";

export interface PgProcessRow {
  id: number;
  user: string;
  db: string | null;
  client: string;
  app: string | null;
  state: string | null;
  wait: string | null;
  time: number;
  query: string | null;
}

function columnIndex(columns: string[], name: string): number {
  const target = name.toLowerCase();
  return columns.findIndex((column) => column.toLowerCase() === target);
}

function asString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

function asNullableString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const text = String(value);
  return text.length === 0 ? null : text;
}

function asNumber(value: unknown): number {
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Map a `pg_stat_activity` result into typed rows. Column names are matched
 * case-insensitively and any missing column degrades to an empty value rather
 * than throwing, so forks that rename or drop a column still render.
 */
export function mapPgProcessRows(result: QueryResult | null | undefined): PgProcessRow[] {
  if (!result || !Array.isArray(result.columns) || !Array.isArray(result.rows)) return [];
  const columns = result.columns;
  const pidIdx = columnIndex(columns, "pid");
  const userIdx = columnIndex(columns, "user");
  const dbIdx = columnIndex(columns, "db");
  const clientIdx = columnIndex(columns, "client");
  const appIdx = columnIndex(columns, "app");
  const stateIdx = columnIndex(columns, "state");
  const waitIdx = columnIndex(columns, "wait");
  const timeIdx = columnIndex(columns, "time");
  const queryIdx = columnIndex(columns, "query");

  const cell = (row: (string | number | boolean | null)[], idx: number) => (idx >= 0 ? row[idx] : null);

  return result.rows.map((row) => ({
    id: asNumber(cell(row, pidIdx)),
    user: asString(cell(row, userIdx)),
    db: asNullableString(cell(row, dbIdx)),
    client: asString(cell(row, clientIdx)),
    app: asNullableString(cell(row, appIdx)),
    state: asNullableString(cell(row, stateIdx)),
    wait: asNullableString(cell(row, waitIdx)),
    time: asNumber(cell(row, timeIdx)),
    query: asNullableString(cell(row, queryIdx)),
  }));
}

/**
 * Build a `SELECT pg_terminate_backend(<pid>)` statement. `pid` is validated as a
 * finite positive integer (never interpolated as free text) so there is no
 * injection path.
 */
export function buildPgKillSql(pid: number): string {
  if (!Number.isInteger(pid) || pid <= 0) {
    throw new Error(`Invalid backend pid: ${pid}`);
  }
  return `SELECT pg_terminate_backend(${pid})`;
}

/** Whether the given database type exposes the Postgres process-list viewer. */
export function supportsPgProcessList(dbType: DatabaseType | undefined): boolean {
  return !!dbType && PG_PROCESS_LIST_DB_TYPES.has(dbType);
}
