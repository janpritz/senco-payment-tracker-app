import { Database, UserMinus, CheckCircle2, Printer } from 'lucide-react';

export const StatsCards = ({ stats, onCardClick, onHistoryClick }: any) => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard 
            icon={<Database size={24}/>} 
            label="Fully Paid" value={stats.fullyPaidCount} color="green"
            onClick={() => onCardClick("Fully Paid Students", "fully_paid", stats.fullyPaidData)}
        />
        <StatCard 
            icon={<UserMinus size={24}/>} 
            label="Zero Payment" value={stats.zeroPaymentsCount} color="orange"
            onClick={() => onCardClick("Zero Payment Students", "zero_payment", stats.zeroPaymentsData)}
        />
        <StatCard 
            icon={<CheckCircle2 size={24}/>} 
            label="Total Claimed" value={stats.totalClaimed} color="blue"
            onClick={onHistoryClick}
        />
        <StatCard 
            icon={<Printer size={24}/>} 
            label="Printed/Exported" value={stats.totalExported} color="indigo"
        />
    </div>
);

const StatCard = ({ icon, label, value, color, onClick }: any) => {
    const colors: any = {
        green: "bg-green-50 text-green-600 border-green-400",
        orange: "bg-orange-50 text-orange-600 border-orange-400",
        blue: "bg-blue-50 text-blue-600 border-blue-400",
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-400"
    };
    return (
        <div onClick={onClick} className={`bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md transition-all hover:border-${color}-400`}>
            <div className={`p-3 rounded-lg ${colors[color].split(' ').slice(0,2).join(' ')}`}>{icon}</div>
            <div>
                <div className="text-gray-500 text-sm font-medium">{label}</div>
                <div className={`text-2xl font-bold ${colors[color].split(' ')[1]}`}>{value}</div>
            </div>
        </div>
    );
};