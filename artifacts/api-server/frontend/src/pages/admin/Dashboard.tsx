import { useGetDashboardStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils, FolderTree, CheckCircle2, XCircle, Image as ImageIcon } from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading } = useGetDashboardStats();

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;
  }

  const statCards = [
    { title: "إجمالي الأطباق", value: stats?.totalItems || 0, icon: Utensils, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "الأقسام", value: stats?.totalCategories || 0, icon: FolderTree, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "أطباق متوفرة", value: stats?.availableItems || 0, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "غير متوفرة", value: stats?.unavailableItems || 0, icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
    { title: "الصور المرفوعة", value: stats?.totalUploads || 0, icon: ImageIcon, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">لوحة التحكم</h1>
        <p className="text-muted-foreground mt-2">نظرة عامة على إحصائيات مطعمك</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((stat, i) => (
          <Card key={i} className="bg-card border-border border">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border border">
          <CardHeader>
            <CardTitle className="text-lg">الأطباق حسب القسم</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.itemsByCategory?.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="font-medium">{item.category}</span>
                  <div className="flex items-center gap-4 flex-1 mx-4">
                    <div className="h-2 flex-1 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ width: `${Math.max(5, (item.count / (stats.totalItems || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-muted-foreground w-8 text-left">{item.count}</span>
                </div>
              ))}
              {!stats?.itemsByCategory?.length && (
                <p className="text-muted-foreground text-center py-4">لا توجد بيانات متاحة</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
