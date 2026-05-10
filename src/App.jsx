import { useState, useRef } from "react";

const todayStr = () => new Date().toISOString().slice(0, 10);
const uid = () => Date.now() + Math.floor(Math.random() * 9999);
const fmt = (n) => new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n) + " ₽";
const fmtShort = (n) => { if (Math.abs(n) >= 1000000) return (n / 1000000).toFixed(1) + "М ₽"; if (Math.abs(n) >= 1000) return Math.round(n / 1000) + "К ₽"; return n + " ₽"; };
const fmtDate = (iso) => { if (!iso) return ""; const [y, m, d] = iso.split("-"); return `${d}.${m}.${y}`; };
const pct = (a, b) => b === 0 ? 0 : Math.min(100, Math.round((a / b) * 100));

const CONTRACTOR_TYPES = ["Заказчик", "Подрядчик", "Поставщик", "Сотрудник"];
const PROJECT_COLORS = ["#E8643A", "#3A7FE8", "#5BC47A", "#C45BB8", "#E8B83A", "#3AC4C4"];
const CTAG_COLORS = { "Заказчик": { bg: "#E3F2FD", color: "#1565C0" }, "Подрядчик": { bg: "#FFF3E0", color: "#E65100" }, "Поставщик": { bg: "#F3E5F5", color: "#6A1B9A" }, "Сотрудник": { bg: "#E8F5E9", color: "#2E7D32" } };
const EV_COLORS = { "Поступление": "#388E3C", "Отчёт": "#1976D2", "Перевод": "#E53935", "Смета": "#7B1FA2" };
const EV_ICONS = { "Поступление": "↓", "Отчёт": "≡", "Перевод": "↑", "Смета": "◻" };

const INIT_CONTRACTORS = [
  { id: 1, name: "Иванов А.В.", type: "Заказчик", phone: "+7 900 123-45-67", note: "Квартира Ленина 12" },
  { id: 2, name: "Бригада Петрова", type: "Подрядчик", phone: "+7 900 234-56-78", note: "" },
  { id: 3, name: "Электрик Сидоров", type: "Подрядчик", phone: "+7 900 345-67-89", note: "" },
  { id: 4, name: "СтройМаг", type: "Поставщик", phone: "+7 900 456-78-90", note: "Скидка 5%" },
  { id: 5, name: "Козлов М.П.", type: "Сотрудник", phone: "+7 900 567-89-01", note: "Прораб" },
];

const INIT_PRICELISTS = [
  {
    id: 1, name: "Отделочные работы",
    items: [
      { id: 1, name: "Штукатурка стен", unit: "м²", price: 650 },
      { id: 2, name: "Шпаклёвка стен", unit: "м²", price: 450 },
      { id: 3, name: "Поклейка обоев", unit: "м²", price: 350 },
      { id: 4, name: "Покраска стен", unit: "м²", price: 300 },
    ],
  },
  {
    id: 2, name: "Напольные работы",
    items: [
      { id: 1, name: "Укладка плитки", unit: "м²", price: 1200 },
      { id: 2, name: "Укладка ламината", unit: "м²", price: 600 },
      { id: 3, name: "Стяжка пола", unit: "м²", price: 500 },
    ],
  },
];

const INIT_PROJECTS = [
  {
    id: 1, name: "Квартира на Ленина, 12", client: "Иванов А.В.", color: "#E8643A", budget: 850000, expenses: 310000,
    events: [
      { id: 1, type: "Поступление", date: "2025-08-10", amount: 200000, note: "Аванс 1" },
      { id: 2, type: "Перевод", date: "2025-08-15", amount: 45000, note: "Бригада Петрова — аванс" },
      { id: 3, type: "Отчёт", date: "2025-08-20", amount: 45000, note: "Демонтаж завершён" },
    ],
    costItems: [
      { id: 1, name: "Демонтажные работы", executor: "Бригада Петрова", price: 45000, expenses: 12000, works: "Снос перегородок, вывоз мусора", done: true, progress: 100, payments: [{ id: 1, date: "2025-08-10", amount: 20000, note: "Аванс" }, { id: 2, date: "2025-08-20", amount: 25000, note: "Финал" }] },
      { id: 2, name: "Электрика", executor: "Электрик Сидоров", price: 120000, expenses: 85000, works: "Разводка, щиток, розетки", done: false, progress: 60, payments: [{ id: 1, date: "2025-08-15", amount: 40000, note: "Аванс" }] },
    ],
    participants: [
      { id: 1, contractorId: 2, role: "Подрядчик", agentFee: 0 },
      { id: 2, contractorId: 5, role: "Прораб", agentFee: 15000 },
    ],
    photos: [],
    agentFees: [{ id: 1, name: "Козлов М.П.", amount: 15000, date: "2025-08-01", note: "Агентское" }],
  },
  {
    id: 2, name: "Офис на Пушкина, 5", client: "ООО «Ромашка»", color: "#3A7FE8", budget: 1200000, expenses: 520000,
    events: [
      { id: 1, type: "Поступление", date: "2025-07-01", amount: 600000, note: "Аванс 50%" },
    ],
    costItems: [
      { id: 1, name: "Сантехника", executor: "СантехМастер", price: 200000, expenses: 180000, works: "Разводка труб", done: true, progress: 100, payments: [{ id: 1, date: "2025-07-01", amount: 100000, note: "Аванс" }, { id: 2, date: "2025-07-20", amount: 100000, note: "Финал" }] },
    ],
    participants: [],
    photos: [],
    agentFees: [],
  },
];

// ── CSS ───────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
  ::-webkit-scrollbar{display:none}
  body{background:#0d0d0d}

  .phone{width:390px;height:844px;background:#F0EEE9;border-radius:50px;overflow:hidden;position:relative;box-shadow:0 40px 100px #000000bb,inset 0 0 0 1.5px #ffffff18;display:flex;flex-direction:column;font-family:'DM Sans',sans-serif}
  .screen{flex:1;overflow-y:auto;overflow-x:hidden}
  .sbar{height:50px;display:flex;align-items:flex-end;justify-content:space-between;padding:0 28px 8px;flex-shrink:0}
  .bnav{height:82px;background:#fff;border-top:1px solid #ebebeb;display:flex;align-items:flex-start;justify-content:space-around;padding-top:10px;flex-shrink:0}
  .ni{display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;padding:4px 12px;border-radius:10px;transition:background .15s}
  .ni:active{background:#f5f5f5}

  /* Cards */
  .card{background:#fff;border-radius:20px;margin:8px 16px 0;padding:16px;cursor:pointer;transition:opacity .15s}
  .card:active{opacity:.82}
  .icard{background:#fff;border-radius:14px;margin:0 16px 8px;padding:14px;cursor:pointer;transition:opacity .15s}
  .icard:active{opacity:.8}

  /* Bars */
  .bar{border-radius:100px;overflow:hidden}
  .barfill{height:100%;border-radius:100px;transition:width .3s}

  /* Badges */
  .badge{display:inline-block;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:500}

  /* Section header */
  .sec{display:flex;justify-content:space-between;align-items:center;padding:16px 16px 8px}
  .sectl{font-size:12px;font-weight:600;color:#999;letter-spacing:.6px;text-transform:uppercase}
  .secact{font-size:13px;color:#E8643A;font-weight:500;cursor:pointer}

  /* Summary dark card */
  .sumcard{background:#1C1C1E;border-radius:22px;padding:20px;margin:12px 16px 0;color:#fff}

  /* Overlay & Sheet */
  .overlay{position:absolute;inset:0;background:#00000065;z-index:50;display:flex;flex-direction:column;justify-content:flex-end;animation:fIn .2s}
  .sheet{background:#F0EEE9;border-radius:26px 26px 0 0;padding:0 18px 44px;max-height:94%;overflow-y:auto;animation:sUp .28s cubic-bezier(.32,1.1,.68,1)}
  .handle{width:36px;height:4px;background:#d4d0ca;border-radius:2px;margin:10px auto 18px}
  @keyframes fIn{from{opacity:0}to{opacity:1}}
  @keyframes sUp{from{transform:translateY(100%)}to{transform:translateY(0)}}

  /* Form */
  .field{margin-bottom:12px}
  .flabel{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px;font-weight:600;display:flex;justify-content:space-between;align-items:center}
  .field input,.field select,.field textarea{width:100%;background:#fff;border:1.5px solid #E5E3DE;border-radius:11px;padding:12px 13px;font-family:inherit;font-size:15px;color:#1a1a1a;outline:none;transition:border-color .2s;-webkit-appearance:none}
  .field input:focus,.field select:focus,.field textarea:focus{border-color:#E8643A}
  .frow{display:flex;gap:8px}
  .frow .field{flex:1}
  input[type=range]{-webkit-appearance:none;width:100%;height:6px;border-radius:3px;background:#E0DDD8;outline:none;cursor:pointer}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:#E8643A;cursor:pointer;box-shadow:0 2px 6px #E8643A44}

  /* Buttons */
  .bp{background:#E8643A;color:#fff;border:none;border-radius:13px;padding:15px;font-size:16px;font-weight:600;font-family:inherit;width:100%;cursor:pointer;margin-top:8px;transition:opacity .15s}
  .bp:disabled{background:#ddd;color:#aaa}
  .bp:active{opacity:.85}
  .bs{background:#fff;color:#1a1a1a;border:1.5px solid #E5E3DE;border-radius:13px;padding:13px;font-size:15px;font-family:inherit;width:100%;cursor:pointer;margin-top:8px}
  .bdel{color:#E53935;font-size:14px;font-weight:500;text-align:center;display:block;cursor:pointer;padding:12px}
  .cdot{width:30px;height:30px;border-radius:50%;cursor:pointer;border:3px solid transparent;transition:transform .15s}
  .cdot.sel{border-color:#1a1a1a;transform:scale(1.15)}

  /* Tab bar inside project */
  .ptabs{display:flex;overflow-x:auto;gap:6px;padding:8px 16px 0;flex-shrink:0}
  .ptabs::-webkit-scrollbar{display:none}
  .ptab{white-space:nowrap;padding:7px 14px;border-radius:20px;font-size:13px;font-weight:500;cursor:pointer;background:#fff;color:#888;border:1.5px solid #E5E3DE;transition:all .15s;flex-shrink:0}
  .ptab.active{background:#E8643A;color:#fff;border-color:#E8643A}

  /* Event row */
  .evrow{background:#fff;border-radius:13px;margin:0 16px 8px;padding:13px 14px;display:flex;align-items:center;gap:12px;cursor:pointer}
  .evrow:active{opacity:.8}
  .evicon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;flex-shrink:0}

  /* Cost item card */
  .cicard{background:#fff;border-radius:14px;margin:0 16px 8px;padding:14px;cursor:pointer}
  .cicard:active{opacity:.8}

  /* Participant row */
  .prow{background:#fff;border-radius:13px;margin:0 16px 8px;padding:13px 14px;display:flex;align-items:center;gap:12px}
  .avatar{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#fff;flex-shrink:0}

  /* Photo grid */
  .photogrid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:3px;margin:0 16px}
  .phototile{border-radius:8px;overflow:hidden;aspect-ratio:1;background:#e8e5e0;display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative}
  .phototile img{width:100%;height:100%;object-fit:cover}
  .photoadd{border:2px dashed #C8C4BE;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:4px;aspect-ratio:1;border-radius:8px;background:#F8F6F3}

  /* Contractor card */
  .ctcard{background:#fff;border-radius:14px;margin:0 16px 8px;padding:14px;display:flex;align-items:center;gap:12px;cursor:pointer}
  .ctcard:active{opacity:.8}

  /* Pricelist */
  .plcard{background:#fff;border-radius:14px;margin:0 16px 8px;padding:14px;cursor:pointer}
  .plrow{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid #F2F0EB}
  .plrow:last-child{border-bottom:none}

  /* Detail sections */
  .dsec{background:#fff;border-radius:14px;padding:14px;margin-bottom:8px}
  .dstitle{font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:.8px;font-weight:600;margin-bottom:10px}
  .fline{display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid #F5F3EF}
  .fline:last-child{border-bottom:none}

  /* Pay row */
  .payrow{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #F5F3EF}
  .payrow:last-of-type{border-bottom:none}
  .payadd{background:#F8F6F3;border-radius:11px;padding:11px;margin-top:10px}
  .pi{background:#fff;border:1.5px solid #E5E3DE;border-radius:9px;padding:9px 11px;font-family:inherit;font-size:14px;color:#1a1a1a;outline:none;-webkit-appearance:none}
  .pi:focus{border-color:#E8643A}

  /* FAB */
  .fab{position:absolute;bottom:92px;right:20px;width:54px;height:54px;background:#E8643A;border-radius:16px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 6px 20px #E8643A55;z-index:10;transition:transform .15s}
  .fab:active{transform:scale(.92)}

  /* Estimate */
  .estrow{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #F5F3EF}
  .estrow:last-child{border-bottom:none}
  .estcheck{width:22px;height:22px;border-radius:6px;border:2px solid #E5E3DE;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:all .15s}
  .estcheck.on{background:#E8643A;border-color:#E8643A}

  .empty{text-align:center;padding:40px 20px;color:#bbb}
  .back{font-size:15px;color:#E8643A;cursor:pointer;padding:4px 0}
  .tag{display:inline-block;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:500}
`;

// ── APP ───────────────────────────────────────────────────────
export default function App() {
  const [projects, setProjects] = useState(INIT_PROJECTS);
  const [contractors, setContractors] = useState(INIT_CONTRACTORS);
  const [pricelists, setPricelists] = useState(INIT_PRICELISTS);

  // Navigation
  const [mainTab, setMainTab] = useState("home"); // home | contractors | pricelists
  const [projId, setProjId] = useState(null);
  const [projTab, setProjTab] = useState("events"); // events | costs | participants | photos | pricelists | agents
  const [sheet, setSheet] = useState(null);
  const [sheetData, setSheetData] = useState({});

  const photoRef = useRef();

  const proj = projects.find(p => p.id === projId);
  const totalPaid = projects.reduce((s, p) => s + p.events.filter(e => e.type === "Поступление").reduce((ss, e) => ss + e.amount, 0), 0);
  const totalExp = projects.reduce((s, p) => s + p.expenses, 0);

  // ── Helpers ──
  const updProj = (id, fn) => setProjects(prev => prev.map(p => p.id === id ? fn(p) : p));

  const openProj = (id) => { setProjId(id); setProjTab("events"); setMainTab("project"); };

  const closeSheet = () => { setSheet(null); setSheetData({}); };

  // ── Project mutations ──
  const addEvent = (ev) => updProj(projId, p => ({ ...p, events: [...p.events, { ...ev, id: uid() }] }));
  const delEvent = (eid) => updProj(projId, p => ({ ...p, events: p.events.filter(e => e.id !== eid) }));

  const addCostItem = (ci) => updProj(projId, p => ({ ...p, costItems: [...p.costItems, { ...ci, id: uid(), payments: [], progress: 0, done: false }] }));
  const updCostItem = (ci) => updProj(projId, p => ({ ...p, costItems: p.costItems.map(c => c.id === ci.id ? ci : c) }));
  const delCostItem = (cid) => updProj(projId, p => ({ ...p, costItems: p.costItems.filter(c => c.id !== cid) }));

  const addPayment = (cid, pay) => updProj(projId, p => ({ ...p, costItems: p.costItems.map(c => c.id === cid ? { ...c, payments: [...c.payments, { ...pay, id: uid() }] } : c) }));
  const delPayment = (cid, pid) => updProj(projId, p => ({ ...p, costItems: p.costItems.map(c => c.id === cid ? { ...c, payments: c.payments.filter(pp => pp.id !== pid) } : c) }));
  const setProgress = (cid, val) => updProj(projId, p => ({ ...p, costItems: p.costItems.map(c => c.id === cid ? { ...c, progress: val } : c) }));

  const addParticipant = (par) => updProj(projId, p => ({ ...p, participants: [...p.participants, { ...par, id: uid() }] }));
  const delParticipant = (pid) => updProj(projId, p => ({ ...p, participants: p.participants.filter(pp => pp.id !== pid) }));

  const addAgentFee = (af) => updProj(projId, p => ({ ...p, agentFees: [...p.agentFees, { ...af, id: uid() }] }));
  const delAgentFee = (aid) => updProj(projId, p => ({ ...p, agentFees: p.agentFees.filter(a => a.id !== aid) }));

  const addPhoto = (dataUrl) => updProj(projId, p => ({ ...p, photos: [...p.photos, { id: uid(), url: dataUrl, date: todayStr() }] }));
  const delPhoto = (phid) => updProj(projId, p => ({ ...p, photos: p.photos.filter(ph => ph.id !== phid) }));

  // ── Contractors ──
  const addContractor = (ct) => setContractors(prev => [...prev, { ...ct, id: uid() }]);
  const delContractor = (cid) => setContractors(prev => prev.filter(c => c.id !== cid));

  // ── Pricelists ──
  const addPricelist = (pl) => setPricelists(prev => [...prev, { ...pl, id: uid(), items: [] }]);
  const addPlItem = (plid, item) => setPricelists(prev => prev.map(pl => pl.id === plid ? { ...pl, items: [...pl.items, { ...item, id: uid() }] } : pl));
  const delPlItem = (plid, iid) => setPricelists(prev => prev.map(pl => pl.id === plid ? { ...pl, items: pl.items.filter(i => i.id !== iid) } : pl));

  // ── Photo upload ──
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { addPhoto(ev.target.result); };
    reader.readAsDataURL(file);
  };

  // ── Estimate builder ──
  const [estSelections, setEstSelections] = useState({});
  const [estQty, setEstQty] = useState({});
  const toggleEstItem = (plid, iid) => {
    const key = `${plid}-${iid}`;
    setEstSelections(prev => ({ ...prev, [key]: !prev[key] }));
    if (!estQty[key]) setEstQty(prev => ({ ...prev, [key]: 1 }));
  };
  const estTotal = () => {
    let total = 0;
    pricelists.forEach(pl => pl.items.forEach(it => {
      const key = `${pl.id}-${it.id}`;
      if (estSelections[key]) total += it.price * (estQty[key] || 1);
    }));
    return total;
  };
  const estLines = () => {
    const lines = [];
    pricelists.forEach(pl => pl.items.forEach(it => {
      const key = `${pl.id}-${it.id}`;
      if (estSelections[key]) lines.push({ name: it.name, unit: it.unit, qty: estQty[key] || 1, price: it.price });
    }));
    return lines;
  };
  const printEstimate = () => {
    if (!proj) return;
    const lines = estLines();
    const rows = lines.map(l => `<tr><td>${l.name}</td><td>${l.unit}</td><td>${l.qty}</td><td>${l.price.toLocaleString("ru-RU")} ₽</td><td>${(l.qty * l.price).toLocaleString("ru-RU")} ₽</td></tr>`).join("");
    const html = `<html><head><meta charset="utf-8"><title>Смета</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#222}h2{margin-bottom:4px}p{color:#777;margin-bottom:24px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px 12px;text-align:left}th{background:#f5f5f5}tfoot td{font-weight:700;background:#fff8f0}</style></head><body><h2>Смета</h2><p>Объект: ${proj.name} · Заказчик: ${proj.client}</p><table><thead><tr><th>Наименование</th><th>Ед.</th><th>Кол-во</th><th>Цена</th><th>Сумма</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><td colspan="4">Итого</td><td>${estTotal().toLocaleString("ru-RU")} ₽</td></tr></tfoot></table></body></html>`;
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 400);
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#0d0d0d" }}>
      <style>{CSS}</style>
      <div className="phone">
        {/* Status bar */}
        <div className="sbar">
          <span style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>9:41</span>
          <span style={{ fontSize: 12, color: "#1a1a1a", letterSpacing: 1 }}>●●● 5G ▮▮▮</span>
        </div>

        <div className="screen">

          {/* ══ HOME ══════════════════════════════════════════ */}
          {mainTab === "home" && (<>
            <div style={{ padding: "12px 16px 0" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#1a1a1a", letterSpacing: -.5 }}>Главная</div>
            </div>

            <div className="sumcard">
              <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: .5, marginBottom: 3 }}>Общая маржа</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: (totalPaid - totalExp) >= 0 ? "#5BC47A" : "#E8643A", letterSpacing: -1 }}>{fmtShort(totalPaid - totalExp)}</div>
              <div style={{ display: "flex", marginTop: 14 }}>
                {[{ l: "Получено", v: fmtShort(totalPaid), c: "#5BC47A" }, { l: "Расходы", v: fmtShort(totalExp), c: "#E8643A" }, { l: "Объектов", v: projects.length, c: "#888" }].map((s, i) => (
                  <div key={s.l} s
