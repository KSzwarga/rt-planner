import { useEffect, useId, useRef } from 'react'
import './ConfirmDialog.css'

interface ConfirmDialogProps {
  readonly isOpen: boolean
  readonly message: string
  readonly confirmLabel: string
  readonly onConfirm: () => void
  readonly onCancel: () => void
}

/**
 * A modal yes / no question. Built on the native `<dialog>` with `showModal()`, so the browser
 * traps focus inside it, closes it on Escape (as Cancel) and returns focus to where it was.
 * Cancel has focus first, so pressing Enter by accident changes nothing.
 */
export function ConfirmDialog({ isOpen, message, confirmLabel, onConfirm, onCancel }: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const messageId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  return (
    <dialog
      ref={dialogRef}
      className="confirm-dialog"
      aria-describedby={messageId}
      onCancel={(event) => {
        // Escape: let React state close the dialog, so it stays the one source of truth.
        event.preventDefault()
        onCancel()
      }}
    >
      <p className="confirm-dialog__message" id={messageId}>
        {message}
      </p>
      <div className="confirm-dialog__actions">
        <button type="button" className="confirm-dialog__button" autoFocus onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="confirm-dialog__button confirm-dialog__button--confirm" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </dialog>
  )
}
