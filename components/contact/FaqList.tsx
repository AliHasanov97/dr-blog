import { Card, AccordionItem } from "@/components/ui";
import type { FaqItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface FaqListProps {
  items: FaqItem[];
  className?: string;
}

export function FaqList({ items, className }: FaqListProps) {
  return (
    <Card className={cn("py-space-2xs", className)}>
      {items.map((item) => (
        <AccordionItem key={item.id} question={item.question}>
          {item.answer}
        </AccordionItem>
      ))}
    </Card>
  );
}
