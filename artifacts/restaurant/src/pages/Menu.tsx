import { useState } from "react";
import { Search, UtensilsCrossed } from "lucide-react";
import { useDebounce } from "use-debounce";
import { motion, AnimatePresence } from "framer-motion";
import { useMenu } from "@/hooks/use-menu";
import { MenuItemCard } from "@/components/menu/MenuItemCard";
import { Input } from "@/components/ui/input";

const CATEGORIES = ["الكل", "كباب", "شقف", "عرايس", "صواني", "دجاج", "شيش"];

export default function Menu() {
  const [activeTab, setActiveTab] = useState("الكل");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 500);

  const { data: menuItems, isLoading, error } = useMenu({
    category: activeTab !== "الكل" ? activeTab : undefined,
    search: debouncedSearch || undefined,
  });

  return (
    <div className="min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-white mb-4"
          >
            قائمة الطعام
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg"
          >
            تصفح أشهى الأطباق المحضرة طازجاً على الفحم
          </motion.p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-center mb-12">
          
          {/* Categories Scrollable Row */}
          <div className="w-full lg:w-auto overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex gap-2 min-w-max">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                    activeTab === cat 
                      ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(234,88,12,0.4)]" 
                      : "bg-card text-muted-foreground border border-border hover:border-primary/50 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full lg:w-80 shrink-0">
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input
              type="text"
              placeholder="ابحث عن طبق..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4 pr-12 py-6 rounded-2xl bg-card border-border focus:border-primary focus:ring-primary/20 text-base"
            />
          </div>
        </div>

        {/* Menu Grid */}
        {error ? (
          <div className="text-center py-20 text-destructive bg-destructive/10 rounded-2xl border border-destructive/20">
            <p className="font-bold text-lg">عذراً، حدث خطأ أثناء تحميل القائمة.</p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-[380px] rounded-2xl bg-card animate-pulse border border-border"></div>
            ))}
          </div>
        ) : menuItems?.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-32 flex flex-col items-center justify-center bg-card/50 rounded-3xl border border-dashed border-white/10"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
              <UtensilsCrossed className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">لا توجد أطباق</h3>
            <p className="text-muted-foreground">لم يتم العثور على أطباق تطابق بحثك أو في هذا القسم.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {menuItems?.map((item, index) => (
                <MenuItemCard key={item.id} item={item} index={index} />
              ))}
            </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  );
}
