"""Checks that every seed photo URL loads. Run from the backend folder:
    python -m scripts.check_images
"""

import urllib.request

from app.db.seed_data import COVERS, ROOM_PHOTOS, UNSPLASH


def main() -> None:
    broken = []
    pools = {"cover": list(COVERS.values()), **ROOM_PHOTOS}
    for pool, photo_ids in pools.items():
        for photo_id in photo_ids:
            url = UNSPLASH.format(photo_id).replace("w=1200", "w=50")
            try:
                with urllib.request.urlopen(url, timeout=10) as response:
                    ok = response.status == 200
            except Exception:
                ok = False
            print(f"{'OK    ' if ok else 'BROKEN'}  {pool:<9} {photo_id}")
            if not ok:
                broken.append((pool, photo_id))

    print(f"\n{len(broken)} broken image(s)")
    for pool, photo_id in broken:
        where = "COVERS (pick another photo for that listing)" if pool == "cover" else f"the '{pool}' list in ROOM_PHOTOS"
        print(f"  replace '{photo_id}' in {where}, app/db/seed_data.py")


if __name__ == "__main__":
    main()
