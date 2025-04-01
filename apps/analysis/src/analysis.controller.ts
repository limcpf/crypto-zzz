import {Controller} from '@nestjs/common';
import {AnalysisService} from './analysis.service';
import {RedisService} from "@libs/redis";
import {CoinLogger} from "@libs/logger/coin-logger";
import {MessageService} from "@libs/messages/message.service";
import {MessageKey} from "@libs/messages/message-keys";

@Controller()
export class AnalysisController {
  private readonly STREAM = "analysis";
  private readonly GROUP = "analysis";
  private readonly CONSUMER = process.env.CONSUMER || "consumer-2";

  constructor(
      private readonly analysisService: AnalysisService,
      private readonly redisService: RedisService,
      private readonly logger: CoinLogger,
      private readonly messageService: MessageService
      ) {}

  async onModuleInit() {
    try {
      await this.redisService.xgroup(this.STREAM, this.GROUP)
    } catch(err) {
      if (err instanceof Error) {
        this.logger.error(
            `${this.messageService.getPlainMessage(
                MessageKey.ERROR_REDIS_XGROUP,
            )} - ${err}`,
            err.stack,
        );
      } else {
        this.logger.debug(err);
        this.logger.error(
            `${this.messageService.getPlainMessage(
                MessageKey.ERROR_REDIS_XGROUP,
            )}`,
        );
      }
    }

    // TODO : 위 소비자 그룹 생성이 안되었을시에 해당 서버 종료 사켜야 하는거 아닌지?
    // TODO : 이 부분은 candle-save쪽도 마찬가지
    // TODO : 해당 부분을 추상화 할 수 없는지? Redis 사용하는 Controller라면 필수일듯함
    this.startConsumer();
  }


  // TODO : 해당 메서드 수정 필요
  private async startConsumer() {
    while (true) {
      try {
        const results = await this.redisService.xreadgroup(
            this.GROUP,
            this.CONSUMER,
            { candle: ">" }, // ">" 는 마지막으로 처리된 ID 이후의 메시지만 가져옴
            1,
            0,
        );

        // TODO: 컨슈머 그룹이 없어서 에러가 나는경우 다시 컨슈머 그룹을 생성하는 로직 추가
        if (results) {
          for (const [, messages] of results) {
            for (const [messageId, [, message]] of messages) {
              const candleSaved = await this.candleSaveService.save(message);

              if (candleSaved) {
                await this.redisService.xadd("analysis", candleSaved);
              }

              // 메시지 처리 완료 표시
              await this.redisService.xack(this.STREAM, this.GROUP, messageId);
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          this.logger.error(
              `${this.messageService.getPlainMessage(
                  MessageKey.ERROR_STREAM_PROCESSING,
              )} - ${err}`,
              err.stack,
          );
        } else {
          this.logger.debug(err);
          this.logger.error(
              `${this.messageService.getPlainMessage(
                  MessageKey.ERROR_STREAM_PROCESSING,
              )}`,
          );
        }

        // 에러 발생 시 3초 대기 후 재시도
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  }
}
}
