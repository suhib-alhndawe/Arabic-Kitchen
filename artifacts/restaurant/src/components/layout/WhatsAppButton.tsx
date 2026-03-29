import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export function WhatsAppButton() {
  const phoneNumber = "966500000000";
  const message = encodeURIComponent("مرحباً، أريد الطلب من مطعم فصاح لحم.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_25px_rgba(34,197,94,0.6)] transition-shadow"
      aria-label="اطلب عبر الواتساب"
    >
      <MessageCircle className="w-7 h-7" />
      
      {/* Ping animation effect */}
      <span className="absolute inset-0 rounded-full bg-green-500 opacity-20 animate-ping"></span>
    </motion.a>
  );
}
