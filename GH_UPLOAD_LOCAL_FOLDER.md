# Cum urci un folder local pe GitHub (fără upload din browser)

## Varianta recomandată: Git în terminal

1. Intră în folderul proiectului:
   ```bash
   cd "C:\sources\AI-CHATBOT 2026\AI PULSE 2\vogo-chatbot"
   ```
2. Inițializează repository-ul local (dacă nu există deja):
   ```bash
   git init
   ```
3. Configurează user-ul Git (o singură dată):
   ```bash
   git config --global user.name "Numele Tău"
   git config --global user.email "emailul_tau@exemplu.com"
   ```
4. Creează `.gitignore` și **nu urca** fișiere sensibile sau generate.
   Minim recomandat:
   ```gitignore
   node_modules/
   .env
   dist/
   build/
   *.log
   ```
5. Adaugă fișierele:
   ```bash
   git add .
   ```
6. Fă primul commit:
   ```bash
   git commit -m "Initial commit"
   ```
7. Leagă repo-ul local la cel de pe GitHub:
   ```bash
   git branch -M main
   git remote add origin https://github.com/vipsolutionservices/VOGO-AI.git
   ```
8. Trimite codul pe GitHub:
   ```bash
   git push -u origin main
   ```

## Dacă apare eroare la `git remote add origin`

Înseamnă că remote-ul există deja. Rulează:

```bash
git remote set-url origin https://github.com/vipsolutionservices/VOGO-AI.git
```

## Dacă repo-ul de pe GitHub are deja fișiere

Înainte de push:

```bash
git pull --rebase origin main
```

Apoi:

```bash
git push -u origin main
```

## De ce să eviți upload-ul din browser

- are limită practică la multe fișiere;
- e lent pentru proiecte Node;
- poți urca din greșeală `node_modules` sau `.env`.
