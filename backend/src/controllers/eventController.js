import prisma from "../config/prisma.js";

export const getEventBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const eventType = await prisma.eventType.findUnique({
      where: { slug },
      include: { user: true },
    });

    if (!eventType) {
      return res.status(404).json({
        success: false,
        message: "Event type not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: eventType,
    });
  } catch (error) {
    console.error("Get Event by Slug Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const createEventType = async (req, res) => {
  try {
    const { title, description, duration, slug, userId } = req.body;

    // 🔹 1. Validation
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    if (!slug || !slug.trim()) {
      return res.status(400).json({
        success: false,
        message: "Slug is required",
      });
    }

    if (!Number.isInteger(duration) || duration <= 0) {
      return res.status(400).json({
        success: false,
        message: "Duration must be a positive integer",
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // 🔹 2. Check user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 🔹 3. Normalize slug (clean URL)
    const normalizedSlug = slug
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

    // 🔹 4. Create event
    const event = await prisma.eventType.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        duration,
        slug: normalizedSlug,
        userId,
      },
    });

    return res.status(201).json({
      success: true,
      data: event,
    });

  } catch (error) {
    console.error("Create Event Error:", {
      body: req.body,
      error,
    });

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Slug already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAllEventTypes = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const eventTypes = await prisma.eventType.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: eventTypes,
    });
  } catch (error) {
    console.error("Get All Event Types Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateEventType = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, duration, slug, userId } = req.body;

    // 🔹 1. Validation
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Event ID is required",
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // 🔹 2. Check if event exists and belongs to user
    const existingEvent = await prisma.eventType.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: "Event type not found",
      });
    }

    // 🔹 3. Prepare update data
    const updateData = {};

    if (title !== undefined) {
      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Title cannot be empty",
        });
      }
      updateData.title = title.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (duration !== undefined) {
      if (!Number.isInteger(duration) || duration <= 0) {
        return res.status(400).json({
          success: false,
          message: "Duration must be a positive integer",
        });
      }
      updateData.duration = duration;
    }

    if (slug !== undefined) {
      if (!slug || !slug.trim()) {
        return res.status(400).json({
          success: false,
          message: "Slug cannot be empty",
        });
      }
      // Normalize slug
      updateData.slug = slug
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");
    }

    // 🔹 4. Update event
    const updatedEvent = await prisma.eventType.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: "Event type updated successfully",
      data: updatedEvent,
    });

  } catch (error) {
    console.error("Update Event Error:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Slug already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteEventType = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // 🔹 1. Validation
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Event ID is required",
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // 🔹 2. Check if event exists and belongs to user
    const existingEvent = await prisma.eventType.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: "Event type not found",
      });
    }

    // 🔹 3. Delete event (cascade will handle related bookings)
    await prisma.eventType.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Event type deleted successfully",
    });

  } catch (error) {
    console.error("Delete Event Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};