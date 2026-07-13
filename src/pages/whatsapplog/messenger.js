import AppLayout from '@/components/Layouts/AppLayout'
import Head from 'next/head'
import { useEffect, useState, useRef, useCallback } from 'react'
import axios from '@/lib/axios'
import moment from 'moment'

const WHATSAPP_GREEN = '#075E54'
const WHATSAPP_TEAL = '#128C7E'
const WHATSAPP_LIGHT = '#DCF8C6'

export default function WhatsAppMessenger() {
  const [contacts, setContacts] = useState([])
  const [activePhone, setActivePhone] = useState(null)
  const [messages, setMessages] = useState([])
  const [loadingContacts, setLoadingContacts] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const [contactSearch, setContactSearch] = useState('')
  const chatEndRef = useRef(null)

  const fetchContacts = useCallback(async () => {
    setLoadingContacts(true)
    try {
      const res = await axios.get('/api/whatsapp-conversations', {
        params: { search: contactSearch || undefined, limit: 100 }
      })
      const list = res.data?.data || []
      setContacts(list)
      if (list.length > 0 && !activePhone) {
        setActivePhone(list[0].phone)
      }
    } catch (e) {
      console.error('Failed to load contacts', e)
    } finally {
      setLoadingContacts(false)
    }
  }, [contactSearch])

  const fetchMessages = useCallback(async (phone) => {
    if (!phone) return
    setLoadingMessages(true)
    try {
      const res = await axios.get('/api/whatsapp-messages', {
        params: { phone, per_page: 200 }
      })
      setMessages(res.data?.data?.messages || [])
    } catch (e) {
      console.error('Failed to load messages', e)
    } finally {
      setLoadingMessages(false)
    }
  }, [])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  useEffect(() => {
    if (activePhone) {
      fetchMessages(activePhone)
    }
  }, [activePhone, fetchMessages])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!messageText.trim() || !activePhone || sending) return
    setSending(true)
    try {
      await axios.post('/api/whatsapp-send', {
        phone: activePhone,
        message: messageText.trim(),
      })
      setMessageText('')
      await fetchMessages(activePhone)
      await fetchContacts()
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const activeContact = contacts.find(c => c.phone === activePhone)

  return (
    <AppLayout>
      <Head>
        <title>WhatsApp Messenger</title>
      </Head>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        <div className="flex-1 flex overflow-hidden rounded-lg shadow-lg border border-gray-200">
          {/* Left Sidebar - Contacts */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            <div
              className="px-4 py-3 text-white font-semibold text-lg"
              style={{ backgroundColor: WHATSAPP_GREEN }}
            >
              <div className="flex items-center justify-between">
                <span>Chats</span>
                <button
                  onClick={() => { setContactSearch(''); fetchContacts() }}
                  className="text-white hover:opacity-80 text-sm"
                  title="Refresh"
                >
                  ↻
                </button>
              </div>
              <input
                className="mt-2 w-full px-3 py-1.5 rounded text-sm text-gray-800 bg-white/90 focus:outline-none"
                placeholder="Search contacts..."
                value={contactSearch}
                onChange={e => setContactSearch(e.target.value)}
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {loadingContacts && contacts.length === 0 && (
                <div className="p-4 text-center text-gray-400 text-sm">Loading...</div>
              )}
              {!loadingContacts && contacts.length === 0 && (
                <div className="p-4 text-center text-gray-400 text-sm">No conversations yet</div>
              )}
              {contacts.map((contact) => (
                <div
                  key={contact.phone}
                  onClick={() => setActivePhone(contact.phone)}
                  className={`flex items-center px-4 py-3 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition ${
                    activePhone === contact.phone ? 'bg-gray-100' : ''
                  }`}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                    style={{ backgroundColor: WHATSAPP_TEAL }}
                  >
                    {(contact.name || '?')[0].toUpperCase()}
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <span className="font-medium text-sm truncate">{contact.name || contact.phone}</span>
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                        {contact.last_message_at ? moment(contact.last_message_at).format('DD/MM/YY') : ''}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 truncate mt-0.5">
                      {contact.last_message || 'No messages'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Chat */}
          <div className="flex-1 flex flex-col bg-gray-100">
            {activePhone ? (
              <>
                {/* Chat Header */}
                <div
                  className="px-4 py-2.5 text-white flex items-center"
                  style={{ backgroundColor: WHATSAPP_GREEN }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-sm"
                    style={{ backgroundColor: WHATSAPP_TEAL }}
                  >
                    {(activeContact?.name || '?')[0].toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <div className="font-semibold text-sm">{activeContact?.name || activePhone}</div>
                    <div className="text-xs opacity-80">{activePhone}</div>
                  </div>
                </div>

                {/* Messages Area */}
                <div
                  className="flex-1 overflow-y-auto p-4 space-y-1"
                  style={{ backgroundColor: '#e5ddd5' }}
                >
                  {loadingMessages && <div className="text-center text-gray-400 text-sm py-4">Loading messages...</div>}
                  {!loadingMessages && messages.length === 0 && (
                    <div className="text-center text-gray-400 text-sm py-4">No messages yet. Send your first message below.</div>
                  )}
                  {messages.map((msg, idx) => {
                    const isOutbound = msg.direction === 'outbound'
                    const isFirstBySender = idx === 0 || messages[idx - 1]?.direction !== msg.direction
                    return (
                      <div key={msg.id || idx} className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-xs md:max-w-md lg:max-w-lg px-3 py-2 rounded-lg text-sm shadow-sm ${
                            isOutbound
                              ? 'rounded-br-sm'
                              : 'rounded-bl-sm'
                          }`}
                          style={{
                            backgroundColor: isOutbound ? WHATSAPP_LIGHT : '#ffffff',
                            borderBottomRightRadius: isOutbound && !isFirstBySender ? '4px' : undefined,
                            borderBottomLeftRadius: !isOutbound && !isFirstBySender ? '4px' : undefined,
                          }}
                        >
                          <div className="text-gray-800 whitespace-pre-wrap break-words">{msg.text || '(no text)'}</div>
                          <div className={`text-right mt-1 ${isOutbound ? 'text-gray-500' : 'text-gray-400'}`}>
                            <span className="text-[10px]">
                              {msg.timestamp ? moment(msg.timestamp).format('h:mm A') : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={chatEndRef} />
                </div>

                {/* Message Input */}
                <div className="px-4 py-3 bg-gray-200 flex items-center gap-3">
                  <textarea
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    rows={1}
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!messageText.trim() || sending}
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed transition hover:opacity-90"
                    style={{ backgroundColor: WHATSAPP_TEAL }}
                  >
                    {sending ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                      </svg>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50">
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-lg">WhatsApp Messenger</p>
                  <p className="text-sm mt-1">Select a conversation from the left</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
