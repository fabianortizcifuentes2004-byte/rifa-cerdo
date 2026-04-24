import { useState, useEffect, useCallback } from "react";

const TOTAL_NUMBERS = 100;
const NEQUI_KEY = "3224816125";

const initialNumbers = () => {
  const nums = [];
  for (let i = 0; i < TOTAL_NUMBERS; i++) {
    nums.push({
      number: String(i).padStart(2, "0"),
      sold: false,
      paid: false,
      buyer: "",
      phone: "",
    });
  }
  return nums;
};

const STORAGE_KEY = "rifa-cerdo-data-v2";

export default function RifaCerdo() {
  const [tickets, setTickets] = useState(initialNumbers);
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [payStatus, setPayStatus] = useState("debe");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get(STORAGE_KEY);
        if (result && result.value) {
          setTickets(JSON.parse(result.value));
        }
      } catch {
        // no saved data
      }
      setLoaded(true);
    })();
  }, []);

  const saveTickets = useCallback(async (newTickets) => {
    setTickets(newTickets);
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify(newTickets));
    } catch {}
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSelect = (ticket) => {
    if (ticket.sold) {
      setSelected(ticket);
      setDetailModal(ticket.number);
      return;
    }
    setSelected(ticket);
    setBuyerName("");
    setBuyerPhone("");
    setPayStatus("debe");
    setModalOpen(true);
  };

  const handleSell = () => {
    if (!buyerName.trim()) return;
    const updated = tickets.map((t) =>
      t.number === selected.number
        ? { ...t, sold: true, paid: payStatus === "pagado", buyer: buyerName.trim(), phone: buyerPhone.trim() }
        : t
    );
    saveTickets(updated);
    setModalOpen(false);
    setSelected(null);
    showToast(`Numero ${selected.number} vendido a ${buyerName.trim()}!`);
  };

  const handleTogglePaid = (num) => {
    const updated = tickets.map((t) =>
      t.number === num ? { ...t, paid: !t.paid } : t
    );
    saveTickets(updated);
    const ticket = updated.find((t) => t.number === num);
    setSelected(ticket);
    showToast(ticket.paid ? `Numero ${num} marcado como PAGADO` : `Numero ${num} marcado como DEBE`);
  };

  const handleUnsell = (num) => {
    const updated = tickets.map((t) =>
      t.number === num ? { ...t, sold: false, paid: false, buyer: "", phone: "" } : t
    );
    saveTickets(updated);
    setDetailModal(null);
    setSelected(null);
    showToast(`Numero ${num} liberado`);
  };

  const soldCount = tickets.filter((t) => t.sold).length;
  const paidCount = tickets.filter((t) => t.sold && t.paid).length;
  const owesCount = tickets.filter((t) => t.sold && !t.paid).length;
  const availableCount = TOTAL_NUMBERS - soldCount;

  const filtered = tickets.filter((t) => {
    if (filter === "sold") return t.sold;
    if (filter === "available") return !t.sold;
    if (filter === "paid") return t.sold && t.paid;
    if (filter === "owes") return t.sold && !t.paid;
    return true;
  }).filter((t) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      t.number.includes(s) ||
      t.buyer.toLowerCase().includes(s) ||
      t.phone.includes(s)
    );
  });

  const soldList = tickets.filter((t) => t.sold);

  const getNumStyle = (t) => {
    if (!t.sold) return styles.numBtnAvailable;
    if (t.paid) return styles.numBtnPaid;
    return styles.numBtnOwes;
  };

  const getStatusBadge = (t) => {
    if (!t.sold) return null;
    if (t.paid) return { text: "\u2713", color: "#16a34a" };
    return { text: "$", color: "#dc2626" };
  };

  if (!loaded) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.spinner} />
        <p style={{ color: "#b45309", fontFamily: "'Playfair Display', serif", fontSize: 18 }}>Cargando rifa...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translate(-50%, 20px); } to { opacity: 1; transform: translate(-50%, 0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .num-btn:hover { transform: scale(1.08); box-shadow: 0 4px 16px rgba(0,0,0,0.15) !important; }
        .filter-btn:hover { background: #f3f4f6; }
        .table-row:hover { background: #fef3c7; }
        .nequi-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
      `}</style>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerBg} />
        <div style={styles.headerContent}>
          <div style={styles.pigIcon}>&#x1F437;</div>
          <h1 style={styles.title}>GRAN RIFA</h1>
          <p style={styles.subtitle}>de un Cerdo</p>
          <div style={styles.lotteryBadge}>
            <span style={styles.badgeIcon}>&#x1F3B1;</span>
            <div>
              <div style={styles.badgeLabel}>Juega con las 2 ultimas de la</div>
              <div style={styles.badgeName}>Loteria de Boyaca</div>
              <div style={styles.badgeDate}>&#x1F4C5; 9 de Mayo, 2026</div>
            </div>
          </div>

          {/* Nequi Payment Banner */}
          <div style={styles.payBanner}>
            <div style={styles.payBannerInner}>
              <span style={{ fontSize: 28 }}>&#x1F49C;</span>
              <div>
                <div style={styles.payBannerTitle}>Paga con Nequi</div>
                <div style={styles.payBannerKey}>Llave: <strong>{NEQUI_KEY}</strong></div>
              </div>
              <button
                className="nequi-btn"
                onClick={() => {
                  navigator.clipboard?.writeText(NEQUI_KEY);
                  showToast("Llave Nequi copiada: " + NEQUI_KEY);
                }}
                style={styles.copyKeyBtn}
              >
                Copiar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={{ ...styles.statCard, background: "linear-gradient(135deg, #059669 0%, #047857 100%)" }}>
          <div style={styles.statNumber}>{paidCount}</div>
          <div style={styles.statLabel}>Pagados</div>
        </div>
        <div style={{ ...styles.statCard, background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)" }}>
          <div style={styles.statNumber}>{owesCount}</div>
          <div style={styles.statLabel}>Deben</div>
        </div>
        <div style={{ ...styles.statCard, background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)" }}>
          <div style={styles.statNumber}>{availableCount}</div>
          <div style={styles.statLabel}>Disponibles</div>
        </div>
        <div style={{ ...styles.statCard, background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" }}>
          <div style={styles.statNumber}>{soldCount}</div>
          <div style={styles.statLabel}>Vendidos</div>
        </div>
      </div>

      {/* Progress */}
      <div style={styles.progressWrap}>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFillPaid, width: `${(paidCount / TOTAL_NUMBERS) * 100}%` }} />
          <div style={{ ...styles.progressFillOwes, width: `${(owesCount / TOTAL_NUMBERS) * 100}%`, left: `${(paidCount / TOTAL_NUMBERS) * 100}%` }} />
        </div>
        <span style={styles.progressText}>{Math.round((soldCount / TOTAL_NUMBERS) * 100)}%</span>
      </div>

      {/* Legend */}
      <div style={styles.legendRow}>
        <div style={styles.legendItem}><span style={{ ...styles.legendDot, background: "#fff", border: "2px solid #d1d5db" }} /> Disponible</div>
        <div style={styles.legendItem}><span style={{ ...styles.legendDot, background: "#dcfce7", border: "2px solid #86efac" }} /> Pagado</div>
        <div style={styles.legendItem}><span style={{ ...styles.legendDot, background: "#fee2e2", border: "2px solid #fca5a5" }} /> Debe</div>
      </div>

      {/* Filters */}
      <div style={styles.filtersRow}>
        <div style={styles.filterBtns}>
          {[
            ["all", "Todos"],
            ["available", "Libres"],
            ["paid", "Pagados"],
            ["owes", "Deben"],
          ].map(([key, label]) => (
            <button
              key={key}
              className="filter-btn"
              onClick={() => setFilter(key)}
              style={{
                ...styles.filterBtn,
                ...(filter === key ? styles.filterBtnActive : {}),
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Buscar # o nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Number Grid */}
      <div style={styles.gridWrap}>
        <div style={styles.grid}>
          {filtered.map((t) => {
            const badge = getStatusBadge(t);
            return (
              <button
                key={t.number}
                className="num-btn"
                onClick={() => handleSelect(t)}
                style={{ ...styles.numBtn, ...getNumStyle(t) }}
                title={t.sold ? `${t.buyer} - ${t.paid ? "PAGADO" : "DEBE"}` : "Disponible"}
              >
                <span style={styles.numText}>{t.number}</span>
                {badge && (
                  <span style={{ ...styles.statusBadge, color: badge.color }}>{badge.text}</span>
                )}
                {t.sold && <span style={{ ...styles.buyerMini, color: t.paid ? "#166534" : "#991b1b" }}>{t.buyer.split(" ")[0]}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sold List */}
      {soldList.length > 0 && (
        <div style={styles.soldSection}>
          <h2 style={styles.soldTitle}>Boletas Vendidas ({soldList.length})</h2>
          <div style={styles.soldTable}>
            <div style={styles.tableHeader}>
              <span style={{ ...styles.tableCell, flex: "0 0 50px" }}>#</span>
              <span style={{ ...styles.tableCell, flex: 1 }}>Nombre</span>
              <span style={{ ...styles.tableCell, flex: "0 0 100px" }}>Telefono</span>
              <span style={{ ...styles.tableCell, flex: "0 0 80px", textAlign: "center" }}>Estado</span>
            </div>
            {soldList.map((t) => (
              <div key={t.number} className="table-row" style={styles.tableRow} onClick={() => { setSelected(t); setDetailModal(t.number); }}>
                <span style={{ ...styles.tableCell, flex: "0 0 50px", fontWeight: 700, color: "#b45309" }}>{t.number}</span>
                <span style={{ ...styles.tableCell, flex: 1 }}>{t.buyer}</span>
                <span style={{ ...styles.tableCell, flex: "0 0 100px", color: "#6b7280" }}>{t.phone || "\u2014"}</span>
                <span style={{ ...styles.tableCell, flex: "0 0 80px", textAlign: "center" }}>
                  <span style={{
                    padding: "3px 10px",
                    borderRadius: 99,
                    fontSize: 11,
                    fontWeight: 700,
                    background: t.paid ? "#dcfce7" : "#fee2e2",
                    color: t.paid ? "#166534" : "#991b1b",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}>
                    {t.paid ? "Pago" : "Debe"}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sell Modal */}
      {modalOpen && selected && (
        <div style={styles.overlay} onClick={() => setModalOpen(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={styles.modalNumber}>{selected.number}</span>
              <h3 style={styles.modalTitle}>Vender Boleta</h3>
            </div>
            <div style={styles.modalBody}>
              <label style={styles.label}>Nombre del comprador *</label>
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="Ej: Juan Perez"
                style={styles.input}
                autoFocus
              />
              <label style={styles.label}>Numero de telefono</label>
              <input
                type="tel"
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                placeholder="Ej: 3001234567"
                style={styles.input}
              />
              <label style={styles.label}>Estado de pago</label>
              <div style={styles.payToggle}>
                <button
                  onClick={() => setPayStatus("pagado")}
                  style={{
                    ...styles.payToggleBtn,
                    ...(payStatus === "pagado" ? styles.payTogglePaid : {}),
                  }}
                >
                  Pagado
                </button>
                <button
                  onClick={() => setPayStatus("debe")}
                  style={{
                    ...styles.payToggleBtn,
                    ...(payStatus === "debe" ? styles.payToggleOwes : {}),
                  }}
                >
                  Debe
                </button>
              </div>

              {/* Nequi Payment CTA */}
              <div style={styles.nequiBox}>
                <div style={styles.nequiBoxHeader}>
                  <span style={{ fontSize: 20 }}>&#x1F49C;</span>
                  <span style={{ fontWeight: 700, color: "#581c87" }}>Pagar con Nequi</span>
                </div>
                <div style={styles.nequiKeyRow}>
                  <span style={{ fontSize: 13, color: "#6b7280" }}>Llave Nequi:</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: "#581c87", fontFamily: "'DM Sans', sans-serif" }}>{NEQUI_KEY}</span>
                </div>
                <button
                  className="nequi-btn"
                  onClick={() => {
                    navigator.clipboard?.writeText(NEQUI_KEY);
                    showToast("Llave Nequi copiada");
                  }}
                  style={styles.nequiCopyBtn}
                >
                  Copiar llave Nequi
                </button>
              </div>
            </div>
            <div style={styles.modalActions}>
              <button onClick={() => setModalOpen(false)} style={styles.cancelBtn}>Cancelar</button>
              <button onClick={handleSell} style={styles.sellBtn} disabled={!buyerName.trim()}>
                Vender
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModal !== null && selected && (
        <div style={styles.overlay} onClick={() => { setDetailModal(null); setSelected(null); }}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{
              ...styles.modalHeader,
              background: selected.paid
                ? "linear-gradient(135deg, #047857, #059669)"
                : "linear-gradient(135deg, #b91c1c, #dc2626)",
            }}>
              <span style={styles.modalNumber}>{detailModal}</span>
              <h3 style={styles.modalTitle}>{selected.paid ? "PAGADO" : "DEBE"}</h3>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Comprador:</span>
                <span style={styles.infoValue}>{selected.buyer}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Telefono:</span>
                <span style={styles.infoValue}>{selected.phone || "No registrado"}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Estado:</span>
                <span style={{
                  ...styles.infoValue,
                  color: selected.paid ? "#059669" : "#dc2626",
                }}>
                  {selected.paid ? "Pagado" : "Debe"}
                </span>
              </div>

              {/* Toggle paid/owes */}
              <button
                onClick={() => handleTogglePaid(detailModal)}
                style={{
                  ...styles.togglePaidBtn,
                  background: selected.paid
                    ? "linear-gradient(135deg, #dc2626, #ef4444)"
                    : "linear-gradient(135deg, #059669, #10b981)",
                }}
              >
                {selected.paid ? "Marcar como DEBE" : "Marcar como PAGADO"}
              </button>

              {/* Nequi for pending */}
              {!selected.paid && (
                <div style={styles.nequiBox}>
                  <div style={styles.nequiBoxHeader}>
                    <span style={{ fontSize: 20 }}>&#x1F49C;</span>
                    <span style={{ fontWeight: 700, color: "#581c87" }}>Pagar con Nequi</span>
                  </div>
                  <div style={styles.nequiKeyRow}>
                    <span style={{ fontSize: 13, color: "#6b7280" }}>Llave Nequi:</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: "#581c87" }}>{NEQUI_KEY}</span>
                  </div>
                  <button
                    className="nequi-btn"
                    onClick={() => {
                      navigator.clipboard?.writeText(NEQUI_KEY);
                      showToast("Llave Nequi copiada");
                    }}
                    style={styles.nequiCopyBtn}
                  >
                    Copiar llave Nequi
                  </button>
                </div>
              )}
            </div>
            <div style={styles.modalActions}>
              <button onClick={() => { setDetailModal(null); setSelected(null); }} style={styles.cancelBtn}>Cerrar</button>
              <button onClick={() => handleUnsell(detailModal)} style={styles.deleteBtn}>
                Liberar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div style={styles.toast}>{toast}</div>}

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={{ margin: 0 }}>Gran Rifa de un Cerdo — Loteria de Boyaca — 9 de Mayo 2026</p>
        <p style={{ margin: "6px 0 0", fontSize: 12 }}>Nequi: {NEQUI_KEY}</p>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#fdf6ec",
    fontFamily: "'DM Sans', sans-serif",
    color: "#1f2937",
    position: "relative",
  },
  loadingWrap: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#fdf6ec",
    gap: 16,
  },
  spinner: {
    width: 40, height: 40,
    border: "4px solid #fde68a",
    borderTopColor: "#b45309",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  header: {
    position: "relative",
    overflow: "hidden",
    padding: "40px 20px 24px",
    textAlign: "center",
  },
  headerBg: {
    position: "absolute", inset: 0,
    background: "linear-gradient(160deg, #92400e 0%, #b45309 30%, #d97706 60%, #f59e0b 100%)",
    zIndex: 0,
  },
  headerContent: { position: "relative", zIndex: 1 },
  pigIcon: { fontSize: 64, marginBottom: 8, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))" },
  title: {
    fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 900, color: "#fff",
    margin: 0, letterSpacing: 4, textShadow: "0 3px 12px rgba(0,0,0,0.3)",
  },
  subtitle: {
    fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 400,
    color: "#fef3c7", margin: "4px 0 20px", fontStyle: "italic",
  },
  lotteryBadge: {
    display: "inline-flex", alignItems: "center", gap: 12,
    background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)",
    borderRadius: 16, padding: "12px 24px", border: "1px solid rgba(255,255,255,0.25)",
  },
  badgeIcon: { fontSize: 36 },
  badgeLabel: { fontSize: 13, color: "#fef3c7", textAlign: "left" },
  badgeName: { fontSize: 18, fontWeight: 700, color: "#fff", textAlign: "left" },
  badgeDate: { fontSize: 14, color: "#fde68a", marginTop: 2, textAlign: "left" },

  payBanner: {
    marginTop: 16,
  },
  payBannerInner: {
    display: "inline-flex", alignItems: "center", gap: 12,
    background: "linear-gradient(135deg, #581c87, #7c3aed)",
    borderRadius: 16, padding: "12px 20px",
    border: "1px solid rgba(255,255,255,0.2)",
    boxShadow: "0 4px 20px rgba(88,28,135,0.4)",
  },
  payBannerTitle: { fontSize: 14, fontWeight: 700, color: "#e9d5ff", textAlign: "left" },
  payBannerKey: { fontSize: 16, color: "#fff", textAlign: "left" },
  copyKeyBtn: {
    padding: "8px 14px", border: "none", borderRadius: 10,
    background: "rgba(255,255,255,0.2)", color: "#fff",
    fontSize: 13, fontWeight: 600, cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
  },

  statsRow: {
    display: "flex", gap: 8, padding: "20px 12px 0",
    justifyContent: "center", flexWrap: "wrap",
  },
  statCard: {
    borderRadius: 16, padding: "14px 18px", textAlign: "center",
    color: "#fff", minWidth: 80, boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
  },
  statNumber: { fontSize: 28, fontWeight: 900, fontFamily: "'Playfair Display', serif" },
  statLabel: { fontSize: 12, opacity: 0.9, marginTop: 2 },

  progressWrap: {
    padding: "16px 16px 0", display: "flex", alignItems: "center", gap: 12,
    maxWidth: 600, margin: "0 auto",
  },
  progressBar: {
    flex: 1, height: 12, background: "#e5e7eb", borderRadius: 99,
    overflow: "hidden", position: "relative",
  },
  progressFillPaid: {
    position: "absolute", top: 0, left: 0, height: "100%",
    background: "linear-gradient(90deg, #059669, #10b981)",
    borderRadius: 99, transition: "width 0.5s ease", zIndex: 2,
  },
  progressFillOwes: {
    position: "absolute", top: 0, height: "100%",
    background: "linear-gradient(90deg, #ef4444, #f87171)",
    transition: "width 0.5s ease, left 0.5s ease", zIndex: 1,
  },
  progressText: { fontSize: 14, fontWeight: 600, color: "#6b7280", whiteSpace: "nowrap" },

  legendRow: {
    display: "flex", gap: 16, justifyContent: "center", padding: "12px 16px 0",
    flexWrap: "wrap",
  },
  legendItem: {
    display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6b7280",
  },
  legendDot: {
    width: 16, height: 16, borderRadius: 6, display: "inline-block",
  },

  filtersRow: {
    padding: "16px 16px 0", display: "flex", gap: 12,
    flexWrap: "wrap", alignItems: "center", justifyContent: "center",
  },
  filterBtns: {
    display: "flex", gap: 4, background: "#fff", borderRadius: 12, padding: 4,
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  filterBtn: {
    padding: "8px 14px", border: "none", borderRadius: 10, background: "transparent",
    cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#6b7280",
    fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
  },
  filterBtnActive: {
    background: "#b45309", color: "#fff", boxShadow: "0 2px 8px rgba(180,83,9,0.3)",
  },
  searchInput: {
    padding: "10px 16px", border: "2px solid #e5e7eb", borderRadius: 12,
    fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none",
    width: 180, transition: "border-color 0.2s",
  },

  gridWrap: { padding: 16, maxWidth: 720, margin: "0 auto" },
  grid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(68px, 1fr))", gap: 8,
  },
  numBtn: {
    position: "relative", aspectRatio: "1", border: "none", borderRadius: 12,
    cursor: "pointer", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", transition: "all 0.2s",
    fontFamily: "'DM Sans', sans-serif", boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  },
  numBtnAvailable: {
    background: "#fff", border: "2px solid #d1d5db", color: "#374151",
  },
  numBtnPaid: {
    background: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
    border: "2px solid #86efac", color: "#166534",
  },
  numBtnOwes: {
    background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
    border: "2px solid #fca5a5", color: "#991b1b",
  },
  numText: { fontSize: 20, fontWeight: 700 },
  statusBadge: {
    position: "absolute", top: 3, right: 5, fontSize: 11, fontWeight: 900,
  },
  buyerMini: {
    fontSize: 8, marginTop: 1, maxWidth: "90%", overflow: "hidden",
    textOverflow: "ellipsis", whiteSpace: "nowrap",
  },

  soldSection: { padding: "20px 16px", maxWidth: 680, margin: "0 auto" },
  soldTitle: {
    fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700,
    color: "#92400e", marginBottom: 12,
  },
  soldTable: {
    background: "#fff", borderRadius: 16, overflow: "hidden",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  },
  tableHeader: {
    display: "flex", padding: "12px 16px", background: "#f9fafb",
    borderBottom: "2px solid #e5e7eb", fontWeight: 700, fontSize: 12,
    color: "#6b7280", textTransform: "uppercase", letterSpacing: 1,
  },
  tableRow: {
    display: "flex", padding: "10px 16px", borderBottom: "1px solid #f3f4f6",
    cursor: "pointer", transition: "background 0.15s", alignItems: "center",
  },
  tableCell: { fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },

  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 999, padding: 16, backdropFilter: "blur(4px)", animation: "fadeIn 0.2s ease",
  },
  modal: {
    background: "#fff", borderRadius: 24, width: "100%", maxWidth: 400,
    overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
    maxHeight: "90vh", overflowY: "auto",
  },
  modalHeader: {
    background: "linear-gradient(135deg, #92400e, #d97706)",
    padding: "24px 24px 20px", textAlign: "center", color: "#fff",
  },
  modalNumber: {
    fontSize: 48, fontWeight: 900, fontFamily: "'Playfair Display', serif", display: "block",
  },
  modalTitle: { fontSize: 18, fontWeight: 500, margin: "8px 0 0", opacity: 0.9 },
  modalBody: { padding: "16px 24px" },
  label: {
    display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280",
    marginBottom: 6, marginTop: 14, textTransform: "uppercase", letterSpacing: 0.5,
  },
  input: {
    width: "100%", padding: "12px 14px", border: "2px solid #e5e7eb", borderRadius: 12,
    fontSize: 16, fontFamily: "'DM Sans', sans-serif", outline: "none",
    transition: "border-color 0.2s", boxSizing: "border-box",
  },
  payToggle: {
    display: "flex", gap: 8, marginTop: 4,
  },
  payToggleBtn: {
    flex: 1, padding: "10px", border: "2px solid #e5e7eb", borderRadius: 12,
    background: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s", color: "#6b7280",
  },
  payTogglePaid: {
    background: "#dcfce7", borderColor: "#86efac", color: "#166534",
  },
  payToggleOwes: {
    background: "#fee2e2", borderColor: "#fca5a5", color: "#991b1b",
  },
  nequiBox: {
    marginTop: 16, padding: 16, borderRadius: 16,
    background: "linear-gradient(135deg, #f3e8ff, #ede9fe)",
    border: "2px solid #c4b5fd",
  },
  nequiBoxHeader: {
    display: "flex", alignItems: "center", gap: 8, marginBottom: 10,
  },
  nequiKeyRow: {
    display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10,
  },
  nequiCopyBtn: {
    width: "100%", padding: "10px", border: "none", borderRadius: 10,
    background: "linear-gradient(135deg, #7c3aed, #8b5cf6)",
    color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
    boxShadow: "0 4px 12px rgba(124,58,237,0.3)",
  },
  infoRow: {
    display: "flex", justifyContent: "space-between", padding: "12px 0",
    borderBottom: "1px solid #f3f4f6",
  },
  infoLabel: { fontSize: 14, color: "#6b7280" },
  infoValue: { fontSize: 14, fontWeight: 600, color: "#1f2937" },
  togglePaidBtn: {
    width: "100%", padding: "12px", border: "none", borderRadius: 12,
    color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif", marginTop: 16,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)", transition: "all 0.2s",
  },
  modalActions: {
    display: "flex", gap: 12, padding: "16px 24px 24px",
  },
  cancelBtn: {
    flex: 1, padding: "12px", border: "2px solid #e5e7eb", borderRadius: 12,
    background: "#fff", color: "#6b7280", fontSize: 15, fontWeight: 600,
    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
  },
  sellBtn: {
    flex: 1, padding: "12px", border: "none", borderRadius: 12,
    background: "linear-gradient(135deg, #059669, #10b981)", color: "#fff",
    fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
    boxShadow: "0 4px 12px rgba(5,150,105,0.3)",
  },
  deleteBtn: {
    flex: 1, padding: "12px", border: "none", borderRadius: 12,
    background: "linear-gradient(135deg, #dc2626, #ef4444)", color: "#fff",
    fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
    boxShadow: "0 4px 12px rgba(220,38,38,0.3)",
  },
  toast: {
    position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
    background: "#1f2937", color: "#fff", padding: "12px 24px", borderRadius: 12,
    fontSize: 14, fontWeight: 600, zIndex: 9999,
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)", animation: "slideUp 0.3s ease",
    maxWidth: "90%", textAlign: "center",
  },
  footer: {
    textAlign: "center", padding: "24px 16px", color: "#9ca3af",
    fontSize: 13, borderTop: "1px solid #e5e7eb", marginTop: 20,
  },
};
