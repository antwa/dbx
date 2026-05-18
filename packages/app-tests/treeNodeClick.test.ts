import test from "node:test";
import assert from "node:assert/strict";
import {
  objectSourceKindForTreeNode,
  sidebarSelectionCopyAction,
  treeNodeRowAction,
  treeNodeRowDoubleClickAction,
} from "../../apps/desktop/src/lib/treeNodeClick.ts";

test("table and view rows open data without toggling structure groups", () => {
  assert.equal(treeNodeRowAction("table", true), "open-data");
  assert.equal(treeNodeRowAction("view", true), "open-data");
});

test("double click navigation mode selects rows on single click", () => {
  assert.equal(treeNodeRowAction("table", true, "double"), "none");
  assert.equal(treeNodeRowAction("view", true, "double"), "none");
  assert.equal(treeNodeRowAction("procedure", false, "double"), "none");
  assert.equal(treeNodeRowAction("saved-sql-file", false, "double"), "none");
});

test("double click navigation mode opens actionable rows on double click", () => {
  assert.equal(treeNodeRowDoubleClickAction("table", true, "double"), "open-data");
  assert.equal(treeNodeRowDoubleClickAction("view", true, "double"), "open-data");
  assert.equal(treeNodeRowDoubleClickAction("procedure", false, "double"), "open-source");
  assert.equal(treeNodeRowDoubleClickAction("saved-sql-file", false, "double"), "open-saved-sql");
});

test("double click navigation mode toggles expandable rows on double click", () => {
  assert.equal(treeNodeRowDoubleClickAction("connection", false, "double", true), "toggle");
  assert.equal(treeNodeRowDoubleClickAction("group-columns", false, "double", true), "toggle");
  assert.equal(treeNodeRowDoubleClickAction("redis-db", false, "double", false), "toggle");
});

test("expandable non-table rows still toggle from row clicks", () => {
  assert.equal(treeNodeRowAction("connection", true), "toggle");
  assert.equal(treeNodeRowAction("database", true), "toggle");
  assert.equal(treeNodeRowAction("schema", true), "toggle");
  assert.equal(treeNodeRowAction("group-columns", true), "toggle");
});

test("leaf data browser nodes keep their open behavior through toggle handler", () => {
  assert.equal(treeNodeRowAction("redis-db", false), "toggle");
  assert.equal(treeNodeRowAction("mongo-collection", false), "toggle");
});

test("plain metadata leaf rows do nothing on row clicks", () => {
  assert.equal(treeNodeRowAction("column", false), "none");
  assert.equal(treeNodeRowAction("index", false), "none");
});

test("maps source-capable sidebar nodes to object source kinds", () => {
  assert.equal(objectSourceKindForTreeNode("view"), "VIEW");
  assert.equal(objectSourceKindForTreeNode("procedure"), "PROCEDURE");
  assert.equal(objectSourceKindForTreeNode("function"), "FUNCTION");
  assert.equal(objectSourceKindForTreeNode("table"), null);
});

test("database and schema rows open object browser only on double click", () => {
  assert.equal(treeNodeRowAction("database", true), "toggle");
  assert.equal(treeNodeRowAction("schema", true), "toggle");
  assert.equal(treeNodeRowDoubleClickAction("database", true), "open-object-browser");
  assert.equal(treeNodeRowDoubleClickAction("schema", true), "open-object-browser");
  assert.equal(treeNodeRowAction("database", true, "double"), "none");
  assert.equal(treeNodeRowAction("schema", true, "double"), "none");
});

test("double click navigation mode opens object browser for database and schema rows", () => {
  assert.equal(treeNodeRowDoubleClickAction("database", true, "double", false), "open-object-browser");
  assert.equal(treeNodeRowDoubleClickAction("schema", true, "double", false), "open-object-browser");
});

test("double click navigation mode opens object browser and expands expandable database and schema rows", () => {
  assert.equal(treeNodeRowDoubleClickAction("database", true, "double", true), "open-object-browser-and-expand");
  assert.equal(treeNodeRowDoubleClickAction("schema", true, "double", true), "open-object-browser-and-expand");
});

test("double click does not open object browser for non-browsable rows", () => {
  assert.equal(treeNodeRowDoubleClickAction("database", false), "none");
  assert.equal(treeNodeRowDoubleClickAction("table", true), "none");
  assert.equal(treeNodeRowDoubleClickAction("column", true), "none");
});

test("double click navigation mode copies the selected sidebar row name", () => {
  assert.equal(sidebarSelectionCopyAction({ key: "c", metaKey: true }, "double"), "copy-name");
  assert.equal(sidebarSelectionCopyAction({ key: "C", ctrlKey: true }, "double"), "copy-name");
});

test("single click navigation mode leaves copy shortcuts alone", () => {
  assert.equal(sidebarSelectionCopyAction({ key: "c", metaKey: true }, "single"), "none");
});
