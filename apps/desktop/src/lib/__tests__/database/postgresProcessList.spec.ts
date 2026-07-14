import { describe, expect, it } from "vitest";
import type { QueryResult } from "@/types/database";
import { buildPgKillSql, mapPgProcessRows, supportsPgProcessList } from "@/lib/database/postgresProcessList";
import { connectionSupportsProcessList, resolveProcessListDriver, resolveProcessListDriverForConnection, supportsProcessList } from "@/lib/database/processListDrivers";
import type { ConnectionConfig } from "@/types/database";

function result(columns: string[], rows: (string | number | boolean | null)[][]): QueryResult {
  return { columns, rows, affected_rows: 0, execution_time_ms: 0 };
}

describe("mapPgProcessRows", () => {
  it("maps a pg_stat_activity result into typed rows", () => {
    const rows = mapPgProcessRows(result(["pid", "user", "db", "client", "app", "state", "wait", "time", "query"], [[4211, "app", "shop", "10.0.0.4", "psql", "active", "Client:ClientRead", 12, "SELECT * FROM orders"]]));
    expect(rows).toEqual([
      {
        id: 4211,
        user: "app",
        db: "shop",
        client: "10.0.0.4",
        app: "psql",
        state: "active",
        wait: "Client:ClientRead",
        time: 12,
        query: "SELECT * FROM orders",
      },
    ]);
  });

  it("tolerates NULL columns and case-variant names", () => {
    const rows = mapPgProcessRows(result(["PID", "USER", "DB", "CLIENT", "APP", "STATE", "WAIT", "TIME", "QUERY"], [["4200", "postgres", null, "local", null, "idle", null, "340", null]]));
    expect(rows[0]).toMatchObject({ id: 4200, user: "postgres", db: null, app: null, state: "idle", wait: null, time: 340, query: null });
  });

  it("returns an empty array for empty or malformed input", () => {
    expect(mapPgProcessRows(null)).toEqual([]);
    expect(mapPgProcessRows(undefined)).toEqual([]);
    expect(mapPgProcessRows(result([], []))).toEqual([]);
  });
});

describe("buildPgKillSql", () => {
  it("builds pg_terminate_backend for a valid pid", () => {
    expect(buildPgKillSql(4211)).toBe("SELECT pg_terminate_backend(4211)");
  });

  it("rejects non-integer, zero, or negative pids", () => {
    expect(() => buildPgKillSql(1.5)).toThrow();
    expect(() => buildPgKillSql(0)).toThrow();
    expect(() => buildPgKillSql(-1)).toThrow();
    expect(() => buildPgKillSql(Number.NaN)).toThrow();
  });
});

describe("supportsPgProcessList", () => {
  it("covers the Postgres-kernel family and excludes divergent wire-protocol engines", () => {
    expect(supportsPgProcessList("postgres")).toBe(true);
    // Postgres-kernel forks are unverified for now, so they stay excluded.
    expect(supportsPgProcessList("opengauss")).toBe(false);
    expect(supportsPgProcessList("kingbase")).toBe(false);
    expect(supportsPgProcessList("redshift")).toBe(false);
    expect(supportsPgProcessList("questdb")).toBe(false);
    expect(supportsPgProcessList("mysql")).toBe(false);
    expect(supportsPgProcessList(undefined)).toBe(false);
  });
});

describe("resolveProcessListDriver", () => {
  it("routes MySQL and Postgres engines to distinct drivers", () => {
    const mysql = resolveProcessListDriver("mysql");
    const postgres = resolveProcessListDriver("postgres");
    expect(mysql?.buildKillSql(7)).toBe("KILL CONNECTION 7");
    expect(postgres?.buildKillSql(7)).toBe("SELECT pg_terminate_backend(7)");
    expect(resolveProcessListDriver("sqlite")).toBeNull();
  });

  it("unifies process-list support across both families", () => {
    expect(supportsProcessList("mysql")).toBe(true);
    expect(supportsProcessList("postgres")).toBe(true);
    expect(supportsProcessList("sqlite")).toBe(false);
    expect(supportsProcessList(undefined)).toBe(false);
  });
});

function conn(partial: Partial<ConnectionConfig>): ConnectionConfig {
  return { db_type: "mysql", ...partial } as ConnectionConfig;
}

describe("connectionSupportsProcessList", () => {
  it("gates on the real connection profile", () => {
    expect(connectionSupportsProcessList(conn({ db_type: "mysql" }))).toBe(true);
    expect(connectionSupportsProcessList(conn({ db_type: "postgres" }))).toBe(true);
    expect(connectionSupportsProcessList(conn({ db_type: "sqlite" }))).toBe(false);
    expect(connectionSupportsProcessList(undefined)).toBe(false);
  });

  it("resolves JDBC connections by their effective engine", () => {
    expect(connectionSupportsProcessList(conn({ db_type: "jdbc", connection_string: "jdbc:mysql://db:3306/app" }))).toBe(true);
    expect(connectionSupportsProcessList(conn({ db_type: "jdbc", connection_string: "jdbc:postgresql://db:5432/app" }))).toBe(true);
  });

  it("excludes Kyuubi / Hive2 JDBC that infer as MySQL but cannot serve SHOW PROCESSLIST", () => {
    expect(connectionSupportsProcessList(conn({ db_type: "jdbc", connection_string: "jdbc:kyuubi://gw:10009/" }))).toBe(false);
    expect(connectionSupportsProcessList(conn({ db_type: "jdbc", connection_string: "jdbc:hive2://hs2:10000/default" }))).toBe(false);
  });
});

describe("resolveProcessListDriverForConnection", () => {
  it("returns the engine driver for a JDBC MySQL connection and null for lookalikes", () => {
    expect(resolveProcessListDriverForConnection(conn({ db_type: "jdbc", connection_string: "jdbc:mysql://db/app" }))?.buildKillSql(9)).toBe("KILL CONNECTION 9");
    expect(resolveProcessListDriverForConnection(conn({ db_type: "jdbc", connection_string: "jdbc:hive2://hs2/default" }))).toBeNull();
  });
});
