
(function(){
  const ctx = window.fcContabCtx;
  if(!ctx || !ctx.renders || !ctx.titulos) return;

  const STYLE_ID = 'fc-regime-style';
  if(!document.getElementById(STYLE_ID)){
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .fc-grid-2{display:grid;grid-template-columns:1.15fr .85fr;gap:16px}
      .fc-grid-3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
      .fc-kv{display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-bottom:1px solid #f1f1f1;font-size:12px}
      .fc-kv:last-child{border-bottom:none}
      .fc-list{display:grid;gap:10px}
      .fc-mini{font-size:11px;color:#888}
      .fc-chip{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:600;border:1px solid #e5e7eb;background:#fff}
      .fc-ok{color:#15803d;background:#f0fdf4;border-color:#bbf7d0}
      .fc-warn{color:#b45309;background:#fffbeb;border-color:#fde68a}
      .fc-danger{color:#b91c1c;background:#fef2f2;border-color:#fecaca}
      .fc-box{border:1px solid #e8e8e8;border-radius:12px;padding:14px;background:#fff}
      .fc-muted{color:#777;font-size:11px}
      .fc-right{text-align:right}
      .fc-bucket{display:grid;grid-template-columns:1fr auto auto;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid #f5f5f5;font-size:12px}
      .fc-bucket:last-child{border-bottom:none}
      .fc-progress{height:8px;background:#efefef;border-radius:999px;overflow:hidden}
      .fc-progress>span{display:block;height:100%;background:#3BAA35}
      .fc-note{font-size:11px;color:#666;line-height:1.5}
      .fc-table td,.fc-table th{padding:10px 12px}
      .fc-pill-num{display:inline-block;min-width:60px;text-align:center;padding:2px 8px;border-radius:999px;background:#f6f6f6;font-size:11px}
      .fc-actions{display:flex;gap:8px;flex-wrap:wrap}
      @media (max-width:1100px){.fc-grid-2,.fc-grid-3{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  const ANEXO_I = [
    {limit:180000, nominal:0.04, deduct:0},
    {limit:360000, nominal:0.073, deduct:5940},
    {limit:720000, nominal:0.095, deduct:13860},
    {limit:1800000, nominal:0.107, deduct:22500},
    {limit:3600000, nominal:0.143, deduct:87300},
    {limit:4800000, nominal:0.19, deduct:378000}
  ];

  const STORAGE_KEY = 'fc_regime_params_v2';
  const DEMO_MONTHS = 12;
  const BUCKET_LABELS = {
    commerce_normal:'Comércio normal',
    commerce_monophase:'Monofásico',
    commerce_st_icms:'ICMS-ST',
    commerce_monophase_st_icms:'Monofásico + ST',
    commerce_anticipation_icms:'Antecipação ICMS',
    services:'Serviços',
    other_revenue:'Outras receitas'
  };

  function fmt(v){
    return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL',minimumFractionDigits:2});
  }
  function pct(v){ return `${(Number(v||0)*100).toFixed(2)}%`; }
  function safeParse(v, fallback=0){ const n = Number(String(v).replace(',','.')); return Number.isFinite(n)?n:fallback; }
  function readStore(){ try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');}catch{return {};}}
  function writeStore(obj){ localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); }
  function getFarmaciasBase(){ return window.fcContabData?.farmacias || []; }
  function supabaseEnabled(){ return typeof window.sb !== 'undefined' && !String(window.SUPABASE_ANON||'').includes('COLE_AQUI'); }

  function ensureButtons(){
    if(document.querySelector('[data-tab="regime_inteligente"]')) return;
    const impostosBtn = document.querySelector('[data-tab="impostos"]');
    const cadastroBtn = document.querySelector('[data-tab="cadastro"]');
    if(impostosBtn){
      impostosBtn.insertAdjacentHTML('afterend', `<button class="nav-btn" data-tab="regime_inteligente" onclick="setTab('regime_inteligente')"><span class="nav-sym">◈</span>Regime Inteligente</button>`);
    }
    if(cadastroBtn){
      cadastroBtn.insertAdjacentHTML('afterend', `<button class="nav-btn" data-tab="parametros_fiscais" onclick="setTab('parametros_fiscais')"><span class="nav-sym">◬</span>Parâmetros Fiscais</button>`);
    }
  }

  function getDefaults(farmacia){
    const mensal = Number(farmacia?.faturamento || farmacia?.faturamento_mes || 115000);
    return {
      farmacia_id: farmacia?.id || 1,
      company_name: farmacia?.nome || 'Farmácia',
      state: farmacia?.uf || 'RJ',
      current_regime: 'simples_nacional',
      payroll: Math.round(mensal * 0.11),
      pro_labore: 3500,
      rat_rate: 0.02,
      terceiros_rate: 0.058,
      percent_monophase: 0.58,
      percent_st: 0.14,
      percent_monophase_st: 0.18,
      percent_anticipation: 0.04,
      percent_services: 0.01,
      estimated_icms_non_simples_rate: 0.028,
      net_margin_rate: 0.085,
      pis_cofins_credit_rate: 0.025,
      accounting_profit_rate: 0.085,
      use_live_sales: true,
      data_quality_score: 0.72
    };
  }

  function getParams(farmacia){
    const store = readStore();
    return {...getDefaults(farmacia), ...(store[farmacia.id]||{})};
  }

  function setParams(farmaciaId, params){
    const store = readStore();
    store[farmaciaId] = {...store[farmaciaId], ...params};
    writeStore(store);
  }

  function faixaSimples(rbt12){
    return ANEXO_I.find(x => rbt12 <= x.limit) || ANEXO_I[ANEXO_I.length-1];
  }
  function aliquotaEfetivaSimples(rbt12){
    const faixa = faixaSimples(rbt12);
    return Math.max(0, ((rbt12 * faixa.nominal) - faixa.deduct) / rbt12);
  }

  function normalizeShares(params){
    const mono = Math.max(0, params.percent_monophase||0);
    const st = Math.max(0, params.percent_st||0);
    const monoSt = Math.max(0, params.percent_monophase_st||0);
    const ant = Math.max(0, params.percent_anticipation||0);
    const services = Math.max(0, params.percent_services||0);
    let normal = 1 - mono - st - monoSt - ant - services;
    if(normal < 0) normal = 0;
    const total = mono+st+monoSt+ant+services+normal;
    return {
      commerce_normal: normal/total,
      commerce_monophase: mono/total,
      commerce_st_icms: st/total,
      commerce_monophase_st_icms: monoSt/total,
      commerce_anticipation_icms: ant/total,
      services: services/total,
      other_revenue: 0
    };
  }

  function inferBucket(product){
    const text = `${product?.categoria||''} ${product?.nome||''}`.toLowerCase();
    const isService = !!product?.is_service || /servi|aplica|inje|teste/.test(text);
    const mono = !!product?.is_monophase || /medic|antib|dipirona|paracetamol|omeprazol|amoxicilina|losartana|dorflex|novalgina/.test(text);
    const st = !!product?.has_icms_st || /perfuma|cosm|higien|shampoo|sabonete|fralda|vitamina/.test(text);
    const ant = !!product?.has_anticipation_icms;
    if(isService) return 'services';
    if(mono && st) return 'commerce_monophase_st_icms';
    if(mono) return 'commerce_monophase';
    if(st) return 'commerce_st_icms';
    if(ant) return 'commerce_anticipation_icms';
    return 'commerce_normal';
  }

  async function loadLiveData(farmaciaId){
    if(!supabaseEnabled()) return null;
    try{
      const client = (typeof sb !== 'undefined') ? sb : window.sb;
      const [farmR, prodR, pedR, itemR] = await Promise.all([
        client.from('farmacias').eq('id', farmaciaId).single(),
        client.from('produtos').eq('farmacia_id', farmaciaId).select('*').limit(5000).get(),
        client.from('pedidos').eq('farmacia_id', farmaciaId).select('*').limit(5000).get(),
        client.from('pedido_itens').eq('farmacia_id', farmaciaId).select('*').limit(10000).get(),
      ]);
      const farmacia = farmR?.data || null;
      const produtos = prodR?.data || [];
      const pedidos = (pedR?.data || []).filter(p => !p.created_at || new Date(p.created_at) >= new Date(Date.now() - 370*86400000));
      const itens = itemR?.data || [];
      return {farmacia, produtos, pedidos, itens};
    }catch(e){
      console.warn('Falha ao carregar Supabase', e);
      return null;
    }
  }

  function buildDemoAggregate(farmacia, params){
    const monthly = Number(farmacia?.faturamento || farmacia?.faturamento_mes || 115000);
    const shares = normalizeShares(params);
    const buckets = Object.fromEntries(Object.keys(BUCKET_LABELS).map(k => [k, +(monthly * (shares[k]||0)).toFixed(2)]));
    return {
      monthlyRevenue: monthly,
      buckets,
      paymentMix:{pix:0.38, credit_card:0.34, debit_card:0.18, cash:0.10},
      channelMix:{app:0.44, site:0.16, pdv:0.40},
      productsSummary:null,
      dataQuality: params.data_quality_score || 0.72,
      source:'estimado'
    };
  }

  function aggregateFromSales(live, farmacia, params){
    if(!live || !live.pedidos?.length || !live.itens?.length) return buildDemoAggregate(farmacia, params);
    const prods = new Map((live.produtos||[]).map(p => [Number(p.id), p]));
    const peds = new Map((live.pedidos||[]).map(p => [String(p.id), p]));
    const buckets = {commerce_normal:0,commerce_monophase:0,commerce_st_icms:0,commerce_monophase_st_icms:0,commerce_anticipation_icms:0,services:0,other_revenue:0};
    const payments = {pix:0, credit_card:0, debit_card:0, cash:0, other:0};
    const channels = {app:0, site:0, pdv:0, whatsapp:0, other:0};
    const productCounts = {};
    let total = 0;
    for(const item of live.itens){
      const order = peds.get(String(item.pedido_id));
      if(!order) continue;
      const prod = prods.get(Number(item.produto_id)) || {nome:item.nome,categoria:''};
      const bucket = inferBucket(prod);
      const value = Number(item.subtotal || (Number(item.preco_unit||0) * Number(item.quantidade||0)) || 0);
      buckets[bucket] += value;
      total += value;
      productCounts[bucket] = (productCounts[bucket]||0) + 1;
      const pay = String(order.forma_pagamento || '').toLowerCase();
      if(pay.includes('pix')) payments.pix += value;
      else if(pay.includes('deb')) payments.debit_card += value;
      else if(pay.includes('cr') || pay.includes('cart') || pay.includes('cred')) payments.credit_card += value;
      else if(pay.includes('din')) payments.cash += value;
      else payments.other += value;
      const channel = String(order.canal_venda || order.origem || 'app').toLowerCase();
      if(channel.includes('site')) channels.site += value;
      else if(channel.includes('pdv') || channel.includes('balc')) channels.pdv += value;
      else if(channel.includes('what')) channels.whatsapp += value;
      else if(channel.includes('app')) channels.app += value;
      else channels.other += value;
    }
    const normalize = obj => {
      const sum = Object.values(obj).reduce((a,b)=>a+b,0) || 1;
      return Object.fromEntries(Object.entries(obj).map(([k,v]) => [k, v/sum]));
    };
    const monthlyRevenue = total > 0 ? total/Math.max(1, DEMO_MONTHS) : (farmacia?.faturamento||farmacia?.faturamento_mes||0);
    return {
      monthlyRevenue,
      buckets:Object.fromEntries(Object.entries(buckets).map(([k,v])=>[k, +(v/Math.max(1, DEMO_MONTHS)).toFixed(2)])),
      paymentMix: normalize(payments),
      channelMix: normalize(channels),
      productsSummary: {totalProducts:(live.produtos||[]).length, bucketCounts:productCounts, sampleProducts:(live.produtos||[]).slice(0,20).map(p=>({id:p.id,nome:p.nome,categoria:p.categoria,bucket:inferBucket(p),ncm:p.ncm||'',cest:p.cest||''}))},
      dataQuality: (live.produtos?.length ? 0.9 : 0.75),
      source:'vendas_reais'
    };
  }

  function annualize(monthly){ return monthly * 12; }

  function calcSimples(monthly, buckets){
    const annual = annualize(monthly);
    const eff = aliquotaEfetivaSimples(annual);
    const rates = {
      commerce_normal: eff,
      services: eff,
      other_revenue: eff,
      commerce_monophase: eff * 0.845,
      commerce_st_icms: eff * 0.665,
      commerce_monophase_st_icms: eff * 0.51,
      commerce_anticipation_icms: eff * 0.665
    };
    let total = 0;
    const details = {};
    Object.entries(buckets).forEach(([k,v]) => {
      const tax = (v||0) * (rates[k] || eff);
      details[k] = {rate:(rates[k]||eff), tax};
      total += tax;
    });
    return {monthlyTax:total, annualTax:annualize(total), effectiveRate: total / Math.max(monthly,1), details, rbt12:annual};
  }

  function calcPresumido(monthly, buckets, params){
    const annual = annualize(monthly);
    const revenueQ = annual / 4;
    const irpjBaseQ = revenueQ * 0.08;
    const additionalQ = Math.max(0, (irpjBaseQ - 60000) * 0.10);
    const irpjAnnual = annual * 0.012 + (additionalQ * 4);
    const csllAnnual = annual * 0.0108;
    const pisCofinsBaseAnnual = annualize((buckets.commerce_normal||0)+(buckets.commerce_st_icms||0)+(buckets.commerce_anticipation_icms||0)+(buckets.services||0)+(buckets.other_revenue||0));
    const pisCofinsAnnual = pisCofinsBaseAnnual * 0.0365;
    const payrollAnnual = annualize(params.payroll||0);
    const proLaboreAnnual = annualize(params.pro_labore||0);
    const payrollChargesAnnual = (payrollAnnual * (0.20 + (params.rat_rate||0) + (params.terceiros_rate||0))) + (proLaboreAnnual * 0.20);
    const icmsAnnual = annual * (params.estimated_icms_non_simples_rate||0.028);
    const totalAnnual = irpjAnnual + csllAnnual + pisCofinsAnnual + payrollChargesAnnual + icmsAnnual;
    return {monthlyTax: totalAnnual/12, annualTax: totalAnnual, effectiveRate: totalAnnual / Math.max(annual,1), details:{irpjAnnual,csllAnnual,pisCofinsAnnual,payrollChargesAnnual,icmsAnnual}};
  }

  function calcReal(monthly, buckets, params){
    const annual = annualize(monthly);
    const profitAnnual = annual * (params.accounting_profit_rate || params.net_margin_rate || 0.085);
    const profitQ = profitAnnual / 4;
    const irpjAnnual = profitAnnual * 0.15 + Math.max(0, (profitQ - 60000) * 0.10) * 4;
    const csllAnnual = profitAnnual * 0.09;
    const nonMonoAnnual = annualize((buckets.commerce_normal||0)+(buckets.commerce_st_icms||0)+(buckets.commerce_anticipation_icms||0)+(buckets.services||0)+(buckets.other_revenue||0));
    const pisCofinsAnnual = nonMonoAnnual * Math.max(0, 0.0925 - (params.pis_cofins_credit_rate||0.025));
    const payrollAnnual = annualize(params.payroll||0);
    const proLaboreAnnual = annualize(params.pro_labore||0);
    const payrollChargesAnnual = (payrollAnnual * (0.20 + (params.rat_rate||0) + (params.terceiros_rate||0))) + (proLaboreAnnual * 0.20);
    const icmsAnnual = annual * (params.estimated_icms_non_simples_rate||0.028);
    const totalAnnual = irpjAnnual + csllAnnual + pisCofinsAnnual + payrollChargesAnnual + icmsAnnual;
    return {monthlyTax: totalAnnual/12, annualTax: totalAnnual, effectiveRate: totalAnnual / Math.max(annual,1), details:{profitAnnual,irpjAnnual,csllAnnual,pisCofinsAnnual,payrollChargesAnnual,icmsAnnual}};
  }

  function buildReasons(params, agg, result){
    const reasons = [];
    const monthly = agg.monthlyRevenue || 0;
    const monoShare = ((agg.buckets.commerce_monophase||0) + (agg.buckets.commerce_monophase_st_icms||0)) / Math.max(monthly,1);
    const stShare = ((agg.buckets.commerce_st_icms||0) + (agg.buckets.commerce_monophase_st_icms||0) + (agg.buckets.commerce_anticipation_icms||0)) / Math.max(monthly,1);
    const folhaShare = (params.payroll||0) / Math.max(monthly,1);

    if(monoShare >= 0.5) reasons.push(`Receita monofásica relevante (${(monoShare*100).toFixed(1)}%).`);
    if(stShare >= 0.25) reasons.push(`Participação relevante de ST/antecipação (${(stShare*100).toFixed(1)}%).`);
    if(folhaShare >= 0.12) reasons.push(`Folha pesa ${(folhaShare*100).toFixed(1)}% do faturamento, favorecendo Simples.`);
    if(folhaShare <= 0.08) reasons.push(`Folha enxuta (${(folhaShare*100).toFixed(1)}%), podendo favorecer Presumido.`);
    if(result.recommended==='lucro_presumido') reasons.push('Presumido ficou com menor carga total após folha e PIS/Cofins monofásico.');
    if(result.recommended==='simples_nacional') reasons.push('Simples manteve melhor equilíbrio entre tributo, folha e simplicidade operacional.');
    if(result.recommended==='lucro_real') reasons.push('Lucro Real só venceu porque a margem simulada ficou muito comprimida.');
    return reasons.slice(0,5);
  }

  function buildWarnings(params, agg){
    const warnings = [];
    if((agg.dataQuality||0) < 0.8) warnings.push('Base com confiança parcial: parte dos percentuais está estimada.');
    if((agg.buckets.services||0) > 0) warnings.push('Receitas de serviço exigem revisão fina de anexo/regra antes de trocar regime.');
    if(!supabaseEnabled()) warnings.push('Supabase ainda não configurado nesta tela; usando modo pronto com estimativas.');
    return warnings;
  }

  function evaluate(params, agg){
    const simple = calcSimples(agg.monthlyRevenue, agg.buckets);
    const presumed = calcPresumido(agg.monthlyRevenue, agg.buckets, params);
    const real = calcReal(agg.monthlyRevenue, agg.buckets, params);
    const scenarios = [
      {id:'simples_nacional', label:'Simples Nacional', ...simple},
      {id:'lucro_presumido', label:'Lucro Presumido', ...presumed},
      {id:'lucro_real', label:'Lucro Real', ...real}
    ];
    const recommended = scenarios.slice().sort((a,b)=>a.annualTax-b.annualTax)[0];
    const current = scenarios.find(s => s.id === params.current_regime) || scenarios[0];
    const economyAnnual = Math.max(0, current.annualTax - recommended.annualTax);
    const confidence = Math.min(0.98, Math.max(0.55, agg.dataQuality||params.data_quality_score||0.72));
    return {
      scenarios,
      recommended: recommended.id,
      recommendedLabel: recommended.label,
      currentLabel: current.label,
      economyAnnual,
      economyMonthly: economyAnnual/12,
      confidence,
      reasons: buildReasons(params, agg, {recommended:recommended.id}),
      warnings: buildWarnings(params, agg),
      currentScenario: current,
      recommendedScenario: recommended
    };
  }

  async function buildContext(farmaciaId){
    const farmacia = getFarmaciasBase().find(f => Number(f.id) === Number(farmaciaId)) || {id:farmaciaId,nome:'Farmácia',uf:'RJ',faturamento:115000};
    const params = getParams(farmacia);
    const live = params.use_live_sales ? await loadLiveData(farmaciaId) : null;
    const agg = aggregateFromSales(live, farmacia, params);
    if(params.use_live_sales && agg.source === 'vendas_reais'){
      // when live data exists, align base faturamento and improve quality
      params.data_quality_score = agg.dataQuality;
    }
    const result = evaluate(params, agg);
    return {farmacia, params, agg, result};
  }

  function bars(obj){
    return Object.entries(obj).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`
      <div class="fc-bucket"><div>${BUCKET_LABELS[k] || k}</div><div class="fc-right">${fmt(v)}</div><div class="fc-progress" style="width:120px"><span style="width:${Math.min(100,(v/Object.values(obj).reduce((a,b)=>a+b,0))*100)}%"></span></div></div>
    `).join('');
  }

  function mixRows(obj, labels){
    return Object.entries(obj||{}).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="fc-kv"><span>${labels[k]||k}</span><strong>${(v*100).toFixed(1)}%</strong></div>`).join('');
  }

  function renderParamsForm(ctxData){
    const {farmacia, params, agg} = ctxData;
    const src = agg.source === 'vendas_reais' ? '<span class="fc-chip fc-ok">Usando vendas reais</span>' : '<span class="fc-chip fc-warn">Usando estimativa pronta</span>';
    return `
      <div class="card" style="margin-bottom:16px">
        <div class="sec-tit"><span>Base de cálculo · ${farmacia.nome}</span><div class="fc-actions">${src}<button class="btn-sec" onclick="FCRegime.recalc()">Recalcular</button><button class="btn-pri" onclick="FCRegime.save()">Salvar parâmetros</button></div></div>
        <div class="form-row cols3">
          <div><label class="form-lbl">Farmácia</label><select id="fc-r-farmacia">${getFarmaciasBase().map(f=>`<option value="${f.id}" ${Number(f.id)===Number(farmacia.id)?'selected':''}>${f.nome}</option>`).join('')}</select></div>
          <div><label class="form-lbl">Regime atual</label><select id="fc-r-regime"><option value="simples_nacional" ${params.current_regime==='simples_nacional'?'selected':''}>Simples Nacional</option><option value="lucro_presumido" ${params.current_regime==='lucro_presumido'?'selected':''}>Lucro Presumido</option><option value="lucro_real" ${params.current_regime==='lucro_real'?'selected':''}>Lucro Real</option></select></div>
          <div><label class="form-lbl">Usar vendas reais do sistema</label><select id="fc-r-live"><option value="1" ${params.use_live_sales?'selected':''}>Sim</option><option value="0" ${!params.use_live_sales?'selected':''}>Não</option></select></div>
        </div>
        <div class="form-row cols3">
          <div><label class="form-lbl">Folha mensal</label><input id="fc-r-payroll" type="number" step="0.01" value="${params.payroll}"></div>
          <div><label class="form-lbl">Pró-labore mensal</label><input id="fc-r-prolabore" type="number" step="0.01" value="${params.pro_labore}"></div>
          <div><label class="form-lbl">ICMS estimado fora do Simples (%)</label><input id="fc-r-icms" type="number" step="0.01" value="${((params.estimated_icms_non_simples_rate||0)*100).toFixed(2)}"></div>
        </div>
        <div class="form-row cols3">
          <div><label class="form-lbl">Margem líquida / lucro real (%)</label><input id="fc-r-margin" type="number" step="0.01" value="${((params.accounting_profit_rate||0.085)*100).toFixed(2)}"></div>
          <div><label class="form-lbl">RAT (%)</label><input id="fc-r-rat" type="number" step="0.01" value="${((params.rat_rate||0.02)*100).toFixed(2)}"></div>
          <div><label class="form-lbl">Terceiros (%)</label><input id="fc-r-terc" type="number" step="0.01" value="${((params.terceiros_rate||0.058)*100).toFixed(2)}"></div>
        </div>
        <div class="form-row cols3">
          <div><label class="form-lbl">Monofásico (%)</label><input id="fc-r-mono" type="number" step="0.01" value="${((params.percent_monophase||0)*100).toFixed(2)}"></div>
          <div><label class="form-lbl">ICMS-ST (%)</label><input id="fc-r-st" type="number" step="0.01" value="${((params.percent_st||0)*100).toFixed(2)}"></div>
          <div><label class="form-lbl">Monofásico + ST (%)</label><input id="fc-r-monost" type="number" step="0.01" value="${((params.percent_monophase_st||0)*100).toFixed(2)}"></div>
        </div>
        <div class="form-row cols3">
          <div><label class="form-lbl">Antecipação ICMS (%)</label><input id="fc-r-ant" type="number" step="0.01" value="${((params.percent_anticipation||0)*100).toFixed(2)}"></div>
          <div><label class="form-lbl">Serviços (%)</label><input id="fc-r-serv" type="number" step="0.01" value="${((params.percent_services||0)*100).toFixed(2)}"></div>
          <div><label class="form-lbl">Confiança dos dados (%)</label><input id="fc-r-quality" type="number" step="1" value="${Math.round((params.data_quality_score||0.72)*100)}"></div>
        </div>
      </div>`;
  }

  function renderScenarioTable(res){
    return `
      <div class="card">
        <div class="sec-tit"><span>Comparativo por regime</span><span class="fc-mini">Carga estimada mensal e anual</span></div>
        <div class="tbl-wrap">
          <table class="fc-table"><thead><tr><th>Regime</th><th>Alíquota efetiva</th><th>Tributo mensal</th><th>Tributo anual</th><th>Status</th></tr></thead>
            <tbody>${res.scenarios.map(s=>`<tr><td><strong>${s.label}</strong></td><td>${pct(s.effectiveRate)}</td><td>${fmt(s.monthlyTax)}</td><td>${fmt(s.annualTax)}</td><td>${s.id===res.recommended?'<span class="badge" style="background:#dcfce7;color:#166534">Melhor</span>':(s.label===res.currentLabel?'<span class="badge" style="background:#eff6ff;color:#1d4ed8">Atual</span>':'<span class="badge" style="background:#f5f5f5;color:#666">Simulado</span>')}</td></tr>`).join('')}</tbody>
          </table>
        </div>
      </div>`;
  }

  function renderRegimeInteligenteFromData(d){
    const {farmacia, agg, result} = d;
    const bucketTotal = Object.values(agg.buckets).reduce((a,b)=>a+b,0);
    return `
      ${renderParamsForm(d)}
      <div class="grid4">
        <div class="kpi"><div class="kpi-lbl">Regime recomendado</div><div class="kpi-val" style="color:#15803d;font-size:18px">${result.recommendedLabel}</div><div class="kpi-sub">Economia anual estimada: ${fmt(result.economyAnnual)}</div></div>
        <div class="kpi"><div class="kpi-lbl">Regime atual</div><div class="kpi-val" style="font-size:18px">${result.currentLabel}</div><div class="kpi-sub">Farmácia: ${farmacia.nome}</div></div>
        <div class="kpi"><div class="kpi-lbl">Faturamento base mensal</div><div class="kpi-val">${fmt(agg.monthlyRevenue)}</div><div class="kpi-sub">Fonte: ${agg.source === 'vendas_reais' ? 'vendas reais do ERP' : 'estimativa pronta'}</div></div>
        <div class="kpi"><div class="kpi-lbl">Confiança da análise</div><div class="kpi-val">${(result.confidence*100).toFixed(0)}%</div><div class="kpi-sub">Quanto mais real classificado, melhor</div></div>
      </div>
      <div class="fc-grid-2" style="margin-bottom:16px">
        ${renderScenarioTable(result)}
        <div class="card">
          <div class="sec-tit"><span>Por que o sistema escolheu isso</span><span class="fc-mini">Leitura explicável</span></div>
          <div class="fc-list">
            ${result.reasons.map(r=>`<div class="alert alert-success"><div style="font-size:12px">${r}</div></div>`).join('') || '<div class="fc-mini">Sem direcionadores suficientes.</div>'}
            ${result.warnings.map(w=>`<div class="alert alert-warn"><div style="font-size:12px">${w}</div></div>`).join('')}
          </div>
        </div>
      </div>
      <div class="fc-grid-2" style="margin-bottom:16px">
        <div class="card">
          <div class="sec-tit"><span>Buckets tributários mensais</span><span class="fc-mini">Total: ${fmt(bucketTotal)}</span></div>
          ${bars(agg.buckets)}
          <div class="fc-note" style="margin-top:10px">O bucket nasce do item vendido. Meio de pagamento e canal entram na análise gerencial, não mudam o bucket fiscal do produto.</div>
        </div>
        <div class="card">
          <div class="sec-tit"><span>Mix de canais e pagamentos</span><span class="fc-mini">app / site / PDV · Pix / cartão</span></div>
          <div class="fc-grid-2">
            <div class="fc-box">
              <div class="sec-tit" style="margin-bottom:8px"><span>Canais</span></div>
              ${mixRows(agg.channelMix,{app:'App',site:'Site',pdv:'PDV',whatsapp:'WhatsApp',other:'Outros'})}
            </div>
            <div class="fc-box">
              <div class="sec-tit" style="margin-bottom:8px"><span>Pagamentos</span></div>
              ${mixRows(agg.paymentMix,{pix:'Pix',credit_card:'Cartão crédito',debit_card:'Cartão débito',cash:'Dinheiro',other:'Outros'})}
            </div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="sec-tit"><span>Leitura operacional</span><span class="fc-mini">O que fazer dentro do Farma do Bairro</span></div>
        <div class="grid3" style="margin-bottom:0">
          <div class="fc-box"><strong>Excelente para Simples</strong><div class="fc-note" style="margin-top:8px">Folha mais pesada, busca por simplicidade e ganho pequeno ao sair do DAS.</div></div>
          <div class="fc-box"><strong>Excelente para Presumido</strong><div class="fc-note" style="margin-top:8px">Muito monofásico, ST relevante, folha enxuta e cadastro fiscal bem classificado.</div></div>
          <div class="fc-box"><strong>Ruim para decidir agora</strong><div class="fc-note" style="margin-top:8px">Baixa confiança dos dados, produtos sem classificação e receitas misturadas sem bucket.</div></div>
        </div>
      </div>`;
  }

  function renderProductTable(summary){
    if(!summary || !summary.sampleProducts?.length){
      return `<div class="alert alert-info"><div style="font-size:12px">Sem produtos reais carregados. O módulo já está pronto, mas o cadastro fiscal item a item ainda não foi alimentado nessa base.</div></div>`;
    }
    return `<div class="tbl-wrap"><table class="fc-table"><thead><tr><th>ID</th><th>Produto</th><th>Categoria</th><th>Bucket sugerido</th><th>NCM</th><th>CEST</th></tr></thead><tbody>${summary.sampleProducts.map(p=>`<tr><td>${p.id}</td><td>${p.nome}</td><td>${p.categoria||'-'}</td><td>${BUCKET_LABELS[p.bucket]||p.bucket}</td><td>${p.ncm||'-'}</td><td>${p.cest||'-'}</td></tr>`).join('')}</tbody></table></div>`;
  }

  function renderParametrosFiscaisFromData(d){
    const summary = d.agg.productsSummary;
    const counts = summary?.bucketCounts || {};
    return `
      <div class="grid3">
        <div class="kpi"><div class="kpi-lbl">Produtos com leitura real</div><div class="kpi-val">${summary?.totalProducts || 0}</div><div class="kpi-sub">Cadastro puxado do ERP/Supabase</div></div>
        <div class="kpi"><div class="kpi-lbl">Bucket mais frequente</div><div class="kpi-val" style="font-size:18px">${Object.entries(counts).sort((a,b)=>b[1]-a[1])[0] ? (BUCKET_LABELS[Object.entries(counts).sort((a,b)=>b[1]-a[1])[0][0]] || '-') : '-'}</div><div class="kpi-sub">Classificação fiscal sugerida</div></div>
        <div class="kpi"><div class="kpi-lbl">Ação prioritária</div><div class="kpi-val" style="font-size:18px">NCM / CEST</div><div class="kpi-sub">Sem isso, a recomendação perde força</div></div>
      </div>
      <div class="fc-grid-2" style="margin-bottom:16px">
        <div class="card">
          <div class="sec-tit"><span>Campos que o produto precisa ter</span><span class="fc-mini">Para classificar bucket automático</span></div>
          <div class="fc-kv"><span>NCM</span><strong>Obrigatório</strong></div>
          <div class="fc-kv"><span>CEST</span><strong>Recomendado</strong></div>
          <div class="fc-kv"><span>is_monophase</span><strong>true/false</strong></div>
          <div class="fc-kv"><span>has_icms_st</span><strong>true/false</strong></div>
          <div class="fc-kv"><span>has_anticipation_icms</span><strong>true/false</strong></div>
          <div class="fc-kv"><span>is_service</span><strong>true/false</strong></div>
          <div class="fc-kv"><span>categoria fiscal</span><strong>medicamento / perfumaria / correlato / serviço</strong></div>
        </div>
        <div class="card">
          <div class="sec-tit"><span>Campos que o pedido precisa ter</span><span class="fc-mini">Para ler app, site, PDV e pagamento</span></div>
          <div class="fc-kv"><span>canal_venda</span><strong>app / site / pdv / whatsapp</strong></div>
          <div class="fc-kv"><span>forma_pagamento</span><strong>pix / crédito / débito / dinheiro</strong></div>
          <div class="fc-kv"><span>parcelas</span><strong>inteiro</strong></div>
          <div class="fc-kv"><span>gateway_pagamento</span><strong>texto</strong></div>
          <div class="fc-kv"><span>mdr_fee</span><strong>valor ou taxa</strong></div>
          <div class="fc-kv"><span>anticipation_fee</span><strong>valor</strong></div>
          <div class="fc-kv"><span>liquidado_em</span><strong>data</strong></div>
        </div>
      </div>
      <div class="card" style="margin-bottom:16px">
        <div class="sec-tit"><span>Amostra de produtos e bucket sugerido</span><span class="fc-mini">Já encaixado no projeto atual</span></div>
        ${renderProductTable(summary)}
      </div>
      <div class="card">
        <div class="sec-tit"><span>Regras de bucket</span><span class="fc-mini">O sistema usa isso para consolidar a contabilidade</span></div>
        <div class="fc-list">
          <div class="fc-kv"><span>is_service = true</span><strong>services</strong></div>
          <div class="fc-kv"><span>is_monophase = true e has_icms_st = true</span><strong>commerce_monophase_st_icms</strong></div>
          <div class="fc-kv"><span>is_monophase = true</span><strong>commerce_monophase</strong></div>
          <div class="fc-kv"><span>has_icms_st = true</span><strong>commerce_st_icms</strong></div>
          <div class="fc-kv"><span>has_anticipation_icms = true</span><strong>commerce_anticipation_icms</strong></div>
          <div class="fc-kv"><span>demais itens</span><strong>commerce_normal</strong></div>
        </div>
      </div>`;
  }

  ctx.titulos.regime_inteligente = ['Regime Inteligente','Comparador automático: Simples x Presumido x Real'];
  ctx.titulos.parametros_fiscais = ['Parâmetros Fiscais','Cadastro fiscal dos produtos, buckets e canais'];

  ctx.renders.regime_inteligente = function(){
    return `<div class="card"><div class="sec-tit"><span>Carregando análise tributária...</span></div><div class="fc-mini">Aguarde um instante.</div></div>`;
  };
  ctx.renders.parametros_fiscais = function(){
    return `<div class="card"><div class="sec-tit"><span>Carregando parâmetros fiscais...</span></div><div class="fc-mini">Aguarde um instante.</div></div>`;
  };

  window.FCRegime = {
    async show(tab){
      const farmaciaId = Number(document.getElementById('fc-r-farmacia')?.value || getFarmaciasBase()[0]?.id || 1);
      const d = await buildContext(farmaciaId);
      const html = tab === 'parametros_fiscais' ? renderParametrosFiscaisFromData(d) : renderRegimeInteligenteFromData(d);
      document.getElementById('content').innerHTML = html;
      this.bind();
    },
    bind(){
      document.getElementById('fc-r-farmacia')?.addEventListener('change', ()=>this.recalc());
    },
    collect(){
      const farmaciaId = Number(document.getElementById('fc-r-farmacia')?.value || getFarmaciasBase()[0]?.id || 1);
      const current = getParams({id:farmaciaId});
      return {
        ...current,
        current_regime: document.getElementById('fc-r-regime')?.value || current.current_regime,
        use_live_sales: document.getElementById('fc-r-live')?.value === '1',
        payroll: safeParse(document.getElementById('fc-r-payroll')?.value, current.payroll),
        pro_labore: safeParse(document.getElementById('fc-r-prolabore')?.value, current.pro_labore),
        estimated_icms_non_simples_rate: safeParse(document.getElementById('fc-r-icms')?.value, 2.8) / 100,
        accounting_profit_rate: safeParse(document.getElementById('fc-r-margin')?.value, 8.5) / 100,
        net_margin_rate: safeParse(document.getElementById('fc-r-margin')?.value, 8.5) / 100,
        rat_rate: safeParse(document.getElementById('fc-r-rat')?.value, 2) / 100,
        terceiros_rate: safeParse(document.getElementById('fc-r-terc')?.value, 5.8) / 100,
        percent_monophase: safeParse(document.getElementById('fc-r-mono')?.value, 58) / 100,
        percent_st: safeParse(document.getElementById('fc-r-st')?.value, 14) / 100,
        percent_monophase_st: safeParse(document.getElementById('fc-r-monost')?.value, 18) / 100,
        percent_anticipation: safeParse(document.getElementById('fc-r-ant')?.value, 4) / 100,
        percent_services: safeParse(document.getElementById('fc-r-serv')?.value, 1) / 100,
        data_quality_score: safeParse(document.getElementById('fc-r-quality')?.value, 72) / 100
      };
    },
    save(){
      const farmaciaId = Number(document.getElementById('fc-r-farmacia')?.value || 1);
      setParams(farmaciaId, this.collect());
      this.recalc();
    },
    async recalc(){
      const farmaciaId = Number(document.getElementById('fc-r-farmacia')?.value || getFarmaciasBase()[0]?.id || 1);
      setParams(farmaciaId, this.collect());
      await this.show(ctx.getTab());
    }
  };

  const originalSetTab = window.setTab;
  window.setTab = function(t){
    originalSetTab(t);
    if(t === 'regime_inteligente' || t === 'parametros_fiscais'){
      window.FCRegime.show(t);
    }
  };
  ctx.setTab = window.setTab;

  const originalRenderContent = ctx.renderContent;
  ctx.renderContent = function(){
    originalRenderContent();
    const tab = ctx.getTab();
    if(tab === 'regime_inteligente' || tab === 'parametros_fiscais'){
      window.FCRegime.show(tab);
    }
  };
  window.fcContabCtx.renderContent = ctx.renderContent;

  ensureButtons();
})();
