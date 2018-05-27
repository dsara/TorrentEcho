FROM mhart/alpine-node:10.2.1

RUN apk add --no-cache bash lftp openssh unrar

WORKDIR /src
COPY . /src

RUN npm install

VOLUME ["/config"]
VOLUME ["/download"]

EXPOSE 8080
CMD ["node", "index.js"]
