FROM node:latest

WORKDIR /usr/src/app

# Bundle app source
COPY app .
RUN ls -a

ENV MONGO_URL=mongodb://mongo:27017/mso-portal

# Install app dependencies
RUN npm install

EXPOSE 8081

CMD ["npm", "run", "client"]
