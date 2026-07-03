
# HeatLink no Kubernetes (Minikube + Helm)

Acesse o PDF Trabalho 2 - Devops.pdf para mais detalhes.

## O que é a aplicação

O HeatLink é uma aplicação web para **verificação de disponibilidade de URLs**.
O fluxo é: o usuário envia uma URL, a API verifica o cache no Redis, e se não
houver resultado a URL é colocada em uma fila. Um Worker consome essa fila,
testa a URL e grava o resultado no PostgreSQL. O histórico e o ranking ficam
disponíveis para consulta.

São **cinco componentes**:

1. **postgres** - banco de dados PostgreSQL (persistência do histórico/ranking).
2. **redis** - cache e fila de mensagens.
3. **api** - backend Spring Boot que expõe a API REST (perfil `api`).
4. **worker** - mesmo backend Spring Boot rodando como consumidor da fila (perfil `worker`).
5. **frontend** - aplicação React servida pelo Nginx, que também faz proxy de `/api` para o serviço `api`.

O backend e o worker usam a **mesma imagem Docker**; o que muda é apenas a
variável de ambiente `SPRING_PROFILES_ACTIVE` (`api` ou `worker`).

---

## Imagens no Docker Hub

- `vitoriatenorio/heatlink-api` (backend e worker)
- `vitoriatenorio/heatlink-frontend` (frontend)

---

## Pré-requisitos

- Docker
- Minikube
- kubectl
- Helm 3

---

## Como executar (caminho recomendado: Helm)

```bash
# 1. Suba o Minikube, habilite o Ingress e faça build+load das duas imagens.
#    (-i inicializa o cluster, -b faz o backend, -f faz o frontend)
./helm-up -i -b -f

# 2. Descubra o IP do cluster
minikube ip
# ex.: 192.168.49.2

# 3. Mapeie o host k8s.local para esse IP no seu /etc/hosts
echo "192.168.49.2 k8s.local" | sudo tee -a /etc/hosts

# 4. Acesse no navegador
#    http://k8s.local
```

Nas próximas execuções, se as imagens já estiverem carregadas, basta `./helm-up`.

Para remover tudo:

```bash
./helm-down
```

---

## Alternativa: implantação com manifestos crus (sem Helm)

Os mesmos objetos estão descritos individualmente na pasta `K8s/`, e podem ser
aplicados com `kubectl` através dos scripts:

```bash
./minikube-up -i -b -f   # sobe tudo
./minikube-down          # remove tudo
```

---

## Estrutura do repositório

```
.
├── build-images.sh          # build/push/load das imagens Docker
├── helm-up / helm-down      # sobe/remove a aplicação via Helm (recomendado)
├── minikube-up / minikube-down  # sobe/remove via manifestos crus (kubectl)
├── compose.yml              # Trabalho 1 (Docker Compose) - referência
├── heatlink.backend/        # código do backend/worker + Dockerfile
├── heatlink-frontend/       # código do frontend + Dockerfile + nginx.conf
├── K8s/                     # manifestos Kubernetes "crus" (documentação/depuração)
│   ├── postgres/  (secret, pv, pvc, deployment, service)
│   ├── redis/     (deployment, service)
│   ├── api/       (configmap, deployment, service)
│   ├── worker/    (deployment)
│   ├── frontend/  (deployment, service)
│   └── ingress.yaml
└── heatlink-chart/          # Helm Chart (umbrella + 5 subcharts)
    ├── Chart.yaml
    ├── values.yaml
    ├── templates/ingress.yaml
    └── charts/
        ├── postgres/  ├── redis/  ├── api/  ├── worker/  └── frontend/
```

---

## Documentação completa

O arquivo **`Trabalho 2 - DevOps.pdf`** descreve em detalhes a aplicação,
o roteiro de testes e todos os artefatos Kubernetes utilizados.
