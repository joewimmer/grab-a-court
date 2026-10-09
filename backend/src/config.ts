export const OPERATING_HOURS = {
  open: '07:00',
  close: '21:00',
} as const;

/** Longest single reservation, in minutes. Exactly this length is allowed. */
export const MAX_BOOKING_MINUTES = 3 * 60;

export const PORT = Number(process.env.PORT ?? 3001);
