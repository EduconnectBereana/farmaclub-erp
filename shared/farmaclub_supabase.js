/**
 * ═══════════════════════════════════════════════════════════════
 * FARMA DO BAIRRO — INTEGRAÇÃO SUPABASE (Publishable Key v2)
 * ═══════════════════════════════════════════════════════════════
 *
 * Cliente Supabase customizado, sem dependência do SDK oficial NPM.
 * Funciona com o novo formato de chaves do Supabase (sb_publishable_*).
 *
 * REQUER: window.FC_CONFIG já carregado (via /public/runtime-config.js)
 *
 * USO:
 *   await window.FDB.listarFarmacias();
 *   await window.FDB.criarPedido(pedido, itens);
 *
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  // ── Carregar configuração do runtime ──
  const CFG = window.FC_CONFIG || {};
  const SUPABASE_URL = CFG.supabaseUrl || "";
  const SUPABASE_KEY = CFG.supabasePublishableKey || "";

  // Validação básica
  if (!SUPABASE_URL || SUPABASE_URL.includes("SEU_") || !SUPABASE_KEY || SUPABASE_KEY.includes("SEU_")) {
    console.warn(
      "⚠️ Supabase não configurado. Preencha public/runtime-config.js com:\n" +
      "   - supabaseUrl\n" +
      "   - supabasePublishableKey"
    );
  }

  // ══════════════════════════════════════════════════════════
  // CLIENTE SUPABASE — helper leve, sem NPM
  // Compatível com nova chave Publishable e antiga JWT (anon)
  // ══════════════════════════════════════════════════════════
  const sb = {
    url: SUPABASE_URL,
    key: SUPABASE_KEY,

    // Cabeçalhos padrão
    _headers(token) {
      return {
        "Content-Type":  "application/json",
        "apikey":        this.key,
        "Authorization": `Bearer ${token || this.key}`,
        "Prefer":        "return=representation",
      };
    },

    // Token do usuário logado (se houver session ativa)
    _token() {
      try {
        const session = JSON.parse(localStorage.getItem("sb_session") || "{}");
        return session?.access_token || this.key;
      } catch {
        return this.key;
      }
    },

    // ── QUERY BUILDER leve ──
    from(table) {
      const base = `${this.url}/rest/v1/${table}`;
      const client = this;
      let params = [];
      let selectFields = "*";
      let orderBy = null;
      let limitN = null;

      const q = {
        select(fields = "*") { selectFields = fields; return q; },
        eq(col, val)    { params.push(`${col}=eq.${encodeURIComponent(val)}`); return q; },
        neq(col, val)   { params.push(`${col}=neq.${encodeURIComponent(val)}`); return q; },
        gt(col, val)    { params.push(`${col}=gt.${encodeURIComponent(val)}`); return q; },
        gte(col, val)   { params.push(`${col}=gte.${encodeURIComponent(val)}`); return q; },
        lt(col, val)    { params.push(`${col}=lt.${encodeURIComponent(val)}`); return q; },
        lte(col, val)   { params.push(`${col}=lte.${encodeURIComponent(val)}`); return q; },
        ilike(col, val) { params.push(`${col}=ilike.${encodeURIComponent(val)}`); return q; },
        in(col, vals)   { params.push(`${col}=in.(${vals.map(encodeURIComponent).join(",")})`); return q; },
        order(col, asc = true) { orderBy = `${col}.${asc ? "asc" : "desc"}`; return q; },
        limit(n) { limitN = n; return q; },

        async get() {
          const qs = [
            ...params,
            `select=${selectFields}`,
            orderBy && `order=${orderBy}`,
            limitN && `limit=${limitN}`,
          ].filter(Boolean).join("&");

          try {
            const r = await fetch(`${base}?${qs}`, {
              headers: client._headers(client._token()),
            });
            const data = await r.json();
            if (!r.ok) {
              if (CFG.features?.debugLogs) console.error("[Supabase GET]", table, data);
              return { data: null, error: data };
            }
            return { data, error: null };
          } catch (e) {
            return { data: null, error: { message: e.message } };
          }
        },

        async single() {
          const res = await q.limit(1).get();
          if (res.error) return res;
          return { data: res.data?.[0] || null, error: null };
        },

        async insert(body) {
          try {
            const r = await fetch(base, {
              method: "POST",
              headers: client._headers(client._token()),
              body: JSON.stringify(Array.isArray(body) ? body : [body]),
            });
            const data = await r.json();
            if (!r.ok) {
              if (CFG.features?.debugLogs) console.error("[Supabase INSERT]", table, data);
              return { data: null, error: data };
            }
            return { data: Array.isArray(data) ? data[0] : data, error: null };
          } catch (e) {
            return { data: null, error: { message: e.message } };
          }
        },

        async update(body) {
          try {
            const qs = params.join("&");
            const r = await fetch(`${base}?${qs}`, {
              method: "PATCH",
              headers: client._headers(client._token()),
              body: JSON.stringify(body),
            });
            const data = await r.json();
            if (!r.ok) {
              if (CFG.features?.debugLogs) console.error("[Supabase UPDATE]", table, data);
              return { data: null, error: data };
            }
            return { data: Array.isArray(data) ? data[0] : data, error: null };
          } catch (e) {
            return { data: null, error: { message: e.message } };
          }
        },

        async delete() {
          try {
            const qs = params.join("&");
            const r = await fetch(`${base}?${qs}`, {
              method: "DELETE",
              headers: client._headers(client._token()),
            });
            if (!r.ok) {
              const data = await r.json();
              return { error: data };
            }
            return { error: null };
          } catch (e) {
            return { error: { message: e.message } };
          }
        },
      };
      return q;
    },

    // ── AUTENTICAÇÃO ──
    auth: {
      _url() { return SUPABASE_URL + "/auth/v1"; },
      _key() { return SUPABASE_KEY; },

      async signIn(email, password) {
        try {
          const r = await fetch(`${this._url()}/token?grant_type=password`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "apikey": this._key() },
            body: JSON.stringify({ email, password }),
          });
          const data = await r.json();
          if (!r.ok) return { user: null, session: null, error: data };
          localStorage.setItem("sb_session", JSON.stringify(data));
          return { user: data.user, session: data, error: null };
        } catch (e) {
          return { user: null, session: null, error: { message: e.message } };
        }
      },

      async signUp(email, password, metadata = {}) {
        try {
          const r = await fetch(`${this._url()}/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "apikey": this._key() },
            body: JSON.stringify({ email, password, data: metadata }),
          });
          const data = await r.json();
          if (!r.ok) return { user: null, error: data };
          return { user: data.user, error: null };
        } catch (e) {
          return { user: null, error: { message: e.message } };
        }
      },

      async signOut() {
        const session = JSON.parse(localStorage.getItem("sb_session") || "{}");
        if (session.access_token) {
          try {
            await fetch(`${this._url()}/logout`, {
              method: "POST",
              headers: {
                "apikey": this._key(),
                "Authorization": `Bearer ${session.access_token}`,
              },
            });
          } catch {}
        }
        localStorage.removeItem("sb_session");
        localStorage.removeItem("fc_farmacia_logada");
        return { error: null };
      },

      getSession() {
        try {
          const s = JSON.parse(localStorage.getItem("sb_session") || "{}");
          if (!s.access_token) return null;
          const exp = s.expires_at ? s.expires_at * 1000 : 0;
          if (exp && Date.now() > exp) {
            localStorage.removeItem("sb_session");
            return null;
          }
          return s;
        } catch {
          return null;
        }
      },

      getUser() {
        return this.getSession()?.user || null;
      },

      async refreshSession() {
        const s = this.getSession();
        if (!s?.refresh_token) return null;
        try {
          const r = await fetch(`${this._url()}/token?grant_type=refresh_token`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "apikey": this._key() },
            body: JSON.stringify({ refresh_token: s.refresh_token }),
          });
          if (!r.ok) return null;
          const data = await r.json();
          localStorage.setItem("sb_session", JSON.stringify(data));
          return data;
        } catch {
          return null;
        }
      },
    },

    // ── REALTIME (polling leve, sem WebSocket) ──
    realtime: {
      _intervals: {},

      subscribe(table, farmaciaId, callback, intervalMs = 5000) {
        const key = `${table}_${farmaciaId || "all"}`;
        if (this._intervals[key]) return key;
        this._intervals[key] = setInterval(async () => {
          const q = sb.from(table);
          if (farmaciaId) q.eq("farmacia_id", farmaciaId);
          q.order("created_at", false).limit(50);
          const { data } = await q.get();
          if (data) callback(data);
        }, intervalMs);
        return key;
      },

      unsubscribe(key) {
        if (this._intervals[key]) {
          clearInterval(this._intervals[key]);
          delete this._intervals[key];
        }
      },

      unsubscribeAll() {
        Object.keys(this._intervals).forEach(k => this.unsubscribe(k));
      },
    },
  };

  // ══════════════════════════════════════════════════════════
  // HELPERS DE NEGÓCIO — usados por todos os módulos
  // Renomeado de FC para FDB (Farma do Bairro), mantém alias FC
  // ══════════════════════════════════════════════════════════
  const FDB = {
    // Configuração
    config: CFG,

    // Farmácia logada no ERP
    getFarmaciaLogada() {
      try {
        return JSON.parse(localStorage.getItem("fc_farmacia_logada") || "null");
      } catch {
        return null;
      }
    },

    setFarmaciaLogada(f) {
      localStorage.setItem("fc_farmacia_logada", JSON.stringify(f));
    },

    // ── FARMÁCIAS ──
    async listarFarmacias() {
      const { data } = await sb.from("farmacias").select("*").order("nome").get();
      return data || [];
    },

    async getFarmacia(id) {
      const { data } = await sb.from("farmacias").eq("id", id).single();
      return data;
    },

    async salvarFarmacia(obj) {
      if (obj.id) return sb.from("farmacias").eq("id", obj.id).update(obj);
      return sb.from("farmacias").insert(obj);
    },

    // ── PRODUTOS ──
    async listarProdutos(farmaciaId) {
      const q = sb.from("produtos").select("*").order("nome");
      if (farmaciaId) q.eq("farmacia_id", farmaciaId);
      const { data } = await q.get();
      return data || [];
    },

    async salvarProduto(obj) {
      if (obj.id) return sb.from("produtos").eq("id", obj.id).update(obj);
      return sb.from("produtos").insert(obj);
    },

    // ── ESTOQUE ──
    async getEstoque(farmaciaId) {
      const { data } = await sb.from("estoque")
        .select("*, produtos(*)")
        .eq("farmacia_id", farmaciaId)
        .get();
      return data || [];
    },

    async atualizarEstoque(farmaciaId, produtoId, qtd) {
      const { data: ex } = await sb.from("estoque")
        .eq("farmacia_id", farmaciaId)
        .eq("produto_id", produtoId)
        .single();
      if (ex) {
        return sb.from("estoque")
          .eq("id", ex.id)
          .update({ quantidade: qtd, updated_at: new Date().toISOString() });
      }
      return sb.from("estoque").insert({
        farmacia_id: farmaciaId,
        produto_id: produtoId,
        quantidade: qtd,
      });
    },

    // ── PEDIDOS ──
    async criarPedido(pedido, itens) {
      const { data: ped, error: e1 } = await sb.from("pedidos").insert(pedido);
      if (e1) return { error: e1 };
      if (itens && itens.length) {
        const itensComId = itens.map(it => ({ ...it, pedido_id: ped.id }));
        const { error: e2 } = await sb.from("pedido_itens").insert(itensComId);
        if (e2) return { error: e2 };
      }
      return { data: ped, error: null };
    },

    async listarPedidos(filtros = {}) {
      const q = sb.from("pedidos")
        .select("*, pedido_itens(*), farmacias(nome,bairro)")
        .order("created_at", false);
      if (filtros.farmacia_id) q.eq("farmacia_id", filtros.farmacia_id);
      if (filtros.status)      q.eq("status", filtros.status);
      if (filtros.limit)       q.limit(filtros.limit);
      const { data } = await q.get();
      return data || [];
    },

    async atualizarStatusPedido(pedidoId, status, extra = {}) {
      return sb.from("pedidos").eq("id", pedidoId).update({
        status,
        updated_at: new Date().toISOString(),
        ...extra,
      });
    },

    // ── MOTOBOYS ──
    async listarMotoboys(filtros = {}) {
      const q = sb.from("motoboys").select("*").order("nome");
      if (filtros.disponivel !== undefined) q.eq("disponivel", filtros.disponivel);
      const { data } = await q.get();
      return data || [];
    },

    async atualizarMotoboy(id, dados) {
      return sb.from("motoboys").eq("id", id).update(dados);
    },

    // ── CLIENTES ──
    async buscarCliente(email) {
      const { data } = await sb.from("clientes").eq("email", email).single();
      return data;
    },

    async salvarCliente(obj) {
      if (obj.id) return sb.from("clientes").eq("id", obj.id).update(obj);
      return sb.from("clientes").insert(obj);
    },

    // ── DIAGNÓSTICO DA CONEXÃO ──
    async testarConexao() {
      try {
        const r = await fetch(`${SUPABASE_URL}/rest/v1/farmacias?select=id&limit=1`, {
          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`,
          },
        });
        if (r.status === 401) return { ok: false, msg: "Chave Publishable incorreta ou não configurada" };
        if (r.status === 404) return { ok: false, msg: "Tabela 'farmacias' não encontrada — rode o SQL de criação" };
        if (!r.ok)            return { ok: false, msg: `Erro HTTP ${r.status}` };
        return { ok: true, msg: "Conexão Supabase OK ✅" };
      } catch (e) {
        return { ok: false, msg: `Falha de rede: ${e.message}` };
      }
    },
  };

  // Expor globalmente
  window.sb  = sb;
  window.FDB = FDB;
  window.FC  = FDB; // alias retro-compatível

  if (CFG.features?.debugLogs) {
    console.log("🟢 Supabase carregado:", SUPABASE_URL);
  }
})();
