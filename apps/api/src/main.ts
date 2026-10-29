import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  app.enableCors({ origin: ["http://localhost:5173"] });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const swaggerConfig = new DocumentBuilder()
    .setTitle("AEP Notification Engine API")
    .setDescription("Boiler monitoring event catalog, event creation, telemetry threshold testing, and recipient management. Test with demo data only; this API does not control boiler equipment.")
    .setVersion("0.1.0")
    .addTag("boiler", "Boiler event catalog")
    .addTag("events", "Incoming event management and telemetry test endpoint")
    .addTag("recipients", "Notification recipient management")
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/docs", app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = Number(process.env.API_PORT ?? 3000);
  await app.listen(port);
}
void bootstrap();
