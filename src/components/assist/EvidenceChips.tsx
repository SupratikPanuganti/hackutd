import { Button } from "@/components/ui/button";
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
      return "⚠";
    case "logs":
      return "📄";
    case "ticket":
      return "🔗";
    case "kb":
      return "📚";
    default:
      return "🔗";
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
            className="h-7 text-xs rounded-xl bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
            data-testid={`evidence-chip-${item.kind}`}
          >
            <span>{getIcon(item.kind)}</span>
            <span className="ml-1">{item.label}</span>
          </Button>
        </Link>
      ))}
    </div>
  );
};
