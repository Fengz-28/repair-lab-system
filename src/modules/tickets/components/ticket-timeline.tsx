type TimelineItem = {
  id: string;
  type: string;
  title: string;
  description?: string;
  createdAt: Date;
};

export function TicketTimeline({ items }: { items: TimelineItem[] }) {
  return (
    <section className="space-y-3 rounded-2xl border border-white/10 p-4">
      <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">Timeline</h2>
      {items.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No hay eventos registrados.</p>
      ) : (
        <ol className="space-y-3">
          {items.map((item) => (
            <li key={`${item.type}-${item.id}`} className="border-l-2 border-white/10 pl-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="break-words text-sm font-medium text-zinc-950 dark:text-zinc-50">{item.title}</p>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {item.createdAt.toLocaleString("es-CR")}
                </span>
              </div>
              {item.description ? (
                <p className="mt-1 break-words text-sm text-zinc-600 dark:text-zinc-300">{item.description}</p>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
