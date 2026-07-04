const fs = require("fs");
const path = require("path");

const MCP_PATH = path.join(__dirname, "..", ".cursor", "mcp.json");

function getAuth() {
  const config = JSON.parse(fs.readFileSync(MCP_PATH, "utf8"));
  let auth = config.mcpServers.supabase.headers.Authorization;
  if (!auth.startsWith("Bearer ")) auth = `Bearer ${auth}`;
  const ref = config.mcpServers.supabase.url.match(/project_ref=([^&]+)/)[1];
  return { auth, ref };
}

async function runQuery(query) {
  const { auth, ref } = getAuth();
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${ref}/database/query`,
    {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    }
  );
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

const file = process.argv[2];
if (!file) {
  console.error("Uso: node run-sql.cjs <archivo.sql>");
  process.exit(1);
}

const query = fs.readFileSync(path.join(__dirname, file), "utf8");
runQuery(query)
  .then((r) => console.log(JSON.stringify({ ok: true, result: r }, null, 2)))
  .catch((e) => {
    console.error(JSON.stringify({ ok: false, error: e.message }));
    process.exit(1);
  });
