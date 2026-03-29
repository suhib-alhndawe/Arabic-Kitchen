import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  FolderTree, 
  Image as ImageIcon, 
  Settings as SettingsIcon, 
  LogOut, 
  Menu as MenuIcon, 
  X 
} from "lucide-react";
import { useAuth, useAdminLogin, useAdminLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { path: "/admin", label: "لوحة التحكم", icon: LayoutDashboard, exact: true },
  { path: "/admin/menu", label: "إدارة المنيو", icon: UtensilsCrossed },
  { path: "/admin/categories", label: "الأقسام", icon: FolderTree },
  { path: "/admin/media", label: "مكتبة الصور", icon: ImageIcon },
  { path: "/admin/settings", label: "الإعدادات", icon: SettingsIcon },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: auth, isLoading: authLoading } = useAuth();
  const loginMutation = useAdminLogin();
  const logoutMutation = useAdminLogout();
  const { toast } = useToast();
  const [location] = useLocation();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div></div>;
  }

  if (!auth?.authenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
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
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col md:flex-row text-white" dir="rtl">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border">
        <div className="font-bold text-lg">لوحة التحكم</div>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 right-0 z-50 w-64 bg-card border-l border-border transform transition-transform duration-200 ease-in-out flex flex-col
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-border hidden md:block">
          <h2 className="text-xl font-bold text-primary">لوحة الإدارة</h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.exact ? location === item.path : location.startsWith(item.path);
            return (
              <Link 
                key={item.path} 
                href={item.path}
                onClick={() => setSidebarOpen(false)} 
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {auth.username?.[0]?.toUpperCase() || 'A'}
            </div>
            <div>
              <p className="text-sm font-medium">{auth.username}</p>
              <p className="text-xs text-muted-foreground">مدير النظام</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full text-destructive border-destructive/30 hover:bg-destructive/10 justify-start gap-2"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-full">
        <div className="max-w-7xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
