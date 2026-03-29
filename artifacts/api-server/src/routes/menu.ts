import { Router, type IRouter, type Request, type Response } from "express";
import { db, isDatabaseConfigured, menuItemsTable, insertMenuItemSchema } from "../lib/db";
import { eq } from "drizzle-orm";
import { fallbackMenuItems } from "../lib/fallback-data";

const router: IRouter = Router();

function requireAuth(req: Request, res: Response, next: () => void) {
  const sess = req.session as { authenticated?: boolean };
  if (!sess.authenticated) {
    res.status(401).json({ error: "غير مصرح" });
    return;
  }
  next();
}

router.get("/", async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query as { category?: string; search?: string };

    let items = isDatabaseConfigured
      ? await db.select().from(menuItemsTable)
      : fallbackMenuItems;

    if (category && category !== "الكل") {
      items = items.filter((item) => item.category === category);
    }

    if (search) {
      const lower = search.toLowerCase();
      items = items.filter(
        (item) =>
          item.nameAr.toLowerCase().includes(lower) ||
          item.name.toLowerCase().includes(lower) ||
          item.descriptionAr.toLowerCase().includes(lower)
      );
    }

    res.json(items);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const parsed = insertMenuItemSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "بيانات غير صحيحة" });
      return;
    }
    const [item] = await db.insert(menuItemsTable).values(parsed.data).returning();
    res.status(201).json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      res.status(400).json({ error: "معرف غير صحيح" });
      return;
    }

    const parsed = insertMenuItemSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "بيانات غير صحيحة" });
      return;
    }

    const [item] = await db
      .update(menuItemsTable)
      .set(parsed.data)
      .where(eq(menuItemsTable.id, id))
      .returning();

    if (!item) {
      res.status(404).json({ error: "العنصر غير موجود" });
      return;
    }

    res.json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      res.status(400).json({ error: "معرف غير صحيح" });
      return;
    }

    const [deleted] = await db
      .delete(menuItemsTable)
      .where(eq(menuItemsTable.id, id))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "العنصر غير موجود" });
      return;
    }

    res.json({ success: true, message: "تم الحذف بنجاح" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

export default router;
