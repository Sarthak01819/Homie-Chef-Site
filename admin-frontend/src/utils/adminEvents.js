export const emitAdminUpdate = (type, payload) => {
    window.dispatchEvent(
        new CustomEvent("ADMIN_UPDATE", {
            detail: { type, payload },
        })
    );
};
