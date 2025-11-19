# build with $ podman build --target export --output type=local,dest=./dist .

# Use Rocky Linux 8 as base for now
FROM rockylinux:8 AS builder

# Install required tools: git, curl, Node.js (LTS), npm
# using NodeJS:18 per GDCC README
RUN dnf -y module enable nodejs:18

RUN dnf -y install curl nodejs && \
    dnf clean all

# Set working directory
WORKDIR /build/dataverse-globus

# Copy package files first for better layer caching
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build Angular project
RUN npm run build

# export dist to filesystem
FROM scratch AS export
COPY --from=builder /build/dataverse-globus/dist .
