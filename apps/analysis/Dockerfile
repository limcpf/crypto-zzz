FROM cryptozzz-base:latest AS builder

LABEL name="cryptozzz-analysis"
LABEL version="0.0.1"
LABEL description="Cryptozzz Analysis Service"
LABEL maintainer="daeseong0226@gmail.com"

WORKDIR /app

# 루트 레벨의 파일들 복사
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# analysis 프로젝트 파일만 복사
COPY apps/analysis ./apps/analysis

# analysis 프로젝트만 빌드
RUN npm run build analysis

FROM cryptozzz-prod-deps:latest AS runner

COPY --from=builder /app/dist/apps/analysis ./dist
COPY package.json ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE ${PORT}
CMD ["node", "dist/main"]