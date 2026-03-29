import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save } from "lucide-react";
import { useGetSettings, useUpdateSettings, type Settings as SettingsType } from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

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
    }
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        restaurantName: settings.restaurantName || "",
        restaurantNameAr: settings.restaurantNameAr || "",
        whatsappNumber: settings.whatsappNumber || "",
        logoUrl: settings.logoUrl || "",
        heroTitle: settings.heroTitle || "",
        address: settings.address || "",
      });
    }
  }, [settings, form]);

  const onSubmit = (data: SettingsFormValues) => {
    updateMutation.mutate(
      { data },
      {
        onSuccess: () => {
          toast({ title: "تم حفظ الإعدادات بنجاح" });
        },
        onError: () => {
          toast({ title: "حدث خطأ أثناء الحفظ", variant: "destructive" });
        }
      }
    );
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">الإعدادات العامة</h1>
        <p className="text-muted-foreground mt-2">تخصيص معلومات مطعمك الأساسية</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>المعلومات الأساسية</CardTitle>
            <CardDescription>هذه المعلومات تظهر للزوار في الموقع</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">اسم المطعم (عربي)</label>
                <Input {...form.register("restaurantNameAr")} className="bg-background" />
                {form.formState.errors.restaurantNameAr && <p className="text-xs text-destructive">{form.formState.errors.restaurantNameAr.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">اسم المطعم (انجليزي)</label>
                <Input {...form.register("restaurantName")} className="bg-background text-left" dir="ltr" />
                {form.formState.errors.restaurantName && <p className="text-xs text-destructive">{form.formState.errors.restaurantName.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">رقم الواتساب (للتواصل)</label>
                <Input {...form.register("whatsappNumber")} className="bg-background text-left" dir="ltr" placeholder="966500000000" />
                <p className="text-xs text-muted-foreground">اكتب الرقم مع رمز الدولة بدون أصفار أو علامة +</p>
                {form.formState.errors.whatsappNumber && <p className="text-xs text-destructive">{form.formState.errors.whatsappNumber.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">العنوان</label>
                <Input {...form.register("address")} className="bg-background" />
                {form.formState.errors.address && <p className="text-xs text-destructive">{form.formState.errors.address.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">عنوان واجهة الموقع (Hero Title)</label>
              <Input {...form.register("heroTitle")} className="bg-background" placeholder="استمتع بألذ المشويات" />
              {form.formState.errors.heroTitle && <p className="text-xs text-destructive">{form.formState.errors.heroTitle.message}</p>}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">رابط الشعار (Logo URL)</label>
                <Input {...form.register("logoUrl")} className="bg-background text-left" dir="ltr" placeholder="https://..." />
                <p className="text-xs text-muted-foreground">يمكنك رفع الشعار في مكتبة الصور ونسخ الرابط هنا</p>
                {form.formState.errors.logoUrl && <p className="text-xs text-destructive">{form.formState.errors.logoUrl.message}</p>}
              </div>
              
              {form.watch("logoUrl") && !form.formState.errors.logoUrl && (
                <div className="p-4 bg-background border border-border rounded-lg inline-block">
                  <p className="text-xs text-muted-foreground mb-2">معاينة الشعار:</p>
                  <img src={form.watch("logoUrl")} alt="Logo Preview" className="h-16 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-border flex justify-end">
              <Button type="submit" disabled={updateMutation.isPending} size="lg" className="gap-2 px-8">
                <Save className="w-5 h-5" />
                {updateMutation.isPending ? "جاري الحفظ..." : "حفظ الإعدادات"}
              </Button>
            </div>

          </CardContent>
        </Card>
      </form>
    </div>
  );
}
