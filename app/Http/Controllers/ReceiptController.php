<?php

namespace App\Http\Controllers;

use App\Models\Receipt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

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
}
