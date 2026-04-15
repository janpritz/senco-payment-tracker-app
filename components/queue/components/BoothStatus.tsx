import { GraduationCap, Sparkles } from 'lucide-react';

export const BoothStatus = ({ serving }: { serving: any }) => (
    <div className="grid grid-cols-2 gap-4 mb-8">
        <div className={`p-4 rounded-2xl border-2 transition-all ${serving?.status === 'toga' ? 'border-purple-600 bg-purple-50/50' : 'border-slate-100 bg-slate-50 opacity-50'}`}>
            <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-4 h-4 text-purple-600" />
                <p className="text-[10px] font-black uppercase text-slate-400">Toga Booth</p>
            </div>
            <p className="text-sm font-bold text-slate-900 truncate">
                {serving?.status === 'toga' ? serving.name : 'VACANT'}
            </p>
        </div>
        <div className={`p-4 rounded-2xl border-2 transition-all ${serving?.status === 'creative' ? 'border-orange-500 bg-orange-50/50' : 'border-slate-100 bg-slate-50 opacity-50'}`}>
            <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <p className="text-[10px] font-black uppercase text-slate-400">Creative Booth</p>
            </div>
            <p className="text-sm font-bold text-slate-900 truncate">
                {serving?.status === 'creative' ? serving.name : 'VACANT'}
            </p>
        </div>
    </div>
);