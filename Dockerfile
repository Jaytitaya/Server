FROM node:14-alpine as builder

WORKDIR /app

COPY package.json ./
COPY index.js ./

RUN npm install

COPY . .

FROM node:14-alpine

COPY --from=builder /app .

CMD [ "npm", "run", "dev"  ]
