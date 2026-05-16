import type { ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CalendarDays, Clock, Pill, type LucideIcon } from "lucide-react";

type FaqItem = {
  id: string;
  icon: LucideIcon;
  title: string;
  content: ReactNode;
};

const timingRows = [
  { label: "食前", guide: "食事の30分〜1時間前" },
  { label: "食後", guide: "食事直後" },
  { label: "食間", guide: "食前・食後2時間以上あけて" },
  { label: "就寝前", guide: "寝る直前" },
];

const items: FaqItem[] = [
  {
    id: "1",
    icon: CalendarDays,
    title: "処方せんの有効期限はどのくらいですか？",
    content: (
      <>
        交付日を含めて原則<strong className="font-semibold text-[#1a367c]">4日間</strong>
        です。お早めにご持参ください。期限が近い・過ぎている場合も、まずはお電話でご相談ください。
      </>
    ),
  },
  {
    id: "2",
    icon: Clock,
    title: "食前・食後・食間の違いは？",
    content: (
      <>
        <p className="mb-4">
          お薬によって最適な服用タイミングが異なります。下の表をご参照いただくか、薬剤師にお尋ねください。
        </p>
        <div className="overflow-hidden rounded-lg border border-[hsl(var(--border))] bg-white">
          <table className="faq-timing-table w-full text-sm">
            <thead>
              <tr>
                <th>表記</th>
                <th>目安</th>
              </tr>
            </thead>
            <tbody>
              {timingRows.map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  <td>{row.guide}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    ),
  },
  {
    id: "3",
    icon: Pill,
    title: "ジェネリック医薬品は選べますか？",
    content:
      "はい。同等の効果が期待できるジェネリック医薬品への変更について、薬剤師がご説明し、ご希望に応じて対応いたします。",
  },
];

export function FaqSection() {
  return (
    <Accordion
      type="single"
      collapsible
      className="faq-accordion-ui w-full"
    >
      {items.map((item) => (
        <AccordionItem value={item.id} key={item.id} className="faq-accordion-item border-0">
          <AccordionTrigger className="faq-accordion-trigger py-3 text-[15px] leading-6 text-[#1a367c] hover:no-underline">
            <span className="flex items-center gap-3">
              <item.icon
                size={16}
                strokeWidth={2}
                className="shrink-0 opacity-60"
                aria-hidden="true"
              />
              <span>{item.title}</span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="faq-accordion-content ps-7 text-[0.9375rem] leading-relaxed text-muted-foreground">
            {item.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
