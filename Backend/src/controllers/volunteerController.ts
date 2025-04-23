import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import { sendConfirmationEmail } from "../emails/sendConfirmationEmail";

export const registerVolunteer = async (req: Request, res: Response) => {
  const {
    name,
    email,
    password,
    ngoId,
    contact_number,
  } = req.body;

  try {

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }


    const hashedPassword = await bcrypt.hash(password, 10);

  
    const userPayload: any = {
      name,
      email,
      password: hashedPassword,
      role: "volunteer", 
      contact_number,
      ngoId,
      isApproved: false,
    };

    const volunteer = new User(userPayload);
    await volunteer.save();

    await sendConfirmationEmail({ to: email, name, role: "volunteer" });

    res.status(201).json({ message: "Volunteer registered successfully" });
  } catch (error) {
    console.error("Volunteer registration error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong during volunteer registration" });
  }
};
