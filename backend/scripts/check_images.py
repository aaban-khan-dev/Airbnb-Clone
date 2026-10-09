"""Checks that every seed photo URL loads. Run from the backend folder:
    python -m scripts.check_images
"""

import urllib.request

from app.db.seed_data import IMAGE_POOLS, UNSPLASH


def main() -> None:
    broken = []
    for pool, photo_ids in IMAGE_POOLS.items():
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
        print(f"  remove '{photo_id}' from the '{pool}' pool in app/db/seed_data.py")


if __name__ == "__main__":
    main()
