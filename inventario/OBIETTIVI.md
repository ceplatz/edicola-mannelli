# Edicola Mannelli Inventario — Work board

Living list of objectives. Updated as Federica's requests arrive. Nothing below is built yet unless marked DONE.

## Decisions made
- Built under Chuck's Firebase account first; handoff to Federica's ownership later (keep all Firebase specifics behind one config file + one data layer).
- Visual design identical to Verdi POS (splash, login, owner toggle); only colours, logo, name and language (Italian) change.
- Firebase project must be NEW and separate from Verdi's.

## DONE
- [x] Local-only Giacenza prototype (`inventario/index.html`, localStorage, JSON/CSV export + restore). Will be superseded by the Firebase version.

## 1. Look and feel
- [ ] Start-up: Viridian black splash (copied from Verdi) → Edicola Mannelli splash → login
- [ ] Viridian splash as a single on/off setting (for handover)
- [ ] Login identical to Verdi: staff = password only, owner = email + password toggle at the bottom
- [ ] Owner address: TBC (edicolaminnelli.com?)
- [ ] Top banner after login: Duomo logo + location, like the Edicola POS

## 2. Access
- [ ] Two roles: owner (full) / staff (limited), enforced in Firestore/Storage rules, not just hidden in the UI
- [ ] Open: what staff may see/edit (purchase prices? delete? edit prices?)

## 3. Products
- [ ] Prominent search bar at the top; searches name + product code + retailer code + custom code
- [ ] Product entry page: name, photo, product code, retailer code, custom code, purchase price, sale price, quantities, location
- [ ] Barcode scan by camera, typed entry as fallback (TBC: is product code the EAN?)
- [ ] Location model TBC: separate quantities per place (storage / shop) — recommended

## 4. Stock movements
- [ ] Move stock storage → shop, staff picks their name from a list
- [ ] Movement log: who, what, how many, from → to, date and time (server time), append-only
- [ ] Every stock decrease records a reason: sold / returned to distributor / damaged-lost / correction. Only "sold" counts as a sale in reports
- [ ] Open: per-person PIN instead of shared staff password, so the log can't be faked

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
