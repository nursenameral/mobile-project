// src/utils/categories.ts

// FİŞ KATEGORİLERİ
export const RECEIPT_CATEGORIES = [
  { id: 'gıda', label: 'Gıda', icon: '🍔', keywords: ['migros', 'bim', 'a101', 'şok', 'market', 'fırın', 'pastane', 'burger', 'cafe', 'restoran', 'starbucks', 'köfteci', 'simit', 'gıda'] },
  { id: 'sağlık', label: 'Sağlık', icon: '💊', keywords: ['eczane', 'hastane', 'medikal', 'diş', 'doktor', 'optik', 'laboratuvar', 'sağlık'] },
  { id: 'ulaşım', label: 'Ulaşım', icon: '🚗', keywords: ['petrol', 'shell', 'opet', 'bp', 'taksi', 'bilet', 'otopark', 'uber', 'martı', 'moov', 'tcd.d', 'yolculuk', 'akaryakıt'] },
  { id: 'eğlence', label: 'Eğlence', icon: '🎉', keywords: ['sinema', 'tiyatro', 'oyun', 'netflix', 'spotify', 'etkinlik', 'biletix', 'konser', 'müze'] },
  { id: 'giyim', label: 'Giyim', icon: '👕', keywords: ['zara', 'lcw', 'koton', 'giyim', 'ayakkabı', 'boyner', 'hm', 'mango', 'nike', 'adidas', 'sport'] },
  { id: 'diğer', label: 'Diğer', icon: '📦', keywords: [] },
];

// FATURA KATEGORİLERİ
export const INVOICE_CATEGORIES = [
  { id: 'elektrik', label: 'Elektrik', icon: '⚡', keywords: ['elektrik', 'bedaş', 'enerjisa', 'gediz', 'ck', 'akdeniz', 'toroslar', 'sedaş'] },
  { id: 'su', label: 'Su', icon: '💧', keywords: ['su', 'iski', 'aski', 'izsu', 'buski', 'kaski'] },
  { id: 'dogalgaz', label: 'Doğalgaz', icon: '🔥', keywords: ['gaz', 'igdaş', 'başkentgaz', 'bursagaz', 'izmirgaz', 'aksa'] },
];

// Fiş Kategorisi Tahmini (Bulamazsa null döner)
export const detectCategory = (vendorName: string | undefined): string | null => {
  if (!vendorName) return null;
  const lowerVendor = vendorName.toLowerCase();

  for (const cat of RECEIPT_CATEGORIES) {
    if (cat.keywords.some(keyword => lowerVendor.includes(keyword))) {
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

export const createInvoice = async (
  token: string, 
  data: { baslik: string; tutar: number; tur: 'elektrik' | 'su' | 'dogalgaz'; son_odeme_tarihi: string }
): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${BASE_URL}/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const resData = await response.json();
    
    if (!response.ok) {
      if ((resData as any)?.errors) {
        const errorMessages = Object.values((resData as any).errors).flat();
        throw new Error((errorMessages as string[]).join(', '));
      }
      throw new Error(resData.message || 'Fatura oluşturulamadı');
    }
    
    return resData;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Ağ hatası oluştu');
  }
};