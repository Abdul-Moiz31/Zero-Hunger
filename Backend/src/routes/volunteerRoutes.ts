import { Router } from 'express';
import { registerVolunteer } from "../controllers/volunteerController";

const router = Router();

router.post("/volunteer/register", registerVolunteer);


export default Router();
