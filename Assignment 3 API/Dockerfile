# FROM node:8-alpine
# FROM alpine
FROM node:alpine

ARG USER=docker 
ARG UID=1001
ARG GROUP=regularUsers 
ARG GID=1001 
 
RUN addgroup -g ${GID} -S ${GROUP} \ 
&& adduser -S -G ${GROUP} -u ${UID} ${USER}

WORKDIR /app

COPY package.json /app

RUN npm install

COPY . /app

CMD ["npm", "run", "dev"]

USER ${USER}




# EXPOSE 7000

# CMD instructions wont be executed when the img is created, but when the container is started based on the img
# RUN npm run dev
# npm run dev
# CMD ["npm", "start"]