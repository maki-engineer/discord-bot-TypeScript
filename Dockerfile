FROM node:18

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install
RUN npm install sqlite3
RUN apt-get update
RUN apt-get -y install ffmpeg

COPY . .
CMD ["npm", "run", "start"]