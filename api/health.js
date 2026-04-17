module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.status(200).json({
    ok: true,
    app: 'FarmaClub',
    mode: 'demo-host-ready',
    api: {
      checkout: '/api/checkout',
      repasse: '/api/repasse',
      health: '/api/health'
    },
    frontend: {
      site: '/site',
      comprar: '/comprar',
      motoboy: '/motoboy',
      erp: '/erp',
      farmacia: '/farmacia',
      piloto: '/piloto'
    },
    time: new Date().toISOString()
  });
};
