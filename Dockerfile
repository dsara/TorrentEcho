FROM mhart/alpine-node:10.2.1

RUN apk add --no-cache bash lftp openssh p7zip tini

ENTRYPOINT [ "/sbin/tini", "--" ]

WORKDIR /src
COPY . /src

RUN npm install && \
  npm run tsc

VOLUME ["/config"]
VOLUME ["/download"]
VOLUME ["/tv"]

EXPOSE 8080
CMD ["node", "./build/index.js"]
