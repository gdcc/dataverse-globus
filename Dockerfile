# build with $ podman build -f Dockerfile -v "$(pwd)":/build/dataverse-globus --userns-uid-map=0:1000:1 -t dataverse-globus .
# run with $ podman run --userns=keep-id -v "$(pwd)":/build/dataverse-globus dataverse-globus

# Use Rocky Linux 8 as base
FROM rockylinux:8

# Install required tools: git, curl, Node.js (LTS), npm
# using NodeJS:14 per ScholarsPortal README
RUN dnf -y module enable nodejs:14

RUN dnf -y install git curl nodejs && \
    dnf clean all

# Set working directory
WORKDIR /build/dataverse-globus

# Install npm dependencies
RUN npm install

# Build Angular project
RUN npm run build
