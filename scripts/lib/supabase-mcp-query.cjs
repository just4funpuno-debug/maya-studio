const fs = require("fs");
const path = require("path");

const MCP_PATH = path.join(__dirname, "..", "..", ".cursor", "mcp.json");

function getMcpAuth() {
  if (!fs.existsSync(MCP_PATH)) {
    throw new Error(
      "No existe .cursor/mcp.json. Créalo con las credenciales MCP de Supabase."
    );
  }
  const config = JSON.parse(fs.readFileSync(MCP_PATH, "utf8"));
  let auth = config.mcpServers.supabase.headers.Authorization;
  if (!auth.startsWith("Bearer ")) auth = `Bearer ${auth}`;
  const ref = config.mcpServers.supabase.url.match(/project_ref=([^&]+)/)[1];
  return { auth, ref };
}

async function runQuery(query) {
  const { auth, ref } = getMcpAuth();
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${ref}/database/query`,
    {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    }
  );
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return text ? JSON.parse(text) : null;
}

module.exports = { runQuery, getMcpAuth };
