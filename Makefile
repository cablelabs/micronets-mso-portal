DOCKER_REGISTRY := community.cablelabs.com:4567
DOCKER_IMAGE_PATH := micronets-docker/micronets-mso-portal
DOCKER_IMAGE_TAG := latest
docker-build:
	docker build -t $(DOCKER_REGISTRY)/$(DOCKER_IMAGE_PATH):${DOCKER_IMAGE_TAG} .

docker-push: docker-build
	docker login $(DOCKER_REGISTRY)
	docker push $(DOCKER_REGISTRY)/$(DOCKER_IMAGE_PATH):${DOCKER_IMAGE_TAG}

docker-pull:
	docker pull $(DOCKER_REGISTRY)/$(DOCKER_IMAGE_PATH):${DOCKER_IMAGE_TAG}
