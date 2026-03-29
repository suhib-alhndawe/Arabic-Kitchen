import { Router, type IRouter, type Request, type Response } from "express";
import { db, categoriesTable, insertCategorySchema, isDatabaseConfigured } from "../lib/db";
import { eq } from "drizzle-orm";
import { fallbackCategories } from "../lib/fallback-data";

const router: IRouter = Router();

function requireAuth(req: Request, res: Response, next: () => void) {
  const sess = req.session as { authenticated?: boolean };
  if (!sess.authenticated) {
    res.status(401).json({ error: "غير مصرح" });
    return;
  }
  next();
}

router.get("/", async (_req: Request, res: Response) => {
  try {
    if (!isDatabaseConfigured) {
      res.json(fallbackCategories);
      return;
    }
    const cats = await db.select().from(categoriesTable).orderBy(categoriesTable.sortOrder);
    res.json(cats);
  } catch (err) {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConfigured) {
      res.status(503).json({ error: "قاعدة البيانات غير مهيأة بعد. أضف DATABASE_URL في Render لتفعيل التعديل." });
      return;
    }
    const parsed = insertCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "بيانات غير صحيحة" });
      return;
    }
    const [cat] = await db.insert(categoriesTable).values(parsed.data).returning();
    res.status(201).json(cat);
  } catch (err) {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConfigured) {
      res.status(503).json({ error: "قاعدة البيانات غير مهيأة بعد. أضف DATABASE_URL في Render لتفعيل التعديل." });
      return;
    }
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) { res.status(400).json({ error: "معرف غير صحيح" }); return; }
    const parsed = insertCategorySchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: "بيانات غير صحيحة" }); return; }
    const [cat] = await db.update(categoriesTable).set(parsed.data).where(eq(categoriesTable.id, id)).returning();
    if (!cat) { res.status(404).json({ error: "القسم غير موجود" }); return; }
    res.json(cat);
  } catch (err) {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConfigured) {
      res.status(503).json({ error: "قاعدة البيانات غير مهيأة بعد. أضف DATABASE_URL في Render لتفعيل التعديل." });
      return;
    }
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) { res.status(400).json({ error: "معرف غير صحيح" }); return; }
    const [deleted] = await db.delete(categoriesTable).where(eq(categoriesTable.id, id)).returning();
    if (!deleted) { res.status(404).json({ error: "القسم غير موجود" }); return; }
    res.json({ success: true, message: "تم الحذف بنجاح" });
  } catch (err) {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

export default router;
