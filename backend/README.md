## Purvex Landing Page Backend

This backend is the dedicated auth, signup, billing, and account-flow backend for the frontend in:

`C:\Users\justi\OneDrive\Documentos\Purvex Landing Page\frontend`

It was pulled over from the original PurveX backend so the landing/login/signup flow no longer has to depend on the old repo backend directory structure.

### Run

From this folder:

```powershell
cd "C:\Users\justi\OneDrive\Documentos\Purvex Landing Page\backend"
.\start_backend.ps1
```

Or manually:

```powershell
cd "C:\Users\justi\OneDrive\Documentos\Purvex Landing Page\backend"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001
```

### Environment

This backend reads env values from:

`C:\Users\justi\OneDrive\Documentos\Purvex Landing Page\.env`

Use:

`C:\Users\justi\OneDrive\Documentos\Purvex Landing Page\.env.example`

as the template.

### Frontend pairing

The paired frontend lives in:

`C:\Users\justi\OneDrive\Documentos\Purvex Landing Page\frontend`

By default it expects the backend at:

`http://127.0.0.1:8001`
