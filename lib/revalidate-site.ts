import { revalidatePath } from "next/cache";
import { routing } from "@/i18n/routing";

/**
 * Publik sayt `/[locale]/...` altındadır — admin-dən bir səhifəni
 * yeniləyəndə hər iki dilin keşini ayrıca revalidate etmək lazımdır,
 * çünki `revalidatePath("/articles")` kimi prefikssiz yol artıq
 * mövcud route-a uyğun gəlmir.
 */
export function revalidateSitePath(path: string) {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}${path}`);
  }
}
