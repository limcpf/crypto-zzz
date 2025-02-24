FROM node:22-alpine AS base

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

RUN npm ci

FROM node:22-alpine AS prod-deps

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev 