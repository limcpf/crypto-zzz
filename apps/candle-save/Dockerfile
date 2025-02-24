FROM cryptozzz-base:latest AS builder

LABEL name="cryptozzz-candle-save"
LABEL version="0.0.1"
LABEL description="Cryptozzz Candle Save Service"
LABEL maintainer="daeseong0226@gmail.com"

WORKDIR /app

# 루트 레벨의 파일들 복사
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# candle-save 프로젝트 파일만 복사
COPY apps/candle-save ./apps/candle-save

# candle-save 프로젝트만 빌드
RUN npm run build candle-save

FROM cryptozzz-prod-deps:latest AS runner

COPY --from=builder /app/dist/apps/candle-save ./dist
COPY package.json ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE ${PORT}
CMD ["node", "dist/main"]
