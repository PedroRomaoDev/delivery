# Order API -- Especificação Oficial

## 1. Objetivo

Este documento define o contrato HTTP, regras de negócio e arquitetura
relacionadas ao Aggregate `Order`.

A API foi projetada seguindo:

-   Princípios REST
-   Domain-Driven Design (DDD)
-   Arquitetura em camadas:
    -   Controller
    -   UseCase
    -   Repository
    -   Aggregate Root

------------------------------------------------------------------------

## 2. Conceito Central

`Order` é o Aggregate Root.

Toda modificação estrutural ou transição de estado deve ocorrer
exclusivamente através do Aggregate.

Nenhuma regra de negócio deve estar no Controller.

------------------------------------------------------------------------

## 3. Estados do Pedido

Estados possíveis:

-   DRAFT
-   RECEIVED
-   CONFIRMED
-   DISPATCHED
-   DELIVERED
-   CANCELED

### Estado Inicial

Todo pedido nasce obrigatoriamente como:

DRAFT

------------------------------------------------------------------------

## 4. Regras Gerais

1.  Alterações estruturais só são permitidas em DRAFT.
2.  Após sair de DRAFT, o pedido torna-se estruturalmente imutável.
3.  Transições de estado devem respeitar a máquina de estados.
4.  O status nunca deve ser alterado diretamente via PATCH.
5.  O ID do pedido deve ser enviado exclusivamente na URL.

------------------------------------------------------------------------

## 5. Rotas da API

### 5.1 Criação

#### Criar Pedido

POST /orders

``` json
{
  "storeId": "uuid",
  "customer": {
    "name": "string",
    "phone": "string"
  }
}
```

Resposta:

``` json
{
  "id": "uuid",
  "status": "DRAFT",
  "createdAt": "timestamp"
}
```

------------------------------------------------------------------------

### 5.2 Consulta

#### Listar pedidos

GET /orders

Filtros opcionais:

GET /orders?status=CONFIRMED\
GET /orders?storeId=uuid

------------------------------------------------------------------------

#### Buscar pedido por ID

GET /orders/:id

Retorna snapshot completo do pedido.

------------------------------------------------------------------------

### 5.3 Construção Incremental (Somente DRAFT)

#### Adicionar Item

POST /orders/:id/items

``` json
{
  "productId": 123,
  "quantity": 1,
  "price": 89.90,
  "observations": "Opcional"
}
```

------------------------------------------------------------------------

#### Atualizar Item

PATCH /orders/:id/items/:itemId

------------------------------------------------------------------------

#### Remover Item

DELETE /orders/:id/items/:itemId

------------------------------------------------------------------------

#### Adicionar Pagamento

POST /orders/:id/payments

``` json
{
  "method": "CREDIT_CARD",
  "value": 89.90
}
```

------------------------------------------------------------------------

#### Atualizar Cliente

PATCH /orders/:id/customer

------------------------------------------------------------------------

#### Atualizar Endereço

PATCH /orders/:id/delivery-address

------------------------------------------------------------------------

### Regra Importante

Todas as rotas acima devem validar:

order.status === DRAFT

Caso contrário, retornar erro de regra de negócio.

------------------------------------------------------------------------

### 5.4 Transições de Estado

Essas rotas representam comandos de domínio.

#### Receber Pedido

POST /orders/:id/receive

Transição:

DRAFT → RECEIVED

------------------------------------------------------------------------

#### Confirmar Pedido

POST /orders/:id/confirm

Transição:

RECEIVED → CONFIRMED

------------------------------------------------------------------------

#### Despachar Pedido

POST /orders/:id/dispatch

Transição:

CONFIRMED → DISPATCHED

------------------------------------------------------------------------

#### Entregar Pedido

POST /orders/:id/deliver

Transição:

DISPATCHED → DELIVERED

------------------------------------------------------------------------

#### Cancelar Pedido

POST /orders/:id/cancel

Permitido em:

-   DRAFT
-   RECEIVED
-   CONFIRMED

------------------------------------------------------------------------

## 6. Fluxo Arquitetural

Todas as rotas devem seguir:

Controller → UseCase → Aggregate → Repository

Controller: - Extrai parâmetros - Chama UseCase - Retorna resposta HTTP

UseCase: - Busca pedido no Repository - Executa método no Aggregate -
Persiste alterações

Aggregate: - Contém regras de negócio - Valida transições - Valida
construção estrutural

Repository: - Responsável por persistência

------------------------------------------------------------------------

## 7. Máquina de Estados

Fluxo válido:

DRAFT\
↓\
RECEIVED\
↓\
CONFIRMED\
↓\
DISPATCHED\
↓\
DELIVERED

Cancelamento permitido até CONFIRMED.

------------------------------------------------------------------------

## 8. Padrões REST Utilizados

-   Substantivos no plural
-   Sem verbos nas rotas
-   Ação definida pelo método HTTP
-   Comandos de domínio explícitos (receive, confirm, etc.)

------------------------------------------------------------------------

## 9. Diretrizes para Implementação

-   Nunca alterar status diretamente via update.
-   Nunca permitir modificação estrutural fora de DRAFT.
-   Nunca colocar regra de negócio no Controller.
-   Validar todas as transições no Aggregate.
-   UseCases devem ser específicos por ação.

------------------------------------------------------------------------

## 10. Resultado Esperado

-   API consistente
-   Separação clara entre estrutura e comportamento
-   Código alinhado com DDD
-   Base sólida para evolução futura
