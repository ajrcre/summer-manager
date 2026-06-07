"use client";

import { MessageCircle } from "lucide-react";

type Line = { time?: string | null; title: string; done?: boolean };

type Props = {
  memberName: string;
  dateLabel: string;
  lines: Line[];
};

/** Opens WhatsApp with a pre-filled Hebrew schedule message (wa.me link). */
export function ShareToWhatsApp({ memberName, dateLabel, lines }: Props) {
  function share() {
    const header = `📅 לוח הזמנים של ${memberName} – ${dateLabel}`;
    const body = lines
      .map((l) => {
        const check = l.done ? "✅" : "▫️";
        const time = l.time ? `${l.time} ` : "";
        return `${check} ${time}${l.title}`;
      })
      .join("\n");
    const text = `${header}\n\n${body}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener");
  }

  return (
    <button
      onClick={share}
      className="flex items-center gap-1.5 rounded-full bg-green-500 px-4 py-2 text-sm font-bold text-white shadow-sm active:scale-95"
    >
      <MessageCircle size={16} />
      שיתוף בוואטסאפ
    </button>
  );
}
