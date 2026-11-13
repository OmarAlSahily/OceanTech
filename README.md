# Ocean Technology — website

Static front-end site (HTML, CSS, JavaScript). No build step and no server code, so it runs as-is on GitHub Pages.

## Pages
| File | Page |
|---|---|
| `index.html` | Home |
| `solutions.html` | Solutions (anchors: `#data-center`, `#assessments`, `#security`, `#unified-communications`, `#infrastructure`, `#mentored`) |
| `mssp.html` | MSSP — Palo Alto Networks partnership |
| `partners.html` | Partners (logos in `assets/partners/`) |
| `clients.html` | Clients |
| `news.html` | News & project stories |
| `about.html` | About |
| `contact.html` | Contact |
| `404.html` | Not-found page (GitHub Pages uses it automatically) |

## Structure
- `css/style.css`: all styles. Brand colors are the variables at the top of the file.
- `js/main.js`: blue-wave page transition, mobile menu, scroll reveal, partner filter, contact form.
- `assets/`: company logo, `partners/` (partner logos), `clients/` (client logos), `paloalto/` (official Palo Alto Networks specialization badges).
- The MSSP page uses a co-branded theme: Palo Alto black and orange split at 45° with the Ocean blue. The styles are under "Co-branded Palo Alto Networks theme" at the end of `css/style.css`.

The header and footer are repeated in every page. To change a menu item, edit it in all pages.

## Contact form
GitHub Pages can't run server code, so the form opens the visitor's email app with the message addressed to `info@oceantech.ly`. To receive messages straight to an inbox instead, connect the form to a form service (for example Formspree) later.

## Publish on GitHub Pages
1. Create a **public** repository (GitHub Pages is free for public repositories). Don't add a README; this folder already has one.
2. Upload everything in this folder except `.claude/`, keeping the folder structure. Use either the web page (**Add file → Upload files**) or git:
   ```bash
   git init
   git add .
   git commit -m "Ocean Technology website"
   git branch -M main
   git remote add origin https://github.com/<username>/<repository>.git
   git push -u origin main
   ```
3. In the repository, go to **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, pick `main` and `/ (root)`, then save.
4. After a minute or two the site is live at `https://<username>.github.io/<repository>/`.

### Updating the site
Upload the changed files again, or run `git add .`, then `git commit -m "Update"`, then `git push`. Changes go live within a couple of minutes.

### Using oceantech.ly
1. In **Settings → Pages → Custom domain**, enter `www.oceantech.ly` and save.
2. At your DNS provider, add these records. Change only the web records and leave the mail (MX) records alone, so email keeps working:
   - `oceantech.ly` → four **A** records: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `www` → **CNAME** to `<username>.github.io`
3. Once DNS has updated (minutes up to 48 hours), tick **Enforce HTTPS**.

Pointing the domain at GitHub replaces the current Wix site, so test on the `github.io` address first.

## Preview locally
```bash
python -m http.server 8000
```
Then open http://localhost:8000.
