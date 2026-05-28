import type { SqlSnippet } from "@/types/database";

const SQL_KEYWORDS = [
  "SELECT",
  "FROM",
  "WHERE",
  "JOIN",
  "LEFT",
  "RIGHT",
  "INNER",
  "OUTER",
  "ON",
  "GROUP BY",
  "ORDER BY",
  "ASC",
  "DESC",
  "HAVING",
  "LIMIT",
  "OFFSET",
  "INSERT",
  "INTO",
  "VALUES",
  "UPDATE",
  "SET",
  "DELETE",
  "CREATE",
  "TABLE",
  "VIEW",
  "AS",
  "AND",
  "OR",
  "NOT",
  "IN",
  "IS",
  "NULL",
  "LIKE",
  "DISTINCT",
  "UNION",
  "ALL",
  "EXISTS",
  "BETWEEN",
  "CASE",
  "WHEN",
  "THEN",
  "ELSE",
  "END",
  "IF",
  "COUNT",
  "SUM",
  "AVG",
  "MIN",
  "MAX",
  "IIF",
  "CHOOSE",
  "COALESCE",
  "CAST",
  "ALTER",
  "DROP",
  "ADD",
  "COLUMN",
  "INDEX",
  "PRIMARY",
  "KEY",
  "FOREIGN",
  "REFERENCES",
  "CONSTRAINT",
  "DEFAULT",
  "CHECK",
  "UNIQUE",
  "BEGIN",
  "COMMIT",
  "ROLLBACK",
  "TRUNCATE",
  "EXPLAIN",
  "ANALYZE",
  "WITH",
  "RECURSIVE",
  "OVER",
  "PARTITION BY",
  "ROW_NUMBER",
  "RANK",
  "DENSE_RANK",
  "LAG",
  "LEAD",
  "FIRST_VALUE",
  "LAST_VALUE",
  "NTILE",
  "CROSS",
  "APPLY",
  "CROSS APPLY",
  "OUTER APPLY",
  "ISJSON",
  "JSON_ARRAY",
  "JSON_ARRAYAGG",
  "JSON_ARRAY_APPEND",
  "JSON_ARRAY_INSERT",
  "JSON_CONTAINS",
  "JSON_CONTAINS_PATH",
  "JSON_DEPTH",
  "JSON_EXTRACT",
  "JSON_INSERT",
  "JSON_KEYS",
  "JSON_LENGTH",
  "JSON_MERGE_PATCH",
  "JSON_MERGE_PRESERVE",
  "JSON_MODIFY",
  "JSON_OBJECT",
  "JSON_OBJECTAGG",
  "JSON_OVERLAPS",
  "JSON_PATH_EXISTS",
  "JSON_PRETTY",
  "JSON_QUERY",
  "JSON_QUOTE",
  "JSON_REMOVE",
  "JSON_REPLACE",
  "JSON_SCHEMA_VALID",
  "JSON_SEARCH",
  "JSON_SET",
  "JSON_STORAGE_FREE",
  "JSON_STORAGE_SIZE",
  "JSON_TABLE",
  "JSON_TYPE",
  "JSON_UNQUOTE",
  "JSON_VALID",
  "JSON_VALUE",
  "OPENJSON",
  "OPENXML",
  "OPENROWSET",
  "FULL",
  "NATURAL",
  "USING",
  "LATERAL",
  "UNNEST",
  "FILTER",
  "EXCLUDE",
  "REPLACE",
  "QUALIFY",
  "PIVOT",
  "UNPIVOT",
  "ASOF",
  "POSITIONAL",
  "ANTI",
  "SEMI",
  "SAMPLE",
  "TABLESAMPLE",
  "STRUCT",
  "MAP",
  "LIST",
  "ARRAY",
  "LAMBDA",
  "LIST_TRANSFORM",
  "READ_CSV",
  "READ_PARQUET",
  "READ_JSON",
  "COPY",
  "EXPORT",
  "IMPORT",
  "DESCRIBE",
  "SHOW",
  "SUMMARIZE",
  "PRAGMA",
  "BIGINT",
  "BINARY",
  "BIT",
  "CHAR",
  "DATE",
  "DATETIME",
  "DATETIME2",
  "DATETIMEOFFSET",
  "DECIMAL",
  "FLOAT",
  "IMAGE",
  "INT",
  "MONEY",
  "NCHAR",
  "NTEXT",
  "NUMERIC",
  "NVARCHAR",
  "REAL",
  "SMALLDATETIME",
  "SMALLINT",
  "SMALLMONEY",
  "TEXT",
  "TIME",
  "TIMESTAMP",
  "TINYINT",
  "UNIQUEIDENTIFIER",
  "VARBINARY",
  "VARCHAR",
  "XML",
  // Common built-in functions
  "ABS",
  "CEIL",
  "CEILING",
  "FLOOR",
  "ROUND",
  "MOD",
  "POWER",
  "SQRT",
  "SIGN",
  "TRUNCATE",
  "CONCAT",
  "CONCAT_WS",
  "LENGTH",
  "CHAR_LENGTH",
  "UPPER",
  "LOWER",
  "TRIM",
  "LTRIM",
  "RTRIM",
  "SUBSTRING",
  "SUBSTR",
  "INSTR",
  "LOCATE",
  "LPAD",
  "RPAD",
  "REVERSE",
  "REPEAT",
  "SPACE",
  "FORMAT",
  "HEX",
  "UNHEX",
  "NOW",
  "CURDATE",
  "CURTIME",
  "DATE_ADD",
  "DATE_SUB",
  "DATE_FORMAT",
  "DATEDIFF",
  "TIMESTAMPDIFF",
  "EXTRACT",
  "YEAR",
  "MONTH",
  "DAY",
  "HOUR",
  "MINUTE",
  "SECOND",
  "DAYOFWEEK",
  "DAYOFYEAR",
  "LAST_DAY",
  "STR_TO_DATE",
  "CONVERT",
  "IFNULL",
  "NULLIF",
  "GREATEST",
  "LEAST",
  "GROUP_CONCAT",
  "FIND_IN_SET",
  "FIELD",
  "ELT",
  "REGEXP",
  "REGEXP_LIKE",
  "REGEXP_REPLACE",
  "REGEXP_SUBSTR",
  "UUID",
  "MD5",
  "SHA1",
  "SHA2",
  "CRC32",
];

// Keywords that appear in nearly every SQL query — boosted so frequency beats length tie-breaking.
// E.g. typing "WH" should rank WHERE (high frequency) above WHEN (CASE-only).
const HIGH_FREQUENCY_KEYWORDS = new Set([
  "SELECT",
  "FROM",
  "WHERE",
  "AND",
  "OR",
  "JOIN",
  "ON",
  "IN",
  "AS",
  "GROUP BY",
  "ORDER BY",
  "LEFT",
  "RIGHT",
  "INNER",
  "OUTER",
  "INSERT",
  "INTO",
  "VALUES",
  "UPDATE",
  "SET",
  "DELETE",
  "NOT",
  "NULL",
  "IS",
  "LIKE",
  "DISTINCT",
  "HAVING",
  "LIMIT",
  "COUNT",
  "SUM",
  "AVG",
  "MAX",
  "MIN",
  "CASE",
  "UNION",
  "ALL",
  "ASC",
  "DESC",
  "BETWEEN",
  "EXISTS",
]);

const TABLE_TRIGGER_KEYWORDS = new Set(["from", "join", "update", "into", "table", "describe", "explain", "apply"]);
const EXCLUSIVE_TABLE_TRIGGER_KEYWORDS = new Set(["from", "join", "update", "into", "apply"]);
const JOIN_MODIFIERS = new Set(["left", "right", "inner", "outer", "cross", "full", "natural"]);
const MAX_TABLE_COMPLETION_ITEMS = 200;

// Keywords that only make sense in DDL / statement-start contexts (not inside SELECT/INSERT/UPDATE/DELETE)
const DDL_ONLY_KEYWORDS = new Set([
  "CREATE",
  "ALTER",
  "DROP",
  "TABLE",
  "VIEW",
  "INDEX",
  "COLUMN",
  "ADD",
  "CONSTRAINT",
  "PRIMARY",
  "KEY",
  "FOREIGN",
  "REFERENCES",
  "DEFAULT",
  "CHECK",
  "UNIQUE",
  "BEGIN",
  "COMMIT",
  "ROLLBACK",
  "TRUNCATE",
  "EXPLAIN",
  "DESCRIBE",
  "SHOW",
  "SUMMARIZE",
  "PRAGMA",
  "COPY",
  "EXPORT",
  "IMPORT",
  "IF",
]);

// Data type keywords — only relevant in DDL (CREATE/ALTER TABLE)
const DATA_TYPE_KEYWORDS = new Set([
  "BIGINT",
  "BINARY",
  "BIT",
  "CHAR",
  "DATE",
  "DATETIME",
  "DATETIME2",
  "DATETIMEOFFSET",
  "DECIMAL",
  "FLOAT",
  "IMAGE",
  "INT",
  "MONEY",
  "NCHAR",
  "NTEXT",
  "NUMERIC",
  "NVARCHAR",
  "REAL",
  "SMALLDATETIME",
  "SMALLINT",
  "SMALLMONEY",
  "TEXT",
  "TIME",
  "TIMESTAMP",
  "TINYINT",
  "UNIQUEIDENTIFIER",
  "VARBINARY",
  "VARCHAR",
  "XML",
]);

// Window functions that should use OVER() completion
const WINDOW_FUNCTIONS = new Set([
  "ROW_NUMBER",
  "RANK",
  "DENSE_RANK",
  "LAG",
  "LEAD",
  "FIRST_VALUE",
  "LAST_VALUE",
  "NTILE",
]);

function getFunctionDescriptions(t?: SqlCompletionTranslations): Map<string, string> {
  const d = t?.functionDescriptions ?? {};
  return new Map<string, string>([
    ["COUNT", d.COUNT || "返回行数"],
    ["SUM", d.SUM || "返回数值列的总和"],
    ["AVG", d.AVG || "返回数值列的平均值"],
    ["MIN", d.MIN || "返回最小值"],
    ["MAX", d.MAX || "返回最大值"],
    ["GROUP_CONCAT", d.GROUP_CONCAT || "将分组中的值连接为字符串"],
    ["STRING_AGG", d.STRING_AGG || "将分组中的字符串连接起来"],
    ["CONCAT", d.CONCAT || "连接多个字符串"],
    ["CONCAT_WS", d.CONCAT_WS || "使用分隔符连接多个字符串"],
    ["SUBSTRING", d.SUBSTRING || "提取子字符串"],
    ["REPLACE", d.REPLACE || "替换字符串中的内容"],
    ["TRIM", d.TRIM || "去除首尾空格"],
    ["UPPER", d.UPPER || "转换为大写"],
    ["LOWER", d.LOWER || "转换为小写"],
    ["LENGTH", d.LENGTH || "返回字符串长度"],
    ["REGEXP_REPLACE", d.REGEXP_REPLACE || "使用正则表达式替换"],
    ["DATE_FORMAT", d.DATE_FORMAT || "按指定格式格式化日期"],
    ["DATEDIFF", d.DATEDIFF || "计算两个日期的差值"],
    ["DATE_ADD", d.DATE_ADD || "对日期进行加法运算"],
    ["DATE_SUB", d.DATE_SUB || "对日期进行减法运算"],
    ["EXTRACT", d.EXTRACT || "提取日期中的指定部分"],
    ["NOW", d.NOW || "返回当前日期时间"],
    ["ROUND", d.ROUND || "四舍五入到指定小数位"],
    ["FLOOR", d.FLOOR || "向下取整"],
    ["CEIL", d.CEIL || "向上取整"],
    ["ABS", d.ABS || "返回绝对值"],
    ["MOD", d.MOD || "返回除法余数"],
    ["COALESCE", d.COALESCE || "返回第一个非 NULL 的参数"],
    ["IFNULL", d.IFNULL || "如果为 NULL 则返回替代值"],
    ["NULLIF", d.NULLIF || "如果相等则返回 NULL"],
    ["CAST", d.CAST || "将表达式转换为指定类型"],
    ["JSON_EXTRACT", d.JSON_EXTRACT || "从 JSON 中提取值"],
    ["JSON_VALUE", d.JSON_VALUE || "从 JSON 中提取标量值"],
    ["JSON_OBJECT", d.JSON_OBJECT || "创建 JSON 对象"],
    ["JSON_ARRAY", d.JSON_ARRAY || "创建 JSON 数组"],
  ]);
}

export const DEFAULT_SQL_SNIPPETS: SqlSnippet[] = [
  {
    id: "builtin-sel",
    label: "select *",
    prefix: "sel",
    body: "SELECT *\nFROM table\nLIMIT 100;",
  },
  {
    id: "builtin-ins",
    label: "insert into",
    prefix: "ins",
    body: "INSERT INTO table (columns)\nVALUES (values);",
  },
  {
    id: "builtin-upd",
    label: "update set",
    prefix: "upd",
    body: "UPDATE table\nSET column = value\nWHERE condition;",
  },
  {
    id: "builtin-cte",
    label: "common table expression",
    prefix: "cte",
    body: "WITH name AS (\n  SELECT columns\n  FROM table\n)\nSELECT *\nFROM name;",
  },
  {
    id: "builtin-join",
    label: "join",
    prefix: "join",
    body: "JOIN table ON left_column = right_column",
  },
  {
    id: "builtin-case",
    label: "case when",
    prefix: "case",
    body: "CASE\n  WHEN condition THEN value\n  ELSE default\nEND",
  },
  {
    id: "builtin-ct",
    label: "create table",
    prefix: "ct",
    body: "CREATE TABLE table (\n  column type\n);",
  },
  {
    id: "builtin-ex",
    label: "exists",
    prefix: "ex",
    body: "EXISTS (\n  SELECT 1\n  FROM table\n  WHERE condition\n)",
  },
  {
    id: "builtin-nex",
    label: "not exists",
    prefix: "nex",
    body: "NOT EXISTS (\n  SELECT 1\n  FROM table\n  WHERE condition\n)",
  },
  {
    id: "builtin-at",
    label: "alter table add column",
    prefix: "at",
    body: "ALTER TABLE table\nADD COLUMN column type;",
  },
  {
    id: "builtin-ci",
    label: "create index",
    prefix: "ci",
    body: "CREATE INDEX idx_name\nON table (column);",
  },
];

const SQL_FUNCTION_SIGNATURES = new Map<string, string[]>([
  // Aggregate
  ["COUNT", ["expression"]],
  ["SUM", ["expression"]],
  ["AVG", ["expression"]],
  ["MIN", ["expression"]],
  ["MAX", ["expression"]],
  ["GROUP_CONCAT", ["expression", "separator"]],
  ["STRING_AGG", ["expression", "separator"]],
  ["ARRAY_AGG", ["expression"]],
  // String
  ["CONCAT", ["value", "...values"]],
  ["CONCAT_WS", ["separator", "...values"]],
  ["SUBSTRING", ["string", "start", "length"]],
  ["SUBSTR", ["string", "start", "length"]],
  ["REPLACE", ["string", "old", "new"]],
  ["TRIM", ["string"]],
  ["LTRIM", ["string"]],
  ["RTRIM", ["string"]],
  ["UPPER", ["string"]],
  ["LOWER", ["string"]],
  ["LENGTH", ["string"]],
  ["LPAD", ["string", "length", "pad"]],
  ["RPAD", ["string", "length", "pad"]],
  ["INSTR", ["string", "substring"]],
  ["LOCATE", ["substring", "string"]],
  ["REVERSE", ["string"]],
  ["REPEAT", ["string", "count"]],
  ["SPACE", ["count"]],
  ["FORMAT", ["number", "decimals"]],
  ["REGEXP_REPLACE", ["string", "pattern", "replacement"]],
  ["REGEXP_SUBSTR", ["string", "pattern"]],
  ["SPLIT_PART", ["string", "delimiter", "part"]],
  // Date / Time
  ["DATE_FORMAT", ["date", "format"]],
  ["DATEDIFF", ["date1", "date2"]],
  ["TIMESTAMPDIFF", ["unit", "datetime_expr1", "datetime_expr2"]],
  ["DATE_ADD", ["date", "interval"]],
  ["DATE_SUB", ["date", "interval"]],
  ["EXTRACT", ["unit", "date"]],
  ["YEAR", ["date"]],
  ["MONTH", ["date"]],
  ["DAY", ["date"]],
  ["HOUR", ["datetime"]],
  ["MINUTE", ["datetime"]],
  ["SECOND", ["datetime"]],
  ["DAYOFWEEK", ["date"]],
  ["DAYOFYEAR", ["date"]],
  ["LAST_DAY", ["date"]],
  ["STR_TO_DATE", ["string", "format"]],
  ["NOW", []],
  ["CURDATE", []],
  ["CURTIME", []],
  // Numeric
  ["ROUND", ["number", "decimals"]],
  ["FLOOR", ["number"]],
  ["CEIL", ["number"]],
  ["CEILING", ["number"]],
  ["ABS", ["number"]],
  ["MOD", ["dividend", "divisor"]],
  ["POWER", ["base", "exponent"]],
  ["SQRT", ["number"]],
  ["SIGN", ["number"]],
  ["TRUNCATE", ["number", "decimals"]],
  ["RAND", []],
  // Conditional
  ["COALESCE", ["value", "...values"]],
  ["IFNULL", ["expression", "fallback"]],
  ["NULLIF", ["expression1", "expression2"]],
  ["CAST", ["expression", "type"]],
  ["CONVERT", ["expression", "type"]],
  ["GREATEST", ["...values"]],
  ["LEAST", ["...values"]],
  ["IIF", ["condition", "true_value", "false_value"]],
  // Hash / Crypto
  ["MD5", ["string"]],
  ["SHA1", ["string"]],
  ["SHA2", ["string", "bit_length"]],
  ["UUID", []],
  // JSON
  ["JSON_EXTRACT", ["json", "path"]],
  ["JSON_VALUE", ["json", "path"]],
  ["JSON_QUERY", ["json", "path"]],
  ["JSON_OBJECT", ["key", "value", "...pairs"]],
  ["JSON_ARRAY", ["...values"]],
  ["JSON_SET", ["json", "path", "value"]],
  ["JSON_REMOVE", ["json", "path"]],
  ["JSON_CONTAINS", ["json", "value"]],
  ["JSON_LENGTH", ["json"]],
  ["JSON_KEYS", ["json"]],
  ["JSON_TYPE", ["json"]],
  ["JSON_PRETTY", ["json"]],
  ["JSON_VALID", ["json"]],
  ["JSON_ARRAYAGG", ["expression"]],
  ["JSON_OBJECTAGG", ["key", "value"]],
]);

export interface SqlCompletionTable {
  name: string;
  schema?: string;
  type?: "table" | "view";
}

export interface SqlCompletionColumn {
  name: string;
  table: string;
  schema?: string;
  dataType?: string;
  isNullable?: boolean;
}

export interface SqlCompletionItem {
  label: string;
  type: "keyword" | "table" | "column" | "snippet" | "function" | "schema";
  detail?: string;
  apply?: string;
  boost: number;
}

export interface SqlCompletionReferencedTable {
  name: string;
  schema?: string;
  alias?: string;
  columns?: string[];
}

export type SqlStatementKind = "select" | "insert" | "update" | "delete" | "create" | "alter" | "drop" | "unknown";

export interface SqlCompletionContext {
  prefix: string;
  qualifier?: string;
  suggestTables: boolean;
  suggestColumns: boolean;
  suggestKeywords: boolean;
  suggestJoinConditions: boolean;
  exclusiveTableSuggestions: boolean;
  exclusiveColumnSuggestions: boolean;
  prioritizeSelectAliases: boolean;
  selectAliases: string[];
  referencedTables: SqlCompletionReferencedTable[];
  insertTable?: string;
  insertSchema?: string;
  statementKind: SqlStatementKind;
  tableTriggerWord?: string;
  isGroupBy: boolean;
  nonAggregatedSelectColumns: string[];
  comparisonLeftColumn?: string;
  onStar: boolean;
}

export interface SqlFunctionSignatureHelp {
  name: string;
  signature: string;
  activeParameter: number;
  parameters: string[];
}

export interface SqlCompletionTranslations {
  nullValue: string;
  isNull: string;
  isNotNull: string;
  stringLiteral: string;
  numericLiteral: string;
  booleanValue: string;
  starExpansionColumns: string;
  functionDescriptions: Record<string, string>;
}

export function buildSqlCompletionItems(
  sql: string,
  cursor: number,
  input: {
    tables: SqlCompletionTable[];
    columnsByTable: Map<string, SqlCompletionColumn[]>;
    schemas?: string[];
    translations?: SqlCompletionTranslations;
  },
): SqlCompletionItem[] {
  const context = getSqlCompletionContext(sql, cursor);
  return buildSqlCompletionItemsFromContext(context, input);
}

export function buildSqlCompletionItemsFromContext(
  context: SqlCompletionContext,
  input: {
    tables: SqlCompletionTable[];
    columnsByTable: Map<string, SqlCompletionColumn[]>;
    schemas?: string[];
    translations?: SqlCompletionTranslations;
    snippets?: SqlSnippet[];
  },
): SqlCompletionItem[] {
  const items: SqlCompletionItem[] = [];
  const t = input.translations;

  if (!context.exclusiveTableSuggestions && !context.exclusiveColumnSuggestions) {
    items.push(...buildSnippetItems(context.prefix, input.snippets ?? DEFAULT_SQL_SNIPPETS));
    items.push(...buildFunctionSnippetItems(context.prefix, getFunctionDescriptions(t)));
  }

  if (!context.exclusiveTableSuggestions && !context.exclusiveColumnSuggestions && context.prioritizeSelectAliases) {
    items.push(...buildSelectAliasItems(context));
  }

  if (
    !context.exclusiveTableSuggestions &&
    !context.exclusiveColumnSuggestions &&
    context.isGroupBy &&
    context.nonAggregatedSelectColumns.length > 0
  ) {
    items.push(...buildNonAggregatedColumnItems(context, input.columnsByTable));
  }

  if (!context.exclusiveTableSuggestions && !context.exclusiveColumnSuggestions && context.suggestJoinConditions) {
    items.push(...buildJoinConditionItems(context, input.columnsByTable));
  }

  if (context.suggestKeywords) {
    items.push(...buildKeywordItems(context.prefix, context));
  }

  if (!context.exclusiveTableSuggestions && context.suggestColumns) {
    items.push(...buildColumnItems(context, input.columnsByTable));
  }

  // Suggest aliases for referenced tables (independent of table-suggestion mode)
  if (context.referencedTables.length > 0 && !context.suggestColumns && !context.insertTable) {
    items.push(...buildAliasItems(context));
  }

  if (!context.exclusiveColumnSuggestions && context.suggestTables) {
    items.push(...buildTableItems(context.prefix, input.tables));
    if (input.schemas && input.schemas.length > 0) {
      items.push(...buildSchemaItems(context.prefix, input.schemas));
    }
  }

  // Type-aware value hints after comparison operator
  if (context.comparisonLeftColumn && context.suggestKeywords) {
    items.push(...buildComparisonValueItems(context, input.columnsByTable, t));
  }

  // SELECT * expansion
  if (context.onStar) {
    const starItem = buildStarExpansionItem(input.columnsByTable, t);
    if (starItem) items.push(starItem);
  }

  return dedupeAndSort(items);
}

export function shouldAutoOpenSqlCompletion(sql: string, cursor: number): boolean {
  const previousChar = sql[cursor - 1];
  if (!previousChar) return false;
  if (/\bon\s+$/i.test(sql.slice(0, cursor))) return true;
  if (/[,;()[\]]/.test(previousChar)) return false;
  const context = getSqlCompletionContext(sql, cursor);
  if (context.exclusiveTableSuggestions || context.exclusiveColumnSuggestions || context.suggestTables) return true;
  return /[\w$.]/.test(previousChar);
}

export function getSqlCompletionResultValidFor(sql: string, cursor: number): RegExp | undefined {
  const context = getSqlCompletionContext(sql, cursor);
  return context.suggestTables ? undefined : /^[\w$]*$/;
}

export function getSqlFunctionSignatureHelp(sql: string, cursor: number): SqlFunctionSignatureHelp | null {
  const beforeCursor = sql.slice(0, cursor);
  const openParenIndex = findActiveFunctionOpenParen(beforeCursor);
  if (openParenIndex == null) return null;

  const beforeParen = beforeCursor.slice(0, openParenIndex).trimEnd();
  const name = /([A-Za-z_][\w$]*)$/.exec(beforeParen)?.[1]?.toUpperCase();
  if (!name) return null;

  const parameters = SQL_FUNCTION_SIGNATURES.get(name);
  if (!parameters) return null;

  const activeParameter = countTopLevelCommas(beforeCursor.slice(openParenIndex + 1));
  return {
    name,
    signature: `${name}(${parameters.join(", ")})`,
    activeParameter: Math.min(activeParameter, Math.max(0, parameters.length - 1)),
    parameters,
  };
}

/**
 * Find the start position of the SQL statement containing the cursor.
 * Respects semicolons and string literals.
 */
function extractStatementStart(sql: string, cursor: number): number {
  let start = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    if (ch === "'" && !inDoubleQuote) inSingleQuote = !inSingleQuote;
    else if (ch === '"' && !inSingleQuote) inDoubleQuote = !inDoubleQuote;
    else if (ch === ";" && !inSingleQuote && !inDoubleQuote) {
      if (i < cursor) {
        start = i + 1;
        while (start < sql.length && /\s/.test(sql[start])) start++;
      }
    }
  }
  return start;
}

/**
 * Extract the full SQL statement that contains the cursor position.
 * Respects semicolons and string literals.
 */
function extractStatementAt(sql: string, cursor: number): string {
  const start = extractStatementStart(sql, cursor);
  let end = sql.length;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  for (let i = start; i < sql.length; i++) {
    const ch = sql[i];
    if (ch === "'" && !inDoubleQuote) inSingleQuote = !inSingleQuote;
    else if (ch === '"' && !inSingleQuote) inDoubleQuote = !inDoubleQuote;
    else if (ch === ";" && !inSingleQuote && !inDoubleQuote && i >= cursor) {
      end = i;
      break;
    }
  }
  return sql.slice(start, end).trim();
}

function detectStatementKind(previousStatements: string): SqlStatementKind {
  const trimmed = previousStatements.trim();
  if (!trimmed) return "unknown";
  const firstWord = /^([A-Za-z_][\w$]*)/.exec(trimmed)?.[1]?.toLowerCase();
  if (!firstWord) return "unknown";
  const kindMap: Record<string, SqlStatementKind> = {
    select: "select",
    with: "select",
    insert: "insert",
    update: "update",
    delete: "delete",
    create: "create",
    alter: "alter",
    drop: "drop",
  };
  return kindMap[firstWord] ?? "unknown";
}

export function getSqlCompletionContext(sql: string, cursor: number): SqlCompletionContext {
  // Extract the full statement at cursor position for referenced tables
  const fullStatement = extractStatementAt(sql, cursor);

  // Content before cursor within the current statement
  const stmtStart = extractStatementStart(sql, cursor);
  const beforeCursor = sql.slice(stmtStart, cursor);

  const dottedMatch = /([A-Za-z_][\w$]*)\.([A-Za-z_][\w$]*)?$/.exec(beforeCursor);
  const plainMatch = /([A-Za-z_][\w$]*)$/.exec(beforeCursor);
  const prefix = dottedMatch?.[2] ?? plainMatch?.[1] ?? "";
  const qualifier = dottedMatch?.[1];
  const bareStart = dottedMatch
    ? beforeCursor.length - dottedMatch[0].length
    : beforeCursor.length - (plainMatch?.[1]?.length ?? 0);
  const beforeToken = beforeCursor.slice(0, Math.max(0, bareStart)).trimEnd();
  const lastWord = /([A-Za-z_][\w$]*)$/.exec(beforeToken)?.[1]?.toLowerCase() ?? "";

  const referencedTables = extractReferencedTables(fullStatement);

  // Merge CTE definitions into referenced tables
  const cteDefs = extractCteDefinitions(fullStatement);
  for (const cte of cteDefs) {
    if (!referencedTables.some((rt) => rt.name.toLowerCase() === cte.name.toLowerCase())) {
      referencedTables.push({ name: cte.name, columns: cte.columns });
    } else {
      const existing = referencedTables.find((rt) => rt.name.toLowerCase() === cte.name.toLowerCase());
      if (existing && !existing.columns) {
        existing.columns = cte.columns;
      }
    }
  }

  // Merge subquery alias references
  const subqueryRefs = extractSubqueryReferences(fullStatement);
  for (const sq of subqueryRefs) {
    if (!referencedTables.some((rt) => rt.name.toLowerCase() === sq.name.toLowerCase() && rt.alias === sq.alias)) {
      referencedTables.push(sq);
    }
  }

  // Detect INSERT INTO table (column list) context
  const insertInfo = detectInsertColumnListContext(beforeCursor);

  const afterTableTrigger =
    TABLE_TRIGGER_KEYWORDS.has(lastWord) ||
    (JOIN_MODIFIERS.has(lastWord) && isFollowedByJoin(beforeToken)) ||
    isInTableListContext(beforeToken);
  const exclusiveTableSuggestions =
    EXCLUSIVE_TABLE_TRIGGER_KEYWORDS.has(lastWord) ||
    (JOIN_MODIFIERS.has(lastWord) && isFollowedByJoin(beforeToken)) ||
    isInTableListContext(beforeToken);
  const exclusiveColumnSuggestions = !!qualifier && !exclusiveTableSuggestions && !insertInfo;

  // Check if we're in a context where columns are expected
  const inColumnContext = isInColumnContext(beforeCursor) || !!insertInfo;
  const inJoinConditionContext = isInJoinConditionContext(beforeCursor);
  const prioritizeSelectAliases = isInOrderOrGroupByContext(beforeCursor);

  const statementKind = detectStatementKind(beforeCursor || fullStatement);

  return {
    prefix,
    qualifier: insertInfo ? undefined : qualifier,
    suggestTables: insertInfo ? false : afterTableTrigger,
    suggestColumns: !!qualifier || (inColumnContext && referencedTables.length > 0),
    suggestKeywords: !exclusiveTableSuggestions && !exclusiveColumnSuggestions && !insertInfo,
    suggestJoinConditions: insertInfo ? false : inJoinConditionContext && referencedTables.length >= 2,
    exclusiveTableSuggestions: insertInfo ? false : exclusiveTableSuggestions,
    exclusiveColumnSuggestions: exclusiveColumnSuggestions || !!insertInfo,
    prioritizeSelectAliases: insertInfo ? false : prioritizeSelectAliases,
    selectAliases: prioritizeSelectAliases ? extractSelectAliases(fullStatement) : [],
    referencedTables,
    insertTable: insertInfo?.table,
    insertSchema: insertInfo?.schema,
    statementKind,
    tableTriggerWord: lastWord || undefined,
    isGroupBy: isInGroupByContext(beforeCursor),
    nonAggregatedSelectColumns: extractNonAggregatedSelectColumns(fullStatement),
    comparisonLeftColumn: detectComparisonLeftColumn(beforeCursor),
    onStar: detectOnStar(beforeCursor),
  };
}

/**
 * Check if the content before cursor is in a column-expected context.
 */
function isInColumnContext(beforeCursor: string): boolean {
  if (!beforeCursor) return false;

  // Strip string literals
  const cleaned = beforeCursor.replace(/'[^']*'/g, "''").replace(/"[^"]*"/g, "''");

  // Get all words/tokens
  const lastWords = cleaned.trimEnd().split(/\s+/);

  // Check the last 3 words for column-context keywords
  for (let i = lastWords.length - 1; i >= Math.max(0, lastWords.length - 3); i--) {
    const word = lastWords[i]?.toLowerCase().replace(/[^a-z0-9.]/g, "") ?? "";
    // Operators that indicate column context
    if (/^[=<>!+\-*/(,]$/.test(word)) return true;
    // Keywords that directly precede column expressions
    if (["where", "on", "having", "set", "and", "or", "not", "is", "like", "in", "between", "select"].includes(word)) {
      return true;
    }
    // "ORDER BY" / "GROUP BY" — when we see "by", check the word before it
    if (word === "by" && i > 0) {
      const prevWord = lastWords[i - 1]?.toLowerCase() ?? "";
      if (["order", "group"].includes(prevWord)) return true;
    }
  }

  return false;
}

function isInJoinConditionContext(beforeCursor: string): boolean {
  const cleaned = beforeCursor
    .replace(/'[^']*'/g, "''")
    .replace(/"[^"]*"/g, "''")
    .toLowerCase();
  const lastJoinIndex = cleaned.lastIndexOf(" join ");
  const currentJoinSegment = lastJoinIndex >= 0 ? cleaned.slice(lastJoinIndex) : cleaned;
  if (!/\bon\b/.test(currentJoinSegment)) return false;
  return /\b(?:on|and)\s+[a-z0-9_$]*$/i.test(currentJoinSegment);
}

function isInOrderOrGroupByContext(beforeCursor: string): boolean {
  const cleaned = beforeCursor
    .replace(/'[^']*'/g, "''")
    .replace(/"[^"]*"/g, '""')
    .toLowerCase();
  const lastOrderBy = cleaned.lastIndexOf("order by");
  const lastGroupBy = cleaned.lastIndexOf("group by");
  const lastContext = Math.max(lastOrderBy, lastGroupBy);
  if (lastContext < 0) return false;

  const segment = cleaned.slice(lastContext);
  return !/\b(?:where|having|limit|offset|union|intersect|except|join|from)\b/.test(segment);
}

function isInGroupByContext(beforeCursor: string): boolean {
  const cleaned = beforeCursor
    .replace(/'[^']*'/g, "''")
    .replace(/"[^"]*"/g, '""')
    .toLowerCase();
  const lastGroupBy = cleaned.lastIndexOf("group by");
  if (lastGroupBy < 0) return false;
  // Make sure GROUP BY is after ORDER BY (if both exist) — we want the closest
  const lastOrderBy = cleaned.lastIndexOf("order by");
  if (lastOrderBy > lastGroupBy) return false;
  const segment = cleaned.slice(lastGroupBy);
  return !/\b(?:where|having|limit|offset|union|intersect|except|join|from)\b/.test(segment);
}

const AGGREGATE_FUNCTION_PATTERN =
  /^(COUNT|SUM|AVG|MIN|MAX|GROUP_CONCAT|STRING_AGG|ARRAY_AGG|JSON_ARRAYAGG|JSON_OBJECTAGG)\s*\(/i;

function extractNonAggregatedSelectColumns(sql: string): string[] {
  const selectList = extractSelectList(sql);
  if (!selectList) return [];

  const columns: string[] = [];
  for (const expression of splitTopLevel(selectList, ",")) {
    const trimmed = expression.trim();
    if (trimmed === "*") continue;
    if (AGGREGATE_FUNCTION_PATTERN.test(trimmed)) continue;

    const alias = /\bas\s+([A-Za-z_][\w$]*)$/i.exec(trimmed)?.[1];
    if (alias) {
      columns.push(alias);
      continue;
    }

    const lastId = /([A-Za-z_][\w$]*)$/.exec(trimmed)?.[1];
    if (lastId) columns.push(lastId);
  }

  return columns;
}

function detectOnStar(beforeCursor: string): boolean {
  // Cursor is right after * in SELECT clause
  return /\bselect\b[^;]*\*$/i.test(beforeCursor);
}

function detectComparisonLeftColumn(beforeCursor: string): string | undefined {
  // Match: column_name = | column.column = | alias.column =
  const match = /\b([A-Za-z_][\w$]*(?:\.[A-Za-z_][\w$]*)?)\s*(?:=|!=|<>|>=|<=|>|<)\s*$/i.exec(beforeCursor);
  return match?.[1];
}

function detectInsertColumnListContext(beforeCursor: string): { table: string; schema?: string } | null {
  const cleaned = beforeCursor
    .replace(/'[^']*'/g, "''")
    .replace(/"[^"]*"/g, '""')
    .toLowerCase();
  const match = /\binsert\s+into\s+([A-Za-z_][\w$]*(?:\.[A-Za-z_][\w$]*)?)\s*\([^)]*$/i.exec(cleaned);
  if (!match) return null;
  const fullTable = match[1];
  if (!fullTable) return null;
  const [first, second] = splitQualifiedName(fullTable);
  if (second) return { table: second, schema: first! };
  return { table: first! };
}

function extractReferencedTables(sql: string): SqlCompletionReferencedTable[] {
  // Keywords that should NOT be treated as table aliases
  const ALIAS_BLACKLIST = new Set([
    "where",
    "group",
    "order",
    "having",
    "limit",
    "offset",
    "union",
    "intersect",
    "except",
    "and",
    "or",
    "not",
    "is",
    "like",
    "in",
    "between",
    "exists",
    "select",
    "from",
    "join",
    "left",
    "right",
    "inner",
    "outer",
    "cross",
    "apply",
    "full",
    "natural",
    "on",
    "as",
    "set",
    "insert",
    "update",
    "delete",
    "create",
    "drop",
    "alter",
    "into",
    "values",
    "returning",
    "for",
    "window",
    "partition",
    "over",
    "with",
    "recursive",
    "lateral",
    "when",
    "then",
    "else",
    "end",
    "case",
    "cast",
    "coalesce",
    "null",
    "true",
    "false",
    "distinct",
    "all",
    "primary",
    "key",
    "foreign",
    "references",
    "constraint",
    "default",
    "check",
    "unique",
    "index",
    "table",
    "view",
    "database",
    "schema",
    "describe",
    "explain",
    "analyze",
    "pivot",
    "unpivot",
    "asof",
    "positional",
    "anti",
    "semi",
    "sample",
    "filter",
    "qualify",
    "offset",
    "fetch",
    "next",
    "rows",
    "only",
    "preceding",
    "following",
    "current",
    "unbounded",
    "asc",
    "desc",
    "nulls",
    "first",
    "last",
    "ignore",
    "respect",
  ]);

  const pattern =
    /\b(?:from|join|update|into|apply)\s+((?:"[^"]+"|`[^`]+`|[A-Za-z_][\w$]*)(?:\.(?:"[^"]+"|`[^`]+`|[A-Za-z_][\w$]*))?)(?:\s+(?:as\s+)?([A-Za-z_][\w$]*))?/gi;
  const referenced: SqlCompletionReferencedTable[] = [];
  for (const match of sql.matchAll(pattern)) {
    const rawName = match[1];
    const alias = match[2];
    const [first, second] = splitQualifiedName(rawName);
    if (!first) continue;
    // Filter out SQL keywords that accidentally matched as aliases
    const cleanAlias = alias && !ALIAS_BLACKLIST.has(alias.toLowerCase()) ? alias : undefined;
    const table = second ? { schema: first, name: second, alias: cleanAlias } : { name: first, alias: cleanAlias };
    referenced.push(table);
  }
  return referenced;
}

function extractSelectAliases(sql: string): string[] {
  const selectList = extractSelectList(sql);
  if (!selectList) return [];

  const aliases: string[] = [];
  const seen = new Set<string>();
  for (const expression of splitTopLevel(selectList, ",")) {
    const alias = extractSelectAlias(expression);
    if (!alias) continue;
    const key = alias.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    aliases.push(alias);
  }

  return aliases;
}

function extractSelectList(sql: string): string | null {
  const lower = sql.toLowerCase();
  const selectIndex = lower.search(/\bselect\b/);
  if (selectIndex < 0) return null;

  let depth = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  for (let i = selectIndex + "select".length; i < sql.length; i++) {
    const ch = sql[i];
    if (ch === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      continue;
    }
    if (ch === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }
    if (inSingleQuote || inDoubleQuote) continue;
    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    else if (
      depth === 0 &&
      lower.slice(i, i + "from".length) === "from" &&
      !isIdentifierPart(sql[i - 1]) &&
      !isIdentifierPart(sql[i + "from".length])
    ) {
      return sql.slice(selectIndex + "select".length, i).trim();
    }
  }

  return null;
}

function extractSelectAlias(expression: string): string | null {
  const trimmed = expression.trim();
  const explicitAlias = /\bas\s+([A-Za-z_][\w$]*)$/i.exec(trimmed)?.[1];
  if (explicitAlias) return explicitAlias;

  const implicitAlias = /(?:^|[\s)])([A-Za-z_][\w$]*)$/.exec(trimmed)?.[1];
  if (!implicitAlias) return null;
  const expressionWithoutAlias = trimmed.slice(0, trimmed.length - implicitAlias.length).trimEnd();
  if (!expressionWithoutAlias || /^[A-Za-z_][\w$]*(?:\.[A-Za-z_][\w$]*)?$/.test(trimmed)) return null;
  return implicitAlias;
}

function isIdentifierPart(ch: string | undefined): boolean {
  return !!ch && /[A-Za-z0-9_$]/.test(ch);
}

function findMatchingParen(sql: string, openPos: number): number {
  if (sql[openPos] !== "(") return -1;
  let depth = 1;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  for (let i = openPos + 1; i < sql.length; i++) {
    const ch = sql[i];
    if (ch === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      continue;
    }
    if (ch === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }
    if (inSingleQuote || inDoubleQuote) continue;
    if (ch === "(") depth++;
    else if (ch === ")") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function extractSelectColumnNames(sql: string): string[] {
  const selectList = extractSelectList(sql);
  if (!selectList) return [];
  const names: string[] = [];
  for (const expression of splitTopLevel(selectList, ",")) {
    const trimmed = expression.trim();
    if (trimmed === "*") continue;
    if (/^[A-Za-z_][\w$]*$/.test(trimmed)) {
      names.push(trimmed);
      continue;
    }
    const alias = /\bas\s+([A-Za-z_][\w$]*)$/i.exec(trimmed)?.[1];
    if (alias) {
      names.push(alias);
      continue;
    }
    const lastId = /([A-Za-z_][\w$]*)$/.exec(trimmed)?.[1];
    if (lastId) names.push(lastId);
  }
  return names;
}

export function extractCteDefinitions(sql: string): Array<{ name: string; columns: string[] }> {
  const ctes: Array<{ name: string; columns: string[] }> = [];
  let lower = sql.toLowerCase();
  const withMatch = /\bwith\b/.exec(lower);
  if (!withMatch) return ctes;

  let pos = withMatch.index + "with".length;
  lower = lower.slice(pos);
  const recursiveMatch = /^\s+recursive\b/.exec(lower);
  if (recursiveMatch) {
    pos += recursiveMatch[0].length;
  }

  while (pos < sql.length) {
    while (pos < sql.length && /\s/.test(sql[pos])) pos++;
    if (pos >= sql.length) break;
    if (sql[pos] === "," || sql[pos] === ";") {
      pos++;
      continue;
    }

    const remaining = sql.slice(pos);
    const nameMatch = /^([A-Za-z_][\w$]*)/.exec(remaining);
    if (!nameMatch) break;
    const cteName = nameMatch[1];
    pos += nameMatch[0].length;

    while (pos < sql.length && /\s/.test(sql[pos])) pos++;

    let columns: string[] = [];
    if (pos < sql.length && sql[pos] === "(") {
      const colListEnd = findMatchingParen(sql, pos);
      if (colListEnd !== -1) {
        const colList = sql.slice(pos + 1, colListEnd).trim();
        if (!/\bselect\b/i.test(colList)) {
          columns = colList
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean);
          pos = colListEnd + 1;
          while (pos < sql.length && /\s/.test(sql[pos])) pos++;
        }
      }
    }

    while (pos < sql.length && /\s/.test(sql[pos])) pos++;
    if (/\bas\b/i.test(sql.slice(pos, pos + 5))) {
      pos += 2;
      while (pos < sql.length && /\s/.test(sql[pos])) pos++;
    }

    if (pos >= sql.length || sql[pos] !== "(") break;
    const bodyEnd = findMatchingParen(sql, pos);
    if (bodyEnd === -1) break;

    if (columns.length === 0) {
      const body = sql.slice(pos + 1, bodyEnd);
      columns = extractSelectColumnNames(body);
    }

    ctes.push({ name: cteName, columns });
    pos = bodyEnd + 1;
  }

  return ctes;
}

function extractSubqueryReferences(sql: string): SqlCompletionReferencedTable[] {
  const refs: SqlCompletionReferencedTable[] = [];
  const pattern = /\b(?:from|join)\s*\(/gi;

  for (const match of sql.matchAll(pattern)) {
    const openParen = match.index! + match[0].length - 1;
    const closeParen = findMatchingParen(sql, openParen);
    if (closeParen === -1) continue;

    // Extract alias after closing paren
    let pos = closeParen + 1;
    while (pos < sql.length && /\s/.test(sql[pos])) pos++;
    if (/\bas\b/i.test(sql.slice(pos, pos + 4))) {
      pos += 2;
      while (pos < sql.length && /\s/.test(sql[pos])) pos++;
    }
    const aliasMatch = /^([A-Za-z_][\w$]*)/.exec(sql.slice(pos));
    if (!aliasMatch) continue;
    const alias = aliasMatch[1];
    if (ALIAS_BLACKLIST_FOR_REF.has(alias.toLowerCase())) continue;

    // Extract SELECT columns from subquery body
    const body = sql.slice(openParen + 1, closeParen);
    const columns = extractSelectColumnNames(body);

    refs.push({ name: alias, alias, columns });
  }

  return refs;
}

const ALIAS_BLACKLIST_FOR_REF = new Set([
  "where",
  "group",
  "order",
  "having",
  "limit",
  "offset",
  "union",
  "intersect",
  "except",
  "and",
  "or",
  "not",
  "is",
  "like",
  "in",
  "between",
  "exists",
  "select",
  "on",
  "set",
  "left",
  "right",
  "inner",
  "outer",
  "cross",
  "full",
  "natural",
  "join",
]);

function splitTopLevel(text: string, separator: string): string[] {
  const parts: string[] = [];
  let start = 0;
  let depth = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      continue;
    }
    if (ch === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }
    if (inSingleQuote || inDoubleQuote) continue;
    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    else if (ch === separator && depth === 0) {
      parts.push(text.slice(start, i));
      start = i + 1;
    }
  }

  parts.push(text.slice(start));
  return parts;
}

function splitQualifiedName(input: string): [string | undefined, string | undefined] {
  const parts: string[] = [];
  let current = "";
  let inDoubleQuote = false;
  let inBacktick = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === '"' && !inBacktick) {
      inDoubleQuote = !inDoubleQuote;
      current += ch;
      continue;
    }
    if (ch === "`" && !inDoubleQuote) {
      inBacktick = !inBacktick;
      current += ch;
      continue;
    }
    if (ch === "." && !inDoubleQuote && !inBacktick) {
      parts.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current.trim());

  const unquoted = parts.map((p) => unquoteIdentifier(p)).filter(Boolean);
  if (unquoted.length >= 2) return [unquoted[0], unquoted[1]];
  return [unquoted[0], undefined];
}

function unquoteIdentifier(value: string): string {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("`") && value.endsWith("`"))) {
    return value.slice(1, -1);
  }
  return value;
}

function buildTableItems(prefix: string, tables: SqlCompletionTable[]): SqlCompletionItem[] {
  return tables
    .filter((table) => matchesPrefix(table.name, prefix))
    .slice(0, MAX_TABLE_COMPLETION_ITEMS)
    .map((table) => ({
      label: table.name,
      type: "table" as const,
      detail: table.schema ? `${table.schema}.${table.name}` : table.type,
      boost: computeBoost(table.name, prefix) + 1000,
    }));
}

function buildSchemaItems(prefix: string, schemas: string[]): SqlCompletionItem[] {
  return schemas
    .filter((schema) => matchesPrefix(schema, prefix))
    .slice(0, 50)
    .map((schema) => ({
      label: schema,
      type: "schema" as const,
      detail: "schema",
      apply: `${schema}.`,
      boost: computeBoost(schema, prefix) + 1500,
    }));
}

function buildStarExpansionItem(
  columnsByTable: Map<string, SqlCompletionColumn[]>,
  t?: SqlCompletionTranslations,
): SqlCompletionItem | null {
  const allColumns: string[] = [];
  const seen = new Set<string>();
  for (const [, cols] of columnsByTable) {
    for (const col of cols) {
      if (seen.has(col.name)) continue;
      seen.add(col.name);
      allColumns.push(col.name);
    }
  }
  if (allColumns.length === 0) return null;
  const expansion = allColumns.join(", ");
  return {
    label: "* → columns",
    type: "snippet" as const,
    detail: `${(t?.starExpansionColumns ?? "{count} 列").replace("{count}", String(allColumns.length))}: ${expansion.length > 60 ? expansion.slice(0, 57) + "..." : expansion}`,
    apply: expansion,
    boost: 1900,
  };
}

function buildComparisonValueItems(
  context: SqlCompletionContext,
  columnsByTable: Map<string, SqlCompletionColumn[]>,
  t?: SqlCompletionTranslations,
): SqlCompletionItem[] {
  const colName = context.comparisonLeftColumn!;
  const parts = colName.split(".");
  const unqualified = parts.length > 1 ? parts[parts.length - 1]! : colName;
  const qualifier = parts.length > 1 ? parts[0] : undefined;

  // Resolve alias to actual table name
  let resolvedTable: string | undefined;
  if (qualifier) {
    const ref = context.referencedTables.find((r) => r.alias?.toLowerCase() === qualifier.toLowerCase());
    resolvedTable = ref?.name?.toLowerCase();
  }

  // Find the column's data type
  let dataType: string | undefined;
  for (const [, cols] of columnsByTable) {
    for (const col of cols) {
      if (col.name.toLowerCase() === unqualified.toLowerCase()) {
        if (qualifier) {
          const qualLower = qualifier.toLowerCase();
          if (
            col.table.toLowerCase() === qualLower ||
            col.schema?.toLowerCase() === qualLower ||
            col.table.toLowerCase() === resolvedTable
          ) {
            dataType = col.dataType;
            break;
          }
        } else {
          dataType = col.dataType;
          break;
        }
      }
    }
    if (dataType) break;
  }

  const items: SqlCompletionItem[] = [];

  // NULL check — always useful
  items.push({
    label: "NULL",
    type: "keyword" as const,
    detail: t?.nullValue ?? "空值",
    boost: 1300,
  });
  items.push({
    label: "IS NULL",
    type: "keyword" as const,
    detail: t?.isNull ?? "判断是否为 NULL",
    boost: 1250,
  });
  items.push({
    label: "IS NOT NULL",
    type: "keyword" as const,
    detail: t?.isNotNull ?? "判断是否不为 NULL",
    boost: 1200,
  });

  if (!dataType) return items;

  const prefix = context.prefix;
  const dt = dataType.toLowerCase();

  // String-like types: suggest quoted string snippet
  if (dt.includes("char") || dt.includes("text") || dt === "varchar" || dt === "nvarchar" || dt === "ntext") {
    if (matchesPrefix("''", prefix) || !prefix) {
      items.push({
        label: "''",
        type: "snippet" as const,
        detail: t?.stringLiteral ?? "字符串字面量",
        apply: "'${value}'",
        boost: 1800,
      });
    }
  }

  // Numeric types: suggest number placeholder
  if (
    dt.includes("int") ||
    dt.includes("decimal") ||
    dt.includes("numeric") ||
    dt.includes("float") ||
    dt.includes("real") ||
    dt.includes("money") ||
    dt === "bigint" ||
    dt === "smallint" ||
    dt === "tinyint"
  ) {
    if (matchesPrefix("0", prefix) || !prefix) {
      items.push({
        label: "0",
        type: "snippet" as const,
        detail: t?.numericLiteral ?? "数值字面量",
        apply: "${1:value}",
        boost: 1750,
      });
    }
  }

  // Boolean-ish: tinyint or bit
  if (dt === "bit" || dt === "boolean" || dt === "bool") {
    items.push(
      { label: "TRUE", type: "keyword" as const, detail: t?.booleanValue ?? "布尔值", boost: 1700 },
      { label: "FALSE", type: "keyword" as const, detail: t?.booleanValue ?? "布尔值", boost: 1650 },
    );
  }

  return items;
}

function buildAliasItems(context: SqlCompletionContext): SqlCompletionItem[] {
  const items: SqlCompletionItem[] = [];
  const seen = new Set<string>();
  for (const ref of context.referencedTables) {
    if (ref.alias) continue;
    if (context.prefix && !matchesPrefix(ref.name, context.prefix)) continue;
    const candidate = generateAlias(ref.name);
    if (!candidate || seen.has(candidate)) continue;
    seen.add(candidate);
    items.push({
      label: candidate,
      type: "snippet" as const,
      detail: `alias for ${ref.name}`,
      apply: `AS ${candidate} `,
      boost: 1600 - items.length,
    });
  }
  return items;
}

function generateAlias(tableName: string): string {
  // Simple name → first letter(s)
  const parts = tableName.split("_");
  if (parts.length >= 3) {
    return parts.map((p) => p[0] || "").join("");
  }
  if (parts.length === 2) {
    return parts.map((p) => p[0] || "").join("");
  }
  // Single word: first 1-3 chars
  const name = parts[0] || "";
  if (name.length <= 3) return name;
  return name.slice(0, 3);
}

function isFollowedByJoin(beforeToken: string): boolean {
  const words = beforeToken.trimEnd().split(/\s+/);
  const second = words[words.length - 2]?.toLowerCase();
  return second === "join" || JOIN_MODIFIERS.has(second ?? "");
}

function isInTableListContext(beforeToken: string): boolean {
  return /,\s*$/.test(beforeToken) && /\b(?:from|join|update|into)\b/i.test(beforeToken);
}

function buildColumnItems(
  context: SqlCompletionContext,
  columnsByTable: Map<string, SqlCompletionColumn[]>,
): SqlCompletionItem[] {
  // Collect all columns from the map (all tables have been fetched)
  const allColumns: Array<SqlCompletionColumn & { key: string }> = [];
  for (const [key, cols] of columnsByTable.entries()) {
    for (const col of cols) {
      allColumns.push({ ...col, key });
    }
  }

  // Handle INSERT column list: filter to only the target table
  let relevantCols = allColumns;
  if (context.insertTable) {
    const tableLower = context.insertTable.toLowerCase();
    if (context.insertSchema) {
      const schemaLower = context.insertSchema.toLowerCase();
      relevantCols = allColumns.filter(
        (c) =>
          c.table.toLowerCase() === tableLower &&
          (c.schema?.toLowerCase() === schemaLower || c.key.toLowerCase() === `${schemaLower}.${tableLower}`),
      );
    } else {
      relevantCols = allColumns.filter((c) => c.table.toLowerCase() === tableLower);
    }
  } else if (context.qualifier) {
    const q = context.qualifier;
    const qLower = q.toLowerCase();
    const relatedTables = context.referencedTables.filter(
      (table) =>
        table.alias === q ||
        table.alias?.toLowerCase() === qLower ||
        table.name === q ||
        table.name.toLowerCase() === qLower,
    );
    const tableNameSet = new Set(relatedTables.map((t) => t.name.toLowerCase()));
    const tableKeys = new Set<string>();
    for (const table of relatedTables) {
      tableKeys.add(table.name);
      if (table.schema) {
        tableKeys.add(`${table.schema}.${table.name}`);
      }
    }
    relevantCols = allColumns.filter((c) => tableNameSet.has(c.table.toLowerCase()) || tableKeys.has(c.key));
  }

  // Count name frequencies to detect duplicates across tables
  const nameCount = new Map<string, number>();
  for (const c of relevantCols) {
    nameCount.set(c.name, (nameCount.get(c.name) || 0) + 1);
  }

  // Deduplicate — for dupes, qualify with table name
  const seen = new Set<string>();
  const uniqueColumns: Array<SqlCompletionColumn & { key: string; displayLabel: string }> = [];
  for (const c of relevantCols) {
    const count = nameCount.get(c.name) || 0;
    if (count > 1) {
      const qualifiedKey = `${c.table}.${c.name}`;
      if (seen.has(qualifiedKey)) continue;
      seen.add(qualifiedKey);
      uniqueColumns.push({ ...c, key: c.key, displayLabel: `${c.table}.${c.name}` });
    } else {
      if (seen.has(c.name)) continue;
      seen.add(c.name);
      uniqueColumns.push({ ...c, key: c.key, displayLabel: c.name });
    }
  }

  return uniqueColumns
    .filter((column) => matchesPrefix(column.displayLabel, context.prefix))
    .map((column) => {
      const keyBoost = isKeyColumn(column.name) ? 500 : 0;
      return {
        label: column.displayLabel,
        type: "column" as const,
        detail: buildColumnDetail(column),
        boost: computeBoost(column.displayLabel, context.prefix) + keyBoost,
      };
    });
}

function isKeyColumn(name: string): boolean {
  const lower = name.toLowerCase();
  return lower === "id" || lower.endsWith("_id");
}

function buildColumnDetail(column: SqlCompletionColumn): string {
  const tableInfo = column.schema ? `${column.schema}.${column.table}` : column.table;
  let detail = column.dataType ? `${tableInfo}  [${column.dataType}]` : tableInfo;
  if (column.isNullable === false) {
    detail += "  NOT NULL";
  }
  return detail;
}

function buildJoinConditionItems(
  context: SqlCompletionContext,
  columnsByTable: Map<string, SqlCompletionColumn[]>,
): SqlCompletionItem[] {
  const refs = context.referencedTables;
  if (refs.length < 2) return [];

  const latest = refs[refs.length - 1];
  const previousRefs = refs.slice(0, -1);
  const items: SqlCompletionItem[] = [];

  for (const previous of previousRefs) {
    const previousColumns = columnsForReferencedTable(previous, columnsByTable);
    const latestColumns = columnsForReferencedTable(latest, columnsByTable);
    items.push(...buildJoinConditionItemsForPair(previous, previousColumns, latest, latestColumns, context.prefix));
  }

  return items;
}

function columnsForReferencedTable(
  table: SqlCompletionReferencedTable,
  columnsByTable: Map<string, SqlCompletionColumn[]>,
): SqlCompletionColumn[] {
  const keys = table.schema ? [`${table.schema}.${table.name}`, table.name] : [table.name];
  for (const key of keys) {
    const columns = columnsByTable.get(key);
    if (columns) return columns;
  }
  return [];
}

function buildJoinConditionItemsForPair(
  left: SqlCompletionReferencedTable,
  leftColumns: SqlCompletionColumn[],
  right: SqlCompletionReferencedTable,
  rightColumns: SqlCompletionColumn[],
  prefix: string,
): SqlCompletionItem[] {
  const items: SqlCompletionItem[] = [];
  const leftRef = left.alias || left.name;
  const rightRef = right.alias || right.name;
  const leftTableKey = singularTableName(left.name);
  const rightTableKey = singularTableName(right.name);

  for (const leftColumn of leftColumns) {
    for (const rightColumn of rightColumns) {
      const leftName = leftColumn.name.toLowerCase();
      const rightName = rightColumn.name.toLowerCase();
      const leftLabel = `${leftRef}.${leftColumn.name}`;
      const rightLabel = `${rightRef}.${rightColumn.name}`;
      let boost = 0;

      // Pattern 1: a.id = b.{singular_a}_id  (e.g., users.id = orders.user_id)
      if (leftName === "id" && rightName === `${leftTableKey}_id`) {
        boost = 2300;
      }
      // Pattern 2: a.{singular_b}_id = b.id  (e.g., orders.user_id = users.id)
      else if (rightName === "id" && leftName === `${rightTableKey}_id`) {
        boost = 2300;
      }
      // Pattern 3: Same FK column name in both tables (e.g., both have user_id)
      else if (leftName === rightName && leftName.endsWith("_id")) {
        boost = 2000;
      }
      // Pattern 4: Same column name that isn't "id" (e.g., both have "code", "email")
      else if (leftName !== "id" && leftName === rightName) {
        boost = 1700;
      }
      // Pattern 5: parent_id → id (self-referencing / hierarchical)
      else if (leftName === "parent_id" && rightName === "id" && leftTableKey === rightTableKey) {
        boost = 2100;
      } else if (rightName === "parent_id" && leftName === "id" && leftTableKey === rightTableKey) {
        boost = 2100;
      }
      // Pattern 6: created_by / modified_by / owned_by → users.id
      else if (
        leftName === "id" &&
        (rightName === "created_by" || rightName === "modified_by" || rightName === "owned_by")
      ) {
        boost = 1800;
      } else if (
        rightName === "id" &&
        (leftName === "created_by" || leftName === "modified_by" || leftName === "owned_by")
      ) {
        boost = 1800;
      }

      if (!boost) continue;
      const label = `${leftLabel} = ${rightLabel}`;
      if (prefix && !matchesPrefix(label, prefix)) continue;
      items.push({
        label,
        type: "snippet",
        detail: "JOIN condition",
        apply: label,
        boost,
      });
    }
  }

  return items;
}

function singularTableName(name: string): string {
  const lower = name.toLowerCase();
  // Irregular plurals
  if (lower.endsWith("ies") && lower.length > 3) return `${lower.slice(0, -3)}y`;
  if (lower.endsWith("ives") && lower.length > 4) return `${lower.slice(0, -4)}f`; // lives → life
  if (lower.endsWith("ves") && lower.length > 3) {
    const stem = lower.slice(0, -3);
    if (stem.endsWith("el") || stem.endsWith("lf")) return `${stem}fe`; // shelves → shelf, halves → half
    return `${stem}f`; // calves → calf
  }
  if (lower.endsWith("ses") && lower.length > 3) {
    const stem = lower.slice(0, -2); // statuses → status, buses → bus
    if (stem.endsWith("s") || stem.endsWith("x") || stem.endsWith("z") || stem.endsWith("ch") || stem.endsWith("sh")) {
      return stem;
    }
  }
  if (lower.endsWith("xes") && lower.length > 3) return lower.slice(0, -2); // boxes → box
  if (lower.endsWith("ches") && lower.length > 4) return lower.slice(0, -2); // matches → match
  if (lower.endsWith("shes") && lower.length > 4) return lower.slice(0, -2); // dishes → dish
  if (lower.endsWith("ices") && lower.length > 4) {
    const stem = lower.slice(0, -4);
    if (stem === "ind") return "index";
    if (stem === "append") return "appendix";
    return `${stem}ex`; // matrices → matrix
  }
  if (lower.endsWith("men") && lower.length > 3) return `${lower}um`; // children → child... no, that's wrong
  if (lower === "children") return "child";
  if (lower === "people") return "person";
  if (lower === "data") return lower; // data is already singular-ish
  if (lower.endsWith("s") && !lower.endsWith("ss") && lower.length > 1) return lower.slice(0, -1);
  return lower;
}

export function buildSnippetItemsForTest(prefix: string, snippets: SqlSnippet[]): SqlCompletionItem[] {
  return buildSnippetItems(prefix, snippets);
}

function buildSnippetItems(prefix: string, snippets: SqlSnippet[]): SqlCompletionItem[] {
  if (!prefix) return [];
  return snippets
    .filter((snippet) => {
      const matchesSnippetPrefix = matchesPrefix(snippet.prefix, prefix);
      const matchesSnippetLabel = prefix.length > snippet.prefix.length && matchesPrefix(snippet.label, prefix);
      return matchesSnippetPrefix || matchesSnippetLabel;
    })
    .map((snippet) => {
      const boostByPrefix = computeBoost(snippet.prefix, prefix);
      const boostByLabel = computeBoost(snippet.label, prefix);
      const matchesByPrefix = matchesPrefix(snippet.prefix, prefix);
      // When the user types past the snippet prefix (e.g. "sele" vs prefix "sel"),
      // they are likely typing the actual keyword — reduce the base boost so
      // the real keyword can rank higher.
      const baseBoost = matchesByPrefix ? 4000 : 0;
      return {
        label: snippet.label,
        type: "snippet" as const,
        detail: snippet.body,
        apply: snippet.body,
        boost: Math.max(boostByPrefix, boostByLabel) + baseBoost,
      };
    });
}

function buildFunctionSnippetItems(prefix: string, functionDescriptions: Map<string, string>): SqlCompletionItem[] {
  const items: SqlCompletionItem[] = [];

  for (const [name, parameters] of SQL_FUNCTION_SIGNATURES.entries()) {
    if (!matchesPrefix(name, prefix)) continue;
    const paramStr = parameters.length > 0 ? parameters.map((p) => `\${${p}}`).join(", ") : "";
    items.push({
      label: name,
      type: "function" as const,
      detail: functionDescriptions.get(name) ?? "function",
      apply: `${name}(${paramStr})`,
      boost: computeBoost(name, prefix) + 300,
    });
  }

  // Window functions — complete with OVER() clause
  for (const name of WINDOW_FUNCTIONS) {
    if (!matchesPrefix(name, prefix)) continue;
    items.push({
      label: name,
      type: "function" as const,
      detail: "window function",
      apply: `${name}() OVER (PARTITION BY \${col} ORDER BY \${col})`,
      boost: computeBoost(name, prefix) + 250,
    });
  }

  return items;
}

function buildSelectAliasItems(context: SqlCompletionContext): SqlCompletionItem[] {
  return context.selectAliases
    .filter((alias) => matchesPrefix(alias, context.prefix))
    .map((alias, index) => ({
      label: alias,
      type: "column" as const,
      detail: "SELECT alias",
      boost: computeBoost(alias, context.prefix) + 3500 - index,
    }));
}

function buildNonAggregatedColumnItems(
  context: SqlCompletionContext,
  columnsByTable: Map<string, SqlCompletionColumn[]>,
): SqlCompletionItem[] {
  const nonAggSet = new Set(context.nonAggregatedSelectColumns.map((c) => c.toLowerCase()));
  const seen = new Set<string>();

  const items: SqlCompletionItem[] = [];
  for (const [, cols] of columnsByTable) {
    for (const col of cols) {
      const key = col.name.toLowerCase();
      if (!nonAggSet.has(key) || seen.has(key)) continue;
      if (context.prefix && !matchesPrefix(col.name, context.prefix)) continue;
      seen.add(key);
      items.push({
        label: col.name,
        type: "column" as const,
        detail: "non-aggregated column — required in GROUP BY",
        boost: 2800 - items.length,
      });
    }
  }

  return items;
}

function buildKeywordItems(prefix: string, context: SqlCompletionContext): SqlCompletionItem[] {
  const isDml =
    context.statementKind === "select" ||
    context.statementKind === "insert" ||
    context.statementKind === "update" ||
    context.statementKind === "delete";
  const showDdl = !isDml || context.suggestTables;

  return SQL_KEYWORDS.filter((keyword) => {
    if (SQL_FUNCTION_SIGNATURES.has(keyword)) return false;
    if (WINDOW_FUNCTIONS.has(keyword)) return false;
    if (!matchesPrefix(keyword, prefix)) return false;
    if (!showDdl && isDml && (DDL_ONLY_KEYWORDS.has(keyword) || DATA_TYPE_KEYWORDS.has(keyword))) return false;
    return true;
  }).map((keyword) => {
    const base = computeBoost(keyword, prefix);
    const freqBoost = HIGH_FREQUENCY_KEYWORDS.has(keyword) ? 100 : 0;
    return {
      label: keyword,
      type: "keyword" as const,
      boost: base + freqBoost,
    };
  });
}

function matchesPrefix(candidate: string, prefix: string): boolean {
  if (!prefix) return true;
  return computeMatchScore(candidate, prefix) >= 0;
}

/**
 * Score how well `prefix` matches `candidate`.
 * Returns -1 for no match, or a positive score where higher = better match.
 *
 * Scoring tiers:
 *   Exact match:    3000 - len
 *   Prefix match:   2000 - len
 *   Tight fuzzy:    1500 - gapPenalty + earlyMatchBonus - len  (gaps < prefix length)
 *   Loose fuzzy:     500 + partialEarlyBonus - gapPenalty - len (gaps >= prefix length)
 *   Substring:       300 - len
 */
function computeMatchScore(candidate: string, prefix: string): number {
  if (!prefix) return 1;
  const c = candidate.toLowerCase();
  const p = prefix.toLowerCase();

  // Exact match
  if (c === p) return 3000 - c.length;

  // Prefix match
  if (c.startsWith(p)) return 2000 - c.length;

  // Fuzzy match: chars must appear in order (allows gaps for typos/abbrevs)
  let ci = 0;
  let totalGap = 0;
  let firstMatchPos = -1;
  for (let pi = 0; pi < p.length; pi++) {
    const ch = p[pi];
    const nextPos = c.indexOf(ch, ci);
    if (nextPos === -1) {
      // Fallback to substring match
      if (c.includes(p)) return 300 - c.length;
      return -1;
    }
    if (firstMatchPos === -1) firstMatchPos = nextPos;
    totalGap += nextPos - ci;
    ci = nextPos + 1;
  }

  const earlyMatchBonus = Math.max(0, 700 - firstMatchPos * 35);

  if (totalGap >= p.length) {
    // Too many gaps — low-confidence fuzzy match
    return 400 + earlyMatchBonus * 0.3 - totalGap * 20 - c.length;
  }

  const gapPenalty = totalGap * 10;
  return 1200 + earlyMatchBonus - gapPenalty - c.length;
}

function computeBoost(candidate: string, prefix: string): number {
  return computeMatchScore(candidate, prefix);
}

// --- History-based ranking ---
const completionStats = new Map<string, number>();

/** Record a user selection to boost future rankings. */
export function recordCompletionSelection(label: string, type: string): void {
  const key = `${type}:${label}`;
  completionStats.set(key, (completionStats.get(key) || 0) + 1);
}

function getHistoryBoost(label: string, type: string): number {
  const count = completionStats.get(`${type}:${label}`);
  if (!count) return 0;
  // Diminishing returns: first selection gives biggest boost
  return Math.min(count * 80, 500);
}

function dedupeAndSort(items: SqlCompletionItem[]): SqlCompletionItem[] {
  const seen = new Set<string>();
  return items
    .sort((left, right) => {
      const leftBonus = getHistoryBoost(left.label, left.type);
      const rightBonus = getHistoryBoost(right.label, right.type);
      return right.boost + rightBonus - (left.boost + leftBonus);
    })
    .filter((item) => {
      const key = `${item.type}:${item.label}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function findActiveFunctionOpenParen(sqlBeforeCursor: string): number | null {
  let depth = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;

  for (let i = sqlBeforeCursor.length - 1; i >= 0; i--) {
    const ch = sqlBeforeCursor[i];
    if (ch === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      continue;
    }
    if (ch === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }
    if (inSingleQuote || inDoubleQuote) continue;

    if (ch === ")") {
      depth++;
    } else if (ch === "(") {
      if (depth === 0) return i;
      depth--;
    }
  }

  return null;
}

function countTopLevelCommas(text: string): number {
  let count = 0;
  let depth = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      continue;
    }
    if (ch === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }
    if (inSingleQuote || inDoubleQuote) continue;

    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    else if (ch === "," && depth === 0) count++;
  }

  return count;
}
