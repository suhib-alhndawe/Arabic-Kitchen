import { Router, type IRouter } from "express";
import healthRouter from "./health";
import menuRouter from "./menu";
import authRouter from "./auth";
import categoriesRouter from "./categories";
import uploadRouter from "./upload";
import settingsRouter from "./settings";
import dashboardRouter from "./dashboard";
import uploadsListRouter from "./uploads-list";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/menu", menuRouter);
router.use("/auth", authRouter);
router.use("/categories", categoriesRouter);
router.use("/upload", uploadRouter);
router.use("/files", uploadRouter);
router.use("/uploads", uploadsListRouter);
router.use("/settings", settingsRouter);
router.use("/dashboard", dashboardRouter);


export default router;
