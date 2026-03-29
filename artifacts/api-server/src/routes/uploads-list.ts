import { Router, type IRouter, type Request, type Response } from "express";
import path from "path";
import fs from "fs";

const router: IRouter = Router();

const UPLOADS_DIR = path.resolve(process.cwd(), "../../uploads");

router.get("/", (_req: Request, res: Response) => {
  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      res.json([]);
      return;
    }
    const files = fs.readdirSync(UPLOADS_DIR).filter(f => !f.startsWith("."));
    const result = files.map(filename => {
      const filePath = path.join(UPLOADS_DIR, filename);
      const stat = fs.statSync(filePath);
      return {
        filename,
        url: `/api/files/${filename}`,
        size: stat.size,
        createdAt: stat.birthtime.toISOString(),
      };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

export default router;
