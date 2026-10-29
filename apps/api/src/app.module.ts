import { Module } from "@nestjs/common";
import { BoilerController, EventsController, RecipientsController } from "./events.controller";

@Module({ controllers: [BoilerController, EventsController, RecipientsController] })
export class AppModule {}
