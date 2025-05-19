import { useState, useEffect } from "react";

export default function App() {
  const [clienti, setClienti] = useState(() => {
    const saved = localStorage.getItem("clienti");
    return saved ? JSON.parse(saved) : [];
  });
  const [password, setPassword] = useState("");
  const [autenticato, setAutenticato] = useState(false);

  const [form, setForm] = useState({
    nome: "",
    cognome: "",
    polizza: "",
    telefono: "",
    numeroPolizza: "",
    dataFirma: "",
    dataScadenza: "",
    note: "",
  });
  const [filtro, setFiltro] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("");
  const [modificaIndex, setModificaIndex] = useState(null);

  useEffect(() => {
    localStorage.setItem("clienti", JSON.stringify(clienti));
  }, [clienti]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const aggiungiCliente = () => {
    if (!form.nome || !form.cognome || !form.polizza) return;
    if (modificaIndex !== null) {
      const nuoviClienti = [...clienti];
      nuoviClienti[modificaIndex] = form;
      setClienti(nuoviClienti);
      setModificaIndex(null);
    } else {
      setClienti([...clienti, form]);
    }
    setForm({
      nome: "",
      cognome: "",
      polizza: "",
      telefono: "",
      numeroPolizza: "",
      dataFirma: "",
      dataScadenza: "",
      note: "",
    });
  };

  const eliminaCliente = (index) => {
    const updated = clienti.filter((_, i) => i !== index);
    setClienti(updated);
  };

  const modificaCliente = (index) => {
    setForm(clienti[index]);
    setModificaIndex(index);
  };

  const getColoreStato = (dataScadenza) => {
    if (!dataScadenza) return "secondary";
    const oggi = new Date();
    const scadenza = new Date(dataScadenza);
    const diff = (scadenza - oggi) / (1000 * 60 * 60 * 24);
    if (diff < 0) return "danger";
    if (diff <= 15) return "warning";
    return "success";
  };

  const clientiFiltrati = clienti
    .filter((c) =>
      `${c.nome} ${c.cognome}`.toLowerCase().includes(filtro.toLowerCase())
    )
    .filter((c) => (tipoFiltro ? c.polizza === tipoFiltro : true));

  if (!autenticato) {
    return (
      <div className="container py-5">
        <h3>🔒 Inserisci password per accedere</h3>
        <input
          type="password"
          className="form-control my-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="btn btn-primary"
          onClick={() => password === "1234" && setAutenticato(true)}
        >
          Entra
        </button>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="mb-4">📋 Gestionale Clienti</h2>

      <div className="row g-2 mb-4">
        <div className="col-md-6">
          <input
            className="form-control"
            placeholder="🔍 Cerca per nome o cognome"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <select
            className="form-select"
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value)}
          >
            <option value="">Tutte le polizze</option>
            <option value="rca">RCA</option>
            <option value="vita">Vita</option>
            <option value="danni">Danni</option>
          </select>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {["nome", "cognome", "numeroPolizza", "telefono"].map((field, i) => (
          <div className="col-md-6" key={i}>
            <input
              className="form-control"
              name={field}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={form[field]}
              onChange={handleChange}
            />
          </div>
        ))}

        <div className="col-md-6">
          <select
            className="form-select"
            name="polizza"
            value={form.polizza}
            onChange={handleChange}
          >
            <option value="">Tipo di polizza</option>
            <option value="rca">RCA</option>
            <option value="vita">Vita</option>
            <option value="danni">Danni</option>
          </select>
        </div>
        <div className="col-md-3">
          <input
            className="form-control"
            type="date"
            name="dataFirma"
            value={form.dataFirma}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-3">
          <input
            className="form-control"
            type="date"
            name="dataScadenza"
            value={form.dataScadenza}
            onChange={handleChange}
          />
        </div>
        <div className="col-12">
          <textarea
            className="form-control"
            name="note"
            placeholder="Note"
            value={form.note}
            onChange={handleChange}
          ></textarea>
        </div>
        <div className="col-12">
          <button className="btn btn-primary w-100" onClick={aggiungiCliente}>
            {modificaIndex !== null
              ? "💾 Salva Modifiche"
              : "➕ Aggiungi Cliente"}
          </button>
        </div>
      </div>

      <hr />

      <div className="row">
        {[...clientiFiltrati]
          .sort((a, b) => new Date(a.dataScadenza) - new Date(b.dataScadenza))
          .map((c, index) => (
            <div className="col-md-6 mb-3" key={index}>
              <div
                className={`border rounded p-3 border-${getColoreStato(
                  c.dataScadenza
                )}`}
              >
                <h5 className="mb-1">
                  {c.nome} {c.cognome}
                </h5>
                <span
                  className={`badge bg-${getColoreStato(c.dataScadenza)} mb-2`}
                >
                  {getColoreStato(c.dataScadenza) === "success"
                    ? "Attiva"
                    : getColoreStato(c.dataScadenza) === "warning"
                    ? "In scadenza"
                    : "Scaduta"}
                </span>
                <ul className="list-unstyled mb-2">
                  <li>
                    📄 Polizza: {c.polizza.toUpperCase()} – #{c.numeroPolizza}
                  </li>
                  <li>📞 Tel: {c.telefono}</li>
                  <li>🗓️ Firma: {c.dataFirma}</li>
                  <li>📅 Scadenza: {c.dataScadenza}</li>
                  <li>📝 Note: {c.note}</li>
                </ul>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => modificaCliente(index)}
                  >
                    ✏️ Modifica
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => eliminaCliente(index)}
                  >
                    ❌ Elimina
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
