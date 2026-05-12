import type { ConnectionConfig, DatabaseType } from "@/types/database";

type ConnectionPresentationConfig = Pick<
  ConnectionConfig,
  "db_type" | "driver_profile" | "driver_label" | "host" | "port" | "database"
>;

const LOCAL_DATABASE_TYPES = new Set(["sqlite", "duckdb"]);

export function connectionIconType(connection?: Pick<ConnectionConfig, "db_type" | "driver_profile">): string {
  return connection?.driver_profile || connection?.db_type || "postgres";
}

export function connectionDriverLabel(connection?: Pick<ConnectionConfig, "db_type" | "driver_label">): string {
  return connection?.driver_label || connection?.db_type.toUpperCase() || "";
}

export function connectionEndpointLabel(connection?: ConnectionPresentationConfig): string {
  if (!connection) return "";
  if (LOCAL_DATABASE_TYPES.has(connection.db_type)) {
    return connection.host || connection.database || "local";
  }
  if (connection.host && connection.port) return `${connection.host}:${connection.port}`;
  return connection.host || connection.database || "";
}

export function connectionUrlPlaceholder(dbType: DatabaseType): string {
  switch (dbType) {
    case "mysql":
    case "doris":
    case "starrocks":
      return "mysql://user:password@host:port/database";

    case "postgres":
    case "gaussdb":
    case "redshift":
      return "postgresql://user:password@host:port/database";

    case "redis":
      return "redis://:password@host:port/0";

    case "sqlite":
      return "sqlite:///absolute/path/to/database.db";

    case "duckdb":
      return "duckdb:///absolute/path/to/database.duckdb";

    case "mongodb":
      return "mongodb://user:password@host:port/database";

    case "clickhouse":
      return "clickhouse://user:password@host:port/database";

    case "sqlserver":
      return "mssql://user:password@host:port/database";

    case "oracle":
      return "oracle://user:password@host:port/service_name";

    case "elasticsearch":
      return "http://user:password@host:port";

    case "dameng":
      return "dm://user:password@host:port";

    case "jdbc":
      return "jdbc:mysql://host:3306/database";

    default:
      return "postgresql://user:password@host:port/database";
  }
}

export function connectionOptionSubtitle(connection?: ConnectionPresentationConfig): string {
  return [connectionDriverLabel(connection), connectionEndpointLabel(connection)].filter(Boolean).join(" · ");
}
