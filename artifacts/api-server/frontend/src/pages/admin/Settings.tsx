import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save } from "lucide-react";
import { useGetSettings, useUpdateSettings } from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/api-error";

const settingsSchema = z.object({
  restaurantName: z.string().min(1, "مطلوب"),
  restaurantNameAr: z.string().min(1, "مطلوب"),
  whatsappNumber: z.string().min(1, "مطلوب"),
  logoUrl: z.string().url("رابط غير صحيح").or(z.literal("")),
  heroTitle: z.string().min(1, "مطلوب"),
  address: z.string().min(1, "مطلوب"),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function Settings() {
  const { data: settings, isLoading } = useGetSettings();
  const updateMutation = useUpdateSettings();
  const { toast } = useToast();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      restaurantName: "",
      restaurantNameAr: "",
      whatsappNumber: "",
      logoUrl: "",
      heroTitle: "",
      address: "",
    },
  });

  useEffect(() => {
    if (!settings) return;
    form.reset({
      restaurantName: settings.restaurantName || "",
      restaurantNameAr: settings.restaurantNameAr || "",
      whatsappNumber: settings.whatsappNumber || "",
      logoUrl: settings.logoUrl || "",
      heroTitle: settings.heroTitle || "",
      address: settings.address || "",
    });
  }, [settings, form]);

  const onSubmit = (data: SettingsFormValues) => {
    updateMutation.mutate(
      { data },
      {
        onSuccess: () => {
          toast({ title: "تم حفظ الإعدادات بنجاح" });
        },
        onError: (error) => {
          toast({
            title: getApiErrorMessage(error, "حدث خطأ أثناء الحفظ"),
            variant: "destructive",
          });
        },
      },
    );
  };

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">الإعدادات العامة</h1>
        <p className="mt-2 text-muted-foreground">تخصيص معلومات مطعمك الأساسية</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>المعلومات الأساسية</CardTitle>
            <CardDescription>هذه المعلومات تظهر للزوار في الموقع</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">اسم المطعم (عربي)</label>
                <Input {...form.register("restaurantNameAr")} className="bg-background" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">اسم المطعم (إنجليزي)</label>
                <Input {...form.register("restaurantName")} className="bg-background text-left" dir="ltr" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">رقم الواتساب</label>
                <Input {...form.register("whatsappNumber")} className="bg-background text-left" dir="ltr" placeholder="962790000000" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">العنوان</label>
                <Input {...form.register("address")} className="bg-background" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">عنوان الواجهة</label>
              <Input {...form.register("heroTitle")} className="bg-background" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">رابط الشعار</label>
              <Input {...form.register("logoUrl")} className="bg-background text-left" dir="ltr" placeholder="https://..." />
            </div>

            <div className="flex justify-end border-t border-border pt-6">
              <Button type="submit" disabled={updateMutation.isPending} size="lg" className="gap-2 px-8">
                <Save className="h-5 w-5" />
                {updateMutation.isPending ? "جاري الحفظ..." : "حفظ الإعدادات"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
