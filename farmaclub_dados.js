/**
 * FARMADOBAIRRO — DADOS CENTRAIS
 * Arquivo único de configuração compartilhado por todos os módulos.
 * Quando integrado ao Supabase, este arquivo será substituído por
 * chamadas ao banco de dados. Por ora, é a fonte única de verdade.
 *
 * Para adicionar uma farmácia: copie um bloco e preencha os dados.
 * Coordenadas: use maps.google.com, clique no endereço, copie lat/lng.
 */

window.FARMADOBAIRRO = {

  // ═══════════════════════════════════════════════
  // FARMÁCIAS PARCEIRAS
  // Preencher com dados reais ao cadastrar cada parceira
  // ═══════════════════════════════════════════════
  farmacias: [
    {
      id: 1,
      ativo: true,
      aberto: true,

      // Dados cadastrais (do contrato de adesão)
      nome: "Farmácia São João",
      razao_social: "São João Farmácia Ltda",
      cnpj: "12.345.678/0001-90",
      crf: "CRF-RJ 12345",
      responsavel: "João Carlos Oliveira",
      telefone: "(22) 3822-1234",

      // Endereço completo (do CNPJ — mesma fonte da contabilidade)
      endereco: "Rua Getúlio Vargas, 342",
      bairro: "Centro",
      cidade: "Itaperuna",
      uf: "RJ",
      cep: "28300-000",
      endereco_completo: "Rua Getúlio Vargas, 342 — Centro, Itaperuna/RJ",

      // Coordenadas GPS (obtidas do endereço — usadas pelo frete)
      // Para pegar: abra maps.google.com, pesquise o endereço, clique com botão direito
      lat: -21.2062,
      lng: -41.8878,

      // Dados operacionais
      horario: "Seg–Sex 8h–20h · Sáb 8h–18h",
      nota: 4.9,
      cor: "#0d9488",

      // Financeiro (usado pela contabilidade)
      faturamento_mes: 87600,
      comissao_pct: 10,
    },
    {
      id: 2,
      ativo: true,
      aberto: true,
      nome: "Vida & Saúde",
      razao_social: "Vida e Saúde Farmácia Ltda",
      cnpj: "23.456.789/0001-01",
      crf: "CRF-RJ 23456",
      responsavel: "Maria Aparecida Santos",
      telefone: "(22) 3822-5678",
      endereco: "Av. Amaro Soares, 88",
      bairro: "Parque Noel",
      cidade: "Itaperuna",
      uf: "RJ",
      cep: "28300-000",
      endereco_completo: "Av. Amaro Soares, 88 — Parque Noel, Itaperuna/RJ",
      lat: -21.1980,
      lng: -41.8820,
      horario: "Seg–Sáb 7h–22h · Dom 8h–14h · 24h",
      nota: 4.7,
      cor: "#2563eb",
      faturamento_mes: 52000,
      comissao_pct: 10,
    },
    {
      id: 3,
      ativo: true,
      aberto: false,
      nome: "Farmácia Popular",
      razao_social: "Popular Farmácia e Drogaria Ltda",
      cnpj: "34.567.890/0001-12",
      crf: "CRF-RJ 34567",
      responsavel: "Carlos Eduardo Lima",
      telefone: "(22) 3822-9012",
      endereco: "Rua 7 de Setembro, 201",
      bairro: "São Cristóvão",
      cidade: "Itaperuna",
      uf: "RJ",
      cep: "28300-000",
      endereco_completo: "Rua 7 de Setembro, 201 — São Cristóvão, Itaperuna/RJ",
      lat: -21.2120,
      lng: -41.8950,
      horario: "Seg–Sex 8h–19h · Sáb 8h–14h",
      nota: 4.5,
      cor: "#dc2626",
      faturamento_mes: 41200,
      comissao_pct: 10,
    },
    {
      id: 4,
      ativo: true,
      aberto: true,
      nome: "Drogaria Esperança",
      razao_social: "Esperança Drogaria Ltda",
      cnpj: "45.678.901/0001-23",
      crf: "CRF-RJ 45678",
      responsavel: "Ana Paula Ferreira",
      telefone: "(22) 3822-3456",
      endereco: "Av. Principal, 10",
      bairro: "Morro do Crica",
      cidade: "Itaperuna",
      uf: "RJ",
      cep: "28300-000",
      endereco_completo: "Av. Principal, 10 — Morro do Crica, Itaperuna/RJ",
      lat: -21.2150,
      lng: -41.8820,
      horario: "Seg–Sex 8h–20h · Sáb 8h–17h",
      nota: 4.7,
      cor: "#d97706",
      faturamento_mes: 63400,
      comissao_pct: 10,
    },
    {
      id: 5,
      ativo: true,
      aberto: true,
      nome: "Farmácia Boa Saúde",
      razao_social: "Boa Saúde Farmácia Ltda",
      cnpj: "56.789.012/0001-34",
      crf: "CRF-RJ 56789",
      responsavel: "Roberto Alves",
      telefone: "(22) 3822-7890",
      endereco: "Rua das Flores, 55",
      bairro: "Meudon",
      cidade: "Itaperuna",
      uf: "RJ",
      cep: "28300-000",
      endereco_completo: "Rua das Flores, 55 — Meudon, Itaperuna/RJ",
      lat: -21.1950,
      lng: -41.8780,
      horario: "Seg–Sex 8h–20h · Sáb 8h–15h",
      nota: 4.6,
      cor: "#7c3aed",
      faturamento_mes: 29800,
      comissao_pct: 10,
    },
    {
      id: 6,
      ativo: true,
      aberto: false,
      nome: "Drogaria Central",
      razao_social: "Central Drogaria e Farmácia Ltda",
      cnpj: "67.890.123/0001-45",
      crf: "CRF-RJ 67890",
      responsavel: "Fernanda Lima",
      telefone: "(22) 3822-2345",
      endereco: "Rua Central, 120",
      bairro: "Boa Sorte",
      cidade: "Itaperuna",
      uf: "RJ",
      cep: "28300-000",
      endereco_completo: "Rua Central, 120 — Boa Sorte, Itaperuna/RJ",
      lat: -21.2200,
      lng: -41.8900,
      horario: "Seg–Sex 8h–19h · Sáb 8h–13h",
      nota: 4.5,
      cor: "#0891b2",
      faturamento_mes: 44700,
      comissao_pct: 10,
    },
  ],

  // ═══════════════════════════════════════════════
  // CONFIGURAÇÃO DE FRETE
  // Editável pelo painel — será salvo no Supabase
  // ═══════════════════════════════════════════════
  frete: {
    taxa_base: 3.00,        // R$ cobrado em qualquer entrega
    valor_por_km: 1.50,     // R$ por km de distância
    multiplicador_pico: 1.4, // fator aplicado no horário de pico
    pico_inicio_1: 11,      // hora início pico manhã
    pico_fim_1: 13,         // hora fim pico manhã
    pico_inicio_2: 18,      // hora início pico tarde
    pico_fim_2: 20,         // hora fim pico tarde
    frete_gratis_acima: 150, // 0 = desativado
    velocidade_media_kmh: 25, // velocidade média do motoboy
    taxa_fragil: 2.00,      // adicional para produtos frágeis/refrigerados
  },

  // ═══════════════════════════════════════════════
  // CONFIGURAÇÃO GERAL
  // ═══════════════════════════════════════════════
  config: {
    nome_rede: "Farma do Bairro",
    cidade: "Itaperuna",
    uf: "RJ",
    centro_lat: -21.2062,   // centro do mapa (usado como referência)
    centro_lng: -41.8878,
    zoom_inicial: 14,
    whatsapp_suporte: "5522999999999",
    comissao_padrao_pct: 10,
    taxa_implantacao: 2000,
  },

  // ═══════════════════════════════════════════════
  // HELPERS — funções úteis para todos os módulos
  // ═══════════════════════════════════════════════
  getFarmaciaById: function(id) {
    return this.farmacias.find(f => f.id === id);
  },

  getFarmaciasAtivas: function() {
    return this.farmacias.filter(f => f.ativo);
  },

  getFarmaciasAbertas: function() {
    return this.farmacias.filter(f => f.ativo && f.aberto);
  },

  calcularFrete: function(distKm, valorPedido, horaInt) {
    const cfg = this.frete;
    const pico = (horaInt >= cfg.pico_inicio_1 && horaInt <= cfg.pico_fim_1) ||
                 (horaInt >= cfg.pico_inicio_2 && horaInt <= cfg.pico_fim_2);
    const mult = pico ? cfg.multiplicador_pico : 1;
    let frete = (cfg.taxa_base + cfg.valor_por_km * distKm) * mult;
    frete = Math.max(cfg.taxa_base, +frete.toFixed(2));
    const gratis = cfg.frete_gratis_acima > 0 && valorPedido >= cfg.frete_gratis_acima;
    const tempo = Math.round((distKm / cfg.velocidade_media_kmh) * 60) + 5;
    return { frete, freteCliente: gratis ? 0 : frete, gratis, pico, tempo };
  },

  haversine: function(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dL = (lat2 - lat1) * Math.PI / 180;
    const dN = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dL/2)**2 + Math.cos(lat1*Math.PI/180) *
              Math.cos(lat2*Math.PI/180) * Math.sin(dN/2)**2;
    return +(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(2);
  },

  farmaciasOrdenadaPorDistancia: function(lat, lng) {
    return this.farmacias
      .filter(f => f.ativo)
      .map(f => ({ ...f, dist: this.haversine(lat, lng, f.lat, f.lng) }))
      .sort((a, b) => a.dist - b.dist);
  },
};
