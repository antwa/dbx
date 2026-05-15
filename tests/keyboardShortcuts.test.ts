import { strict as assert } from "node:assert";
import test from "node:test";
import {
  isCancelSearchShortcut,
  isCloseTabShortcut,
  isExecuteSqlShortcut,
  isFocusSearchShortcut,
  isSaveShortcut,
} from "../src/lib/keyboardShortcuts.ts";

test("matches Cmd+Enter for SQL execution", () => {
  assert.equal(isExecuteSqlShortcut({ key: "Enter", metaKey: true }), true);
});

test("matches Ctrl+Enter for SQL execution", () => {
  assert.equal(isExecuteSqlShortcut({ key: "Enter", ctrlKey: true }), true);
});

test("ignores Enter without modifier", () => {
  assert.equal(isExecuteSqlShortcut({ key: "Enter" }), false);
});

test("ignores composing input events", () => {
  assert.equal(isExecuteSqlShortcut({ key: "Enter", metaKey: true, isComposing: true }), false);
});

test("matches Cmd+W for closing query tabs", () => {
  assert.equal(isCloseTabShortcut({ key: "w", metaKey: true }), true);
});

test("ignores Ctrl+W for closing query tabs", () => {
  assert.equal(isCloseTabShortcut({ key: "w", ctrlKey: true }), false);
});

test("matches Ctrl+F for focusing search", () => {
  assert.equal(isFocusSearchShortcut({ key: "f", ctrlKey: true }), true);
});

test("matches Cmd+F for focusing search", () => {
  assert.equal(isFocusSearchShortcut({ key: "F", metaKey: true }), true);
});

test("ignores focus search shortcut while composing", () => {
  assert.equal(isFocusSearchShortcut({ key: "f", ctrlKey: true, isComposing: true }), false);
});

test("ignores Alt+F for focusing search", () => {
  assert.equal(isFocusSearchShortcut({ key: "f", altKey: true }), false);
});

test("matches Cmd+S for saving", () => {
  assert.equal(isSaveShortcut({ key: "s", metaKey: true }), true);
});

test("matches Ctrl+S for saving", () => {
  assert.equal(isSaveShortcut({ key: "S", ctrlKey: true }), true);
});

test("ignores save shortcut while composing", () => {
  assert.equal(isSaveShortcut({ key: "s", metaKey: true, isComposing: true }), false);
});

test("ignores Alt+S for saving", () => {
  assert.equal(isSaveShortcut({ key: "s", altKey: true }), false);
});

test("matches Escape for cancelling search", () => {
  assert.equal(isCancelSearchShortcut({ key: "Escape" }), true);
});

test("ignores cancelling search while composing", () => {
  assert.equal(isCancelSearchShortcut({ key: "Escape", isComposing: true }), false);
});
