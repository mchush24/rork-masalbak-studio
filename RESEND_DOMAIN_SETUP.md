# Resend Custom Domain Setup - E-postaları Spam'den Kurtarma Rehberi

## Sorun
Şu anda `onboarding@resend.dev` test domain'i kullanılıyor ve bu yüzden e-postalar spam klasörüne düşüyor.

## Çözüm
Kendi domain'inizi Resend'e ekleyerek e-postaların inbox'a düşmesini sağlayın.

---

## Adım 1: Resend Dashboard'a Gidin

1. [Resend Dashboard](https://resend.com/domains) adresine gidin
2. "Add Domain" butonuna tıklayın

## Adım 2: Domain Ekleyin

Örnek domain'ler:
- `zuna.app` (eğer varsa)
- `yourdomain.com`
- Alt domain da kullanabilirsiniz: `mail.zuna.app`

## Adım 3: DNS Kayıtlarını Ekleyin

Resend size 3 DNS kaydı verecek. Bunları domain sağlayıcınıza (GoDaddy, Namecheap, Cloudflare, vs.) eklemeniz gerekiyor:

### SPF Kaydı (TXT)
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all
```

### DKIM Kaydı (TXT)
```
Type: TXT
Name: resend._domainkey
Value: [Resend'in vereceği uzun değer]
```

### DMARC Kaydı (TXT)
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; pct=100; rua=mailto:dmarc@yourdomain.com
```

## Adım 4: DNS Doğrulamasını Bekleyin

- DNS kayıtlarının yayılması 24-48 saat sürebilir
- Resend dashboard'da "Verify" butonuna tıklayarak kontrol edin
- Yeşil tik gördüğünüzde hazırsınız!

## Adım 5: Kod Güncellemesi

`backend/lib/email.ts` dosyasında şu satırı güncelleyin:

**Öncesi:**
```typescript
from: 'Zuna <onboarding@resend.dev>',
```

**Sonrası:**
```typescript
from: 'Zuna <hello@yourdomain.com>',
// veya
from: 'Zuna <noreply@yourdomain.com>',
// veya
from: 'Zuna <onboarding@yourdomain.com>',
```

Ayrıca `replyTo` alanını da güncelleyin:
```typescript
replyTo: 'support@yourdomain.com',
```

---

## E-posta Deliverability İpuçları

### ✅ Yapılması Gerekenler

1. **SPF, DKIM, DMARC kayıtlarını ekleyin** - En önemli adım!
2. **Custom domain kullanın** - Asla `@resend.dev` kullanmayın
3. **Reply-To adresi ekleyin** - Kullanıcılar cevap verebilmeli
4. **Text version ekleyin** - HTML olmayan e-posta istemcileri için (✅ Zaten ekledik!)
5. **Unsubscribe link ekleyin** - Marketing e-postaları için (Doğrulama kodları için gerekmez)

### ❌ Yapılmaması Gerekenler

1. ❌ Test domain'lerini production'da kullanmayın (`@resend.dev`)
2. ❌ Çok fazla link eklemeyin (spam olarak algılanır)
3. ❌ Büyük font ve renkli yazılar kullanmayın (spam işareti)
4. ❌ Attachment eklerken dikkatli olun (spam trigger'ı)
5. ❌ ALL CAPS başlık kullanmayın

---

## Test Etme

Domain setup'ı tamamladıktan sonra:

1. Test e-postası gönderin
2. [Mail-Tester](https://www.mail-tester.com/) ile spam score'unuzu kontrol edin
   - 8/10 ve üzeri iyi
   - 10/10 mükemmel
3. Farklı e-posta sağlayıcılarında test edin:
   - Gmail
   - Outlook
   - Yahoo
   - iCloud

---

## Alternatif: Subdomain Kullanımı

Eğer main domain'inizi korumak istiyorsanız, subdomain kullanabilirsiniz:

```
mail.zuna.app
emails.zuna.app
app.zuna.app
```

Bu şekilde main domain'inizin reputation'ını korursunuz.

---

## Resend Free Tier Limitleri

- ✅ 3,000 e-posta/ay ücretsiz
- ✅ 100 e-posta/gün ücretsiz
- ✅ Custom domain desteği var

Daha fazla kullanım için Pro plan'a geçebilirsiniz.

---

## Yardım ve Kaynaklar

- [Resend Domains Docs](https://resend.com/docs/dashboard/domains/introduction)
- [Email Deliverability Guide](https://resend.com/docs/knowledge-base/deliverability)
- [SPF, DKIM, DMARC Nedir?](https://www.cloudflare.com/learning/email-security/)

---

## Özet Checklist

- [ ] Resend'e custom domain ekle
- [ ] SPF kaydını DNS'e ekle
- [ ] DKIM kaydını DNS'e ekle
- [ ] DMARC kaydını DNS'e ekle
- [ ] DNS doğrulamasını bekle (24-48 saat)
- [ ] Resend'de domain'i verify et
- [ ] `backend/lib/email.ts` dosyasında `from` alanını güncelle
- [ ] `replyTo` alanını güncelle
- [ ] Test e-postası gönder
- [ ] Mail-Tester ile spam score kontrol et
- [ ] Farklı e-posta sağlayıcılarında test et

---

**Not:** Domain setup yapılana kadar e-postalar spam klasörüne düşmeye devam edebilir. Bu normaldir ve endişelenmenize gerek yok. Custom domain ekledikten sonra sorun çözülecektir.
