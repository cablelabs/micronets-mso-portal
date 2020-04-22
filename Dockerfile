FROM node:10-slim

# Create api directory
WORKDIR /usr/src/mso-portal

# Bundle api source
COPY . .
RUN ls -a

ENV MONGO_URL=

RUN npm install

# Bundle app source
COPY . .

CMD [ "npm", "run", "start"]
