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

## Batch 8 (built on the branch, NOT merged — Chuck says when)
- [x] Search no longer capped at 200 (already live, PR 9).
- [x] **Elenco articoli** (Report → button): every item as one row, with distributor, category, shop/storage, price, value at cost and three dates (Inserito, Modificato, Ultimo spostamento). Filters: text, distributor (incl. "senza distributore"), category, stock (all / with pieces / sold out), date range on any of the three dates. Click a column heading to sort. Print + CSV of the filtered list. Dates: "Inserito" for imported items is the import day; "Ultimo spostamento" comes from the movement log (deleted log lines no longer count). Received/sold dates still need the Carico/Vendita screens.
- [x] **Fatture** (owner only): photo (camera) or PDF, several pages per invoice, date + distributor + note; list with filters by distributor and dates; open to view pages / PDF; delete (removes record and files). Files in Firebase Storage (Blaze plan); photos shrunk on the device (max side 2200 px), PDFs as they are; 15 MB per file, 12 pages per invoice.
- [x] Rules: `fatture` in firestore.rules (owner only) + NEW `storage.rules` (owner only, images/PDF, <15 MB). MUST be published: Firestore rules AND Storage rules (Storage must also be switched on once in the Firebase console: Build -> Storage -> Get started).
- Tests: screens 36 new (suite t14) + earlier suites; rules: Firestore 76 checks, Storage 11 checks (emulator). Not tested on a real tablet camera or real Storage.
- Known: an invoice's date/distributor/note cannot be edited after saving (delete and re-add); no OCR/search inside invoice images.

## Batch 9 (built on the branch, NOT merged — Chuck says when)
- [x] **History per item** (Federica, Oct 14): every time stock enters the system it is recorded with date, time and who, in the same registry as the moves. (1) A new item saved with quantities -> "Carico iniziale" lines (one per place). (2) New **＋ Carico** button on the item page (owner): how many, where (storage/shop), who, optional note (e.g. invoice number) -> stock goes up and a "carico" line is written, atomically. (3) Changing a quantity in the edit form -> logged as a "correzione" (+/-); the form now applies only what the user changed, so a carico or move made meanwhile on another device is not overwritten.
- [x] The item page (owner) shows **Storia dell'articolo**: carichi, correzioni, spostamenti and "Inserito nel sistema", newest first. Registro movimenti lists all three kinds with their own labels; "elimina" works on all of them (delete + undo or delete only the line; undo refused if a quantity would go below zero). Elenco articoli: new "Ultimo carico" column and date filter; "Ultimo spostamento" now counts only real moves.
- [x] Rules: `movimenti` accepts `tipo` carico/rettifica (owner only), with validation. MUST re-publish firestore.rules. Tests: rules 91, screens +27 (suite t20).
- Not recorded: the CSV import of products (it never sets quantities for existing items). Items already in the system have no "carico iniziale": the history starts at "Inserito nel sistema" (import date) and from today.
- Next (asked by Federica, details to come from Chuck): **work without signal in the storage room** (see notes in chat: what already queues, what needs a service worker, what cannot work offline).

## Batch 10 — work without signal (built on the branch, NOT merged — Chuck says when)
- [x] **Sync pill** in the header, like the Verdi POS: slowly pulsing green "Sincronizzato" when everything is saved in the database; amber "Sincronizzo…" while changes are being sent; red "Offline" (or "Offline · modifiche salvate qui") without signal.
- [x] **Offline saving**: Firestore keeps writes on the device and sends them when the signal returns (also after closing and reopening the app). Works offline: new items (with photo and description), editing items, Carico. The forms no longer wait for the server (after ~2.5 s, or at once when offline) and say "Salvato su questo dispositivo".
- [x] **Real time of the action**: carico/correction lines store `quandoLocale` (the moment on the device), items store their creation time from the device, so a line entered at 10:00 and sent at 11:30 is shown at 10:00. Rules accept it only if within the last 45 days / not in the future.
- [x] **Opens without signal**: service worker `sw.js` keeps the page, logos, fonts and Firebase libraries on the device (pages: network first so updates still arrive). The login session is kept by Firebase, so a tablet that was logged in opens and works offline.
- Online-only on purpose (clear message at once): **Sposta** (the stock check must happen in the database so nothing goes negative), **Fatture** upload (large files), deleting/undoing a registry line, importing CSV files. A first login needs the network.
- Tests: screens 18 (t21, offline/online), 8 (t22, opens with no signal, uses a test copy of the page), rules 97.
- Known limits: two devices editing the same item's text fields offline = the last one to sync wins (quantities merge safely because they are sent as increments). If the database refuses a queued change after reconnect, a message says so.
- Possible next: offline Sposta (queued, with a check at sync time), offline invoice photos (store on the device, upload later), "Add to home screen" icon/manifest.

## Batch 11 — Vendite (replaces the paper sheet) (built on the branch, NOT merged — Chuck says when)
Decisions (Chuck, Oct 15): stock comes out of the SHOP only; the sheet shows quantities AND totals; Federica can lock ("seal") the day; staff can cancel their own mistakes for 10 minutes; used on a mix of tablets and PCs with a mouse.
- [x] **Vendite** tile (staff + owner): open a **shift** (name + PIN for staff, name of the computer), search-and-tap sheet, **Registra vendita**. Fast search: big box, tiles with photo/price/shop stock, Enter adds the first result, "3 calamita" adds 3, filters by distributor/category, "Venduti in questo turno" and "I più venduti (7 giorni)" when the box is empty, **Altro (non in elenco)** line with name+price (no stock change), price editable per line (items without a price are highlighted). Touch-sized controls; two-column on wide screens, stacked on tablets.
- [x] One `vendite` document per sale: who, which computer, shift, day, lines with the **price at the time of the sale**, pieces, total, real time of the action. Stock: shop quantity goes down by increments (safe with 2-3 computers at once, works offline); the shop can go below zero = flagged "⚠ da ricontare" (storage is never touched by a sale). **Il mio foglio**: the shift's sales, totals, **Annulla** within 10 minutes (the rules enforce the window on the server time). Cancelled sales stay visible, struck through. **Chiudi turno** -> printable summary per item.
- [x] **Oggi** (owner): live, per minute: totals (pieces, takings, sales, cancelled), per person+computer, pieces per hour, best sellers of the day, every sale one by one (owner can cancel any, unless sealed), open shifts, day navigation, CSV and print. **Chiudi la giornata**: writes the sealed day with totals, closes open shifts; nobody can register or cancel sales of that day; **Riapri** to undo.
- [x] Rules: `vendite`, `turni`, `giornate`; staff may lower SHOP stock only together with a new sale in the same save (and raise it only by cancelling an existing sale); never edit/delete sales. Rules tests: 41 new (total 97+41), screens 46 new (suite t23). MUST re-publish firestore.rules.
- Not in Round 1 (next): report connected to real sales (top sellers, takings, weekly/monthly compare from `vendite`), size chips for T-shirts, returns, reorder suggestions from sales speed, un-seal history/audit.
- Known/trade-offs: the shop stock of every item is 0 today (all in storage), so the first sales push it below zero until items are moved to the shop with Sposta (this is flagged on purpose). A queued offline sale for a day that gets sealed meanwhile is refused at sync (owner is told to check all computers are green before sealing). Staff PIN is checked on the device (as for Sposta).

## Note — updates not showing (Oct 16)
- The service worker (Batch 10) fetched the page through the browser's HTTP cache; GitHub Pages lets browsers keep the page for 10 minutes, so after a merge a tablet could keep showing the old version for up to 10 min. Fixed in `sw.js` (v2): the page and config are always revalidated with the server (`cache: 'no-cache'`), still falling back to the saved copy without signal. Reproduced with a test server sending `Cache-Control: max-age=600` (old worker = stale, new worker = fresh).

## Batch 12 — search priority + correcting registry lines (built on the branch, NOT merged — Chuck says when)
- [x] **The search bar always wins** (Federica, Oct 16): anything typed or scanned in the top search box (and in the Vendite search) is looked up in the WHOLE archive; the distributor/category choices apply only while the box is empty (a note says "i filtri non contano"). Before, a scanned item from another distributor did not show up.
- [x] **Correct a registry line** (owner): each line of Registro movimenti has **modifica** (next to elimina): change the **date and time**, the **pieces** (and the note). The stock follows (carico 10→15 = +5 in that place; a move changing from 2→4 shifts 2 more; a correction changes its signed value), shown before saving; refused if a quantity would go below zero; date-only edits leave the stock alone. The original stays on record (qtaPrima / deltaPrima / quandoPrima) and the line is marked "modificata". Rows are sorted by their real (possibly corrected) date; item history and "Ultimo carico/spostamento" use it too.
- [x] The item edit form has **Data di inserimento nel sistema** (owner) to correct the insertion date.
- [x] Rules: owner-only update of `movimenti` with strict validation (only qta/delta/date/note + audit fields, rettifica qta must equal |delta|, date not in the future nor older than ~2 years, stamped with the server time). Rules tests: 116 + 41; screens: 32 new (t26). MUST re-publish firestore.rules.
- Not corrected here (on purpose): sales (they have their own cancel + sealed days). Corrections need the network (the quantities are re-checked in the database).

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

## Batch 13–15 — barcode link, size buttons, live carts (Oct 19–21)
- DONE (merged, PR 16): barcode search tolerant of 12/13 digits, spaces, dashes; an unknown barcode says so and the owner can "Collega questo codice a un articolo".
- DONE (merged, PR 17): items named "… – S/M/L/XL" show as one card with a button per size (search + Vendite); a lone size in the search matches whole words only. Kids/baby sizes: waiting for Chuck's example names.
- BUILT, NOT merged: the cart in progress is also saved per shift (`carrelli/{turnoId}`, needs the updated firestore.rules): survives closing the app; an open shift (with its live cart) can be resumed from "Apri il turno" on any device (staff need that person's PIN, owner none); Oggi shows live carts; sealing the day removes them.
- BUILT (Oct 24): "Da rifornire" tile (next to Sposta) — every T-shirt/maglia sold is added to a per-item list (`rifornimenti/{prodottoId}`, needs updated firestore.rules); each Magazzino→Negozio move takes pieces off it, cancelled sales give them back; closing a shift offers the list; badge on the tile and a button in Vendite. T-shirts only for now (`isRiforn()`: category/name matches t-shirt|maglia|maglie) — extend to Felpe etc. when Federica says.
- BUILT (Oct 24): internal barcodes + labels. In the product form, "Genera" (when the barcode is empty) creates a unique EAN-13 starting with 20 (the range reserved for in-store use) in sequence; 🖨 / "🖨 Etichetta" in the item sheet opens a label preview (name, price, barcode; sizes 50×30, 40×30, 60×40, 30×20 mm; copies) and prints via the browser's print dialog (works with any label printer driver). EAN-13, UPC-A (12 digits) and EAN-8 are drawn; decoding of the output checked with ZXing.
- CHANGED (Oct 25, Chuck's call): "Da rifornire" is now SEAL-ONLY — nothing is added as sales happen; sealing the day (Oggi) builds the list = T-shirt pieces sold that day − pieces already moved Magazzino→Negozio that day (never lowers an existing value, safe to re-run). Oggi has a "📦 Lista da rifornire" button to build it for any day shown; the Da rifornire screen has "Crea la lista con le vendite di oggi". Moves (Sposta) still take pieces off the list. Felpe (felpa/felpe) are included as of Oct 25 (isRiforn()); extend again if other clothing is added.
- FIXED (Oct 26): "Da rifornire" now replays the last 14 days IN TIME ORDER (sale = +pieces, Magazzino→Negozio move = −pieces, never below 0) and writes the result — so a MORNING move before a sale no longer cancels the sale (Saturday's 41 sold vs 38 listed: three single pieces had been moved at ~10:20, before the first sale at 10:34), re-running never double-counts, and leftovers from earlier days are kept. The owner's ✕ stores a `da` marker (needs the updated firestore.rules) so discarded lines don't come back from older sales.
- CHANGED (Oct 26, Federica's call): "Da rifornire" fills LIVE again — each T-shirt/felpa sale adds its pieces immediately, a cancelled sale gives them back, each Magazzino→Negozio move takes them off; closing a shift offers the list. The time-ordered recheck (day seal, Oggi button, "Ricontrolla la lista") stays as the safety net for tablets on old versions and any drift.
