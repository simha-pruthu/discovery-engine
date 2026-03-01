export default function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs uppercase tracking-wider font-medium px-3 py-1 bg-[#FDF4EE] border border-[#F3C6B2] text-[#D14E17] rounded-full">
      {children}
    </span>
  );
}