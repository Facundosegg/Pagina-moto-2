import React from "react";

export default function ColorField({ label, value, onChange }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-[10px] tracking-widest text-[#8B8D8F] uppercase">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-9 border border-[#D8D2C0] cursor-pointer bg-white p-0.5 shrink-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 bg-white border border-[#D8D2C0] text-[#17171C] text-sm px-3 py-2 font-mono focus:outline-none focus:border-[#C1440E]"
        />
      </div>
    </label>
  );
}
