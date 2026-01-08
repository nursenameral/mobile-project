<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ReceiptController;
use App\Http\Controllers\InvoiceController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes (kimlik doğrulama gerektirmez)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (kimlik doğrulama gerektirir)
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Receipt routes
    Route::get('/receipts', [ReceiptController::class, 'index']); // Fişleri filtrele ve getir
    Route::post('/receipts', [ReceiptController::class, 'store']); // Yeni fiş ekle
    Route::get('/receipts/{id}', [ReceiptController::class, 'show']); // Tek fiş detayı
    Route::put('/receipts/{id}', [ReceiptController::class, 'update']); // Fiş güncelle
    Route::delete('/receipts/{id}', [ReceiptController::class, 'destroy']); // Fiş sil
    Route::get('/receipts/summary/all', [ReceiptController::class, 'summary']); // Türlere göre özet

    // Invoice routes
    Route::post('/invoices', [InvoiceController::class, 'store']); // Fatura ekle
    Route::delete('/invoices/{id}', [InvoiceController::class, 'destroy']); // Fatura sil
    Route::patch('/invoices/{id}/pay', [InvoiceController::class, 'pay']); // Fatura öde
    Route::get('/invoices/unpaid', [InvoiceController::class, 'getUnpaid']); // Ödenmemiş faturaları getir
    Route::get('/invoices/last-two-by-type', [InvoiceController::class, 'getLastTwoByType']); // Her türden son 2 fatura

    Route::post('/predict-category', [ReceiptController::class, 'predictCategory']); // Kategori tahmini
});
