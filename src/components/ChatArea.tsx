// TODO: remove this component if not used
import React, { ChangeEvent } from 'react'

interface Message {
  user: string
  text: string
}

interface ChatAreaProps {
  messages: Message[]
  onSend: (msg: string) => void
  disabled?: boolean
}

const ChatArea: React.FC<ChatAreaProps> = ({ messages, onSend, disabled }) => {
  const [input, setInput] = React.useState('')
  const handleSend = () => {
    if (input.trim()) {
      onSend(input)
      setInput('')
    }
  }
  return (
    <div className="flex w-full flex-col gap-2 rounded-xl bg-zinc-800 p-2">
      <div className="mb-2 max-h-40 flex-1 overflow-y-auto">
        {messages.map((msg: Message, i: number) => (
          <div key={i} className="mb-1 text-sm text-zinc-200">
            <span className="font-semibold text-yellow-300">{msg.user}:</span>{' '}
            {msg.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded bg-zinc-700 px-2 py-1 text-white"
          value={input}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setInput(e.target.value)
          }
          disabled={disabled}
          placeholder="Nhập tin nhắn..."
        />
        <button
          className="rounded bg-yellow-400 px-3 py-1 font-semibold text-black"
          onClick={handleSend}
          disabled={disabled || !input.trim()}
        >
          Gửi
        </button>
      </div>
    </div>
  )
}

export default ChatArea
