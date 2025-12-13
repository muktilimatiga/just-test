
// Base API configuration
const API_BASE_URL = 'http://localhost:8002';

// Generic API response wrapper
export interface ApiResponse<T> {
    data?: T;
    error?: string;
    status: number;
    success: boolean;
}

// Enhanced error handling for API responses
export class ApiError extends Error {
    public status: number;
    public response?: any;

    constructor(message: string, status: number, response?: any) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.response = response;
    }
}

// Customer-related types
export interface Customer {
    id: string;
    name?: string;
    user_pppoe?: string;
    detail_url: string;
}

export interface DataPSB {
    name?: string;
    address?: string;
    user_pppoe?: string;
    pppoe_password?: string;
    paket?: string;
}

export interface CustomerwithInvoices extends Customer {
    invoices?: any[];
}

// ONU-related types
export interface OltBasePayload {
    olt_name: string;
}

export interface OnuTargetPayload extends OltBasePayload {
    interface: string;
}

export interface PortTargetPayload extends OltBasePayload {
    olt_port: string;
}

export interface RegistSnPayload extends OnuTargetPayload {
    sn: string;
}

export interface NoOnuPayload extends PortTargetPayload {
    onu_id: number;
}

export interface CustomerOnuDetail {
    type?: string;
    phase_state?: string;
    serial_number?: string;
    onu_distance?: string;
    online_duration?: string;
    modem_logs?: string;
    redaman: string;
    ip_remote: string;
    eth_port: any[];
}

// Ticket-related types
export interface TicketCreateOnlyPayload {
    query: string;
    description: string;
    priority?: string;
    jenis?: string;
}

export interface TicketCreateAndProcessPayload extends TicketCreateOnlyPayload {
    noc_username: string;
    noc_password: string;
}

export interface TicketProcessPayload {
    query: string;
    noc_username: string;
    noc_password: string;
}

export interface TicketClosePayload {
    query: string;
    close_reason: string;
    onu_sn: string;
    noc_username: string;
    noc_password: string;
}

export interface TicketForwardPayload {
    query: string;
    service_impact: string;
    root_cause: string;
    network_impact: string;
    recomended_action: string;
    onu_index: string;
    sn_modem: string;
    priority?: string;
    person_in_charge?: string;
    noc_username: string;
    noc_password: string;
}

export interface SearchPayload {
    query: string;
}

export interface TicketOperationResponse {
    success: boolean;
    message: string;
}

export interface SearchResponse {
    query: string;
    results: Record<string, any>[];
}

// CLI-related types
export interface TerminalResponse {
    port: number;
    pid: number;
    command: string;
    message: string;
}

export interface StopResponse {
    port: number;
    pid: number;
    message: string;
}

export interface ListResponse {
    count: number;
    running_ports: number[];
}

// Config-related types
export interface UnconfiguredOnt {
    sn: string;
    pon_port: string;
    pon_slot: string;
}

export interface CustomerInfo {
    name: string;
    address: string;
    pppoe_user: string;
    pppoe_pass: string;
}

export interface ConfigurationRequest {
    sn: string;
    customer: CustomerInfo;
    modem_type: string;
    package: string;
    eth_locks: boolean[];
}

export interface ConfigurationResponse {
    message: string;
    summary?: any;
    logs: string[];
}

export interface OptionsResponse {
    olt_options: string[];
    modem_options: string[];
    package_options: string[];
}


// Enhanced fetch function with better error handling & fallback
async function fetchJson<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}/api/v1${endpoint}`;
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            let errorMessage = `API Error: ${response.status} ${response.statusText}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.detail || errorMessage;
            } catch (e) {
                // If we can't parse the error as JSON, use the default message
            }
            throw new ApiError(errorMessage, response.status);
        }

        return await response.json();
    } catch (error) {

        if (error instanceof ApiError) {
            throw error;
        }

        console.error('Network or parsing error:', error);
        throw new ApiError('Network error or invalid response', 0);
    }
}

// API service object with all endpoints
export const ApiService = {
    customer: {
        getPSBData: (): Promise<DataPSB[]> => fetchJson<DataPSB[]>('/customer/psb'),
        getInvoices: (query: string): Promise<CustomerwithInvoices[]> =>
            fetchJson<CustomerwithInvoices[]>(`/customer/invoices?query=${encodeURIComponent(query)}`),
    },
    onu: {
        getCustomerDetails: (payload: OnuTargetPayload): Promise<CustomerOnuDetail> =>
            fetchJson<CustomerOnuDetail>('/onu/detail-search', { method: 'POST', body: JSON.stringify(payload) }),
        getOnuState: (payload: PortTargetPayload): Promise<any> =>
            fetchJson<any>('/onu/onu-state', { method: 'POST', body: JSON.stringify(payload) }),
        getOnuRx: (payload: PortTargetPayload): Promise<any> =>
            fetchJson<any>('/onu/onu-rx', { method: 'POST', body: JSON.stringify(payload) }),
        rebootOnu: (payload: OnuTargetPayload): Promise<any> =>
            fetchJson<any>('/onu/reboot-onu', { method: 'POST', body: JSON.stringify(payload) }),
        removeOnu: (payload: NoOnuPayload): Promise<any> =>
            fetchJson<any>('/onu/no-onu', { method: 'POST', body: JSON.stringify(payload) }),
        registerSn: (payload: RegistSnPayload): Promise<any> =>
            fetchJson<any>('/onu/regist-sn', { method: 'POST', body: JSON.stringify(payload) }),
    },
    ticket: {
        createOnly: (payload: TicketCreateOnlyPayload): Promise<TicketOperationResponse> =>
            fetchJson<TicketOperationResponse>('/ticket/create', { method: 'POST', body: JSON.stringify(payload) }),
        createAndProcess: (payload: TicketCreateAndProcessPayload): Promise<TicketOperationResponse> =>
            fetchJson<TicketOperationResponse>('/ticket/create-and-process', { method: 'POST', body: JSON.stringify(payload) }),
        processOnly: (payload: TicketProcessPayload): Promise<TicketOperationResponse> =>
            fetchJson<TicketOperationResponse>('/ticket/process', { method: 'POST', body: JSON.stringify(payload) }),
        close: (payload: TicketClosePayload): Promise<TicketOperationResponse> =>
            fetchJson<TicketOperationResponse>('/ticket/close', { method: 'POST', body: JSON.stringify(payload) }),
        forward: (payload: TicketForwardPayload): Promise<TicketOperationResponse> =>
            fetchJson<TicketOperationResponse>('/ticket/forward', { method: 'POST', body: JSON.stringify(payload) }),
        search: (payload: SearchPayload): Promise<SearchResponse> =>
            fetchJson<SearchResponse>('/ticket/search', { method: 'POST', body: JSON.stringify(payload) }),
    },
    cli: {
        startTerminal: (): Promise<TerminalResponse> => fetchJson<TerminalResponse>('/cli/start_terminal', { method: 'POST' }),
        stopTerminal: (port: number): Promise<StopResponse> => fetchJson<StopResponse>(`/cli/stop_terminal/${port}`, { method: 'POST' }),
        listRunningTerminals: (): Promise<ListResponse> => fetchJson<ListResponse>('/cli/running_terminals'),
    },
    config: {
        getOptions: (): Promise<OptionsResponse> => fetchJson<OptionsResponse>('/config/api/options'),
        detectUnconfiguredOnts: (oltName: string): Promise<UnconfiguredOnt[]> =>
            fetchJson<UnconfiguredOnt[]>(`/config/api/olts/${oltName}/detect-onts`),
        runConfiguration: (oltName: string, request: ConfigurationRequest): Promise<ConfigurationResponse> =>
            fetchJson<ConfigurationResponse>(`/config/api/olts/${oltName}/configure`, { method: 'POST', body: JSON.stringify(request) }),
    },
};

// Helper function to handle API errors consistently
export const handleApiError = (error: unknown): string => {
    if (error instanceof ApiError) return error.message;
    if (error instanceof Error) return error.message;
    return 'An unexpected error occurred';
};

// Higher-order function for async operations
export const withErrorHandling = async <T>(
    operation: () => Promise<T>
): Promise<{ data?: T; error?: string }> => {
    try {
        const data = await operation();
        return { data };
    } catch (error) {
        return { error: handleApiError(error) };
    }
};

// Exported Services
export const CustomerService = {
    getPSBData: () => withErrorHandling(() => ApiService.customer.getPSBData()),
    getInvoices: (query: string) => withErrorHandling(() => ApiService.customer.getInvoices(query)),
};

export const OnuService = {
    getCustomerDetails: (payload: OnuTargetPayload) => withErrorHandling(() => ApiService.onu.getCustomerDetails(payload)),
    getOnuState: (payload: PortTargetPayload) => withErrorHandling(() => ApiService.onu.getOnuState(payload)),
    getOnuRx: (payload: PortTargetPayload) => withErrorHandling(() => ApiService.onu.getOnuRx(payload)),
    rebootOnu: (payload: OnuTargetPayload) => withErrorHandling(() => ApiService.onu.rebootOnu(payload)),
    removeOnu: (payload: NoOnuPayload) => withErrorHandling(() => ApiService.onu.removeOnu(payload)),
    registerSn: (payload: RegistSnPayload) => withErrorHandling(() => ApiService.onu.registerSn(payload)),
};

export const TicketService = {
    createOnly: (payload: TicketCreateOnlyPayload) => withErrorHandling(() => ApiService.ticket.createOnly(payload)),
    createAndProcess: (payload: TicketCreateAndProcessPayload) => withErrorHandling(() => ApiService.ticket.createAndProcess(payload)),
    processOnly: (payload: TicketProcessPayload) => withErrorHandling(() => ApiService.ticket.processOnly(payload)),
    close: (payload: TicketClosePayload) => withErrorHandling(() => ApiService.ticket.close(payload)),
    forward: (payload: TicketForwardPayload) => withErrorHandling(() => ApiService.ticket.forward(payload)),
    search: (payload: SearchPayload) => withErrorHandling(() => ApiService.ticket.search(payload)),
};

export const CliService = {
    startTerminal: () => withErrorHandling(() => ApiService.cli.startTerminal()),
    stopTerminal: (port: number) => withErrorHandling(() => ApiService.cli.stopTerminal(port)),
    listRunningTerminals: () => withErrorHandling(() => ApiService.cli.listRunningTerminals()),
};

export const ConfigService = {
    getOptions: () => withErrorHandling(() => ApiService.config.getOptions()),
    detectUnconfiguredOnts: (oltName: string) => withErrorHandling(() => ApiService.config.detectUnconfiguredOnts(oltName)),
    runConfiguration: (oltName: string, request: ConfigurationRequest) => withErrorHandling(() => ApiService.config.runConfiguration(oltName, request)),
};
