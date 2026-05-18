import { readFileSync } from "node:fs";
import { strict as assert } from "node:assert";
import test from "node:test";

const apiSource = readFileSync("apps/desktop/src/lib/api.ts", "utf8");
const httpSource = readFileSync("apps/desktop/src/lib/http.ts", "utf8");
const tauriSource = readFileSync("apps/desktop/src/lib/tauri.ts", "utf8");
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
});

test("web backend exposes agent driver management routes", () => {
  assert.match(webRoutesSource, /pub mod agents;/);
  assert.match(webMainSource, /\/agents\/installed-local/);
  assert.match(webMainSource, /\/agents\/install/);
  assert.match(webMainSource, /\/agents\/progress\/\{operationId\}/);
  assert.match(webMainSource, /\/agents\/java-runtime/);
});
