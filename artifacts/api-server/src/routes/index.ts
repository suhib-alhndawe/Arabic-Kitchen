import { Router, type IRouter } from "express";
import healthRouter from "./health";
import menuRouter from "./menu";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/menu", menuRouter);
router.use("/auth", authRouter);

export default router;
