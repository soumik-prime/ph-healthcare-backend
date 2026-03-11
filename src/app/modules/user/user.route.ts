import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createDoctorZodSchema } from "./user.validation";

const route = Router();

route.post('/create-doctor', validateRequest(createDoctorZodSchema), UserController.createDoctor);

export const UserRoutes = route; 