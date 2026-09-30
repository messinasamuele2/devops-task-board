# DevOps Task Board

Progetto didattico: ciclo DevOps completo per una piccola app full-stack. Il workspace iniziale era vuoto, quindi l'app è stata realizzata qui come base riproducibile.

## Analisi dell'app

Task Board è una single-page React/Vite: legge le attività da `GET /api/tasks`, ne crea di nuove con `POST /api/tasks` e mostra lo stato del backend. L'API Express espone anche `GET /api/health`. I dati sono in memoria, quindi il reset al riavvio è intenzionale per il laboratorio.

## Ambienti

| Ambiente | Scopo | Configurazione |
|---|---|---|
| Development | sviluppo e test locale | Docker Compose, frontend su `localhost:8080`, API su `localhost:3001` |
| Staging | validazione prima del rilascio | preview deployment del branch/PR su hosting scelto; API di staging tramite `VITE_API_URL` |
| Production | versione pubblica | GitHub Pages per il frontend; backend da pubblicare su Render/Railway/Fly.io e impostare come `VITE_API_URL` |

### Scelta degli strumenti

È stato scelto **GitHub Actions**: il codice, i secret, gli artifact e il deploy GitHub Pages vivono nello stesso ecosistema; inoltre i workflow sono versionabili e hanno runner Ubuntu con Docker già disponibile. La pipeline in `.github/workflows/ci-cd.yml` separa CI e deploy: ogni push/PR verso `main` esegue lint e build, mentre solo un push a `main` verde pubblica il frontend.

## Avvio locale

Prerequisiti: Docker Desktop e Git.

Nota: nel workspace di consegna Docker Desktop deve essere installato e avviato; in questa sessione il comando `docker` non era disponibile, quindi il build delle immagini e `docker compose up` sono documentati ma non eseguiti localmente.

1. Copiare `.env.example` in `.env` (il file `.env` è ignorato da Git).
2. Avviare tutto con `docker compose up --build`. Il frontend attende l'healthcheck del backend prima di essere avviato.
3. Aprire `http://localhost:8080` e verificare `http://localhost:3001/api/health`.
4. Fermare lo stack con `docker compose down`.

Senza Docker, il backend si avvia con `cd backend && npm install && npm start`; il frontend con `cd frontend && npm install && npm run dev`.

## Sicurezza e secrets

- `.env` e `.env.*` sono in `.gitignore`; è committato solo `.env.example`.
- Verifica locale: `git check-ignore -v .env` deve indicare `.gitignore`; `git log --all -- .env` deve essere vuoto prima del primo commit.
- In GitHub configurare `Settings → Secrets and variables → Actions`: secret `VITE_SENTRY_DSN` e variable non sensibile `VITE_API_URL`.
- Non usare mai token, password o chiavi private nel codice o nei log. Il workflow passa il DSN come secret e GitHub lo maschera nei log; non usare `echo` per stamparlo.
- Il DSN Sentry frontend è una configurazione pubblica, ma viene comunque gestito come secret per evitare di fissare ambienti nel repository.

## CI/CD

Il workflow si attiva su ogni push e pull request verso `main`. Esegue `npm ci` usando i lockfile, lint frontend/backend, build Vite e build di entrambe le immagini Docker. Un errore di lint interrompe il job con stato rosso. Dopo una push su `main` riuscita, il job `deploy` pubblica `frontend/dist` su GitHub Pages. Il `VITE_API_URL` deve puntare a un backend HTTPS pubblico: GitHub Pages serve solo file statici.

Per attivare Pages: repository GitHub → `Settings → Pages` → Source `GitHub Actions`. Il link pubblico sarà `https://<utente>.github.io/<repository>/`; il link alla run è nella scheda Actions del repository. Questi URL non sono compilabili prima di collegare il workspace a un repository GitHub reale.

## Monitoraggio

1. Creare un progetto Sentry gratuito per React e copiare il DSN in `VITE_SENTRY_DSN` (secret GitHub o `.env` locale). Sentry registra eccezioni frontend e mostra evento, stack trace, browser e release. `Sentry.ErrorBoundary` impedisce che un errore React lasci una schermata bianca senza evento.
2. Creare in UptimeRobot un monitor HTTP su URL GitHub Pages, con intervallo di 5 minuti e alert email. Un codice HTTP diverso da 2xx o timeout indica indisponibilità.
3. Per simulare un errore in staging, impostare temporaneamente la variabile `VITE_ENABLE_SENTRY_TEST=true` nell'ambiente di deploy, eseguire la pipeline e premere **Invia evento di test Sentry**. Dopo la verifica riportare la variabile a `false` e ridistribuire. L'evento deve apparire in Sentry con titolo e stack trace.
4. Allegare alla consegna screenshot della run CI/CD verde, URL pubblico, monitor UptimeRobot e dashboard Sentry con almeno un evento. Le dashboard e l'URL sono risorse esterne e non possono essere generate offline da questo workspace.

## Checklist di consegna

- [ ] Repository GitHub collegato e branch `main` pubblicato.
- [ ] GitHub Pages abilitato e URL pubblico funzionante.
- [ ] Run `CI/CD` verde linkata.
- [ ] `VITE_API_URL` punta a un backend pubblico in production (GitHub Pages non esegue Node).
- [ ] Secret Sentry configurato senza valori nei log.
- [ ] UptimeRobot attivo e screenshot dashboard allegato.
- [ ] Evento Sentry simulato e screenshot allegato.

## Interpretazione degli alert

- **UptimeRobot DOWN**: verificare prima il codice HTTP e il timeout; controllare poi la run GitHub Actions e lo stato del backend pubblico.
- **Sentry Issue**: aprire l'evento più recente, leggere stack trace e release, quindi riprodurre l'azione indicata nel breadcrumb. Un picco di eventi sulla stessa issue indica una regressione da bloccare in CI.
- Dopo la correzione, verificare una nuova run verde, un monitor nuovamente UP e l'assenza di nuovi eventi per la release corretta.
