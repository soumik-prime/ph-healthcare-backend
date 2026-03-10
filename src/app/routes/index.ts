import { Router } from "express";
import { SpecialtyRoutes } from "../modules/speciality/speciality.route";
import { AuthRoutes } from "../modules/auth/auth.route";

const route = Router();

route.use('/auth', AuthRoutes);
route.use('/specialties', SpecialtyRoutes);

export const IndexRoutes = route;