const args = new Set(process.argv.slice(2));
const forceLocal = args.has("--local");
const rawBaseUrl = forceLocal ? "http://localhost:3001" : process.env.STAGING_BASE_URL || process.env.APP_URL || "http://localhost:3001";
const baseUrl = normalizeBaseUrl(rawBaseUrl);

const publicRoutes = ["/", "/services", "/products", "/contact", "/api/health"];
const protectedRoutes = ["/admin", "/admin/tickets"];
let failures = 0;

console.log(`Smoke target: ${baseUrl}`);
console.log("No credentials, cookies, or secrets are sent.");

for (const route of publicRoutes) {
  const result = await checkRoute(route);
  printResult("PUBLIC", route, result);

  if (result.error || result.status >= 500) {
    failures += 1;
  }
}

for (const route of protectedRoutes) {
  const result = await checkRoute(route);
  printResult("PROTECTED", route, result);

  if (result.error || result.status >= 500) {
    failures += 1;
    continue;
  }

  if (result.status >= 200 && result.status < 300) {
    failures += 1;
    console.error(`[FAIL] ${route} responded with ${result.status}; protected admin route appears publicly accessible.`);
  }
}

if (failures > 0) {
  console.error(`Smoke checks failed: ${failures}`);
  process.exitCode = 1;
} else {
  console.log("Smoke checks passed.");
}

async function checkRoute(route) {
  const url = new URL(route, baseUrl);

  try {
    const response = await fetch(url, {
      redirect: "manual",
      headers: {
        "user-agent": "fengzlab-smoke-check/1.0",
      },
    });

    return {
      status: response.status,
      statusText: response.statusText,
      location: safeLocation(response.headers.get("location")),
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function printResult(kind, route, result) {
  if (result.error) {
    console.error(`[${kind}] ${route}: ERROR ${result.error}`);
    return;
  }

  const location = result.location ? ` -> ${result.location}` : "";
  console.log(`[${kind}] ${route}: ${result.status} ${result.statusText}${location}`);
}

function normalizeBaseUrl(value) {
  try {
    const url = new URL(value);
    url.pathname = "/";
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    console.error(`Invalid base URL: ${value}`);
    process.exit(1);
  }
}

function safeLocation(value) {
  if (!value) {
    return null;
  }

  try {
    const location = new URL(value, baseUrl);
    return `${location.pathname}${location.search}`;
  } catch {
    return "<invalid-location>";
  }
}
