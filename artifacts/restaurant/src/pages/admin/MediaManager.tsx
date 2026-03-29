import { useState, useRef } from "react";
import { Upload, Copy, ExternalLink, Image as ImageIcon } from "lucide-react";
import { useGetUploads } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function MediaManager() {
  const { data: uploads, isLoading, refetch } = useGetUploads();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ title: "خطأ", description: "يرجى رفع صور فقط", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('فشل الرفع');
      toast({ title: "تم رفع الصورة بنجاح" });
      refetch();
    } catch (error) {
      toast({ title: "حدث خطأ أثناء رفع الصورة", variant: "destructive" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "تم نسخ الرابط", description: "يمكنك الآن لصقه في أي مكان" });
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">مكتبة الصور</h1>
        <p className="text-muted-foreground mt-2">إدارة جميع الصور المرفوعة في الموقع</p>
      </div>

      <Card className={`border-2 border-dashed transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
        <CardContent 
          className="flex flex-col items-center justify-center py-12 text-center"
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
            {isUploading ? (
              <div className="animate-spin w-8 h-8 border-4 border-current border-t-transparent rounded-full" />
            ) : (
              <Upload className="w-8 h-8" />
            )}
          </div>
          <h3 className="text-xl font-bold mb-2">ارفع صورة جديدة</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">اسحب الصورة وأفلتها هنا، أو اضغط على الزر لاختيار ملف من جهازك</p>
          
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading} size="lg" className="px-8">
            {isUploading ? "جاري الرفع..." : "اختر صورة"}
          </Button>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-primary" />
          الصور المرفوعة ({uploads?.length || 0})
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square bg-white/5 rounded-xl animate-pulse"></div>
            ))
          ) : uploads?.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground bg-card border border-border rounded-xl">لا توجد صور مرفوعة بعد.</div>
          ) : (
            uploads?.map((file, i) => (
              <div key={i} className="group relative aspect-square rounded-xl overflow-hidden bg-card border border-border">
                <img src={file.url} alt={file.filename} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 gap-2">
                  <span className="text-xs text-white truncate w-full text-center px-2" dir="ltr">{file.filename}</span>
                  <span className="text-xs text-white/70">{formatSize(file.size)}</span>
                  <div className="flex gap-2 mt-2">
                    <Button size="icon" variant="secondary" className="h-8 w-8 hover:bg-primary hover:text-white" onClick={() => copyUrl(file.url)} title="نسخ الرابط">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <a href={file.url} target="_blank" rel="noopener noreferrer">
                      <Button size="icon" variant="secondary" className="h-8 w-8 hover:bg-white hover:text-black" title="فتح في نافذة جديدة">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
