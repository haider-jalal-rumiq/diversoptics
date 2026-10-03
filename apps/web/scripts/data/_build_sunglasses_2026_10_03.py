"""
One-shot generator for the 2026-10-03 sunglasses/optical batch.

Reads the 85 WhatsApp renders, and from a single mapping table emits:
  1. Diverso-Products-images/Sunglasses/branded/<BRAND>-<SKU>.png  (all 85, saved by model number)
  2. apps/web/scripts/data/sunglasses-2026-10-03.mjs               (import manifest, non-held rows only)
  3. Diverso-Products-images/Sunglasses/branded/_mapping-report.csv

Render -> SKU lineage: each render is a studio re-render of one reference photo downloaded on
2026-09-27 (see downloaded/_download-report.csv). The SKU is the client's stock-list label that
reference was searched under. conf: HIGH = reference page title carried model + colour code;
MED = family/colour matched but one part did not; HOLD = the reference shows a different model,
so the row is saved but NOT imported until the client confirms.
"""
import csv, json, os, re
from PIL import Image

SUN = r"C:\Haider Jalal\Codex\Projects\Diversoptics\Diverso-Products-images\Sunglasses"
OUT = os.path.join(SUN, "branded")
MANIFEST = r"C:\Haider Jalal\Codex\Projects\Diversoptics\apps\web\scripts\data\sunglasses-2026-10-03.mjs"
IDX = json.load(open(os.path.join(os.environ["TEMP"], "sheets", "index.json")))

S, O = "sunglasses", "optical-frames"
# idx, brand_slug, Brand, model shown in name, sku, category, descriptor, conf, note
T = [
 # --- Chopard
 (80,"chopard","Chopard","SCH L31","SCH-L31-300P",S,"Gold-Tone Navigator Sunglasses with Black Top Bar and Olive Lenses","HIGH",""),
 (81,"chopard","Chopard","SCH L24V","SCH-L24V-300P",S,"Black and Gold-Tone Square Pilot Sunglasses with Grey Lenses","HIGH",""),
 (82,"chopard","Chopard","SCH L24V","SCH-L24V-8FFP",S,"Havana and Gold-Tone Square Pilot Sunglasses with Green Lenses","HIGH",""),
 (83,"chopard","Chopard","SCH L31","SCH-L31-568P",S,"Gunmetal Navigator Sunglasses with Black Top Bar and Grey Lenses","HIGH",""),
 (84,"chopard","Chopard","SCH 371S","SCH-371S-0909",S,"Havana Butterfly Sunglasses with Clover Detail and Brown Gradient Lenses","HIGH",""),
 (85,"chopard","Chopard","SCH 375","SCH-375-700P",S,"Black and Gold-Tone Square Sunglasses with Grey-Green Lenses","HIGH",""),
 (78,"chopard","Chopard","SCH L53","SCH-L53-0300",S,"Gold-Tone Shield Sunglasses with Brown Gradient Lens","HOLD","reference page was Chopard SCH 883 S, not L53"),
 # --- Persol
 (76,"persol","Persol","PO 3370S","PO3370S-24-B1",S,"Havana Pilot-Style Sunglasses with Grey Lenses","HIGH",""),
 (75,"persol","Persol","PO 3333S","PO3333S-95-31",S,"Black Square Sunglasses with Green Lenses","HIGH",""),
 (79,"persol","Persol","PO 0714","PO0714-24-31",S,"Havana Folding Sunglasses with Green Lenses","HIGH",""),
 (77,"persol","Persol","PO 0649","PO0649-95-31",S,"Black Pilot Sunglasses with Green Lenses","HIGH",""),
 (72,"persol","Persol","PO 3376V","PO3376V-24",O,"Havana Square Optical Frames","MED","reference title had model, colour code not in title"),
 (74,"persol","Persol","PO 3340V","PO3340V-24",O,"Havana and Gold-Tone Browline Optical Frames","HIGH",""),
 # --- Porsche Design
 (57,"porsche-design","Porsche Design","P8974","P8974-C-416",S,"Dark Blue Square Pilot Sunglasses with Blue Lenses","HIGH",""),
 (61,"porsche-design","Porsche Design","P8949","P8949-B-604",S,"Gold-Tone Pilot Sunglasses with Brown Lenses","HIGH",""),
 (66,"porsche-design","Porsche Design","P8931","P8931-A-427",S,"Black Pilot Sunglasses with Green Mirror Lenses","HIGH",""),
 (60,"porsche-design","Porsche Design","P8961","P8961-B-629",S,"Blue Square Sunglasses with Silver Mirror Lenses","MED","model matched, colour code not in title"),
 (62,"porsche-design","Porsche Design","P8939","P8939-B-629",S,"Gold-Tone Pilot Sunglasses with Brown Lenses","MED","model matched, colour code not in title"),
 (58,"porsche-design","Porsche Design","P8971","P8971-B-416",S,"Gold-Tone and Black Square Sunglasses with Grey-Blue Lenses","HIGH",""),
 (64,"porsche-design","Porsche Design","P8696","P8696-B-417",S,"Silver-Tone Square Sunglasses with Green Lenses","HOLD","reference page was P8977 B417, a different model"),
 (63,"porsche-design","Porsche Design","P8970","P8970-C-416",S,"Black Square Sunglasses with Grey Mirror Lenses","HOLD","reference page was titled P8974 C416, same as the P8974 listing"),
 # --- Polo Ralph Lauren
 (47,"ralph-lauren","Polo Ralph Lauren","PH 4221","PH4221-613-773",S,"Havana Round Sunglasses with Brown Lenses","HIGH",""),
 (48,"ralph-lauren","Polo Ralph Lauren","PH 4212","PH4212-5001-187",S,"Black Rectangular Sunglasses with Grey Lenses","MED","reference colour printed 5001/87, stock list says 5001/187"),
 (50,"ralph-lauren","Polo Ralph Lauren","PH 3158","PH3158-941-173",S,"Gold-Tone Round Metal Sunglasses with Brown Lenses","HIGH",""),
 (53,"ralph-lauren","Polo Ralph Lauren","PH 4205U","PH4205U-5001-87",S,"Black Wayfarer Sunglasses with Grey Lenses","HIGH",""),
 (65,"ralph-lauren","Polo Ralph Lauren","PH 4224U","PH4224U-5003-73",S,"Havana Square Sunglasses with Striped Temple Detail and Brown Lenses","HIGH",""),
 (69,"ralph-lauren","Polo Ralph Lauren","PH 4224U","PH4224U-5001-87",S,"Black Square Sunglasses with Grey Lenses","HIGH",""),
 (71,"ralph-lauren","Polo Ralph Lauren","PH 4187","PH4187-5003-73",S,"Havana Soft-Square Sunglasses with Brown Lenses","HIGH",""),
 (70,"ralph-lauren","Polo Ralph Lauren","PH 3155","PH3155-9050-87",S,"Gunmetal Rectangular Metal Sunglasses with Grey Lenses","HIGH",""),
 (67,"ralph-lauren","Polo Ralph Lauren","PH 4217","PH4217-5001-71",S,"Black and Gunmetal Browline Sunglasses with Green Lenses","HIGH",""),
 (73,"ralph-lauren","Polo Ralph Lauren","PH 4195","PH4195V-5589-84",S,"Matte Grey Wayfarer Sunglasses with Gradient Lenses","MED","reference was PH 4195U 5589/8G; stock list says 4195V 5589/84"),
 (68,"ralph-lauren","Polo Ralph Lauren","PH 4217","PH4217-60137-73",S,"Black and Gunmetal Browline Sunglasses with Green Lenses","HOLD","identical to the 5001/71 render; no distinct 60137/73 colourway photo"),
 # --- Prada
 (51,"prada","Prada","Linea Rossa PS 55VS","OPS-55VS-DG009R",S,"Black Double-Bridge Sunglasses with Blue Lenses","HIGH",""),
 (59,"prada","Prada","PR 20YS","OPR-20YS-2AU09G",S,"Havana Double-Bridge Sunglasses with Grey Gradient Lenses","HIGH",""),
 (56,"prada","Prada","Linea Rossa PS 06VS","OPS-06VS-1BO5Z1",S,"Matte Black Square Sunglasses with Grey Lenses","HIGH",""),
 (55,"prada","Prada","Linea Rossa PS 01WS","OPS-01WS-581-06H",S,"Black Wrap Sunglasses with Grey Lenses","HOLD","reference was colour 1AB06F (black); stock colour 581/06H is havana"),
 (54,"prada","Prada","Linea Rossa PS 02WS","OPS-02WS-581-06H",S,"Havana Wrap Sunglasses with Red Logo Temple","HOLD","reference page was PS 02X, not 02WS"),
 (52,"prada","Prada","Linea Rossa PS 50XS","OPS-50XS-03P0H",S,"Black Geometric Sunglasses with Grey Lenses","HOLD","no reliable reference match found"),
 # --- Swarovski
 (44,"swarovski","Swarovski","SK6016","OSK6016-100-273",S,"Havana Cat-Eye Sunglasses with Crystal Detail and Brown Lenses","HIGH",""),
 (43,"swarovski","Swarovski","SK6017","OSK6017-100-2M4",S,"Havana Hexagonal Sunglasses with Crystal Detail and Light Brown Lenses","HIGH",""),
 (45,"swarovski","Swarovski","SK6013","OSK6013-1010-11",S,"Black Square Sunglasses with Crystal-Studded Front and Grey-Green Lenses","HIGH",""),
 (49,"swarovski","Swarovski","SK6001","OSK6001-100-273",S,"Havana Cat-Eye Sunglasses with Crystal Detail and Gold-Tone Temples","HOLD","reference page was SK6010, not SK6001"),
 # --- Versace
 (2,"versace","Versace","VE 4438-B","VE-4438-B-108-87",S,"Havana Round Sunglasses with Medusa Plaque and Grey Lenses","HIGH",""),
 (3,"versace","Versace","VE 4457","VE-4457-5429-87",S,"Havana Square Sunglasses with Medusa Temple Plaque and Grey Lenses","HIGH",""),
 (1,"versace","Versace","VE 3334","VE-3334-GB1",O,"Black Cat-Eye Optical Frames with Medusa Medallions, Colour GB1","HIGH",""),
 (13,"versace","Versace","VE 3334","VE-3334-109",O,"Black Cat-Eye Optical Frames with Medusa Medallions, Colour 109","MED","reference photo was colour GB1"),
 (4,"versace","Versace","VE 3354","VE-3354-GB1",O,"Black Optical Frames with Gold-Tone Logo Temples","MED","stock list says GBI (typo for GB1)"),
 # --- Tom Ford
 (11,"tom-ford","Tom Ford","TF 840","TF840-01C",S,"Black Flat-Top Shield Sunglasses with Grey Gradient Lenses","HIGH",""),
 (7,"tom-ford","Tom Ford","TF 840","TF840-28F",S,"Rose Gold-Tone Flat-Top Shield Sunglasses with Pink Gradient Lenses","HIGH",""),
 (5,"tom-ford","Tom Ford","TF 841","TF841-28F",S,"Havana and Rose Gold-Tone Shield Sunglasses with Brown Gradient Lenses","HIGH",""),
 (6,"tom-ford","Tom Ford","TF 841","TF841-28B",S,"Black and Rose Gold-Tone Shield Sunglasses with Grey Gradient Lenses","HIGH",""),
 (23,"tom-ford","Tom Ford","TF 818","TF818-30B",S,"Gold-Tone Crossbar Pilot Sunglasses with Grey-Pink Gradient Lenses","HIGH",""),
 (24,"tom-ford","Tom Ford","TF 818","TF818-28Z",S,"Rose Gold-Tone Crossbar Pilot Sunglasses with Lilac Lenses","HIGH",""),
 (26,"tom-ford","Tom Ford","TF 818","TF818-08G",S,"Gunmetal Crossbar Pilot Sunglasses with Green-Grey Mirror Lenses","HIGH",""),
 (28,"tom-ford","Tom Ford","TF 818","TF818-28E",S,"Gold-Tone Crossbar Pilot Sunglasses with Brown Lenses","HIGH",""),
 (30,"tom-ford","Tom Ford","TF 758-D","TF758-D-28P",S,"Gold-Tone Round-Square Sunglasses with Teal Gradient Lenses","HIGH",""),
 (31,"tom-ford","Tom Ford","TF 748-F","TF748-F-52N",S,"Gold-Tone Pilot Sunglasses with Green Lenses","HIGH",""),
 (33,"tom-ford","Tom Ford","TF 691","TF691-28A",S,"Gold-Tone Round Pilot Sunglasses with Dark Green Lenses","HIGH","reference photo includes the Tom Ford case and box"),
 (9,"tom-ford","Tom Ford","TF 838","TF838-28P",S,"Rose Gold-Tone Double-Bridge Sunglasses with Teal and Peach Gradient Lenses","HIGH",""),
 (40,"tom-ford","Tom Ford","FT 0771","FT0771-30A",S,"Gold-Tone Oval Pilot Sunglasses with Grey Lenses","HIGH",""),
 (36,"tom-ford","Tom Ford","FT 0918","FT0918-52F",S,"Havana Oval Sunglasses with Pink Gradient Lenses","HIGH",""),
 (34,"tom-ford","Tom Ford","FT 5632","FT5632-052",O,"Havana and Gold-Tone Round Optical Frames","HIGH","side-view reference photo"),
 (39,"tom-ford","Tom Ford","FT 0964","FT0964-45E",S,"Amber Shield Sunglasses with Yellow-Orange Lenses","HIGH",""),
 (42,"tom-ford","Tom Ford","FT 0814","FT0814-01A",S,"Black Shield Sunglasses with Light Blue Lenses","HIGH",""),
 (41,"tom-ford","Tom Ford","FT 0768","FT0768-01A",S,"Black Goggle Pilot Sunglasses with Grey Lenses","HIGH",""),
 (37,"tom-ford","Tom Ford","FT 0881","FT0881-56C",S,"Havana and Gunmetal Pilot Sunglasses with Grey Lenses","HIGH",""),
 (38,"tom-ford","Tom Ford","FT 0852","FT0852-28E",S,"Gold-Tone Geometric Sunglasses with Brown Lenses","HIGH",""),
 (12,"tom-ford","Tom Ford","TF 825","TF825-28F",S,"Gold-Tone Pilot Sunglasses with Brown Gradient Lenses","HIGH",""),
 (22,"tom-ford","Tom Ford","TF 825","TF825-12Q",S,"Gunmetal Pilot Sunglasses with Grey-Green Gradient Lenses","HIGH",""),
 (29,"tom-ford","Tom Ford","TF 784","TF784-28B",S,"Gold-Tone Pilot Sunglasses with Blue Gradient Lenses","HIGH",""),
 (14,"tom-ford","Tom Ford","TF 830","TF830-53Q",S,"Havana and Gunmetal Browline Sunglasses with Green Gradient Lenses","HIGH",""),
 (19,"tom-ford","Tom Ford","TF 853","TF853-28E",S,"Rose Gold-Tone Pilot Sunglasses with Brown Lenses","HIGH",""),
 (20,"tom-ford","Tom Ford","TF 853","TF853-12V",S,"Gunmetal Pilot Sunglasses with Teal-Grey Lenses","HIGH",""),
 (25,"tom-ford","Tom Ford","TF 848","TF848-01B",S,"Black Oversized Round Sunglasses with Grey Gradient Lenses","HIGH",""),
 (10,"tom-ford","Tom Ford","TF 836","TF836-52B",S,"Havana Shield Sunglasses with Grey-Peach Gradient Lenses","HIGH",""),
 (21,"tom-ford","Tom Ford","TF 912","TF912-14B",S,"Silver-Tone Geometric Sunglasses with Lilac Gradient Lenses","HIGH",""),
 (32,"tom-ford","Tom Ford","TF 791","TF791-01B",S,"Black Geometric Oversized Sunglasses with Grey-Peach Gradient Lenses","HIGH",""),
 (8,"tom-ford","Tom Ford","TF 842","TF842-01B",S,"Black Butterfly Sunglasses with Blue Gradient Lenses","HIGH","close-up reference photo"),
 (35,"tom-ford","Tom Ford","TF 737","TF737-01A",S,"Black Teardrop Sunglasses with Gold-Tone Bridge and Grey Lenses","HIGH",""),
 (46,"tom-ford","Tom Ford","Bailey TF 885","TF885-53F",S,"Havana Oversized Square Sunglasses with Yellow Gradient Lenses","HIGH",""),
 (15,"tom-ford","Tom Ford","TF 5700","TF5700-052",O,"Havana Round-Square Optical Frames","HIGH",""),
 (16,"tom-ford","Tom Ford","TF 5699","TF5699-052",O,"Havana Square Optical Frames","HIGH",""),
 (17,"tom-ford","Tom Ford","TF 5699","TF5699-001",O,"Black Square Optical Frames","HIGH",""),
 (27,"tom-ford","Tom Ford","TF 815","TF815-02B",S,"Black Square Sunglasses with Grey Gradient Lenses","HOLD","reference page was Hayden TF 831, not TF 815"),
 (18,"tom-ford","Tom Ford","TF 5707","TF5707-001",O,"Black Cat-Eye Optical Frames","HOLD","reference page was TF 5709 B, not TF 5707"),
]


# Added 2026-10-03 later: five poster-style renders for the models that had no image. They are
# referenced by filename (IMG_88xx.PNG) rather than the WhatsApp index.
X = [
 ("IMG_8892.PNG","porsche-design","Porsche Design","P8974","P8974-D-406",S,"Gold-Tone Square Pilot Sunglasses with Brown Lenses","HIGH","identified against the P8974 D406 retailer photo"),
 ("IMG_8891.PNG","prada","Prada","Linea Rossa PS 03QS","OPS-03QS-DG-0087",S,"Matte Black Wayfarer Sunglasses with Grey Gradient Lenses","MED","shape matches PS 03QS; colour code not verifiable from the image"),
 ("IMG_8893.PNG","persol","Persol","PO 3339V","PO3339V-95",O,"Black Square Optical Frames","MED","shape and black colour match 3339V 95; not verifiable from the image"),
 ("IMG_8889.PNG","porsche-design","Porsche Design","P8933","P8933-B-388",S,"Gold-Tone Pilot Sunglasses with Grey Lenses","HOLD","poster text reads 'Superior UV Protection': AGENTS.md bans UV claims without client proof"),
 ("IMG_8890.PNG","tom-ford","Tom Ford","TF 758-D","TF758-D-28E",S,"Gold-Tone Round-Square Sunglasses with Brown Lenses","HOLD","poster header reads 'PORSCHE DESIGN' but the frame is the Tom Ford TF 758-D (lens engraving reads FORD)"),
]

assert len(T) == 85 and len({t[0] for t in T}) == 85, (len(T), len({t[0] for t in T}))
assert len({t[4] for t in T}) == 85, "duplicate sku"

SRC = {t[0]: os.path.join(SUN, IDX[str(t[0])]) for t in T}
for x in X:
    SRC[x[0]] = os.path.join(SUN, x[0])
T = T + X
assert len(T) == 90 and len({t[4] for t in T}) == 90
os.makedirs(OUT, exist_ok=True)
rows, entries = [], []
for idx, bslug, brand, model, sku, cat, desc, conf, note in T:
    src = SRC[idx]
    fname = f"{brand.upper().replace(' ', '-')}-{sku}.png"
    dest = os.path.join(OUT, fname)
    if not os.path.exists(dest):
        Image.open(src).convert("RGB").save(dest, "PNG", optimize=False)
    kind = "Optical Frames" if cat == O else "Sunglasses"
    name = f"{brand} {model} {desc}"
    rows.append({"render": os.path.basename(src), "named_copy": f"branded/{fname}", "brand": brand, "model": model,
                 "sku": sku, "category": cat, "confidence": conf, "imported": "no" if conf == "HOLD" else "yes", "note": note})
    if conf != "HOLD":
        entries.append({"brand": bslug, "brandName": brand, "category": cat, "sku": sku, "name": name,
                        "price": None, "files": [f"branded/{fname}"], "confidence": conf})


with open(os.path.join(OUT, "_mapping-report.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0].keys())); w.writeheader(); w.writerows(rows)

hdr = """/**
 * Client-supplied branded eyewear, 2026-10-03: sunglasses and optical frames from the
 * STOCK LIST 11 SEPTEMBER workbook, matched to the Diverso studio renders in
 * Diverso-Products-images/Sunglasses (copies saved under branded/ by model number).
 * Generated by _build_sunglasses_2026_10_03.py; edit the table there, not this file.
 *
 * LINEAGE: each render is a re-render of one reference photo downloaded on 2026-09-27, so each
 * SKU is the stock-list label that photo was searched under. `confidence` records how well the
 * reference page title matched (HIGH = model and colour code; MED = one part did not).
 * Twelve rows whose reference showed a different model are NOT in this file. They are saved under
 * branded/ and listed in branded/_mapping-report.csv as HOLD until the client confirms them.
 *
 * PRICES: the stock list carries a price column. It is deliberately not published here; every
 * product is `Price on inquiry` with `ask` availability, matching the earlier batches, until the
 * client confirms those figures are customer-facing retail prices.
 *
 * NAMES: the stock list calls everything "ORIGNAL" (sic). That is an authenticity claim, which
 * AGENTS.md forbids without client-supplied proof, so it is absent from every name.
 */
"""
with open(MANIFEST, "w", encoding="utf-8") as f:
    f.write(hdr + "export const eyewear = " + json.dumps(entries, indent=2, ensure_ascii=False) + ";\n")

from collections import Counter
print("named copies:", len(T), "| manifest entries:", len(entries), "| held:", sum(1 for t in T if t[7] == "HOLD"))
print("by category:", dict(Counter(e["category"] for e in entries)))
print("by confidence:", dict(Counter(e["confidence"] for e in entries)))
