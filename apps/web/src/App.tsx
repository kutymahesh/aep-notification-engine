import { useMemo, useState } from "react";
import { Activity, BellRing, CircleAlert, Plus, Search, ShieldCheck, Waves, Users, GitBranch, X, Thermometer, Gauge, Droplets, Flame, Mail, MessageSquare, Phone } from "lucide-react";

type Severity = "Critical" | "Warning" | "Info";
type Channel = "Email" | "SMS" | "In-app";
type BoilerEventType = "temperature.high" | "pressure.high" | "water_level.low" | "burner.ignition_failure" | "pump.fault" | "device.offline" | "custom";
type EventRecord = { id: string; source: string; eventType: string; severity: Severity; title: string; asset: string; receivedAt: string; status: "New" | "Reviewed"; };
type Recipient = { id: string; name: string; role: string; email: string; phone: string; channels: Channel[]; active: boolean; };
type Policy = { id: string; name: string; eventType: string; severity: Severity; recipients: string[]; channels: Channel[]; enabled: boolean; };

const boilerExamples: Record<Exclude<BoilerEventType, "custom">, {title:string; severity:Severity; note:string}> = {
  "temperature.high": { title: "Boiler temperature above configured limit", severity: "Warning", note: "Use the site-approved temperature threshold." },
  "pressure.high": { title: "Boiler pressure above configured limit", severity: "Critical", note: "Use the manufacturer/site-approved pressure threshold." },
  "water_level.low": { title: "Boiler water level below configured limit", severity: "Critical", note: "Confirm the level sensor and local low-water cutoff design." },
  "burner.ignition_failure": { title: "Burner ignition failure signal received", severity: "Critical", note: "Requires a real controller/fault signal; do not infer from temperature alone." },
  "pump.fault": { title: "Feedwater pump fault signal received", severity: "Critical", note: "Requires a controller, fault-code, or suitable feedback signal." },
  "device.offline": { title: "Boiler gateway stopped reporting", severity: "Warning", note: "Set an offline timeout appropriate to the connection interval." },
};
const initialEvents: EventRecord[] = [
  { id:"evt-1004", source:"Boiler Gateway", eventType:"pressure.high", severity:"Critical", title:"Boiler pressure above configured limit", asset:"Boiler-01", receivedAt:"Just now", status:"New" },
  { id:"evt-1003", source:"Boiler Gateway", eventType:"temperature.high", severity:"Warning", title:"Boiler temperature above configured limit", asset:"Boiler-01", receivedAt:"4 min ago", status:"New" },
  { id:"evt-1002", source:"Controller", eventType:"pump.fault", severity:"Critical", title:"Feedwater pump fault signal received", asset:"Boiler-02", receivedAt:"18 min ago", status:"Reviewed" },
];
const initialRecipients: Recipient[] = [
  {id:"rec-1",name:"Priya Raman",role:"Boiler Operator",email:"operator@example.com",phone:"+1 555 010 0101",channels:["Email","In-app"],active:true},
  {id:"rec-2",name:"Arun Kumar",role:"Maintenance Technician",email:"maintenance@example.com",phone:"+1 555 010 0102",channels:["Email","SMS"],active:true},
  {id:"rec-3",name:"Facility Manager",role:"Facility Manager",email:"manager@example.com",phone:"+1 555 010 0103",channels:["Email","SMS"],active:true},
];
const initialPolicies: Policy[] = [
  {id:"pol-1",name:"Critical boiler events",eventType:"All critical events",severity:"Critical",recipients:["rec-1","rec-2","rec-3"],channels:["Email","SMS","In-app"],enabled:true},
  {id:"pol-2",name:"Boiler warnings",eventType:"All warning events",severity:"Warning",recipients:["rec-1"],channels:["Email","In-app"],enabled:true},
];
const severityStyle: Record<Severity,string> = { Critical:"bg-rose-400/10 text-rose-300 ring-1 ring-rose-400/20", Warning:"bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/20", Info:"bg-sky-400/10 text-sky-300 ring-1 ring-sky-400/20" };
const inputClass = "mt-1.5 w-full rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-300/50";
const buttonClass = "rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-200";
type Tab = "events" | "recipients" | "policies";

export default function App() {
  const [tab,setTab] = useState<Tab>("events");
  const [events,setEvents] = useState(initialEvents);
  const [recipients,setRecipients] = useState(initialRecipients);
  const [policies,setPolicies] = useState(initialPolicies);
  const [search,setSearch] = useState("");
  const [severity,setSeverity] = useState("All");
  const [showEventForm,setShowEventForm] = useState(false);
  const [showRecipientForm,setShowRecipientForm] = useState(false);
  const [eventType,setEventType] = useState<BoilerEventType>("pressure.high");
  const [eventTitle,setEventTitle] = useState(boilerExamples["pressure.high"].title);
  const [eventSeverity,setEventSeverity] = useState<Severity>("Critical");
  const [asset,setAsset] = useState("Boiler-01");
  const [recipientName,setRecipientName] = useState("");
  const [recipientRole,setRecipientRole] = useState("Boiler Operator");
  const [recipientEmail,setRecipientEmail] = useState("");
  const [recipientPhone,setRecipientPhone] = useState("");
  const [recipientChannels,setRecipientChannels] = useState<Channel[]>(["Email","In-app"]);
  const [formError,setFormError] = useState("");

  const filtered = useMemo(()=>events.filter(e=>[e.title,e.eventType,e.asset,e.source].join(" ").toLowerCase().includes(search.toLowerCase()) && (severity==="All" || e.severity===severity)),[events,search,severity]);
  const criticalCount = events.filter(e=>e.severity==="Critical" && e.status==="New").length;
  const newCount = events.filter(e=>e.status==="New").length;

  function selectEventType(value: BoilerEventType) {
    setEventType(value);
    if(value!=="custom"){setEventTitle(boilerExamples[value].title);setEventSeverity(boilerExamples[value].severity);}
    else {setEventTitle("");setEventSeverity("Warning");}
  }
  function addEvent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setFormError("");
    if(!eventTitle.trim() || !asset.trim()){setFormError("Event title and asset are required.");return;}
    const record:EventRecord={id:`evt-${Date.now().toString().slice(-6)}`,source:"Manual Test Event",eventType,title:eventTitle.trim(),severity:eventSeverity,asset:asset.trim(),receivedAt:"Just now",status:"New"};
    setEvents(current=>[record,...current]); setShowEventForm(false); setTab("events");
  }
  function addRecipient(e:React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setFormError("");
    if(!recipientName.trim() || (!recipientEmail.trim() && !recipientPhone.trim())){setFormError("Enter a name and at least one email address or phone number.");return;}
    const r:Recipient={id:`rec-${Date.now()}`,name:recipientName.trim(),role:recipientRole,email:recipientEmail.trim(),phone:recipientPhone.trim(),channels:recipientChannels,active:true};
    setRecipients(current=>[...current,r]);setRecipientName("");setRecipientEmail("");setRecipientPhone("");setRecipientChannels(["Email","In-app"]);setShowRecipientForm(false);
  }
  function toggleRecipientChannel(channel:Channel){setRecipientChannels(old=>old.includes(channel)?old.filter(c=>c!==channel):[...old,channel]);}
  function togglePolicy(id:string){setPolicies(old=>old.map(p=>p.id===id?{...p,enabled:!p.enabled}:p));}
  function toggleRecipient(id:string){setRecipients(old=>old.map(r=>r.id===id?{...r,active:!r.active}:r));}
  const nav: {id:Tab;label:string;icon:React.ReactNode}[]=[{id:"events",label:"Incoming Events",icon:<Activity size={17}/>},{id:"recipients",label:"Recipients",icon:<Users size={17}/>},{id:"policies",label:"Routing Policies",icon:<GitBranch size={17}/>}];

  return <div className="min-h-screen bg-[#0b1220] text-slate-100">
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-[#0d1525] p-5 lg:block">
      <div className="flex items-center gap-3 pb-9 pt-2"><div className="rounded-xl bg-cyan-400/10 p-2 text-cyan-300"><Waves size={22}/></div><div><div className="font-semibold tracking-tight">AEP Console</div><div className="text-xs text-slate-500">Notification Engine</div></div></div>
      <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[.2em] text-slate-500">Boiler workspace</div>
      {nav.map(n=><button key={n.id} onClick={()=>{setTab(n.id);setFormError("");}} className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm ${tab===n.id?"border border-cyan-300/20 bg-cyan-300/10 text-cyan-200":"text-slate-400 hover:bg-white/5"}`}>{n.icon}{n.label}<span className="ml-auto text-xs">{n.id==="events"?events.length:n.id==="recipients"?recipients.length:policies.length}</span></button>)}
      <div className="absolute bottom-5 left-5 right-5 rounded-xl border border-white/10 bg-white/[.03] p-3 text-xs leading-5 text-slate-500">Prototype mode<br/><span className="text-slate-400">Browser state only · no real messages sent</span></div>
    </aside>
    <main className="lg:ml-64">
      <header className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-8"><div className="text-sm text-slate-400">Boiler workspace <span className="mx-2 text-slate-700">/</span><span className="text-slate-100">{nav.find(n=>n.id===tab)?.label}</span></div><div className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-400">Local prototype</div></header>
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/5 px-3 py-1 text-xs text-cyan-200"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300"/>{tab==="events"?"Event intake":tab==="recipients"?"Contact directory":"Notification routing"}</div><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{nav.find(n=>n.id===tab)?.label}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{tab==="events"?"Create realistic boiler test events and inspect incoming event records.":tab==="recipients"?"Manage the people who should receive boiler alerts and choose their available channels.":"Define which severity level is routed to which active recipients and channels."}</p></div>
        {tab==="events"?<button onClick={()=>{setShowEventForm(!showEventForm);setFormError("");}} className={buttonClass}><span className="inline-flex items-center gap-2"><Plus size={17}/>{showEventForm?"Close form":"Create boiler event"}</span></button>:tab==="recipients"?<button onClick={()=>{setShowRecipientForm(!showRecipientForm);setFormError("");}} className={buttonClass}><span className="inline-flex items-center gap-2"><Plus size={17}/>{showRecipientForm?"Close form":"Add recipient"}</span></button>:null}</div>

        {tab==="events"&&<><section className="mt-8 grid gap-4 sm:grid-cols-3"><Metric label="Events received" value={String(events.length).padStart(2,"0")} detail="Sample and manual events" icon={<Activity size={18}/>} /><Metric label="New events" value={String(newCount).padStart(2,"0")} detail="Awaiting review" icon={<BellRing size={18}/>} /><Metric label="Critical events" value={String(criticalCount).padStart(2,"0")} detail="New critical severity" icon={<CircleAlert size={18}/>} /></section>
        {showEventForm&&<form onSubmit={addEvent} className="mt-6 grid gap-4 rounded-2xl border border-cyan-300/20 bg-[#101c2f] p-5 md:grid-cols-2"><div className="md:col-span-2"><h2 className="font-semibold">Create boiler test event</h2><p className="mt-1 text-xs text-slate-400">Select a common boiler event; title and suggested severity are prefilled. These are test records, not live sensor readings.</p></div>
          <Field label="Boiler event type"><select value={eventType} onChange={e=>selectEventType(e.target.value as BoilerEventType)} className={inputClass}><option value="pressure.high">High pressure</option><option value="temperature.high">High temperature</option><option value="water_level.low">Low water level</option><option value="burner.ignition_failure">Burner ignition failure signal</option><option value="pump.fault">Feedwater pump fault</option><option value="device.offline">Gateway offline</option><option value="custom">Custom event</option></select></Field>
          <Field label="Asset name"><input value={asset} onChange={e=>setAsset(e.target.value)} placeholder="Boiler-01" className={inputClass} required/></Field>
          <Field label="Event title"><input value={eventTitle} onChange={e=>setEventTitle(e.target.value)} className={inputClass} required/></Field>
          <Field label="Severity"><select value={eventSeverity} onChange={e=>setEventSeverity(e.target.value as Severity)} className={inputClass}><option>Critical</option><option>Warning</option><option>Info</option></select></Field>
          {eventType!=="custom"&&<p className="md:col-span-2 rounded-xl bg-white/[.03] p-3 text-xs leading-5 text-slate-400">{boilerExamples[eventType].note}</p>}
          {formError&&<p className="md:col-span-2 text-sm text-rose-300">{formError}</p>}<div className="md:col-span-2 flex gap-2"><button className={buttonClass} type="submit">Create test event</button><button type="button" onClick={()=>setShowEventForm(false)} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300">Cancel</button></div></form>}
        <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-[#101827]"><div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold">Boiler event stream</h2><p className="mt-1 text-xs text-slate-500">Newest events appear first</p></div><div className="flex flex-col gap-3 sm:flex-row"><label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/10 px-3 py-2"><Search size={16} className="text-slate-500"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search events..." className="w-full bg-transparent text-sm outline-none placeholder:text-slate-600 sm:w-48"/></label><select value={severity} onChange={e=>setSeverity(e.target.value)} className={inputClass+" mt-0 sm:w-36"}><option>All</option><option>Critical</option><option>Warning</option><option>Info</option></select></div></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-white/[.025] text-[11px] uppercase tracking-wider text-slate-500"><tr>{["Event","Type","Severity","Asset / Source","Received","Status"].map(h=><th key={h} className="px-5 py-3 font-medium">{h}</th>)}</tr></thead><tbody className="divide-y divide-white/[.06]">{filtered.map(e=><tr key={e.id} className="hover:bg-white/[.025]"><td className="px-5 py-4"><div className="font-medium text-slate-200">{e.title}</div><div className="mt-1 text-xs text-slate-500">{e.id}</div></td><td className="px-5 py-4 font-mono text-xs text-slate-400">{e.eventType}</td><td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${severityStyle[e.severity]}`}>{e.severity}</span></td><td className="px-5 py-4"><div className="text-slate-300">{e.asset}</div><div className="mt-1 text-xs text-slate-500">{e.source}</div></td><td className="px-5 py-4 text-slate-400">{e.receivedAt}</td><td className="px-5 py-4"><span className={e.status==="New"?"rounded-md bg-violet-400/10 px-2 py-1 text-xs text-violet-300":"rounded-md bg-white/5 px-2 py-1 text-xs text-slate-400"}>{e.status}</span></td></tr>)}{filtered.length===0&&<tr><td colSpan={6} className="px-5 py-12 text-center text-slate-500">No events match these filters.</td></tr>}</tbody></table></div><div className="border-t border-white/10 px-5 py-3 text-xs text-slate-500">Showing {filtered.length} of {events.length} events</div></section></>}

        {tab==="recipients"&&<><section className="mt-8 grid gap-4 sm:grid-cols-3"><Metric label="Recipients" value={String(recipients.length).padStart(2,"0")} detail="Contacts in this workspace" icon={<Users size={18}/>} /><Metric label="Active" value={String(recipients.filter(r=>r.active).length).padStart(2,"0")} detail="Eligible for routing" icon={<ShieldCheck size={18}/>} /><Metric label="SMS enabled" value={String(recipients.filter(r=>r.active&&r.channels.includes("SMS")).length).padStart(2,"0")} detail="Phone number required for real delivery" icon={<Phone size={18}/>} /></section>
        {showRecipientForm&&<form onSubmit={addRecipient} className="mt-6 grid gap-4 rounded-2xl border border-cyan-300/20 bg-[#101c2f] p-5 md:grid-cols-2"><div className="md:col-span-2"><h2 className="font-semibold">Add notification recipient</h2><p className="mt-1 text-xs text-slate-400">Add a person/contact and choose the channels they can receive. No messages are sent from this prototype.</p></div>
          <Field label="Full name"><input value={recipientName} onChange={e=>setRecipientName(e.target.value)} className={inputClass} placeholder="e.g. Priya Raman" required/></Field>
          <Field label="Role"><select value={recipientRole} onChange={e=>setRecipientRole(e.target.value)} className={inputClass}><option>Boiler Operator</option><option>Maintenance Technician</option><option>Facility Manager</option><option>On-call Engineer</option></select></Field>
          <Field label="Email address"><input type="email" value={recipientEmail} onChange={e=>setRecipientEmail(e.target.value)} className={inputClass} placeholder="person@example.com"/></Field>
          <Field label="Phone number"><input value={recipientPhone} onChange={e=>setRecipientPhone(e.target.value)} className={inputClass} placeholder="+1 555 010 0101"/></Field>
          <div className="md:col-span-2"><div className="mb-2 text-xs font-medium text-slate-400">Available channels</div><div className="flex flex-wrap gap-2">{(["Email","SMS","In-app"] as Channel[]).map(c=><button key={c} type="button" onClick={()=>toggleRecipientChannel(c)} className={`rounded-xl border px-3 py-2 text-sm ${recipientChannels.includes(c)?"border-cyan-300/30 bg-cyan-300/10 text-cyan-200":"border-white/10 text-slate-400"}`}>{c==="Email"?<Mail className="mr-2 inline" size={15}/>:c==="SMS"?<Phone className="mr-2 inline" size={15}/>:<MessageSquare className="mr-2 inline" size={15}/>} {c}</button>)}</div></div>
          {formError&&<p className="md:col-span-2 text-sm text-rose-300">{formError}</p>}<div className="md:col-span-2"><button className={buttonClass} type="submit">Save recipient</button></div></form>}
        <div className="mt-8 grid gap-4 xl:grid-cols-2">{recipients.map(r=><article key={r.id} className="rounded-2xl border border-white/10 bg-[#101827] p-5"><div className="flex items-start justify-between gap-4"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-300/10 font-semibold text-cyan-200">{r.name.split(" ").map(p=>p[0]).slice(0,2).join("")}</div><div><h3 className="font-semibold">{r.name}</h3><p className="mt-1 text-xs text-slate-500">{r.role}</p></div></div><button onClick={()=>toggleRecipient(r.id)} className={`rounded-full px-3 py-1 text-xs ${r.active?"bg-emerald-400/10 text-emerald-300":"bg-white/5 text-slate-500"}`}>{r.active?"Active":"Inactive"}</button></div><div className="mt-5 space-y-2 text-sm text-slate-400"><div className="flex items-center gap-2"><Mail size={15}/>{r.email||"No email added"}</div><div className="flex items-center gap-2"><Phone size={15}/>{r.phone||"No phone added"}</div></div><div className="mt-4 flex flex-wrap gap-2">{r.channels.map(c=><span key={c} className="rounded-lg border border-white/10 px-2.5 py-1 text-xs text-slate-300">{c}</span>)}</div></article>)}</div></>}

        {tab==="policies"&&<><section className="mt-8 grid gap-4 sm:grid-cols-3"><Metric label="Policies" value={String(policies.length).padStart(2,"0")} detail="Routing configurations" icon={<GitBranch size={18}/>} /><Metric label="Enabled" value={String(policies.filter(p=>p.enabled).length).padStart(2,"0")} detail="Currently active in prototype" icon={<ShieldCheck size={18}/>} /><Metric label="Active recipients" value={String(recipients.filter(r=>r.active).length).padStart(2,"0")} detail="Available contacts" icon={<Users size={18}/>} /></section><div className="mt-8 space-y-4">{policies.map(p=><article key={p.id} className="rounded-2xl border border-white/10 bg-[#101827] p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{p.name}</h3><span className={`rounded-full px-2.5 py-1 text-xs ${severityStyle[p.severity]}`}>{p.severity}</span></div><p className="mt-2 text-sm text-slate-400">Match: {p.eventType}</p><p className="mt-1 text-xs text-slate-500">{p.recipients.map(id=>recipients.find(r=>r.id===id)?.name).filter(Boolean).join(", ")||"No assigned recipients"}</p><div className="mt-3 flex flex-wrap gap-2">{p.channels.map(c=><span key={c} className="rounded-lg border border-white/10 px-2.5 py-1 text-xs text-slate-300">{c}</span>)}</div></div><button onClick={()=>togglePolicy(p.id)} className={`rounded-xl px-4 py-2 text-sm ${p.enabled?"bg-emerald-400/10 text-emerald-300":"bg-white/5 text-slate-400"}`}>{p.enabled?"Enabled · click to disable":"Disabled · click to enable"}</button></div></article>)}</div><p className="mt-4 rounded-xl border border-amber-300/10 bg-amber-300/5 p-4 text-xs leading-5 text-amber-100/70">Routing policies are currently illustrative UI configuration. Event-to-recipient matching and actual email/SMS delivery are not wired up yet.</p></>}
        <p className="mt-8 text-xs text-slate-600">Prototype data lives in browser memory and resets on refresh. No real notifications are sent. Boiler thresholds must be approved for the specific installation.</p>
      </div>
    </main>
  </div>;
}
function Field({label,children}:{label:string;children:React.ReactNode}){return <label className="block text-xs font-medium text-slate-400">{label}{children}</label>}
function Metric({label,value,detail,icon}:{label:string;value:string;detail:string;icon:React.ReactNode}){return <div className="rounded-2xl border border-white/10 bg-[#101827] p-5"><div className="flex items-center justify-between text-slate-400"><span className="text-sm">{label}</span><span className="rounded-lg bg-white/5 p-2">{icon}</span></div><div className="mt-5 text-3xl font-semibold tracking-tight">{value}</div><div className="mt-1 text-xs text-slate-500">{detail}</div></div>}
