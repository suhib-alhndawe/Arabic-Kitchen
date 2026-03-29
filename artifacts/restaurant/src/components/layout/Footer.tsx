import { Link } from "wouter";
import { Instagram, MapPin, Phone, Clock } from "lucide-react";
import logoImg from "@assets/image_1774764313293.png";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-8">
          
          {/* Brand */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-3">
              <img src={logoImg} alt="فصاح لحم" className="w-16 h-16 rounded-full border border-white/10" />
              <div className="flex flex-col">
                <span className="font-bold text-2xl text-white">فصاح لحم</span>
                <span className="text-sm text-primary">للمشاوي الأصيلة</span>
              </div>
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-sm">
              نقدم لكم أفضل وأجود أنواع اللحوم الطازجة يومياً، مشوية على الفحم بالطريقة التقليدية التي تضمن لكم الطعم الأصيل.
            </p>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-6">
            <h3 className="text-lg font-bold text-white relative inline-block w-fit">
              تواصل معنا
              <span className="absolute -bottom-2 right-0 w-1/2 h-1 bg-primary rounded-full"></span>
            </h3>
            <ul className="flex flex-col gap-4 text-muted-foreground">
              <li className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <span>الرياض، المملكة العربية السعودية</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <span dir="ltr">+966 50 000 0000</span>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <span>يومياً: 12:00 م - 2:00 ص</span>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-6">
            <h3 className="text-lg font-bold text-white relative inline-block w-fit">
              روابط سريعة
              <span className="absolute -bottom-2 right-0 w-1/2 h-1 bg-primary rounded-full"></span>
            </h3>
            <ul className="flex flex-col gap-3">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">الرئيسية</Link>
              </li>
              <li>
                <Link href="/menu" className="text-muted-foreground hover:text-primary transition-colors">قائمة الطعام</Link>
              </li>
              <li>
                <Link href="/admin" className="text-muted-foreground hover:text-primary transition-colors">الإدارة</Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} مطعم ومشاوي فصاح لحم. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all">
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
