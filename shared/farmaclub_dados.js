window.FARMACLUB = {
  config: {
    comissaoMedicamentosPct: 10,
    freteIntegralMotoboy: true,
    formasPagamentoMvp: ['pix','credito','debito'],
    multimeiosAtivo: false,
    observacaoPagamento: 'MVP com 1 meio de pagamento por pedido. Estrutura preparada para multimeios na fase 2.'
  },
  farmacias: [
    { id: 1, nome: "Farmácia São João", bairro: "Centro", aberto: true, faturamento: 87600, comissao_pct: 10, estoque_pct: 92, status: "online", cnpj: "12.345.678/0001-90", produtos_cadastrados: 8421, fiscais_validados: 7810 },
    { id: 2, nome: "Vida & Saúde", bairro: "Parque Noel", aberto: true, faturamento: 52000, comissao_pct: 10, estoque_pct: 78, status: "online", cnpj: "23.456.789/0001-01", produtos_cadastrados: 5300, fiscais_validados: 4200 },
    { id: 3, nome: "Farmácia Popular", bairro: "São Cristóvão", aberto: false, faturamento: 41200, comissao_pct: 10, estoque_pct: 65, status: "offline", cnpj: "34.567.890/0001-12", produtos_cadastrados: 4700, fiscais_validados: 3150 },
    { id: 4, nome: "Drogaria Esperança", bairro: "Meudon", aberto: true, faturamento: 63400, comissao_pct: 10, estoque_pct: 88, status: "online", cnpj: "45.678.901/0001-23", produtos_cadastrados: 6190, fiscais_validados: 5012 },
    { id: 5, nome: "Boa Saúde", bairro: "Boa Sorte", aberto: true, faturamento: 29800, comissao_pct: 10, estoque_pct: 55, status: "online", cnpj: "56.789.012/0001-34", produtos_cadastrados: 2500, fiscais_validados: 1410 },
    { id: 6, nome: "Drogaria Central", bairro: "Retiro", aberto: false, faturamento: 44700, comissao_pct: 10, estoque_pct: 71, status: "offline", cnpj: "67.890.123/0001-45", produtos_cadastrados: 4012, fiscais_validados: 2288 }
  ],
  produtos: [
    { id: 101, nome: "Dipirona 1g c/10", ean: "789000000001", lab: "Neo Química", cat: "dor", preco_ref: 6.90, custo_ref: 2.45, receita: false, ativo: true, ncm: "30049069", cest: "13.001.00", monofasico: true, icms_st: true, beneficio_rj: "Sem benefício específico", fonte_ncm: "XML fornecedor", status_fiscal: "validado", anvisa: "1.2345.6789.001-0", eh_medicamento: true },
    { id: 102, nome: "Losartana 50mg c/30", ean: "789000000002", lab: "EMS", cat: "cardio", preco_ref: 12.90, custo_ref: 3.20, receita: true, ativo: true, ncm: "30049099", cest: "13.001.00", monofasico: true, icms_st: true, beneficio_rj: "Sem benefício específico", fonte_ncm: "XML fornecedor", status_fiscal: "validado", anvisa: "1.1111.2222.333-4", eh_medicamento: true },
    { id: 103, nome: "Omeprazol 20mg c/28", ean: "789000000003", lab: "Medley", cat: "gastro", preco_ref: 17.90, custo_ref: 5.60, receita: false, ativo: true, ncm: "30049099", cest: "13.001.00", monofasico: true, icms_st: true, beneficio_rj: "Sem benefício específico", fonte_ncm: "XML fornecedor", status_fiscal: "validado", anvisa: "1.0000.0000.123-4", eh_medicamento: true },
    { id: 104, nome: "Vitamina C 1g", ean: "789000000004", lab: "Cimed", cat: "vitaminas", preco_ref: 9.90, custo_ref: 1.80, receita: false, ativo: true, ncm: "21069030", cest: "28.038.00", monofasico: false, icms_st: false, beneficio_rj: "Sem benefício específico", fonte_ncm: "Cadastro manual", status_fiscal: "revisar", anvisa: "ISENTO", eh_medicamento: false },
    { id: 105, nome: "Amoxicilina 500mg", ean: "789000000005", lab: "Eurofarma", cat: "antibioticos", preco_ref: 24.90, custo_ref: 8.10, receita: true, ativo: true, ncm: "30041019", cest: "13.001.00", monofasico: true, icms_st: true, beneficio_rj: "Sem benefício específico", fonte_ncm: "XML fornecedor", status_fiscal: "validado", anvisa: "1.9999.9999.999-9", eh_medicamento: true }
  ],
  pedidos: [
    { id: "#4521", cliente: "Maria Silva", farmaciaId: 1, bairro: "Parque Noel", itens: 3, subtotalMedicamentos: 87.50, frete: 8.00, juros: 0, taxaGateway: 2.49, taxaFarmaClub: 8.75, status: "entregando", motoboy: "Carlos Mendes", tempo: "12 min", formaPagamento: "pix", split: { farmacia: 78.26, motoboy: 8.00, farmaClub: 8.75 } },
    { id: "#4520", cliente: "João Pereira", farmaciaId: 4, bairro: "Centro", itens: 1, subtotalMedicamentos: 45.00, frete: 6.50, juros: 2.10, taxaGateway: 1.98, taxaFarmaClub: 4.50, status: "coletando", motoboy: "Pedro Lima", tempo: "5 min", formaPagamento: "credito", split: { farmacia: 46.12, motoboy: 6.50, farmaClub: 4.50 } },
    { id: "#4519", cliente: "Ana Costa", farmaciaId: 1, bairro: "São Cristóvão", itens: 5, subtotalMedicamentos: 156.30, frete: 10.00, juros: 0, taxaGateway: 4.95, taxaFarmaClub: 15.63, status: "entregue", motoboy: "Carlos Mendes", tempo: "32 min", formaPagamento: "debito", split: { farmacia: 145.72, motoboy: 10.00, farmaClub: 15.63 } },
    { id: "#4518", cliente: "Roberto Alves", farmaciaId: 2, bairro: "Parque Noel", itens: 2, subtotalMedicamentos: 62.00, frete: 7.00, juros: 0, taxaGateway: 1.89, taxaFarmaClub: 6.20, status: "aguardando", motoboy: "—", tempo: "—", formaPagamento: "pix", split: { farmacia: 53.80, motoboy: 7.00, farmaClub: 6.20 } }
  ],
  motoboys: [
    { nome: "Carlos Mendes", status: "em rota", pedidosHoje: 8, ganhos: 48, local: "Centro → Parque Noel", av: 4.9, wallet_status: "validado" },
    { nome: "Pedro Lima", status: "coletando", pedidosHoje: 5, ganhos: 30, local: "Centro", av: 4.8, wallet_status: "validado" },
    { nome: "Marcos Teixeira", status: "disponível", pedidosHoje: 6, ganhos: 42, local: "Meudon", av: 4.7, wallet_status: "pendente" }
  ],
  campanhas: [
    { nome: "Semana da Imunidade", tipo: "vitaminas", alcance: "rede", status: "ativa", inicio: "01/04/2026", fim: "07/04/2026" },
    { nome: "Alívio da Dor", tipo: "analgésicos", alcance: "app + site", status: "rascunho", inicio: "08/04/2026", fim: "15/04/2026" }
  ],
  entradasFiscais: [
    { fornecedor: "Distribuidora Sul Rio", numero: "184522", serie: "1", emitidaEm: "2026-04-03", itens: 48, valorTotal: 3841.50, novosCadastros: 11, revisaoFiscal: 4 },
    { fornecedor: "Ativa Distribuição", numero: "991044", serie: "3", emitidaEm: "2026-04-06", itens: 31, valorTotal: 2190.20, novosCadastros: 7, revisaoFiscal: 2 }
  ],
  pagamentosConfig: {
    modeloAtual: 'single_method_mvp',
    metodosAtivos: ['pix','credito','debito'],
    multiCartao: false,
    mixedMethods: false,
    splitSobre: 'medicamentos',
    repasseFrete: '100% motoboy',
    gatewayPadrao: 'definir PSP com split nativo'
  }
};
