import AppLayout from '@/components/Layouts/AppLayout'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import axios from '@/lib/axios'
import { Card, Button } from 'flowbite-react'
import moment from 'moment'
import { useRouter } from 'next/router'

export default function WhatsAppLogShow() {
  const router = useRouter()
  const { id } = router.query
  const [loading, setLoading] = useState(false)
  const [log, setLog] = useState(null)
  const [messages, setMessages] = useState([])

  useEffect(() => {
    if (!id) return
    fetchLog()
  }, [id])

  const fetchLog = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`/api/whatsapp-webhook-logs/${id}`)
      if (res.data && res.data.data) {
        const payload = res.data.data.log || res.data.data.log
        const msgs = res.data.data.messages || res.data.data.messages || []
        setLog(payload)
        setMessages(msgs)
      } else if (res.data && res.data.log) {
        setLog(res.data.log)
        setMessages(res.data.messages || [])
      }
    } catch (err) {
      console.error('Error fetching log', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <Head>
        <title>WhatsApp Webhook Log #{id}</title>
      </Head>

      <div className="p-4">
        <Card>
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold">Webhook Log #{id}</h3>
            <div>
              <Button onClick={() => router.back()}>Back</Button>
            </div>
          </div>

          {log && (
            <div className="mt-4">
              <div className="mb-4">
                <strong>Method:</strong> {log.method} <br />
                <strong>Path:</strong> {log.path} <br />
                <strong>Signature:</strong> {log.signature} <br />
                <strong>Created At:</strong> {moment(log.created_at).format('YYYY-MM-DD HH:mm:ss')}
              </div>

              <div className="mb-4">
                <h4 className="font-semibold">Messages</h4>
                {messages.length === 0 && <p>No messages found in payload.</p>}
                {messages.map((m, idx) => (
                  <div key={idx} className="border rounded p-3 mb-3">
                    <div className="text-sm text-gray-600 mb-2">Type: {m.type || 'n/a'} | From: {m.from || 'n/a'} | Timestamp: {m.timestamp || 'n/a'}</div>
                    <div className="mb-2">Text: {m.text || (m.raw && m.raw.text && m.raw.text.body) || '—'}</div>
                    <div className="text-xs bg-gray-50 p-2 rounded overflow-auto">
                      <pre className="text-xs">{JSON.stringify(m.raw || m, null, 2)}</pre>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <h4 className="font-semibold">Full Payload</h4>
                <div className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto">
                  <pre className="text-xs">{JSON.stringify(log.payload || {}, null, 2)}</pre>
                </div>
              </div>
            </div>
          )}

          {loading && <div className="mt-4">Loading...</div>}
        </Card>
      </div>
    </AppLayout>
  )
}
