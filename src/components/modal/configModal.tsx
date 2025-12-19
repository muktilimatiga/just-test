import { useState, useEffect } from 'react';
import { RefreshCw, Unlock, User as UserIcon, Search, X, Settings, Scan, DownloadCloud, Network, Trash2, Layers } from 'lucide-react';
import { Label, Input, Select, Button, Switch, Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFiberStore } from '@/store/useFiberStore';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { useConfigurationForm } from '@/hooks/useNewConfig';

// Import React Query Hooks
import {  usePsbData, useScanOnts } from '@/hooks/useApi';

// Import Form Components
import { FormInput } from '@/components/form/FormInput';
import { FormTextarea } from '@/components/form/FormTextarea';
import { cn } from '@/lib/utils';
import { ModalOverlay } from '../ModalOverlay';

interface BatchItem {
  sn: string;
  port: string;
  loading: boolean;
  customer: any | null;
}

export const ConfigModal = ({ isOpen, onClose, type }: { isOpen: boolean, onClose: () => void, type: 'basic' | 'bridge' | 'batch' }) => {
  const [mode, setMode] = useState<'manual' | 'auto'>('manual');
  const [selectedOlt, setSelectedOlt] = useState<string>('');
  const [selectedModem, setSelectedModem] = useState<string>('');
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [detectedOnts, setDetectedOnts] = useState<any[]>([]);
  const [batchQueue, setBatchQueue] = useState<BatchItem[]>([]);

  // 1. React Query: Global Options

  // 2. React Query: PSB Data (Fetches automatically when mode === 'auto')
  const {
    data: psbList,
    isLoading: isPsbLoading,
    refetch: refetchPsb,
    isRefetching: isPsbRefetching
  } = usePsbData(mode === 'auto' && type === 'basic');

  // 3. React Query: Scan Mutation
  const { mutateAsync: scanOnts, isPending: isScanLoading } = useScanOnts();

  // 4. Form Hook
  const {
    form,
    isSubmitting,
    modemOptions,
    packageOptions,
    isLoadingOptions
  } = useConfigurationForm(selectedOlt || 'default');

  const {
    searchTerm,
    setSearchTerm,
    searchResults,
    searchCustomers,
    resetSearch
  } = useFiberStore();

  // Set default OLT when options load
  useEffect(() => {
    if (isOpen) {
      resetSearch();
      setDetectedOnts([]);
      setMode('manual');
      setBatchQueue([]);
      form.reset();
    }
  }, [isOpen]); // 👈 Only depend on isOpen

  // 2. Set default OLT only when options become available
  useEffect(() => {
    if (isOpen && oltOptions.length > 0 && !selectedOlt) {
      setSelectedOlt(oltOptions[0]);
    }
  }, [isOpen, oltOptions]);
  // Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isOpen && mode === 'manual' && searchTerm.length > 1 && type === 'basic') {
        searchCustomers(searchTerm);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, isOpen, mode, type]);

  // --- Handlers ---

  const handleSelectUser = (user: any) => {
    form.setFieldValue('customer.name', user.name || '');
    form.setFieldValue('customer.address', user.alamat || '');
    form.setFieldValue('customer.pppoe_user', user.user_pppoe || '');
    form.setFieldValue('customer.pppoe_pass', user.pppoe_password || '123456');
    resetSearch();
    setSearchTerm('');
  };

  // Update this function in your component
  const handleSelectPsb = (value: string) => { // Changed from (e: any)
    const selectedId = value; // Use value directly
    const selected = psbList?.find(p => p.user_pppoe === selectedId);

    if (selected) {
      form.setFieldValue('customer.name', selected.name || '');
      form.setFieldValue('customer.address', selected.address || '');
      form.setFieldValue('customer.pppoe_user', selected.user_pppoe || '');
      form.setFieldValue('customer.pppoe_pass', selected.pppoe_password || '');
      if (selected.paket) form.setFieldValue('package', selected.paket);
    }
  };

  const handleScanOlt = async () => {
    if (!selectedOlt) {
      toast.error("Please select an OLT device first");
      return;
    }
    try {
      const data = await scanOnts(selectedOlt);

      if (data && data.length > 0) {
        setDetectedOnts(data);
        // Auto-select the first SN in the form
        if (type !== 'batch') {
          form.setFieldValue('sn', data[0].sn);
        }
        toast.success(`Found ${data.length} unconfigured devices`);
      } else {
        setDetectedOnts([]);
        toast.info("No unconfigured devices found");
      }
    } catch (e) {
      console.error(e);
      toast.error("Scan failed, please try again");
    }
  };

  const handleAddToBatch = async (sn: string) => {
    if (!sn) return;
    if (batchQueue.find(i => i.sn === sn)) {
      toast.warning("Device already in queue");
      return;
    }
    const ont = detectedOnts.find(d => d.sn === sn);
    if (!ont) return;

    const newItem: BatchItem = {
      sn,
      port: `${ont.pon_port}/${ont.pon_slot}`,
      loading: true,
      customer: null
    };

    setBatchQueue(prev => [...prev, newItem]);

    // Note: We could use useQuery here too, but for a list item lookup 
    // triggered individually, direct call or a separate hook component is often easier.
    // We'll keep the direct Supabase call for now to keep it simple.
    try {
      const { data } = await supabase
        .from('data_fiber')
        .select('*')
        .eq('onu_sn', sn)
        .maybeSingle();

      setBatchQueue(prev => prev.map(item => {
        if (item.sn === sn) {
          return {
            ...item,
            loading: false,
            customer: data ? {
              name: data.name,
              address: data.alamat,
              pppoe: data.user_pppoe,
              packet: data.paket
            } : null
          };
        }
        return item;
      }));
    } catch (err) {
      console.error("Error finding customer for SN:", sn, err);
      setBatchQueue(prev => prev.map(item => item.sn === sn ? { ...item, loading: false } : item));
    }
  };

  const handleRemoveFromBatch = (sn: string) => {
    setBatchQueue(prev => prev.filter(i => i.sn !== sn));
  };

  const getTitle = () => {
    switch (type) {
      case 'bridge': return 'Bridge Configuration';
      case 'batch': return 'Batch Provisioning';
      default: return 'New Service Configuration';
    }
  };

  return (
    <ModalOverlay
      isOpen={isOpen}
      onClose={onClose}
      hideCloseButton={true}
      // 1. Changed rounded-x1 -> rounded-xl
      // 2. Added h-auto to make it hug content
      className="max-w-xl h-auto p-0 overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800 shadow-2xl bg-white dark:bg-zinc-900"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          {getTitle()}
        </h2>
        <div className="flex items-center gap-4">
          {type === 'basic' && (
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-800 p-1 pr-3 rounded-full border border-slate-200 dark:border-zinc-700">
              <Switch
                checked={mode === 'auto'}
                onCheckedChange={(c) => setMode(c ? 'auto' : 'manual')}
              />              <Label className="text-[10px] font-bold uppercase tracking-wider cursor-pointer select-none text-slate-600 dark:text-slate-400" onClick={() => setMode(m => m === 'manual' ? 'auto' : 'manual')}>
                {mode === 'auto' ? 'Auto (API)' : 'Manual'}
              </Label>
            </div>
          )}
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3 max-h-[80vh] overflow-y-auto bg-white dark:bg-zinc-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (type === 'batch') {
              console.log('Batch Submit', batchQueue);
            } else {
              form.handleSubmit();
            }
          }}
        >
          {/* Top Row: OLT, Package, Modem */}
          <div className="flex gap-4 mb-4">
            <div className="flex space-y-1 gap-10 justify-between">
              <div className="relative">
                <Select
                  value={selectedOlt}
                  onValueChange={setSelectedOlt}
                  disabled={isSubmitting}
                >
                  {/* 1. className goes on the Trigger, not the Root */}
                  <SelectTrigger className="text-xs h-10 bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500/20 font-medium">

                    {/* 2. Handle the "empty" state via the placeholder prop */}
                    <SelectValue placeholder="-- Select OLT --" />

                  </SelectTrigger>

                  <SelectContent>
                    {/* 3. Use SelectItem instead of <option> */}
                    {oltOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="relative gap-2">
                <Select
                  value={selectedModem}
                  onValueChange={setSelectedModem}
                  disabled={isSubmitting}
                >
                  {/* 1. className goes on the Trigger, not the Root */}
                  <SelectTrigger className="text-xs h-10 bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500/20 font-medium">

                    {/* 2. Handle the "empty" state via the placeholder prop */}
                    <SelectValue placeholder="-- Modem Type --" />

                  </SelectTrigger>

                  <SelectContent>
                    {/* 3. Use SelectItem instead of <option> */}
                    {modemOptions.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select
                  value={selectedPackage}
                  onValueChange={setSelectedPackage}
                  disabled={isSubmitting}
                >
                  {/* 1. className goes on the Trigger, not the Root */}
                  <SelectTrigger className="relative text-xs h-10 bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500/20 font-medium">

                    {/* 2. Handle the "empty" state via the placeholder prop */}
                    <SelectValue placeholder="-- Select Package --" />

                  </SelectTrigger>

                  <SelectContent>
                    {/* 3. Use SelectItem instead of <option> */}
                    {packageOptions.map((pkg) => (
                      <SelectItem key={pkg} value={pkg}>
                        {pkg}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

            </div>
          </div>

          {/* BATCH MODE UI */}
          {type === 'batch' ? (
            <div className="space-y-4">
              <div className="flex items-end gap-3 p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-800">
                <div className="flex-1 space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Select Detected SN</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleScanOlt}
                      disabled={isScanLoading || !selectedOlt}
                      className="bg-white hover:bg-blue-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-700 h-10 px-3 shrink-0"
                    >
                      {isScanLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Scan className="h-4 w-4" />}
                    </Button>
                    <Select
                      value=""
                      onValueChange={(val) => handleAddToBatch(val)}
                    >
                      <SelectTrigger className="flex-1 bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-700 h-10 text-xs font-mono">
                        <SelectValue placeholder="-- Add Device to Queue --" />
                      </SelectTrigger>

                      <SelectContent>
                        {detectedOnts
                          .filter(ont => !batchQueue.find(b => b.sn === ont.sn))
                          .map(ont => (
                            <SelectItem key={ont.sn} value={ont.sn}>
                              {ont.sn} (Port {ont.pon_port}/{ont.pon_slot})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950 min-h-[200px]">
                <div className="grid grid-cols-12 gap-2 bg-slate-50 dark:bg-zinc-900 p-3 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200">
                  <div className="col-span-3">Serial Number</div>
                  <div className="col-span-2">Port</div>
                  <div className="col-span-6">Customer Match</div>
                  <div className="col-span-1 text-center">Action</div>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {batchQueue.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                      <Layers className="h-8 w-8 opacity-20" />
                      <p className="text-xs">No devices added to queue.</p>
                    </div>
                  )}
                  {batchQueue.map((item) => (
                    <div key={item.sn} className="grid grid-cols-12 gap-2 p-3 border-b border-slate-100 items-center text-xs">
                      <div className="col-span-3 font-mono font-medium">{item.sn}</div>
                      <div className="col-span-2 text-slate-500">{item.port}</div>
                      <div className="col-span-6">
                        {item.loading ? "Finding match..." : (item.customer ? item.customer.name : "No Customer Found")}
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button type="button" onClick={() => handleRemoveFromBatch(item.sn)} className="text-slate-400 hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* SINGLE CONFIGURATION CONTENT (Basic/Bridge) */
            <>
              <div className="space-y-4 p-5 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-800">

                {type === 'bridge' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center text-amber-600 border border-slate-200 shadow-sm">
                        <Network className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold">VLAN Configuration</h3>
                        <p className="text-[10px] text-slate-500">Assign VLAN ID for bridge service</p>
                      </div>
                    </div>
                    <Input
                      placeholder="VLAN ID"
                      className="bg-white dark:bg-zinc-950 h-10 text-xs font-mono"
                    />
                  </div>
                )}

                {type !== 'bridge' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center text-indigo-600 border border-slate-200 shadow-sm">
                        {mode === 'auto' ? <DownloadCloud className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold">{mode === 'auto' ? 'New Registration' : 'Import Customer'}</h3>
                        <p className="text-[10px] text-slate-500">
                          {mode === 'auto' ? 'Select from pending registrations (API)' : 'Search from CRM database'}
                        </p>
                      </div>
                    </div>

                    {mode === 'manual' ? (
                      <div className="relative z-20">
                        <div className="absolute left-3 top-2.5 pointer-events-none">
                          <Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <Input
                          placeholder="Search name, ID or address..."
                          className="pl-9 bg-white dark:bg-zinc-950 h-10 text-xs"
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                        />
                        {searchResults.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto z-50 p-1">
                            {searchResults.map(u => (
                              <div key={u.id} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-md cursor-pointer flex items-center gap-3" onClick={() => handleSelectUser(u)}>
                                <Avatar className="h-8 w-8">
                                  {/* Always try to render the image. If u.image is null, this just won't show. */}
                                  <AvatarImage
                                    alt={u.name}
                                  />

                                  {/* This will automatically appear if the image above is missing or fails */}
                                  <AvatarFallback className="text-[10px] bg-indigo-50 text-indigo-600">
                                    {u.name?.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="overflow-hidden">
                                  <p className="text-xs font-bold truncate">{u.name}</p>
                                  <p className="text-[10px] text-slate-500 truncate">{u.user_pppoe}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Select
                          onValueChange={handleSelectPsb}
                          disabled={isPsbLoading || isPsbRefetching}
                        >
                          <SelectTrigger className="bg-white dark:bg-zinc-950 text-xs h-10 flex-1 border-slate-200 dark:border-zinc-700">
                            <SelectValue placeholder="-- Select Pending Customer --" />
                          </SelectTrigger>

                          <SelectContent>
                            {psbList?.map((p: any, idx: number) => (
                              <SelectItem key={p.user_pppoe || idx} value={p.user_pppoe}>
                                {p.name} - {p.address}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => refetchPsb()}
                          disabled={isPsbLoading || isPsbRefetching}
                          className="h-10 w-10 shrink-0"
                        >
                          <RefreshCw className={cn("h-4 w-4 text-slate-500", (isPsbLoading || isPsbRefetching) && "animate-spin")} />
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-2">
                  <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border-2 border-blue-100 relative overflow-hidden">
                    <Label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-2 block uppercase">Device Serial Number (SN)</Label>
                    <div className="flex gap-2 relative z-10">
                      <div className="relative flex-1">
                        {detectedOnts.length > 0 ? (
                          <form.Field name="sn">
                            {(field) => (
                              <Select
                                onValueChange={field.handleChange}
                                value={field.state.value}
                              >
                                {/* 1. ClassName goes here on the Trigger */}
                                <SelectTrigger className="bg-white dark:bg-zinc-950 border-blue-200 text-xs h-10 font-mono">
                                  <SelectValue placeholder="Select SN" />
                                </SelectTrigger>

                                {/* 2. Items must be wrapped in Content */}
                                <SelectContent>
                                  {detectedOnts.map(ont => (
                                    <SelectItem key={ont.sn} value={ont.sn}>
                                      {ont.sn} (Port {ont.pon_port}/{ont.pon_slot})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </form.Field>
                        ) : (
                          <form.Field
                            name="sn"
                            // @ts-ignore
                            component={FormInput}
                            placeholder="e.g. ZTEG12345678"
                            className="bg-white dark:bg-zinc-950 border-slate-200 focus:border-blue-500 font-mono text-xs h-10"
                          />
                        )}
                      </div>
                      <Button type="button" variant="outline" onClick={handleScanOlt} disabled={isScanLoading || !selectedOlt} className="bg-white hover:bg-blue-50 border-slate-200 h-10 px-4 text-xs font-semibold">
                        {isScanLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin mr-2" /> : <Scan className="h-3.5 w-3.5 mr-2" />}
                        Scan OLT
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200 dark:border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <span className="bg-white dark:bg-zinc-900 px-3 flex items-center gap-1.5">
                    <Settings className="h-3 w-3" /> Configuration Details
                  </span>
                </div>
              </div>

              <div className="space-y-5">
                {/* 1. SUBSCRIBER NAME */}
                <form.Field name="customer.name">
                  {(field) => (
                    <FormInput
                      field={field} // ✅ Pass the field object here
                      label="Customer Name"
                      placeholder="Full Name"
                      className="bg-white dark:bg-zinc-950 h-10 text-sm font-semibold"
                    />
                  )}
                </form.Field>

                {/* 2. ADDRESS */}
                <form.Field name="customer.address">
                  {(field) => (
                    <FormTextarea
                      field={field}
                      label="Address"
                      className="bg-white dark:bg-zinc-950 min-h-[80px] text-xs font-mono"
                      rows={3}
                    />
                  )}
                </form.Field>

                {/* 3. PPPOE GRID */}
                <div className="grid grid-cols-2 gap-4 p-5 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200">
                  <form.Field name="customer.pppoe_user">
                    {(field) => (
                      <FormInput
                        field={field}
                        label="PPPoE Username"
                        className="bg-white dark:bg-zinc-950 h-9 text-xs font-mono"
                      />
                    )}
                  </form.Field>

                  <form.Field name="customer.pppoe_pass">
                    {(field) => (
                      <FormInput
                        field={field}
                        label="PPPoE Password"
                        className="bg-white dark:bg-zinc-950 h-9 text-xs font-mono"
                      />
                    )}
                  </form.Field>
                </div>

                <div className="flex items-center justify-between bg-white dark:bg-zinc-950 p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg border bg-slate-50 border-slate-200 text-slate-400">
                      <Unlock className="h-4 w-4" />
                    </div>
                    <div className="space-y-0.5">
                      <Label className="text-sm font-bold block">Ethernet Port Lock</Label>
                      <p className="text-[10px] text-slate-500">Secure unused ports on the ONU</p>
                    </div>
                  </div>

                  <form.Field name="eth_locks">
                    {(field) => (
                      <Switch
                        checked={field.state.value?.[0] || false}
                        onCheckedChange={(c) => field.handleChange([c, c, c, c])}
                      />
                    )}
                  </form.Field>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-zinc-800 mt-2">
            <Button type="button" variant="outline" onClick={onClose} className="h-10 px-5">Cancel</Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md"
            >
              {type === 'batch' ? `Provision ${batchQueue.length} Devices` : (isSubmitting ? 'Processing...' : 'Start Configuration')}
            </Button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
};