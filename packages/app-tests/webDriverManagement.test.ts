import { readFileSync } from "node:fs";
import { strict as assert } from "node:assert";
import test from "node:test";

const apiSource = readFileSync("apps/desktop/src/lib/api.ts", "utf8");
const httpSource = readFileSync("apps/desktop/src/lib/http.ts", "utf8");
const tauriSource = readFileSync("apps/desktop/src/lib/tauri.ts", "utf8");
const driverStoreSource = readFileSync("apps/desktop/src/components/config/DriverStoreDialog.vue", "utf8");
const webMainSource = readFileSync("crates/dbx-web/src/main.rs", "utf8");
const webRoutesSource = readFileSync("crates/dbx-web/src/routes/mod.rs", "utf8");

const agentFunctions = [
  "listInstalledAgentsLocal",
  "listInstalledAgents",
  "installAgent",
  "upgradeAllAgents",
  "uninstallAgent",
  "getAgentJavaRuntimeConfig",
  "setAgentJavaRuntimeConfig",
  "invalidateAgentRegistryCache",
  "reinstallJre",
  "uninstallJre",
  "listenAgentInstallProgress",
];

test("shared frontend API exposes agent driver management functions", () => {
  for (const name of agentFunctions) {
    assert.match(apiSource, new RegExp(`export const ${name} = forward\\("${name}"\\)`));
    assert.match(httpSource, new RegExp(`export async function ${name}\\b`));
    assert.match(tauriSource, new RegExp(`export async function ${name}\\b`));
  }
  assert.match(apiSource, /export const aiListModels = forward\("aiListModels"\)/);
  assert.match(httpSource, /export async function aiListModels\b/);
  assert.match(tauriSource, /export async function aiListModels\b/);
});

test("web backend exposes agent driver management routes", () => {
  assert.match(webRoutesSource, /pub mod agents;/);
  assert.match(webMainSource, /\/agents\/installed-local/);
  assert.match(webMainSource, /\/agents\/install/);
  assert.match(webMainSource, /\/agents\/progress\/\{operationId\}/);
  assert.match(webMainSource, /\/agents\/java-runtime/);
  assert.match(webMainSource, /\/ai\/models/);
});

test("web runtime supports importing an offline agent driver zip", () => {
  assert.match(httpSource, /export async function importAgentsFromZip\(fileOrPath: string \| File\)/);
  assert.match(httpSource, /FormData/);
  assert.match(httpSource, /\/api\/agents\/import-offline/);
  assert.doesNotMatch(httpSource, /Offline ZIP import is only available in the desktop app/);
  assert.match(webMainSource, /\/agents\/import-offline/);
  assert.match(driverStoreSource, /chooseWebOfflineZip/);
  assert.match(driverStoreSource, /accept = "\.zip"/);
  assert.doesNotMatch(driverStoreSource, /if \(isWeb \|\| importingZip\.value\) return;/);
});
