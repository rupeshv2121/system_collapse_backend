import { Request, Response, Router } from "express";
import { body, validationResult } from "express-validator";
import { sendProfileEmail } from "../services/emailService";

const router = Router();

// POST /api/email/share-profile
// Send user profile statistics via email

router.post(
  "/share-profile",
  [
    body("to").isEmail().withMessage("Valid email address is required"),
    body("subject").notEmpty().withMessage("Subject is required"),
    body("content").notEmpty().withMessage("Content is required"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { to, subject, content } = req.body;

      await sendProfileEmail(to, subject, content);

      res.status(200).json({
        message: "Email sent successfully",
        success: true,
      });
    } catch (error: any) {
      res.status(500).json({
        error: "Failed to send email",
        message: error.message,
      });
    }
  },
);

export default router;
