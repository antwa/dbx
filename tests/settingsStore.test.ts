import test from "node:test";
import assert from "node:assert/strict";
import {
  AI_PROVIDER_PRESETS,
  DEFAULT_EDITOR_SETTINGS,
  normalizeAiConfig,
  normalizeEditorSettings,
} from "../src/stores/settingsStore.ts";

test("defaults Redis scan page size to 1000 keys", () => {
  assert.equal(DEFAULT_EDITOR_SETTINGS.redisScanPageSize, 1000);
  assert.equal(normalizeEditorSettings({}).redisScanPageSize, 1000);
});

test("keeps a saved Redis scan page size", () => {
  assert.equal(normalizeEditorSettings({ redisScanPageSize: 5000 }).redisScanPageSize, 5000);
});

test("defaults shortcut settings", () => {
  const settings = normalizeEditorSettings({});

  assert.equal(settings.shortcuts.executeSql, "Mod+Enter");
  assert.equal(settings.shortcuts.saveSql, "Mod+S");
  assert.equal(settings.shortcuts.focusSearch, "Mod+F");
});

test("keeps saved shortcut overrides", () => {
  const settings = normalizeEditorSettings({ shortcuts: { executeSql: "Shift+Mod+Enter" } as any });

  assert.equal(settings.shortcuts.executeSql, "Shift+Mod+Enter");
  assert.equal(settings.shortcuts.saveSql, "Mod+S");
});

test("defaults sidebar activation to single click", () => {
  assert.equal(DEFAULT_EDITOR_SETTINGS.sidebarActivation, "single");
  assert.equal(normalizeEditorSettings({}).sidebarActivation, "single");
});

test("keeps saved sidebar activation", () => {
  assert.equal(normalizeEditorSettings({ sidebarActivation: "double" } as any).sidebarActivation, "double");
  assert.equal(normalizeEditorSettings({ sidebarActivation: "invalid" } as any).sidebarActivation, "single");
});

test("defaults column formatters to an empty record", () => {
  assert.deepEqual(DEFAULT_EDITOR_SETTINGS.columnFormatters, {});
  assert.deepEqual(normalizeEditorSettings({}).columnFormatters, {});
});

test("keeps only valid saved column formatter configs", () => {
  const settings = normalizeEditorSettings({
    columnFormatters: {
      "conn::db::public::users::created_at": { kind: "datetime", unit: "auto" },
      "conn::db::public::users::bad_date": { kind: "datetime", unit: "bogus" },
      "conn::db::public::users::name": { kind: "mask", prefix: 2, suffix: 2 },
      "conn::db::public::users::payload": { kind: "json-path", path: "$.user.name" },
      "conn::db::public::users::invalid_json": { kind: "json-path", path: "user.name" },
    },
  } as any);

  assert.deepEqual(settings.columnFormatters, {
    "conn::db::public::users::created_at": { kind: "datetime", unit: "auto" },
    "conn::db::public::users::name": { kind: "mask", prefix: 2, suffix: 2 },
    "conn::db::public::users::payload": { kind: "json-path", path: "$.user.name" },
  });
});

test("AI provider presets include common hosted and local providers", () => {
  assert.equal(AI_PROVIDER_PRESETS.gemini.endpoint, "https://generativelanguage.googleapis.com");
  assert.equal(AI_PROVIDER_PRESETS.gemini.model, "gemini-1.5-pro");
  assert.equal(AI_PROVIDER_PRESETS.deepseek.endpoint, "https://api.deepseek.com/v1");
  assert.equal(AI_PROVIDER_PRESETS.deepseek.model, "deepseek-v4-flash");
  assert.equal(AI_PROVIDER_PRESETS.qwen.endpoint, "https://dashscope.aliyuncs.com/compatible-mode/v1");
  assert.equal(AI_PROVIDER_PRESETS.ollama.endpoint, "http://localhost:11434/v1");
  assert.equal(AI_PROVIDER_PRESETS.ollama.requiresApiKey, false);
  assert.equal(AI_PROVIDER_PRESETS.openai.iconSlug, "openai");
  assert.equal(AI_PROVIDER_PRESETS.deepseek.iconSlug, "deepseek");
});

test("normalizes legacy AI config and fills provider defaults", () => {
  const legacy = normalizeAiConfig({
    provider: "openai",
    apiKey: "key",
    endpoint: "https://api.openai.com/v1/chat/completions",
    model: "gpt-4o",
  } as any);

  assert.equal(legacy.apiStyle, "completions");
  assert.equal(legacy.provider, "openai");
  assert.equal(legacy.apiKey, "key");

  const ollama = normalizeAiConfig({ provider: "ollama" } as any);
  assert.equal(ollama.endpoint, "http://localhost:11434/v1");
  assert.equal(ollama.model, "llama3.1");
  assert.equal(ollama.apiKey, "");
});
