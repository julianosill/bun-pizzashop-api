![Imagem do logotipo PizzaShop e duas telas da página inicial da aplicação](.github/cover-pizzashop.png)

# PizzaShop API

API Resftul para uma aplicação de gerenciamento de pedidos de delivery desenvolvido no curso de Desenvolvimento Full Stack da Rocketseat, contando com métricas de pedidos e faturamento.

A aplicação foi desenvolvida com Bun e ElysiaJS, utilizando banco de dados PostgreSQL.

Acesse a aplicação web do projeto [neste link](https://github.com/julianosill/ignite-pizzashop-web).

## Tecnologias e bibliotecas

![typescript](https://img.shields.io/badge/typescript-292b36?style=for-the-badge&logo=typescript)
![bun](https://img.shields.io/badge/bun-292b36?style=for-the-badge&logo=bun)
![elysia](https://img.shields.io/badge/elysia-292b36?style=for-the-badge&logo=elysia)
![drizzle](https://img.shields.io/badge/drizzle-292b36?style=for-the-badge&logo=drizzle)
![postgresql](https://img.shields.io/badge/postgresql-292b36?style=for-the-badge&logo=postgresql)
![docker](https://img.shields.io/badge/docker-292b36?style=for-the-badge&logo=docker)
![zod](https://img.shields.io/badge/zod-292b36?style=for-the-badge&logo=zod)

## Funcionalidades

- Registro e atualização do perfil do restaurante
- Listagem de pedidos
- Aprovação, envio, conclusão e cancelamento de pedidos
- Retorno dos detalhes do pedido e cliente
- Retorno de métricas de pedidos e faturamento

---

## Instalação

Clone este repositório, acesse a pasta do projeto e instale as dependendências necessárias seguindo os comandos abaixo:

```bash
git clone https://github.com/julianosill/bun-pizzashop-api.git
cd bun-pizzashop-api
bun install
```

Suba o banco de dados PostgreSQL utilizando o Docker, executando o comando:

```bash
docker compose up -d
```

Caso não tenha o Docker instalado, [clique aqui](https://www.docker.com/products/docker-desktop) e siga as instruções.

### Executando localmente

Crie um arquivo chamado `.env.local` (ou renomeie o aquivo `env_sample`) na pasta raíz do projeto seguindo o padrão abaixo:

```bash
# API
API_BASE_URL="http://localhost:3333"
AUTH_REDIRECT_URL="url_da_aplicacao_web"

# JWT
JWT_SECRET="jwt_secret_key"

# Database
DATABASE_URL="postgresql://admin:docker@localhost:5432/pizzashop"
```

Estabeleça a conexão com o banco de dados, rode as migrações e preencha com dados fictícios para facilitar o teste de uso:

```bash
bun generate
bun migrate
bun seed
```

Por fim, inicie a aplicação com o comando:

```bash
bun dev
```

---

## Endpoints

- POST `/authenticate`: autenticação do usuário
- POST `/restaurants`: cadastrar restaurante
- POST `/sign-out`: encerrar sessão do usuário

### Perfil
- GET `/managed-restaurant`: dados do restaurante
- GET `/profile`: dados do usuário

### Pedidos
- GET `/orders`: lista de pedidos
- GET `/orders/:id`: dados do pedido
- PATCH `/orders/:orderId/approve`: aprovação do pedido
- PATCH `/orders/:orderId/cancel`: cancelar pedido
- PATCH `/orders/:orderId/dispatch`: enviar pedido
- PATCH `/orders/:orderId/deliver`: finalizar entrega do pedido

### Métricas
- GET `/metrics/day-orders-amount`: número de pedidos (dia)
- GET `/metrics/month-orders-amount`: número de pedidos (mês)
- GET `/metrics/month-canceled-orders-amount`: número de pedidos cancelados (mês)
- GET `/metrics/month-revenue`: faturamento (mês)
- GET `/metrics/daily-revenue-in-period`: receita no periodo (por dia)
- GET `/metrics/popular-products`: produtos mais vendidos (total de 5)