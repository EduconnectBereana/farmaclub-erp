# FarmaClub — Modelo de Pagamentos MVP

## Decisão incorporada
O sistema deve operar, no momento atual do projeto, com o menor nível de complexidade que ainda preserve a lógica financeira correta do negócio.

## Regras centrais
1. A comissão do Farma Club incide apenas sobre medicamentos.
2. O frete não entra na base da comissão.
3. O motoboy recebe 100% do valor do frete.
4. Taxa do gateway e juros do parcelamento ficam transparentes e fora da base da comissão.
5. O checkout MVP aceita apenas 1 meio de pagamento por pedido: `pix`, `credito` ou `debito`.
6. A estrutura do banco e da API fica pronta para multimeios na fase 2.

## Fórmula do split
- `base_farmaclub = subtotal_medicamentos`
- `farmaclub_fee = base_farmaclub * 10%`
- `motoboy_fee = frete_total`
- `net_farmacia = total_bruto - farmaclub_fee - motoboy_fee - taxa_gateway`

## Por que este modelo é o melhor agora
- reduz risco de implantação
- reduz abandono no checkout
- evita erro de conciliação
- protege a base da comissão
- preserva a lógica futura de multimeios

## Fase 2
Quando o piloto estiver estável, ativar múltiplas cobranças parciais por pedido, mantendo a liberação da expedição apenas depois da quitação total.
