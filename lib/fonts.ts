import { Newsreader, Plus_Jakarta_Sans } from "next/font/google";

/*
 * Mətn şriftləri next/font ilə self-host edilir — layout shift olmur.
 * Bir modulda saxlanılır ki, hər iki kök layout (sayt və admin) eyni
 * şrift instansiyasını paylaşsın — ayrı-ayrı import hər dəfə yeni
 * instansiya yaradıb şrift faylını təkrar yükləyərdi.
 */
export const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
