# Italian Finds v4

Static GitHub Pages portfolio. Upload the contents of this folder to the repository root.

## Layout and file structure
- Dark background retained; square wordmark uses the smaller 20px size.
- Main-page car cards are square. Gallery thumbnails are square; clicking an image opens the original file in a full-screen viewer with previous/next navigation and no crop applied in the viewer.
- Telegram contact: https://t.me/Anna_Chernyakhovskaya
- Each car has its own numbered folder `assets/01/` through `assets/12/`.
- File naming example: `assets/03/Fiat500-Main.jpg`, `Fiat500-01.jpg`, `Fiat500-02.jpg`.
- The first car's three local video paths are `assets/01/AlfaGTJunior-10.mp4`, `AlfaGTJunior-11.mp4`, and `AlfaGTJunior-12.mp4`. Add your MP4s with these exact names.

## Important image note
The included JPGs are illustrative assets carried forward from the previous prototype and renamed into the requested structure. They are not authentic photographs of these exact cars, and not all are true portrait originals. Replace them with your own portrait photographs; the full-screen viewer preserves the source image's full aspect ratio. Main/gallery grid thumbnails are intentionally square-cropped with CSS only.

## V5 dynamic galleries
- The gallery discovers numbered JPG files sequentially from `PREFIX-01.jpg` up to the first missing number (up to 200), so each car can have a different number of photos. It does not create empty placeholders. Keep numbering continuous with no gaps.
- `PREFIX-Main.jpg` remains the main-page thumbnail and is not counted as a gallery image.
- Optional local videos can be named `PREFIX-10.mp4`, `PREFIX-11.mp4`, etc.; video scanning stops at the first missing number.
- GitHub Pages is static and cannot list a folder automatically, so the script checks sequential filenames.
