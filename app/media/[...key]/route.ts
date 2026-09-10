import { NextResponse } from "next/server";
import { getObjectStream, isR2Configured } from "@/lib/admin/storage/r2";

/**
 * R2-dəki faylları oxucuya çatdıran marşrut.
 *
 * Bucket publik açılmayanda işlədilir: fayl serverin öz açarları ilə
 * oxunur və oxucuya ötürülür, yəni bucket bağlı qala bilir.
 *
 * `R2_PUBLIC_URL` təyin ediləndə fayllara birbaşa Cloudflare şəbəkəsindən
 * müraciət olunur və bu marşrut istifadə edilmir — belə olması daha
 * sürətlidir, çünki trafik serverdən keçmir.
 */

/** Fayl adları təsadüfi sonluqla unikaldır — uzun keş təhlükəsizdir */
const CACHE = "public, max-age=31536000, immutable";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  if (!isR2Configured()) {
    return new NextResponse("Fayl anbarı qoşulmayıb", { status: 503 });
  }

  const { key: segments } = await params;
  const key = segments.map(decodeURIComponent).join("/");

  /* Yuxarı qovluğa çıxmaq cəhdləri rədd edilir */
  if (!key || key.includes("..")) {
    return new NextResponse("Yanlış ünvan", { status: 400 });
  }

  const object = await getObjectStream(key);
  if (!object) {
    return new NextResponse("Fayl tapılmadı", { status: 404 });
  }

  return new NextResponse(object.body, {
    headers: {
      "Content-Type": object.contentType,
      "Cache-Control": CACHE,
      ...(object.size ? { "Content-Length": String(object.size) } : {}),
    },
  });
}
