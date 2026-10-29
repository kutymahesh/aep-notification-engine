import { Body, Controller, Get, Post } from "@nestjs/common";

type IncomingEvent = {
  id: string;
  source: string;
  eventType: string;
  severity: "Critical" | "Warning" | "Info";
  title: string;
  asset?: string;
  occurredAt: string;
  status: "New";
};

// Temporary in-memory storage for the first API checkpoint.
// Replace with a PostgreSQL-backed repository in the next step.
const events: IncomingEvent[] = [];

@Controller("events")
export class EventsController {
  @Get()
  findAll(): IncomingEvent[] {
    return events;
  }

  @Post()
  create(@Body() body: Omit<IncomingEvent, "id" | "occurredAt" | "status">): IncomingEvent {
    const event: IncomingEvent = {
      ...body,
      id: `evt-${Date.now()}`,
      occurredAt: new Date().toISOString(),
      status: "New",
    };
    events.unshift(event);
    return event;
  }
}
