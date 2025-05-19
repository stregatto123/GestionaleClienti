import { useState, useEffect } from "react";
import "./styles.css";

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
    tags: "",
    file: null,
  });
  const [filtro, setFiltro] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("");
  const [modificaIndex, setModificaIndex] = useState(null);
  const [avvisi, setAvvisi] = useState([]);
  const [mostraForm, setMostraForm] = useState(false);

  useEffect(() => {
    localStorage.setItem("clienti", JSON.stringify(clienti));
  }, [clienti]);

  useEffect(() => {
    const oggi = new Date();
    const notifiche = clienti.filter((c) => {
      const diff = (new Date(c.dataScadenza) - oggi) / (1000 * 60 * 60 * 24);
      return diff <= 15 && diff >= 0;
    });
    setAvvisi(notifiche);
  }, [clienti]);

  useEffect(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    document.body.classList.toggle("dark-mode", prefersDark);
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setForm((prev) => ({ ...prev, file: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const aggiungiCliente = () => {
    if (!form.nome || !form.cognome || !form.polizza) return;
    const nuovoCliente = { ...form };
    if (form.file) {
      nuovoCliente.fileName = form.file.name;
    }
    if (modificaIndex !== null) {
      const nuoviClienti = [...clienti];
      nuoviClienti[modificaIndex] = nuovoCliente;
      setClienti(nuoviClienti);
      setModificaIndex(null);
    } else {
      setClienti([...clienti, nuovoCliente]);
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
      tags: "",
      file: null,
    });
    setMostraForm(false);
  };

  const esportaClienti = () => {
    const data = JSON.stringify(clienti, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clienti.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const eliminaCliente = (index) => {
    const updated = clienti.filter((_, i) => i !== index);
    setClienti(updated);
  };

  const modificaCliente = (index) => {
    setForm(clienti[index]);
    setModificaIndex(index);
    setMostraForm(true);
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

  const totale = clienti.length;
  const totRca = clienti.filter((c) => c.polizza === "rca").length;
  const totVita = clienti.filter((c) => c.polizza === "vita").length;
  const totDanni = clienti.filter((c) => c.polizza === "danni").length;

  if (!autenticato) {
    return (
      <div className="container py-5 apple-style-bg">
        <h2 className="text-center mb-4 gradient-title">
          Accesso al Gestionale
        </h2>
        <input
          type="password"
          className="form-control mb-3 rounded-5 shadow text-center"
          placeholder="Inserisci password..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="btn btn-primary w-100 rounded-5 shadow"
          onClick={() => password === "1234" && setAutenticato(true)}
        >
          Entra
        </button>
      </div>
    );
  }

  return (
    <div className="container py-5 apple-style-bg">
      <div className="text-end mb-2">
        <button
          className="btn btn-sm btn-outline-secondary rounded-5"
          onClick={() => document.body.classList.toggle("dark-mode")}
        >
          🌓 Cambia tema
        </button>
      </div>

      <h1 className="text-center gradient-title display-5 mb-4">
        Gestionale Clienti
      </h1>

      {avvisi.length > 0 && (
        <div className="alert alert-warning rounded-4 shadow-sm">
          <strong>Attenzione:</strong> Hai {avvisi.length} polizza/e in scadenza
          nei prossimi 15 giorni.
        </div>
      )}

      <div className="row mb-4 text-center">
        <div className="col">
          <div className="stat-box bg-primary text-white rounded-4 shadow-sm p-3">
            Totale: {totale}
          </div>
        </div>
        <div className="col">
          <div className="stat-box bg-info text-white rounded-4 shadow-sm p-3">
            RCA: {totRca}
          </div>
        </div>
        <div className="col">
          <div className="stat-box bg-success text-white rounded-4 shadow-sm p-3">
            Vita: {totVita}
          </div>
        </div>
        <div className="col">
          <div className="stat-box bg-secondary text-white rounded-4 shadow-sm p-3">
            Danni: {totDanni}
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-center gap-3 mb-4 flex-wrap">
        <button
          className="btn btn-outline-dark rounded-5 shadow-sm px-4"
          onClick={esportaClienti}
        >
          📤 Esporta clienti (.json)
        </button>
        <label className="btn btn-outline-primary rounded-5 shadow-sm px-4">
          📥 Importa clienti (.json)
          <input
            type="file"
            accept=".json"
            hidden
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (event) => {
                try {
                  const datiImportati = JSON.parse(event.target.result);
                  if (Array.isArray(datiImportati)) {
                    setClienti(datiImportati);
                    alert("Clienti importati correttamente!");
                  } else {
                    alert("Il file non contiene un array valido.");
                  }
                } catch (err) {
                  alert("Errore durante l'importazione: file non valido.");
                }
              };
              reader.readAsText(file);
            }}
          />
        </label>
        <button
          className="btn btn-success rounded-5 shadow"
          onClick={() => {
            setForm({
              nome: "",
              cognome: "",
              polizza: "",
              telefono: "",
              numeroPolizza: "",
              dataFirma: "",
              dataScadenza: "",
              note: "",
              tags: "",
              file: null,
            });
            setModificaIndex(null);
            setMostraForm(true);
          }}
        >
          ➕ Aggiungi cliente
        </button>
      </div>

      {/* Modal form semplificata, no trasparenze */}
      {mostraForm && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content rounded-4 shadow-lg border border-light bg-light text-white">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modificaIndex !== null
                    ? "Modifica Cliente"
                    : "Aggiungi Cliente"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setMostraForm(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  {["nome", "cognome", "numeroPolizza", "telefono"].map(
                    (field, i) => (
                      <div className="col-md-6" key={i}>
                        <input
                          className="form-control"
                          name={field}
                          placeholder={field}
                          value={form[field]}
                          onChange={handleChange}
                        />
                      </div>
                    )
                  )}
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
                    <input
                      className="form-control"
                      type="text"
                      name="tags"
                      placeholder="Tag"
                      value={form.tags}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-12">
                    <input
                      className="form-control"
                      type="file"
                      name="file"
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setMostraForm(false)}
                >
                  Chiudi
                </button>
                <button className="btn btn-primary" onClick={aggiungiCliente}>
                  {modificaIndex !== null ? "Salva" : "Aggiungi"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row g-3 mb-4 align-items-end">
        <div className="col-md-8">
          <input
            type="text"
            className="form-control rounded-5 shadow"
            placeholder="Cerca cliente per nome o cognome..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <select
            className="form-select rounded-5 shadow"
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value)}
          >
            <option value="">Tutti i tipi di polizza</option>
            <option value="rca">RCA</option>
            <option value="vita">Vita</option>
            <option value="danni">Danni</option>
          </select>
        </div>
      </div>

      <div className="row">
        {clientiFiltrati.map((c, index) => (
          <div className="col-md-6 mb-3" key={index}>
            <div
              className={`card shadow border-${getColoreStato(
                c.dataScadenza
              )} rounded-5`}
            >
              <div className="card-body">
                <h5 className="card-title fw-semibold">
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
                <ul className="list-unstyled small text-muted">
                  <li>
                    <strong>Polizza:</strong> {c.polizza.toUpperCase()} – #
                    {c.numeroPolizza}
                  </li>
                  <li>
                    <strong>Telefono:</strong> {c.telefono}
                  </li>
                  <li>
                    <strong>Firma:</strong> {c.dataFirma}
                  </li>
                  <li>
                    <strong>Scadenza:</strong> {c.dataScadenza}
                  </li>
                  <li>
                    <strong>Note:</strong> {c.note}
                  </li>
                  {c.tags && (
                    <li>
                      <strong>Tag:</strong> {c.tags}
                    </li>
                  )}
                  {c.fileName && (
                    <li>
                      <strong>File:</strong> {c.fileName}
                    </li>
                  )}
                </ul>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-primary btn-sm rounded-5 shadow"
                    onClick={() => modificaCliente(index)}
                  >
                    Modifica
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm rounded-5 shadow"
                    onClick={() => eliminaCliente(index)}
                  >
                    Elimina
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
