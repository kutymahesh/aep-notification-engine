import { Module } from "@nestjs/common";
import { EventsController, RecipientsController } from "./events.controller";

@Module({
  controllers: [EventsController, RecipientsController],
})
export class AppModule {}
