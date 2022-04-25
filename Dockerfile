FROM node:14-alpine as builder

WORKDIR /app

COPY package.json ./

RUN npm install
RUN npm install request --save
COPY . .

FROM node:14-alpine

COPY --from=builder /app .

RUN npm install request --save

CMD [ "npm", "run", "dev"  ]
