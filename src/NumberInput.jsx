import React from "react";

function formatThousands(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return "";
  return new Intl.NumberFormat("es-AR").format(Number(digits));
}

export default function NumberInput({ label, value, onChange, required, placeholder }) {
  function handleChange(e) {
    const digits = e.target.value.replace(/\D/g, "");
    onChange(digits);
  }

  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-[10px] tracking-widest text-[#8B8D8F] uppercase">
        {label} {required && <span className="text-[#F5B700]">*</span>}
      </span>
      <input
        type="text"
        inputMode="numeric"
        value={formatThousands(value)}
        placeholder={placeholder}
        onChange={handleChange}
        className="bg-[#F4F0E6] border border-[#D8D2C0] text-[#17171C] text-sm px-3 py-2 focus:outline-none focus:border-[#C1440E]"
      />
    </label>
  );
}
