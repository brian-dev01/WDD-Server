import { v4 as uuidv4 } from "uuid";
import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

interface InquiryRequest {
  name: string;
  email: string;
  message: string;
  eventDate: string;
  userId?: string;
}

// 🔹 **Swagger Configuration**
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Inquiry API",
      version: "1.0.0",
      description: "API for managing inquiries",
      contact: {
        name: "Your Name",
        email: "your-email@example.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local server",
      },
    ],
  },
  apis: ["./src/server.ts"], // Path to your route definitions
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * components:
 *   schemas:
 *     Inquiry:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - message
 *         - eventDate
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the inquiry
 *         name:
 *           type: string
 *           description: Name of the inquirer
 *         email:
 *           type: string
 *           format: email
 *           description: Email address of the inquirer
 *         message:
 *           type: string
 *           description: Inquiry message
 *         eventDate:
 *           type: string
 *           format: date-time
 *           description: Date of the event
 *         userId:
 *           type: string
 *           description: User ID (optional)
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/inquiries:
 *   post:
 *     summary: Create a new inquiry
 *     tags: [Inquiries]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Inquiry'
 *     responses:
 *       200:
 *         description: Inquiry created successfully
 *       500:
 *         description: Server error
 */
app.post("/api/inquiries", async (req: Request<{}, {}, InquiryRequest>, res: Response) => {
  const { name, email, message, eventDate, userId } = req.body;

  const id = uuidv4(); // Generate a new UUID for the inquiry

  try {
    const inquiry = await prisma.inquiry.create({
      data: {
        id, // Use the generated UUID as the inquiry ID
        name,
        email,
        message,
        eventDate: new Date(eventDate),
        userId,
      },
    });
    res.json(inquiry);
  } catch (error) {
    console.error("Create inquiry error:", error);
    res.status(500).json({ error: "Failed to create inquiry" });
  }
});

/**
 * @swagger
 * /api/inquiries:
 *   get:
 *     summary: Get all inquiries
 *     tags: [Inquiries]
 *     responses:
 *       200:
 *         description: List of all inquiries
 *       500:
 *         description: Server error
 */
app.get("/api/inquiries", async (_req: Request, res: Response) => {
  try {
    const inquiries = await prisma.inquiry.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(inquiries);
  } catch (error) {
    console.error("Get inquiries error:", error);
    res.status(500).json({ error: "Failed to fetch inquiries" });
  }
});

/**
 * @swagger
 * /api/inquiries/{id}:
 *   delete:
 *     summary: Delete an inquiry by ID
 *     tags: [Inquiries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The inquiry ID
 *     responses:
 *       200:
 *         description: Inquiry deleted successfully
 *       500:
 *         description: Server error
 */
app.delete("/api/inquiries/:id", async (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.inquiry.delete({
      where: { id },
    });
    res.json({ message: "Inquiry deleted successfully" });
  } catch (error) {
    console.error("Delete inquiry error:", error);
    res.status(500).json({ error: "Failed to delete inquiry" });
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
