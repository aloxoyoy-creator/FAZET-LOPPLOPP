import pymupdf
import os
import glob

pdf_dir = r"C:\Users\ASUS\.gemini\antigravity\brain\d726bf84-1199-4d68-99b0-a09bf10144ab\.user_uploaded"
out_dir = r"public\pdf_images"
os.makedirs(out_dir, exist_ok=True)

# List pdfs
pdfs = sorted(glob.glob(os.path.join(pdf_dir, "*.pdf")))

for pdf_idx, pdf_path in enumerate(pdfs):
    doc = pymupdf.open(pdf_path)
    base = os.path.basename(pdf_path)
    print(f"Processing {base} ({len(doc)} pages)")
    
    # Render each page to an image or extract images
    for page_num in range(len(doc)):
        page = doc[page_num]
        image_list = page.get_images()
        for img_idx, img in enumerate(image_list):
            xref = img[0]
            pix = pymupdf.Pixmap(doc, xref)
            if pix.size > 20000: # Only save images larger than 20KB to avoid tiny icons
                if pix.n - pix.alpha > 3:
                    pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
                img_name = f"pdf{pdf_idx}_page{page_num}_img{img_idx}.png"
                pix.save(os.path.join(out_dir, img_name))
                print(f"Saved {img_name} ({pix.size} bytes)")
            pix = None

print("Done extracting images.")
