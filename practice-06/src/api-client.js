export class ApiError extends Error {
  constructor(message, {
    kind,
    status = null,
    code = null,
    details = null,
    url = null,
    cause,
  } = {}) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.code = code;
    this.details = details;
    this.url = url;
  }
}

const ALLOWED_METHODS = new Set(["GET", "POST", "PATCH", "DELETE"]);

export function buildUrl(baseUrl, path, query = {}) {
  if (typeof baseUrl !== "string" || baseUrl.length === 0) {
    throw new TypeError("baseUrl должен быть непустой строкой.");
  }
  let parsed;
  try {
    parsed = new URL(baseUrl);
  } catch {
    throw new TypeError("baseUrl должен быть абсолютным URL.");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new TypeError("baseUrl должен использовать http или https.");
  }
  if (parsed.search || parsed.hash) {
    throw new TypeError("baseUrl не должен содержать query или hash.");
  }
  if (typeof path !== "string" || path.length === 0) {
    throw new TypeError("path должен быть непустой строкой.");
  }

  const normalizedBase = parsed.href.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(normalizedBase + normalizedPath);

  for (const [name, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(name, String(value));
  }

  return url.href;
}

export function createApiClient({
  baseUrl,
  fetchFn = globalThis.fetch,
  timeoutMs = 3000,
} = {}) {
  if (typeof baseUrl !== "string" || baseUrl.length === 0) {
    throw new TypeError("baseUrl должен быть непустой строкой.");
  }
  const parsedBase = new URL(baseUrl);
  if (parsedBase.protocol !== "http:" && parsedBase.protocol !== "https:") {
    throw new TypeError("baseUrl должен использовать http или https.");
  }
  if (parsedBase.search || parsedBase.hash) {
    throw new TypeError("baseUrl не должен содержать query или hash.");
  }
  if (typeof fetchFn !== "function") {
    throw new TypeError("fetchFn должен быть функцией.");
  }
  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0) {
    throw new TypeError("timeoutMs должен быть положительным целым числом.");
  }

  const normalizedBase = parsedBase.href.replace(/\/+$/, "");

  return {
    async requestJson(path, options = {}) {
      const method = (options.method ?? "GET").toUpperCase();
      if (!ALLOWED_METHODS.has(method)) {
        throw new TypeError(`Метод ${method} не поддерживается.`);
      }

      const requestTimeout = options.timeoutMs ?? timeoutMs;
      if (!Number.isInteger(requestTimeout) || requestTimeout <= 0) {
        throw new TypeError("timeoutMs должен быть положительным целым числом.");
      }

      const hasBody = options.body !== undefined && options.body !== null;
      if (method === "GET" && hasBody) {
        throw new TypeError("GET не должен содержать тело запроса.");
      }

      const url = buildUrl(normalizedBase, path, options.query ?? {});

      const headers = { Accept: "application/json" };
      let body;
      if (hasBody) {
        if (typeof options.body !== "object") {
          throw new TypeError("body должен быть объектом.");
        }
        headers["Content-Type"] = "application/json";
        body = JSON.stringify(options.body);
      }

      const timeoutSignal = AbortSignal.timeout(requestTimeout);
      const externalSignal = options.signal;
      const signal = externalSignal
        ? AbortSignal.any([externalSignal, timeoutSignal])
        : timeoutSignal;

      let response;
      try {
        response = await fetchFn(url, { method, headers, body, signal });
      } catch (error) {
        if (externalSignal?.aborted) {
          throw new ApiError("Запрос отменён.", {
            kind: "aborted",
            url,
            cause: error,
          });
        }
        if (timeoutSignal.aborted) {
          throw new ApiError("Превышено время ожидания ответа.", {
            kind: "timeout",
            url,
            cause: error,
          });
        }
        throw new ApiError("Не удалось выполнить сетевой запрос.", {
          kind: "network",
          url,
          cause: error,
        });
      }

      if (!(response instanceof Response)) {
        throw new ApiError("fetchFn вернул не Response.", {
          kind: "invalid-response",
          url,
        });
      }

      if (!response.ok) {
        let code = null;
        let details = null;
        let message = `HTTP ${response.status}.`;
        const contentType = response.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) {
          try {
            const payload = await response.json();
            if (payload && typeof payload === "object" && payload.error) {
              code = payload.error.code ?? null;
              details = payload.error.details ?? null;
              if (
                typeof payload.error.message === "string"
                && payload.error.message.length > 0
              ) {
                message = payload.error.message;
              }
            }
          } catch {
            // Битый JSON у ошибки — оставляем статус.
          }
        }
        throw new ApiError(message, {
          kind: "http",
          status: response.status,
          code,
          details,
          url,
        });
      }

      if (response.status === 204) return null;

      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.toLowerCase().includes("application/json")) {
        throw new ApiError(
          `Ожидался JSON, получен ${contentType || "без Content-Type"}.`,
          { kind: "invalid-response", url },
        );
      }

      try {
        return await response.json();
      } catch (error) {
        throw new ApiError("Не удалось разобрать JSON.", {
          kind: "invalid-response",
          url,
          cause: error,
        });
      }
    },
  };
}