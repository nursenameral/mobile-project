<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Receipt extends Model
{
    protected $fillable = [
        'user_id',
        'tutar',
        'baslik',
        'tur',
        'tarih',
        'saat',
    ];

    protected $casts = [
        'tarih' => 'date',
        'saat' => 'datetime:H:i',
        'tutar' => 'decimal:2',
    ];

    /**
     * Fiş sahibi kullanıcı
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
