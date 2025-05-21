import { useState } from "react";
import * as XLSX from "xlsx";
import "./styles.css";

export default function App() {
  const [clienti, setClienti] = useState([]);
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
  const [modificaIndex, setModificaIndex] = useState(null);
  const [mostraForm, setMostraForm] = useState(false);

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
      const clientiAgg = [...clienti];
      clientiAgg[modificaIndex] = nuovoCliente;
      setClienti(clientiAgg);
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

  const esportaExcel = () => {
    const ws = XLSX.utils.json_to_sheet(clienti);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clienti");
    XLSX.writeFile(wb, "clienti.xlsx");
  };

  const importaExcel = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const sheetName = wb.SheetNames[0];
      const sheet = wb.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);
      setClienti(data);
      alert("Clienti importati correttamente!");
    };
    reader.readAsBinaryString(file);
  };

  const eliminaCliente = (index) => {
    const nuovi = clienti.filter((_, i) => i !== index);
    setClienti(nuovi);
  };

  const modificaCliente = (index) => {
    setForm(clienti[index]);
    setModificaIndex(index);
    setMostraForm(true);
  };

  const getColoreStato = (dataScadenza) => {
    const oggi = new Date();
    const scadenza = new Date(dataScadenza);
    const diff = (scadenza - oggi) / (1000 * 60 * 60 * 24);
    if (diff < 0) return "danger";
    if (diff <= 15) return "warning";
    return "success";
  };

  if (!autenticato) {
    return (
      <div className="container py-5">
        <h2 className="text-center mb-4">Accesso al Gestionale</h2>
        <input
          type="password"
          className="form-control mb-3 text-center"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="btn btn-primary w-100"
          onClick={() => password === "1234" && setAutenticato(true)}
        >
          Entra
        </button>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h1 className="text-center mb-4">Gestionale Clienti</h1>

      <div className="d-flex justify-content-center gap-3 mb-4 flex-wrap">
        <button className="btn btn-outline-dark" onClick={esportaExcel}>
          📤 Esporta clienti (.xlsx)
        </button>
        <label className="btn btn-outline-primary">
          📥 Importa clienti (.xlsx)
          <input type="file" accept=".xlsx" hidden onChange={importaExcel} />
        </label>
        <button className="btn btn-success" onClick={() => setMostraForm(true)}>
          ➕ Aggiungi cliente
        </button>
      </div>

      {mostraForm && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content p-4">
              <div className="modal-header">
                <h5 className="modal-title">Aggiungi o Modifica Cliente</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setMostraForm(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  {["Nome", "Cognome", "NumeroPolizza", "Telefono"].map(
                    (field, i) => {
                      const name =
                        field.charAt(0).toLowerCase() + field.slice(1);
                      return (
                        <div className="col-md-6" key={i}>
                          <input
                            className="form-control"
                            name={name}
                            placeholder={field}
                            value={form[name] || ""}
                            onChange={handleChange}
                          />
                        </div>
                      );
                    }
                  )}
                  <div className="col-md-6">
                    <select
                      className="form-select"
                      name="polizza"
                      value={form.polizza}
                      onChange={handleChange}
                    >
                      <option value="">Tipo di Polizza</option>
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
                    />
                  </div>
                  <div className="col-12">
                    <input
                      className="form-control"
                      name="tags"
                      placeholder="Tag"
                      value={form.tags}
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
                  Salva
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        {clienti.map((c, index) => (
          <div className="col-md-6 mb-3" key={index}>
            <div className={`card border-${getColoreStato(c.dataScadenza)}`}>
              <div className="card-body">
                <h5 className="card-title">
                  {c.nome} {c.cognome}
                </h5>
                <span
                  className={`badge bg-${getColoreStato(c.dataScadenza)} mb-2`}
                >
                  {getColoreStato(c.dataScadenza) === "success"
                    ? "Attiva"
                    : getColoreStato(c.dataScadenza) === "warning"
                    ? "In Scadenza"
                    : "Scaduta"}
                </span>
                <ul className="list-unstyled small">
                  <li>
                    <strong>Polizza:</strong> {c.polizza}
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
                </ul>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => modificaCliente(index)}
                  >
                    Modifica
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
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
