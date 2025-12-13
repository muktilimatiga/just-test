import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus, Settings } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { Ticket, Layers } from 'lucide-react'
import { X } from 'lucide-react'
import { Network } from 'lucide-react'
import { ConfigModal } from '@/components/modal/configModal'
import { ModalOverlay } from '@/components/ModalOverlay'
import { useAppStore } from '@/store'
import { APPS_CONFIG } from './apps'


export const Route = createFileRoute('/launcher/')({
  component: Launcher,
})



export function Launcher() {
  const { setCreateTicketModalOpen } = useAppStore();
  const [modalType, setModalType] = useState<'none' | 'config' | 'config_bridge' | 'config_batch'>('none');
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  const openModal = (type: 'create_ticket' | 'config' | 'config_bridge' | 'config_batch') => {
    setIsAddMenuOpen(false);
    if (type === 'create_ticket') {
      setCreateTicketModalOpen(true);
    } else {
      setModalType(type);
    }
  };
  return (
    <div className="p-8 md:p-12 max-w-[1600px] mx-auto animate-in fade-in duration-500 py-8">
      <ConfigModal isOpen={modalType === 'config'} onClose={() => setModalType('none')} type="basic" />
      <ConfigModal isOpen={modalType === 'config_bridge'} onClose={() => setModalType('none')} type="bridge" />
      <ConfigModal isOpen={modalType === 'config_batch'} onClose={() => setModalType('none')} type="batch" />

      {/* Add New Item Menu Modal - Restored Size */}
      <ModalOverlay
        isOpen={isAddMenuOpen}
        onClose={() => setIsAddMenuOpen(false)}
        hideCloseButton
        className="max-w-3xl p-0 overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
              <Plus className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">Add New Item</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-tight">Select an action to proceed</p>
            </div>
          </div>
          <button onClick={() => setIsAddMenuOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Grid Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-[#09090b]">

          {/* New Config */}
          <button
            onClick={() => openModal('config')}
            className="relative flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-500 dark:hover:border-indigo-500 transition-all group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent dark:from-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Settings className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white">New Config</span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure OLT/ONU</p>
          </button>

          {/* New Config Batch */}
          <button
            onClick={() => openModal('config_batch')}
            className="relative flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm hover:shadow-md hover:border-blue-500 dark:hover:border-blue-500 transition-all group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="h-16 w-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Layers className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white">New Batch</span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Bulk provisioning</p>
          </button>

          {/* New Ticket */}
          <button
            onClick={() => openModal('create_ticket')}
            className="relative flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm hover:shadow-md hover:border-emerald-500 dark:hover:border-emerald-500 transition-all group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="h-16 w-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Ticket className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white">New Ticket</span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Support ticket</p>
          </button>

          {/* Config Bridge */}
          <button
            onClick={() => openModal('config_bridge')}
            className="relative flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm hover:shadow-md hover:border-amber-500 dark:hover:border-amber-500 transition-all group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="h-16 w-16 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Network className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white">Config Bridge</span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Bridge mode</p>
          </button>
        </div>
      </ModalOverlay>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-6">
        {APPS_CONFIG.map((app) => {
          const CardContent = (
            <div className={cn(
              "h-60 flex flex-col items-center justify-center p-8 rounded-3xl transition-all duration-300 relative overflow-hidden",
              app.color,
              app.isAction && "cursor-pointer",
            )}>
              <div className={cn(
                "mb-6 transition-transform duration-300 group-hover:scale-110",
                app.id === 'new' ? "mb-4" : ""
              )}>
                <app.icon strokeWidth={1.5} className={cn("w-10 h-10", app.iconColor)} />
              </div>

              <h3 className={cn(
                "text-xl font-bold mb-2 tracking-tight",
                app.isEmpty ? "text-muted-foreground" : "text-foreground"
              )}>
                {app.title}
              </h3>

              <p className={cn(
                "text-sm font-medium",
                app.isEmpty ? "text-muted-foreground/60" : "text-muted-foreground"
              )}>
                {app.subtitle}
              </p>
            </div>
          );

          if (app.id === 'new') {
            return (
              <div key={app.id} className="block outline-none cursor-pointer group select-none" onClick={() => setIsAddMenuOpen(true)}>
                {CardContent}
              </div>
            );
          }

          if (app.to) {
            return (
              <Link key={app.id} to={app.to} className="block group outline-none select-none">
                {CardContent}
              </Link>
            );
          }

          return (
            <div key={app.id} className="block outline-none group select-none">
              {CardContent}
            </div>
          );
        })}
      </div>
    </div>
  )

}
