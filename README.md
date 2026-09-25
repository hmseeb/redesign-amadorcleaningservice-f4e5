# Amador Cleaning Services — Website

Modern, responsive redesign for **Amador Cleaning Services**, a residential and
commercial cleaning company based in Katy, Texas.

Built with vanilla HTML, CSS and JavaScript — no build step, no dependencies.
Open `index.html` in a browser or serve the folder statically.

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Home — hero, services, offers, values, process, testimonials, contact form |
| `services.html` | Detailed service breakdown + booking form |
| `about.html` | Company story, values and testimonials |
| `styles.css` | Design system and all page styles |
| `script.js` | Navigation, scroll reveal, form handling |
| `favicon.svg` | Site icon |

## Business details

- **Phone:** (281) 454-1558
- **Email:** Amadorcleaningservicestx@gmail.com
- **Service area:** Katy, Texas
- **Hours:** Mon–Fri 8am–8pm · Sat 9am–2pm · Sun closed

## Services

Residential cleaning · Commercial & janitorial · Deep cleaning · Move-in/move-out

## Forms

Both forms POST to the LeadrVision endpoint. They work without JavaScript
(returning to the page with `?submitted=1`, which triggers the confirmation
message) and, when JavaScript is available, submit via `fetch()` to the same
URL and confirm inline. Each form includes a hidden `_form` name, a `_page`
field set to the current URL on load, and a hidden honeypot field.
