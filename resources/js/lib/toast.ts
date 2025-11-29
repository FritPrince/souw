import { toast } from 'react-toastify';

/**
 * Utility functions for displaying toast notifications
 * Use these throughout the application for consistent notifications
 */
export const showToast = {
    success: (message: string) => {
        toast.success(message, {
            position: 'top-right',
            autoClose: 5000,
        });
    },
    error: (message: string) => {
        toast.error(message, {
            position: 'top-right',
            autoClose: 5000,
        });
    },
    info: (message: string) => {
        toast.info(message, {
            position: 'top-right',
            autoClose: 5000,
        });
    },
    warning: (message: string) => {
        toast.warning(message, {
            position: 'top-right',
            autoClose: 5000,
        });
    },
};








