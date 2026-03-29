import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Flame, Star, Clock, ShieldCheck } from "lucide-react";
import { MenuItemCard } from "@/components/menu/MenuItemCard";
import { useMenu } from "@/hooks/use-menu";

export default function Home() {
  const { data: menuItems, isLoading } = useMenu();

  // Show up to 3 available items as featured
  const featuredItems = menuItems?.filter(i => i.available).slice(0, 3) || [];

  return (
    <div className="min-h-screen">
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
            alt="Hero Grill Background" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background"></div>
        </div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm text-primary font-medium text-sm"
          >
            <Flame className="w-4 h-4 animate-pulse" />
            <span>طعم أصيل، جودة لا تضاهى</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight"
          >
            أفضل المشاوي <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-orange-400">الطازجة يومياً</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            نقدم لكم تشكيلة واسعة من الكباب، الشقف، والعرايس المحضرة بأجود أنواع اللحوم المحلية والمشوية بعناية على الفحم.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link 
              href="/menu" 
              className="px-8 py-4 rounded-xl font-bold text-lg bg-primary text-primary-foreground glow-primary hover:bg-primary/90 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group"
            >
              اطلب الآن
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-background border border-white/5 hover:border-primary/30 transition-colors">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">جودة ممتازة</h3>
              <p className="text-muted-foreground">نختار لحومنا بعناية فائقة من أفضل المزارع المحلية لضمان الطعم الفريد.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-background border border-white/5 hover:border-primary/30 transition-colors">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                <Flame className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">شوي على الفحم</h3>
              <p className="text-muted-foreground">سر النكهة يكمن في طريقة الشوي التقليدية على الفحم الطبيعي.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-background border border-white/5 hover:border-primary/30 transition-colors">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">نظافة فائقة</h3>
              <p className="text-muted-foreground">نلتزم بأعلى معايير النظافة والسلامة الغذائية في جميع مراحل التحضير.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED MENU SECTION */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">الأطباق المميزة</h2>
              <p className="text-muted-foreground">اكتشف أكثر أطباقنا طلباً وشعبية</p>
            </div>
            <Link href="/menu" className="text-primary hover:text-orange-400 font-bold flex items-center gap-1 group">
              عرض القائمة كاملة
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[400px] rounded-2xl bg-card animate-pulse border border-border"></div>
              ))}
            </div>
          ) : featuredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredItems.map((item, i) => (
                <MenuItemCard key={item.id} item={item} index={i} />
              ))}
            </div>
          ) : (
            /* Fallback static items if API is completely empty */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-70 grayscale">
               {/* dark moody grill fire restaurant premium kebab */}
               <div className="bg-card border border-border rounded-2xl overflow-hidden p-5 flex flex-col justify-end h-[350px] relative">
                  <img src="https://images.unsplash.com/photo-1529144415895-6aaf8be872fb?w=800&q=80" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                  <h3 className="relative z-10 text-xl font-bold text-white mb-2">كباب لحم بلدي</h3>
                  <p className="relative z-10 text-muted-foreground">مثال توضيحي - القائمة فارغة حالياً</p>
               </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
