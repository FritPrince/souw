import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { toast } from 'react-toastify';
import { type SharedData } from '@/types';

export function useToast() {
    const page = usePage<SharedData>();

    useEffect(() => {
        const flash = page.props.flash;

        if (flash?.success) {
            toast.success(flash.success, {
                position: 'top-right',
                autoClose: 5000,
            });
        }

        if (flash?.error) {
            toast.error(flash.error, {
                position: 'top-right',
                autoClose: 5000,
            });
        }
    }, [page.props.flash]);

    return {
        success: (message: string) => toast.success(message),
        error: (message: string) => toast.error(message),
        info: (message: string) => toast.info(message),
        warning: (message: string) => toast.warning(message),
    };
}








