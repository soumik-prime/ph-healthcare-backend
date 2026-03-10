import { Router } from "express";
import { AuthController } from "./auth.controller";

const route = Router();

route.post('/register', AuthController.registerPatient);
route.post('/login', AuthController.loginUser);

export const AuthRoutes = route; 