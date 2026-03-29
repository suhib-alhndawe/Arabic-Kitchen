import { useState, useRef } from "react";
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
      name: "", nameAr: "", category: "", price: 0, description: "", descriptionAr: "", imageUrl: "", available: true,
    }
  });

  const openCreate = () => {
    setEditingItem(null);
    form.reset({
      name: "", nameAr: "", category: categories?.[0]?.nameAr || "", price: 0, description: "", descriptionAr: "", imageUrl: "", available: true
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
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('فشل الرفع');
      const data = await response.json();
      form.setValue('imageUrl', data.url);
      toast({ title: "تم رفع الصورة بنجاح" });
    } catch (error) {
      toast({ title: "حدث خطأ أثناء رفع الصورة", variant: "destructive" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
          onError: () => toast({ title: "حدث خطأ أثناء التحديث", variant: "destructive" })
        }
      );
    } else {
      createMutation.mutate(
        { data },
        {
          onSuccess: () => {
            toast({ title: "تمت الإضافة بنجاح" });
            setIsDialogOpen(false);
          },
          onError: () => toast({ title: "حدث خطأ أثناء الإضافة", variant: "destructive" })
        }
      );
    }
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => toast({ title: "تم الحذف بنجاح" }),
        onError: () => toast({ title: "حدث خطأ أثناء الحذف", variant: "destructive" })
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">إدارة المنيو</h1>
          <p className="text-muted-foreground mt-2">إضافة وتعديل الأطباق في القائمة</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة طبق جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] bg-card border-border max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white text-xl">
                {editingItem ? "تعديل الطبق" : "إضافة طبق جديد"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">الاسم (عربي) *</label>
                  <Input {...form.register("nameAr")} className="bg-background" />
                  {form.formState.errors.nameAr && <p className="text-xs text-destructive">{form.formState.errors.nameAr.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">الاسم (انجليزي) *</label>
                  <Input {...form.register("name")} className="bg-background text-left" dir="ltr" />
                  {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">السعر (د.أ) *</label>
                  <Input type="number" step="0.01" {...form.register("price")} className="bg-background" />
                  {form.formState.errors.price && <p className="text-xs text-destructive">{form.formState.errors.price.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">القسم *</label>
                  <Select 
                    value={form.watch("category")} 
                    onValueChange={(v) => form.setValue("category", v)}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="اختر القسم" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map(c => <SelectItem key={c.id} value={c.nameAr}>{c.nameAr}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.category && <p className="text-xs text-destructive">{form.formState.errors.category.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">الوصف (عربي)</label>
                <Textarea {...form.register("descriptionAr")} className="bg-background resize-none h-20" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">صورة الطبق</label>
                <div className="flex gap-2">
                  <Input {...form.register("imageUrl")} className="bg-background text-left flex-1" dir="ltr" placeholder="رابط الصورة https://..." />
                  <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="shrink-0 gap-2">
                    {isUploading ? <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" /> : <Upload className="w-4 h-4" />}
                    رفع صورة
                  </Button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                </div>
                {form.watch("imageUrl") && (
                  <div className="mt-2 w-24 h-24 rounded-lg overflow-hidden border border-border">
                    <img src={form.watch("imageUrl")} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                {form.formState.errors.imageUrl && <p className="text-xs text-destructive">{form.formState.errors.imageUrl.message}</p>}
              </div>

              <div className="flex items-center space-x-2 space-x-reverse bg-white/5 p-4 rounded-lg border border-border">
                <Checkbox 
                  id="available" 
                  checked={form.watch("available")} 
                  onCheckedChange={(c) => form.setValue("available", c as boolean)} 
                />
                <label htmlFor="available" className="text-sm font-medium leading-none cursor-pointer">
                  متوفر للطلب (يظهر للزبائن)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>إلغاء</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) ? "جاري الحفظ..." : "حفظ الطبق"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="text-xs text-muted-foreground bg-background border-b border-border uppercase">
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
                  <tr key={item.id} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-background shrink-0 border border-white/10 flex items-center justify-center">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-white text-base">{item.nameAr}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">{item.descriptionAr || "بدون وصف"}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-md text-xs border border-primary/20">{item.category}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-white">{item.price} د.أ</td>
                    <td className="px-6 py-4">
                      {item.available ? (
                        <span className="flex items-center gap-1 text-green-500 text-xs font-medium"><CheckCircle2 className="w-3 h-3"/> متوفر</span>
                      ) : (
                        <span className="flex items-center gap-1 text-destructive text-xs font-medium"><AlertCircle className="w-3 h-3"/> غير متوفر</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10" onClick={() => openEdit(item)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-card border-border">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white text-right">تأكيد الحذف</AlertDialogTitle>
                              <AlertDialogDescription className="text-right">
                                هل أنت متأكد من حذف "{item.nameAr}"؟ لا يمكن التراجع عن هذا الإجراء.
                              </AlertDialogDescription>
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
