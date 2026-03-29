import { Router, type IRouter, type Request, type Response } from "express";
import { db, menuItemsTable, categoriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import path from "path";
import fs from "fs";

const router: IRouter = Router();

const UPLOADS_DIR = path.resolve(process.cwd(), "../../uploads");

function requireAuth(req: Request, res: Response, next: () => void) {
  const sess = req.session as { authenticated?: boolean };
  if (!sess.authenticated) { res.status(401).json({ error: "غير مصرح" }); return; }
  next();
}

router.get("/stats", requireAuth, async (_req: Request, res: Response) => {
  try {
    const allItems = await db.select().from(menuItemsTable);
    const allCategories = await db.select().from(categoriesTable);

    const availableItems = allItems.filter(i => i.available).length;
    const unavailableItems = allItems.filter(i => !i.available).length;

    const categoryCounts: Record<string, number> = {};
    for (const item of allItems) {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    }

    const itemsByCategory = Object.entries(categoryCounts).map(([category, count]) => ({ category, count }));

    let totalUploads = 0;
    if (fs.existsSync(UPLOADS_DIR)) {
      const files = fs.readdirSync(UPLOADS_DIR);
      totalUploads = files.filter(f => !f.startsWith(".")).length;
    }

    res.json({
      totalItems: allItems.length,
      totalCategories: allCategories.length,
      availableItems,
      unavailableItems,
      totalUploads,
      itemsByCategory,
    });
  } catch (err) {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

export default router;
