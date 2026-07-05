import { COMPANY_CONFIG } from '../config/constants'

export default function WhatsAppButton() {
  const digits = COMPANY_CONFIG.whatsappNumber.replace(/\D/g, '')
  const href = `https://wa.me/977${digits}?text=${encodeURIComponent('Hi, I would like to know more about Metro Air Bus tickets.')}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      title="Chat with us on WhatsApp"
      className="no-print fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-transform hover:scale-105"
    >
      <svg viewBox="0 0 32 32" width="30" height="30" fill="white" aria-hidden="true">
        <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.386.7 4.607 1.907 6.47L4 29l7.72-1.865A11.94 11.94 0 0 0 16.001 27C22.628 27 28 21.627 28 15S22.628 3 16.001 3Zm0 21.818a9.78 9.78 0 0 1-4.986-1.363l-.358-.213-4.583 1.107 1.127-4.464-.234-.366A9.77 9.77 0 0 1 5.182 15c0-5.964 4.855-10.818 10.819-10.818S26.818 9.036 26.818 15 21.965 24.818 16.001 24.818Zm5.34-7.34c-.293-.147-1.734-.856-2.003-.953-.269-.098-.465-.147-.66.147-.196.293-.758.953-.929 1.148-.171.196-.343.22-.636.073-.293-.146-1.237-.456-2.357-1.454-.871-.777-1.46-1.737-1.63-2.03-.171-.293-.018-.452.128-.598.132-.131.293-.342.44-.513.146-.171.195-.293.293-.489.098-.196.049-.366-.024-.513-.073-.146-.66-1.59-.904-2.177-.238-.572-.48-.494-.66-.503l-.562-.01c-.196 0-.513.073-.782.366-.269.293-1.026 1.002-1.026 2.443s1.051 2.835 1.197 3.031c.146.196 2.069 3.159 5.016 4.43.701.303 1.248.483 1.675.618.704.224 1.344.192 1.85.117.564-.084 1.734-.709 1.978-1.393.244-.684.244-1.27.171-1.393-.073-.122-.269-.196-.562-.342Z" />
      </svg>
    </a>
  )
}
