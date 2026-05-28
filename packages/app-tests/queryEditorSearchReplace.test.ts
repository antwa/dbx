import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("apps/desktop/src/components/editor/QueryEditor.vue", "utf8");
const searchPanelSource = readFileSync("apps/desktop/src/components/editor/EditorSearchPanel.vue", "utf8");
const appSource = readFileSync("apps/desktop/src/App.vue", "utf8");
const cellDetailEditorSource = readFileSync("apps/desktop/src/composables/useCellDetailEditor.ts", "utf8");
const contentAreaSource = readFileSync("apps/desktop/src/components/layout/ContentArea.vue", "utf8");
const dataGridSource = readFileSync("apps/desktop/src/components/grid/DataGrid.vue", "utf8");
const editorThemeSource = readFileSync("apps/desktop/src/lib/editorThemes.ts", "utf8");

test("query editor opens search and replace with configurable shortcuts", () => {
  assert.match(source, /shortcutToCodeMirrorKey\(shortcuts\.find\)/);
  assert.match(source, /shortcutToCodeMirrorKey\(shortcuts\.replace\)/);
  assert.match(source, /run:\s*openReplace/);
  assert.match(source, /defineExpose\(\{\s*openSearch,\s*openReplace,\s*scrollCursorIntoView\s*\}\)/);
  assert.match(searchPanelSource, /showReplace\.value\s*=\s*true/);
  assert.match(searchPanelSource, /replaceInputRef\.value\?\.focus\(\)/);
  assert.match(searchPanelSource, /defineExpose\(\{\s*openSearch,\s*openReplace,\s*closeSearch\s*\}\)/);
});

test("query editor localizes the replace all button", () => {
  assert.match(searchPanelSource, /t\("editor\.search\.replaceAll"\)/);
  assert.doesNotMatch(searchPanelSource, />\s*全部\s*</);
});

test("query editor no longer binds keyboard shortcuts for editor font zoom", () => {
  assert.doesNotMatch(source, /key:\s*"Mod-="/);
  assert.doesNotMatch(source, /key:\s*"Mod-\+"/);
  assert.doesNotMatch(source, /key:\s*"Mod--"/);
  assert.doesNotMatch(source, /key:\s*"Mod-0"/);
});

test("query editor exposes a context menu for executing selected SQL", () => {
  assert.match(source, /CustomContextMenu/);
  assert.match(source, /v-slot="\{ onContextMenu \}"/);
  assert.match(source, /syncContextMenuState\(update\.view\)/);
  assert.match(source, /executeSelection/);
  assert.match(source, /copySelection/);
  assert.match(source, /selectAllSqlFromContextMenu/);
  assert.match(appSource, /\[data-context-menu\]/);
});

test("query editor does not apply custom search match highlight styles", () => {
  assert.doesNotMatch(editorThemeSource, /"\.cm-searchMatch"/);
  assert.doesNotMatch(editorThemeSource, /"\.cm-searchMatch-selected"/);
});

test("cell detail editor uses custom search panel with configurable shortcuts", () => {
  assert.match(cellDetailEditorSource, /shortcutToCodeMirrorKey\(shortcuts\.find\)/);
  assert.match(cellDetailEditorSource, /shortcutToCodeMirrorKey\(shortcuts\.replace\)/);
  assert.match(cellDetailEditorSource, /openSearch:\s*\(\)\s*=>\s*boolean/);
  assert.match(cellDetailEditorSource, /openReplace:\s*\(\)\s*=>\s*boolean/);
  assert.match(cellDetailEditorSource, /createApp\(EditorSearchPanel/);
  assert.match(cellDetailEditorSource, /searchApp\.use\(i18n\)/);
  assert.match(dataGridSource, /openCellDetailSearch/);
});

test("data grid uses Mod-R for refresh instead of editor replace", () => {
  assert.match(dataGridSource, /data-grid-root/);
  assert.match(dataGridSource, /data-cell-detail-editor-root/);
  assert.match(dataGridSource, /if \(event\.defaultPrevented\) return/);
  assert.match(dataGridSource, /isModRShortcut\(event\)/);
  assert.match(dataGridSource, /await onToolbarRefresh\(\)/);
});

test("app keydown routes Mod-R directly before browser reload handling", () => {
  assert.match(appSource, /if \(e\.defaultPrevented\) return/);
  assert.match(appSource, /isModRShortcut\(e\)/);
  assert.match(appSource, /contentAreaRef\.value\?\.handleModRTarget\(e\.target\)/);
  assert.match(contentAreaSource, /function handleModRTarget\(target: Element\): boolean/);
  assert.match(contentAreaSource, /queryEditorRef\.value\?\.openReplace\(\)/);
  assert.match(contentAreaSource, /dataGridRef\.value\?\.openCellDetailSearch\(\)/);
  assert.match(contentAreaSource, /if \(target\.closest\("\[data-grid-root\]"\)\) return refreshData\(\)/);
});

test("app routes global UI zoom shortcuts across editor surfaces", () => {
  assert.match(appSource, /const shortcuts = settingsStore\.editorSettings\.shortcuts;/);
  assert.match(appSource, /isZoomInShortcut\(e, shortcuts\)/);
  assert.match(appSource, /isZoomOutShortcut\(e, shortcuts\)/);
  assert.match(appSource, /isResetZoomShortcut\(e, shortcuts\)/);
  assert.match(appSource, /isGlobalUiZoomTarget\(e\.target\)/);
  assert.match(appSource, /settingsStore\.updateEditorSettings\(\{\s*uiScale:\s*scale\s*\}\)/);
  assert.match(appSource, /\[data-query-editor-root\], \[data-cell-detail-editor-root\], \[data-object-source-editor\]/);
});
