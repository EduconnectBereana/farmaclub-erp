
(function(){
  const MONOFASICO_HINTS = [
    /^3003/, /^3004/, /^3002/, /^3001/
  ];

  function text(parent, localName){
    if(!parent) return '';
    const els = parent.getElementsByTagName('*');
    for (const el of els) {
      if (el.localName === localName) return (el.textContent || '').trim();
    }
    return '';
  }

  function directChildren(parent, localName){
    return Array.from(parent.getElementsByTagName('*')).filter(el => el.localName === localName);
  }

  function normalizeDigits(value){
    return String(value || '').replace(/\D+/g, '');
  }

  function inferMonofasico(ncm){
    const code = normalizeDigits(ncm).slice(0, 8);
    return MONOFASICO_HINTS.some(rx => rx.test(code));
  }

  function inferIcmsST(ncm){
    const code = normalizeDigits(ncm).slice(0, 4);
    return ['3002', '3003', '3004', '3005', '3006'].includes(code);
  }

  function parseNFeXMLText(xmlText){
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, 'application/xml');
    const parserError = xml.getElementsByTagName('parsererror')[0];
    if (parserError) throw new Error('XML inválido');

    const infNFe = directChildren(xml, 'infNFe')[0] || xml.documentElement;
    const emit = directChildren(infNFe, 'emit')[0] || xml;
    const ide = directChildren(infNFe, 'ide')[0] || xml;
    const total = directChildren(infNFe, 'ICMSTot')[0] || xml;
    const dets = directChildren(infNFe, 'det');

    const nota = {
      chave: ((infNFe.getAttribute && infNFe.getAttribute('Id')) || '').replace(/^NFe/, ''),
      numero: text(ide, 'nNF'),
      serie: text(ide, 'serie'),
      emitidaEm: text(ide, 'dhEmi') || text(ide, 'dEmi'),
      fornecedor: text(emit, 'xNome'),
      fornecedorCnpj: normalizeDigits(text(emit, 'CNPJ')),
      valorTotal: Number(text(total, 'vNF') || 0)
    };

    const itens = dets.map((det, idx) => {
      const prod = directChildren(det, 'prod')[0] || det;
      const imposto = directChildren(det, 'imposto')[0] || det;
      const ncm = normalizeDigits(text(prod, 'NCM')).slice(0, 8);
      const cest = text(prod, 'CEST');
      const ean = normalizeDigits(text(prod, 'cEAN')) || normalizeDigits(text(prod, 'cEANTrib'));
      const quantidade = Number(text(prod, 'qCom') || 0);
      const valorUnitario = Number(text(prod, 'vUnCom') || 0);
      const valorTotal = Number(text(prod, 'vProd') || 0);
      const cfop = text(prod, 'CFOP');
      const cstIcms = text(imposto, 'CST') || text(imposto, 'CSOSN');

      return {
        seq: idx + 1,
        codigoFornecedor: text(prod, 'cProd'),
        produto: text(prod, 'xProd'),
        ean,
        ncm,
        cest,
        cfop,
        quantidade,
        valorUnitario,
        valorTotal,
        monofasico: inferMonofasico(ncm),
        icmsSt: inferIcmsST(ncm),
        cstIcms,
        fonteNcm: 'XML fornecedor',
        statusFiscal: ean && ncm ? 'pré-validado' : 'revisar',
        beneficioRJ: 'Validar por NCM/operação',
        risco: !ncm ? 'alto' : (!ean ? 'médio' : 'baixo')
      };
    });

    return { nota, itens };
  }

  function summarizeItens(itens){
    return {
      itens: itens.length,
      novosCadastros: itens.filter(i => !i.ean).length,
      revisar: itens.filter(i => i.statusFiscal === 'revisar').length,
      semEan: itens.filter(i => !i.ean).length,
      monofasicos: itens.filter(i => i.monofasico).length,
      icmsSt: itens.filter(i => i.icmsSt).length
    };
  }

  window.FARMACLUB_FISCAL = {
    normalizeDigits,
    inferMonofasico,
    inferIcmsST,
    parseNFeXMLText,
    summarizeItens
  };
})();
