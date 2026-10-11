import fitz
import os
import glob

pdf_dir = r"C:\Users\ASUS\.gemini\antigravity\brain\d726bf84-1199-4d68-99b0-a09bf10144ab\.user_uploaded"
out_dir = r"public\pdf_images"

os.makedirs(out_dir, exist_ok=True)

pdfs = glob.glob(os.path.join(pdf_dir, "*.pdf"))
img_count = 0

for pdf_path in pdfs:
    doc = fitz.open(pdf_path)
    for i in range(len(doc)):
        for img in doc.get_page_images(i):
            xref = img[0]
            pix = fitz.Pixmap(doc, xref)
            if pix.n - pix.alpha > 3:
                pix = fitz.Pixmap(fitz.csRGB, pix)
            
            img_path = os.path.join(out_dir, f"image_{img_count}.png")
            pix.save(img_path)
            img_count += 1
            pix = None
            if img_count >= 5: # Just get first 5 images total
                break
        if img_count >= 5:
            break
    if img_count >= 5:
        break

print(f"Extracted {img_count} images.")
