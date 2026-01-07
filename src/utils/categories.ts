// src/utils/categories.ts

// FİŞ KATEGORİLERİ
export const RECEIPT_CATEGORIES = [
  { id: 'gıda', label: 'Gıda', icon: '🍔', keywords: ['migros', 'bim', 'a101', 'şok', 'market', 'fırın', 'pastane', 'burger', 'cafe', 'restoran', 'starbucks', 'köfteci', 'simit', 'gıda'] },
  { id: 'sağlık', label: 'Sağlık', icon: '💊', keywords: ['eczane', 'hastane', 'medikal', 'diş', 'doktor', 'optik', 'laboratuvar', 'sağlık'] },
  { id: 'ulaşım', label: 'Ulaşım', icon: '🚗', keywords: ['petrol', 'shell', 'opet', 'bp', 'taksi', 'bilet', 'otopark', 'uber', 'martı', 'moov', 'tcd.d', 'yolculuk', 'akaryakıt'] },
  { id: 'eğlence', label: 'Eğlence', icon: '🎉', keywords: ['sinema', 'tiyatro', 'oyun', 'netflix', 'spotify', 'etkinlik', 'biletix', 'konser', 'müze'] },
  { id: 'giyim', label: 'Giyim', icon: '👕', keywords: ['zara', 'lcw', 'koton', 'giyim', 'ayakkabı', 'mağaza', 'boyner', 'hm', 'mango', 'nike', 'adidas', 'sport'] },
  { id: 'diğer', label: 'Diğer', icon: '📦', keywords: [] },
];

// FATURA KATEGORİLERİ
export const INVOICE_CATEGORIES = [
  { id: 'elektrik', label: 'Elektrik', icon: '⚡', keywords: ['elektrik', 'bedaş', 'enerjisa', 'gediz', 'ck', 'akdeniz', 'toroslar', 'sedaş'] },
  { id: 'su', label: 'Su', icon: '💧', keywords: ['su', 'iski', 'aski', 'izsu', 'buski', 'kaski'] },
  { id: 'dogalgaz', label: 'Doğalgaz', icon: '🔥', keywords: ['gaz', 'igdaş', 'başkentgaz', 'bursagaz', 'izmirgaz', 'aksa'] },
];

// Fiş Kategorisi Tahmini 
export const detectCategory = (vendorName: string | undefined, fullText: string = ""): string | null => {
  const lowerVendor = vendorName ? vendorName.toLowerCase() : "";
  const lowerText = fullText.toLowerCase();

  for (const cat of RECEIPT_CATEGORIES) {
    // 1. Önce Satıcı İsmine Bak 
    if (lowerVendor && cat.keywords.some(keyword => lowerVendor.includes(keyword))) {
      return cat.id;
    }
  }

  // 2. Satıcıda bulamadıysak, Fişin İçeriğine Bak 
  for (const cat of RECEIPT_CATEGORIES) {
     if (cat.keywords.some(keyword => lowerText.includes(keyword))) {
       return cat.id;
     }
  }

  return null;
};

// Fatura Kategorisi Tahmini (Bulamazsa null döner)
export const detectInvoiceCategory = (vendorName: string | undefined): string | null => {
  if (!vendorName) return null;
  const lowerVendor = vendorName.toLowerCase();

  for (const cat of INVOICE_CATEGORIES) {
    if (cat.keywords.some(keyword => lowerVendor.includes(keyword))) {
      return cat.id;
    }
  }
  return null;
};