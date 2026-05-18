import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  buildGroupedObjectTreeNodes,
  buildTableTreeNodes,
  expandCachedObjectBrowserNodes,
  objectGroupRefreshParentId,
} from "../../apps/desktop/src/lib/tableTree.ts";
import type { ObjectInfo, TableInfo } from "../../apps/desktop/src/types/database.ts";

const treeItemSource = readFileSync("apps/desktop/src/components/sidebar/TreeItem.vue", "utf8");
const connectionStoreSource = readFileSync("apps/desktop/src/stores/connectionStore.ts", "utf8");

function table(name: string, tableType: "TABLE" | "VIEW" = "TABLE"): TableInfo {
  return { name, table_type: tableType };
}

function obj(name: string, objectType = "TABLE", schema = "public"): ObjectInfo {
  return {
    name,
    object_type: objectType,
    schema,
  };
}

test("keeps every table as a sidebar node instead of truncating to object browser", () => {
  const tables: TableInfo[] = Array.from({ length: 16 }, (_, index) => table(`table_${index + 1}`));

  const nodes = buildTableTreeNodes({
    nodeId: "conn:db",
    connectionId: "conn",
    database: "db",
    tables,
  });

  assert.equal(nodes.length, 16);
  assert.equal(nodes.at(-1)?.label, "table_16");
  assert.equal(
    nodes.some((node) => node.type === "object-browser"),
    false,
  );
});

test("preserves table and view node types", () => {
  const nodes = buildTableTreeNodes({
    nodeId: "conn:db:public",
    connectionId: "conn",
    database: "db",
    schema: "public",
    tables: [table("users"), table("user_view", "VIEW")],
  });

  assert.deepEqual(
    nodes.map((node) => [node.label, node.type, node.schema]),
    [
      ["users", "table", "public"],
      ["user_view", "view", "public"],
    ],
  );
});

test("normalizes padded table names from database drivers", () => {
  const nodes = buildTableTreeNodes({
    nodeId: "conn:db:public",
    connectionId: "conn",
    database: "db",
    schema: "public",
    tables: [table(" users  "), table("\norders\t"), table("   ")],
  });

  assert.deepEqual(
    nodes.map((node) => [node.id, node.label]),
    [
      ["conn:db:public:users", "users"],
      ["conn:db:public:orders", "orders"],
    ],
  );
});

test("object tree groups count unique objects when metadata returns duplicates", () => {
  const nodes = buildGroupedObjectTreeNodes({
    nodeId: "conn:app:public",
    connectionId: "conn",
    database: "app",
    schema: "public",
    objects: [
      obj("orders"),
      obj("orders"),
      obj("customers"),
      obj("active_orders", "VIEW"),
      obj("active_orders", "VIEW"),
    ],
  });

  const tableGroup = nodes.find((node) => node.type === "group-tables");
  assert.equal(tableGroup?.objectCount, 2);
  assert.deepEqual(
    tableGroup?.children?.map((child) => child.label),
    ["orders", "customers"],
  );

  const viewGroup = nodes.find((node) => node.type === "group-views");
  assert.equal(viewGroup?.objectCount, 1);
  assert.deepEqual(
    viewGroup?.children?.map((child) => child.label),
    ["active_orders"],
  );
});

test("expands cached object-browser nodes back into regular table nodes", () => {
  const nodes = expandCachedObjectBrowserNodes([
    {
      id: "conn:db:table_1",
      label: "table_1",
      type: "table",
      connectionId: "conn",
      database: "db",
      isExpanded: false,
      children: [],
    },
    {
      id: "conn:db:__object_browser",
      label: "tree.objectBrowser",
      type: "object-browser",
      connectionId: "conn",
      database: "db",
      hiddenChildren: [
        {
          id: "conn:db:table_16",
          label: "table_16",
          type: "table",
          connectionId: "conn",
          database: "db",
          isExpanded: false,
          children: [],
        },
      ],
    },
  ]);

  assert.deepEqual(
    nodes.map((node) => [node.label, node.type]),
    [
      ["table_1", "table"],
      ["table_16", "table"],
    ],
  );
});

test("resolves grouped object refreshes to the parent schema node", () => {
  assert.equal(
    objectGroupRefreshParentId({
      id: "conn:db:public:__tables",
      label: "tree.tables",
      type: "group-tables",
      connectionId: "conn",
      database: "db",
      schema: "public",
    }),
    "conn:db:public",
  );
});

test("table expander loads groups by the actual tree node id", () => {
  assert.match(
    treeItemSource,
    /loadTableGroups\(node\.connectionId,\s*node\.database,\s*node\.label,\s*node\.schema,\s*node\.id\)/,
  );
});

test("table metadata group expanders load by their actual tree node ids", () => {
  for (const [type, loader] of [
    ["group-columns", "loadColumns"],
    ["group-indexes", "loadIndexes"],
    ["group-fkeys", "loadForeignKeys"],
    ["group-triggers", "loadTriggers"],
  ]) {
    assert.match(
      treeItemSource,
      new RegExp(
        `node\\.type === "${type}"[\\s\\S]*connectionStore\\.${loader}\\(node\\.connectionId,\\s*node\\.database,\\s*node\\.tableName,\\s*node\\.schema,\\s*node\\.id\\)`,
      ),
    );
    assert.match(
      connectionStoreSource,
      new RegExp(
        `node\\.type === "${type}"[\\s\\S]*await ${loader}\\(node\\.connectionId,\\s*node\\.database,\\s*node\\.tableName,\\s*node\\.schema,\\s*node\\.id\\)`,
      ),
    );
  }
});
