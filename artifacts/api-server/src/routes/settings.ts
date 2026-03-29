import { Router, type IRouter, type Request, type Response } from "express";
import { db, settingsTable } from "../lib/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const DEFAULT_SETTINGS = {
  restaurantName: "Fasah Lahm Restaurant",
  restaurantNameAr: "مطعم صاج فحم ولحم",
  whatsappNumber: "966500000000",
  logoUrl: "/logo.png",
  heroTitle: "أشهى المشاوي على الصاج والفحم",
  address: "الرياض، المملكة العربية السعودية",
};

async function getSettingValue(key: string, fallback: string): Promise<string> {
  const [row] = await db.select().from(settingsTable).where(eq(settingsTable.key, key));
  return row?.value ?? fallback;
}

async function setSettingValue(key: string, value: string) {
  const existing = await db.select().from(settingsTable).where(eq(settingsTable.key, key));
  if (existing.length > 0) {
    await db.update(settingsTable).set({ value, updatedAt: new Date() }).where(eq(settingsTable.key, key));
  } else {
    await db.insert(settingsTable).values({ key, value });
  }
}

function requireAuth(req: Request, res: Response, next: () => void) {
  const sess = req.session as { authenticated?: boolean };
  if (!sess.authenticated) { res.status(401).json({ error: "غير مصرح" }); return; }
  next();
}

router.get("/", async (_req: Request, res: Response) => {
  try {
    const keys = Object.keys(DEFAULT_SETTINGS) as (keyof typeof DEFAULT_SETTINGS)[];
    const result: Record<string, string> = {};
    for (const key of keys) {
      result[key] = await getSettingValue(key, DEFAULT_SETTINGS[key]);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.put("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const body = req.body as Record<string, string>;
    const keys = Object.keys(DEFAULT_SETTINGS) as (keyof typeof DEFAULT_SETTINGS)[];
    for (const key of keys) {
      if (body[key] !== undefined) {
        await setSettingValue(key, String(body[key]));
      }
    }
    const result: Record<string, string> = {};
    for (const key of keys) {
      result[key] = await getSettingValue(key, DEFAULT_SETTINGS[key]);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

export default router;
