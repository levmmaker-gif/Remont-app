import { useState, useRef } from "react";

const todayStr = () => new Date().toISOString().slice(0, 10);
const uid = () => Date.now() + Math.floor(Math.random() * 9999);
const fmt = (n) => new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n) + " руб.";
const fmtS = (n) => {
  if (Math.abs(n) >= 1000000) return (n / 1000000).toFixed(1) + "М руб.";
  if (Math.abs(n) >= 1000) return Math.round(n / 1000) + "К руб.";
  return n + " руб.";
};
const fmtD = (iso) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
};
const pct = (a, b) => (b === 0 ? 0 : Math.min(100, Math.round((a / b) * 100)));

const COLORS = ["#E8643A","#3A7FE8","#5BC47A","#C45BB8","#E8B83A","#3AC4C4"];
const CT = { Заказчик:{bg:"#E3F2FD",c:"#1565C0"}, Подрядчик:{bg:"#FFF3E0",c:"#E65100"}, Поставщик:{bg:"#F3E5F5",c:"#6A1B9A"}, Сотрудник:{bg:"#E8F5E9",c:"#2E7D32"} };
const EVC = { Поступление:"#388E3C", Отчёт:"#1976D2", Перевод:"#E53935", Смета:"#7B1FA2" };
const EVI = { Поступление:"v", Отчёт:"=", Перевод:"^", Смета:"o" };

const INIT_CT = [
  { id:1, name:"Иванов А.В.", type:"Заказчик", phone:"+7 900 123-45-67", note:"" },
  { id:2, name:"Бригада Петрова", type:"Подрядчик", phone:"+7 900 234-56-78", note:"" },
  { id:3, name:"Электрик Сидоров", type:"Подрядчик", phone:"+7 900 345-67-89", note:"" },
  { id:4, name:"СтройМаг", type:"Поставщик", phone:"+7 900 456-78-90", note:"Скидка 5%" },
  { id:5, name:"Козлов М.П.", type:"Сотрудник", phone:"+7 900 567-89-01", note:"Прораб" },
];
const INIT_PL = [
  { id:1, name:"Отделочные работы", items:[
    { id:1, name:"Штукатурка стен", unit:"м2", price:650 },
    { id:2, name:"Шпаклёвка стен", unit:"м2", price:450 },
    { id:3, name:"Покраска стен", unit:"м2", price:300 },
  ]},
  { id:2, name:"Напольные работы", items:[
    { id:1, name:"Укладка плитки", unit:"м2", price:1200 },
    { id:2, name:"Укладка ламината", unit:"м2", price:600 },
  ]},
];
const INIT_PRJ = [
  { id:1, name:"Квартира на Ленина, 12", client:"Иванов А.В.", color:"#E8643A", budget:850000, expenses:310000,
    events:[
      { id:1, type:"Поступление", date:"2025-08-10", amount:200000, note:"Аванс 1" },
      { id:2, type:"Перевод", date:"2025-08-15", amount:45000, note:"Бригада Петрова" },
      { id:3, type:"Отчёт", date:"2025-08-20", amount:0, note:"Демонтаж завершён" },
    ],
    costItems:[
      { id:1, name:"Демонтажные работы", executor:"Бригада Петрова", price:45000, expenses:12000, works:"Снос перегородок", done:true, progress:100,
        payments:[{ id:1, date:"2025-08-10", amount:20000, note:"Аванс" },{ id:2, date:"2025-08-20", amount:25000, note:"Финал" }] },
      { id:2, name:"Электрика", executor:"Электрик Сидоров", price:120000, expenses:85000, works:"Разводка, щиток", done:false, progress:60,
        payments:[{ id:1, date:"2025-08-15", amount:40000, note:"Аванс" }] },
    ],
    participants:[{ id:1, contractorId:2, role:"Подрядчик", agentFee:0 },{ id:2, contractorId:5, role:"Прораб", agentFee:15000 }],
    photos:[], agentFees:[{ id:1, name:"Козлов М.П.", amount:15000, date:"2025-08-01", note:"Агентское" }],
  },
  { id:2, name:"Офис на Пушкина, 5", client:"ООО "Ромашка"", color:"#3A7FE8", budget:1200000, expenses:520000,
    events:[{ id:1, type:"Поступление", date:"2025-07-01", amount:600000, note:"Аванс 50%" }],
    costItems:[{ id:1, name:"Сантехника", executor:"СантехМастер", price:200000, expenses:180000, works:"Разводка труб", done:true, progress:100,
      payments:[{ id:1, date:"2025-07-01", amount:100000, note:"Аванс" },{ id:2, date:"2025-07-20", amount:100000, note:"Финал" }] }],
    participants:[], photos:[], agentFees:[],
  },
];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
::-webkit-scrollbar{display:none}
.phone{width:390px;height:844px;background:#F0EEE9;border-radius:50px;overflow:hidden;position:relative;
  box-shadow:0 40px 100px #000000bb,inset 0 0 0 1.5px #ffffff18;display:flex;flex-direction:column;
  font-family:'DM Sans',sans-serif}
.screen{flex:1;overflow-y:auto;overflow-x:hidden}
.sbar{height:50px;display:flex;align-items:flex-end;justify-content:space-between;padding:0 28px 8px;flex-shrink:0}
.bnav{height:82px;background:#fff;border-top:1px solid #ebebeb;display:flex;align-items:flex-start;
  justify-content:space-around;padding-top:10px;flex-shrink:0}
.ni{display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;padding:4px 12px}
.card{background:#fff;border-radius:20px;margin:8px 16px 0;padding:16px;cursor:pointer}
.card:active{opacity:.82}
.bar{border-radius:100px;overflow:hidden}
.bf{height:100%;border-radius:100px;transition:width .3s}
.badge{display:inline-block;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:500}
.sec{display:flex;justify-content:space-between;align-items:center;padding:14px 16px 6px}
.sectl{font-size:12px;font-weight:600;color:#999;letter-spacing:.6px;text-transform:uppercase}
.secact{font-size:13px;color:#E8643A;font-weight:500;cursor:pointer}
.sumcard{background:#1C1C1E;border-radius:22px;padding:20px;margin:12px 16px 0;color:#fff}
.overlay{position:absolute;inset:0;background:#00000065;z-index:50;display:flex;flex-direction:column;
  justify-content:flex-end;animation:fIn .2s}
.sheet{background:#F0EEE9;border-radius:26px 26px 0 0;padding:0 18px 44px;max-height:94%;
  overflow-y:auto;animation:sUp .28s cubic-bezier(.32,1.1,.68,1)}
.handle{width:36px;height:4px;background:#d4d0ca;border-radius:2px;margin:10px auto 18px}
@keyframes fIn{from{opacity:0}to{opacity:1}}
@keyframes sUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
.field{margin-bottom:12px}
.flabel{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px;
  font-weight:600;display:flex;justify-content:space-between;align-items:center}
.fi{width:100%;background:#fff;border:1.5px solid #E5E3DE;border-radius:11px;padding:12px 13px;
  font-family:inherit;font-size:15px;color:#1a1a1a;outline:none;transition:border-color .2s;-webkit-appearance:none}
.fi:focus{border-color:#E8643A}
.frow2{display:flex;gap:8px}
.frow2 .field{flex:1}
input[type=range]{-webkit-appearance:none;width:100%;height:6px;border-radius:3px;background:#E0DDD8;outline:none;cursor:pointer}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;
  background:#E8643A;cursor:pointer;box-shadow:0 2px 6px #E8643A44}
.bp{background:#E8643A;color:#fff;border:none;border-radius:13px;padding:15px;font-size:16px;font-weight:600;
  font-family:inherit;width:100%;cursor:pointer;margin-top:8px}
.bp:disabled{background:#ddd;color:#aaa}
.bs{background:#fff;color:#1a1a1a;border:1.5px solid #E5E3DE;border-radius:13px;padding:13px;font-size:15px;
  font-family:inherit;width:100%;cursor:pointer;margin-top:8px}
.bdel{color:#E53935;font-size:14px;font-weight:500;text-align:center;display:block;cursor:pointer;padding:12px}
.cdot{width:30px;height:30px;border-radius:50%;cursor:pointer;border:3px solid transparent;transition:transform .15s}
.cdot.sel{border-color:#1a1a1a;transform:scale(1.15)}
.ptabs{display:flex;overflow-x:auto;gap:6px;padding:8px 16px 0;flex-shrink:0}
.ptabs::-webkit-scrollbar{display:none}
.ptab{white-space:nowrap;padding:7px 14px;border-radius:20px;font-size:13px;font-weight:500;cursor:pointer;
  background:#fff;color:#888;border:1.5px solid #E5E3DE;flex-shrink:0}
.ptab.active{background:#E8643A;color:#fff;border-color:#E8643A}
.evrow{background:#fff;border-radius:13px;margin:0 16px 8px;padding:13px 14px;display:flex;align-items:center;gap:12px;cursor:pointer}
.evicon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;
  font-size:15px;font-weight:700;flex-shrink:0}
.cicard{background:#fff;border-radius:14px;margin:0 16px 8px;padding:14px;cursor:pointer}
.cicard:active{opacity:.8}
.prow{background:#fff;border-radius:13px;margin:0 16px 8px;padding:13px 14px;display:flex;align-items:center;gap:12px}
.photogrid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:3px;margin:0 16px}
.phototile{border-radius:8px;overflow:hidden;aspect-ratio:1;background:#e8e5e0;cursor:pointer}
.phototile img{width:100%;height:100%;object-fit:cover;display:block}
.photoadd{border:2px dashed #C8C4BE;cursor:pointer;display:flex;align-items:center;justify-content:center;
  flex-direction:column;gap:4px;aspect-ratio:1;border-radius:8px;background:#F8F6F3}
.ctcard{background:#fff;border-radius:14px;margin:0 16px 8px;padding:14px;display:flex;align-items:center;gap:12px;cursor:pointer}
.plcard{background:#fff;border-radius:14px;margin:0 16px 8px;padding:14px;cursor:pointer}
.plrow{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid #F2F0EB}
.plrow:last-child{border-bottom:none}
.dsec{background:#fff;border-radius:14px;padding:14px;margin-bottom:8px}
.dstitle{font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:.8px;font-weight:600;margin-bottom:10px}
.fline{display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid #F5F3EF}
.fline:last-child{border-bottom:none}
.payrow{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #F5F3EF}
.payrow:last-of-type{border-bottom:none}
.payadd{background:#F8F6F3;border-radius:11px;padding:11px;margin-top:10px}
.pi{background:#fff;border:1.5px solid #E5E3DE;border-radius:9px;padding:9px 11px;font-family:inherit;
  font-size:14px;color:#1a1a1a;outline:none;-webkit-appearance:none}
.pi:focus{border-color:#E8643A}
.fab{position:absolute;bottom:92px;right:20px;width:54px;height:54px;background:#E8643A;border-radius:16px;
  display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 6px 20px #E8643A55;z-index:10}
.fab:active{transform:scale(.92)}
.estrow{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #F5F3EF}
.estrow:last-child{border-bottom:none}
.estcheck{width:22px;height:22px;border-radius:6px;border:2px solid #E5E3DE;display:flex;align-items:center;
  justify-content:center;cursor:pointer;flex-shrink:0}
.estcheck.on{background:#E8643A;border-color:#E8643A}
.tag{display:inline-block;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:500}
.empty{text-align:center;padding:36px 20px;color:#bbb}
.back{font-size:15px;color:#E8643A;cursor:pointer;padding:4px 0}
`;

// Sub-components to avoid IIFE in JSX
function ProjectCard({ p, onClick }) {
  const paid = p.events.filter(e => e.type === "Поступление").reduce((s, e) => s + e.amount, 0);
  const profit = paid - p.expenses;
  return (
    <div className="card" onClick={onClick}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            <span style={{ width:9, height:9, borderRadius:"50%", background:p.color, display:"inline-block" }} />
            <span style={{ fontSize:15, fontWeight:600, color:"#1a1a1a" }}>{p.name}</span>
          </div>
          <div style={{ fontSize:12, color:"#999", marginTop:2 }}>{p.client} - {p.costItems.length} статей</div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:14, fontWeight:600, color:profit>=0?"#388E3C":"#E53935" }}>{fmtS(profit)}</div>
          <div style={{ fontSize:10, color:"#bbb", marginTop:1 }}>маржа</div>
        </div>
      </div>
      <div className="bar" style={{ background:"#F0EEE9", height:5, marginTop:12 }}>
        <div className="bf" style={{ width:`${pct(paid,p.budget)}%`, background:p.color }} />
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:8 }}>
        {[{l:"Получено",v:fmtS(paid),c:"#388E3C"},{l:"Расходы",v:fmtS(p.expenses),c:"#E53935"},{l:"Бюджет",v:fmtS(p.budget),c:"#1a1a1a"}].map(s => (
          <div key={s.l}>
            <div style={{ fontSize:9, color:"#bbb", textTransform:"uppercase" }}>{s.l}</div>
            <div style={{ fontSize:12, fontWeight:500, color:s.c, marginTop:1 }}>{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjHeader({ proj }) {
  const paid = proj.events.filter(e => e.type === "Поступление").reduce((s, e) => s + e.amount, 0);
  const profit = paid - proj.expenses;
  return (
    <div style={{ background:proj.color, borderRadius:18, margin:"0 16px 8px", padding:18 }}>
      <div style={{ color:"#fff9", fontSize:10, textTransform:"uppercase", letterSpacing:.5, marginBottom:3 }}>Маржа проекта</div>
      <div style={{ color:"#fff", fontSize:22, fontWeight:700, letterSpacing:-1 }}>{fmtS(profit)}</div>
      <div style={{ display:"flex", gap:14, marginTop:12 }}>
        {[{l:"Бюджет",v:fmtS(proj.budget),c:"#fff9"},{l:"Получено",v:fmtS(paid),c:"#fff"},{l:"Расходы",v:fmtS(proj.expenses),c:"#ffcccc"}].map(s => (
          <div key={s.l}>
            <div style={{ color:"#fff9", fontSize:9, textTransform:"uppercase" }}>{s.l}</div>
            <div style={{ color:s.c, fontSize:13, fontWeight:600, marginTop:1 }}>{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CostCard({ ci, projColor, onClick }) {
  const iPaid = ci.payments.reduce((s, p) => s + p.amount, 0);
  return (
    <div className="cicard" onClick={onClick}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14, fontWeight:600, color:"#1a1a1a" }}>{ci.name}</div>
          <div style={{ fontSize:12, color:"#999", marginTop:2 }}>{ci.executor}</div>
        </div>
        <span className="badge" style={ci.done?{background:"#E8F5E9",color:"#388E3C"}:{background:"#FFF3E0",color:"#E65100"}}>
          {ci.done?"Готово":"В работе"}
        </span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:10 }}>
        <span style={{ fontSize:11, color:"#bbb" }}>Выполнено</span>
        <div className="bar" style={{ flex:1, background:"#F0EEE9", height:6 }}>
          <div className="bf" style={{ width:`${ci.progress}%`, background:ci.progress===100?"#388E3C":projColor }} />
        </div>
        <span style={{ fontSize:11, fontWeight:700, color:"#555", minWidth:30 }}>{ci.progress}%</span>
      </div>
      {ci.price > 0 && (
        <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:5 }}>
          <span style={{ fontSize:11, color:"#bbb" }}>Получено</span>
          <div className="bar" style={{ flex:1, background:"#E8F5E9", height:6 }}>
            <div className="bf" style={{ width:`${pct(iPaid,ci.price)}%`, background:"#5BC47A" }} />
          </div>
          <span style={{ fontSize:11, fontWeight:700, color:"#388E3C", minWidth:30 }}>{pct(iPaid,ci.price)}%</span>
        </div>
      )}
      <div style={{ display:"flex", gap:6, marginTop:10 }}>
        {[{l:"Стоимость",v:fmtS(ci.price),c:"#1a1a1a"},{l:"Получено",v:fmtS(iPaid),c:"#388E3C"},{l:"Расходы",v:fmtS(ci.expenses),c:"#E53935"}].map(s => (
          <div key={s.l} style={{ flex:1 }}>
            <div style={{ fontSize:9, color:"#bbb", textTransform:"uppercase" }}>{s.l}</div>
            <div style={{ fontSize:12, fontWeight:500, color:s.c, marginTop:1 }}>{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CostSheet({ ci, proj, onClose, onDelete, onProgress, onAddPayment, onDelPayment, onToggleDone, fPayment, setFPayment }) {
  const iPaid = ci.payments.reduce((s, p) => s + p.amount, 0);
  const sorted = [...ci.payments].sort((a,b) => a.date.localeCompare(b.date));
  const pColor = ci.progress === 100 ? "#388E3C" : "#E8643A";
  const margin = iPaid - ci.expenses;
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="handle" />
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
          <div style={{ flex:1, paddingRight:10 }}>
            <div style={{ fontSize:18, fontWeight:700, color:"#1a1a1a", marginBottom:2 }}>{ci.name}</div>
            <div style={{ fontSize:13, color:"#999" }}>{ci.executor}</div>
          </div>
          <span className="badge" style={ci.done?{background:"#E8F5E9",color:"#388E3C"}:{background:"#FFF3E0",color:"#E65100"}}>
            {ci.done?"Готово":"В работе"}
          </span>
        </div>

        <div className="dsec" style={{ marginBottom:8 }}>
          <div className="dstitle">Прогресс выполнения</div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:8 }}>
            <div style={{ fontSize:32, fontWeight:700, color:pColor, letterSpacing:-1 }}>{ci.progress}%</div>
            {ci.price > 0 && (
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:14, fontWeight:600, color:pColor }}>{fmt(Math.round(ci.price * ci.progress / 100))}</div>
                <div style={{ fontSize:11, color:"#bbb" }}>из {fmt(ci.price)}</div>
              </div>
            )}
          </div>
          <div className="bar" style={{ background:"#F0EEE9", height:9, marginBottom:10 }}>
            <div className="bf" style={{ width:`${ci.progress}%`, background:pColor }} />
          </div>
          <input type="range" min="0" max="100" step="5" value={ci.progress} onChange={e => onProgress(+e.target.value)} />
        </div>

        <div className="dsec" style={{ marginBottom:8 }}>
          <div className="dstitle">Финансы</div>
          <div className="fline"><span style={{ fontSize:13, color:"#555" }}>Общая стоимость работ</span><span style={{ fontSize:14, fontWeight:600 }}>{fmt(ci.price)}</span></div>
          <div className="fline"><span style={{ fontSize:13, color:"#555" }}>Всего выплачено заказчиком</span><span style={{ fontSize:14, fontWeight:600, color:"#388E3C" }}>{fmt(iPaid)}</span></div>
          <div className="fline"><span style={{ fontSize:13, color:"#555" }}>Расходы</span><span style={{ fontSize:14, fontWeight:600, color:"#E53935" }}>{fmt(ci.expenses)}</span></div>
          <div style={{ display:"flex", justifyContent:"space-between", paddingTop:10, marginTop:4, borderTop:"2px solid #F0EEE9" }}>
            <span style={{ fontSize:14, fontWeight:600 }}>Маржа</span>
            <span style={{ fontSize:16, fontWeight:700, color:margin>=0?"#388E3C":"#E53935" }}>{fmt(margin)}</span>
          </div>
          {ci.price > 0 && (
            <div style={{ marginTop:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#bbb", marginBottom:4 }}>
                <span>Получено от суммы работ</span>
                <span style={{ color:"#388E3C", fontWeight:600 }}>{pct(iPaid,ci.price)}%</span>
              </div>
              <div className="bar" style={{ background:"#E8F5E9", height:7 }}>
                <div className="bf" style={{ width:`${pct(iPaid,ci.price)}%`, background:"#5BC47A" }} />
              </div>
            </div>
          )}
        </div>

        <div className="dsec" style={{ marginBottom:8 }}>
          <div className="dstitle">Заказчик платил</div>
          {sorted.length === 0 && <div style={{ fontSize:13, color:"#ccc", paddingBottom:6 }}>Платежей нет</div>}
          {sorted.map(pay => (
            <div key={pay.id} className="payrow">
              <span style={{ fontSize:13, color:"#555", minWidth:80 }}>{fmtD(pay.date)}</span>
              <span style={{ fontSize:12, color:"#aaa", flex:1, fontStyle:"italic" }}>{pay.note}</span>
              <span style={{ fontSize:14, fontWeight:600, color:"#388E3C" }}>+{fmt(pay.amount)}</span>
              <span style={{ fontSize:18, color:"#ddd", cursor:"pointer", paddingLeft:6 }} onClick={() => onDelPayment(pay.id)}>x</span>
            </div>

