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
import { getApiErrorMessage } from "@/lib/api-error";

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
    defaultValues: { nameAr: "", slug: "", icon: "", sortOrder: 0 },
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
          onError: (error) => toast({ title: getApiErrorMessage(error, "حدث خطأ"), variant: "destructive" }),
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
          refetch();
        },
        onError: (error) => toast({ title: getApiErrorMessage(error, "حدث خطأ"), variant: "destructive" }),
      },
    );
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "تم الحذف بنجاح" });
          refetch();
        },
        onError: (error) => toast({ title: getApiErrorMessage(error, "حدث خطأ"), variant: "destructive" }),
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">الأقسام</h1>
          <p className="mt-2 text-muted-foreground">إدارة أقسام المنيو</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة قسم جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border bg-card sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl text-white">
                {editingItem ? "تعديل القسم" : "إضافة قسم جديد"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">الاسم (عربي)</label>
                <Input {...form.register("nameAr")} className="bg-background" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">المعرف (Slug)</label>
                <Input {...form.register("slug")} className="bg-background text-left" dir="ltr" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">أيقونة</label>
                  <Input {...form.register("icon")} className="bg-background" placeholder="🍢" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">الترتيب</label>
                  <Input type="number" {...form.register("sortOrder")} className="bg-background text-center" />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-border pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>إلغاء</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) ? "جاري الحفظ..." : "حفظ القسم"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">جاري التحميل...</div>
        ) : categories?.length === 0 ? (
          <div className="col-span-full rounded-xl border border-border bg-card py-12 text-center text-muted-foreground">لا توجد أقسام بعد.</div>
        ) : (
          categories
            ?.slice()
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((category) => (
              <Card key={category.id} className="group relative overflow-hidden border-border bg-card transition-colors hover:border-primary/50">
                <CardContent className="p-6 text-center">
                  <div className="mb-4 text-4xl transition-transform duration-300 group-hover:scale-110">{category.icon}</div>
                  <h3 className="mb-1 text-xl font-bold">{category.nameAr}</h3>
                  <span className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground">{category.slug}</span>

                  <div className="absolute left-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button variant="secondary" size="icon" className="h-8 w-8 bg-black/50 text-blue-400 hover:bg-blue-500/20" onClick={() => openEdit(category)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="secondary" size="icon" className="h-8 w-8 bg-black/50 text-destructive hover:bg-destructive/20">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="border-border bg-card">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-right text-white">تأكيد الحذف</AlertDialogTitle>
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
