export async function compressImageToUnder5MB(file: File): Promise<{ blob: Blob; type: string }> {
  const MAX_BYTES = 5 * 1024 * 1024;
  const MAX_DIM = 2000; // cap long edge to reduce size

  const img = await loadBitmap(file);
  const { width, height } = fitWithin(img.width, img.height, MAX_DIM, MAX_DIM);

  // draw to canvas
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img as any, 0, 0, width, height);

  // try progressive quality reduction
  let quality = 0.92;
  let out = await canvasToBlob(canvas, "image/jpeg", quality);
  let attempts = 0;

  while (out.size > MAX_BYTES && attempts < 8) {
    quality = Math.max(0.5, quality - 0.1);
    out = await canvasToBlob(canvas, "image/jpeg", quality);
    attempts++;
    // if still too big near 0.5, also reduce dimensions a bit
    if (out.size > MAX_BYTES && quality <= 0.6 && attempts % 2 === 0) {
      const nw = Math.round(canvas.width * 0.85);
      const nh = Math.round(canvas.height * 0.85);
      if (nw < 600 || nh < 600) break; // don't degrade too much
      canvas.width = nw;
      canvas.height = nh;
      ctx.drawImage(img as any, 0, 0, nw, nh);
    }
  }

  if (out.size > MAX_BYTES) {
    throw new Error("Could not compress image under 5MB");
  }
  return { blob: out, type: out.type || "image/jpeg" };
}

export async function blobToBase64Data(blob: Blob): Promise<string> {
  // returns only the base64 payload (no data: prefix)
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read blob"));
    reader.onloadend = () => {
      const result = String(reader.result || "");
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.readAsDataURL(blob);
  });
}

function fitWithin(w: number, h: number, maxW: number, maxH: number) {
  const scale = Math.min(maxW / w, maxH / h, 1);
  return { width: Math.round(w * scale), height: Math.round(h * scale) };
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ("createImageBitmap" in window) {
    try {
      // @ts-ignore
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      /* fall through */
    }
  }
  return await loadImageElement(file);
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Canvas toBlob failed"))), type, quality);
  });
}