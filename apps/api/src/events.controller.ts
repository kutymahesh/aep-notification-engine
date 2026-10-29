import { BadRequestException, Body, Controller, Get, Patch, Post, Param } from "@nestjs/common";

type Severity = "Critical" | "Warning" | "Info";
type Channel = "Email" | "SMS" | "In-app";
type IncomingEvent = {
  id: string; source: string; eventType: string; severity: Severity;
  title: string; asset: string; occurredAt: string; status: "New" | "Reviewed";
};
type Recipient = {
  id: string; name: string; role: string; email: string; phone: string;
  channels: Channel[]; active: boolean; createdAt: string;
};

// In-memory starter stores. PostgreSQL persistence and tenant-auth scoping are the next milestone.
const events: IncomingEvent[] = [
  { id:"evt-demo-1004", source:"Boiler Gateway", eventType:"pressure.high", severity:"Critical", title:"Boiler pressure above configured limit", asset:"Boiler-01", occurredAt:new Date().toISOString(), status:"New" },
  { id:"evt-demo-1003", source:"Boiler Gateway", eventType:"temperature.high", severity:"Warning", title:"Boiler temperature above configured limit", asset:"Boiler-01", occurredAt:new Date(Date.now()-240000).toISOString(), status:"New" },
  { id:"evt-demo-1002", source:"Controller", eventType:"pump.fault", severity:"Critical", title:"Feedwater pump fault signal received", asset:"Boiler-02", occurredAt:new Date(Date.now()-1080000).toISOString(), status:"Reviewed" },
];
const recipients: Recipient[] = [
  { id:"rec-demo-1", name:"Priya Raman", role:"Boiler Operator", email:"operator@example.com", phone:"+1 555 010 0101", channels:["Email","In-app"], active:true, createdAt:new Date().toISOString() },
  { id:"rec-demo-2", name:"Arun Kumar", role:"Maintenance Technician", email:"maintenance@example.com", phone:"+1 555 010 0102", channels:["Email","SMS"], active:true, createdAt:new Date().toISOString() },
];

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
    const event: IncomingEvent = {
      id: `evt-${Date.now()}`, source: body.source?.trim() || "Manual Test Event",
      eventType: body.eventType.trim(), severity, title: body.title.trim(),
      asset: body.asset.trim(), occurredAt: new Date().toISOString(), status: "New",
    };
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
    if (!body.email?.trim() && !body.phone?.trim()) {
      throw new BadRequestException("At least one email address or phone number is required");
    }
    const allowedRoles = ["Boiler Operator", "Maintenance Technician", "Facility Manager", "On-call Engineer"];
    const role = body.role ?? "Boiler Operator";
    if (!allowedRoles.includes(role)) throw new BadRequestException("Unsupported recipient role");
    const allowedChannels: Channel[] = ["Email", "SMS", "In-app"];
    const channels = body.channels ?? ["Email", "In-app"];
    if (!Array.isArray(channels) || channels.some(channel => !allowedChannels.includes(channel))) {
      throw new BadRequestException("channels must contain Email, SMS, and/or In-app");
    }
    if (channels.includes("Email") && !body.email?.trim()) throw new BadRequestException("Email channel requires an email address");
    if (channels.includes("SMS") && !body.phone?.trim()) throw new BadRequestException("SMS channel requires a phone number");
    const recipient: Recipient = {
      id: `rec-${Date.now()}`, name: body.name.trim(), role,
      email: body.email?.trim() ?? "", phone: body.phone?.trim() ?? "",
      channels, active: true, createdAt: new Date().toISOString(),
    };
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
