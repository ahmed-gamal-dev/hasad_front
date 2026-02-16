import Swal from 'sweetalert2';

type PromptInputAlertOptions = {
  title: string;
  label?: string;
  placeholder?: string;
  initialValue?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  validationMessage?: string;
};

export const promptInputAlert = async ({
  title,
  label = '',
  placeholder = '',
  initialValue = '',
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  validationMessage = 'This field is required',
}: PromptInputAlertOptions): Promise<string | null> => {
  const result = await Swal.fire({
    title,
    input: 'textarea',
    inputLabel: label,
    inputPlaceholder: placeholder,
    inputValue: initialValue,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    reverseButtons: true,
    focusCancel: true,
    inputValidator: (value) => {
      if (!value || !value.trim()) {
        return validationMessage;
      }

      return undefined;
    },
  });

  if (!result.isConfirmed || typeof result.value !== 'string') {
    return null;
  }

  const trimmedValue = result.value.trim();
  return trimmedValue || null;
};

export const promptRejectReasonAlert = () =>
  promptInputAlert({
    title: 'Reject report',
    label: 'Reason',
    placeholder: 'Needs correction',
    initialValue: '',
    confirmButtonText: 'Reject',
    cancelButtonText: 'Cancel',
    validationMessage: 'Rejection reason is required',
  });
