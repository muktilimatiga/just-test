import { toast } from "sonner";
import { useActivityLogger } from "./supabase/useActivityLogger";

type ActionSuccessOptions<T> = {
    title: string;
    action: string;
    target: string;
    getDetails?: (data: T) => unknown;
    onDone?: () => void;
};

export function useActionSuccess<T>() {
    const { logActivity } = useActivityLogger();

    return (value: T, options: ActionSuccessOptions<T>) => {
        const {
            title,
            action,
            target,
            getDetails,
            onDone,
        } = options;

        toast.success(`${title} Successful`);

        logActivity({
            action,
            target,
            status: "SUCCESS",
            details: JSON.stringify(getDetails ? getDetails(value) : value),
        });

        onDone?.();
    };
}

export function useActionError() {
    const { logActivity } = useActivityLogger();

    return (err: Error, action: string, target: string) => {
        toast.error(err.message || "Action Failed");

        logActivity({
            action,
            target,
            status: "ERROR",
            details: err.message,
        });
    };
}

