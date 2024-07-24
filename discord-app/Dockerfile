FROM node:18

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install
RUN apt-get update

COPY . .
CMD ["npm", "run", "start"]