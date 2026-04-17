# FarmaClub

Pacote preparado para publicação no GitHub/Vercel com foco em apresentação de uma farmácia piloto.

## Canais prontos
- Site público
- App Cliente
- App Motoboy
- ERP Central
- ERP Farmácia
- Cadastro fiscal com entrada por XML da NF-e
- Painel de pagamentos e split
- Portal de apresentação do piloto

## Modelo financeiro atual do sistema
- comissão do Farma Club: **10% apenas sobre medicamentos**
- frete: **100% do motoboy**
- gateway fee e juros: **fora da base da comissão**
- checkout MVP: **1 meio de pagamento por pedido** (`pix`, `credito` ou `debito`)
- multimeios: **preparado para fase 2**

## Arquivos de implantação
- `public/runtime-config.js` → preencher Supabase real
- `vercel.json` → rotas limpas do projeto
- `api/health.js` → checagem simples do ambiente
- `docs/FARMACLUB_DEPLOY_GUIDE.md` → ordem de publicação

## Rotas de demonstração
- `/site`
- `/comprar`
- `/motoboy`
- `/erp`
- `/farmacia`
- `/piloto`
