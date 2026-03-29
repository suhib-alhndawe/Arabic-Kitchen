import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useGetCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, type Category } from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

const categorySchema = z.object({
  nameAr: z.string().min(1, "الاسم مطلوب"),
  slug: z.string().min(1, "المعرف مطلوب"),
  icon: z.string().min(1, "الأيقونة مطلوبة"),
  sortOrder: z.coerce.number().min(0).default(0),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function CategoriesManagement() {
  const { data: categories, isLoading, refetch } = useGetCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Category | null>(null);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { nameAr: "", slug: "", icon: "", sortOrder: 0 }
  });

  const openCreate = () => {
    setEditingItem(null);
    form.reset({ nameAr: "", slug: "", icon: "", sortOrder: (categories?.length || 0) + 1 });
    setIsDialogOpen(true);
  };

  const openEdit = (item: Category) => {
    setEditingItem(item);
    form.reset({
      nameAr: item.nameAr,
      slug: item.slug,
      icon: item.icon,
      sortOrder: item.sortOrder,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: CategoryFormValues) => {
    if (editingItem) {
      updateMutation.mutate(
        { id: editingItem.id, data },
        {
          onSuccess: () => {
            toast({ title: "تم التحديث بنجاح" });
            setIsDialogOpen(false);
            refetch();
          },
          onError: () => toast({ title: "حدث خطأ", variant: "destructive" })
        }
      );
    } else {
      createMutation.mutate(
        { data },
        {
          onSuccess: () => {
            toast({ title: "تمت الإضافة بنجاح" });
            setIsDialogOpen(false);
            refetch();
          },
          onError: () => toast({ title: "حدث خطأ", variant: "destructive" })
        }
      );
    }
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "تم الحذف بنجاح" });
          refetch();
        },
        onError: () => toast({ title: "حدث خطأ", variant: "destructive" })
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">الأقسام</h1>
          <p className="text-muted-foreground mt-2">إدارة أقسام المنيو (مثل: كباب، مشويات، مشروبات)</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة قسم جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-white text-xl">
                {editingItem ? "تعديل القسم" : "إضافة قسم جديد"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">الاسم (عربي) *</label>
                <Input {...form.register("nameAr")} className="bg-background" />
                {form.formState.errors.nameAr && <p className="text-xs text-destructive">{form.formState.errors.nameAr.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">الرابط (Slug) *</label>
                <Input {...form.register("slug")} className="bg-background text-left" dir="ltr" placeholder="m grills" />
                {form.formState.errors.slug && <p className="text-xs text-destructive">{form.formState.errors.slug.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">أيقونة (إيموجي) *</label>
                  <Input {...form.register("icon")} className="bg-background" placeholder="🥩" />
                  {form.formState.errors.icon && <p className="text-xs text-destructive">{form.formState.errors.icon.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">الترتيب</label>
                  <Input type="number" {...form.register("sortOrder")} className="bg-background text-center" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>إلغاء</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) ? "جاري الحفظ..." : "حفظ القسم"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <div className="col-span-full py-12 flex justify-center text-muted-foreground">جاري التحميل...</div>
        ) : categories?.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-card border border-border rounded-xl">لا توجد أقسام. أضف قسمك الأول!</div>
        ) : (
          categories?.sort((a,b) => a.sortOrder - b.sortOrder).map((category) => (
            <Card key={category.id} className="bg-card border-border hover:border-primary/50 transition-colors group relative overflow-hidden">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{category.icon}</div>
                <h3 className="text-xl font-bold mb-1">{category.nameAr}</h3>
                <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded-md border border-border">{category.slug}</span>
                
                <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="secondary" size="icon" className="h-8 w-8 bg-black/50 hover:bg-blue-500/20 text-blue-400" onClick={() => openEdit(category)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="secondary" size="icon" className="h-8 w-8 bg-black/50 hover:bg-destructive/20 text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-border">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white text-right">تأكيد الحذف</AlertDialogTitle>
                        <AlertDialogDescription className="text-right">
                          هل أنت متأكد من حذف قسم "{category.nameAr}"؟
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex-row-reverse gap-2 sm:space-x-0">
                        <AlertDialogCancel className="mt-0">إلغاء</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={() => handleDelete(category.id)}>
                          نعم، احذف
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
