import { useState } from "react";

const todayStr = () => new Date().toISOString().slice(0, 10);

const initialProjects = [
  {
    id: 1,
    name: "Квартира на Ленина, 12",
    client: "Иванов А.В.",
    color: "#E8643A",
    budget: 850000,
    expenses: 310000,
    items: [
      {
        id: 1, name: "Демонтажные работы", executor: "Бригада Петрова",
        price: 45000, expenses: 12000, works: "Снос перегородок, вывоз мусора",
        done: true, progress: 100,
        payments: [
          { id: 1, date: "2025-08-10", amount: 20000, note: "Аванс" },
          { id: 2, date: "2025-08-20", amount: 25000, note: "Финал" },
        ],
      },
      {
        id: 2, name: "Электрика", executor: "Электрик Сидоров",
        price: 120000, expenses: 85000, works: "Разводка, щиток, розетки",
        done: false, progress: 60,
        payments: [
          { id: 1, date: "2025-08-15", amount: 40000, note: "Аванс" },
          { id: 2, date: "2025-08-25", amount: 20000, note: "" },
        ],
      },
      {
        id: 3, name: "Штукатурка стен", executor: "Бригада Петрова",
        price: 180000, expenses: 95000, works: "Выравнивание всех стен",
        done: false, progress: 30,
        payments: [],
      },
    ],
  },
  {
    id: 2,
    name: "Офис на Пушкина, 5",
    client: "ООО «Ромашка»",
    color: "#3A7FE8",
    budget: 1200000,
    expenses: 520000,
    items: [
      {
        id: 1, name: "Сантехника", executor: "СантехМастер",
        price: 200000, expenses: 180000, works: "Разводка труб, установка",
        done: true, progress: 100,
        payments: [
          { id: 1, date: "2025-07-01", amount: 100000, note: "Аванс" },
          { id: 2, date: "2025-07-20", amount: 100000, note: "Финал" },
        ],
      },
      {
        id: 2, name: "Плиточные работы", executor: "Плиточник Ким",
        price: 150000, expenses: 110000, works: "Укладка плитки в санузлах",
        done: false, progress: 45,
        payments: [
          { id: 1, date: "2025-08-18", amount: 75000, note: "Аванс" },
        ],
      },
    ],
  },
];

const PROJECT_COLORS = ["#E8643A", "#3A7FE8", "#5BC47A", "#C45BB8", "#E8B83A", "#3AC4C4"];
const EXECUTORS = ["Бригада Петрова", "Электрик Сидоров", "СантехМастер", "Плиточник Ким", "Маляр Козлов"];

const fmt = (n) => new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n) + " ₽";
const fmtShort = (n) => {
  if (Math.abs(n) >= 1000000) return (n / 1000000).toFixed(1) + "М ₽";
  if (Math.abs(n) >= 1000) return Math.round(n / 1000) + "К ₽";
  return n + " ₽";
};
const fmtDate = (iso) => { const [y, m, d] = iso.split("-"); return `${d}.${m}.${y}`; };
const pct = (a, b) => (b === 0 ? 0 : Math.min(100, Math.round((a / b) * 100)));
const itemPaid = (item) => item.payments.reduce((s, p) => s + p.amount, 0);
const projectPaid = (proj) => proj.items.reduce((s, i) => s + itemPaid(i), 0);

export default function App() {
  const [projects, setProjects] = useState(initialProjects);
  const [tab, setTab] = useState("home");
  const [activeId, setActiveId] = useState(null);
  const [sheet, setSheet] = useState(null);
  const [detailItemId, setDetailItemId] = useState(null);
  const [editItemId, setEditItemId] = useState(null);

  const [pForm, setPForm] = useState({ name: "", client: "", budget: "", color: PROJECT_COLORS[0] });
  const [iForm, setIForm] = useState({ name: "", executor: EXECUTORS[0], price: "", expenses: "", works: "", progress: 0 });
  const [payForm, setPayForm] = useState({ date: todayStr(), amount: "", note: "" });

  const proj = projects.find((p) => p.id === activeId);
  const detailItem = proj?.items.find(i => i.id === detailItemId);

  const totalPaid = projects.reduce((s, p) => s + projectPaid(p), 0);
  const totalExpenses = projects.reduce((s, p) => s + p.expenses, 0);
  const totalBudget = projects.reduce((s, p) => s + p.budget, 0);

  const updateItems = (projId, fn) =>
    setProjects(prev => prev.map(p => {
      if (p.id !== projId) return p;
      const items = fn(p.items);
      return { ...p, items, expenses: items.reduce((s, i) => s + i.expenses, 0) };
    }));

  const openProject = (id) => { setActiveId(id); setTab("project"); };

  const openAddItem = () => {
    setEditItemId(null);
    setIForm({ name: "", executor: EXECUTORS[0], price: "", expenses: "", works: "", progress: 0 });
    setSheet("item");
  };

  const openEditItem = (item) => {
    setEditItemId(item.id);
    setIForm({ name: item.name, executor: item.executor, price: item.price, expenses: item.expenses, works: item.works, progress: item.progress });
    setSheet("item");
  };

  const saveItem = () => {
    const data = { name: iForm.name, executor: iForm.executor, price: +iForm.price || 0, expenses: +iForm.expenses || 0, works: iForm.works, progress: +iForm.progress || 0, done: false };
    updateItems(activeId, items => editItemId
      ? items.map(i => i.id === editItemId ? { ...i, ...data } : i)
      : [...items, { ...data, id: Date.now(), payments: [] }]
    );
    setSheet(null);
  };

  const saveProject = () => {
    setProjects(prev => [...prev, { id: Date.now(), name: pForm.name, client: pForm.client, color: pForm.color, budget: +pForm.budget || 0, expenses: 0, items: [] }]);
    setSheet(null);
    setPForm({ name: "", client: "", budget: "", color: PROJECT_COLORS[0] });
  };

  const toggleDone = (itemId) =>
    updateItems(activeId, items => items.map(i => i.id === itemId ? { ...i, done: !i.done } : i));

  const deleteItem = (itemId) => {
    updateItems(activeId, items => items.filter(i => i.id !== itemId));
    setSheet(null);
  };

  const setProgress = (itemId, val) =>
    updateItems(activeId, items => items.map(i => i.id === itemId ? { ...i, progress: val } : i));

  const addPayment = () => {
    if (!payForm.amount) return;
    updateItems(activeId, items => items.map(i => {
      if (i.id !== detailItemId) return i;
      return { ...i, payments: [...i.payments, { id: Date.now(), date: payForm.date, amount: +payForm.amount, note: payForm.note }] };
    }));
    setPayForm({ date: todayStr(), amount: "", note: "" });
  };

  const deletePayment = (payId) =>
    updateItems(activeId, items => items.map(i => {
      if (i.id !== detailItemId) return i;
      return { ...i, payments: i.payments.filter(p => p.id !== payId) };
    }));

  const openDetail = (id) => {
    setDetailItemId(id);
    setPayForm({ date: todayStr(), amount: "", note: "" });
    setSheet("item-detail");
  };

  return (
    <div style={{ display:"flex", justifyContent:"center", alignItems:"center", minHeight:"100vh", background:"#0d0d0d", fontFamily:"'DM Sans','Helvetica Neue',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
        ::-webkit-scrollbar{display:none}
        .phone{width:390px;height:844px;background:#F2F0EB;border-radius:50px;overflow:hidden;position:relative;box-shadow:0 40px 80px #000000aa,inset 0 0 0 1.5px #ffffff22;display:flex;flex-direction:column}
        .screen{flex:1;overflow-y:auto;overflow-x:hidden}
        .sbar{height:50px;display:flex;align-items:flex-end;justify-content:space-between;padding:0 28px 8px;flex-shrink:0}
        .bnav{height:82px;background:#fff;border-top:1px solid #e8e8e8;display:flex;align-items:flex-start;justify-content:space-around;padding-top:12px;flex-shrink:0}
        .nitem{display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;padding:4px 16px}
        .fab{position:absolute;bottom:96px;right:24px;width:56px;height:56px;background:#E8643A;border-radius:18px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 8px 24px #E8643A55;z-index:10;transition:transform .15s}
        .fab:active{transform:scale(.92)}
        .card{background:#fff;border-radius:20px;margin:10px 20px 0;padding:18px;cursor:pointer;transition:opacity .15s}
        .card:active{opacity:.82}
        .icard{background:#fff;border-radius:16px;margin:0 20px 8px;padding:16px;cursor:pointer;transition:opacity .15s}
        .icard:active{opacity:.8}
        .badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:500}
        .bdone{background:#E8F5E9;color:#388E3C}
        .bprog{background:#FFF3E0;color:#E65100}
        .bar{background:#f0ece8;border-radius:100px;overflow:hidden}
        .barfill{height:100%;border-radius:100px;transition:width .3s}
        .sec{display:flex;justify-content:space-between;align-items:center;padding:20px 20px 8px}
        .overlay{position:absolute;inset:0;background:#00000060;z-index:50;display:flex;flex-direction:column;justify-content:flex-end;animation:fIn .2s}
        .sheet{background:#F2F0EB;border-radius:28px 28px 0 0;padding:0 20px 44px;max-height:94%;overflow-y:auto;animation:sUp .28s cubic-bezier(.32,1.1,.68,1)}
        .handle{width:36px;height:4px;background:#d0ccc6;border-radius:2px;margin:12px auto 20px}
        @keyframes fIn{from{opacity:0}to{opacity:1}}
        @keyframes sUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        .dsec{background:#fff;border-radius:16px;padding:16px;margin-bottom:10px}
        .dstitle{font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:.8px;font-weight:600;margin-bottom:12px}
        .frow{display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid #f4f4f4}
        .frow:last-child{border-bottom:none}
        .prow{display:flex;align-items:center;gap:8px;padding:9px 0;border-bottom:1px solid #f4f4f4}
        .prow:last-of-type{border-bottom:none}
        .padd{background:#F8F7F4;border-radius:12px;padding:12px;margin-top:12px}
        .pi{background:#fff;border:1.5px solid #E8E8E8;border-radius:10px;padding:10px 12px;font-family:inherit;font-size:14px;color:#1a1a1a;outline:none;-webkit-appearance:none}
        .pi:focus{border-color:#E8643A}
        .field{margin-bottom:14px}
        .flabel{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;font-weight:500;display:flex;justify-content:space-between}
        .field input,.field select,.field textarea{width:100%;background:#fff;border:1.5px solid #E8E8E8;border-radius:12px;padding:13px 14px;font-family:inherit;font-size:15px;color:#1a1a1a;outline:none;transition:border-color .2s;-webkit-appearance:none}
        .field input:focus,.field select:focus,.field textarea:focus{border-color:#E8643A}
        .frow2{display:flex;gap:10px}
        .frow2 .field{flex:1}
        input[type=range]{-webkit-appearance:none;width:100%;height:6px;border-radius:3px;background:#e0ddd8;outline:none;cursor:pointer}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:24px;height:24px;border-radius:50%;background:#E8643A;cursor:pointer;box-shadow:0 2px 8px #E8643A44}
        .bp{background:#E8643A;color:#fff;border:none;border-radius:14px;padding:16px;font-size:16px;font-weight:600;font-family:inherit;width:100%;cursor:pointer;margin-top:8px;transition:opacity .15s}
        .bp:disabled{background:#ddd;color:#aaa}
        .bp:active{opacity:.85}
        .bs{background:#fff;color:#1a1a1a;border:1.5px solid #E8E8E8;border-radius:14px;padding:14px;font-size:15px;font-family:inherit;width:100%;cursor:pointer;margin-top:8px}
        .bdel{color:#E53935;font-size:14px;font-weight:500;text-align:center;display:block;cursor:pointer;padding:14px}
        .cdot{width:32px;height:32px;border-radius:50%;cursor:pointer;border:3px solid transparent;transition:transform .15s}
        .cdot.sel{border-color:#1a1a1a;transform:scale(1.15)}
        .empty{text-align:center;padding:40px 20px;color:#bbb}
      `}</style>

      <div className="phone">
        <div className="sbar">
          <span style={{fontSize:15,fontWeight:600,color:"#1a1a1a"}}>9:41</span>
          <span style={{fontSize:12,color:"#1a1a1a",letterSpacing:1}}>●●● 5G ▮▮▮</span>
        </div>

        <div className="screen">

          {/* ── HOME ── */}
          {tab === "home" && (<>
            <div style={{padding:"16px 20px 0"}}>
              <div style={{fontSize:26,fontWeight:600,color:"#1a1a1a",letterSpacing:-.5}}>Мои объекты</div>
              <div style={{fontSize:13,color:"#888",marginTop:2}}>{projects.length} активных проекта</div>
            </div>

            {/* Global summary */}
            <div style={{background:"#1a1a1a",borderRadius:24,padding:22,margin:"14px 20px 0",color:"#fff"}}>
              <div style={{fontSize:11,color:"#888",textTransform:"uppercase",letterSpacing:.5,marginBottom:4}}>Общая маржа</div>
              <div style={{fontSize:28,fontWeight:600,letterSpacing:-1,color:(totalPaid-totalExpenses)>=0?"#5BC47A":"#E8643A"}}>{fmtShort(totalPaid-totalExpenses)}</div>
              <div style={{display:"flex",marginTop:18}}>
                {[{l:"Получено",v:fmtShort(totalPaid),c:"#5BC47A"},{l:"Расходы",v:fmtShort(totalExpenses),c:"#E8643A"},{l:"Бюджет",v:fmtShort(totalBudget),c:"#666"}].map((s,i)=>(
                  <div key={s.l} style={{flex:1,borderLeft:i>0?"1px solid #2a2a2a":"none",paddingLeft:i>0?16:0}}>
                    <div style={{fontSize:10,color:"#666",textTransform:"uppercase",letterSpacing:.5}}>{s.l}</div>
                    <div style={{fontSize:15,fontWeight:500,marginTop:2,color:s.c}}>{s.v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sec">
              <span style={{fontSize:13,fontWeight:600,color:"#888",letterSpacing:.5,textTransform:"uppercase"}}>Проекты</span>
              <span style={{fontSize:13,color:"#E8643A",fontWeight:500,cursor:"pointer"}} onClick={()=>setSheet("project")}>+ Новый</span>
            </div>

            {projects.map(p => {
              const paid = projectPaid(p);
              const profit = paid - p.expenses;
              return (
                <div key={p.id} className="card" onClick={()=>openProject(p.id)}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div>
                      <div style={{display:"flex",alignItems:"center"}}>
                        <span style={{width:10,height:10,borderRadius:"50%",background:p.color,display:"inline-block",marginRight:8}}/>
                        <span style={{fontSize:15,fontWeight:600,color:"#1a1a1a"}}>{p.name}</span>
                      </div>
                      <div style={{fontSize:12,color:"#999",marginTop:2}}>{p.client} · {p.items.length} работ</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:15,fontWeight:600,color:profit>=0?"#388E3C":"#E53935"}}>{fmtShort(profit)}</div>
                      <div style={{fontSize:10,color:"#bbb",marginTop:2}}>маржа</div>
                    </div>
                  </div>
                  <div className="bar" style={{marginTop:14,height:5}}>
                    <div className="barfill" style={{width:`${pct(paid,p.budget)}%`,background:p.color}}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:10}}>
                    {[{l:"Получено",v:fmtShort(paid),c:"#388E3C"},{l:"Расходы",v:fmtShort(p.expenses),c:"#E53935"},{l:"Бюджет",v:fmtShort(p.budget),c:"#1a1a1a"}].map(s=>(
                      <div key={s.l}>
                        <div style={{fontSize:10,color:"#aaa",textTransform:"uppercase",letterSpacing:.3}}>{s.l}</div>
                        <div style={{fontSize:13,fontWeight:500,color:s.c,marginTop:2}}>{s.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {projects.length===0&&<div className="empty"><div style={{fontSize:40,marginBottom:12}}>🏗</div><div style={{fontSize:14}}>Нет проектов</div></div>}
            <div style={{height:20}}/>
          </>)}

          {/* ── PROJECT ── */}
          {tab==="project"&&proj&&(()=>{
            const paid=projectPaid(proj);
            const profit=paid-proj.expenses;
            return (<>
              <div style={{padding:"16px 20px 16px"}}>
                <div style={{fontSize:15,color:"#E8643A",cursor:"pointer"}} onClick={()=>setTab("home")}>← Назад</div>
                <div style={{fontSize:26,fontWeight:600,color:"#1a1a1a",letterSpacing:-.5,marginTop:8}}>{proj.name.split(",")[0]}</div>
                <div style={{fontSize:13,color:"#888",marginTop:2}}>{proj.client}</div>
              </div>

              <div style={{background:proj.color,borderRadius:20,margin:"0 20px 12px",padding:20}}>
                <div style={{color:"#fff9",fontSize:11,textTransform:"uppercase",letterSpacing:.5,marginBottom:4}}>Маржа проекта</div>
                <div style={{color:"#fff",fontSize:26,fontWeight:700,letterSpacing:-1}}>{fmtShort(profit)}</div>
                <div style={{display:"flex",gap:16,marginTop:14}}>
                  {[{l:"Бюджет",v:fmtShort(proj.budget),c:"#fff9"},{l:"Получено",v:fmtShort(paid),c:"#fff"},{l:"Расходы",v:fmtShort(proj.expenses),c:"#ffcccc"}].map(s=>(
                    <div key={s.l}>
                      <div style={{color:"#fff9",fontSize:10,textTransform:"uppercase"}}>{s.l}</div>
                      <div style={{color:s.c,fontSize:14,fontWeight:600,marginTop:2}}>{s.v}</div>
                    </div>
                  ))}
                </div>
                <div style={{background:"#ffffff33",borderRadius:100,height:4,marginTop:14,overflow:"hidden"}}>
                  <div style={{height:"100%",background:"#fff",borderRadius:100,width:`${pct(paid,proj.budget)}%`}}/>
                </div>
                <div style={{fontSize:10,color:"#fff9",marginTop:5}}>Оплата {pct(paid,proj.budget)}% от бюджета</div>
              </div>

              <div className="sec">
                <span style={{fontSize:13,fontWeight:600,color:"#888",textTransform:"uppercase",letterSpacing:.5}}>Статьи расходов</span>
                <span style={{fontSize:13,color:"#E8643A",fontWeight:500,cursor:"pointer"}} onClick={openAddItem}>+ Добавить</span>
              </div>

              {proj.items.map(item=>{
                const iPaid=itemPaid(item);
                const iProfit=iPaid-item.expenses;
                return (
                  <div key={item.id} className="icard" onClick={()=>openDetail(item.id)}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div style={{flex:1}}>
                        <div style={{fontSize:15,fontWeight:500,color:"#1a1a1a"}}>{item.name}</div>
                        <div style={{fontSize:12,color:"#999",marginTop:3}}>{item.executor}</div>
                      </div>
                      <span className={`badge ${item.done?"bdone":"bprog"}`}>{item.done?"Готово":"В работе"}</span>
                    </div>

                    {/* Progress of work */}
                    <div style={{display:"flex",alignItems:"center",gap:8,marginTop:12}}>
                      <span style={{fontSize:11,color:"#999",whiteSpace:"nowrap"}}>Выполнено</span>
                      <div className="bar" style={{flex:1,height:7}}>
                        <div className="barfill" style={{width:`${item.progress}%`,background:item.progress===100?"#388E3C":proj.color}}/>
                      </div>
                      <span style={{fontSize:11,fontWeight:700,color:"#555",minWidth:32,textAlign:"right"}}>{item.progress}%</span>
                    </div>

                    {/* Payment progress */}
                    {item.price>0&&(
                      <div style={{display:"flex",alignItems:"center",gap:8,marginTop:6}}>
                        <span style={{fontSize:11,color:"#999",whiteSpace:"nowrap"}}>Получено</span>
                        <div className="bar" style={{flex:1,height:7,background:"#E8F5E9"}}>
                          <div className="barfill" style={{width:`${pct(iPaid,item.price)}%`,background:"#5BC47A"}}/>
                        </div>
                        <span style={{fontSize:11,fontWeight:700,color:"#388E3C",minWidth:32,textAlign:"right"}}>{pct(iPaid,item.price)}%</span>
                      </div>
                    )}

                    <div style={{display:"flex",gap:6,marginTop:12}}>
                      {[{l:"Стоимость",v:fmtShort(item.price),c:"#1a1a1a"},{l:"Получено",v:fmtShort(iPaid),c:"#388E3C"},{l:"Расходы",v:fmtShort(item.expenses),c:"#E53935"},{l:"Маржа",v:fmtShort(iProfit),c:iProfit>=0?"#388E3C":"#E53935"}].map(s=>(
                        <div key={s.l} style={{flex:1}}>
                          <div style={{fontSize:9,color:"#bbb",textTransform:"uppercase",letterSpacing:.3}}>{s.l}</div>
                          <div style={{fontSize:12,fontWeight:500,color:s.c,marginTop:2}}>{s.v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {proj.items.length===0&&<div className="empty"><div style={{fontSize:40,marginBottom:12}}>📋</div><div style={{fontSize:14}}>Нет статей. Нажмите «+ Добавить»</div></div>}
              <div style={{height:20}}/>
            </>);
          })()}
        </div>

        {/* Bottom nav */}
        <div className="bnav">
          {[{id:"home",icon:"🏠",label:"Главная"},{id:"stats",icon:"📊",label:"Аналитика"},{id:"team",icon:"👷",label:"Команда"}].map(n=>(
            <div key={n.id} className="nitem" onClick={()=>n.id==="home"&&setTab("home")}>
              <span style={{fontSize:22,lineHeight:1}}>{n.icon}</span>
              <span style={{fontSize:10,fontWeight:500,color:n.id==="home"?"#E8643A":"#bbb"}}>{n.label}</span>
            </div>
          ))}
        </div>

        {tab==="project"&&<div className="fab" onClick={openAddItem}><span style={{fontSize:26,color:"#fff",lineHeight:1}}>+</span></div>}

        {/* ── ITEM DETAIL SHEET ── */}
        {sheet==="item-detail"&&detailItem&&(()=>{
          const iPaid=itemPaid(detailItem);
          const iProfit=iPaid-detailItem.expenses;
          const sorted=[...detailItem.payments].sort((a,b)=>a.date.localeCompare(b.date));
          const pColor=detailItem.progress===100?"#388E3C":"#E8643A";
          return (
            <div className="overlay" onClick={()=>setSheet(null)}>
              <div className="sheet" onClick={e=>e.stopPropagation()}>
                <div className="handle"/>

                {/* Header */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
                  <div style={{flex:1,paddingRight:12}}>
                    <div style={{fontSize:20,fontWeight:600,color:"#1a1a1a",marginBottom:4}}>{detailItem.name}</div>
                    <div style={{fontSize:13,color:"#999"}}>{detailItem.executor}</div>
                  </div>
                  <span className={`badge ${detailItem.done?"bdone":"bprog"}`}>{detailItem.done?"Готово":"В работе"}</span>
                </div>

                {/* ПРОГРЕСС */}
                <div style={{background:"#fff",borderRadius:16,padding:16,marginBottom:10}}>
                  <div style={{fontSize:11,color:"#aaa",textTransform:"uppercase",letterSpacing:.8,fontWeight:600,marginBottom:12}}>Прогресс выполнения</div>
                  <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:10}}>
                    <div>
                      <div style={{fontSize:36,fontWeight:700,color:pColor,letterSpacing:-2,lineHeight:1}}>{detailItem.progress}%</div>
                      <div style={{fontSize:12,color:"#bbb",marginTop:4}}>выполнено</div>
                    </div>
                    {detailItem.price>0&&(
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:16,fontWeight:700,color:pColor}}>{fmt(Math.round(detailItem.price*detailItem.progress/100))}</div>
                        <div style={{fontSize:11,color:"#bbb",marginTop:2}}>из {fmt(detailItem.price)}</div>
                      </div>
                    )}
                  </div>
                  <div className="bar" style={{height:10,marginBottom:12}}>
                    <div className="barfill" style={{width:`${detailItem.progress}%`,background:pColor}}/>
                  </div>
                  <input type="range" min="0" max="100" step="5" value={detailItem.progress} onChange={e=>setProgress(detailItem.id,+e.target.value)}/>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:11,color:"#ccc"}}>
                    <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
                  </div>
                </div>

                {/* ФИНАНСЫ */}
                <div className="dsec">
                  <div className="dstitle">Финансы по статье</div>
                  {[
                    {l:"Общая стоимость работ",v:fmt(detailItem.price),c:"#1a1a1a"},
                    {l:"Всего выплачено заказчиком",v:fmt(iPaid),c:"#388E3C"},
                    {l:"Расходы",v:fmt(detailItem.expenses),c:"#E53935"},
                  ].map(s=>(
                    <div key={s.l} className="frow">
                      <span style={{fontSize:13,color:"#555"}}>{s.l}</span>
                      <span style={{fontSize:14,fontWeight:600,color:s.c}}>{s.v}</span>
                    </div>
                  ))}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:10,marginTop:4,borderTop:"2px solid #f0f0f0"}}>
                    <span style={{fontSize:14,fontWeight:600,color:"#1a1a1a"}}>Маржа</span>
                    <span style={{fontSize:17,fontWeight:700,color:iProfit>=0?"#388E3C":"#E53935"}}>{fmt(iProfit)}</span>
                  </div>

                  {detailItem.price>0&&(
                    <div style={{marginTop:14}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#bbb",marginBottom:5}}>
                        <span>Получено от суммы работ</span>
                        <span style={{color:"#388E3C",fontWeight:600}}>{pct(iPaid,detailItem.price)}%</span>
                      </div>
                      <div className="bar" style={{height:8}}>
                        <div className="barfill" style={{width:`${pct(iPaid,detailItem.price)}%`,background:"#5BC47A"}}/>
                      </div>
                    </div>
                  )}
                </div>

                {/* ИСТОРИЯ ПЛАТЕЖЕЙ */}
                <div className="dsec">
                  <div className="dstitle">Заказчик платил</div>

                  {sorted.length===0&&<div style={{fontSize:13,color:"#ccc",paddingBottom:8}}>Платежей ещё нет</div>}

                  {sorted.map(pay=>(
                    <div key={pay.id} className="prow">
                      <span style={{fontSize:13,color:"#555",minWidth:82,fontVariantNumeric:"tabular-nums"}}>{fmtDate(pay.date)}</span>
                      <span style={{fontSize:12,color:"#aaa",flex:1,fontStyle:"italic"}}>{pay.note||""}</span>
                      <span style={{fontSize:14,fontWeight:600,color:"#388E3C",whiteSpace:"nowrap"}}>+{fmt(pay.amount)}</span>
                      <span style={{fontSize:20,color:"#ddd",cursor:"pointer",padding:"0 4px",lineHeight:1}} onClick={()=>deletePayment(pay.id)}>×</span>
                    </div>
                  ))}

                  {sorted.length>0&&(
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:10,marginTop:4,borderTop:"2px solid #f0f0f0"}}>
                      <span style={{fontSize:13,color:"#888",fontWeight:600}}>Итого получено</span>
                      <span style={{fontSize:17,fontWeight:700,color:"#388E3C"}}>{fmt(iPaid)}</span>
                    </div>
                  )}

                  {/* Add payment */}
                  <div className="padd">
                    <div style={{fontSize:11,color:"#aaa",textTransform:"uppercase",letterSpacing:.5,fontWeight:600,marginBottom:10}}>Добавить платёж</div>
                    <div style={{display:"flex",gap:8,marginBottom:8}}>
                      <input className="pi" type="date" value={payForm.date} onChange={e=>setPayForm({...payForm,date:e.target.value})} style={{flex:1}}/>
                      <input className="pi" type="number" inputMode="numeric" placeholder="Сумма ₽" value={payForm.amount} onChange={e=>setPayForm({...payForm,amount:e.target.value})} style={{flex:1}}/>
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      <input className="pi" placeholder="Примечание (аванс, финал...)" value={payForm.note} onChange={e=>setPayForm({...payForm,note:e.target.value})} style={{flex:1}}/>
                      <button onClick={addPayment} disabled={!payForm.amount} style={{background:payForm.amount?"#E8643A":"#ddd",color:"#fff",border:"none",borderRadius:10,width:44,height:44,fontSize:22,cursor:payForm.amount?"pointer":"default",flexShrink:0}}>+</button>
                    </div>
                  </div>
                </div>

                {/* Состав работ */}
                {detailItem.works&&(
                  <div className="dsec">
                    <div className="dstitle">Состав работ</div>
                    <div style={{fontSize:14,color:"#333",lineHeight:1.6}}>{detailItem.works}</div>
                  </div>
                )}

                <button className="bp" onClick={()=>{setSheet(null);setTimeout(()=>openEditItem(detailItem),120)}}>Редактировать статью</button>
                <button className="bs" onClick={()=>{toggleDone(detailItem.id);setSheet(null)}}>{detailItem.done?"Вернуть в работу":"Отметить выполненным"}</button>
                <span className="bdel" onClick={()=>deleteItem(detailItem.id)}>Удалить статью</span>
              </div>
            </div>
          );
        })()}

        {/* ── ADD/EDIT ITEM SHEET ── */}
        {sheet==="item"&&(
          <div className="overlay" onClick={()=>setSheet(null)}>
            <div className="sheet" onClick={e=>e.stopPropagation()}>
              <div className="handle"/>
              <div style={{fontSize:18,fontWeight:600,color:"#1a1a1a",marginBottom:20}}>{editItemId?"Редактировать статью":"Новая статья расходов"}</div>
              <div className="field"><div className="flabel">Наименование</div><input value={iForm.name} onChange={e=>setIForm({...iForm,name:e.target.value})} placeholder="Укладка плитки"/></div>
              <div className="field"><div className="flabel">Исполнитель</div><select value={iForm.executor} onChange={e=>setIForm({...iForm,executor:e.target.value})}>{EXECUTORS.map(ex=><option key={ex}>{ex}</option>)}</select></div>
              <div className="frow2">
                <div className="field"><div className="flabel">Стоимость ₽</div><input type="number" inputMode="numeric" value={iForm.price} onChange={e=>setIForm({...iForm,price:e.target.value})} placeholder="0"/></div>
                <div className="field"><div className="flabel">Расходы ₽</div><input type="number" inputMode="numeric" value={iForm.expenses} onChange={e=>setIForm({...iForm,expenses:e.target.value})} placeholder="0"/></div>
              </div>
              <div className="field"><div className="flabel">Состав работ</div><textarea rows={2} value={iForm.works} onChange={e=>setIForm({...iForm,works:e.target.value})} placeholder="Опишите состав работ..."/></div>
              <div className="field">
                <div className="flabel"><span>Прогресс выполнения</span><span style={{color:"#E8643A",fontWeight:700}}>{iForm.progress}%</span></div>
                <input type="range" min="0" max="100" step="5" value={iForm.progress} onChange={e=>setIForm({...iForm,progress:+e.target.value})}/>
              </div>
              <button className="bp" onClick={saveItem} disabled={!iForm.name}>{editItemId?"Сохранить":"Добавить статью"}</button>
              <button className="bs" onClick={()=>setSheet(null)}>Отмена</button>
            </div>
          </div>
        )}

        {/* ── ADD PROJECT SHEET ── */}
        {sheet==="project"&&(
          <div className="overlay" onClick={()=>setSheet(null)}>
            <div className="sheet" onClick={e=>e.stopPropagation()}>
              <div className="handle"/>
              <div style={{fontSize:18,fontWeight:600,color:"#1a1a1a",marginBottom:20}}>Новый объект</div>
              <div className="field"><div className="flabel">Название объекта</div><input value={pForm.name} onChange={e=>setPForm({...pForm,name:e.target.value})} placeholder="Квартира на Ленина, 12"/></div>
              <div className="field"><div className="flabel">Заказчик</div><input value={pForm.client} onChange={e=>setPForm({...pForm,client:e.target.value})} placeholder="Иванов А.В."/></div>
              <div className="field"><div className="flabel">Бюджет ₽</div><input type="number" inputMode="numeric" value={pForm.budget} onChange={e=>setPForm({...pForm,budget:e.target.value})} placeholder="0"/></div>
              <div className="field">
                <div className="flabel">Цвет проекта</div>
                <div style={{display:"flex",gap:10}}>{PROJECT_COLORS.map(c=><div key={c} className={`cdot${pForm.color===c?" sel":""}`} style={{background:c}} onClick={()=>setPForm({...pForm,color:c})}/>)}</div>
              </div>
              <button className="bp" onClick={saveProject} disabled={!pForm.name}>Создать проект</button>
              <button className="bs" onClick={()=>setSheet(null)}>Отмена</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
