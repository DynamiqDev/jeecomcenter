import { useState, useEffect, useCallback } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts'

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
  Completed: 'bg-green-500/20 text-green-300',
  Pending: 'bg-yellow-500/20 text-yellow-300',
  Mains: 'bg-blue-500/20 text-blue-300',
  Advanced: 'bg-purple-500/20 text-purple-300',
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
const TASK_CYCLE = ['Not started', 'Pending', 'Completed']
const SYL_W = { 'Not started': 0, Learning: 33, Practiced: 66, Revised: 100 }
const WT = { High: 3, Med: 2, Low: 1 }
// Approximate high-weightage chapters from past JEE Main trends. Change any chapter's weightage in the tracker.
const JEE_HIGH = new Set(['Laws of Motion', 'Work, Energy and Power', 'Rotational Motion', 'Thermodynamics', 'Electrostatics', 'Current Electricity', 'Magnetic Effects of Current and Magnetism', 'Electromagnetic Induction and Alternating Currents', 'Optics', 'Dual Nature of Matter and Radiation', 'Atoms and Nuclei', 'Chemical Bonding and Molecular Structure', 'Chemical Thermodynamics', 'Equilibrium', 'Redox Reactions and Electrochemistry', 'Coordination Compounds', 'Some Basic Principles of Organic Chemistry', 'Organic Compounds Containing Oxygen', 'p-Block Elements', 'd- and f-Block Elements', 'Complex Numbers and Quadratic Equations', 'Matrices and Determinants', 'Sequences and Series', 'Limits, Continuity and Differentiability', 'Integral Calculus', 'Coordinate Geometry (Straight Lines)', 'Conic Sections', 'Vector Algebra', 'Three Dimensional Geometry', 'Statistics and Probability'])
// JEE Main chapter list (NTA syllabus). Edit, delete or add chapters freely.
const JEE_SYLLABUS = {
  Physics: ['Units and Measurements', 'Kinematics', 'Laws of Motion', 'Work, Energy and Power', 'Rotational Motion', 'Gravitation', 'Properties of Solids and Liquids', 'Thermodynamics', 'Kinetic Theory of Gases', 'Oscillations and Waves', 'Electrostatics', 'Current Electricity', 'Magnetic Effects of Current and Magnetism', 'Electromagnetic Induction and Alternating Currents', 'Electromagnetic Waves', 'Optics', 'Dual Nature of Matter and Radiation', 'Atoms and Nuclei', 'Electronic Devices', 'Experimental Skills'],
  Chemistry: ['Some Basic Concepts in Chemistry', 'Atomic Structure', 'Chemical Bonding and Molecular Structure', 'Chemical Thermodynamics', 'Solutions', 'Equilibrium', 'Redox Reactions and Electrochemistry', 'Chemical Kinetics', 'Classification of Elements and Periodicity', 'p-Block Elements', 'd- and f-Block Elements', 'Coordination Compounds', 'Purification and Characterisation of Organic Compounds', 'Some Basic Principles of Organic Chemistry', 'Hydrocarbons', 'Organic Compounds Containing Halogens', 'Organic Compounds Containing Oxygen', 'Organic Compounds Containing Nitrogen', 'Biomolecules', 'Principles Related to Practical Chemistry'],
  Maths: ['Sets, Relations and Functions', 'Complex Numbers and Quadratic Equations', 'Matrices and Determinants', 'Permutations and Combinations', 'Binomial Theorem', 'Sequences and Series', 'Limits, Continuity and Differentiability', 'Integral Calculus', 'Differential Equations', 'Coordinate Geometry (Straight Lines)', 'Circles', 'Conic Sections', 'Three Dimensional Geometry', 'Vector Algebra', 'Statistics and Probability', 'Trigonometry', 'Mathematical Reasoning'],
}
const SYL_CYCLE = ['Not started', 'Learning', 'Practiced', 'Revised']

/* ---------- helpers ---------- */
const ymd = (d = new Date()) => d.toLocaleDateString('en-CA')
const daysAgo = (n) => ymd(new Date(Date.now() - n * 864e5))
const tStatus = (t) => t.status || (t.done ? 'Completed' : 'Not started')
const uid = () => Math.random().toString(36).slice(2, 9)
const pct = (a, t) => (t ? Math.round((a / t) * 100) : null)
const next = (list, v) => list[(list.indexOf(v) + 1) % list.length]
const withStatus = (tasks, id, status) => tasks.map((x) => (x.id === id ? { ...x, status, doneOn: status === 'Completed' ? ymd() : null } : x))

// --- syllabus sync + forgetting curve ---
const norm = (x) => x.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()
const matchTasks = (c, tasks) => tasks.filter((t) => {
  if (t.subject !== c.subject) return false
  const k = norm(t.name), n = norm(c.name)
  return k.length >= 4 && (k.includes(n) || n.includes(k))
})
// Chapter status = highest of: manual status, and what completed/pending tasks named after the chapter say.
// Task words: "revise" -> Revised, "practice/PYQ/DPP/questions" -> Practiced, anything else completed -> Learning.
function derive(c, tasks) {
  let st = 'Not started'
  const dates = new Set(c.revs || [])
  matchTasks(c, tasks).forEach((t) => {
    const s = tStatus(t), nm = t.name.toLowerCase()
    if (s === 'Completed') {
      dates.add(t.doneOn || t.deadline)
      const lv = /revis/.test(nm) ? 'Revised' : /practi|pyq|dpp|problem|question/.test(nm) ? 'Practiced' : 'Learning'
      if (SYL_CYCLE.indexOf(lv) > SYL_CYCLE.indexOf(st)) st = lv
    } else if (s === 'Pending' && st === 'Not started') st = 'Learning'
  })
  const status = SYL_CYCLE.indexOf(st) > SYL_CYCLE.indexOf(c.status) ? st : c.status
  return { status, dates: [...dates].filter(Boolean).sort() }
}
// Ebbinghaus: R = e^(-t/S). Stability S starts at 2.5 days and doubles with every study/revision day.
function retention(dates, today) {
  if (!dates.length) return null
  const S = 2.5 * Math.pow(2, dates.length - 1)
  const t = Math.max(0, (new Date(today) - new Date(dates[dates.length - 1])) / 864e5)
  return { S, t, R: Math.exp(-t / S) }
}

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
  const [tests, setTests] = useLS('jee_tests', [])
  const { now, src } = useServerTime()

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
          <ExamClock exam={exam} now={now} src={src} />
          <Schedule day={day} setDay={setDay} tasks={tasks} today={today} />
          <Tasks tasks={tasks} setTasks={setTasks} today={today} />
        </div>
        <div>
          <Tracker qs={qs} setQs={setQs} today={today} />
        </div>
        <div>
          <Contract day={day} setDay={setDay} last7={last7} />
          <LogNote day={day} setDay={setDay} />
          <Syllabus syl={syl} setSyl={setSyl} today={today} tasks={tasks} />
        </div>
      </div>

      <div className="mt-4">
        <UpcomingTests tests={tests} setTests={setTests} tasks={tasks} setTasks={setTasks} today={today} />
      </div>
    </div>
  )
}

/* ---------- upcoming tests ---------- */
function UpcomingTests({ tests, setTests, tasks, setTasks, today }) {
  const [f, setF] = useState({ date: today, pattern: 'Mains' })
  const add = () => { if (f.date) setTests([...tests, { ...f, id: uid(), marks: '', links: [] }]) }
  const upd = (id, patch) => setTests(tests.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  const cycle = (task) => setTasks(withStatus(tasks, task.id, next(TASK_CYCLE, tStatus(task))))
  const sorted = [...tests].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <Panel title="Upcoming tests" right={<span className="text-[11px] text-zinc-500">Topics come from your Tasks list. Status stays in sync.</span>}>
      <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
        <input type="date" className={inp + ' !w-36'} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
        <select className={inp + ' !w-28'} value={f.pattern} onChange={(e) => setF({ ...f, pattern: e.target.value })}>
          <option>Mains</option><option>Advanced</option>
        </select>
        <button className={btn} onClick={add}>Add test</button>
      </div>
      {sorted.length === 0 && <p className="text-xs text-zinc-500">No tests yet. Pick a date above and add one.</p>}
      {sorted.map((t) => {
        const diff = Math.round((new Date(t.date) - new Date(today)) / 864e5)
        const sameDay = sorted.filter((x) => x.date === t.date)
        const dayName = new Date(t.date + 'T00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })
        return (
          <div key={t.id} className={`rounded border border-[#2f2f2f] p-3 mb-3 ${diff < 0 ? 'opacity-60' : ''}`}>
            <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
              <span className="font-semibold text-sm">{dayName}</span>
              <Tag t={t.pattern} />
              <span className="rounded bg-zinc-700/50 px-1.5 py-0.5 text-[11px]">Test {sameDay.indexOf(t) + 1} of {sameDay.length}</span>
              <span className="text-zinc-400">{diff === 0 ? 'Today' : diff > 0 ? `in ${diff} days` : `${-diff} days ago`}</span>
              <div className="ml-auto flex flex-wrap items-center gap-2">
                <select className={inp + ' !w-24'} value={t.pattern} onChange={(e) => upd(t.id, { pattern: e.target.value })}>
                  <option>Mains</option><option>Advanced</option>
                </select>
                <input type="number" className={inp + ' !w-32'} placeholder="Total marks obtained" value={t.marks} onChange={(e) => upd(t.id, { marks: e.target.value })} />
                <button className="text-zinc-500 hover:text-red-400" onClick={() => setTests(tests.filter((x) => x.id !== t.id))}>✕</button>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {SUBJ.map((s) => {
                const linked = tasks.filter((x) => t.links.includes(x.id) && x.subject === s)
                const free = tasks.filter((x) => x.subject === s && !t.links.includes(x.id))
                const doneN = linked.filter((x) => tStatus(x) === 'Completed').length
                return (
                  <div key={s} className="rounded border border-[#2f2f2f] p-2">
                    <div className="flex items-center justify-between mb-1.5"><Tag t={s} /><span className="text-[11px] text-zinc-400">{doneN}/{linked.length} completed</span></div>
                    {linked.length === 0 && <p className="text-[11px] text-zinc-500 py-1">No topics linked.</p>}
                    {linked.map((x) => (
                      <div key={x.id} className="flex items-center gap-2 border-t border-[#2f2f2f] py-1 text-xs">
                        <span className="flex-1">{x.name}</span>
                        <Tag t={tStatus(x)} onClick={() => cycle(x)} />
                        <button className="text-zinc-500 hover:text-red-400" onClick={() => upd(t.id, { links: t.links.filter((id) => id !== x.id) })}>✕</button>
                      </div>
                    ))}
                    <select className={inp + ' mt-1.5'} value="" onChange={(e) => e.target.value && upd(t.id, { links: [...t.links, e.target.value] })}>
                      <option value="">{free.length ? 'Add topic from tasks' : `No ${s} tasks to add`}</option>
                      {free.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
                    </select>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </Panel>
  )
}

/* ---------- synced time + exam clock ---------- */
// time.is has no public API and blocks browser requests (CORS), so the app syncs with open time APIs
// and falls back to your device clock if they are unreachable.
function useServerTime() {
  const [offset, setOffset] = useState(0)
  const [src, setSrc] = useState('Device clock')
  useEffect(() => {
    let dead = false
    const sources = [
      ['worldtimeapi.org', async () => { const j = await (await fetch('https://worldtimeapi.org/api/timezone/Asia/Kolkata')).json(); return Date.parse(j.utc_datetime) || j.unixtime * 1000 }],
      ['timeapi.io', async () => { const j = await (await fetch('https://timeapi.io/api/time/current/zone?timeZone=Asia/Kolkata')).json(); return Date.parse(j.dateTime.slice(0, 23) + '+05:30') }],
    ]
    const sync = async () => {
      for (const [name, get] of sources) {
        try {
          const t0 = Date.now(), ms = await get(), t1 = Date.now()
          if (!ms || isNaN(ms)) continue
          if (!dead) { setOffset(ms - (t0 + t1) / 2); setSrc('Synced · ' + name) }
          return
        } catch { /* try next source */ }
      }
      if (!dead) { setOffset(0); setSrc('Device clock') }
    }
    sync()
    const i = setInterval(sync, 10 * 60 * 1000)
    return () => { dead = true; clearInterval(i) }
  }, [])
  const now = useCallback(() => Date.now() + offset, [offset])
  return { now, src }
}

function ExamClock({ exam, now, src }) {
  const [t, setT] = useState(now())
  useEffect(() => { const i = setInterval(() => setT(now()), 50); return () => clearInterval(i) }, [now])
  const target = exam ? Date.parse(exam + 'T09:00:00+05:30') : null
  const R = target ? Math.max(0, target - t) : 0
  const d = Math.floor(R / 864e5), h = Math.floor(R / 36e5) % 24, m = Math.floor(R / 6e4) % 60, sec = Math.floor(R / 1e3) % 60
  const aS = ((R / 1e3) % 60) * 6, aM = ((R / 6e4) % 60) * 6, aH = ((R / 36e5) % 12) * 30
  const p2 = (n) => String(n).padStart(2, '0')
  const hand = (len, w, a, color, tail = 0) => <line x1="100" y1={100 + tail} x2="100" y2={100 - len} stroke={color} strokeWidth={w} strokeLinecap="round" transform={`rotate(${a} 100 100)`} />
  return (
    <Panel title="Time left for exam" right={<span className="text-[11px] text-zinc-500">{src}</span>}>
      {!exam ? <p className="text-xs text-zinc-500">Set your exam date in the header to start the countdown.</p> : (
        <>
          <svg viewBox="0 0 200 200" className="w-44 h-44 mx-auto">
            <circle cx="100" cy="100" r="97" fill="#191919" stroke="#2f2f2f" strokeWidth="2" />
            {Array.from({ length: 60 }, (_, i) => {
              const a = (i * 6 * Math.PI) / 180, r2 = i % 5 === 0 ? 86 : 90
              return <line key={i} x1={100 + 94 * Math.sin(a)} y1={100 - 94 * Math.cos(a)} x2={100 + r2 * Math.sin(a)} y2={100 - r2 * Math.cos(a)} stroke={i % 5 === 0 ? '#888' : '#444'} strokeWidth={i % 5 === 0 ? 2 : 1} />
            })}
            {Array.from({ length: 12 }, (_, i) => {
              const n = i + 1, a = (n * 30 * Math.PI) / 180
              return <text key={n} x={100 + 72 * Math.sin(a)} y={100 - 72 * Math.cos(a) + 4} textAnchor="middle" fontSize="11" fill="#aaa">{n}</text>
            })}
            {hand(52, 4, aH, '#e6e6e6')}
            {hand(74, 3, aM, '#60a5fa')}
            {hand(82, 1.5, aS, '#fb923c', 16)}
            <circle cx="100" cy="100" r="4" fill="#fb923c" />
          </svg>
          <div className="grid grid-cols-4 gap-2 text-center mt-3">
            {[['Days', d], ['Hours', h], ['Minutes', m], ['Seconds', sec]].map(([l, v]) => (
              <div key={l} className="rounded border border-[#2f2f2f] py-2">
                <div className="text-lg font-semibold tabular-nums">{p2(v)}</div>
                <div className="text-[10px] text-zinc-500">{l}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-zinc-300 mt-2 tabular-nums">{d}:{p2(h)}:{p2(m)}:{p2(sec)}</p>
          <p className="text-center text-[11px] text-zinc-500 mt-1">Counts down to 9:00 AM IST on exam day. Hands show the time remaining.</p>
        </>
      )}
    </Panel>
  )
}

/* ---------- schedule ---------- */
function Schedule({ day, setDay, tasks, today }) {
  const st = day.st || {}
  const subsFor = (id) => [...new Set(tasks.filter((x) => x.session === id && (x.deadline === today || (x.deadline < today && tStatus(x) !== 'Completed'))).map((x) => x.subject))]
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
                {b.study && <div className="flex flex-wrap gap-1">{subsFor(b.id).map((x) => <Tag key={x} t={x} />)}</div>}
              </td>
              <td className="py-1.5 text-right">
                {b.study && <Tag t={st[b.id] || 'Not started'} onClick={() => setDay({ st: { ...st, [b.id]: next(STATUS_CYCLE, st[b.id] || 'Not started') } })} />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[11px] text-zinc-500 mt-2">Click a status tag to cycle it. Subjects fill in from the tasks you assign to each session.</p>
    </Panel>
  )
}

/* ---------- tasks ---------- */
function Tasks({ tasks, setTasks, today }) {
  const [f, setF] = useState({ name: '', subject: 'Physics', deadline: today, priority: 'Med', session: '' })
  const add = () => { if (!f.name.trim()) return; setTasks([...tasks, { ...f, id: uid(), status: 'Not started' }]); setF({ ...f, name: '' }) }
  const shown = [...tasks].sort((a, b) => (tStatus(a) === 'Completed') - (tStatus(b) === 'Completed') || a.deadline.localeCompare(b.deadline))
  return (
    <Panel title="Tasks">
      <div className="grid grid-cols-[1fr_auto] gap-2 mb-3">
        <input className={inp} placeholder="New task / topic" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && add()} />
        <button className={btn} onClick={add}>Add</button>
        <div className="col-span-2 grid grid-cols-2 gap-2">
          <select className={inp} value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })}>{SUBJ.map((s) => <option key={s}>{s}</option>)}</select>
          <select className={inp} value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value })}>{['High', 'Med', 'Low'].map((s) => <option key={s}>{s}</option>)}</select>
          <input type="date" className={inp} value={f.deadline} onChange={(e) => setF({ ...f, deadline: e.target.value })} />
          <select className={inp} value={f.session} onChange={(e) => setF({ ...f, session: e.target.value })}>
            <option value="">Select session</option>
            {BLOCKS.filter((b) => b.study).map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
          </select>
        </div>
      </div>
      {shown.length === 0 && <p className="text-xs text-zinc-500">No tasks yet. Add one above.</p>}
      {shown.map((t) => (
        <div key={t.id} className="flex items-center gap-2 border-t border-[#2f2f2f] py-1.5 text-xs">
          <Tag t={tStatus(t)} onClick={() => setTasks(withStatus(tasks, t.id, next(TASK_CYCLE, tStatus(t))))} />
          <span className={`flex-1 ${tStatus(t) === 'Completed' ? 'line-through text-zinc-500' : ''}`}>{t.name}</span>
          <Tag t={t.subject} /><Tag t={t.priority} />
          <select className="bg-[#191919] border border-[#2f2f2f] rounded px-1 py-0.5 text-[11px] w-14" value={t.session || ''} onChange={(e) => setTasks(tasks.map((x) => x.id === t.id ? { ...x, session: e.target.value } : x))}>
            <option value="">–</option>
            {BLOCKS.filter((b) => b.study).map((b) => <option key={b.id} value={b.id}>S{b.label.slice(-1)}</option>)}
          </select>
          <span className={tStatus(t) !== 'Completed' && t.deadline < today ? 'text-red-400' : 'text-zinc-400'}>{t.deadline.slice(5)}</span>
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

/* ---------- forgetting curve ---------- */
function ForgettingCurve({ syl, tasks, today }) {
  const [sel, setSel] = useState(null)
  const rows = syl.map((c) => {
    const r = retention(derive(c, tasks).dates, today)
    return r && { c, r, pr: (1 - r.R) * WT[c.w || 'Med'] }
  }).filter(Boolean).sort((a, b) => b.pr - a.pr)
  const cur = rows.find((x) => x.c.id === sel) || rows[0]
  const span = cur ? Math.max(30, Math.ceil(cur.r.t) + 3) : 30
  const curve = cur ? Array.from({ length: span + 1 }, (_, d) => ({ d, R: Math.round(Math.exp(-d / cur.r.S) * 100) })) : []
  const rc = (R) => (R < 0.5 ? 'bg-red-500/20 text-red-300' : R < 0.7 ? 'bg-yellow-500/20 text-yellow-300' : 'bg-green-500/20 text-green-300')
  return (
    <Panel title="Forgetting curve" right={<span className="text-[11px] text-zinc-500">revise below 70% retention</span>}>
      {!cur ? <p className="text-xs text-zinc-500">Complete a task named after a chapter, or click a chapter's status tag, to start its curve.</p> : (
        <>
          <p className="text-[11px] text-zinc-500 mb-1">{cur.c.name}: memory fades after your last study day. Each revision makes it last about twice as long. The orange line is today.</p>
          <div className="h-36 mb-3">
            <ResponsiveContainer>
              <LineChart data={curve}>
                <CartesianGrid stroke="#2f2f2f" vertical={false} />
                <XAxis dataKey="d" type="number" domain={[0, span]} tick={{ fontSize: 10, fill: '#888' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#888' }} width={28} />
                <Tooltip contentStyle={{ background: '#202020', border: '1px solid #2f2f2f', fontSize: 11 }} labelFormatter={(d) => `Day ${d} after last study`} />
                <ReferenceLine y={70} stroke="#666" strokeDasharray="4 4" />
                <ReferenceLine x={Math.min(cur.r.t, span)} stroke="#fb923c" />
                <Line dataKey="R" name="Retention %" stroke={HEX[cur.c.subject]} dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-zinc-500 mb-1">Revise in this order (low retention and high weightage first). Click a row to see its curve.</p>
          {rows.slice(0, 10).map((x) => (
            <div key={x.c.id} onClick={() => setSel(x.c.id)} className={`flex items-center gap-2 border-t border-[#2f2f2f] py-1.5 px-1 text-xs cursor-pointer ${x.c.id === cur.c.id ? 'bg-white/5' : ''}`}>
              <span className="flex-1">{x.c.name}</span>
              <Tag t={x.c.subject} /><Tag t={x.c.w || 'Med'} />
              <span className={`rounded px-1.5 py-0.5 text-[11px] ${rc(x.r.R)}`}>{Math.round(x.r.R * 100)}%</span>
            </div>
          ))}
        </>
      )}
    </Panel>
  )
}

/* ---------- syllabus ---------- */
function Syllabus({ syl, setSyl, today, tasks }) {
  const [f, setF] = useState({ name: '', subject: 'Physics' })
  const add = () => { if (!f.name.trim()) return; setSyl([...syl, { ...f, id: uid(), status: 'Not started', w: 'Med', revs: [] }]); setF({ ...f, name: '' }) }
  const bump = (c) => {
    const status = next(SYL_CYCLE, c.status)
    setSyl(syl.map((x) => x.id === c.id ? { ...x, status, revs: status === 'Not started' ? [] : [...new Set([...(x.revs || []), today])] } : x))
  }
  const load = () => {
    const have = new Set(syl.map((c) => c.subject + '|' + c.name.toLowerCase()))
    const add = []
    SUBJ.forEach((sub) => JEE_SYLLABUS[sub].forEach((n) => { if (!have.has(sub + '|' + n.toLowerCase())) add.push({ id: uid(), name: n, subject: sub, status: 'Not started', w: JEE_HIGH.has(n) ? 'High' : 'Med', revs: [] }) }))
    setSyl([...syl, ...add])
  }
  const overall = syl.length ? Math.round(syl.reduce((a, c) => a + SYL_W[derive(c, tasks).status], 0) / syl.length) : 0
  return (
    <>
      <Panel title="Syllabus tracker" right={<button className={btn} onClick={load}>Load JEE Main chapters</button>}>
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1"><span>Overall syllabus completed</span><span className="text-zinc-300">{overall}%</span></div>
          <div className="h-2 rounded bg-[#2f2f2f]"><div className="h-full rounded bg-zinc-200" style={{ width: overall + '%' }} /></div>
          <p className="text-[11px] text-zinc-500 mt-1">Not started 0%, Learning 33%, Practiced 66%, Revised 100% per chapter. It also updates from tasks: a completed task named after a chapter counts as Learning, with \u201cpractice\u201d, \u201cPYQ\u201d or \u201cDPP\u201d in the name as Practiced, and with \u201crevise\u201d as Revised.</p>
        </div>
        <div className="flex gap-2 mb-3">
          <input className={inp} placeholder="Add chapter" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && add()} />
          <select className={inp + ' !w-28'} value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })}>{SUBJ.map((s) => <option key={s}>{s}</option>)}</select>
          <button className={btn} onClick={add}>Add</button>
        </div>
        {SUBJ.map((s) => {
          const list = syl.filter((c) => c.subject === s)
          const p = list.length ? Math.round(list.reduce((a, c) => a + SYL_W[derive(c, tasks).status], 0) / list.length) : 0
          return (
            <div key={s} className="mb-3">
              <div className="flex items-center justify-between mb-1"><Tag t={s} /><span className="text-[11px] text-zinc-400">{p}% complete · {list.filter((c) => derive(c, tasks).status === 'Revised').length}/{list.length} revised</span></div>
              <div className="h-1.5 rounded bg-[#2f2f2f] mb-1.5"><div className="h-full rounded" style={{ width: p + '%', background: HEX[s] }} /></div>
              {list.map((c) => (
                <div key={c.id} className="flex items-center gap-2 py-1 text-xs">
                  <span className="flex-1">{c.name}</span>
                  <select className="bg-[#191919] border border-[#2f2f2f] rounded px-1 py-0.5 text-[11px] w-16" title="Weightage" value={c.w || 'Med'} onChange={(e) => setSyl(syl.map((x) => x.id === c.id ? { ...x, w: e.target.value } : x))}>
                    {['High', 'Med', 'Low'].map((w) => <option key={w}>{w}</option>)}
                  </select>
                  <Tag t={derive(c, tasks).status} onClick={() => bump(c)} />
                  <button className="text-zinc-500 hover:text-red-400" onClick={() => setSyl(syl.filter((x) => x.id !== c.id))}>✕</button>
                </div>
              ))}
            </div>
          )
        })}
      </Panel>
      <ForgettingCurve syl={syl} tasks={tasks} today={today} />
    </>
  )
}
