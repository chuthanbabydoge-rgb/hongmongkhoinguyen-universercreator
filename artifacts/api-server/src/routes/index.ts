import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import projectsRouter from "./projects";
import assetsRouter from "./assets";
import templatesRouter from "./templates";
import pluginsRouter from "./plugins";
import packagesRouter from "./packages";
import publishRouter from "./publish";
import dashboardRouter from "./dashboard";
import profileRouter from "./profile";
import organizationsRouter from "./organizations";
import invitationsRouter from "./invitations";
import projectMembersRouter from "./project-members";
import starsRouter from "./stars";
import activityRouter from "./activity";
import notificationsRouter from "./notifications";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(projectsRouter);
router.use(assetsRouter);
router.use(templatesRouter);
router.use(pluginsRouter);
router.use(packagesRouter);
router.use(publishRouter);
router.use(dashboardRouter);
router.use(profileRouter);
router.use(organizationsRouter);
router.use(invitationsRouter);
router.use(projectMembersRouter);
router.use(starsRouter);
router.use(activityRouter);
router.use(notificationsRouter);

export default router;
