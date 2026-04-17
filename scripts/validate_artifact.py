from pathlib import Path
import re, sys

root = Path(__file__).resolve().parents[1]
errors = []
required = [
    'vercel.json', 'api/checkout.js', 'api/health.js', 'apps/farmaclub_piloto.html',
    'apps/farmaclub_site.html', 'apps/farmaclub_app_cliente.html', 'apps/farmaclub_app_motoboy.html',
    'apps/farmaclub_erp_central.html', 'public/runtime-config.js', 'shared/farmaclub_boot.js'
]
for rel in required:
    if not (root / rel).exists():
        errors.append(f'Faltando: {rel}')

for html in (root / 'apps').glob('*.html'):
    text = html.read_text(encoding='utf-8', errors='ignore')
    for m in re.findall(r'href="([^"]+)"', text):
        if m.startswith(('http://', 'https://', '#', 'mailto:', 'tel:', 'javascript:', '${')):
            continue
        if m.startswith('/'):
            if m.startswith(('/apps/', '/shared/', '/public/', '/api/')):
                if not (root / m.lstrip('/')).exists():
                    errors.append(f'Link quebrado em {html.name}: {m}')
            continue
        target = (html.parent / m).resolve()
        if not target.exists():
            errors.append(f'Link quebrado em {html.name}: {m}')

if errors:
    print('\n'.join(errors))
    sys.exit(1)
print('VALIDACAO_OK')
