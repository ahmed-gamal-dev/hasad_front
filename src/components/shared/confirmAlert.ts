import Swal from 'sweetalert2';

type ConfirmDeleteOptions = {
  entityName?: string;
  title?: string;
  text?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
};

export const confirmDeleteAlert = async ({
  entityName = 'this item',
  title = 'Delete confirmation',
  text,
  confirmButtonText = 'Yes, delete it',
  cancelButtonText = 'Cancel',
}: ConfirmDeleteOptions = {}) => {
  const result = await Swal.fire({
    title,
    text: text ?? `Are you sure you want to delete ${entityName}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    focusCancel: true,
  });

  return result.isConfirmed;
};
