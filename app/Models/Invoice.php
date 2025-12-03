<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invoice extends Model
{
    protected $fillable = [
        'user_id',
        'tutar',
        'baslik',
        'tur',
        'son_odeme_tarihi',
        'durum'
    ];

    protected $casts = [
        'tutar' => 'decimal:2',
        'son_odeme_tarihi' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
