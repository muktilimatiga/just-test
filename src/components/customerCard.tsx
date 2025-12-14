

import { Avatar, AvatarFallback } from '@/components/ui';
import { Badge } from './ui/badge';
import type { Customer } from '@/types';

interface CustomerCardProps {
    user: Customer;
    onChangeUser?: () => void;
}

export const CustomerCard = ({ user, onChangeUser }: CustomerCardProps) => {
    return (
        <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50/50 p-5 transition-all hover:border-indigo-200 hover:shadow-sm dark:border-zinc-800 dark:bg-white/5 dark:hover:border-indigo-900/50">

            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Avatar>
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div className="space-y-1">
                        <h3 className="font-bold text-slate-900 dark:text-white text-base leading-none">
                            {user.name}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {user.user_pppoe}
                        </p>
                        <div className="flex items-center gap-3 text-xs pt-0.5">
                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Active
                            </div>
                            <span className="text-slate-300 dark:text-zinc-700">|</span>
                            <span className="font-mono text-slate-500 dark:text-slate-500">ID: {user.id}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                    <Badge variant="outline" className="capitalize border-indigo-200 bg-indigo-50 text-indigo-700 font-semibold shadow-sm dark:border-indigo-900/50 dark:bg-indigo-900/20 dark:text-indigo-300">
                        {user.user_pppoe}
                    </Badge>
                    {onChangeUser && (
                        <button
                            onClick={onChangeUser}
                            className="text-xs font-medium text-slate-500 hover:text-slate-900 hover:underline decoration-slate-400 underline-offset-2 transition-colors dark:text-slate-400 dark:hover:text-slate-200"
                        >
                            Change
                        </button>
                    )}
                </div>
            </div>

            {/* Decorative background element */}
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-indigo-50/50 blur-2xl -z-10 dark:bg-indigo-500/5" />
        </div>
    );
};