import prisma from "../config/prisma.js";

// 🔹 helper: convert "HH:MM" → minutes
const toMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

export const createBooking = async (req, res) => {
  try {
    const { eventTypeId, startTime, endTime, name, email } = req.body;

    // 🔹 1. Validation
    if (!eventTypeId || !startTime || !endTime || !name || !email) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: eventTypeId, startTime, endTime, name, email",
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({
        success: false,
        message: "Invalid DateTime format (use ISO format)",
      });
    }

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: "startTime must be before endTime",
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

    // 🔹 3. Enforce duration
    const expectedEnd = new Date(
      start.getTime() + event.duration * 60000
    );

    if (end.getTime() !== expectedEnd.getTime()) {
      return res.status(400).json({
        success: false,
        message: `Invalid duration. Expected ${event.duration} minutes`,
      });
    }

    // 🔹 4. Availability check
    const dayOfWeek = start.getUTCDay();

    const availability = await prisma.availability.findUnique({
      where: {
        userId_dayOfWeek: {
          userId: event.userId,
          dayOfWeek,
        },
      },
    });

    if (!availability) {
      return res.status(400).json({
        success: false,
        message: "User not available on this day",
      });
    }

    const startMinutes =
      start.getUTCHours() * 60 + start.getUTCMinutes();
    const endMinutes =
      end.getUTCHours() * 60 + end.getUTCMinutes();

    const availStart = toMinutes(availability.startTime);
    const availEnd = toMinutes(availability.endTime);

    if (startMinutes < availStart || endMinutes > availEnd) {
      return res.status(400).json({
        success: false,
        message: "Booking outside available hours",
      });
    }

    // 🔥 5. Transaction (conflict-safe)
    const booking = await prisma.$transaction(async (tx) => {
      const conflict = await tx.booking.findFirst({
        where: {
          eventTypeId,
          AND: [
            { startTime: { lt: end } },
            { endTime: { gt: start } },
          ],
        },
      });

      if (conflict) {
        throw new Error("SLOT_TAKEN");
      }

      return await tx.booking.create({
        data: {
          eventTypeId,
          startTime: start,
          endTime: end,
          name,
          email,
        },
      });
    });

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Create Booking Error:", error);

    if (error.message === "SLOT_TAKEN") {
      return res.status(409).json({
        success: false,
        message: "Time slot already booked",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getBookingsByEventType = async (req, res) => {
  try {
    const { eventTypeId } = req.params;

    const bookings = await prisma.booking.findMany({
      where: { eventTypeId },
      orderBy: { startTime: "asc" },
    });

    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Get Bookings by EventType Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getBookingsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const bookings = await prisma.booking.findMany({
      where: { eventType: { userId } },
      orderBy: { startTime: "asc" },
      include: { eventType: true },
    });

    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Get Bookings by User Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔹 1. Validate
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "id is required",
      });
    }

    // 🔹 2. Find booking
    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // 🔹 3. Prevent double cancel
    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      });
    }

    // 🔹 4. Update status
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: "cancelled",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: updatedBooking,
    });
  } catch (error) {
    console.error("Cancel Booking Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};