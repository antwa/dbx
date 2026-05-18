import { readFileSync } from "node:fs";
import { strict as assert } from "node:assert";
import test from "node:test";

const appSource = readFileSync("apps/desktop/src/App.vue", "utf8");
const connectionDialogSource = readFileSync("apps/desktop/src/components/connection/ConnectionDialog.vue", "utf8");
const driverStoreSource = readFileSync("apps/desktop/src/components/config/DriverStoreDialog.vue", "utf8");

test("web runtime handles driver store open events", () => {
  assert.match(appSource, /showDriverStore\.value = true;/);
  assert.doesNotMatch(appSource, /if \(!isDesktop\) return;\s+showDriverStore\.value = true;/);
});

test("web runtime can show driver install hints", () => {
  assert.match(connectionDialogSource, /showAgentDriverInstallHint\(form\.value\.db_type, agentDrivers\.value\)/);
  assert.doesNotMatch(connectionDialogSource, /isDesktop &&\s+showAgentDriverInstallHint/);
});

test("driver store uses the shared API instead of direct Tauri calls", () => {
  assert.doesNotMatch(driverStoreSource, /@tauri-apps\/api\/core/);
  assert.doesNotMatch(driverStoreSource, /@tauri-apps\/api\/event/);
  assert.match(driverStoreSource, /api\.listInstalledAgents/);
  assert.match(driverStoreSource, /api\.listenAgentInstallProgress/);
});
