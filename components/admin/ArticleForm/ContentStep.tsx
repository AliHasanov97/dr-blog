import { Button, Icon } from "@/components/ui";
import { AdminCard } from "../AdminCard";
import { ArticleCanvas } from "../canvas/ArticleCanvas";
import type { ArticleBlock } from "@/lib/types";

export interface ContentStepProps {
  blocks: ArticleBlock[];
  onChange: (blocks: ArticleBlock[]) => void;
  articleKey: string;
  onBack: () => void;
  onNext: () => void;
}

export function ContentStep({
  blocks,
  onChange,
  articleKey,
  onBack,
  onNext,
}: ContentStepProps) {
  return (
    <div className="flex flex-col gap-space-md">
      <AdminCard title="Məqalənin mətni" className="!overflow-visible">
        <ArticleCanvas blocks={blocks} onChange={onChange} articleKey={articleKey} />
      </AdminCard>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          <Icon name="arrow_back" size={18} />
          Geri
        </Button>
        <Button onClick={onNext}>
          Davam et
          <Icon name="arrow_forward" size={18} />
        </Button>
      </div>
    </div>
  );
}
