# Backend Çalıştırma

## Gereksinimler
- Node.js 18+
- npm

## Kurulum

```bash
npm install
```

## Çalıştırma

### Backend Server (Port 3000)
```bash
npm run backend
```

veya watch mode ile:
```bash
npm run backend:watch
```

### Frontend (Expo Web - Port 8081)
Başka bir terminal'de:
```bash
npm run dev
```

## Test

Backend çalışıyor mu kontrol et:
```bash
curl http://localhost:3000/
```

Beklenen yanıt:
```json
{"status":"ok","message":"API is running"}
```

## Endpoints

- **Health Check**: `GET http://localhost:3000/`
- **tRPC**: `POST http://localhost:3000/api/trpc/*`
  - `studio.analyzeDrawing` - Çizim analizi
  - `studio.createStorybook` - Hikaye oluşturma
  - `studio.generateColoringPDF` - Boyama PDF'i
  - `studio.listStorybooks` - Hikaye listesi
  - `studio.listColorings` - Boyama listesi

## Environment Variables

`.env` dosyasında:
```
OPENAI_API_KEY=your_api_key_here
PORT=3000
```

## Sorun Giderme

### Backend başlamıyor
- Port 3000'in boş olduğundan emin olun: `lsof -i :3000`
- `.env` dosyasının mevcut olduğunu kontrol edin

### tRPC hataları
- Backend'in çalıştığından emin olun
- `http://localhost:3000/` adresine erişilebildiğini kontrol edin
- Client'ın `http://localhost:3000/api/trpc` adresine istek attığını doğrulayın
