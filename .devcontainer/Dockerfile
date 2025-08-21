FROM --platform=linux/amd64 mcr.microsoft.com/vscode/devcontainers/typescript-node:22

# Install additional npm packages
RUN npm install -g \
    npm-check-updates \
    @ionic/cli

USER node
RUN mkdir -p ~/.android && export ANDROID_EMULATOR_HOME="$HOME/.android"
