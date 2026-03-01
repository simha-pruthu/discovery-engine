import clsx from "clsx";

export default function Button({
  children,
  variant = "primary",
  className,
  ...props
}: any) {
  return (
    <button
      className={clsx(
        "px-6 py-3 rounded-lg text-sm font-medium transition",
        variant === "primary" &&
          "bg-[#D14E17] text-white hover:opacity-90",
        variant === "secondary" &&
          "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}