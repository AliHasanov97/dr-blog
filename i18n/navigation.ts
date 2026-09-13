import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Sayt daxilindəki linklər/naviqasiya bunlardan istifadə etməlidir —
 * cari dilə uyğun prefiksi (`/az`, `/ru`) avtomatik əlavə edir.
 * `next/link` və `next/navigation`-ın əvəzinə işlədilir.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
