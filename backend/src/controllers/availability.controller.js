import prisma from "../config/prisma.js";

// 🔹 Convert "HH:MM" → total minutes
const toMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// 🔹 Validate HH:MM format (24-hour)
const isValidTime = (time) => {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
};

// 🔹 GET all availability for a user
export const getAvailability = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    // Check user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const availability = await prisma.availability.findMany({
      where: { userId },
      orderBy: { dayOfWeek: "asc" },
    });

    return res.status(200).json({
      success: true,
      data: availability,
    });
  } catch (error) {
    console.error("Get Availability Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// 🔹 SET/UPDATE availability for a user (upsert)
export const setAvailability = async (req, res) => {
  try {
    const { userId, dayOfWeek, startTime, endTime } = req.body;

    // 🔹 1. Required fields
    if (!userId || dayOfWeek === undefined || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: userId, dayOfWeek, startTime, endTime",
      });
    }

    // 🔹 2. Validate dayOfWeek (0=Sunday → 6=Saturday)
    if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
      return res.status(400).json({
        success: false,
        message: "dayOfWeek must be 0-6 (0=Sunday, 6=Saturday)",
      });
    }

    // 🔹 3. Validate time format
    if (!isValidTime(startTime) || !isValidTime(endTime)) {
      return res.status(400).json({
        success: false,
        message: "Time must be in HH:MM format (24-hour)",
      });
    }

    // 🔹 4. Logical time validation
    if (toMinutes(startTime) >= toMinutes(endTime)) {
      return res.status(400).json({
        success: false,
        message: "startTime must be less than endTime",
      });
    }

    // 🔹 5. Check user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 🔹 6. Check if already exists (for status code correctness)
    const existing = await prisma.availability.findUnique({
      where: {
        userId_dayOfWeek: {
          userId,
          dayOfWeek,
        },
      },
    });

    // 🔹 7. Upsert availability
    const availability = await prisma.availability.upsert({
      where: {
        userId_dayOfWeek: {
          userId,
          dayOfWeek,
        },
      },
      update: {
        startTime,
        endTime,
      },
      create: {
        userId,
        dayOfWeek,
        startTime,
        endTime,
      },
    });

    return res.status(existing ? 200 : 201).json({
      success: true,
      message: existing
        ? "Availability updated successfully"
        : "Availability created successfully",
      data: availability,
    });
  } catch (error) {
    console.error("Set Availability Error:", error);

    // 🔹 Prisma unique constraint
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Availability already exists for this day",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// 🔹 SET BULK availability (replace all days at once)
export const setBulkAvailability = async (req, res) => {
  try {
    const { userId, schedules } = req.body;

    // schedules = [{ dayOfWeek: 1, startTime: "09:00", endTime: "17:00" }, ...]

    if (!userId || !Array.isArray(schedules)) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, schedules (array)",
      });
    }

    // Validate user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Validate each schedule
    for (const s of schedules) {
      if (s.dayOfWeek === undefined || !s.startTime || !s.endTime) {
        return res.status(400).json({
          success: false,
          message: "Each schedule must have dayOfWeek, startTime, endTime",
        });
      }

      if (!Number.isInteger(s.dayOfWeek) || s.dayOfWeek < 0 || s.dayOfWeek > 6) {
        return res.status(400).json({
          success: false,
          message: `Invalid dayOfWeek: ${s.dayOfWeek}`,
        });
      }

      if (!isValidTime(s.startTime) || !isValidTime(s.endTime)) {
        return res.status(400).json({
          success: false,
          message: `Invalid time format for day ${s.dayOfWeek}`,
        });
      }

      if (toMinutes(s.startTime) >= toMinutes(s.endTime)) {
        return res.status(400).json({
          success: false,
          message: `startTime must be before endTime for day ${s.dayOfWeek}`,
        });
      }
    }

    // Transaction: delete all existing, then create new
    const result = await prisma.$transaction(async (tx) => {
      // Delete all existing availability for user
      await tx.availability.deleteMany({
        where: { userId },
      });

      // Create new availability entries
      if (schedules.length > 0) {
        await tx.availability.createMany({
          data: schedules.map((s) => ({
            userId,
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
          })),
        });
      }

      // Fetch and return the new availability
      return await tx.availability.findMany({
        where: { userId },
        orderBy: { dayOfWeek: "asc" },
      });
    });

    return res.status(200).json({
      success: true,
      message: "Availability updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Set Bulk Availability Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// 🔹 DELETE availability for a specific day
export const deleteAvailability = async (req, res) => {
  try {
    const { userId, dayOfWeek } = req.params;

    const day = parseInt(dayOfWeek);

    if (!userId || isNaN(day)) {
      return res.status(400).json({
        success: false,
        message: "userId and dayOfWeek are required",
      });
    }

    // Check if exists
    const existing = await prisma.availability.findUnique({
      where: {
        userId_dayOfWeek: {
          userId,
          dayOfWeek: day,
        },
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Availability not found for this day",
      });
    }

    await prisma.availability.delete({
      where: {
        userId_dayOfWeek: {
          userId,
          dayOfWeek: day,
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Availability deleted successfully",
    });
  } catch (error) {
    console.error("Delete Availability Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};