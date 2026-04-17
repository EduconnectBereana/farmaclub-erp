window.FC_CONFIG = window.FC_CONFIG || {
  supabaseUrl: "",
  supabaseAnonKey: "",
  appBaseUrl: "",
  appName: "FarmaClub"
};

window.FCSupabase = {
  isConfigured() {
    return Boolean(window.FC_CONFIG.supabaseUrl && window.FC_CONFIG.supabaseAnonKey);
  },
  headers() {
    if (!this.isConfigured()) throw new Error("Supabase não configurado.");
    return {
      "Content-Type": "application/json",
      "apikey": window.FC_CONFIG.supabaseAnonKey,
      "Authorization": `Bearer ${window.FC_CONFIG.supabaseAnonKey}`
    };
  },
  async get(table, query = "") {
    if (!this.isConfigured()) return [];
    const sep = query ? `?${query}` : "";
    const r = await fetch(`${window.FC_CONFIG.supabaseUrl}/rest/v1/${table}${sep}`, { headers: this.headers() });
    if (!r.ok) throw new Error(`GET ${table} falhou: ${r.status}`);
    return r.json();
  },
  async insert(table, body) {
    if (!this.isConfigured()) throw new Error("Supabase não configurado.");
    const r = await fetch(`${window.FC_CONFIG.supabaseUrl}/rest/v1/${table}`, {
      method: "POST",
      headers: { ...this.headers(), Prefer: "return=representation" },
      body: JSON.stringify(body)
    });
    if (!r.ok) throw new Error(`INSERT ${table} falhou: ${r.status}`);
    const data = await r.json();
    return Array.isArray(data) ? data[0] : data;
  }
};
