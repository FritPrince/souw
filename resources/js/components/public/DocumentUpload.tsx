import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

interface DocumentUploadProps {
    onUpload: (files: File[]) => void;
    accept?: string;
    multiple?: boolean;
    maxSize?: number; // in MB
    label?: string;
    className?: string;
    disabled?: boolean;
}

export default function DocumentUpload({
    onUpload,
    accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png',
    multiple = true,
    maxSize = 10,
    label = 'Télécharger des documents',
    className = '',
    disabled = false,
}: DocumentUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [error, setError] = useState<string>('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) {
            return;
        }

        const files = Array.from(e.target.files || []);
        setError('');

        // Validate file size
        const oversizedFiles = files.filter(
            (file) => file.size > maxSize * 1024 * 1024,
        );
        if (oversizedFiles.length > 0) {
            setError(
                `Certains fichiers dépassent la taille maximale de ${maxSize}MB`,
            );
            return;
        }

        setSelectedFiles((prev) =>
            multiple ? [...prev, ...files] : files,
        );
        onUpload(files);
    };

    const removeFile = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div className={className}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    disabled={disabled}
                    onChange={handleFileChange}
                    className="hidden"
                />

                <div className="space-y-4">
                    <div>
                        <i className="las la-cloud-upload-alt text-4xl text-gray-400 mb-2"></i>
                        <p className="text-sm text-gray-600">
                            Cliquez pour télécharger ou glissez-déposez
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Formats acceptés: {accept.replace(/\./g, '')} (max{' '}
                            {maxSize}MB)
                        </p>
                    </div>

                    <Button
                        type="button"
                        onClick={() => !disabled && fileInputRef.current?.click()}
                        variant="outline"
                        disabled={disabled}
                    >
                        <i className="las la-file-upload mr-2"></i>
                        Sélectionner des fichiers
                    </Button>
                </div>
            </div>

            {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
            )}

            {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                    {selectedFiles.map((file, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                            <div className="flex items-center gap-3">
                                <i className="las la-file text-primary text-xl"></i>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {(file.size / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="text-red-600 hover:text-red-700"
                            >
                                <i className="las la-times"></i>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}


