window.FCBoot = {
  routes: {
    site: '/site',
    comprar: '/comprar',
    motoboy: '/motoboy',
    erp: '/erp',
    farmacia: '/farmacia',
    setup: '/setup',
    pagamentos: '/pagamentos',
    fiscal: '/cadastro-fiscal',
    piloto: '/piloto',
    instalar: '/instalar',
    health: '/api/health'
  },
  registerServiceWorker() {
    const canUse = 'serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1');
    if (!canUse) return;
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/public/sw.js').catch(err => console.warn('SW não registrado', err));
    });
  },
  setPwaLinks(options = {}) {
    const { manifest, themeColor = '#3BAA35' } = options;
    if (manifest) {
      let link = document.querySelector('link[rel="manifest"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'manifest';
        document.head.appendChild(link);
      }
      link.href = manifest;
    }
    let theme = document.querySelector('meta[name="theme-color"]');
    if (!theme) {
      theme = document.createElement('meta');
      theme.name = 'theme-color';
      document.head.appendChild(theme);
    }
    theme.content = themeColor;
  },
  runtimeStatus() {
    const cfg = window.FC_CONFIG || {};
    return {
      supabaseConfigured: Boolean(cfg.supabaseUrl && cfg.supabaseAnonKey),
      appBaseUrl: cfg.appBaseUrl || location.origin,
      appName: cfg.appName || 'FarmaClub'
    };
  },
  route(pathKey) {
    return this.routes[pathKey] || '/';
  }
};
window.FCBoot.registerServiceWorker();
