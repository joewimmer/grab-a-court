export const OPERATING_HOURS = {
  open: '07:00',
  close: '21:00',
} as const;

export const PORT = Number(process.env.PORT ?? 3001);
