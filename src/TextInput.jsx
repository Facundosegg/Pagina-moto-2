import React from "react";

export default function TextInput({ label, value, onChange, required, placeholder, type = "text" }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-[10px] tracking-widest text-[#8B8D8F] uppercase">
        {label} {required && <span className="text-[var(--c-signal)]">*</span>}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[var(--c-paper2)] border border-[#D8D2C0] text-[var(--c-ink)] text-sm px-3 py-2 focus:outline-none focus:border-[var(--c-rust)]"
      />
    </label>
  );
}
