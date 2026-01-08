<?php

namespace App\Http\Controllers;

use App\Models\Receipt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http; // HTTP istemcisi için
use Illuminate\Support\Facades\Log;

class ReceiptController extends Controller
{
    /**
     * Yeni fiş ekle
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tutar' => 'required|numeric|min:0',
            'baslik' => 'required|string|max:255',
            'tur' => 'required|in:gıda,sağlık,ulaşım,eğlence,giyim,diğer',
            'tarih' => 'required|date',
            'saat' => 'required|date_format:H:i',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasyon hatası',
                'errors' => $validator->errors()
            ], 422);
        }

        $receipt = Receipt::create([
            'user_id' => $request->user()->id,
            'tutar' => $request->tutar,
            'baslik' => $request->baslik,
            'tur' => $request->tur,
            'tarih' => $request->tarih,
            'saat' => $request->saat,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Fiş başarıyla kaydedildi',
            'data' => $receipt
        ], 201);
    }

    /**
     * Fişleri filtrele ve getir
     * 
     * Query parametreleri:
     * - tur: Fiş türü (opsiyonel, belirtilmezse hepsi gelir)
     * - baslangic_tarih: Başlangıç tarihi (opsiyonel)
     * - bitis_tarih: Bitiş tarihi (opsiyonel)
     */
    public function index(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tur' => 'nullable|in:gıda,sağlık,ulaşım,eğlence,giyim,diğer',
            'baslangic_tarih' => 'nullable|date',
            'bitis_tarih' => 'nullable|date|after_or_equal:baslangic_tarih',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasyon hatası',
                'errors' => $validator->errors()
            ], 422);
        }

        // Kullanıcının fişlerini al
        $query = Receipt::where('user_id', $request->user()->id);

        // Tür filtresi (belirtilmişse)
        if ($request->has('tur') && $request->tur) {
            $query->where('tur', $request->tur);
        }

        // Başlangıç tarihi filtresi
        if ($request->has('baslangic_tarih') && $request->baslangic_tarih) {
            $query->where('tarih', '>=', $request->baslangic_tarih);
        }

        // Bitiş tarihi filtresi
        if ($request->has('bitis_tarih') && $request->bitis_tarih) {
            $query->where('tarih', '<=', $request->bitis_tarih);
        }

        // Tarihe göre sırala (en yeni en üstte)
        $receipts = $query->orderBy('tarih', 'desc')
                         ->orderBy('saat', 'desc')
                         ->get();

        // Toplam tutar hesapla
        $toplamTutar = $receipts->sum('tutar');

        return response()->json([
            'success' => true,
            'data' => [
                'receipts' => $receipts,
                'toplam_tutar' => $toplamTutar,
                'adet' => $receipts->count(),
            ]
        ], 200);
    }

    /**
     * Tek bir fiş detayı
     */
    public function show($id)
    {
        $receipt = Receipt::where('user_id', auth()->id())
                         ->find($id);

        if (!$receipt) {
            return response()->json([
                'success' => false,
                'message' => 'Fiş bulunamadı'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $receipt
        ], 200);
    }

    /**
     * Fiş güncelle
     */
    public function update(Request $request, $id)
    {
        $receipt = Receipt::where('user_id', $request->user()->id)
                         ->find($id);

        if (!$receipt) {
            return response()->json([
                'success' => false,
                'message' => 'Fiş bulunamadı'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'tutar' => 'sometimes|numeric|min:0',
            'baslik' => 'sometimes|string|max:255',
            'tur' => 'sometimes|in:gıda,sağlık,ulaşım,eğlence,giyim,diğer',
            'tarih' => 'sometimes|date',
            'saat' => 'sometimes|date_format:H:i',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasyon hatası',
                'errors' => $validator->errors()
            ], 422);
        }

        $receipt->update($request->only(['tutar', 'baslik', 'tur', 'tarih', 'saat']));

        return response()->json([
            'success' => true,
            'message' => 'Fiş güncellendi',
            'data' => $receipt
        ], 200);
    }

    /**
     * Fiş sil
     */
    public function destroy($id)
    {
        $receipt = Receipt::where('user_id', auth()->id())
                         ->find($id);

        if (!$receipt) {
            return response()->json([
                'success' => false,
                'message' => 'Fiş bulunamadı'
            ], 404);
        }

        $receipt->delete();

        return response()->json([
            'success' => true,
            'message' => 'Fiş silindi'
        ], 200);
    }

    /**
     * Türlere göre özet (Periyodik)
     * 
     * Query parametreleri:
     * - periyot: haftalık, aylık, yıllık (zorunlu)
     */
    public function summary(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'periyot' => 'required|in:haftalık,aylık,yıllık',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasyon hatası',
                'errors' => $validator->errors()
            ], 422);
        }

        $query = Receipt::where('user_id', $request->user()->id);

        // Periyoda göre tarih aralığını belirle
        $baslangic_tarih = null;
        $bitis_tarih = now();

        switch ($request->periyot) {
            case 'haftalık':
                $baslangic_tarih = now()->subDays(7);
                break;
            case 'aylık':
                $baslangic_tarih = now()->subMonth();
                break;
            case 'yıllık':
                $baslangic_tarih = now()->subYear();
                break;
        }

        // Tarih filtresi uygula
        $query->whereBetween('tarih', [$baslangic_tarih->format('Y-m-d'), $bitis_tarih->format('Y-m-d')]);

        // Türlere göre grupla
        $summary = $query->selectRaw('tur, SUM(tutar) as toplam, COUNT(*) as adet')
                        ->groupBy('tur')
                        ->get();

        $genel_toplam = $summary->sum('toplam');

        // Her tür için yüzde hesapla
        $tur_ozeti = $summary->map(function ($item) use ($genel_toplam) {
            $yuzde = $genel_toplam > 0 ? round(($item->toplam / $genel_toplam) * 100, 2) : 0;
            
            return [
                'tur' => $item->tur,
                'toplam' => (float) $item->toplam,
                'adet' => $item->adet,
                'yuzde' => $yuzde,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'periyot' => $request->periyot,
                'tarih_araligi' => [
                    'baslangic' => $baslangic_tarih->format('Y-m-d'),
                    'bitis' => $bitis_tarih->format('Y-m-d'),
                ],
                'tur_ozeti' => $tur_ozeti,
                'genel_toplam' => (float) $genel_toplam,
                'genel_adet' => $summary->sum('adet'),
            ]
        ], 200);
    }
    /**
     * Groq AI ile Kategori Tahmini
     */
public function predictCategory(Request $request)
    {
        // 1. Girdi Kontrolü
        $validator = Validator::make($request->all(), [
            'merchant_name' => 'nullable|string', 
            'receipt_text'  => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'category' => 'diğer']);
        }

        $merchant = $request->input('merchant_name') ?? '';
        $fullText = $request->input('receipt_text') ?? '';
        $apiKey = env('GROQ_API_KEY');

        // ---------------------------------------------------------
        // ADIM 1: YEREL KONTROL (Hızlı ve Bedava)
        // ---------------------------------------------------------
        $categories = [
            'gıda' => ['market', 'bakkal', 'fırın', 'cafe', 'restoran', 'migros', 'bim', 'a101', 'şok', 'starbucks', 'burger', 'simit', 'yemek', 'lokanta'],
            'sağlık' => ['eczane', 'hastane', 'medikal', 'diş', 'doktor', 'optik', 'laboratuvar'],
            'ulaşım' => ['petrol', 'shell', 'opet', 'bp', 'taksi', 'bilet', 'otopark', 'uber', 'martı', 'moov', 'akaryakıt'],
            'eğlence' => ['sinema', 'tiyatro', 'biletix', 'netflix', 'spotify', 'oyun', 'konser', 'müze'],
            'giyim' => ['giyim', 'ayakkabı', 'mağaza', 'butik', 'tekstil', 'zara', 'lcw', 'koton', 'boyner', 'hm', 'nike', 'adidas'],
            'elektrik' => ['elektrik', 'bedaş', 'enerjisa', 'gediz', 'ck', 'akdeniz', 'toroslar', 'sedaş'],
            'su' => ['su', 'iski', 'aski', 'izsu', 'buski', 'kaski'],
            'dogalgaz' => ['gaz', 'doğalgaz', 'igdaş', 'başkentgaz', 'bursagaz', 'izmirgaz', 'aksa']
        ];

        $lowerMerchant = mb_strtolower($merchant, 'UTF-8');
        
        if (!empty($lowerMerchant)) {
            foreach ($categories as $cat => $keywords) {
                foreach ($keywords as $kw) {
                    if (str_contains($lowerMerchant, $kw)) {
                        return response()->json(['success' => true, 'category' => $cat, 'source' => 'local_rule']);
                    }
                }
            }
        }

        // ---------------------------------------------------------
        // ADIM 2: GROQ AI ANALİZİ (JSON Modu ile Güçlendirilmiş)
        // ---------------------------------------------------------
        if (!$apiKey) {
            return response()->json(['success' => true, 'category' => 'diğer']);
        }

        // Metni kısalt (Token tasarrufu)
        $analysisText = !empty($fullText) ? mb_substr($fullText, 0, 1000) : $merchant;

        try {
            // 1. Önce AI'ya ne gönderdiğimizi görelim (Boş gidiyor olabilir mi?)
            Log::info("📤 Groq'a Giden Metin ($analysisText)");

            // Model seçimi: Llama 3 bazen JSON modunda tutukluk yapabilir, Mixtral daha sağlamdır.
            // Şimdilik Llama 3 kalsın ama response_format'ı kaldırıp manuel JSON isteyeceğiz.
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->post('https://api.groq.com/openai/v1/chat/completions', [
                    'model' => 'llama-3.3-70b-versatile',
                    'messages' => [
                    [
                        'role' => 'system', 
                        'content' => "Sen bir API asistanısın. Verilen fiş metnini analiz et. Kategori şunlardan biri olmalı: [gıda, sağlık, ulaşım, eğlence, giyim, elektrik, su, dogalgaz, diğer]. \nCevap olarak sadece saf JSON ver. Markdown, ```json``` etiketi veya ek açıklama kullanma. Örnek format: {\"category\": \"gıda\", \"reason\": \"ekmek var\"}"
                    ],
                    [
                        'role' => 'user', 
                        'content' => "Fiş metni: $analysisText"
                    ]
                ],
                'temperature' => 0.1,
                // 'response_format' => ['type' => 'json_object'] // 👈 BUNU GEÇİCİ OLARAK KAPATTIK (Bazı modellerde hata verdiriyor)
            ]);

            $jsonResponse = $response->json();

            // 2. Groq'tan dönen TÜM yanıtı loglayalım (Hata mesajı var mı?)
            Log::info("🔍 Groq Tam Yanıt:", $jsonResponse);

            if (isset($jsonResponse['error'])) {
                Log::error("❌ Groq API Hatası: " . json_encode($jsonResponse['error']));
                return response()->json(['success' => true, 'category' => 'diğer', 'reason' => 'API Hatası']);
            }

            $rawContent = $jsonResponse['choices'][0]['message']['content'] ?? null;

            if (!$rawContent) {
                Log::error("❌ Groq içerik döndürmedi (Content null).");
                return response()->json(['success' => true, 'category' => 'diğer', 'reason' => 'Boş yanıt']);
            }

            Log::info("🤖 Groq Ham İçerik: " . $rawContent);

            // Bazen AI ```json ... ``` etiketiyle döner, onu temizleyelim
            $cleanJson = str_replace(['```json', '```'], '', $rawContent);
            
            $parsedContent = json_decode($cleanJson, true);
            
            // Eğer JSON parse edilemezse
            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::warning("⚠️ JSON Parse Hatası. Ham metin kullanılıyor.");
                // JSON bozuksa, basitçe metin içinde kategori arayalım
                $aiCategory = 'diğer';
                foreach ($categories as $cat => $val) {
                    if (str_contains(mb_strtolower($cleanJson), $cat)) {
                        $aiCategory = $cat;
                        break;
                    }
                }
                $reason = "JSON parse edilemedi, metin tarandı.";
            } else {
                $aiCategory = $parsedContent['category'] ?? 'diğer';
                $reason = $parsedContent['reason'] ?? 'Sebep yok';
            }

            // Temizlik ve Validasyon
            $aiCategory = trim(mb_strtolower($aiCategory, 'UTF-8'));
            $valid = array_keys($categories);
            $valid[] = 'diğer';
            
            if (!in_array($aiCategory, $valid)) $aiCategory = 'diğer';

            return response()->json([
                'success' => true, 
                'category' => $aiCategory,
                'reason' => $reason,
                'source' => 'groq_ai_mixtral'
            ]);

        } catch (\Exception $e) {
            Log::error("❌ Kritik Hata: " . $e->getMessage());
            return response()->json(['success' => true, 'category' => 'diğer']);
        }
    }
}