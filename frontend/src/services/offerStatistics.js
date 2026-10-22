const ONE_DAY = 24 * 60 * 60 * 1000;
const CURRENT_DATE = Date.now();

function offerDate(offer) {
  return Date.parse(`${offer.createdAt.slice(0, 10)}T00:00:00Z`);
}

function dayLabel(data) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  }).format(data);
}

export function summarizeOffers(offers, period) {
  const dates = offers.map(offerDate);
  const endDate = dates.length ? Math.max(...dates) : CURRENT_DATE;
  const reference = new Date(Math.floor(endDate / ONE_DAY) * ONE_DAY);
  const year = reference.getUTCFullYear();
  const month = reference.getUTCMonth();
  const exclusiveEnd = reference.getTime() + ONE_DAY;

  let intervals;
  let description;

  if (period === "mes") {
    const count = Math.ceil(reference.getUTCDate() / 7);
    intervals = Array.from({ length: count }, (_, index) => {
      const start = Date.UTC(year, month, 1 + index * 7);
      const end = Math.min(start + 7 * ONE_DAY, exclusiveEnd);
      const lastDay = new Date(end - ONE_DAY).getUTCDate();
      return { start, end, label: `${new Date(start).getUTCDate()}–${lastDay}` };
    });
    description = "Acumulado no mês, por semana";
  } else if (period === "semestre") {
    intervals = Array.from({ length: 6 }, (_, index) => {
      const start = Date.UTC(year, month - 5 + index, 1);
      const end = Math.min(Date.UTC(year, month - 4 + index, 1), exclusiveEnd);
      const label = new Intl.DateTimeFormat("pt-BR", { month: "short", timeZone: "UTC" })
        .format(new Date(start)).replace(".", "");
      return { start, end, label };
    });
    description = "Acumulado no semestre, por mês";
  } else {
    intervals = Array.from({ length: 7 }, (_, index) => {
      const start = reference.getTime() - (6 - index) * ONE_DAY;
      return { start, end: start + ONE_DAY, label: dayLabel(new Date(start)) };
    });
    description = "Acumulado na semana, por dia";
  }

  const totals = { created: 0, accepted: 0, rejected: 0 };
  const columns = intervals.map(({ start, end, label }) => {
    const intervalOffers = offers.filter((offer) => {
      const data = offerDate(offer);
      return data >= start && data < end;
    });
    totals.created += intervalOffers.length;
    totals.accepted += intervalOffers.filter((offer) => ["Aceita", "Liquidada"].includes(offer.status)).length;
    totals.rejected += intervalOffers.filter((offer) => offer.status === "Negada").length;
    return { label, ...totals };
  });

  return { columns, totals: { ...totals }, description };
}
