import type { ObjectInfo, TableInfo, TreeNode, TreeNodeType } from "@/types/database";

export function normalizeDatabaseObjectName(name: string): string {
  return name.trim();
}

export function buildTableTreeNodes({
  nodeId,
  connectionId,
  database,
  schema,
  tables,
}: {
  nodeId: string;
  connectionId: string;
  database: string;
  schema?: string;
  tables: TableInfo[];
}): TreeNode[] {
  return tables.flatMap((table) => {
    const name = normalizeDatabaseObjectName(table.name);
    if (!name) return [];
    return [
      {
        id: `${nodeId}:${name}`,
        label: name,
        type: table.table_type === "VIEW" ? ("view" as const) : ("table" as const),
        connectionId,
        database,
        schema,
        isExpanded: false,
        children: [],
      },
    ];
  });
}

function normalizeObjectType(type: string): "TABLE" | "VIEW" | "PROCEDURE" | "FUNCTION" {
  const v = type.toUpperCase();
  if (v.includes("VIEW")) return "VIEW";
  if (v.includes("PROC")) return "PROCEDURE";
  if (v.includes("FUNC")) return "FUNCTION";
  return "TABLE";
}

const groupDefs: Array<{
  key: string;
  label: string;
  objectType: string;
  nodeType: TreeNodeType;
  childType: TreeNodeType;
}> = [
  { key: "__tables", label: "tree.tables", objectType: "TABLE", nodeType: "group-tables", childType: "table" },
  { key: "__views", label: "tree.views", objectType: "VIEW", nodeType: "group-views", childType: "view" },
  {
    key: "__procedures",
    label: "tree.procedures",
    objectType: "PROCEDURE",
    nodeType: "group-procedures",
    childType: "procedure",
  },
  {
    key: "__functions",
    label: "tree.functions",
    objectType: "FUNCTION",
    nodeType: "group-functions",
    childType: "function",
  },
];

const objectGroupNodeTypes = new Set<TreeNodeType>([
  "group-tables",
  "group-views",
  "group-procedures",
  "group-functions",
]);

export function objectGroupRefreshParentId(node: TreeNode): string | null {
  if (!objectGroupNodeTypes.has(node.type)) return null;
  const suffixStart = node.id.lastIndexOf(":__");
  if (suffixStart < 0) return null;
  return node.id.slice(0, suffixStart);
}

export function buildGroupedObjectTreeNodes({
  nodeId,
  connectionId,
  database,
  schema,
  objects,
}: {
  nodeId: string;
  connectionId: string;
  database: string;
  schema?: string;
  objects: ObjectInfo[];
}): TreeNode[] {
  const buckets = new Map<string, ObjectInfo[]>();
  const seen = new Set<string>();
  for (const obj of objects) {
    const name = normalizeDatabaseObjectName(obj.name);
    if (!name) continue;
    const t = normalizeObjectType(obj.object_type);
    const objectSchema = obj.schema ? normalizeDatabaseObjectName(obj.schema) : schema || "";
    const key = `${t}\0${objectSchema.toLowerCase()}\0${name.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const arr = buckets.get(t) ?? [];
    arr.push({ ...obj, name, schema: obj.schema ? normalizeDatabaseObjectName(obj.schema) : obj.schema });
    buckets.set(t, arr);
  }

  const groups: TreeNode[] = [];
  for (const def of groupDefs) {
    const items = buckets.get(def.objectType);
    if (!items?.length) continue;
    const isExpandable = def.childType === "table" || def.childType === "view";
    groups.push({
      id: `${nodeId}:${def.key}`,
      label: def.label,
      type: def.nodeType,
      connectionId,
      database,
      schema,
      objectCount: items.length,
      isExpanded: false,
      children: items.map((obj) => ({
        id: `${nodeId}:${def.key}:${obj.name}`,
        label: obj.name,
        type: def.childType,
        connectionId,
        database,
        schema,
        isExpanded: false,
        children: isExpandable ? [] : undefined,
      })),
    });
  }
  return groups;
}

export function expandCachedObjectBrowserNodes(nodes: TreeNode[]): TreeNode[] {
  return nodes.flatMap((node) => {
    if (node.type === "object-browser") return node.hiddenChildren ?? [];

    if (!node.children) return [node];

    return [
      {
        ...node,
        children: expandCachedObjectBrowserNodes(node.children),
      },
    ];
  });
}
