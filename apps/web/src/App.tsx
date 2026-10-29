import { useMemo, useState } from "react";
import { Activity, BellRing, CircleAlert, Plus, Search, ShieldCheck, Waves } from "lucide-react";

type Severity = "Critical" | "Warning" | "Info";
type EventRecord = {
  id: string;
  source: string;
  eventType: string;
  severity: Severity;
  title: string;
  asset: string;
  receivedAt: string;
  status: "New" | "Reviewed";
};

const initialEvents: EventRecord[] = [
  { id: "evt-1004", source: "Boiler Gateway", eventType: "pressure.high", severity: "Critical", title: "Boiler pressure above configured threshold", asset: "Boiler-01", receivedAt: "Just now", status: "New" },
  { id: "evt-1003", source: "Boiler Gateway", eventType: "temperature.high", severity: "Warning", title: "Outlet temperature trending above normal", asset: "Boiler-01", receivedAt: "4 min ago", status: "New" },
  { id: "evt-1002", source: "Pump Gateway", eventType: "pump.runtime", severity: "Info", title: "Pump runtime summary received", asset: "Pump-12", receivedAt: "18 min ago", status: "Reviewed" },
];

const severityStyle: Record<Severity, string> = {
  Critical: "bg-rose-400/10 text-rose-300 ring-1 ring-rose-400/20",
  Warning: "bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/20",
  Info: "bg-sky-400/10 text-sky-300 ring-1 ring-sky-400/20",
};

export default function App() {
  const [events, setEvents] = useState(initialEvents);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("custom.sample");
  const [newSeverity, setNewSeverity] = useState<Severity>("Warning");
  const [asset, setAsset] = useState("Boiler-01");

  const filtered = useMemo(() => events.filter((event) => {
    const matchesSearch = [event.title, event.eventType, event.asset, event.source].join(" ").toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (severity === "All" || event.severity === severity);
  }), [events, search, severity]);

  function addEvent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) return;
    setEvents((current) => [{
      id: `evt-${Date.now().toString().slice(-6)}`,
      source: "Manual Entry",
      eventType,
      severity: newSeverity,
      title: title.trim(),
      asset: asset.trim() || "Unassigned",
      receivedAt: "Just now",
      status: "New",
    }, ...current]);
    setTitle("");
    setShowForm(false);
  }

  const criticalCount = events.filter((event) => event.severity === "Critical" && event.status === "New").length;
  const newCount = events.filter((event) => event.status === "New").length;

  return (
    <div className="min-h-screen bg-[#0b1220] text-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-[#0d1525] p-5 lg:block">
        <div className="flex items-center gap-3 pb-9 pt-2">
          <div className="rounded-xl bg-cyan-400/10 p-2 text-cyan-300"><Waves size={22} /></div>
          <div><div className="font-semibold tracking-tight">AEP Console</div><div className="text-xs text-slate-500">Notification Engine</div></div>
        </div>
        <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[.2em] text-slate-500">Workspace</div>
        <div className="flex items-center gap-3 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-3 text-sm text-cyan-200"><Activity size={17} /> Incoming Events <span className="ml-auto rounded-md bg-cyan-200/10 px-2 py-0.5 text-xs">{events.length}</span></div>
        <div className="mt-3 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-500"><BellRing size={17} /> Routing Policies <span className="ml-auto text-xs">Soon</span></div>
        <div className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-500"><ShieldCheck size={17} /> Delivery History <span className="ml-auto text-xs">Soon</span></div>
        <div className="absolute bottom-5 left-5 right-5 rounded-xl border border-white/10 bg-white/[.03] p-3 text-xs leading-5 text-slate-500">Prototype mode<br/><span className="text-slate-400">Sample data only · no real messages sent</span></div>
      </aside>

      <main className="lg:ml-64">
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-8">
          <div className="text-sm text-slate-400">Workspace <span className="mx-2 text-slate-700">/</span><span className="text-slate-100">Incoming Events</span></div>
          <div className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-400">Local prototype</div>
        </header>

        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/5 px-3 py-1 text-xs text-cyan-200"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300" /> Event intake</div><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Incoming Events</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">Inspect events arriving from connected assets and add sample events while building the routing workflow.</p></div>
            <button onClick={() => setShowForm((open) => !open)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-200"><Plus size={17}/>{showForm ? "Close form" : "Add sample event"}</button>
          </div>

          <section className="mt-8 grid gap-4 sm:grid-cols-3">
            <Metric label="Events received" value={String(events.length).padStart(2, "0")} detail="Sample and manual events" icon={<Activity size={18}/>} />
            <Metric label="New events" value={String(newCount).padStart(2, "0")} detail="Awaiting review" icon={<BellRing size={18}/>} />
            <Metric label="Critical events" value={String(criticalCount).padStart(2, "0")} detail="New critical severity" icon={<CircleAlert size={18}/>} />
          </section>

          {showForm && <form onSubmit={addEvent} className="mt-6 grid gap-4 rounded-2xl border border-cyan-300/20 bg-[#101c2f] p-5 md:grid-cols-2">
            <div className="md:col-span-2"><h2 className="font-semibold">Create a sample event</h2><p className="mt-1 text-xs text-slate-400">This currently changes browser state only. Database persistence comes next.</p></div>
            <Field label="Event title"><input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Water level above threshold" className={inputClass}/></Field>
            <Field label="Event type"><input required value={eventType} onChange={(e) => setEventType(e.target.value)} className={inputClass}/></Field>
            <Field label="Severity"><select value={newSeverity} onChange={(e) => setNewSeverity(e.target.value as Severity)} className={inputClass}><option>Critical</option><option>Warning</option><option>Info</option></select></Field>
            <Field label="Asset"><input value={asset} onChange={(e) => setAsset(e.target.value)} className={inputClass}/></Field>
            <div className="md:col-span-2"><button className="rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-200" type="submit">Add event</button></div>
          </form>}

          <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-[#101827]">
            <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div><h2 className="font-semibold">Event stream</h2><p className="mt-1 text-xs text-slate-500">Newest events appear first</p></div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/10 px-3 py-2"><Search size={16} className="text-slate-500"/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events..." className="w-full bg-transparent text-sm outline-none placeholder:text-slate-600 sm:w-48"/></label>
                <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-sm outline-none"><option>All</option><option>Critical</option><option>Warning</option><option>Info</option></select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-white/[.025] text-[11px] uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3 font-medium">Event</th><th className="px-5 py-3 font-medium">Type</th><th className="px-5 py-3 font-medium">Severity</th><th className="px-5 py-3 font-medium">Asset / Source</th><th className="px-5 py-3 font-medium">Received</th><th className="px-5 py-3 font-medium">Status</th></tr></thead>
                <tbody className="divide-y divide-white/[.06]">
                  {filtered.map((event) => <tr key={event.id} className="hover:bg-white/[.025]"><td className="px-5 py-4"><div className="font-medium text-slate-200">{event.title}</div><div className="mt-1 text-xs text-slate-500">{event.id}</div></td><td className="px-5 py-4 font-mono text-xs text-slate-400">{event.eventType}</td><td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${severityStyle[event.severity]}`}>{event.severity}</span></td><td className="px-5 py-4"><div className="text-slate-300">{event.asset}</div><div className="mt-1 text-xs text-slate-500">{event.source}</div></td><td className="px-5 py-4 text-slate-400">{event.receivedAt}</td><td className="px-5 py-4"><span className={event.status === "New" ? "rounded-md bg-violet-400/10 px-2 py-1 text-xs text-violet-300" : "rounded-md bg-white/5 px-2 py-1 text-xs text-slate-400"}>{event.status}</span></td></tr>)}
                  {filtered.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-500">No events match these filters.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="border-t border-white/10 px-5 py-3 text-xs text-slate-500">Showing {filtered.length} of {events.length} events</div>
          </section>
        </div>
      </main>
    </div>
  );
}

const inputClass = "mt-1.5 w-full rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-300/50";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-slate-400">{label}{children}</label>;
}

function Metric({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: React.ReactNode }) {
  return <div className="rounded-2xl border border-white/10 bg-[#101827] p-5"><div className="flex items-center justify-between text-slate-400"><span className="text-sm">{label}</span><span className="rounded-lg bg-white/5 p-2">{icon}</span></div><div className="mt-5 text-3xl font-semibold tracking-tight">{value}</div><div className="mt-1 text-xs text-slate-500">{detail}</div></div>;
}
