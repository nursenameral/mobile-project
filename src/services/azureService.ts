const AZURE_ENDPOINT = "https://fatura-analiz.cognitiveservices.azure.com/"; 
const AZURE_KEY = "AdrmAklu87xHD4btD9gYxYwgmrpqowf1W6V6OFWjHBX7sk8bovF5JQQJ99BLAC5RqLJXJ3w3AAALACOGV8P0";

const API_VERSION = "2023-10-31-preview";
const MODEL_ID = "prebuilt-invoice";

/**
 * Azure Document Intelligence servisine fatura gönderir ve sonucu döner.
 * @param {string} base64Data - Resmin Base64 formatındaki verisi
 * @returns {Promise<Object>} - İşlenmiş fatura verisi (No, Tarih, Tutar vb.)
 */
export const analyzeInvoice = async (base64Data) => {
  // 1. Veri Kontrolü
  if (!base64Data) {
    throw new Error("Resim verisi (Base64) sağlanmadı.");
  }

  // URL Oluşturma
  const initialUrl = `${AZURE_ENDPOINT}/documentintelligence/documentModels/${MODEL_ID}:analyze?api-version=${API_VERSION}`;

  try {
    // ---------------------------------------------------------
    // 1. ADIM: BELGEYİ GÖNDER (POST)
    // ---------------------------------------------------------
    const response = await fetch(initialUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': AZURE_KEY,
      },
      body: JSON.stringify({ base64Source: base64Data }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Azure Başlangıç Hatası (${response.status}): ${errorText}`);
    }

    // "Operation-Location" başlığını al (Sonuçların nerede oluşacağını söyler)
    const operationUrl = response.headers.get("Operation-Location");
    
    if (!operationUrl) {
      throw new Error("Azure işlem takip adresi (Operation-Location) döndürmedi.");
    }

    // ---------------------------------------------------------
    // 2. ADIM: SONUCU BEKLE (POLLING LOOP)
    // ---------------------------------------------------------
    let status = "running";
    let finalResult = null;
    let retryCount = 0;
    const maxRetries = 15; // Maksimum bekleme süresi (yaklaşık 30-40 sn)

    while (status === "running" || status === "notStarted") {
      // Sunucuyu yormamak için 2 saniye bekle
      await new Promise(resolve => setTimeout(resolve, 2000));

      const pollResponse = await fetch(operationUrl, {
        method: 'GET',
        headers: { 'Ocp-Apim-Subscription-Key': AZURE_KEY },
      });

      if (!pollResponse.ok) {
        throw new Error("Takip işlemi başarısız oldu.");
      }

      const pollData = await pollResponse.json();
      status = pollData.status; // "running", "succeeded", "failed"
      finalResult = pollData;

      retryCount++;
      if (retryCount > maxRetries) {
        throw new Error("Zaman aşımı: Azure yanıt vermesi çok uzun sürdü.");
      }
    }

    // ---------------------------------------------------------
    // 3. ADIM: SONUCU İŞLE VE DÖNDÜR
    // ---------------------------------------------------------
    if (status === "succeeded") {
      return parseResults(finalResult);
    } else {
      throw new Error(`Analiz başarısız oldu. Durum: ${status}`);
    }

  } catch (error) {
    console.error("Azure Service Error:", error);
    // Hatayı fırlatıyoruz ki CameraScreen.tsx içindeki catch bloğu yakalayabilsin
    throw error;
  }
};

/**
 * Azure'dan gelen karmaşık JSON verisini temizleyip sade bir objeye çevirir.
 * @param {Object} data - Azure ham yanıtı
 */
const parseResults = (data) => {
  // Veri güvenliği kontrolü
  if (data?.analyzeResult?.documents?.length > 0) {
    const doc = data.analyzeResult.documents[0];
    const fields = doc.fields || {};

    // Helper: Bir alanın içeriğini güvenli şekilde al
    const getContent = (field) => field?.content || null;
    
    // Tutar alanını özel olarak işle (Bazen currency sembolüyle gelir)
    const getTotal = (field) => {
        if (field?.valueCurrency?.amount) return `${field.valueCurrency.amount} ₺`; // Döviz cinsi varsa
        if (field?.content) return field.content;
        return "Belirlenemedi";
    };

    return {
      success: true,
      faturaNo: getContent(fields.InvoiceId),
      tarih: getContent(fields.InvoiceDate),
      saat: getContent(fields.InvoiceTime),
      toplamTutar: getTotal(fields.InvoiceTotal),
      satici: getContent(fields.VendorName),
      vergi: getContent(fields.TotalTax),
      // İhtiyaç olursa buraya başka alanlar eklenebilir
    };
  } else {
    return {
      success: false,
      message: "Belge analiz edildi ancak fatura verisi çıkarılamadı."
    };
  }
};