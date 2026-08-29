import React from "react";

export default function TextInput({ label, value, onChange, required, placeholder, type = "text" }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-[10px] tracking-widest text-[#8B8D8F] uppercase">
        {label} {required && <span className="text-[#F5B700]">*</span>}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#F4F0E6] border border-[#D8D2C0] text-[#17171C] text-sm px-3 py-2 focus:outline-none focus:border-[#C1440E]"
      />
    </label>
  );
}
