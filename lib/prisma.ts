/*
 * Bu modul yalnız serverdə işləyə bilər.
 *
 * `server-only` idxalı qoruyucudur: hansısa müştəri komponenti (birbaşa
 * və ya `lib/api` üzərindən dolayı) Prisma-ya toxunsa, build dərhal
 * xəta verir. Əvvəllər belə bir qoruyucu yox idi və Prisma brauzer
 * paketinə düşmüşdü — şərh, əlaqə və abunə formaları bu səbəbdən
 * işləmirdi.
 */
import "server-only";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
