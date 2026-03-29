import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Upload, Image as ImageIcon } from "lucide-react";
import { useMenu, useCreateMenu, useUpdateMenu, useDeleteMenu } from "@/hooks/use-menu";
import { useGetCategories, type MenuItem } from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/api-error";

const menuItemSchema = z.object({
  name: z.string().min(1, "مطلوب"),
  nameAr: z.string().min(1, "مطلوب"),
  category: z.string().min(1, "مطلوب"),
  price: z.coerce.number().min(0.1, "يجب أن يكون أكبر من 0"),
  description: z.string().optional().default(""),
  descriptionAr: z.string().optional().default(""),
  imageUrl: z.string().url("رابط غير صحيح").or(z.literal("")).optional().default(""),
  available: z.boolean().default(true),
});

type MenuItemFormValues = z.infer<typeof menuItemSchema>;

export default function MenuManagement() {
  const { data: menuItems, isLoading } = useMenu();
  const { data: categories } = useGetCategories();
  const createMutation = useCreateMenu();
  const updateMutation = useUpdateMenu();
  const deleteMutation = useDeleteMenu();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: "",
      nameAr: "",
      category: "",
      price: 0,
      description: "",
      descriptionAr: "",
      imageUrl: "",
      available: true,
    },
  });

  const openCreate = () => {
    setEditingItem(null);
    form.reset({
      name: "",
      nameAr: "",
      category: categories?.[0]?.nameAr || "",
      price: 0,
      description: "",
      descriptionAr: "",
      imageUrl: "",
      available: true,
    });
    setIsDialogOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditingItem(item);
    form.reset({
      name: item.name,
      nameAr: item.nameAr,
      category: item.category,
      price: item.price,
      description: item.description || "",
      descriptionAr: item.descriptionAr || "",
      imageUrl: item.imageUrl || "",
      available: item.available,
    });
    setIsDialogOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw { data, message: "فشل رفع الصورة" };
      }
      form.setValue("imageUrl", data.url);
      toast({ title: "تم رفع الصورة بنجاح" });
    } catch (error) {
      toast({ title: getApiErrorMessage(error, "حدث خطأ أثناء رفع الصورة"), variant: "destructive" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onSubmit = (data: MenuItemFormValues) => {
    if (editingItem) {
      updateMutation.mutate(
        { id: editingItem.id, data },
        {
          onSuccess: () => {
            toast({ title: "تم التحديث بنجاح" });
            setIsDialogOpen(false);
          },
          onError: (error) => toast({ title: getApiErrorMessage(error, "حدث خطأ أثناء التحديث"), variant: "destructive" }),
        },
      );
      return;
    }

    createMutation.mutate(
      { data },
      {
        onSuccess: () => {
          toast({ title: "تمت الإضافة بنجاح" });
          setIsDialogOpen(false);
        },
        onError: (error) => toast({ title: getApiErrorMessage(error, "حدث خطأ أثناء الإضافة"), variant: "destructive" }),
      },
    );
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => toast({ title: "تم الحذف بنجاح" }),
        onError: (error) => toast({ title: getApiErrorMessage(error, "حدث خطأ أثناء الحذف"), variant: "destructive" }),
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة المنيو</h1>
          <p className="mt-2 text-muted-foreground">إضافة وتعديل الأطباق في القائمة</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة طبق جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-card sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle className="text-xl text-white">
                {editingItem ? "تعديل الطبق" : "إضافة طبق جديد"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">الاسم (عربي)</label>
                  <Input {...form.register("nameAr")} className="bg-background" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">الاسم (إنجليزي)</label>
                  <Input {...form.register("name")} className="bg-background text-left" dir="ltr" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">السعر</label>
                  <Input type="number" step="0.01" {...form.register("price")} className="bg-background" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">القسم</label>
                  <Select value={form.watch("category")} onValueChange={(v) => form.setValue("category", v)}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="اختر القسم" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((c) => <SelectItem key={c.id} value={c.nameAr}>{c.nameAr}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">الوصف (عربي)</label>
                <Textarea {...form.register("descriptionAr")} className="h-20 resize-none bg-background" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">صورة الطبق</label>
                <div className="flex gap-2">
                  <Input {...form.register("imageUrl")} className="flex-1 bg-background text-left" dir="ltr" placeholder="https://..." />
                  <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="shrink-0 gap-2">
                    {isUploading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Upload className="h-4 w-4" />}
                    رفع صورة
                  </Button>
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </div>
                {form.watch("imageUrl") && (
                  <div className="mt-2 h-24 w-24 overflow-hidden rounded-lg border border-border">
                    <img src={form.watch("imageUrl")} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 space-x-reverse rounded-lg border border-border bg-white/5 p-4">
                <Checkbox id="available" checked={form.watch("available")} onCheckedChange={(c) => form.setValue("available", c as boolean)} />
                <label htmlFor="available" className="cursor-pointer text-sm font-medium leading-none">متوفر للطلب</label>
              </div>

              <div className="flex justify-end gap-3 border-t border-border pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>إلغاء</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) ? "جاري الحفظ..." : "حفظ الطبق"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="border-b border-border bg-background text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-6 py-4">الطبق</th>
                <th className="px-6 py-4">القسم</th>
                <th className="px-6 py-4">السعر</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">جاري التحميل...</td></tr>
              ) : menuItems?.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">لا توجد أطباق مضافة.</td></tr>
              ) : (
                menuItems?.map((item) => (
                  <tr key={item.id} className="border-b border-border/50 transition-colors hover:bg-white/5">
                    <td className="flex items-center gap-4 px-6 py-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-background">
                        {item.imageUrl ? <img src={item.imageUrl} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="h-5 w-5 text-muted-foreground" />}
                      </div>
                      <div>
                        <div className="text-base font-bold text-white">{item.nameAr}</div>
                        <div className="max-w-[200px] truncate text-xs text-muted-foreground">{item.descriptionAr || "بدون وصف"}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="rounded-md border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs text-primary">{item.category}</span></td>
                    <td className="px-6 py-4 font-bold text-white">{item.price} د.أ</td>
                    <td className="px-6 py-4">
                      {item.available ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-green-500"><CheckCircle2 className="h-3 w-3" /> متوفر</span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-medium text-destructive"><AlertCircle className="h-3 w-3" /> غير متوفر</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-400 hover:bg-blue-400/10 hover:text-blue-300" onClick={() => openEdit(item)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="border-border bg-card">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-right text-white">تأكيد الحذف</AlertDialogTitle>
                              <AlertDialogDescription className="text-right">هل أنت متأكد من حذف "{item.nameAr}"؟</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex-row-reverse gap-2 sm:space-x-0">
                              <AlertDialogCancel className="mt-0">إلغاء</AlertDialogCancel>
                              <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={() => handleDelete(item.id)}>
                                نعم، احذف
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
