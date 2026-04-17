# FarmaClub — Plano de produção

## Ordem recomendada
1. Corrigir front-end quebrado
2. Aplicar SQL e RLS
3. Configurar variáveis na Vercel
4. Publicar em ambiente demo
5. Validar fluxos ponta a ponta
6. Só depois abrir produção

## Regras
- nunca expor service_role no front-end
- nunca confiar em preço/frete enviados pelo navegador
- nunca deixar rotas administrativas cacheadas pelo service worker
