"use strict";

const STORAGE_KEY = "bacus_console_api_url";
const REFRESH_INTERVAL = 30000;

const $ = (id) => document.getElementById(id);

const state = {
  apiURL: "",
  checking: false,
  endpoints: []
};

const pageNames = {
  overview: "Overview",
  monitor: "Monitor",
  explorer: "API Playground",
  json: "JSON Studio",
  designer: "API Designer",
  logs: "Log Explorer",
  webhooks: "Webhook Lab",
  data: "Data Explorer",
  network: "Network Inspector",
  memory: "Memory Monitor",
  config: "Config Studio",
  projects: "Projects",
  keys: "API Keys",
  settings: "Settings",
  documentation: "Documentation"
};

function write(id, value) {
  const element = $(id);
  if (element) element.textContent = String(value);
}

function show(id, value) {
  const element = $(id);
  if (element) element.textContent = value;
}

function parseJSON(value, label = "JSON") {
  try {
    return JSON.parse(value);
  } catch (error) {
    throw new Error(`${label} inválido: ${error.message}`);
  }
}

function normalizeBaseURL(value) {
  const url = new URL(value);

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Solo se permiten direcciones HTTP o HTTPS.");
  }

  if (url.username || url.password) {
    throw new Error("No incluyas credenciales en la URL.");
  }

  return url.href.replace(/\/+$/, "");
}

function loadConfiguration() {
  try {
    state.apiURL = localStorage.getItem(STORAGE_KEY) || "";
  } catch {
    state.apiURL = "";
  }

  $("api-url").value = state.apiURL;
}

function saveConfiguration() {
  try {
    const value = $("api-url").value.trim();

    if (!value) {
      throw new Error("Escribí la URL de tu API.");
    }

    state.apiURL = normalizeBaseURL(value);

    try {
      localStorage.setItem(STORAGE_KEY, state.apiURL);
    } catch {
      throw new Error("El navegador no permitió guardar la dirección.");
    }

    $("api-url").value = state.apiURL;
    write("overview-detail", "Dirección guardada. Comprobando...");
    checkAPI();
  } catch (error) {
    write("overview-detail", error.message);
  }
}

function clearConfiguration() {
  state.apiURL = "";

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // El panel continúa sin almacenamiento local.
  }

  $("api-url").value = "";
  resetDashboard();
  write("overview-status", "Sin configurar");
  write("overview-detail", "Configurá la dirección de tu API.");
  write("sidebar-status", "API sin configurar");
  $("sidebar-dot").className = "connection-dot";
}

function resetDashboard() {
  [
    "overview-version", "overview-uptime", "overview-memory",
    "overview-build"
  ].forEach((id) => write(id, "—"));

  write("monitor-status", "Sin configurar");
  write("monitor-detail", "Esperando conexión.");
  $("overview-indicator").className = "big-status";
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatUptime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";

  const total = Math.floor(seconds);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (days) return `${days}d ${hours}h`;
  if (hours) return `${hours}h ${minutes}m`;
  if (minutes) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

function makeAPIURL(path) {
  if (!state.apiURL) {
    throw new Error("Primero configurá la dirección de la API.");
  }

  if (!path.startsWith("/") || path.startsWith("//")) {
    throw new Error("La ruta debe comenzar con una sola barra.");
  }

  const base = new URL(state.apiURL);
  const target = new URL(path, base);

  if (target.origin !== base.origin) {
    throw new Error("El endpoint debe pertenecer a la API configurada.");
  }

  return target.href;
}

async function requestURL(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      ...options,
      cache: "no-store",
      signal: controller.signal
    });

    const text = await response.text();
    let data;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    return {
      status: response.status,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
      data
    };
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Tiempo de espera agotado.");
    }

    if (error instanceof TypeError) {
      throw new Error(
        "No se pudo conectar. Revisá la URL, CORS y la conexión."
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function apiRequest(path, options = {}) {
  return requestURL(makeAPIURL(path), options);
}

function setConnection(online, detail) {
  write("overview-status", online ? "ONLINE" : "OFFLINE");
  write("overview-detail", detail);
  write("monitor-status", online ? "ONLINE" : "OFFLINE");
  write("monitor-detail", detail);
  write("sidebar-status", online ? "API conectada" : "API desconectada");

  $("overview-indicator").className =
    `big-status ${online ? "online" : "offline"}`;

  $("sidebar-dot").className =
    `connection-dot ${online ? "online" : "offline"}`;
}

async function checkAPI() {
  if (state.checking) return;

  if (!state.apiURL) {
    write("overview-status", "Sin configurar");
    write("overview-detail", "Guardá la URL de Bacus Dev API.");
    write("monitor-status", "Sin configurar");
    return;
  }

  state.checking = true;
  $("refresh-button").disabled = true;
  $("monitor-refresh").disabled = true;

  try {
    const health = await apiRequest("/health");

    if (!health.ok || health.data?.status !== "healthy") {
      throw new Error("El servidor no informó un estado saludable.");
    }

    setConnection(true, "El servidor respondió correctamente.");

    const [infoResult, metricsResult] = await Promise.allSettled([
      apiRequest("/api/v1/info"),
      apiRequest("/api/v1/metrics")
    ]);

    if (infoResult.status === "fulfilled") {
      const info = infoResult.value.data;
      write("overview-version", info?.version || "—");
      write("overview-build", info?.build || "—");
    }

    if (metricsResult.status === "fulfilled") {
      const metrics = metricsResult.value.data;
      write("overview-uptime", formatUptime(metrics?.uptime_seconds));
      write("overview-memory", formatBytes(metrics?.memory?.rss));
    }

  } catch (error) {
    setConnection(false, error.message);
    resetDashboard();

  } finally {
    write("last-check", new Date().toLocaleTimeString());
    $("refresh-button").disabled = false;
    $("monitor-refresh").disabled = false;
    state.checking = false;
  }
}

/* Navegación */

function navigate() {
  const requested = location.hash.slice(1) || "overview";
  const page = pageNames[requested] ? requested : "overview";

  document.querySelectorAll(".page").forEach((element) => {
    element.classList.remove("active");
  });

  document.querySelectorAll(".nav-link").forEach((element) => {
    element.classList.toggle(
      "active",
      element.dataset.page === page
    );
  });

  $(`page-${page}`).classList.add("active");
  write("page-heading", pageNames[page]);
  $("sidebar").classList.remove("open");
}

/* API Playground */

async function sendRequest() {
  const method = $("request-method").value;
  const path = $("request-path").value.trim();

  write("response-output", "Enviando petición...");
  write("response-status", "Procesando");

  try {
    const headers = parseJSON(
      $("request-headers").value || "{}",
      "Headers"
    );

    if (
      !headers ||
      typeof headers !== "object" ||
      Array.isArray(headers)
    ) {
      throw new Error("Los headers deben ser un objeto JSON.");
    }

    const options = {
      method,
      headers
    };

    const bodyText = $("request-body").value.trim();

    if (["POST", "PUT", "PATCH"].includes(method) && bodyText) {
      parseJSON(bodyText, "Body");
      options.body = bodyText;

      if (!headers["Content-Type"] && !headers["content-type"]) {
        options.headers = {
          ...headers,
          "Content-Type": "application/json"
        };
      }
    }

    const result = await apiRequest(path, options);

    write("response-status", `HTTP ${result.status}`);
    write(
      "response-output",
      typeof result.data === "string"
        ? result.data
        : JSON.stringify(result.data, null, 2)
    );

  } catch (error) {
    write("response-status", "Error");
    write("response-output", error.message);
  }
}

/* JSON Studio */

function jsonFormat() {
  try {
    const parsed = parseJSON($("json-input").value);
    $("json-input").value = JSON.stringify(parsed, null, 2);
    write("json-result", "JSON válido y formateado.");
  } catch (error) {
    write("json-result", error.message);
  }
}

function jsonMinify() {
  try {
    const parsed = parseJSON($("json-input").value);
    $("json-input").value = JSON.stringify(parsed);
    write("json-result", "JSON minificado correctamente.");
  } catch (error) {
    write("json-result", error.message);
  }
}

function jsonValidate() {
  try {
    const parsed = parseJSON($("json-input").value);
    const type = Array.isArray(parsed) ? "array" :
      parsed === null ? "null" : typeof parsed;

    write("json-result", `JSON válido. Tipo raíz: ${type}.`);
  } catch (error) {
    write("json-result", error.message);
  }
}

async function jsonCopy() {
  try {
    await navigator.clipboard.writeText($("json-input").value);
    write("json-result", "Copiado al portapapeles.");
  } catch {
    write("json-result", "No se pudo copiar desde este navegador.");
  }
}

function jsonCompare() {
  try {
    const a = parseJSON($("json-compare-a").value, "Documento A");
    const b = parseJSON($("json-compare-b").value, "Documento B");

    const equal = JSON.stringify(a) === JSON.stringify(b);

    write(
      "json-diff",
      equal
        ? "Los documentos tienen la misma estructura y valores."
        : "Los documentos son diferentes. Revisá ambos JSON para localizar los cambios."
    );
  } catch (error) {
    write("json-diff", error.message);
  }
}

/* API Designer */

function renderDesignedEndpoints() {
  const container = $("design-list");
  container.replaceChildren();

  if (!state.endpoints.length) {
    const empty = document.createElement("p");
    empty.className = "help";
    empty.textContent = "Todavía no diseñaste endpoints.";
    container.appendChild(empty);
    return;
  }

  state.endpoints.forEach((endpoint, index) => {
    const item = document.createElement("div");
    item.className = "endpoint-item";

    const label = document.createElement("code");
    label.textContent = `${endpoint.method} ${endpoint.path}`;

    const description = document.createElement("span");
    description.textContent = endpoint.summary;

    const remove = document.createElement("button");
    remove.className = "button secondary";
    remove.textContent = "Eliminar";
    remove.addEventListener("click", () => {
      state.endpoints.splice(index, 1);
      renderDesignedEndpoints();
    });

    item.append(label, description, remove);
    container.appendChild(item);
  });
}

function addDesignedEndpoint() {
  try {
    const method = $("design-method").value.toLowerCase();
    const path = $("design-path").value.trim();
    const summary = $("design-summary").value.trim();
    const response = parseJSON($("design-response").value, "Respuesta");

    if (!path.startsWith("/") || path.startsWith("//")) {
      throw new Error("La ruta debe empezar con /.");
    }

    if (path.includes("?") || path.includes("#")) {
      throw new Error("No incluyas query strings ni fragmentos en la ruta.");
    }

    if (state.endpoints.some(
      (item) => item.path === path && item.method === method
    )) {
      throw new Error("Ese método y ruta ya existen en el diseño.");
    }

    state.endpoints.push({
      method,
      path,
      summary: summary || "Endpoint sin descripción",
      response
    });

    renderDesignedEndpoints();
    write("design-summary", "");
  } catch (error) {
    alert(error.message);
  }
}

function exportOpenAPI() {
  if (!state.endpoints.length) {
    alert("Añadí al menos un endpoint.");
    return;
  }

  const paths = {};

  state.endpoints.forEach((endpoint) => {
    paths[endpoint.path] ||= {};

    paths[endpoint.path][endpoint.method] = {
      summary: endpoint.summary,
      responses: {
        "200": {
          description: "Respuesta de ejemplo",
          content: {
            "application/json": {
              example: endpoint.response
            }
          }
        }
      }
    };
  });

  downloadJSON({
    openapi: "3.1.0",
    info: {
      title: "Bacus Dev API",
      version: "0.1-RC1.2"
    },
    paths
  }, "bacus-openapi.json");
}

/* Descargas locales */

function downloadJSON(data, filename) {
  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

/* Log Explorer */

async function loadLogs() {
  write("logs-output", "Consultando el backend...");

  try {
    const result = await apiRequest("/api/v1/logs");

    write(
      "logs-output",
      JSON.stringify(result.data, null, 2)
    );
  } catch (error) {
    write(
      "logs-output",
      `No se pudieron consultar logs.\n${error.message}\n\nEl endpoint /api/v1/logs todavía debe implementarse en Bacus Dev API.`
    );
  }
}

/* Webhook Lab */

async function sendWebhook() {
  const rawURL = $("webhook-url").value.trim();

  try {
    const target = new URL(rawURL);

    if (!["http:", "https:"].includes(target.protocol)) {
      throw new Error("Solo se permiten destinos HTTP o HTTPS.");
    }

    if (target.username || target.password) {
      throw new Error("No incluyas credenciales en la URL.");
    }

    const payload = parseJSON($("webhook-payload").value, "Payload");
    const secret = $("webhook-secret").value;

    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json"
    };

    if (secret) {
      headers["Authorization"] = `Bearer ${secret}`;
    }

    write("webhook-output", "Enviando webhook...");

    const result = await requestURL(target.href, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    write("webhook-output", JSON.stringify({
      status: result.status,
      ok: result.ok,
      response: result.data
    }, null, 2));

  } catch (error) {
    write("webhook-output", error.message);
  } finally {
    $("webhook-secret").value = "";
  }
}

/* Data Explorer */

function inspectData() {
  try {
    const data = parseJSON($("data-input").value, "Documento");

    const summary = {
      root_type: Array.isArray(data)
        ? "array"
        : data === null ? "null" : typeof data,
      root_keys: data && typeof data === "object" && !Array.isArray(data)
        ? Object.keys(data)
        : [],
      item_count: Array.isArray(data) ? data.length :
        data && typeof data === "object" ? Object.keys(data).length : 1,
      formatted: JSON.stringify(data, null, 2)
    };

    write("data-output", JSON.stringify(summary, null, 2));
  } catch (error) {
    write("data-output", error.message);
  }
}

/* Network Inspector */

async function runNetworkTest() {
  write("network-output", "Ejecutando diagnóstico...");
  write("network-online", navigator.onLine ? "ONLINE" : "OFFLINE");
  write("network-api", state.apiURL || "Sin configurar");

  if (!state.apiURL) {
    write("network-output", "Configurá primero la dirección de la API.");
    return;
  }

  const started = performance.now();

  try {
    const result = await apiRequest("/health");
    const elapsed = performance.now() - started;

    write("network-latency", `${elapsed.toFixed(1)} ms`);
    write("network-http", result.status);
    write("network-output", JSON.stringify({
      connected: result.ok,
      elapsed_ms: Number(elapsed.toFixed(2)),
      browser_online: navigator.onLine,
      response: result.data
    }, null, 2));

  } catch (error) {
    write("network-latency", "—");
    write("network-http", "Error");
    write("network-output", error.message);
  }
}

/* Memory Monitor */

async function refreshMemory() {
  write("memory-output", "Consultando métricas...");

  try {
    const result = await apiRequest("/api/v1/metrics");
    const data = result.data;
    const memory = data?.memory || {};

    write("memory-rss", formatBytes(memory.rss));
    write("memory-heap-used", formatBytes(memory.heap_used));
    write("memory-heap-total", formatBytes(memory.heap_total));
    write("memory-uptime", formatUptime(data?.uptime_seconds));

    write("memory-output", JSON.stringify(data, null, 2));
  } catch (error) {
    write("memory-output", error.message);
  }
}

/* Config Studio */

function validateConfig() {
  try {
    const config = parseJSON($("config-input").value, "Configuración");

    if (!config || typeof config !== "object" || Array.isArray(config)) {
      throw new Error("La configuración debe ser un objeto JSON.");
    }

    write("config-result", "Configuración JSON válida.");
  } catch (error) {
    write("config-result", error.message);
  }
}

function formatConfig() {
  try {
    const config = parseJSON($("config-input").value, "Configuración");
    $("config-input").value = JSON.stringify(config, null, 2);
    write("config-result", "Configuración formateada.");
  } catch (error) {
    write("config-result", error.message);
  }
}

function exportConfig() {
  try {
    const config = parseJSON($("config-input").value, "Configuración");

    if (!config || typeof config !== "object" || Array.isArray(config)) {
      throw new Error("La configuración debe ser un objeto JSON.");
    }

    downloadJSON(config, "bacus-config.json");
    write("config-result", "Archivo de configuración exportado.");
  } catch (error) {
    write("config-result", error.message);
  }
}

/* Inicio */

function initialize() {
  loadConfiguration();

  $("save-url").addEventListener("click", saveConfiguration);
  $("clear-url").addEventListener("click", clearConfiguration);

  $("refresh-button").addEventListener("click", checkAPI);
  $("monitor-refresh").addEventListener("click", checkAPI);

  $("send-request").addEventListener("click", sendRequest);

  $("json-format").addEventListener("click", jsonFormat);
  $("json-minify").addEventListener("click", jsonMinify);
  $("json-validate").addEventListener("click", jsonValidate);
  $("json-copy").addEventListener("click", jsonCopy);
  $("json-compare").addEventListener("click", jsonCompare);

  $("design-add").addEventListener("click", addDesignedEndpoint);
  $("design-export").addEventListener("click", exportOpenAPI);

  $("load-logs").addEventListener("click", loadLogs);
  $("send-webhook").addEventListener("click", sendWebhook);
  $("data-inspect").addEventListener("click", inspectData);
  $("network-test").addEventListener("click", runNetworkTest);
  $("memory-refresh").addEventListener("click", refreshMemory);

  $("config-validate").addEventListener("click", validateConfig);
  $("config-format").addEventListener("click", formatConfig);
  $("config-export").addEventListener("click", exportConfig);

  $("menu-button").addEventListener("click", () => {
    $("sidebar").classList.toggle("open");
  });

  window.addEventListener("hashchange", navigate);

  navigate();
  checkAPI();

  setInterval(checkAPI, REFRESH_INTERVAL);
}

initialize();