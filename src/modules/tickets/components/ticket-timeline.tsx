type TimelineItem = {
  id: string;
  type: string;
  title: string;
  description?: string;
  createdAt: Date;
};

export function TicketTimeline({ items }: { items: TimelineItem[] }) {
  return (
    <section className="space-y-3 rounded border border-zinc-200 p-4">
      <h2 className="text-base font-semibold text-zinc-950">Timeline</h2>
      {items.length === 0 ? (
        <p className="text-sm text-zinc-500">No hay eventos registrados.</p>
      ) : (
        <ol className="space-y-3">
          {items.map((item) => (
            <li key={`${item.type}-${item.id}`} className="border-l-2 border-zinc-200 pl-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-zinc-950">{item.title}</p>
                <span className="text-xs text-zinc-500">
                  {item.createdAt.toLocaleString("es-CR")}
                </span>
              </div>
              {item.description ? (
                <p className="mt-1 text-sm text-zinc-600">{item.description}</p>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

