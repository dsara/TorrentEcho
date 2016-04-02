FROM mhart/alpine-node:5.10

RUN apk add --no-cache bash lftp

WORKDIR /src
COPY . /src

RUN npm install

EXPOSE 8080
CMD ["node", "index.js"]
