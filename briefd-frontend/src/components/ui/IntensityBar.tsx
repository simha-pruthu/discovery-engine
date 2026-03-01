"use client";

import { useEffect, useState } from "react";

export default function IntensityBar({ value }: { value: number }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setTimeout(() => setWidth(value), 200);
  }, [value]);

  const color =
    value >= 75
      ? "bg-[#D14E17]"
      : value >= 55
      ? "bg-amber-500"
      : "bg-emerald-500";

  return (
    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`${color} h-full transition-all duration-500`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}