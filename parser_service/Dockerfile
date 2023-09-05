FROM node:18.1.0

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

# ENV mainAPIurl="http://host.docker.internal:3000"
ENV mainAPIurl="http://oskardolenc.eu:8080"
ENV nominatimAPIurl="http://oskardolenc.eu:591"

COPY ./ ./

CMD [ "npm", "start" ]
