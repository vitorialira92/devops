
# HeatLink (Sem Docker)

Acesse o PDF Trabalho 1 - Devops.pdf para mais detalhes.

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

- Java + Spring Boot  
- Redis  
- PostgreSQL  
- Node.js (frontend)  

---

## Pré-requisitos

- Java 21  
- Maven 3.9+  
- Node.js 18+  
- npm 9+  
- PostgreSQL 15  
- Redis 7  
- Git  

---

## Configurar banco de dados

```sql
CREATE USER heatlink WITH PASSWORD 'heatlink';
CREATE DATABASE heatlink OWNER heatlink;
```
## Verificar Redis
```
redis-cli ping
```
Deve retornar PONG
## Clonar projeto
```
git clone https://github.com/vitorialira92/devops.git
cd devops
git checkout master
```

## Rodar backend

```
cd heatlink.backend
mvn clean package -DskipTests
```
### Iniciar API
```
java -Dspring.profiles.active=api -jar target/heatlink.backend-0.0.1-SNAPSHOT.jar
```
### Iniciar Worker (em outro terminal)
```
java -Dspring.profiles.active=worker -jar target/heatlink.backend-0.0.1-SNAPSHOT.jar
```
### Acessos
http://localhost:8080
Swagger: http://localhost:8080/swagger-ui/index.html#/

## Rodar frontend
Em um terceiro terminal:
```
cd heatlink-frontend
npm install
npm run dev
```

### Acesso
http://localhost:5173

## Observações:
- Redis precisa estar rodando antes da API
- PostgreSQL deve estar configurado corretamente
- API e Worker devem rodar simultaneamente
- Frontend depende da API ativa

