FROM node:latest

WORKDIR /usr/src/app

RUN npm install

# Install app dependencies
COPY app/package.json .

ENV MONGO_URL=

# Bundle app source
COPY app .

EXPOSE 8081

CMD ["npm", "run", "dev"]
