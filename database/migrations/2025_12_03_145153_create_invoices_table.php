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
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->decimal('tutar', 10, 2);
            $table->string('baslik');
            $table->enum('tur', ['elektrik', 'su', 'dogalgaz']);
            $table->date('son_odeme_tarihi');
            $table->enum('durum', ['odenmedi', 'odendi'])->default('odenmedi');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
