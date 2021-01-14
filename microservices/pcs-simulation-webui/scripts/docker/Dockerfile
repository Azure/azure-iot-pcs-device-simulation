# Copyright (c) Microsoft. All rights reserved.

# Note: multi-stage build, requires Docker 17.05+ (released in May 2017)

FROM node:11.3.0-alpine as codebuilder
COPY .env ./ /app/
WORKDIR /app
RUN echo "Installing node packages ..." && npm install
RUN echo "Building app..."              && export CI=true && npm run build
RUN echo "Removing temp files..."       && rm -rf node_modules src public package.json Dockerfile .dockerignore

FROM alpine:3.7
COPY --from=codebuilder /app /app
WORKDIR /app
RUN echo "Installing web server..." \
 && apk add --no-cache nginx \
 && mkdir /app/logs \
 && echo "Removing unused files..." \
 && apk del --force --purge alpine-keys apk-tools \
 && rm -rf /var/cache/apk /etc/apk /lib/apk

MAINTAINER Devis Lucato (https://github.com/dluc)

EXPOSE 80 443
VOLUME /app/logs

ENTRYPOINT ["/bin/sh", "/app/run.sh"]
