export const splitCsvQueryValue = (value: unknown): unknown =>
  typeof value === "string"
    ? value.split(",").map(item => item.trim()).filter(Boolean)
    : value;
