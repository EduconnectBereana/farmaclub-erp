# FarmaClub — Cadastro Fiscal e Entrada por XML

## Objetivo
Implantar farmácias sem depender de cadastro manual completo. A regra do sistema é:

1. importar XML da NF-e de compra;
2. criar ou atualizar o produto com EAN, NCM, CEST e preço de custo;
3. inferir monofásico e ICMS-ST por regra inicial;
4. mandar para revisão apenas as exceções;
5. usar scanner para inventário, conferência e venda rápida.

## Campos fiscais principais do produto
- EAN
- NCM
- CEST
- registro Anvisa
- CFOP de entrada
- monofásico
- ICMS-ST
- benefício fiscal
- fonte do NCM
- status fiscal

## Fluxo recomendado para implantação piloto
- importar XMLs dos últimos 60 a 90 dias;
- validar os produtos de maior giro primeiro;
- usar scanner para contagem inicial de estoque;
- revisar com contador apenas os itens pendentes/revisar.
