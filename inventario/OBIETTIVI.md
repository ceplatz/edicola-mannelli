# Edicola Mannelli Inventario — Work board

Living list of objectives. Updated as Federica's requests arrive. Nothing below is built yet unless marked DONE.

## Decisions made
- Built under Chuck's Firebase account first; handoff to Federica's ownership later (keep all Firebase specifics behind one config file + one data layer).
- Visual design identical to Verdi POS (splash, login, owner toggle); only colours, logo, name and language (Italian) change.
- Firebase project must be NEW and separate from Verdi's.

## Answers received (Oct 1)
- Firebase project created (config not yet shared with me).
- Owner login: Proprietario@EdicolaMannelli.com. Language: Italian only.
- Codes: product code (a number) + retailer code + custom code, plus an optional barcode field; camera scanning fills/looks up the barcode. All four searchable.
- Every item exists in BOTH shop and storage (two quantities); staff move a few at a time from storage to shop.
- Staff see the sale price only (no purchase price, margins or totals).

## DONE
- [x] Local-only prototype (replaced by the Firebase app; still in git history).
- [x] Firebase app v1: splash sequence, login (Firebase Auth), banner, search, tiles, product add/edit/view (Firestore), camera barcode scan, owner-only purchase price. `config.js` + `firestore.rules`. Tested with an in-memory Firebase stand-in; NOT yet tested against the real project or on a real camera.

- [x] Staff + PIN: owner-only Impostazioni → Personale (add / remove / change 4-digit PIN). PIN stored as salted PBKDF2 hash.
- [x] Sposta: either direction (storage <-> shop), staff pick name + enter PIN; owner needs no PIN. Staff can ONLY transfer (rules keep the total constant, never below 0).
- [x] Registro movimenti: append-only, newest first, filter by product/person.
- [x] Firestore rules tested on the real emulator (30 checks). App flow tested with an in-memory stand-in (19 checks).

## 1. Look and feel
- [x] Start-up: Viridian black splash (copied from Verdi) → Edicola Mannelli splash → login
- [x] Viridian splash as a single on/off setting (`mostraSplashViridian` in config.js)
- [x] Login like Verdi: staff = password only, owner = email + password toggle at the bottom (no geofence)
- [x] Owner address: Proprietario@EdicolaMannelli.com
- [x] Top banner after login: logo + Duomo + clock + role/logout

## 2. Access
- [x] Two roles enforced in `firestore.rules` (must be published in the Firebase console)
- [x] Staff see sale price only. Still open: may staff edit/add products or delete? (assumed: no)

## 3. Products
- [x] Prominent search bar at the top; searches name + 3 codes + barcode
- [x] Product entry page (no photo yet — needs Storage): name, codes, prices, shop/storage quantities, shelf position
- [x] Barcode scan by camera (BarcodeDetector, ZXing fallback), typed entry as fallback — camera untested on real devices
- [x] Location model decided: separate quantities, shop + storage, for every item

## 4. Stock movements
- [x] Move stock both directions, staff picks their name + PIN
- [x] Movement log: who, what, how many, from → to, date and time (server time), append-only
- [ ] Every stock decrease records a reason: sold / returned to distributor / damaged-lost / correction. Only "sold" counts as a sale in reports
- [x] Per-person PIN (limit: stops colleagues picking each other's name; not proof against a determined technical user — server-side check would need Cloud Functions)

## 4b. Import from the old Edicola POS (to do)
- Old catalog (root `index.html`, `PRODUCTS`): 805 items; fields id, name, category, sale price, VAT, emoji; 25 have a photo, 25 have `sizes`. NO codes, quantities or purchase prices. 39 duplicate names.
- Plan: export to a CSV she can fill in (codes, quantities, cost), then an owner-only "Importa" in Impostazioni (preview, batches of 500). Needs new fields: categoria, iva.
- Open: her scanned images/codes — need a few samples to see how codes are attached.

## 5. Documents (nice to have)
- [ ] Upload scanned invoices and purchase receipts (photo or PDF), tagged with supplier, date, amount
- [ ] Owner-only. Needs Firebase Storage (Blaze plan) — decision pending

## 6. Reports (owner only)
- [ ] Printable full inventory (A4 print layout) + CSV
- [ ] Total inventory value at cost; potential revenue at sale price; potential margin € and %
- [ ] Split by location (storage vs shop) and by category
- [ ] Top sellers ranked by units and revenue, with period filter (7 / 30 / 90 days)
- [ ] Slow / dead stock: nothing sold in N days, with the cash tied up in it
- [ ] Low and out-of-stock list
- [ ] Open: daily value snapshots if she wants a trend over time

## Open questions for Federica
1. How does stock come off the shelf when something sells (manual tap per sale, end-of-day count, other)?
2. Who is "staff": how many people, and do they each need their own login?
3. Can an item be split across storage and shop?
4. Do newspapers/magazines (resa to distributor) belong in this app from day one?
