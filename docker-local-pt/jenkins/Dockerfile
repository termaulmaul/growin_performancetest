# Local Jenkins for k6 mock PT — k6 + Node inside image, no Docker socket.
FROM jenkins/jenkins:lts-jdk17

USER root

ARG K6_VERSION=0.51.0

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    bash \
    git \
    jq \
    unzip \
    wget \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get update \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

RUN set -eux; \
    arch="$(uname -m)"; \
    case "$arch" in \
      aarch64|arm64) k6arch=arm64 ;; \
      x86_64|amd64) k6arch=amd64 ;; \
      *) echo "unsupported arch: $arch" >&2; exit 1 ;; \
    esac; \
    curl -fsSL "https://github.com/grafana/k6/releases/download/v${K6_VERSION}/k6-v${K6_VERSION}-linux-${k6arch}.tar.gz" \
      | tar xz -C /usr/local/bin --strip-components=1 "k6-v${K6_VERSION}-linux-${k6arch}/k6"; \
    k6 version

COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt

COPY scripts/install-tools.sh /usr/local/bin/install-tools.sh
RUN chmod +x /usr/local/bin/install-tools.sh && install-tools.sh

COPY init.groovy.d/ /usr/share/jenkins/ref/init.groovy.d/
COPY pipelines/ /usr/share/jenkins/ref/jenkins-pipelines/

USER jenkins

ENV JENKINS_OPTS="--prefix=/"
