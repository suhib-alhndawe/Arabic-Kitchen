import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit2, Trash2, LogOut, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth, useAdminLogin, useAdminLogout } from "@/hooks/use-auth";
import { useMenu, useCreateMenu, useUpdateMenu, useDeleteMenu } from "@/hooks/use-menu";
import type { MenuItem } from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = ["كباب", "شقف", "عرايس", "صواني", "دجاج", "شيش", "مقبلات", "مشروبات"];

const menuItemSchema = z.object({
  name: z.string().min(1, "مطلوب"),
  nameAr: z.string().min(1, "مطلوب"),
  category: z.string().min(1, "مطلوب"),
  price: z.coerce.number().min(0.1, "يجب أن يكون أكبر من 0"),
  description: z.string(),
  descriptionAr: z.string(),
  imageUrl: z.string().url("رابط غير صحيح").or(z.literal("")),
  available: z.boolean().default(true),
});

type MenuItemFormValues = z.infer<typeof menuItemSchema>;

export default function Admin() {
  const { data: auth, isLoading: authLoading } = useAuth();
  const loginMutation = useAdminLogin();
  const logoutMutation = useAdminLogout();
  const { toast } = useToast();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(
      { data: { username, password } },
      {
        onSuccess: (res) => {
          if (res.success) {
            toast({ title: "تم تسجيل الدخول بنجاح" });
          } else {
            toast({ title: "فشل تسجيل الدخول", description: res.message, variant: "destructive" });
          }
        },
        onError: (err) => {
          toast({ title: "خطأ", description: err.error?.error || "حدث خطأ", variant: "destructive" });
        }
      }
    );
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div></div>;
  }

  if (!auth?.authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-md border-white/10 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">تسجيل الدخول للإدارة</CardTitle>
            <CardDescription>أدخل بيانات الاعتماد الخاصة بك للوصول إلى لوحة التحكم</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">اسم المستخدم</label>
                <Input 
                  dir="ltr"
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  className="bg-background border-border text-left"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">كلمة المرور</label>
                <Input 
                  dir="ltr"
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="bg-background border-border text-left"
                  required
                />
              </div>
              <Button type="submit" className="w-full mt-4" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "جاري التحقق..." : "دخول"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8 bg-card p-6 rounded-2xl border border-border">
          <div>
            <h1 className="text-2xl font-bold text-white">لوحة تحكم القائمة</h1>
            <p className="text-muted-foreground text-sm">مرحباً بك، {auth.username}</p>
          </div>
          <Button 
            variant="outline" 
            className="text-destructive border-destructive/50 hover:bg-destructive/10"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="w-4 h-4 ml-2" />
            تسجيل الخروج
          </Button>
        </div>

        <AdminDashboard />
      </div>
    </div>
  );
}

function AdminDashboard() {
  const { data: menuItems, isLoading } = useMenu();
  const createMutation = useCreateMenu();
  const updateMutation = useUpdateMenu();
  const deleteMutation = useDeleteMenu();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: "",
      nameAr: "",
      category: CATEGORIES[0],
      price: 0,
      description: "",
      descriptionAr: "",
      imageUrl: "",
      available: true,
    }
  });

  const openCreate = () => {
    setEditingItem(null);
    form.reset({
      name: "", nameAr: "", category: CATEGORIES[0], price: 0, description: "", descriptionAr: "", imageUrl: "", available: true
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
      description: item.description,
      descriptionAr: item.descriptionAr,
      imageUrl: item.imageUrl,
      available: item.available,
    });
    setIsDialogOpen(true);
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
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="p-6 flex justify-between items-center border-b border-border">
        <h2 className="text-xl font-bold text-white">إدارة الأطباق</h2>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة طبق جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-card border-border max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white text-xl">
                {editingItem ? "تعديل الطبق" : "إضافة طبق جديد"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">الاسم (عربي)</label>
                  <Input {...form.register("nameAr")} className="bg-background" />
                  {form.formState.errors.nameAr && <p className="text-xs text-destructive">{form.formState.errors.nameAr.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">الاسم (انجليزي)</label>
                  <Input {...form.register("name")} className="bg-background text-left" dir="ltr" />
                  {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">السعر (د.أ)</label>
                  <Input type="number" step="0.01" {...form.register("price")} className="bg-background" />
                  {form.formState.errors.price && <p className="text-xs text-destructive">{form.formState.errors.price.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">القسم</label>
                  <Select 
                    value={form.watch("category")} 
                    onValueChange={(v) => form.setValue("category", v)}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="اختر القسم" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">الوصف (عربي)</label>
                <Textarea {...form.register("descriptionAr")} className="bg-background resize-none h-20" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">رابط الصورة (URL)</label>
                <Input {...form.register("imageUrl")} className="bg-background text-left" dir="ltr" placeholder="https://..." />
                {form.formState.errors.imageUrl && <p className="text-xs text-destructive">{form.formState.errors.imageUrl.message}</p>}
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="available" 
                  checked={form.watch("available")} 
                  onCheckedChange={(c) => form.setValue("available", c as boolean)} 
                />
                <label htmlFor="available" className="text-sm font-medium leading-none cursor-pointer">
                  متوفر للطلب
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
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-background shrink-0 border border-white/10">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">صورة</div>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-white">{item.nameAr}</div>
                      <div className="text-xs text-muted-foreground truncate w-48">{item.descriptionAr}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-background px-2.5 py-1 rounded-md text-xs border border-border">{item.category}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-primary">{item.price} د.أ</td>
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
  );
}
