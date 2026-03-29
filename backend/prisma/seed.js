import pkg from "@prisma/client";
import "dotenv/config";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // 🔹 1. Create default user
  const user = await prisma.user.upsert({
    where: { email: "john@example.com" },
    update: {},
    create: {
      name: "John Doe",
      email: "john@example.com",
      timezone: "Asia/Kolkata",
    },
  });

  console.log(`✅ User created: ${user.name} (${user.id})`);

  // 🔹 2. Create event types
  const events = [
    {
      title: "Quick Chat",
      description: "A short 15-minute introductory call to get to know each other.",
      duration: 15,
      slug: "quick-chat",
    },
    {
      title: "1:1 Meeting",
      description: "A focused 30-minute one-on-one meeting to discuss specific topics.",
      duration: 30,
      slug: "one-on-one",
    },
    {
      title: "Team Sync",
      description: "A 60-minute team sync session for project updates and planning.",
      duration: 60,
      slug: "team-sync",
    },
  ];

  const createdEvents = [];

  for (const event of events) {
    const created = await prisma.eventType.upsert({
      where: { slug: event.slug },
      update: {},
      create: {
        ...event,
        userId: user.id,
      },
    });
    createdEvents.push(created);
    console.log(`✅ Event type created: ${created.title} (/${created.slug})`);
  }

  // 🔹 3. Set availability (Mon-Fri, 9 AM - 5 PM)
  const weekdays = [1, 2, 3, 4, 5]; // Monday to Friday

  for (const day of weekdays) {
    await prisma.availability.upsert({
      where: {
        userId_dayOfWeek: {
          userId: user.id,
          dayOfWeek: day,
        },
      },
      update: {
        startTime: "09:00",
        endTime: "17:00",
      },
      create: {
        userId: user.id,
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "17:00",
      },
    });
  }

  console.log("✅ Availability set: Mon-Fri, 09:00 - 17:00");

  // 🔹 4. Create sample bookings
  const now = new Date();

  // Helper: get next weekday date from today
  const getNextWeekday = (daysFromNow) => {
    const date = new Date(now);
    date.setDate(date.getDate() + daysFromNow);
    // Skip weekends
    while (date.getUTCDay() === 0 || date.getUTCDay() === 6) {
      date.setDate(date.getDate() + 1);
    }
    return date;
  };

  // Helper: create a datetime at a specific hour (UTC)
  const makeDateTime = (baseDate, hour, minute = 0) => {
    const d = new Date(baseDate);
    d.setUTCHours(hour, minute, 0, 0);
    return d;
  };

  const bookingsData = [
    // Upcoming bookings
    {
      name: "Alice Johnson",
      email: "alice@example.com",
      eventIndex: 0, // Quick Chat (15 min)
      daysFromNow: 1,
      hour: 10,
      status: "booked",
    },
    {
      name: "Bob Smith",
      email: "bob@example.com",
      eventIndex: 1, // 1:1 Meeting (30 min)
      daysFromNow: 2,
      hour: 14,
      status: "booked",
    },
    {
      name: "Carol Williams",
      email: "carol@example.com",
      eventIndex: 2, // Team Sync (60 min)
      daysFromNow: 3,
      hour: 11,
      status: "booked",
    },
    // Past booking
    {
      name: "Dave Brown",
      email: "dave@example.com",
      eventIndex: 1, // 1:1 Meeting (30 min)
      daysFromNow: -2,
      hour: 15,
      status: "completed",
    },
    // Cancelled booking
    {
      name: "Eve Davis",
      email: "eve@example.com",
      eventIndex: 0, // Quick Chat
      daysFromNow: -1,
      hour: 9,
      status: "cancelled",
    },
  ];

  for (const b of bookingsData) {
    const event = createdEvents[b.eventIndex];
    const baseDate = getNextWeekday(b.daysFromNow);
    const startTime = makeDateTime(baseDate, b.hour);
    const endTime = new Date(startTime.getTime() + event.duration * 60000);

    await prisma.booking.create({
      data: {
        name: b.name,
        email: b.email,
        eventTypeId: event.id,
        startTime,
        endTime,
        status: b.status,
      },
    });

    console.log(
      `✅ Booking created: ${b.name} → ${event.title} (${b.status})`
    );
  }

  console.log("\n🎉 Seeding complete!");
  console.log(`\n📋 Default User ID: ${user.id}`);
  console.log("Use this ID in your frontend as the default logged-in user.\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
