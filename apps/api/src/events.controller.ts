import { BadRequestException, Body, Controller, Get, Patch, Post, Param } from "@nestjs/common";

export type Severity = "Critical" | "Warning" | "Info";
export type Channel = "Email" | "SMS" | "In-app";
export const BOILER_EVENT_CATALOG = [
  { eventType:"steam_pressure.high", title:"Steam pressure above configured operating limit", severity:"Critical", trigger:"Validated pressure reading exceeds a site-configured limit", source:"Telemetry or controller", requiresConfiguration:true },
  { eventType:"steam_pressure.low", title:"Steam pressure below configured operating range", severity:"Warning", trigger:"Validated pressure reading falls below configured range", source:"Telemetry", requiresConfiguration:true },
  { eventType:"boiler_temperature.high", title:"Boiler temperature above configured limit", severity:"Warning", trigger:"Validated temperature reading exceeds configured limit", source:"Telemetry", requiresConfiguration:true },
  { eventType:"water_level.low", title:"Boiler water level below configured limit", severity:"Critical", trigger:"Verified level signal falls below approved threshold", source:"Level sensor or local controller", requiresConfiguration:true },
  { eventType:"water_level.high", title:"Boiler water level above configured limit", severity:"Warning", trigger:"Verified level signal exceeds configured range", source:"Level sensor", requiresConfiguration:true },
  { eventType:"burner.flame_failure", title:"Burner flame failure signal received", severity:"Critical", trigger:"Burner management controller reports flame failure", source:"Burner controller", requiresConfiguration:false },
  { eventType:"burner.lockout", title:"Burner controller entered lockout", severity:"Critical", trigger:"Burner controller reports lockout/fault state", source:"Burner controller", requiresConfiguration:false },
  { eventType:"feedwater_pump.fault", title:"Feedwater pump fault signal received", severity:"Critical", trigger:"Validated pump/controller fault feedback received", source:"Pump controller or feedback", requiresConfiguration:false },
  { eventType:"flue_gas_temperature.high", title:"Flue-gas temperature above configured limit", severity:"Warning", trigger:"Validated flue-gas temperature exceeds configured limit", source:"Flue-gas temperature sensor", requiresConfiguration:true },
  { eventType:"sensor.fault", title:"Boiler sensor fault or invalid reading", severity:"Warning", trigger:"Device diagnostic or data-quality check reports invalid/stale data", source:"Sensor diagnostics or telemetry processor", requiresConfiguration:true },
  { eventType:"gateway.offline", title:"Boiler gateway stopped reporting", severity:"Warning", trigger:"No heartbeat received within configured timeout", source:"Gateway heartbeat monitor", requiresConfiguration:true },
  { eventType:"maintenance.due", title:"Boiler maintenance is due", severity:"Info", trigger:"Configured calendar or runtime interval is reached", source:"Maintenance scheduler", requiresConfiguration:true },
] as const;

type IncomingEvent = {
  id: string; source: string; eventType: string; severity: Severity;
  title: string; asset: string; occurredAt: string; status: "New" | "Reviewed";
};
type Recipient = {
  id: string; name: string; role: string; email: string; phone: string;
  channels: Channel[]; active: boolean; createdAt: string;
};

// Temporary starter stores; PostgreSQL schema is provided under database/schema.sql.
// These stores reset when the API process restarts.
const events: IncomingEvent[] = [
  { id:"evt-demo-1004", source:"Burner Management Controller", eventType:"burner.flame_failure", severity:"Critical", title:"Burner flame failure signal received", asset:"Boiler-01", occurredAt:new Date().toISOString(), status:"New" },
  { id:"evt-demo-1003", source:"Boiler Gateway", eventType:"steam_pressure.high", severity:"Critical", title:"Steam pressure above configured operating limit", asset:"Boiler-01", occurredAt:new Date(Date.now()-240000).toISOString(), status:"New" },
  { id:"evt-demo-1002", source:"Feedwater Pump Controller", eventType:"feedwater_pump.fault", severity:"Critical", title:"Feedwater pump fault signal received", asset:"Boiler-02", occurredAt:new Date(Date.now()-1080000).toISOString(), status:"Reviewed" },
];
const recipients: Recipient[] = [
  { id:"rec-demo-1", name:"Priya Raman", role:"Boiler Operator", email:"operator@example.com", phone:"+1 555 010 0101", channels:["Email","In-app"], active:true, createdAt:new Date().toISOString() },
  { id:"rec-demo-2", name:"Arun Kumar", role:"Maintenance Technician", email:"maintenance@example.com", phone:"+1 555 010 0102", channels:["Email","SMS"], active:true, createdAt:new Date().toISOString() },
];

@Controller("boiler")
export class BoilerController {
  @Get("event-catalog")
  catalog() { return BOILER_EVENT_CATALOG; }
}

@Controller("events")
export class EventsController {
  @Get()
  findAll(): IncomingEvent[] { return events; }

  @Post()
  create(@Body() body: Partial<IncomingEvent>): IncomingEvent {
    if (!body.title?.trim() || !body.eventType?.trim() || !body.asset?.trim()) {
      throw new BadRequestException("title, eventType, and asset are required");
    }
    const allowed: Severity[] = ["Critical", "Warning", "Info"];
    const severity = body.severity ?? "Warning";
    if (!allowed.includes(severity)) throw new BadRequestException("severity must be Critical, Warning, or Info");
    const catalogItem = BOILER_EVENT_CATALOG.find(item => item.eventType === body.eventType);
    const event: IncomingEvent = {
      id: `evt-${Date.now()}`, source: body.source?.trim() || "Manual Test Event",
      eventType: body.eventType.trim(), severity, title: body.title.trim(),
      asset: body.asset.trim(), occurredAt: new Date().toISOString(), status: "New",
    };
    // Manual test events are recorded only. They do not actuate boiler equipment.
    void catalogItem;
    events.unshift(event);
    return event;
  }

  @Post("from-telemetry")
  createFromTelemetry(@Body() body: { eventType?: string; asset?: string; value?: number; unit?: string; threshold?: number; source?: string }): IncomingEvent {
    if (!body.eventType || !body.asset?.trim() || typeof body.value !== "number" || typeof body.threshold !== "number") {
      throw new BadRequestException("eventType, asset, numeric value, and configured threshold are required");
    }
    const item = BOILER_EVENT_CATALOG.find(entry => entry.eventType === body.eventType);
    if (!item || !("requiresConfiguration" in item)) throw new BadRequestException("Unsupported boiler event type");
    if (!["steam_pressure.high","steam_pressure.low","boiler_temperature.high","water_level.low","water_level.high","flue_gas_temperature.high"].includes(body.eventType)) {
      throw new BadRequestException("This event must come from a controller/diagnostic signal or scheduled job, not a numeric threshold");
    }
    const isHigh = body.eventType.endsWith(".high");
    const triggered = isHigh ? body.value > body.threshold : body.value < body.threshold;
    if (!triggered) return { id:"", source:body.source?.trim() || "Telemetry rule", eventType:body.eventType, severity:item.severity, title:"No event: value is within the configured range", asset:body.asset.trim(), occurredAt:new Date().toISOString(), status:"Reviewed" };
    const event: IncomingEvent = { id:`evt-${Date.now()}`, source:body.source?.trim() || "Telemetry rule", eventType:body.eventType, severity:item.severity, title:item.title, asset:body.asset.trim(), occurredAt:new Date().toISOString(), status:"New" };
    events.unshift(event);
    return event;
  }

  @Patch(":id/review")
  markReviewed(@Param("id") id: string): IncomingEvent {
    const event = events.find(item => item.id === id);
    if (!event) throw new BadRequestException("Event not found");
    event.status = "Reviewed";
    return event;
  }
}

@Controller("recipients")
export class RecipientsController {
  @Get()
  findAll(): Recipient[] { return recipients; }

  @Post()
  create(@Body() body: Partial<Recipient>): Recipient {
    if (!body.name?.trim()) throw new BadRequestException("name is required");
    if (!body.email?.trim() && !body.phone?.trim()) throw new BadRequestException("At least one email address or phone number is required");
    const allowedRoles = ["Boiler Operator", "Maintenance Technician", "Facility Manager", "On-call Engineer"];
    const role = body.role ?? "Boiler Operator";
    if (!allowedRoles.includes(role)) throw new BadRequestException("Unsupported recipient role");
    const allowedChannels: Channel[] = ["Email", "SMS", "In-app"];
    const channels = body.channels ?? ["Email", "In-app"];
    if (!Array.isArray(channels) || channels.some(channel => !allowedChannels.includes(channel))) throw new BadRequestException("channels must contain Email, SMS, and/or In-app");
    if (channels.includes("Email") && !body.email?.trim()) throw new BadRequestException("Email channel requires an email address");
    if (channels.includes("SMS") && !body.phone?.trim()) throw new BadRequestException("SMS channel requires a phone number");
    const recipient: Recipient = { id:`rec-${Date.now()}`, name:body.name.trim(), role, email:body.email?.trim() ?? "", phone:body.phone?.trim() ?? "", channels, active:true, createdAt:new Date().toISOString() };
    recipients.unshift(recipient);
    return recipient;
  }

  @Patch(":id/toggle")
  toggle(@Param("id") id: string): Recipient {
    const recipient = recipients.find(item => item.id === id);
    if (!recipient) throw new BadRequestException("Recipient not found");
    recipient.active = !recipient.active;
    return recipient;
  }
}
