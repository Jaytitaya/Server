FROM node:14-alpine as builder

WORKDIR /app

COPY package.json ./

RUN npm install
RUN npm install request-param
COPY . .

# FROM node:14-alpine

# COPY --from=builder /app .

EXPOSE 3001

CMD [ "npm", "run", "dev"  ]
