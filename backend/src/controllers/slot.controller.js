import prisma from "../config/prisma.js";

// 🔹 helper: HH:MM → minutes
const toMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

export const getAvailableSlots = async (req, res) => {
  try {
    const { eventTypeId, date } = req.query;

    // 🔹 1. Validation
    if (!eventTypeId || !date) {
      return res.status(400).json({
        success: false,
        message: "eventTypeId and date are required",
      });
    }

    const selectedDate = new Date(`${date}T00:00:00.000Z`);
    if (isNaN(selectedDate)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format (YYYY-MM-DD)",
      });
    }

    // 🔹 2. Get event + user
    const event = await prisma.eventType.findUnique({
      where: { id: eventTypeId },
      include: { user: true },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event type not found",
      });
    }

    // 🔹 3. Get availability
    const dayOfWeek = selectedDate.getUTCDay();

    const availability = await prisma.availability.findUnique({
      where: {
        userId_dayOfWeek: {
          userId: event.userId,
          dayOfWeek,
        },
      },
    });

    if (!availability) {
      return res.status(200).json({
        success: true,
        slots: [],
      });
    }

    const startMins = toMinutes(availability.startTime);
    const endMins = toMinutes(availability.endTime);
    const duration = event.duration;

    // 🔹 4. Generate slots (UTC-safe)
    const baseDate = new Date(`${date}T00:00:00.000Z`);
    const slots = [];

    for (let time = startMins; time + duration <= endMins; time += duration) {
      const slotStart = new Date(baseDate);
      slotStart.setUTCMinutes(time);

      const slotEnd = new Date(slotStart.getTime() + duration * 60000);

      slots.push({
        startTime: slotStart,
        endTime: slotEnd,
      });
    }

    // 🔹 5. Get existing bookings (ALL events for this user, excluding cancelled)
    const dayStart = new Date(baseDate);
    dayStart.setUTCHours(0, 0, 0, 0);

    const dayEnd = new Date(baseDate);
    dayEnd.setUTCHours(23, 59, 59, 999);

    const bookings = await prisma.booking.findMany({
      where: {
        eventType: {
          userId: event.userId,
        },
        startTime: {
          gte: dayStart,
          lte: dayEnd,
        },
        status: { not: "cancelled" },
      },
    });

    // 🔹 6. Remove past slots + conflicts
    const now = new Date();

    const availableSlots = slots.filter((slot) => {
      // remove past slots
      if (slot.startTime < now) return false;

      // remove conflicts
      return !bookings.some((booking) => {
        return (
          booking.startTime < slot.endTime &&
          booking.endTime > slot.startTime
        );
      });
    });

    // 🔹 7. Response
    return res.status(200).json({
      success: true,
      slots: availableSlots,
    });
  } catch (error) {
    console.error("Get Slots Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};