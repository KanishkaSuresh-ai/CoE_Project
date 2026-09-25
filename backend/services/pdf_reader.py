from pathlib import Path

import pymupdf
from pypdf import PdfReader
import pdfplumber
from rapidocr_onnxruntime import RapidOCR


def extract_text_from_pdf(file_path):
    path = Path(file_path)
    suffix = path.suffix.lower()

    if suffix == ".txt":
        return path.read_text(encoding="utf-8", errors="ignore")

    if suffix != ".pdf":
        raise ValueError("Only PDF and TXT files are supported.")

    # Attempt 1: pypdf
    try:
        reader = PdfReader(str(path))
        text = ""

        for page in reader.pages:
            text += page.extract_text() or ""

        if text.strip():
            return text

    except Exception:
        pass

    # Attempt 2: pdfplumber
    try:
        with pdfplumber.open(str(path)) as pdf:
            text = ""

            for page in pdf.pages:
                page_text = page.extract_text()

                if page_text:
                    text += page_text

            if text.strip():
                return text

    except Exception:
        pass

    # Attempt 3: OCR for scanned/image PDFs
    try:
        ocr = RapidOCR()

        with pymupdf.open(str(path)) as doc:
            text = ""

            for page_num in range(len(doc)):
                page = doc.load_page(page_num)

                pix = page.get_pixmap(dpi=220)

                img_path = path.with_name(
                    f"{path.stem}_page_{page_num + 1}.png"
                )

                pix.save(str(img_path))

                result, _ = ocr(str(img_path))

                if result:
                    for item in result:
                        text += item[1] + "\n"

                img_path.unlink(missing_ok=True)

            if text.strip():
                return text.strip()

    except Exception:
        pass

    raise ValueError(
        "No readable text could be extracted from this PDF. "
        "Please upload a PDF that contains text or a scan with readable content."
    )