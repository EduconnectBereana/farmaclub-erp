const RATE_LIMIT = new Map();
const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_MAX = 20;
const FARMACLUB_RATE = Number(process.env.FARMACLUB_RATE || 0.10);

function setCommonHeaders(req, res) {
  const allowed = (process.env.APP_URL || '').split(',').map(s => s.trim()).filter(Boolean);
  const origin = req.headers.origin || '';
  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
}

function getClientIp(req) {
  return (req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown').trim();
}

function checkRateLimit(ip) {
  const now = Date.now();
  const recent = (RATE_LIMIT.get(ip) || []).filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    RATE_LIMIT.set(ip, recent);
    return false;
  }
  recent.push(now);
  RATE_LIMIT.set(ip, recent);
  return true;
}

function toMoney(value) {
  return Number(Number(value || 0).toFixed(2));
}

function isMedicine(item) {
  if (item?.eh_medicamento === true) return true;
  if (item?.eh_medicamento === false) return false;
  return String(item?.tipo || '').toLowerCase() === 'medicamento';
}

function validateSinglePayment(payment) {
  const method = String(payment?.metodo || '').toLowerCase();
  return ['pix', 'credito', 'debito'].includes(method);
}

module.exports = async (req, res) => {
  setCommonHeaders(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Muitas tentativas. Aguarde 1 minuto.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const itens = Array.isArray(body.itens) ? body.itens : [];
    const pagamentos = Array.isArray(body.pagamentos) ? body.pagamentos : [];

    if (!itens.length) return res.status(400).json({ error: 'Pedido sem itens.' });
    if (!pagamentos.length) return res.status(400).json({ error: 'Informe a forma de pagamento.' });
    if (pagamentos.length > 1) {
      return res.status(422).json({
        error: 'Modelo MVP aceita 1 meio de pagamento por pedido. Estrutura multimeios fica preparada para a fase 2.',
        code: 'MULTIPAY_NOT_ENABLED'
      });
    }
    if (!validateSinglePayment(pagamentos[0])) {
      return res.status(422).json({ error: 'Forma de pagamento inválida para o MVP. Use pix, crédito ou débito.' });
    }

    const subtotalMedicamentos = toMoney(itens.filter(isMedicine).reduce((s, i) => s + (Number(i.preco || 0) * Number(i.qtd || 0)), 0));
    const subtotalOutros = toMoney(itens.filter(i => !isMedicine(i)).reduce((s, i) => s + (Number(i.preco || 0) * Number(i.qtd || 0)), 0));
    const frete = toMoney(body.frete || 0);
    const jurosParcelamento = toMoney(body.juros_parcelamento || 0);
    const taxaGateway = toMoney(body.taxa_gateway || 0);
    const totalBruto = toMoney(subtotalMedicamentos + subtotalOutros + frete + jurosParcelamento);
    const farmaclubFee = toMoney(subtotalMedicamentos * FARMACLUB_RATE);
    const motoboyFee = frete;
    const netFarmacia = toMoney(totalBruto - farmaclubFee - motoboyFee - taxaGateway);

    return res.status(200).json({
      ok: true,
      modelo_pagamento: 'single_method_mvp',
      pedido: {
        subtotal_medicamentos: subtotalMedicamentos,
        subtotal_outros: subtotalOutros,
        frete,
        juros_parcelamento: jurosParcelamento,
        taxa_gateway: taxaGateway,
        total_bruto: totalBruto,
      },
      split: {
        base_farmaclub: subtotalMedicamentos,
        farmaclub_fee: farmaclubFee,
        motoboy_fee: motoboyFee,
        net_farmacia: netFarmacia,
      },
      pagamentos,
      proxima_fase: 'Habilitar multimeios com pagamentos parciais e confirmação total antes da expedição.'
    });
  } catch (error) {
    return res.status(400).json({ error: 'Payload inválido.', detail: String(error?.message || error) });
  }
};
