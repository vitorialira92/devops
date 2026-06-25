
# HeatLink (Com Docker)

Acesse o PDF Trabalho 1 - Devops.pdf na branch master para mais detalhes.


## Visão Geral

O **HeatLink** é uma aplicação web para verificação de disponibilidade de URLs.

Fluxo da aplicação:

1. Usuário envia uma URL  
2. API verifica cache no Redis  
3. Se houver cache → retorna resultado  
4. Caso contrário → URL vai para fila  
5. Worker processa e salva no PostgreSQL  
6. Histórico e ranking ficam disponíveis para consulta  

Tecnologias utilizadas:

- Redis → cache e fila  
- PostgreSQL → persistência  
- Spring Boot → backend (API + worker)  
- React + Nginx → frontend  

---

## Pré-requisitos

- Docker Engine 24+
- Docker Compose v2+
- Git

---

## Clonar projeto
```
git clone https://github.com/vitorialira92/devops.git
cd devops
git checkout master
```

## Estrutura esperada

```
devops/
├── compose.yml
├── heatlink.backend/
└── heatlink-frontend/
```
## Subir a aplicação
```
docker compose up --build
```
## Acessos
Frontend: http://localhost:3000

API: http://localhost:8080

Swagger: http://localhost:8080/swagger-ui/index.html#/

## Verificar containers

```
docker compose ps
```

## Parar a aplicação
```
docker compose down
```

## Observações:
- Cache padrão: ~30 segundos
- Worker roda separado da API
- Redis atua como fila e cache
- PostgreSQL mantém histórico completo

