import { resetDatabase, getDatabase } from '../src/db/index.js';

function formatDate(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function seed() {
  console.log('Resetting and seeding database...');
  resetDatabase();
  const db = getDatabase();

  const insertMember = db.prepare(
    'INSERT INTO members (name, email, role) VALUES (?, ?, ?)',
  );
  const insertCourt = db.prepare(
    'INSERT INTO courts (name, surface_type, has_lighting, status) VALUES (?, ?, ?, ?)',
  );
  const insertReservation = db.prepare(
    `INSERT INTO reservations (court_id, member_id, reservation_date, start_time, end_time)
     VALUES (?, ?, ?, ?, ?)`,
  );

  const members = [
    ['Alex Rivera', 'alex.rivera@oakridgecc.demo', 'member'],
    ['Jordan Kim', 'jordan.kim@oakridgecc.demo', 'member'],
    ['Sam Patel', 'sam.patel@oakridgecc.demo', 'member'],
    ['Taylor Brooks', 'taylor.brooks@oakridgecc.demo', 'member'],
    ['Morgan Lee', 'morgan.lee@oakridgecc.demo', 'admin'],
  ] as const;

  for (const member of members) {
    insertMember.run(...member);
  }

  const courts = [
    ['Court 1 - Championship', 'Hard', 1, 'available'],
    ['Court 2 - Lakeside', 'Clay', 1, 'available'],
    ['Court 3 - Garden View', 'Hard', 1, 'available'],
    ['Court 4 - Pavilion', 'Hard', 0, 'available'],
    ['Court 5 - Sunrise', 'Clay', 1, 'available'],
    ['Court 6 - Terrace', 'Hard', 1, 'maintenance'],
    ['Court 7 - Willow', 'Clay', 1, 'available'],
    ['Court 8 - Summit', 'Hard', 1, 'unavailable'],
  ] as const;

  for (const court of courts) {
    insertCourt.run(...court);
  }

  const today = formatDate(0);
  const tomorrow = formatDate(1);
  const dayAfter = formatDate(2);

  const reservations = [
    [1, 1, today, '08:00', '09:30'],
    [2, 2, today, '09:00', '10:30'],
    [3, 3, today, '10:00', '11:00'],
    [5, 4, today, '14:00', '15:30'],
    [7, 1, today, '16:00', '17:00'],
    [1, 2, tomorrow, '07:30', '09:00'],
    [4, 3, tomorrow, '11:00', '12:30'],
    [7, 4, dayAfter, '18:00', '19:30'],
    [2, 1, dayAfter, '08:00', '09:00'],
  ] as const;

  for (const reservation of reservations) {
    insertReservation.run(...reservation);
  }

  console.log('Database seeded successfully.');
  console.log(`  Members: ${members.length}`);
  console.log(`  Courts: ${courts.length}`);
  console.log(`  Reservations: ${reservations.length}`);
}

seed();
