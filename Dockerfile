FROM node:8

# Development packages
RUN apt-get update;

# Create app directory
WORKDIR /usr/src/api

# Install app dependencies
COPY package.json .


RUN npm install

# Bundle app source
COPY . .

EXPOSE 3210
CMD [ "npm", "start" ]