import { Router } from "express";
import { SpecialtyRoutes } from "../modules/speciality/speciality.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { UserRoutes } from "../modules/user/user.route";
import { DoctorRoutes } from "../modules/doctor/doctor.route";

const route = Router();

route.use('/auth', AuthRoutes);
route.use('/specialties', SpecialtyRoutes);
route.use('/users', UserRoutes);
route.use('/doctors', DoctorRoutes);

export const IndexRoutes = route;