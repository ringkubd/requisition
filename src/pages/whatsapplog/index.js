import AppLayout from '@/components/Layouts/AppLayout'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import axios from '@/lib/axios'
import { Card, TextInput, Button } from 'flowbite-react'
import DataTable from 'react-data-table-component'
import moment from 'moment'
import { AiOutlineSearch } from 'react-icons/ai'
import Link from 'next/link'

export default function WhatsAppLogIndex() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [totalRows, setTotalRows] = useState(0)
  const [perPage, setPerPage] = useState(15)
  const [page, setPage] = useState(1)

  const [q, setQ] = useState('')
  const [phone, setPhone] = useState('')
  const [method, setMethod] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const fetchLogs = async (p = page, size = perPage) => {
    setLoading(true)
    try {
      const res = await axios.get('/api/whatsapp-webhook-logs', {
        params: {
          page: p,
          per_page: size,
          q: q || undefined,
          phone: phone || undefined,
          method: method || undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined
        }
      })

      let items = []
      let total = 0
      if (res.data && res.data.data) {
        // paginated response: res.data.data is LengthAwarePaginator
        items = (res.data.data && res.data.data.data) ? res.data.data.data : res.data.data
        total = res.data.data ? (res.data.data.total || res.data.data.meta?.total || items.length) : (res.data.total || items.length)
      } else if (res.data && Array.isArray(res.data)) {
        items = res.data
        total = items.length
      } else if (res.data && res.data.whatsapp_webhook_logs) {
        items = res.data.whatsapp_webhook_logs.data
        total = res.data.whatsapp_webhook_logs.total
      }

      setData(items)
      setTotalRows(total)
    } catch (err) {
      console.error('Error fetching whatsapp logs', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [page, perPage])

  const columns = [
    { name: 'ID', selector: row => row.id, sortable: true, width: '80px' },
    { name: 'From', selector: row => row.from || '-', sortable: true },
    { name: 'Type', selector: row => row.message_type || '-', sortable: true },
    { name: 'Recipient', selector: row => row.to || '-', sortable: true },
    { name: 'Preview', selector: row => row.message_preview || '-', wrap: true, grow: 3 },
    { name: 'Created', selector: row => moment(row.created_at).format('YYYY-MM-DD HH:mm:ss'), sortable: true },
    {
      name: 'Actions', cell: row => (
        <Link href={`/whatsapplog/${row.id}`}>
          <a className="text-blue-600">View</a>
        </Link>
      ), ignoreRowClick: true, allowOverflow: true, button: true
    }
  ]

  const handleSearch = () => {
    setPage(1)
    fetchLogs(1, perPage)
  }

  return (
    <AppLayout>
      <Head>
        <title>WhatsApp Webhook Logs</title>
      </Head>

      <div className="p-4">
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <TextInput placeholder="Search payload (q)" value={q} onChange={e => setQ(e.target.value)} />
            <TextInput placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
            <TextInput placeholder="Method" value={method} onChange={e => setMethod(e.target.value)} />
            <input type="date" className="border rounded px-2 py-1" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            <input type="date" className="border rounded px-2 py-1" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            <Button onClick={handleSearch}>
              <AiOutlineSearch className="mr-2" /> Search
            </Button>
          </div>

          <DataTable
            columns={columns}
            data={data}
            progressPending={loading}
            pagination
            paginationServer
            paginationTotalRows={totalRows}
            paginationDefaultPage={page}
            onChangePage={p => { setPage(p); fetchLogs(p, perPage); }}
            onChangeRowsPerPage={r => { setPerPage(r); setPage(1); fetchLogs(1, r); }}
            highlightOnHover
            persistTableHead
          />
        </Card>
      </div>
    </AppLayout>
  )
}
