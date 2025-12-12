
import { useState } from 'react';
import { ModalOverlay } from '../../components/ModalOverlay'
import type { UnconfiguredOnt, OptionsResponse, DataPSB, ConfigurationRequest, ConfigService, CustomerService } from '@/services/api'
import { useFiberStore } from '@/store/useFiberStore'

interface BatchItem {
  sn: string;
  port: string;
  loading: boolean;
  customer: any | null;
}


export const ConfigModal = ({ isOpen, onClose, type }: { isOpen: boolean, onClose: () => void, type: 'basic' | 'bridge' | 'batch' }) => {
  const [mode, setMode] = useState<'manual' | 'auto'>('manual');
  const [isOptionsLoading, setIsOptionsLoading] = useState(false);
  const [isScanLoading, setIsScanLoading] = useState(false);
  const [detectOnts, setDetectOnts] = useState<UnconfiguredOnt[]>([]);

  // Auto Mode Fetch PSB
  const [psbList, setPsbList] = useState<DataPSB[]>([]);
  const [isPsbLoading, setIsPsbLoading] = useState(false);

  // Manual Mode Fetch Customer
  const {
    searchTerm,
    setSearchTerm,
    searchResults,
    setSearchResults,
    isSearchLoading,
    setIsSearchLoading,
    search,
  } = useFiberStore();

  // Batch Mode
  const [batchList, setBatchList] = useState<BatchItem[]>([]);
  const [isBatchLoading, setIsBatchLoading] = useState(false);

  // Detect SN
  const [oltOptions, setOltOptions] = useState<OptionsResponse | null>(null);
  const [modemOptions, setModemOptions] = useState<OptionsResponse | null>(null);
  const [packageOptions, setPackageOptions] = useState<OptionsResponse | null>(null);

  const [formData, setFormData] = useState<ConfigurationRequest>({
    sn: '',
    customer: {
      name: '',
      address: '',
      pppoe_user: '',
      pppoe_pass: '',
    },
    modem_type: '',
    package: '',
    eth_locks: [],
  });

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Config Modal ({type})</h2>
        <p className="text-muted-foreground">This is a placeholder for the Config Modal.</p>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Close
          </button>
        </div>
      </div>
    </ModalOverlay>
  )
}
