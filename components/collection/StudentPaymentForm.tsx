import { Search, Loader2, School, CheckCircle2 } from "lucide-react";
import { fixEncoding } from "@/lib/utils";

interface StudentFormProps {
  query: string;
  setQuery: (val: string) => void;
  // Suggestions added here
  suggestions: any[] | undefined;
  showSuggestions: boolean;
  setShowSuggestions: (val: boolean) => void;
  onSelect: (student: any) => void;

  isSearching: boolean;
  searchError: string;
  selectedStudent: any | null;
  amount: string;
  setAmount: (val: string) => void;
  onSubmit: () => void;
  isDisabled: boolean;
  isSubmitting: boolean;
  isOverLimit: boolean;
  isOverRemaining: boolean;
  remainingBalance: number;
}

export function StudentPaymentForm(props: StudentFormProps) {
  const getCollegeColor = (college: string) => {
    const c = college?.toUpperCase() || "";
    if (c.includes("CITE")) return "bg-emerald-600";
    if (c.includes("CASE")) return "bg-blue-600";
    if (c.includes("CCJE")) return "bg-red-600";
    if (c.includes("COHME")) return "bg-orange-500";
    return "bg-slate-900";
  };

  return (
    <div className="space-y-6">
      {/* Lookup Container with Relative Positioning for Dropdown */}
      <div className="relative">
        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Student Lookup</label>
        <div className="relative mt-2">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${props.isSearching ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} size={20} />
          <input
            type="text"
            className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl font-bold outline-none text-slate-900 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            placeholder="Search Student ID or Name..."
            value={props.query}
            autoComplete="off"
            onChange={(e) => {
              const val = e.target.value;
              props.setQuery(val);

              // If user clears the input, tell the parent to reset the selection
              if (val.trim() === "") {
                props.onSelect(null);
              } else {
                props.setShowSuggestions(true);
              }
            }}
            onFocus={() => props.query.length > 0 && props.setShowSuggestions(true)}
          />
          {props.isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-emerald-500" size={18} />}
        </div>

        {/* Suggestion Dropdown */}
        {props.showSuggestions && props.suggestions && props.suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
            {props.suggestions.map((s) => (
              <button
                key={s.student_id}
                type="button"
                onClick={() => props.onSelect(s)}
                className="w-full px-5 py-4 text-left hover:bg-slate-50 flex flex-col border-b border-slate-50 last:border-0 transition-colors group"
              >
                <span className="font-black text-slate-800 uppercase text-sm group-hover:text-emerald-600 transition-colors">
                  {fixEncoding(s.full_name)}
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  ID: {s.student_id} • {s.college}
                </span>
              </button>
            ))}
          </div>
        )}

        {props.searchError && <p className="text-red-500 text-[10px] font-black uppercase mt-2 ml-1">{props.searchError}</p>}
      </div>

      {props.selectedStudent && (
        <div className="space-y-6 animate-in slide-in-from-top-4 duration-300">
          <div className={`p-5 rounded-2xl text-white shadow-lg ${getCollegeColor(props.selectedStudent.college)}`}>
            <div className="flex items-center gap-2 mb-1 opacity-70">
              <School size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">{props.selectedStudent.college}</span>
            </div>
            <h3 className="font-black text-xl leading-tight truncate">{fixEncoding(props.selectedStudent.full_name)}</h3>
            <p className="text-[10px] opacity-80 font-bold">{props.selectedStudent.course}</p>
          </div>

          <div>
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-black uppercase text-slate-400">Payment Amount (₱)</label>
              {props.isOverLimit && <span className="text-[9px] font-black text-red-500 uppercase animate-pulse">Max Limit: ₱4,000</span>}
            </div>
            <input
              type="number"
              className={`w-full mt-2 px-6 py-5 bg-slate-100 text-slate-900 rounded-2xl font-black text-3xl outline-none transition-all ${props.isOverLimit || props.isOverRemaining ? 'ring-2 ring-red-500/50 bg-red-50' : 'focus:ring-2 focus:ring-emerald-500/20'
                }`}
              placeholder="0.00"
              value={props.amount}
              onChange={(e) => props.setAmount(e.target.value)}
            />
            {props.isOverRemaining && (
              <p className="text-[10px] font-black text-red-500 mt-2 ml-1">
                Exceeds balance (₱{props.remainingBalance.toLocaleString()})
              </p>
            )}
          </div>

          <button
            onClick={props.onSubmit}
            disabled={props.isDisabled}
            className={`w-full py-5 rounded-2xl font-black text-white uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 ${props.isDisabled ? 'bg-slate-200 text-slate-400 shadow-none' : 'bg-slate-900 hover:bg-emerald-600 active:scale-[0.98]'
              }`}
          >
            {props.isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
            <span>{props.isSubmitting ? "Processing..." : "Save Payment"}</span>
          </button>
        </div>
      )}
    </div>
  );
}