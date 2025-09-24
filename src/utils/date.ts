export const formatDateTime = (value?: string): string => {
  if (!value) return "";
  const d = new Date(value);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const sortEntriesByDateDesc = <T extends { dateTime?: string; date?: string }>(entries: T[]): T[] => {
  return [...entries].sort((a, b) => {
    const bdt = (b as any).dateTime || (b as any).date;
    const adt = (a as any).dateTime || (a as any).date;
    return new Date(bdt).getTime() - new Date(adt).getTime();
  });
};
