import { strict as assert } from "node:assert";
import test from "node:test";
import { parseConnectionUrl } from "../src/lib/connectionUrl.ts";

test("parses postgres connection URLs", () => {
  assert.deepEqual(parseConnectionUrl("postgresql://alice:secret@db.example.com:5433/app?sslmode=require"), {
    dbType: "postgres",
    driverProfile: "postgres",
    driverLabel: "PostgreSQL",
    host: "db.example.com",
    port: 5433,
    username: "alice",
    password: "secret",
    database: "app",
    urlParams: "sslmode=require",
    ssl: false,
  });
});

test("parses mysql URLs with encoded credentials", () => {
  const parsed = parseConnectionUrl("mysql://root:p%40ss@127.0.0.1/shop?charset=utf8mb4");

  assert.equal(parsed.dbType, "mysql");
  assert.equal(parsed.driverProfile, "mysql");
  assert.equal(parsed.host, "127.0.0.1");
  assert.equal(parsed.port, 3306);
  assert.equal(parsed.username, "root");
  assert.equal(parsed.password, "p@ss");
  assert.equal(parsed.database, "shop");
  assert.equal(parsed.urlParams, "charset=utf8mb4");
});

test("parses JDBC URLs by using the inner database URL", () => {
  const postgres = parseConnectionUrl("jdbc:postgresql://alice:secret@db.example.com:5433/app?sslmode=require");
  assert.equal(postgres.dbType, "postgres");
  assert.equal(postgres.driverProfile, "postgres");
  assert.equal(postgres.host, "db.example.com");
  assert.equal(postgres.port, 5433);
  assert.equal(postgres.username, "alice");
  assert.equal(postgres.password, "secret");
  assert.equal(postgres.database, "app");
  assert.equal(postgres.urlParams, "sslmode=require");

  const mysql = parseConnectionUrl("jdbc:mysql://root:p%40ss@127.0.0.1:3307/shop?charset=utf8mb4");
  assert.equal(mysql.dbType, "mysql");
  assert.equal(mysql.driverProfile, "mysql");
  assert.equal(mysql.host, "127.0.0.1");
  assert.equal(mysql.port, 3307);
  assert.equal(mysql.username, "root");
  assert.equal(mysql.password, "p@ss");
  assert.equal(mysql.database, "shop");
  assert.equal(mysql.urlParams, "charset=utf8mb4");
});

test("parses SQL Server JDBC URLs with semicolon properties", () => {
  const parsed = parseConnectionUrl(
    "jdbc:sqlserver://sql.example.com:1434;databaseName=erp;user=sa;password=s%40cret;encrypt=true",
  );

  assert.equal(parsed.dbType, "sqlserver");
  assert.equal(parsed.driverProfile, "sqlserver");
  assert.equal(parsed.host, "sql.example.com");
  assert.equal(parsed.port, 1434);
  assert.equal(parsed.username, "sa");
  assert.equal(parsed.password, "s@cret");
  assert.equal(parsed.database, "erp");
  assert.equal(parsed.urlParams, "encrypt=true");
});

test("keeps MongoDB URLs as connection strings", () => {
  const source = "mongodb+srv://reader:secret@cluster.example.com/app?retryWrites=true";
  const parsed = parseConnectionUrl(source);

  assert.equal(parsed.dbType, "mongodb");
  assert.equal(parsed.driverProfile, "mongodb");
  assert.equal(parsed.host, "cluster.example.com");
  assert.equal(parsed.port, 27017);
  assert.equal(parsed.database, "app");
  assert.equal(parsed.connectionString, source);
  assert.equal(parsed.useMongoUrl, true);
  assert.equal(parsed.ssl, true);
});

test("uses selected HTTP-compatible profile for HTTP URLs", () => {
  const parsed = parseConnectionUrl("https://search.example.com:9243", "elasticsearch");

  assert.equal(parsed.dbType, "elasticsearch");
  assert.equal(parsed.driverProfile, "elasticsearch");
  assert.equal(parsed.host, "search.example.com");
  assert.equal(parsed.port, 9243);
  assert.equal(parsed.ssl, true);
});

test("rejects unsupported URL schemes", () => {
  assert.throws(() => parseConnectionUrl("ftp://example.com"), /Unsupported connection URL scheme/);
});
