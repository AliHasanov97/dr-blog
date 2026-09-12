/* --------------------------------------------------------------
 * Alət zolağının seçimləri — hamısı sadə dildə
 * ------------------------------------------------------------ */

export const colorChoices = [
  { hex: "", label: "Adi rəng", swatch: "#1c1b1f" },
  { hex: "#1b6b51", label: "Yaşıl vurğu", swatch: "#1b6b51" },
  { hex: "#ba1a1a", label: "Qırmızı xəbərdarlıq", swatch: "#ba1a1a" },
  { hex: "#131b2e", label: "Tünd göy", swatch: "#131b2e" },
  { hex: "#45464d", label: "Solğun boz", swatch: "#45464d" },
];

export const sizeChoices = [
  { value: "", label: "Standart" },
  { value: "12px", label: "12 px" },
  { value: "14px", label: "14 px" },
  { value: "16px", label: "16 px" },
  { value: "18px", label: "18 px" },
  { value: "20px", label: "20 px" },
  { value: "24px", label: "24 px" },
  { value: "28px", label: "28 px" },
  { value: "32px", label: "32 px" },
  { value: "36px", label: "36 px" },
  { value: "48px", label: "48 px" },
];

export const fontChoices = [
  { value: "", label: "Standart" },
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "Verdana, sans-serif", label: "Verdana" },
  { value: "Tahoma, sans-serif", label: "Tahoma" },
  { value: "Trebuchet MS, sans-serif", label: "Trebuchet MS" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "Times New Roman, serif", label: "Times New Roman" },
  { value: "Palatino, serif", label: "Palatino" },
  { value: "Garamond, serif", label: "Garamond" },
  { value: "Courier New, monospace", label: "Courier New" },
  { value: "Lucida Console, monospace", label: "Lucida Console" },
  { value: "Comic Sans MS, cursive", label: "Comic Sans" },
  { value: "Impact, sans-serif", label: "Impact" },
];

export const alignChoices = [
  { value: "left", label: "Sola", icon: "format_align_left" },
  { value: "center", label: "Ortaya", icon: "format_align_center" },
  { value: "right", label: "Sağa", icon: "format_align_right" },
  { value: "justify", label: "Eninə yay", icon: "format_align_justify" },
];

export const insertChoices = [
  { key: "heading", icon: "title", label: "Basliq" },
  { key: "quote", icon: "format_quote", label: "Sitat" },
  { key: "bulletList", icon: "format_list_bulleted", label: "Noqteli siyahi" },
  { key: "orderedList", icon: "format_list_numbered", label: "Nomreli siyahi" },
  { key: "table", icon: "table_chart", label: "Cedvel" },
  { key: "codeBlock", icon: "code", label: "Kod bloku" },
  { key: "horizontalRule", icon: "horizontal_rule", label: "Ufuqi xett" },
  { key: "image", icon: "image", label: "Sekil" },
  { key: "imageGroup", icon: "grid_view", label: "Sekil cergesi" },
  { key: "slider", icon: "gallery_thumbnail", label: "Slayd" },
  { key: "video", icon: "smart_display", label: "Video" },
  { key: "file", icon: "attach_file", label: "Fayl (PDF)" },
] as const;

export type InsertKey = (typeof insertChoices)[number]["key"];

export const lineHeightChoices = [
  { value: "1", label: "Sıx" },
  { value: "1.5", label: "Normal" },
  { value: "2", label: "Geniş" },
  { value: "2.5", label: "Çox geniş" },
];

export const specialChars = [
  { char: "©", label: "Copyright" },
  { char: "®", label: "Registered" },
  { char: "™", label: "Trademark" },
  { char: "→", label: "Arrow right" },
  { char: "←", label: "Arrow left" },
  { char: "↑", label: "Arrow up" },
  { char: "↓", label: "Arrow down" },
  { char: "≤", label: "Less or equal" },
  { char: "≥", label: "Greater or equal" },
  { char: "±", label: "Plus minus" },
  { char: "°", label: "Degree" },
  { char: "µ", label: "Micro" },
  { char: "α", label: "Alpha" },
  { char: "β", label: "Beta" },
  { char: "γ", label: "Gamma" },
  { char: "Δ", label: "Delta" },
  { char: "∞", label: "Infinity" },
  { char: "√", label: "Square root" },
  { char: "∑", label: "Sum" },
  { char: "π", label: "Pi" },
];

export const commonEmojis = [
  "😊", "👍", "❤️", "🏥", "💊", "💉", "🩺", "🫀", "🧠", "🦴",
  "⚠️", "✅", "❌", "ℹ️", "📌", "📋", "📊", "📈", "🔬", "🧪",
];
