import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

const ADMIN_USERNAME = process.env["ADMIN_USERNAME"] || "admin";
const ADMIN_PASSWORD = process.env["ADMIN_PASSWORD"] || "fasah2024";

router.post("/login", (req: Request, res: Response) => {
  const { username, password } = req.body as { username: string; password: string };

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const sess = req.session as { authenticated?: boolean; username?: string };
    sess.authenticated = true;
    sess.username = username;
    res.json({ success: true, message: "تم تسجيل الدخول بنجاح" });
  } else {
    res.status(401).json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" });
  }
});

router.post("/logout", (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.json({ success: true, message: "تم تسجيل الخروج" });
  });
});

router.get("/me", (req: Request, res: Response) => {
  const sess = req.session as { authenticated?: boolean; username?: string };
  if (sess.authenticated) {
    res.json({ authenticated: true, username: sess.username });
  } else {
    res.json({ authenticated: false });
  }
});

export default router;
