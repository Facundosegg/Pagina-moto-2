import React from "react";
import { ChevronDown } from "lucide-react";

export default function FieldSelect({ label, value, onChange, options }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-[10px] tracking-widest text-[#8B8D8F] uppercase">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-[#1B1B20] border border-[#3A3A42] text-[var(--c-paper2)] text-sm px-3 py-2 pr-8 focus:outline-none focus:border-[var(--c-signal)]"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-[#8B8D8F] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </label>
  );
}
