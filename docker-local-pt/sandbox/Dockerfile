# Sandbox SSH demo container — mimics Onprem-2 / Oncloud-VM flow.
# Usage from pt-menu.sh "Sandbox Demo" target:
#   sshpass -p M@nsek.1234 ssh -p 2222 qa@127.0.0.1 "cd Script/... && k6 run ..."
FROM debian:bookworm-slim

# ── Base packages ────────────────────────────────────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssh-server \
    sudo \
    ca-certificates \
    curl \
    wget \
    git \
    netcat-openbsd \
    bash \
    && rm -rf /var/lib/apt/lists/*

# ── Install k6 binary ────────────────────────────────────────────────────────
ARG K6_VERSION=v0.51.0
RUN ARCH=$(dpkg --print-architecture) \
    && case "$ARCH" in \
       amd64)  K6_ARCH=linux-amd64  ;; \
       arm64)  K6_ARCH=linux-arm64  ;; \
       *) echo "Unsupported arch $ARCH"; exit 1 ;; \
    esac \
    && curl -sL "https://github.com/grafana/k6/releases/download/${K6_VERSION}/k6-${K6_VERSION}-${K6_ARCH}.tar.gz" \
       | tar -xz --strip-components=1 -C /usr/local/bin "k6-${K6_VERSION}-${K6_ARCH}/k6" \
    && chmod +x /usr/local/bin/k6 \
    && k6 version

# ── Create qa user with password M@nsek.1234 ────────────────────────────────
RUN useradd -m -s /bin/bash qa \
    && echo 'qa:M@nsek.1234' | chpasswd \
    && usermod -aG sudo qa \
    && echo 'qa ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers

# ── SSH server config ────────────────────────────────────────────────────────
RUN mkdir -p /var/run/sshd \
    && sed -i 's/#*PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config \
    && sed -i 's/#*PermitRootLogin.*/PermitRootLogin no/'                /etc/ssh/sshd_config \
    && ssh-keygen -A

# Login MOTD
RUN echo 'echo "Authorized uses only, All activity may be monitored and reported."' >> /etc/profile

WORKDIR /workspace
EXPOSE 22

CMD ["/usr/sbin/sshd","-D","-e"]
