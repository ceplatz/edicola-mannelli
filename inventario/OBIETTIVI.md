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
- [x] Registro movimenti: append-only, newest first, filter by product/person. OWNER-ONLY (staff have no tile and the rules deny them reading it; their moves are still recorded).
- [x] Staff scope (decided Oct 1): search, view, and Sposta only. No adding/editing products, no log.
- [x] Firestore rules tested on the real emulator (30 checks). App flow tested with an in-memory stand-in (19 checks).

## Batch in progress (built on the branch, NOT merged — Chuck says when)
- [x] Movement log owner-only for staff.
- [x] Description box (above the owner-only purchase price box); searchable.
- [x] Distributore: dropdown on the product, one per product; list managed in Impostazioni (add / rename / remove; removal blocked while in use); quick "+" on the form; search filter by distributor; distributor name searchable; visible to staff too (Chuck: yes).
- [x] Rules: `distributori` collection (everyone reads, owner writes). 40 emulator checks pass.
- Merge needs: rules re-published in Firebase first.

## Batch 2 (built on the branch, NOT merged — Chuck says when)
- [x] Product photos, no paid plan needed: shrunk on the device (small ~3 KB version stored in the product for lists, ~45 KB full version in `foto/{id}`). Owner adds via live in-app camera (like the barcode scanner) or from the gallery; staff see it in search results, product page and Sposta (list + selected card).
- [x] Rules: `foto` collection (everyone reads, owner writes). 48 emulator checks pass; screens 67 checks pass; live-camera flow tested with a fake camera device.
- [x] Impostazioni tile text now "Personale, PIN e distributori".
- Merge needs: rules re-published in Firebase first.
- Later: the 25 photos in the old POS can come over with the import. Invoice scans (PDF) still need Storage/Blaze.

## Batch 4 (built on the branch, NOT merged — Chuck says when)
- [x] Report v0 (owner-only, marked BOZZA): value at cost, potential revenue and margin, pieces (storage vs shop), item counts + data-quality warnings; value by category (bars); top sellers for a period (all / 30 d / 7 d) with takings and margin; sold-out items that were selling; below minimum stock; slow stock with the cash tied up; totals per category and per distributor. Buttons: print report, print full inventory (A4 print mode), export CSV (Excel-friendly: BOM, `;`, decimal comma).
- [x] Numbers checked against an independent calculation of the PIER data (value EUR 9,169.30; revenue EUR 27,656.50; margin 67%; top seller Adesivi 75 pcs).
- [x] Rules: collection-group read of `privato` for the owner (one query for all purchase prices). If not yet published the report falls back to per-product reads, so it still works. Tests: rules 59, screens 113.
- Note: a purchase price of 0 counts as "missing" in the report. Sales takings use the CURRENT sale price (no price history yet).
- Next for reports: stock-count import (magazzino/negozio), Carico/Vendita entry screens so the numbers stay live, reasons for stock decreases.

## Batch 5 (built on the branch, NOT merged — Chuck says when)
- [x] Report periods: Tutto / Anno / Trimestre / Mese / Settimana, calendar-based with ◀ ▶ arrows (weeks Mon-Sun, ISO week number; quarters and months by calendar; future periods locked). Starts at the latest period that has sales. Each period compares with the previous one (▲/▼ %, "nuovo" when there is nothing before).
- [x] Report layout: "Vendite del periodo" (pieces sold, takings, margin, pieces received) is separate from "Magazzino oggi" (stock snapshot: unaffected by the period). New chart "Incasso per categoria nel periodo". Top sellers / sold-out / slow stock follow the period; below-minimum is today's snapshot. Empty periods say so and show the data range.
- [x] Verified vs an independent calculation: Mese Sept = 2,507 pcs / EUR 18,343.30 / margin EUR 12,226.75 / 1,347 received; Settimana 40 = 734 pcs, -21% vs week 39 (932 pcs). Tests: screens 138 across 7 suites; no new rules.
- Later: custom date range; compare against the same period last year once there is a year of data.

## Batch 6 (built on the branch, NOT merged — Chuck says when)
- [x] Delete a movement from the owner's Registro movimenti (Chuck, Oct 5: critical, for accidental moves). Small-print "elimina" on each line -> confirmation window with two choices: (a) delete AND undo the move (puts the pieces back where they came from; checked inside a transaction, and disabled with the reason if those pieces are no longer there), (b) delete only the log line (quantities stay). Cancel changes nothing. Owner only; staff cannot even see the log.
- [x] Rules: `movimenti` -> `allow delete: if titolare()` (update stays denied; creating by staff unchanged). Rules tests 65, screens 15 new + all earlier suites green. MUST re-publish firestore.rules in Firebase: until then the screen shows "pubblica le regole aggiornate" and nothing is deleted.
- Trade-off noted: a deleted line is gone for good (no trash). A "deleted entries" audit trail can be added if wanted.

## Batch 7 (built on the branch, NOT merged — Chuck says when)
- [x] Sposta can never move pieces that are not there (Chuck, Oct 5). Found by reproducing: with a stale screen (two tablets, slow network) an OWNER move could push a location negative (5 moved out of 1 -> -4); staff were already protected by the rules. Fix: the move now re-reads the product inside a database transaction and refuses if the source has fewer pieces than requested; nothing is written, a clear "NON eseguito" message shows. Moving ALL the pieces is allowed (balance can reach 0), never below. Trade-off: no queued offline moves any more — without a connection the move is refused with a clear message instead of silently queued.
- [x] Clearer direction handling: the two direction buttons show how many pieces are available on each side ("5 pezzi disponibili" / "nessun pezzo da spostare"); the screen opens on the side that has pieces; explicit messages when a side is empty or the item has no pieces. (Shop -> storage looked "broken" because after the import the shop has 0 of everything.)
- Tests: screens 177 (10 suites), rules 69. No rules change needed for this fix (the delete-a-movement rule from Batch 6 is separate and still needs publishing).

## Ideas parked (pinned, not started)
- **Low-stock alerts that don't drown in zeros** (Chuck, Oct 2). Today: "Riordina" tag only when stock > 0 and <= scorta minima (39 items), report lists "Esauriti che vendevano" (only items that actually sold) -> no 400 alerts by design. Proposed next: (1) alert only on items that SOLD in the last ~60 days (auto-relevance); (2) per-item "Non avvisare" with snooze (30 days / forever: seasonal, discontinued); (3) one grouped digest "Da riordinare" per distributor, not per-item badges; (4) optional default minimum per category (e.g. magnets: 3 of each design that sells) instead of item by item; (5) later, "days of cover" from sales velocity. Staff never see alerts.
- **Reorder list per distributor** — printable / shareable shopping list ("Lista d'ordine Pier") with a suggested quantity (to reach 2x minimum, or last 30 days' sales). Matches her paperwork-by-distributor, and she buys in person (Chinatown) so a list on the phone/paper is what she needs.
- **Report periods** (Chuck, Oct 2): replace 7 days / 30 days / all with Settimana, Mese, Trimestre, Anno, Tutto (+ maybe custom range). Calendar-based with prev/next arrows (Ottobre 2026 < >), and comparison with the previous period (up/down %). Caveat: history so far is 7-30 Sep 2026 only; longer periods look identical until Carico / Vendita entry keeps data flowing.
- **Carico / Vendita entry screens** (dated, distributor, N.DOC, note, reason) — the data pipeline that keeps every report alive; replaces the CARICA / SCARICA tabs.
- **Count mode ("Conta")** — walk the shelf, scan, type the counted quantity, see the difference, confirm. Replaces the CSV count import for tablets; settles magnets and the 15 recounts.
- **Print barcode labels from her own codes** (P1, M1...) so the camera scan works without EAN barcodes: Code128 label per item (code + name + price). Chuck: Federica's mother has already talked about wanting a printed barcode on everything — a priority to show them. (Scan lookup already matches the custom code, so a label with the code is enough.)
- **One-tap backup** (owner): download products + history (+ photos optional) as a file. Firebase keeps data safe from lost devices but not from accidental deletes.
- Later: price history (so past takings use the price at the time), handover checklist to Federica's own Firebase account.

- **Count import ("Importa conteggio")** (Oct 2): all 122 magnet items (Calamite, Calamite Met.Gomp, Calamite Metallo) came in at 0 with no movements in the logs. Chuck: the shop has hundreds of magnets but not every design at once, so some zeros may be real; either way they were never counted. Plan: a count sheet (code, name, empty quantity) for Federica + an owner-only import that SETS quantities (shop and/or storage) and writes a dated "conteggio" entry. The same tool would settle the 15 "Da ricontare" items and the shop/storage split. Ask Federica whether the magnet counts live in another sheet.
- **Category quick-tabs under the search bar** (idea from Chuck, Oct 2): one-tap tabs for the big families (Portachiavi / keychains, Magliette / t-shirts, Calamite / magnets, Tazze, Piatti...) so staff and Federica can narrow to an item type fast. Builds on the Categoria field and filter that already exist (a dropdown today). Decide later: which families get a tab (probably the biggest by item count: Calamite 85, Gongoli 42, Cappelli 24...), tabs vs. scrollable chips on a phone, whether a tab can combine with the distributor filter.
- Finer sub-categories inside a family (e.g. Calamite -> resina / metallo / gomma) once we see the imported data on screen.

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

## Staff names (from Chuck, Oct 1) — to be entered by the owner in Impostazioni → Personale, each with their own PIN
Andrea, Marco, Alessio, Luca, Heber, Fiorella, Sawkat, Made (staff, with PIN). Family (Federica, her mother, her sister): added with the PIN left blank = visible only when logged in as owner. The owner login must also pick a name for every move (no PIN).
PINs are chosen by the owner and not stored anywhere in the repo.

## Batch 3 (built on the branch, NOT merged — Chuck says when)
- [x] Decisions (Chuck, Oct 2): all stock -> Magazzino; staff use the sheet codes (P1, M1...) -> stored as Codice personalizzato; Pier is NOT the only workbook (a second one is coming); load the dated history; negatives -> 0 + flagged for recount.
- [x] New product fields: Categoria (autocomplete + search filter), Scorta minima (owner sees Esaurito / Riordina tags), Da ricontare flag (+ note, visible to all), codes accept letters.
- [x] Owner-only Impostazioni -> Importa dati: CSV for products and for dated history; preview first; re-runnable (matches by distributor + code, else name; never overwrites quantities); batches.
- [x] `storico` collection (owner only): dated carichi/vendite. Owner sees it on the product page. Records only; quantities are not recomputed from it.
- [x] `tools/convert_workbook.py` turns a PIER-layout workbook into prodotti.csv + storico.csv + DA-CONTROLLARE.xlsx. Generated files hold purchase prices -> never commit them.
- Result for PIER: 413 products (3,854 pcs to storage, 15 flagged), 491 dated entries (93 carichi 1,347 pcs; 398 vendite 2,507 pcs), 44 items on Federica's checklist, 7 rows skipped (CU11/MMG25/MMG26 blank names, M85 placeholder, R7 134-in/134-out pair, D31 unknown).
- Tests: rules 55 checks (emulator); screens 91 checks incl. importing the real files.
- Merge needs: rules re-published in Firebase first (adds `storico`).
- Still open: Carico / Vendita entry screens (dated, N.DOC, note); second workbook layout; reports; invoices.

## 4b. Import from Federica's spreadsheet (PIER.xlsx) — ROADMAP (steps 1-4 now built, see Batch 3)
The file is NOT stored in the repo (it contains purchase prices).
**What the file is:** one workbook per DISTRIBUTOR ("PIER-GADGET NEL MONDO"). Tabs: `PIER` = master stock list (416 product lines: 412 coded + 4 uncoded "Campane metallo ..."; plus a placeholder M85 and a total row to skip); `CARICA` = receipts log (94 lines, 1,481 pcs, dates 23/24/29 Sep 2026); `SCARICA` = sales log (400 lines, 2,642 pcs, dates 7/21/23/24/30 Sep 2026). N.DOC and NOTE columns are empty everywhere.
**Master columns -> our fields:** CODICE (P1, MI4, ...) -> Codice personalizzato (TBC); COD.FORN. (Art.11) -> Codice rivenditore; CATEGORIA -> NEW Categoria; DESCRIZIONE -> Nome; PR.ACQ. -> prezzo acquisto (owner-only); PR.VEND. -> prezzo vendita; SCORTA MIN. -> NEW Scorta minima; STOCK ATTUALE -> quantity (one number only: shop/storage split unknown); distributor = Pier for all. STATO/VALORE/CARICO/SCARICO/STOCK INIZIALE are computed -> not imported as fields.
**Sheet totals:** 198 items in stock, 199 at zero, 15 negative; 3,769 pcs net; value at cost EUR 8,978.80 (sheet's own figure).
**The "date":** only exists in CARICA/SCARICA, as a batch date on the first row of each block (rows below are blank). It belongs to dated receipt/sale ENTRIES, not to the product. We have no Carico / Vendita entries yet -> needed (date, distributor, N.DOC, note).
**Data to clean (list for Federica):** 4 uncoded campane; M85 placeholder; code `d31` sold but not in master; R7 "Spille pins" 134 received 29 Sep but 134 sold 24 Sep (looks like a mis-posted correction); 15 negative stocks (P6, B7, B11, MI1, MI18, TA2, D34, D39, D40, CA6, GR14, BP2, BP8, G28, CP8) -> recount; 22 items with sale price 0; 78 items without supplier code and inconsistent formats (Art.11 / ART.121 / ESSENSIAL); category typos (MNIATURA, MINIATURA -> MINIATURE; MONETA -> MONETE); 35 category labels -> 32.
**Steps:** (1) Federica fixes the cleanup list. (2) Build: Categoria + Scorta minima fields; allow letters in code boxes. (3) Build owner-only "Importa" (CSV, preview/dry-run, batches, re-runnable by code so it updates instead of duplicating). (4) Import products, create distributor "Pier Gadget nel Mondo". (5) Build Carico / Vendita entries (dated), then optionally load the 94 + 400 history lines as dated entries so reports have 3 weeks of data.
**Decisions pending:** where the single stock number goes (Magazzino vs Negozio vs split); which code staff actually use; is Pier the only workbook; import history or start from current stock; negatives -> 0 + recount.
Old POS catalog (805 items, root index.html) is a different list; the 25 photos in it can come over later.

## 5. Documents (nice to have)
- [ ] Upload scanned invoices and purchase receipts (photo or PDF), tagged with supplier, date, amount
- [ ] Owner-only. Needs Firebase Storage (Blaze plan) — decision pending

### 5b. Invoice -> stock intake (idea from Chuck, Oct 1)
Goal: Federica photographs/uploads a supplier invoice and the app proposes the stock additions (matching existing items, proposing new ones).
- Step 1: upload + store invoices (Storage, Blaze plan). Owner-only.
- Step 2: IF suppliers send electronic invoices (FatturaPA XML via SDI), read the XML directly: exact, free, no AI. ASK Federica whether she gets XML (or her accountant does).
- Step 3: paper/photo invoices and DDT: AI reading of the image via a Cloud Function (Blaze plan; API key kept server-side, never in the web page). ALWAYS a review screen: nothing is written until the owner confirms each line.
- Matching: supplier item code <-> our "codice rivenditore"; fallback fuzzy name match; unmatched lines become proposed NEW items (name, purchase price, VAT pre-filled).
- Received goods go to storage as a new "carico" movement (extend the log) linked to the invoice; guard against the same invoice (supplier + number) being loaded twice.
- Owner decision needed: invoice images would be sent to an outside AI service (privacy / the family's comfort).

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
