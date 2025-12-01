<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('receipts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->decimal('tutar', 10, 2); // Tutar (10 basamak, 2 ondalık)
            $table->string('baslik'); // Başlık
            $table->enum('tur', ['gıda', 'sağlık', 'ulaşım', 'fatura', 'eğlence', 'giyim', 'diğer']); // Tür
            $table->date('tarih'); // Tarih
            $table->time('saat'); // Saat
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('receipts');
    }
};
