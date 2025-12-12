
import { ModalOverlay } from '../../components/ModalOverlay'

interface ConfigModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'basic' | 'bridge' | 'batch'
}

export function ConfigModal({ isOpen, onClose, type }: ConfigModalProps) {
  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Config Modal ({type})</h2>
        <p className="text-muted-foreground">This is a placeholder for the Config Modal.</p>
        <div className="mt-6 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Close
          </button>
        </div>
      </div>
    </ModalOverlay>
  )
}
