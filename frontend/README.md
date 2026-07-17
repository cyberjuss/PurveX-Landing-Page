## Purvex Landing Page Frontend

This frontend is paired with the dedicated backend in:

`C:\Users\justi\OneDrive\Documentos\Purvex Landing Page\backend`

### Development

Run both the frontend and the dedicated backend together:

```powershell
cd "C:\Users\justi\OneDrive\Documentos\Purvex Landing Page\frontend"
npm run dev
```

That command now starts:

- Next.js on `http://localhost:3000`
- the dedicated auth/billing backend on `http://127.0.0.1:8001`

### Frontend only

If you only want the Next.js app:

```powershell
npm run dev:frontend
```
