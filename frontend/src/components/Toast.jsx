import { useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import '../styles/Toast.css'

export default function Toast({
  message,
  type = 'success',
  onClose,
  duration = 3000,
  showButtons = false,
  onYes,
  onNo,
}) {
  useEffect(() => {
    if (!showButtons) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [onClose, duration, showButtons])

  const getIcon = () => {
    if (type === 'success') return <CheckCircle size={14} />
    if (type === 'error') return <XCircle size={14} />
    if (type === 'warning') return <AlertCircle size={14} />
    return null
  }

  const handleYes = () => {
    if (onYes) onYes()
  }

  const handleNo = () => {
    if (onNo) onNo()
  }

  return (
    <div className={`toast toast--${type}`}>
      <div className="toast__content">
        {getIcon()}
        <p className="toast__message">{message}</p>
      </div>
      {showButtons && (
        <div className="toast__buttons">
          <button className="toast__btn toast__btn--yes" onClick={handleYes}>
            Yes
          </button>
          <button className="toast__btn toast__btn--no" onClick={handleNo}>
            No
          </button>
        </div>
      )}
    </div>
  )
}
