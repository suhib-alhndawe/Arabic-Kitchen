import { motion } from "framer-motion";
import type { MenuItem } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";

interface MenuItemCardProps {
  item: MenuItem;
  index: number;
}

export function MenuItemCard({ item, index }: MenuItemCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group bg-card border border-border rounded-2xl overflow-hidden shadow-lg hover:shadow-[0_8px_30px_-5px_rgba(234,88,12,0.15)] hover:border-primary/30 transition-all duration-300 flex flex-col h-full"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.nameAr}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <span className="text-muted-foreground">لا توجد صورة</span>
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <Badge className="bg-black/60 backdrop-blur-md text-white hover:bg-black/80 border-white/10">
            {item.category}
          </Badge>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-80"></div>
      </div>

      <div className="p-5 flex flex-col flex-grow gap-3 relative z-10">
        <div className="flex justify-between items-start gap-4">
          <h3 className="font-bold text-lg text-foreground line-clamp-1">{item.nameAr}</h3>
          <span className="font-black text-xl text-primary shrink-0">{item.price} د.أ</span>
        </div>
        
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 flex-grow">
          {item.descriptionAr}
        </p>

        {!item.available && (
          <div className="mt-2 text-xs font-bold text-destructive bg-destructive/10 py-1.5 px-3 rounded-md text-center">
            غير متوفر حالياً
          </div>
        )}
      </div>
    </motion.div>
  );
}
