# FarmaClub — guia de deploy do piloto

## Rotas públicas sugeridas
- `/site` → vitrine pública
- `/comprar` → app do cliente
- `/motoboy` → app do motoboy
- `/erp` → ERP central
- `/farmacia` → ERP da farmácia
- `/piloto` → portal de apresentação

## Ordem de implantação
1. Subir repositório no GitHub.
2. Conectar o repositório na Vercel.
3. Configurar domínio próprio e HTTPS.
4. Editar `public/runtime-config.js` com a URL e a anon key do Supabase.
5. Aplicar `sql/farmaclub_schema.sql` e `sql/farmaclub_security.sql`.
6. Testar `/api/health`, `/site`, `/comprar`, `/motoboy` e `/erp`.

## Arquivos chave
- `vercel.json`
- `public/runtime-config.js`
- `apps/farmaclub_piloto.html`
- `shared/farmaclub_boot.js`
- `api/health.js`
