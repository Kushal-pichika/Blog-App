# ✅ Use Jenkins LTS with JDK 21
FROM jenkins/jenkins:lts-jdk21

# Switch to root to install packages
USER root

# Install Docker CLI and kubectl inside Jenkins
RUN apt-get update && apt-get install -y \
    ca-certificates curl gnupg lsb-release apt-transport-https software-properties-common \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list \
    && curl -fsSLo /usr/share/keyrings/kubernetes-archive-keyring.gpg https://pkgs.k8s.io/core:/stable:/v1.30/deb/Release.key \
    && echo "deb [signed-by=/usr/share/keyrings/kubernetes-archive-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.30/deb/ /" > /etc/apt/sources.list.d/kubernetes.list \
    && apt-get update && apt-get install -y docker-ce-cli kubectl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Give Jenkins user permission to access Docker
RUN usermod -aG root jenkins

# Switch back to Jenkins user
USER jenkins
