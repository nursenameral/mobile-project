<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class InvoiceController extends Controller
{
    /**
     * Fatura ekle
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'baslik' => 'required|string|max:255',
            'tutar' => 'required|numeric|min:0',
            'tur' => ['required', Rule::in(['elektrik', 'su', 'dogalgaz'])],
            'son_odeme_tarihi' => 'required|date',
        ]);

        $invoice = Invoice::create([
            'user_id' => $request->user()->id,
            'baslik' => $request->baslik,
            'tutar' => $request->tutar,
            'tur' => $request->tur,
            'son_odeme_tarihi' => $request->son_odeme_tarihi,
            'durum' => 'odenmedi'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Fatura başarıyla oluşturuldu',
            'data' => ['invoice' => $invoice]
        ], 201);
    }

    /**
     * Fatura sil
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $invoice = Invoice::where('user_id', $request->user()->id)->find($id);

        if (!$invoice) {
            return response()->json([
                'success' => false,
                'message' => 'Fatura bulunamadı'
            ], 404);
        }

        $invoice->delete();

        return response()->json([
            'success' => true,
            'message' => 'Fatura başarıyla silindi'
        ]);
    }

    /**
     * Fatura öde
     */
    public function pay(Request $request, $id): JsonResponse
    {
        $invoice = Invoice::where('user_id', $request->user()->id)->find($id);

        if (!$invoice) {
            return response()->json([
                'success' => false,
                'message' => 'Fatura bulunamadı'
            ], 404);
        }

        if ($invoice->durum === 'odendi') {
            return response()->json([
                'success' => false,
                'message' => 'Bu fatura zaten ödenmiş'
            ], 400);
        }

        $invoice->update(['durum' => 'odendi']);

        return response()->json([
            'success' => true,
            'message' => 'Fatura başarıyla ödendi',
            'data' => ['invoice' => $invoice->fresh()]
        ]);
    }

    /**
     * Ödenmemiş faturaları getir
     */
    public function getUnpaid(Request $request): JsonResponse
    {
        $invoices = Invoice::where('user_id', $request->user()->id)
            ->where('durum', 'odenmedi')
            ->orderBy('son_odeme_tarihi', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => ['invoices' => $invoices]
        ]);
    }

    /**
     * Her fatura türü için son iki fatura tutarını getir
     */
    public function getLastTwoByType(Request $request): JsonResponse
    {
        $types = ['elektrik', 'su', 'dogalgaz'];
        $result = [];

        foreach ($types as $type) {
            $invoices = Invoice::where('user_id', $request->user()->id)
                ->where('tur', $type)
                ->orderBy('created_at', 'desc')
                ->limit(2)
                ->get(['id', 'baslik', 'tutar', 'tur', 'son_odeme_tarihi', 'durum', 'created_at']);

            $result[$type] = $invoices;
        }

        return response()->json([
            'success' => true,
            'data' => ['last_two_by_type' => $result]
        ]);
    }
}
