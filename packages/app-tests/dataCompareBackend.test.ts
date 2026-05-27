import { readFileSync } from "node:fs";
import { strict as assert } from "node:assert";
import test from "node:test";

const apiSource = readFileSync("apps/desktop/src/lib/api.ts", "utf8");
const tauriSource = readFileSync("apps/desktop/src/lib/tauri.ts", "utf8");
const httpSource = readFileSync("apps/desktop/src/lib/http.ts", "utf8");
const dataCompareDialogSource = readFileSync("apps/desktop/src/components/diff/DataCompareDialog.vue", "utf8");
const dataCompareSource = readFileSync("apps/desktop/src/lib/dataCompare.ts", "utf8");
const tauriCommandsSource = readFileSync("src-tauri/src/commands/mod.rs", "utf8");
const tauriLibSource = readFileSync("src-tauri/src/lib.rs", "utf8");
const webRoutesSource = readFileSync("crates/dbx-web/src/routes/mod.rs", "utf8");
const webMainSource = readFileSync("crates/dbx-web/src/main.rs", "utf8");
const rustCoreLibSource = readFileSync("crates/dbx-core/src/lib.rs", "utf8");

test("shared API exposes backend data compare preparation", () => {
  assert.match(apiSource, /export const prepareDataCompare = forward\("prepareDataCompare"\)/);
  assert.match(apiSource, /export const prepareDataCompareFromTables = forward\("prepareDataCompareFromTables"\)/);
  assert.match(apiSource, /export const buildDataCompareSyncPlan = forward\("buildDataCompareSyncPlan"\)/);
  assert.match(tauriSource, /export async function prepareDataCompare\(/);
  assert.match(tauriSource, /invoke\("prepare_data_compare"/);
  assert.match(tauriSource, /export async function prepareDataCompareFromTables\(/);
  assert.match(tauriSource, /invoke\("prepare_data_compare_from_tables"/);
  assert.match(tauriSource, /export async function buildDataCompareSyncPlan\(/);
  assert.match(tauriSource, /invoke\("build_data_compare_sync_plan"/);
  assert.match(httpSource, /export async function prepareDataCompare\(/);
  assert.match(httpSource, /\/api\/data-compare\/prepare/);
  assert.match(httpSource, /export async function prepareDataCompareFromTables\(/);
  assert.match(httpSource, /\/api\/data-compare\/prepare-from-tables/);
  assert.match(httpSource, /export async function buildDataCompareSyncPlan\(/);
  assert.match(httpSource, /\/api\/data-compare\/build-sync-plan/);
});

test("data compare dialog delegates comparison and sync SQL generation to backend API", () => {
  assert.match(dataCompareDialogSource, /await api\.prepareDataCompareFromTables\(/);
  assert.match(dataCompareDialogSource, /await api\.buildDataCompareSyncPlan\(/);
  assert.doesNotMatch(dataCompareDialogSource, /await api\.prepareDataCompare\(/);
  assert.doesNotMatch(dataCompareDialogSource, /buildTableSelectSql/);
  assert.doesNotMatch(dataCompareDialogSource, /compareDataRows\(/);
  assert.doesNotMatch(dataCompareDialogSource, /generateDataSyncStatements\(/);
  assert.doesNotMatch(dataCompareDialogSource, /generateDataSyncSql\(/);
});

test("data compare dialog supports type and row level selection for sync planning", () => {
  assert.match(dataCompareDialogSource, /selectedSummary/);
  assert.match(dataCompareDialogSource, /selectAllKind/);
  assert.match(dataCompareDialogSource, /toggleRowSelection/);
  assert.match(dataCompareDialogSource, /buildSelectedDiff/);
  assert.match(dataCompareDialogSource, /detailPreviewLimit/);
});

test("frontend data compare module no longer owns executable compare or SQL logic", () => {
  assert.doesNotMatch(dataCompareSource, /export function compareDataRows/);
  assert.doesNotMatch(dataCompareSource, /export function generateDataSyncStatements/);
  assert.doesNotMatch(dataCompareSource, /export function generateDataSyncSql/);
});

test("Rust backends register data compare APIs", () => {
  assert.match(rustCoreLibSource, /pub mod data_compare/);
  assert.match(tauriCommandsSource, /pub mod data_compare/);
  assert.match(tauriLibSource, /commands::data_compare::prepare_data_compare/);
  assert.match(tauriLibSource, /commands::data_compare::prepare_data_compare_from_tables/);
  assert.match(tauriLibSource, /commands::data_compare::build_data_compare_sync_plan/);
  assert.match(webRoutesSource, /pub mod data_compare/);
  assert.match(webMainSource, /\/data-compare\/prepare/);
  assert.match(webMainSource, /\/data-compare\/prepare-from-tables/);
  assert.match(webMainSource, /\/data-compare\/build-sync-plan/);
});
