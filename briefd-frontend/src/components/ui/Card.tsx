export default function Card({ children, className = "" }: any) {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-xl shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}