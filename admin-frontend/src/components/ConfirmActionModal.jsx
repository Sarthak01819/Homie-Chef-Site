const ConfirmActionModal = ({ open, title, message, danger, onConfirm, onClose }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 grid place-items-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm space-y-4">
                <h2 className="text-lg font-bold">{title}</h2>
                <p className="text-sm text-gray-600">{message}</p>

                {danger && (
                    <p className="text-xs text-red-600 font-semibold">
                        This action cannot be undone.
                    </p>
                )}

                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 border rounded-lg">
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-lg text-white ${danger ? "bg-red-600" : "bg-black"
                            }`}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmActionModal;
