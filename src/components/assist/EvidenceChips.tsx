import { Button } from "@/components/ui/button";
import { ExternalLink, FileText, AlertCircle, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

interface EvidenceItem {
  label: string;
  href: string;
  kind: "status" | "logs" | "ticket" | "kb";
}

interface EvidenceChipsProps {
  items: EvidenceItem[];
}

const getIcon = (kind: string) => {
  switch (kind) {
    case "status":
      return <AlertCircle className="h-4 w-4" />;
    case "logs":
      return <FileText className="h-4 w-4" />;
    case "ticket":
      return <ExternalLink className="h-4 w-4" />;
    case "kb":
      return <BookOpen className="h-4 w-4" />;
    default:
      return <ExternalLink className="h-4 w-4" />;
  }
};

export const EvidenceChips = ({ items }: EvidenceChipsProps) => {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {items.map((item, idx) => (
        <Link key={idx} to={item.href}>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 text-xs"
            data-testid={`evidence-chip-${item.kind}`}
          >
            {getIcon(item.kind)}
            <span className="ml-1">{item.label}</span>
          </Button>
        </Link>
      ))}
    </div>
  );
};
