import { Router, type IRouter, type Request, type Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router: IRouter = Router();

const UPLOADS_DIR = path.resolve(process.cwd(), "../../uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = Date.now() + "-" + Math.round(Math.random() * 1e6);
    cb(null, base + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("نوع الملف غير مسموح به"));
  },
});

function requireAuth(req: Request, res: Response, next: () => void) {
  const sess = req.session as { authenticated?: boolean };
  if (!sess.authenticated) { res.status(401).json({ error: "غير مصرح" }); return; }
  next();
}

router.post("/", requireAuth, upload.single("file"), (req: Request, res: Response) => {
  if (!req.file) { res.status(400).json({ error: "لم يتم رفع أي ملف" }); return; }
  const url = `/api/files/${req.file.filename}`;
  res.json({ url, filename: req.file.filename, originalName: req.file.originalname, size: req.file.size });
});

router.get("/list", (_req: Request, res: Response) => {
  try {
    if (!fs.existsSync(UPLOADS_DIR)) { res.json([]); return; }
    const files = fs.readdirSync(UPLOADS_DIR).filter(f => !f.startsWith("."));
    const result = files.map(filename => {
      const stat = fs.statSync(path.join(UPLOADS_DIR, filename));
      return { filename, url: `/api/files/${filename}`, size: stat.size, createdAt: stat.birthtime.toISOString() };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(result);
  } catch {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.get("/:filename", (req: Request, res: Response) => {
  const safeName = path.basename(req.params.filename as string);
  const filePath = path.join(UPLOADS_DIR, safeName);
  if (!fs.existsSync(filePath)) { res.status(404).json({ error: "الملف غير موجود" }); return; }
  res.sendFile(filePath);
});

export default router;
