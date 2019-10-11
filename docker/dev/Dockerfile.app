FROM node:latest

WORKDIR /usr/src/app

# Bundle app source
COPY app .
RUN ls -a

ENV MONGO_URL=

# Install app dependencies
RUN npm install

EXPOSE 8081

CMD ["npm", "run", "client"]
