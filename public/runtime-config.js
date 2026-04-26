/**
 * ═══════════════════════════════════════════════════════════════
 * FARMA DO BAIRRO — CONFIGURAÇÃO DE RUNTIME
 * ═══════════════════════════════════════════════════════════════
 *
 * Este arquivo contém as credenciais e configurações que mudam
 * entre ambientes (desenvolvimento, produção). Ele é carregado
 * por todos os HTMLs antes de qualquer outro script.
 *
 * SEGURANÇA:
 * - A chave PUBLISHABLE pode ser exposta no front-end (é segura desde
 *   que Row-Level Security esteja ativado nas tabelas do Supabase).
 * - NUNCA coloque a chave SECRET aqui. Ela só vai em servidor.
 *
 * COMO PREENCHER:
 * 1. Substitua SEU_PUBLISHABLE_KEY_AQUI pela sua Publishable key
 *    (Supabase Dashboard → Settings → API Keys → Publishable key → default)
 * 2. Salve o arquivo
 * 3. Commit + Push pelo GitHub Desktop
 * 4. Vercel faz deploy em ~30 segundos
 *
 * ═══════════════════════════════════════════════════════════════
 */

window.FC_CONFIG = {
  // ── Identidade da aplicação ──
  appName:    "Farma do Bairro",
  appVersion: "1.0.0",
  appBaseUrl: "https://farmadobairro.com.br",

  // ── Supabase (banco de dados + autenticação) ──
  supabaseUrl:        "https://eswwvonedfexvxlzkoof.supabase.co",
  supabasePublishableKey: "https://supabase.com/dashboard/project/eswwvonedfexvxlzkoof/settings/api-keys#:~:text=sb_publishable_FidUGTjUCcIjGHU_uNJBUA_AKHYwrxg",  // ← cole aqui

  // ── Configurações de negócio ──
  cidadeOperacao:    "Itaperuna",
  ufOperacao:        "RJ",
  comissaoPctMed:    10.00,    // 10% sobre medicamentos
  comissaoPctOutros: 0,        // 0% sobre não-medicamentos no MVP

  // ── Frete ──
  freteCentavosBase: 300,      // R$ 3,00 base
  freteCentavosKm:   150,      // R$ 1,50 por km
  freteGratisAcima:  15000,    // R$ 150,00

  // ── PIX ──
  pixChave:       "",          // a preencher quando contratar PSP
  pixNomeBenef:   "VMV Ventures Ltda",
  pixCidade:      "ITAPERUNA",

  // ── Feature flags (ligar/desligar funcionalidades) ──
  features: {
    debugLogs:        true,    // logs no console (desligar em produção real)
    realtimePolling:  true,    // atualizar pedidos em tempo real
    pwaServiceWorker: true,    // habilitar instalação PWA
  },
};

console.log("🟢 FC_CONFIG carregado:", window.FC_CONFIG.appName, "v" + window.FC_CONFIG.appVersion);
