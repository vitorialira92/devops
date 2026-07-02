#!/bin/bash
###############################################################################
# build-images.sh
#
# Faz o build das imagens Docker do HeatLink (api/worker e frontend),
# opcionalmente envia para o Docker Hub e/ou carrega no Minikube.
#
# O backend (api) e o worker usam a mesma imagem; o que muda entre eles e
# apenas a variavel de ambiente SPRING_PROFILES_ACTIVE (api ou worker),
# definida pelos manifestos/Helm. Por isso, so ha duas imagens no total.
#
# Uso:
#   ./build-images.sh            # so faz o build local das imagens
#   ./build-images.sh -l         # build + carrega no Minikube (minikube image load)
#   ./build-images.sh -p         # build + push para o Docker Hub
#   ./build-images.sh -l -p      # build + push + carrega no Minikube
#
# Pre-requisitos:
#   - Docker em execucao
#   - (para -p) estar logado no Docker Hub:  docker login
#   - (para -l) Minikube em execucao:        minikube start
###############################################################################

# Usuario do Docker Hub. Troque aqui se necessario.
DOCKER_USER="vitoriatenorio"

API_IMAGE="${DOCKER_USER}/heatlink-api:latest"
FRONT_IMAGE="${DOCKER_USER}/heatlink-frontend:latest"

DO_LOAD=false
DO_PUSH=false

while getopts ":lp" option; do
   case $option in
      l) DO_LOAD=true ;;
      p) DO_PUSH=true ;;
      *) echo "Opcao invalida. Use -l (load no minikube) e/ou -p (push no Docker Hub)."; exit 1 ;;
   esac
done

echo " Build da imagem do backend/worker: ${API_IMAGE}"
docker build -t "${API_IMAGE}" ./heatlink.backend

echo " Build da imagem do frontend: ${FRONT_IMAGE}"
docker build -t "${FRONT_IMAGE}" ./heatlink-frontend

if [ "$DO_PUSH" = true ]; then
   echo " Enviando imagens para o Docker Hub"
   docker push "${API_IMAGE}"
   docker push "${FRONT_IMAGE}"
fi

if [ "$DO_LOAD" = true ]; then
   echo " Carregando imagens no Minikube"
   minikube image load "${API_IMAGE}"
   minikube image load "${FRONT_IMAGE}"
fi

echo "Concluido."
