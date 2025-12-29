import { User } from 'lucide-react'
import '../styles/WhatsAppBubble.css'

export default function WhatsAppBubble() {
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Selamat Pagi'
    if (hour < 18) return 'Selamat Siang'
    return 'Selamat Malam'
  }

  const handleWhatsAppClick = () => {
    const phoneNumber = '6287715658420'
    const greeting = getGreeting()
    const message = `${greeting}, saya ingin melakukan reservasi. Apakah bisa ?`
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <button
      className="whatsapp-bubble"
      onClick={handleWhatsAppClick}
      aria-label="Chat with us on WhatsApp"
      title="Chat dengan kami"
    >
      <User size={24} strokeWidth={1.5} />
      <span className="whatsapp-label">Chat</span>
    </button>
  )
}
