import { useState, useEffect, useCallback } from 'react'
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

// --- syllabus sync ---
const norm = (x) => x.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()
const stemsMatch = (a, b) => {
  if (a.includes(b) || b.includes(a)) return true
  const wa = a.split(' ').filter((w) => w.length >= 5)
  const wb = b.split(' ').filter((w) => w.length >= 5)
  return wa.some((x) => wb.some((y) => x.slice(0, 6) === y.slice(0, 6)))
}
const matchTasks = (c, tasks) => tasks.filter((t) => {
  if (t.subject !== c.subject) return false
  const k = norm(t.name), n = norm(c.name)
  return k.length >= 4 && stemsMatch(k, n)
})
const findMatchedChapter = (task, syl) => {
  if (!task?.name) return null
  const k = norm(task.name)
  if (k.length < 4) return null
  return syl.find((c) => c.subject === task.subject && stemsMatch(k, norm(c.name))) || null
}
const taskLevel = (t) => {
  if (t.stage === 'Revised' || t.stage === 'Revise + Practise') return 'Revised'
  if (t.stage === 'Practiced') return 'Practiced'
  if (t.stage === 'Learning') return 'Learning'
  const nm = t.name.toLowerCase()
  return /revis/.test(nm) ? 'Revised' : /practi|pyq|dpp|problem|question|solve|mcq|sheet/.test(nm) ? 'Practiced' : 'Learning'
}
// Chapter status = highest of: manual status, and what completed/pending tasks named after the chapter say.
// Task words: "revise" -> Revised, "practice/practise/PYQ/DPP/questions" -> Practiced, anything else completed -> Learning.
function derive(c, tasks) {
  let st = 'Not started'
  const dates = new Set(c.revs || [])
  matchTasks(c, tasks).forEach((t) => {
    const s = tStatus(t)
    if (s === 'Completed') {
      dates.add(t.doneOn || t.deadline)
      const lv = taskLevel(t)
      if (SYL_CYCLE.indexOf(lv) > SYL_CYCLE.indexOf(st)) st = lv
    } else if (s === 'Pending' && st === 'Not started') st = 'Learning'
  })
  const status = SYL_CYCLE.indexOf(st) > SYL_CYCLE.indexOf(c.status) ? st : c.status
  return { status, dates: [...dates].filter(Boolean).sort() }
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
  const [page, setPage] = useState('dashboard')
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
  const openTasks = tasks.filter((t) => tStatus(t) !== 'Completed').length

  // contract streak: consecutive days with both signed (today may still be pending)
  let streak = 0
  for (let i = days[today]?.am && days[today]?.pm ? 0 : 1; ; i++) {
    const d = days[daysAgo(i)]
    if (d?.am && d?.pm) streak++; else break
  }
  const last7 = [6, 5, 4, 3, 2, 1, 0].map((i) => ({ d: daysAgo(i), ok: days[daysAgo(i)]?.am && days[daysAgo(i)]?.pm }))

  return (
    <div className="min-h-screen px-4 py-5 max-w-[1500px] mx-auto">
      <header className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <h1 className="text-xl font-semibold">JEE Command Center</h1>
            <p className="text-xs text-zinc-400 mt-0.5">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <nav className="flex items-center gap-1 rounded-lg border border-[#2f2f2f] bg-[#202020] p-1 text-xs">
            <button
              onClick={() => setPage('dashboard')}
              className={`rounded px-3 py-1 transition-colors ${page === 'dashboard' ? 'bg-zinc-700 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setPage('tasks')}
              className={`rounded px-3 py-1 transition-colors ${page === 'tasks' ? 'bg-zinc-700 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              Tasks{openTasks > 0 ? ` (${openTasks})` : ''}
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-zinc-400">Exam date</span>
          <input type="date" value={exam} onChange={(e) => setExam(e.target.value)} className={inp + ' !w-36'} />
          {left !== null && <span className="rounded bg-zinc-700/50 px-2 py-1">{left >= 0 ? `${left} days left` : 'Exam passed'}</span>}
          <span className="rounded bg-zinc-700/50 px-2 py-1">Streak {streak}</span>
        </div>
      </header>

      {page === 'tasks' ? (
        <TasksPage tasks={tasks} setTasks={setTasks} today={today} syl={syl} onBack={() => setPage('dashboard')} />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-3 items-start">
            <div>
              <Schedule day={day} setDay={setDay} tasks={tasks} today={today} />
              <ExamClock exam={exam} now={now} src={src} />
              <TasksSummary tasks={tasks} setTasks={setTasks} today={today} syl={syl} onOpen={() => setPage('tasks')} />
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
        </>
      )}
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
  const fracSec = (R / 1e3) % 60
  const fracMin = (R / 6e4) % 60
  const fracHr = (R / 36e5) % 24
  const p2 = (n) => String(n).padStart(2, '0')

  const cx = 190, cy = 190
  const daySlots = Array.from({ length: 16 }, (_, i) => {
    const off = i <= 8 ? i : i - 16
    const val = d + off
    return { i, angle: i * 22.5, label: val >= 0 ? `${val}d` : '' }
  })

  return (
    <Panel title="Time left for exam" right={<span className="text-[11px] text-zinc-500">{src}</span>}>
      {!exam ? <p className="text-xs text-zinc-500">Set your exam date in the header to start the countdown.</p> : (
        <>
          <svg viewBox="0 0 380 380" className="w-full max-w-[270px] aspect-square mx-auto block select-none">
            <defs>
              <clipPath id="exam-clock-dial">
                <circle cx={cx} cy={cy} r="181" />
              </clipPath>
              <clipPath id="exam-clock-hub">
                <circle cx={cx} cy={cy} r="13" />
              </clipPath>
            </defs>

            <circle cx={cx} cy={cy} r="182" fill="#0c1016" stroke="#0284c7" strokeWidth="1.5" strokeOpacity="0.75" />

            <g clipPath="url(#exam-clock-dial)" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">
              {/* Days ring */}
              <g transform={`translate(${cx}, ${cy})`}>
                {daySlots.map((slot) => slot.label && (
                  <text
                    key={slot.i}
                    x={56}
                    y={0}
                    fill="#155e75"
                    fontSize="8.5"
                    textAnchor="middle"
                    dominantBaseline="central"
                    transform={`rotate(${slot.angle})`}
                  >
                    {slot.label}
                  </text>
                ))}
              </g>

              {/* Hours ring (00-23) */}
              <g transform={`translate(${cx}, ${cy}) rotate(${-fracHr * 15})`}>
                {Array.from({ length: 24 }, (_, i) => (
                  <text
                    key={i}
                    x={92}
                    y={0}
                    fill="#155e75"
                    fontSize="8.5"
                    textAnchor="middle"
                    dominantBaseline="central"
                    transform={`rotate(${i * 15})`}
                  >
                    {p2(i)}
                  </text>
                ))}
              </g>

              {/* Minutes ring (00-59) */}
              <g transform={`translate(${cx}, ${cy}) rotate(${-fracMin * 6})`}>
                {Array.from({ length: 60 }, (_, i) => (
                  <text
                    key={i}
                    x={126}
                    y={0}
                    fill="#155e75"
                    fontSize="7.5"
                    textAnchor="middle"
                    dominantBaseline="central"
                    transform={`rotate(${i * 6})`}
                  >
                    {p2(i)}
                  </text>
                ))}
              </g>

              {/* Seconds ring (00-59) */}
              <g transform={`translate(${cx}, ${cy}) rotate(${-fracSec * 6})`}>
                {Array.from({ length: 60 }, (_, i) => (
                  <text
                    key={i}
                    x={160}
                    y={0}
                    fill="#155e75"
                    fontSize="7.5"
                    textAnchor="middle"
                    dominantBaseline="central"
                    transform={`rotate(${i * 6})`}
                  >
                    {p2(i)}
                  </text>
                ))}
              </g>

              {/* Active horizontal cyan highlight bar */}
              <rect x={cx} y={cy - 13} width="184" height="26" fill="#075985" />
              <line x1={cx} y1={cy - 13} x2="374" y2={cy - 13} stroke="#0ea5e9" strokeWidth="0.75" strokeOpacity="0.65" />
              <line x1={cx} y1={cy + 13} x2="374" y2={cy + 13} stroke="#0ea5e9" strokeWidth="0.75" strokeOpacity="0.65" />

              <g fill="#f8fafc" fontSize="11.5" fontWeight="600" textAnchor="middle" dominantBaseline="central">
                <text x={cx + 56} y={cy}>{d}d</text>
                <text x={cx + 92} y={cy}>{p2(h)}</text>
                <text x={cx + 109} y={cy} fill="#bae6fd">:</text>
                <text x={cx + 126} y={cy}>{p2(m)}</text>
                <text x={cx + 143} y={cy} fill="#bae6fd">:</text>
                <text x={cx + 160} y={cy}>{p2(sec)}</text>
              </g>
            </g>

            {/* Center hub */}
            <circle cx={cx} cy={cy} r="16" fill="#0c1016" stroke="#0ea5e9" strokeWidth="1.2" strokeOpacity="0.8" />
            <g clipPath="url(#exam-clock-hub)">
              <rect x={cx - 13} y={cy - 13} width="26" height="8.7" fill="#FF9933" />
              <rect x={cx - 13} y={cy - 4.3} width="26" height="8.6" fill="#FFFFFF" />
              <rect x={cx - 13} y={cy + 4.3} width="26" height="8.7" fill="#138808" />
              <circle cx={cx} cy={cy} r="3" fill="none" stroke="#000080" strokeWidth="0.8" />
            </g>
          </svg>

          <p className="text-center text-[11px] text-zinc-500 mt-2">Counts down to 9:00 AM IST on exam day.</p>
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

/* ---------- tasks (dashboard summary + dedicated day-wise page) ---------- */
function TaskAddForm({ tasks, setTasks, today, syl, defaultDate, compact }) {
  const [f, setF] = useState({ name: '', subject: 'Physics', deadline: defaultDate || today, priority: 'Med', session: '', stage: 'Auto' })
  useEffect(() => {
    if (defaultDate) setF((prev) => ({ ...prev, deadline: defaultDate }))
  }, [defaultDate])
  const add = () => {
    if (!f.name.trim()) return
    const item = { ...f, id: uid(), status: 'Not started' }
    if (item.stage === 'Auto') delete item.stage
    setTasks([...tasks, item])
    setF({ ...f, name: '' })
  }
  const chapterSuggestions = (syl.length ? syl.filter((c) => c.subject === f.subject).map((c) => c.name) : JEE_SYLLABUS[f.subject]) || []
  const previewMatch = findMatchedChapter({ name: f.name, subject: f.subject }, syl)

  return (
    <div className={compact ? 'grid grid-cols-[1fr_auto] gap-2' : 'grid gap-2 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto]'}>
      <input
        list="jee-task-chapters"
        className={inp}
        placeholder="Topic / task (e.g. Electrostatics revise & practise)"
        value={f.name}
        onChange={(e) => setF({ ...f, name: e.target.value })}
        onKeyDown={(e) => e.key === 'Enter' && add()}
      />
      <datalist id="jee-task-chapters">
        {chapterSuggestions.map((ch) => <option key={ch} value={ch} />)}
      </datalist>
      {compact && <button className={btn} onClick={add}>Add</button>}
      <div className={compact ? 'col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-2' : 'contents'}>
        <select className={inp} value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })}>{SUBJ.map((s) => <option key={s}>{s}</option>)}</select>
        <select className={inp} value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value })}>{['High', 'Med', 'Low'].map((s) => <option key={s}>{s}</option>)}</select>
        <select className={inp} title="How completing this task updates syllabus status" value={f.stage} onChange={(e) => setF({ ...f, stage: e.target.value })}>
          <option value="Auto">Auto (from name)</option>
          <option value="Learning">Learning (33%)</option>
          <option value="Practiced">Practise (66%)</option>
          <option value="Revise + Practise">Revise + Practise (100%)</option>
          <option value="Revised">Revise (100%)</option>
        </select>
        <input type="date" className={inp} value={f.deadline} onChange={(e) => setF({ ...f, deadline: e.target.value })} />
        <select className={inp + (compact ? ' sm:col-span-2' : '')} value={f.session} onChange={(e) => setF({ ...f, session: e.target.value })}>
          <option value="">Select session</option>
          {BLOCKS.filter((b) => b.study).map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
        </select>
      </div>
      {!compact && <button className={btn} onClick={add}>Add task</button>}
      {previewMatch && (
        <p className={`${compact ? 'col-span-2' : 'md:col-span-7'} text-[11px] text-emerald-400/90`}>
          Matches chapter: <span className="font-medium">{previewMatch.name}</span> → completing marks it <span className="font-medium">{taskLevel({ name: f.name, stage: f.stage === 'Auto' ? undefined : f.stage })}</span>
        </p>
      )}
    </div>
  )
}

function TasksSummary({ tasks, setTasks, today, syl, onOpen }) {
  const scheduledDays = [...new Set(tasks.map((t) => t.deadline).filter(Boolean))].sort((a, b) => {
    if (a === today) return -1
    if (b === today) return 1
    const aPast = a < today, bPast = b < today
    if (aPast && !bPast) return 1
    if (!aPast && bPast) return -1
    return a.localeCompare(b)
  })
  const dayOptions = scheduledDays.includes(today) ? scheduledDays : [today, ...scheduledDays]
  const [activeDay, setActiveDay] = useState(today)
  const currentDay = dayOptions.includes(activeDay) ? activeDay : today

  const dayTasks = [...tasks.filter((t) => t.deadline === currentDay)].sort((a, b) => (tStatus(a) === 'Completed') - (tStatus(b) === 'Completed'))
  const dayDone = dayTasks.filter((t) => tStatus(t) === 'Completed').length
  const pctDay = dayTasks.length ? Math.round((dayDone / dayTasks.length) * 100) : 0
  const overdue = tasks.filter((t) => t.deadline < today && tStatus(t) !== 'Completed').length

  const shortDay = (d) => d === today ? 'Today' : new Date(d + 'T00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

  return (
    <Panel
      title="Tasks"
      right={
        <button onClick={onOpen} className="rounded bg-zinc-700/60 hover:bg-zinc-600/70 px-2.5 py-1 text-xs text-zinc-200">
          All days →
        </button>
      }
    >
      <TaskAddForm tasks={tasks} setTasks={setTasks} today={today} syl={syl} defaultDate={currentDay} compact />

      <div className="mt-3 rounded border border-[#2f2f2f] bg-[#191919] p-3">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex flex-wrap items-center gap-1">
            {dayOptions.map((d) => {
              const cnt = tasks.filter((t) => t.deadline === d).length
              const isOver = d < today && tasks.some((t) => t.deadline === d && tStatus(t) !== 'Completed')
              return (
                <button
                  key={d}
                  onClick={() => setActiveDay(d)}
                  className={`rounded px-2 py-0.5 text-[11px] transition-colors ${currentDay === d ? 'bg-zinc-700 text-zinc-100 font-medium' : isOver ? 'text-red-300/80 hover:bg-zinc-800' : 'text-zinc-400 hover:bg-zinc-800'}`}
                >
                  {shortDay(d)}{cnt > 0 ? ` (${cnt})` : ''}
                </button>
              )
            })}
          </div>
          <span className="text-[11px] text-zinc-400 tabular-nums">
            {dayDone}/{dayTasks.length} done{overdue > 0 && currentDay === today ? ` · ${overdue} overdue` : ''}
          </span>
        </div>

        <div className="h-1.5 rounded bg-[#2f2f2f] overflow-hidden mb-2">
          <div className="h-full rounded bg-green-500/80 transition-all" style={{ width: pctDay + '%' }} />
        </div>

        {dayTasks.length === 0 ? (
          <p className="text-xs text-zinc-500 py-1">No tasks scheduled for {shortDay(currentDay)}.</p>
        ) : (
          <div>
            {dayTasks.map((t) => {
              const matched = findMatchedChapter(t, syl)
              return (
                <div key={t.id} className="flex items-center gap-2 border-t border-[#2f2f2f] py-1.5 text-xs">
                  <Tag t={tStatus(t)} onClick={() => setTasks(withStatus(tasks, t.id, next(TASK_CYCLE, tStatus(t))))} />
                  <div className="flex-1 min-w-0">
                    <div className={`truncate ${tStatus(t) === 'Completed' ? 'line-through text-zinc-500' : ''}`}>{t.name}</div>
                    {matched && (
                      <div className="text-[10px] text-zinc-500 truncate">
                        Syllabus: {matched.name} ({taskLevel(t)})
                      </div>
                    )}
                  </div>
                  <Tag t={t.subject} />
                  <Tag t={t.priority} />
                  <select className="bg-[#202020] border border-[#2f2f2f] rounded px-1 py-0.5 text-[11px] w-14" value={t.session || ''} onChange={(e) => setTasks(tasks.map((x) => x.id === t.id ? { ...x, session: e.target.value } : x))}>
                    <option value="">–</option>
                    {BLOCKS.filter((b) => b.study).map((b) => <option key={b.id} value={b.id}>S{b.label.slice(-1)}</option>)}
                  </select>
                  <button className="text-zinc-500 hover:text-red-400" onClick={() => setTasks(tasks.filter((x) => x.id !== t.id))}>✕</button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Panel>
  )
}

function TasksPage({ tasks, setTasks, today, syl, onBack }) {
  const [filter, setFilter] = useState('All')
  const [selectedDate, setSelectedDate] = useState(today)

  const filtered = tasks.filter((t) => {
    if (filter === 'Pending') return tStatus(t) !== 'Completed'
    if (filter === 'Completed') return tStatus(t) === 'Completed'
    return true
  })

  const grouped = filtered.reduce((acc, t) => {
    const key = t.deadline || 'No date'
    if (!acc[key]) acc[key] = []
    acc[key].push(t)
    return acc
  }, {})

  const dayKeys = Object.keys(grouped).sort((a, b) => {
    if (a === today) return -1
    if (b === today) return 1
    const aPast = a < today, bPast = b < today
    if (aPast && !bPast) return 1
    if (!aPast && bPast) return -1
    return a.localeCompare(b)
  })

  const formatDayLabel = (d) => {
    if (d === 'No date') return { title: 'Unscheduled', badge: null }
    const diff = Math.round((new Date(d) - new Date(today)) / 864e5)
    const title = new Date(d + 'T00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    const badge = diff === 0 ? 'Today' : diff === 1 ? 'Tomorrow' : diff === -1 ? 'Yesterday' : diff > 1 ? `in ${diff} days` : `${-diff} days ago`
    return { title, badge, diff }
  }

  return (
    <div className="space-y-4">
      <Panel
        title="Day-wise tasks"
        right={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1 text-[11px]">
              {['All', 'Pending', 'Completed'].map((k) => (
                <button key={k} onClick={() => setFilter(k)} className={`rounded px-2 py-1 ${filter === k ? 'bg-zinc-600 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-800'}`}>{k}</button>
              ))}
            </div>
            <button onClick={onBack} className={btn}>← Dashboard</button>
          </div>
        }
      >
        <TaskAddForm tasks={tasks} setTasks={setTasks} today={today} syl={syl} defaultDate={selectedDate} />
      </Panel>

      {dayKeys.length === 0 ? (
        <div className="rounded-lg border border-[#2f2f2f] bg-[#202020] p-6 text-center text-xs text-zinc-500">
          No tasks match this filter. Add a task above to create a day tile.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 items-start">
          {dayKeys.map((d) => {
            const items = [...grouped[d]].sort((a, b) => (tStatus(a) === 'Completed') - (tStatus(b) === 'Completed'))
            const doneN = items.filter((t) => tStatus(t) === 'Completed').length
            const pctDay = Math.round((doneN / items.length) * 100)
            const subjects = [...new Set(items.map((t) => t.subject))]
            const { title, badge, diff } = formatDayLabel(d)
            const hasOverdue = d < today && doneN < items.length
            return (
              <section key={d} className={`rounded-lg border bg-[#202020] p-4 ${d === today ? 'border-zinc-500/70' : hasOverdue ? 'border-red-500/40' : 'border-[#2f2f2f]'}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">{title}</h3>
                      {badge && (
                        <span className={`rounded px-1.5 py-0.5 text-[10px] ${d === today ? 'bg-blue-500/20 text-blue-300' : hasOverdue ? 'bg-red-500/20 text-red-300' : 'bg-zinc-700/60 text-zinc-300'}`}>
                          {hasOverdue ? `Overdue · ${badge}` : badge}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {subjects.map((s) => <Tag key={s} t={s} />)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-zinc-300 tabular-nums">{doneN}/{items.length} done</div>
                    {d !== 'No date' && (
                      <button onClick={() => setSelectedDate(d)} className="text-[10px] text-zinc-500 hover:text-zinc-300 mt-0.5">
                        + Add to day
                      </button>
                    )}
                  </div>
                </div>
                <div className="h-1.5 rounded bg-[#2f2f2f] overflow-hidden mb-3">
                  <div className="h-full rounded bg-green-500/80 transition-all" style={{ width: pctDay + '%' }} />
                </div>
                <div>
                  {items.map((t) => {
                    const matched = findMatchedChapter(t, syl)
                    return (
                      <div key={t.id} className="flex items-center gap-2 border-t border-[#2f2f2f] py-1.5 text-xs">
                        <Tag t={tStatus(t)} onClick={() => setTasks(withStatus(tasks, t.id, next(TASK_CYCLE, tStatus(t))))} />
                        <div className="flex-1 min-w-0">
                          <div className={`truncate ${tStatus(t) === 'Completed' ? 'line-through text-zinc-500' : ''}`}>{t.name}</div>
                          {matched && (
                            <div className="text-[10px] text-zinc-500 truncate">
                              Syllabus: {matched.name} ({taskLevel(t)})
                            </div>
                          )}
                        </div>
                        <Tag t={t.priority} />
                        <select className="bg-[#191919] border border-[#2f2f2f] rounded px-1 py-0.5 text-[11px] w-14" value={t.session || ''} onChange={(e) => setTasks(tasks.map((x) => x.id === t.id ? { ...x, session: e.target.value } : x))}>
                          <option value="">–</option>
                          {BLOCKS.filter((b) => b.study).map((b) => <option key={b.id} value={b.id}>S{b.label.slice(-1)}</option>)}
                        </select>
                        <button className="text-zinc-500 hover:text-red-400" onClick={() => setTasks(tasks.filter((x) => x.id !== t.id))}>✕</button>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
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
function Syllabus({ syl, setSyl, today, tasks }) {
  const [f, setF] = useState({ name: '', subject: 'Physics' })
  const [manage, setManage] = useState(false)
  const [q, setQ] = useState('')
  const add = () => { if (!f.name.trim()) return; setSyl([...syl, { ...f, id: uid(), status: 'Not started', w: 'Med', revs: [] }]); setF({ ...f, name: '' }) }
  const bump = (c) => {
    const curStatus = derive(c, tasks).status
    const status = next(SYL_CYCLE, curStatus)
    setSyl(syl.map((x) => x.id === c.id ? { ...x, status, revs: status === 'Not started' ? [] : [...new Set([...(x.revs || []), today])] } : x))
  }
  const load = () => {
    const have = new Set(syl.map((c) => c.subject + '|' + c.name.toLowerCase()))
    const add = []
    SUBJ.forEach((sub) => JEE_SYLLABUS[sub].forEach((n) => { if (!have.has(sub + '|' + n.toLowerCase())) add.push({ id: uid(), name: n, subject: sub, status: 'Not started', w: JEE_HIGH.has(n) ? 'High' : 'Med', revs: [] }) }))
    setSyl([...syl, ...add])
  }
  const overall = syl.length ? Math.round(syl.reduce((a, c) => a + SYL_W[derive(c, tasks).status], 0) / syl.length) : 0
  const highList = syl.filter((c) => (c.w || 'Med') === 'High')
  const highPct = highList.length ? Math.round(highList.reduce((a, c) => a + SYL_W[derive(c, tasks).status], 0) / highList.length) : 0
  const missingDefault = SUBJ.reduce((n, sub) => n + JEE_SYLLABUS[sub].filter((ch) => !syl.some((c) => c.subject === sub && c.name.toLowerCase() === ch.toLowerCase())).length, 0)
  const filtered = q.trim() ? syl.filter((c) => c.name.toLowerCase().includes(q.trim().toLowerCase()) || c.subject.toLowerCase().includes(q.trim().toLowerCase())) : []

  return (
    <Panel
      title="Syllabus tracker"
      right={
        <div className="flex items-center gap-1.5">
          {missingDefault > 0 && <button className={btn} onClick={load}>Load JEE chapters</button>}
          {syl.length > 0 && (
            <button onClick={() => setManage((v) => !v)} className="text-[11px] text-zinc-400 hover:text-zinc-200 px-1.5 py-1">
              {manage ? 'Close' : `Manage (${syl.length})`}
            </button>
          )}
        </div>
      }
    >
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span>Overall syllabus completed</span>
          <span className="text-zinc-300 tabular-nums">{overall}%{highList.length > 0 ? ` · High wt ${highPct}%` : ''}</span>
        </div>
        <div className="h-2 rounded bg-[#2f2f2f] overflow-hidden"><div className="h-full rounded bg-zinc-200 transition-all" style={{ width: overall + '%' }} /></div>
        <p className="text-[11px] text-zinc-500 mt-1.5">Syncs automatically from completed tasks (Learning 33% · Practiced 66% · Revised 100%).</p>
      </div>

      <div className="space-y-3 mb-4">
        {SUBJ.map((s) => {
          const list = syl.filter((c) => c.subject === s)
          const statuses = list.map((c) => derive(c, tasks).status)
          const p = list.length ? Math.round(statuses.reduce((a, st) => a + SYL_W[st], 0) / list.length) : 0
          const revisedN = statuses.filter((st) => st === 'Revised').length
          const practicedN = statuses.filter((st) => st === 'Practiced').length
          const learningN = statuses.filter((st) => st === 'Learning').length
          return (
            <div key={s}>
              <div className="flex items-center justify-between mb-1">
                <Tag t={s} />
                <span className="text-[11px] text-zinc-400 tabular-nums">
                  {p}% · {revisedN}/{list.length} revised{practicedN ? ` · ${practicedN} practiced` : ''}{learningN ? ` · ${learningN} learning` : ''}
                </span>
              </div>
              <div className="h-1.5 rounded bg-[#2f2f2f] overflow-hidden">
                <div className="h-full rounded transition-all" style={{ width: p + '%', background: HEX[s] }} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex gap-2">
        <input className={inp} placeholder="Add custom chapter" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && add()} />
        <select className={inp + ' !w-28'} value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })}>{SUBJ.map((s) => <option key={s}>{s}</option>)}</select>
        <button className={btn} onClick={add}>Add</button>
      </div>

      {manage && (
        <div className="mt-3 pt-3 border-t border-[#2f2f2f]">
          <input className={inp + ' mb-2'} placeholder="Search stored chapters to edit status or weightage..." value={q} onChange={(e) => setQ(e.target.value)} />
          {!q.trim() ? (
            <p className="text-[11px] text-zinc-500">Type a chapter name above to inspect or update any of your {syl.length} stored chapters.</p>
          ) : filtered.length === 0 ? (
            <p className="text-[11px] text-zinc-500">No stored chapters match "{q}".</p>
          ) : (
            <div className="max-h-56 overflow-y-auto space-y-1">
              {filtered.map((c) => (
                <div key={c.id} className="flex items-center gap-2 py-1 text-xs border-t border-[#2f2f2f]/60">
                  <span className="flex-1 truncate">{c.name}</span>
                  <Tag t={c.subject} />
                  <select className="bg-[#191919] border border-[#2f2f2f] rounded px-1 py-0.5 text-[11px] w-16" title="Weightage" value={c.w || 'Med'} onChange={(e) => setSyl(syl.map((x) => x.id === c.id ? { ...x, w: e.target.value } : x))}>
                    {['High', 'Med', 'Low'].map((w) => <option key={w}>{w}</option>)}
                  </select>
                  <Tag t={derive(c, tasks).status} onClick={() => bump(c)} />
                  <button className="text-zinc-500 hover:text-red-400" onClick={() => setSyl(syl.filter((x) => x.id !== c.id))}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Panel>
  )
}
