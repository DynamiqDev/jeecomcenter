import { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

/* ---------- constants ---------- */
const SUBJ = ['Physics', 'Chemistry', 'Maths']
const HEX = { Physics: '#60a5fa', Chemistry: '#4ade80', Maths: '#fb923c' }
const TAG = {
  Physics: 'bg-blue-500/20 text-blue-300',
  Chemistry: 'bg-green-500/20 text-green-300',
  Maths: 'bg-orange-500/20 text-orange-300',
  Revision: 'bg-purple-500/20 text-purple-300',
  'Mock Test': 'bg-pink-500/20 text-pink-300',
  'Not started': 'bg-zinc-500/20 text-zinc-300',
  'In progress': 'bg-yellow-500/20 text-yellow-300',
  Learning: 'bg-yellow-500/20 text-yellow-300',
  Practiced: 'bg-blue-500/20 text-blue-300',
  Done: 'bg-green-500/20 text-green-300',
  Revised: 'bg-green-500/20 text-green-300',
  High: 'bg-red-500/20 text-red-300',
  Med: 'bg-yellow-500/20 text-yellow-300',
  Low: 'bg-zinc-500/20 text-zinc-300',
  PYQ: 'bg-indigo-500/20 text-indigo-300',
}
const SOURCES = ['PYQ', 'Module', 'Coaching DPP', 'Mock Test', 'Other']
const BLOCKS = [
  { id: 'wake', time: '6:00 AM', label: 'Wake up' },
  { id: 's1', time: '6:00 AM – 10:30 AM', label: 'Session 1', study: true },
  { id: 'bl', time: '10:30 AM – 11:30 AM', label: 'Bath + Lunch' },
  { id: 's2', time: '11:30 AM – 1:30 PM', label: 'Session 2', study: true },
  { id: 'b1', time: '1:30 PM – 2:00 PM', label: 'Break' },
  { id: 's3', time: '2:00 PM – 5:00 PM', label: 'Session 3', study: true },
  { id: 'b2', time: '5:00 PM – 6:30 PM', label: 'Break' },
  { id: 's4', time: '6:30 PM – 8:30 PM', label: 'Session 4', study: true },
  { id: 'din', time: '8:30 PM – 9:00 PM', label: 'Dinner' },
  { id: 's5', time: '9:00 PM – 12:00 AM', label: 'Session 5', study: true },
]
// Keep these two paragraphs exactly as written in the planner
const COMMIT = 'I commit to completing all the designated tasks within their respective deadlines with dedication & hyperfocus By signing this contract I hold myself accountable'
const END = 'I conclude my day by signing this End of contract I affirm that I was hyperfocused & dedicated throughout the day & will till End of life'
const STATUS_CYCLE = ['Not started', 'In progress', 'Done']
const SYL_CYCLE = ['Not started', 'Learning', 'Practiced', 'Revised']

/* ---------- helpers ---------- */
const ymd = (d = new Date()) => d.toLocaleDateString('en-CA')
const daysAgo = (n) => ymd(new Date(Date.now() - n * 864e5))
const uid = () => Math.random().toString(36).slice(2, 9)
const pct = (a, t) => (t ? Math.round((a / t) * 100) : null)
const next = (list, v) => list[(list.indexOf(v) + 1) % list.length]

function useLS(key, init) {
  const [v, setV] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init } catch { return init }
  })
  useEffect(() => { localStorage.setItem(key, JSON.stringify(v)) }, [key, v])
  return [v, setV]
}

/* ---------- small UI ---------- */
const inp = 'bg-[#191919] border border-[#2f2f2f] rounded px-2 py-1 text-xs outline-none focus:border-zinc-500 w-full'
const btn = 'bg-zinc-700/60 hover:bg-zinc-600/70 rounded px-2.5 py-1 text-xs'
const Tag = ({ t, onClick }) => (
  <span onClick={onClick} className={`inline-block rounded px-1.5 py-0.5 text-[11px] whitespace-nowrap ${TAG[t] || TAG.Low} ${onClick ? 'cursor-pointer' : ''}`}>{t}</span>
)
const AccTag = ({ v }) => v == null ? <span className="text-zinc-500">–</span> : (
  <span className={`rounded px-1.5 py-0.5 text-[11px] ${v < 60 ? 'bg-red-500/20 text-red-300' : v <= 80 ? 'bg-yellow-500/20 text-yellow-300' : 'bg-green-500/20 text-green-300'}`}>{v}%</span>
)
const Panel = ({ title, right, children }) => (
  <section className="rounded-lg border border-[#2f2f2f] bg-[#202020] p-4 mb-4">
    <div className="flex items-center justify-between mb-3"><h2 className="text-sm font-semibold">{title}</h2>{right}</div>
    {children}
  </section>
)
const Check = ({ on, set, label }) => (
  <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
    <input type="checkbox" checked={!!on} onChange={(e) => set(e.target.checked)} className="accent-green-500 h-3.5 w-3.5" />{label}
  </label>
)

/* ---------- app ---------- */
export default function App() {
  const today = ymd()
  const [days, setDays] = useLS('jee_days', {})
  const [qs, setQs] = useLS('jee_questions', [])
  const [tasks, setTasks] = useLS('jee_tasks', [])
  const [syl, setSyl] = useLS('jee_syllabus', [])
  const [exam, setExam] = useLS('jee_exam', '')

  const day = days[today] || {}
  const setDay = (patch) => setDays({ ...days, [today]: { ...day, ...patch } })
  const left = exam ? Math.ceil((new Date(exam) - new Date(today)) / 864e5) : null

  // contract streak: consecutive days with both signed (today may still be pending)
  let streak = 0
  for (let i = days[today]?.am && days[today]?.pm ? 0 : 1; ; i++) {
    const d = days[daysAgo(i)]
    if (d?.am && d?.pm) streak++; else break
  }
  const last7 = [6, 5, 4, 3, 2, 1, 0].map((i) => ({ d: daysAgo(i), ok: days[daysAgo(i)]?.am && days[daysAgo(i)]?.pm }))

  return (
    <div className="min-h-screen px-4 py-5 max-w-[1500px] mx-auto">
      <header className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-semibold">JEE Command Center</h1>
          <p className="text-xs text-zinc-400 mt-1">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-zinc-400">Exam date</span>
          <input type="date" value={exam} onChange={(e) => setExam(e.target.value)} className={inp + ' !w-36'} />
          {left !== null && <span className="rounded bg-zinc-700/50 px-2 py-1">{left >= 0 ? `${left} days left` : 'Exam passed'}</span>}
          <span className="rounded bg-zinc-700/50 px-2 py-1">Streak {streak}</span>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3 items-start">
        <div>
          <Schedule day={day} setDay={setDay} />
          <Tasks tasks={tasks} setTasks={setTasks} today={today} />
        </div>
        <div>
          <Tracker qs={qs} setQs={setQs} today={today} />
        </div>
        <div>
          <Contract day={day} setDay={setDay} last7={last7} />
          <LogNote day={day} setDay={setDay} />
          <Syllabus syl={syl} setSyl={setSyl} today={today} />
        </div>
      </div>
    </div>
  )
}

/* ---------- schedule ---------- */
function Schedule({ day, setDay }) {
  const st = day.st || {}, sub = day.sub || {}
  const done = BLOCKS.filter((b) => b.study && st[b.id] === 'Done').length
  return (
    <Panel title="Today's schedule" right={<span className="text-xs text-zinc-400">{done}/5 sessions done</span>}>
      <table className="w-full text-xs">
        <tbody>
          {BLOCKS.map((b) => (
            <tr key={b.id} className="border-t border-[#2f2f2f]">
              <td className="py-1.5 pr-2 text-zinc-400 whitespace-nowrap">{b.time}</td>
              <td className="py-1.5 pr-2">{b.label}</td>
              <td className="py-1.5 pr-2">
                {b.study && (
                  <select value={sub[b.id] || ''} onChange={(e) => setDay({ sub: { ...sub, [b.id]: e.target.value } })} className={inp + ' !w-24'}>
                    <option value="">Subject</option>
                    {[...SUBJ, 'Revision', 'Mock Test'].map((s) => <option key={s}>{s}</option>)}
                  </select>
                )}
              </td>
              <td className="py-1.5 text-right">
                {b.study && <Tag t={st[b.id] || 'Not started'} onClick={() => setDay({ st: { ...st, [b.id]: next(STATUS_CYCLE, st[b.id] || 'Not started') } })} />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[11px] text-zinc-500 mt-2">Click a status tag to cycle it.</p>
    </Panel>
  )
}

/* ---------- tasks ---------- */
function Tasks({ tasks, setTasks, today }) {
  const [f, setF] = useState({ name: '', subject: 'Physics', deadline: today, priority: 'Med' })
  const add = () => { if (!f.name.trim()) return; setTasks([...tasks, { ...f, id: uid(), done: false }]); setF({ ...f, name: '' }) }
  const shown = [...tasks].sort((a, b) => a.done - b.done || a.deadline.localeCompare(b.deadline))
  return (
    <Panel title="Tasks">
      <div className="grid grid-cols-[1fr_auto] gap-2 mb-3">
        <input className={inp} placeholder="New task" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && add()} />
        <button className={btn} onClick={add}>Add</button>
        <div className="col-span-2 flex gap-2">
          <select className={inp} value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })}>{SUBJ.map((s) => <option key={s}>{s}</option>)}</select>
          <select className={inp} value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value })}>{['High', 'Med', 'Low'].map((s) => <option key={s}>{s}</option>)}</select>
          <input type="date" className={inp} value={f.deadline} onChange={(e) => setF({ ...f, deadline: e.target.value })} />
        </div>
      </div>
      {shown.length === 0 && <p className="text-xs text-zinc-500">No tasks yet. Add one above.</p>}
      {shown.map((t) => (
        <div key={t.id} className="flex items-center gap-2 border-t border-[#2f2f2f] py-1.5 text-xs">
          <input type="checkbox" checked={t.done} className="accent-green-500" onChange={() => setTasks(tasks.map((x) => x.id === t.id ? { ...x, done: !x.done } : x))} />
          <span className={`flex-1 ${t.done ? 'line-through text-zinc-500' : ''}`}>{t.name}</span>
          <Tag t={t.subject} /><Tag t={t.priority} />
          <span className={!t.done && t.deadline < today ? 'text-red-400' : 'text-zinc-400'}>{t.deadline.slice(5)}</span>
          <button className="text-zinc-500 hover:text-red-400" onClick={() => setTasks(tasks.filter((x) => x.id !== t.id))}>✕</button>
        </div>
      ))}
    </Panel>
  )
}

/* ---------- question tracker ---------- */
function Tracker({ qs, setQs, today }) {
  const [f, setF] = useState({ date: today, subject: 'Physics', source: 'PYQ', chapter: '', acc: '', inacc: '' })
  const add = () => {
    const acc = +f.acc || 0, inacc = +f.inacc || 0
    if (acc + inacc === 0) return
    setQs([{ ...f, acc, inacc, id: uid() }, ...qs]); setF({ ...f, chapter: '', acc: '', inacc: '' })
  }
  const week = daysAgo(6)
  const stat = (subj, from) => {
    const r = qs.filter((q) => q.subject === subj && q.date >= from)
    const a = r.reduce((s, q) => s + q.acc, 0), t = r.reduce((s, q) => s + q.acc + q.inacc, 0)
    return { t, p: pct(a, t) }
  }
  // chart data: last 14 days
  const chart = Array.from({ length: 14 }, (_, i) => daysAgo(13 - i)).map((d) => {
    const row = { d: d.slice(5) }
    SUBJ.forEach((s) => {
      const r = qs.filter((q) => q.subject === s && q.date === d)
      const t = r.reduce((x, q) => x + q.acc + q.inacc, 0)
      row[s] = t; row[s + 'Acc'] = pct(r.reduce((x, q) => x + q.acc, 0), t)
    })
    return row
  })
  // weakest chapters (min 10 questions)
  const byCh = {}
  qs.forEach((q) => {
    if (!q.chapter) return
    const k = q.subject + '|' + q.chapter.trim().toLowerCase()
    byCh[k] = byCh[k] || { subject: q.subject, ch: q.chapter.trim(), a: 0, t: 0 }
    byCh[k].a += q.acc; byCh[k].t += q.acc + q.inacc
  })
  const weak = Object.values(byCh).filter((c) => c.t >= 10).map((c) => ({ ...c, p: pct(c.a, c.t) })).sort((a, b) => a.p - b.p).slice(0, 5)
  const tip = { background: '#202020', border: '1px solid #2f2f2f', fontSize: 11 }

  return (
    <>
      <Panel title="Question tracker">
        <div className="grid grid-cols-3 gap-2 mb-3">
          {SUBJ.map((s) => {
            const td = stat(s, today), wk = stat(s, week), all = stat(s, '0000')
            return (
              <div key={s} className="rounded border border-[#2f2f2f] p-2 text-xs">
                <Tag t={s} />
                <div className="mt-2 space-y-1 text-zinc-300">
                  <div className="flex justify-between"><span className="text-zinc-500">Today</span>{td.t} <AccTag v={td.p} /></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Week</span>{wk.t} <AccTag v={wk.p} /></div>
                  <div className="flex justify-between"><span className="text-zinc-500">All</span>{all.t} <AccTag v={all.p} /></div>
                </div>
              </div>
            )
          })}
        </div>
        <p className="text-[11px] text-zinc-500 mb-1">Accuracy % per day</p>
        <div className="h-36 mb-3">
          <ResponsiveContainer><LineChart data={chart}>
            <CartesianGrid stroke="#2f2f2f" vertical={false} /><XAxis dataKey="d" tick={{ fontSize: 10, fill: '#888' }} /><YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#888' }} width={28} />
            <Tooltip contentStyle={tip} />
            {SUBJ.map((s) => <Line key={s} type="monotone" dataKey={s + 'Acc'} name={s} stroke={HEX[s]} dot={false} connectNulls strokeWidth={2} />)}
          </LineChart></ResponsiveContainer>
        </div>
        <p className="text-[11px] text-zinc-500 mb-1">Questions solved per day</p>
        <div className="h-36">
          <ResponsiveContainer><BarChart data={chart}>
            <CartesianGrid stroke="#2f2f2f" vertical={false} /><XAxis dataKey="d" tick={{ fontSize: 10, fill: '#888' }} /><YAxis tick={{ fontSize: 10, fill: '#888' }} width={28} />
            <Tooltip contentStyle={tip} cursor={{ fill: '#2f2f2f' }} />
            {SUBJ.map((s) => <Bar key={s} dataKey={s} stackId="a" fill={HEX[s]} />)}
          </BarChart></ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Log a practice set">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input type="date" className={inp} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
          <select className={inp} value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })}>{SUBJ.map((s) => <option key={s}>{s}</option>)}</select>
          <select className={inp} value={f.source} onChange={(e) => setF({ ...f, source: e.target.value })}>{SOURCES.map((s) => <option key={s}>{s}</option>)}</select>
          <input className={inp} placeholder="Chapter / topic" value={f.chapter} onChange={(e) => setF({ ...f, chapter: e.target.value })} />
          <input type="number" min="0" className={inp} placeholder="Accurate" value={f.acc} onChange={(e) => setF({ ...f, acc: e.target.value })} />
          <input type="number" min="0" className={inp} placeholder="Inaccurate" value={f.inacc} onChange={(e) => setF({ ...f, inacc: e.target.value })} />
        </div>
        <button className={btn + ' w-full'} onClick={add}>Add entry</button>
      </Panel>

      {weak.length > 0 && (
        <Panel title="Weakest chapters" right={<span className="text-[11px] text-zinc-500">min 10 questions</span>}>
          {weak.map((c) => (
            <div key={c.subject + c.ch} className="flex items-center gap-2 border-t border-[#2f2f2f] py-1.5 text-xs">
              <span className="flex-1">{c.ch}</span><Tag t={c.subject} /><AccTag v={c.p} />
            </div>
          ))}
        </Panel>
      )}

      <Panel title="All entries">
        {qs.length === 0 ? <p className="text-xs text-zinc-500">Nothing logged yet.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-zinc-500 text-left"><tr>{['Date', 'Subject', 'Source', 'Chapter', 'Acc', 'Inacc', 'Total', 'Accuracy', ''].map((h) => <th key={h} className="font-normal pb-1.5 pr-2">{h}</th>)}</tr></thead>
              <tbody>
                {qs.slice(0, 50).map((q) => (
                  <tr key={q.id} className="border-t border-[#2f2f2f]">
                    <td className="py-1.5 pr-2 text-zinc-400">{q.date.slice(5)}</td>
                    <td className="pr-2"><Tag t={q.subject} /></td><td className="pr-2"><Tag t={q.source} /></td>
                    <td className="pr-2">{q.chapter}</td><td className="pr-2">{q.acc}</td><td className="pr-2">{q.inacc}</td>
                    <td className="pr-2">{q.acc + q.inacc}</td><td className="pr-2"><AccTag v={pct(q.acc, q.acc + q.inacc)} /></td>
                    <td><button className="text-zinc-500 hover:text-red-400" onClick={() => setQs(qs.filter((x) => x.id !== q.id))}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  )
}

/* ---------- contract ---------- */
function Contract({ day, setDay, last7 }) {
  return (
    <Panel title="Daily contract">
      <div className="rounded border border-[#2f2f2f] p-3 mb-3">
        <p className="text-[11px] text-zinc-500 mb-1">Morning commitment</p>
        <p className="text-xs leading-relaxed mb-2">{COMMIT}</p>
        <Check on={day.am} set={(v) => setDay({ am: v })} label="Signed" />
      </div>
      <div className="rounded border border-[#2f2f2f] p-3 mb-3">
        <p className="text-[11px] text-zinc-500 mb-1">End of day contract</p>
        <p className="text-xs leading-relaxed mb-2">{END}</p>
        <Check on={day.pm} set={(v) => setDay({ pm: v })} label="Signed" />
      </div>
      <div className="flex gap-1.5">
        {last7.map((x) => (
          <div key={x.d} title={x.d} className={`flex-1 rounded py-1 text-center text-[10px] ${x.ok ? 'bg-green-500/20 text-green-300' : 'bg-red-500/10 text-red-300/70'}`}>{x.d.slice(8)}</div>
        ))}
      </div>
    </Panel>
  )
}

/* ---------- log note ---------- */
function LogNote({ day, setDay }) {
  const area = (k, ph) => <textarea rows={2} className={inp + ' mb-2 resize-none'} placeholder={ph} value={day[k] || ''} onChange={(e) => setDay({ [k]: e.target.value })} />
  return (
    <Panel title="Log note" right={
      <div className="flex gap-0.5">{[1, 2, 3, 4, 5].map((n) => (
        <button key={n} onClick={() => setDay({ mood: n })} className={`text-sm ${n <= (day.mood || 0) ? 'text-yellow-400' : 'text-zinc-600'}`}>★</button>
      ))}</div>
    }>
      {area('well', 'What went well')}{area('distract', 'What distracted me')}{area('fix', 'What to fix tomorrow')}
    </Panel>
  )
}

/* ---------- syllabus ---------- */
function Syllabus({ syl, setSyl, today }) {
  const [f, setF] = useState({ name: '', subject: 'Physics' })
  const add = () => { if (!f.name.trim()) return; setSyl([...syl, { ...f, id: uid(), status: 'Not started', last: null }]); setF({ ...f, name: '' }) }
  const bump = (c) => {
    const status = next(SYL_CYCLE, c.status)
    setSyl(syl.map((x) => x.id === c.id ? { ...x, status, last: status === 'Revised' ? today : x.last } : x))
  }
  const queue = syl.filter((c) => c.status !== 'Not started' && (!c.last || c.last < daysAgo(14)))
  return (
    <>
      <Panel title="Syllabus tracker">
        <div className="flex gap-2 mb-3">
          <input className={inp} placeholder="Add chapter" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && add()} />
          <select className={inp + ' !w-28'} value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })}>{SUBJ.map((s) => <option key={s}>{s}</option>)}</select>
          <button className={btn} onClick={add}>Add</button>
        </div>
        {SUBJ.map((s) => {
          const list = syl.filter((c) => c.subject === s)
          const p = pct(list.filter((c) => c.status === 'Revised').length, list.length) || 0
          return (
            <div key={s} className="mb-3">
              <div className="flex items-center justify-between mb-1"><Tag t={s} /><span className="text-[11px] text-zinc-400">{p}% revised</span></div>
              <div className="h-1.5 rounded bg-[#2f2f2f] mb-1.5"><div className="h-full rounded" style={{ width: p + '%', background: HEX[s] }} /></div>
              {list.map((c) => (
                <div key={c.id} className="flex items-center gap-2 py-1 text-xs">
                  <span className="flex-1">{c.name}</span>
                  <Tag t={c.status} onClick={() => bump(c)} />
                  <button className="text-zinc-500 hover:text-red-400" onClick={() => setSyl(syl.filter((x) => x.id !== c.id))}>✕</button>
                </div>
              ))}
            </div>
          )
        })}
      </Panel>
      <Panel title="Revision queue" right={<span className="text-[11px] text-zinc-500">not revised in 14+ days</span>}>
        {queue.length === 0 ? <p className="text-xs text-zinc-500">Nothing due.</p> : queue.map((c) => (
          <div key={c.id} className="flex items-center gap-2 border-t border-[#2f2f2f] py-1.5 text-xs"><span className="flex-1">{c.name}</span><Tag t={c.subject} /></div>
        ))}
      </Panel>
    </>
  )
}
