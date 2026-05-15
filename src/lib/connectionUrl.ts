import type { ConnectionConfig, DatabaseType } from "@/types/database";

export interface ParsedConnectionUrl {
  dbType: DatabaseType;
  driverProfile: string;
  driverLabel: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database?: string;
  urlParams: string;
  ssl: boolean;
  connectionString?: string;
  useMongoUrl?: boolean;
}

type ConnectionProfile = {
  type: DatabaseType;
  profile: string;
  label: string;
  defaultPort: number;
};

const SCHEME_PROFILES: Record<string, ConnectionProfile> = {
  mysql: { type: "mysql", profile: "mysql", label: "MySQL", defaultPort: 3306 },
  mariadb: { type: "mysql", profile: "mariadb", label: "MariaDB", defaultPort: 3306 },
  postgres: { type: "postgres", profile: "postgres", label: "PostgreSQL", defaultPort: 5432 },
  postgresql: { type: "postgres", profile: "postgres", label: "PostgreSQL", defaultPort: 5432 },
  redshift: { type: "redshift", profile: "redshift", label: "Redshift", defaultPort: 5439 },
  redis: { type: "redis", profile: "redis", label: "Redis", defaultPort: 6379 },
  rediss: { type: "redis", profile: "redis", label: "Redis", defaultPort: 6379 },
  mongodb: { type: "mongodb", profile: "mongodb", label: "MongoDB", defaultPort: 27017 },
  "mongodb+srv": { type: "mongodb", profile: "mongodb", label: "MongoDB", defaultPort: 27017 },
  clickhouse: { type: "clickhouse", profile: "clickhouse", label: "ClickHouse", defaultPort: 8123 },
  sqlserver: { type: "sqlserver", profile: "sqlserver", label: "SQL Server", defaultPort: 1433 },
  mssql: { type: "sqlserver", profile: "sqlserver", label: "SQL Server", defaultPort: 1433 },
  oracle: { type: "oracle", profile: "oracle", label: "Oracle", defaultPort: 1521 },
  elasticsearch: { type: "elasticsearch", profile: "elasticsearch", label: "Elasticsearch", defaultPort: 9200 },
  dm: { type: "dameng", profile: "dm", label: "DM (Dameng)", defaultPort: 5236 },
  dameng: { type: "dameng", profile: "dm", label: "DM (Dameng)", defaultPort: 5236 },
  gaussdb: { type: "gaussdb", profile: "gaussdb", label: "GaussDB", defaultPort: 5432 },
  opengauss: { type: "gaussdb", profile: "opengauss", label: "openGauss", defaultPort: 5432 },
};

const HTTP_SELECTED_PROFILES: Record<string, ConnectionProfile> = {
  clickhouse: SCHEME_PROFILES.clickhouse,
  elasticsearch: SCHEME_PROFILES.elasticsearch,
};

function decodeUrlPart(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function databaseFromPath(pathname: string): string | undefined {
  const value = pathname.replace(/^\/+/, "");
  if (!value) return undefined;
  return decodeUrlPart(value.split("/")[0]);
}

function profileForScheme(scheme: string, preferredProfile?: string): ConnectionProfile | undefined {
  if ((scheme === "http" || scheme === "https") && preferredProfile) {
    return HTTP_SELECTED_PROFILES[preferredProfile];
  }
  return SCHEME_PROFILES[scheme];
}

function parseJdbcSqlServerUrl(source: string): ParsedConnectionUrl | null {
  const match = source.match(/^jdbc:sqlserver:\/\/([^;:/]+)(?::(\d+))?(?:;(.*))?$/i);
  if (!match) return null;

  const profile = SCHEME_PROFILES.sqlserver;
  const props = new Map<string, string>();
  const urlParams: string[] = [];
  for (const part of (match[3] || "").split(";")) {
    if (!part) continue;
    const [rawKey, ...rest] = part.split("=");
    const key = rawKey.trim();
    const value = rest.join("=");
    const normalizedKey = key.toLowerCase();
    if (normalizedKey === "databasename" || normalizedKey === "database" || normalizedKey === "user") {
      props.set(normalizedKey, value);
    } else if (normalizedKey === "password") {
      props.set(normalizedKey, value);
    } else {
      urlParams.push(part);
    }
  }

  return {
    dbType: profile.type,
    driverProfile: profile.profile,
    driverLabel: profile.label,
    host: match[1],
    port: match[2] ? Number(match[2]) : profile.defaultPort,
    username: decodeUrlPart(props.get("user") || ""),
    password: decodeUrlPart(props.get("password") || ""),
    database: decodeUrlPart(props.get("databasename") || props.get("database") || "") || undefined,
    urlParams: urlParams.join(";"),
    ssl: false,
  };
}

export function parseConnectionUrl(value: string, preferredProfile?: string): ParsedConnectionUrl {
  const input = value.trim();
  if (!input) {
    throw new Error("Connection URL is empty");
  }
  const jdbcSqlServer = parseJdbcSqlServerUrl(input);
  if (jdbcSqlServer) return jdbcSqlServer;
  const source = input.replace(/^jdbc:/i, "");

  let parsed: URL;
  try {
    parsed = new URL(source);
  } catch {
    throw new Error("Invalid connection URL");
  }

  const scheme = parsed.protocol.replace(/:$/, "").toLowerCase();
  const profile = profileForScheme(scheme, preferredProfile);
  if (!profile) {
    throw new Error(`Unsupported connection URL scheme: ${scheme}`);
  }

  const urlParams = parsed.search.replace(/^\?/, "");
  if (profile.type === "mongodb") {
    return {
      dbType: profile.type,
      driverProfile: profile.profile,
      driverLabel: profile.label,
      host: parsed.hostname,
      port: parsed.port ? Number(parsed.port) : profile.defaultPort,
      username: decodeUrlPart(parsed.username),
      password: decodeUrlPart(parsed.password),
      database: databaseFromPath(parsed.pathname),
      urlParams,
      ssl: scheme === "mongodb+srv",
      connectionString: source,
      useMongoUrl: true,
    };
  }

  return {
    dbType: profile.type,
    driverProfile: profile.profile,
    driverLabel: profile.label,
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : profile.defaultPort,
    username: decodeUrlPart(parsed.username),
    password: decodeUrlPart(parsed.password),
    database: databaseFromPath(parsed.pathname),
    urlParams,
    ssl: scheme === "rediss" || scheme === "https",
  };
}

export function applyParsedConnectionUrl(
  config: Omit<ConnectionConfig, "id">,
  parsed: ParsedConnectionUrl,
): Omit<ConnectionConfig, "id"> {
  return {
    ...config,
    db_type: parsed.dbType,
    driver_profile: parsed.driverProfile,
    driver_label: parsed.driverLabel,
    host: parsed.host,
    port: parsed.port,
    username: parsed.username,
    password: parsed.password,
    database: parsed.database,
    url_params: parsed.urlParams,
    ssl: parsed.ssl,
    connection_string: parsed.connectionString,
  };
}
