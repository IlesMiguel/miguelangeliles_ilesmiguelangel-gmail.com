import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost/Prueba/backend/api/productos.php";

function FlagImg({ pais }) {
  const [flag, setFlag] = useState(null);

  useEffect(() => {
    if (!pais) return;
    fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(pais)}?fields=flags,name`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data[0]?.flags?.svg) {
          setFlag(data[0].flags.svg);
        } else {
          setFlag(null);
        }
      })
      .catch(() => setFlag(null));
  }, [pais]);

  return flag ? (
    <img
      src={flag}
      alt={pais}
      title={pais}
      style={{ width: 28, height: 18, objectFit: "cover", borderRadius: 3 }}
    />
  ) : (
    <span style={{ fontSize: 12, color: "#999" }}>{pais}</span>
  );
}

const emptyForm = {
  codigo: "",
  nombre: "",
  precio: "",
  stock: "",
  pais_origen: "",
};

export default function App() {
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchProductos = async (q = "") => {
    setLoading(true);
    setError(null);
    try {
      const url = q ? `${API}?search=${encodeURIComponent(q)}` : API;
      const res = await axios.get(url);
      setProductos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetch:", err);
      setError("Error al cargar productos. Verifica que el backend esté corriendo.");
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    fetchProductos(val);
  };

  const handleSubmit = async () => {
    if (!form.codigo || !form.nombre || !form.precio || !form.stock || !form.pais_origen) {
      setError("Todos los campos son obligatorios.");
      return;
    }
    setError(null);
    try {
      if (editId) {
        const res = await axios.put(`${API}?id=${editId}`, form);
        console.log("Editar respuesta:", res.data);
      } else {
        const res = await axios.post(API, form);
        console.log("Crear respuesta:", res.data);
      }
      setForm(emptyForm);
      setEditId(null);
      setShowForm(false);
      await fetchProductos(search);
    } catch (err) {
      console.error("Error guardar:", err);
      setError("Error al guardar el producto.");
    }
  };

  const handleEdit = (p) => {
    setForm({
      codigo: p.codigo,
      nombre: p.nombre,
      precio: p.precio,
      stock: p.stock,
      pais_origen: p.pais_origen,
    });
    setEditId(p.id);
    setShowForm(true);
    setError(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    try {
      await axios.delete(`${API}?id=${id}`);
      await fetchProductos(search);
    } catch (err) {
      console.error("Error eliminar:", err);
      setError("Error al eliminar el producto.");
    }
  };

  const cancelForm = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(false);
    setError(null);
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem", fontFamily: "sans-serif" }}>
      <h1 style={{ color: "#c0392b" }}>🗃 Inventario de Productos</h1>

      {/* Barra superior */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <input
          placeholder="Buscar por nombre o código..."
          value={search}
          onChange={handleSearch}
          style={inputStyle}
        />
        <button
          onClick={() => {
            setShowForm(true);
            setEditId(null);
            setForm(emptyForm);
            setError(null);
          }}
          style={btnStyle("#c0392b")}
        >
          + Nuevo Producto
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: "#fdecea", color: "#c0392b", padding: 10, borderRadius: 6, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <div style={{ background: "#f9f9f9", border: "1px solid #ddd", borderRadius: 8, padding: 20, marginBottom: 20 }}>
          <h3 style={{ margin: "0 0 16px" }}>
            {editId ? "Editar Producto" : "Nuevo Producto"}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              ["codigo", "Código"],
              ["nombre", "Nombre"],
              ["precio", "Precio"],
              ["stock", "Stock"],
              ["pais_origen", "País de Origen"],
            ].map(([key, label]) => (
              <div key={key}>
                <label style={{ fontSize: 13, color: "#555", display: "block", marginBottom: 4 }}>
                  {label}
                </label>
                <input
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  type={["precio", "stock"].includes(key) ? "number" : "text"}
                  style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
                />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <button onClick={handleSubmit} style={btnStyle("#27ae60")}>
              💾 Guardar
            </button>
            <button onClick={cancelForm} style={btnStyle("#7f8c8d")}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Tabla */}
      {loading ? (
        <p style={{ textAlign: "center", color: "#999" }}>⏳ Cargando...</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#c0392b", color: "#fff" }}>
              {["Código", "Nombre", "Precio", "Stock", "País", "Acciones"].map((h) => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {productos.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 30, color: "#999" }}>
                  No hay productos
                </td>
              </tr>
            ) : (
              productos.map((p, i) => (
                <tr key={p.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={tdStyle}>{p.codigo}</td>
                  <td style={tdStyle}>{p.nombre}</td>
                  <td style={tdStyle}>${Number(p.precio).toLocaleString("es-CO")}</td>
                  <td style={tdStyle}>{p.stock}</td>
                  <td style={{ ...tdStyle, display: "flex", alignItems: "center", gap: 8 }}>
                    <FlagImg pais={p.pais_origen} />
                    {p.pais_origen}
                  </td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => handleEdit(p)}
                      style={{ ...btnSmall, background: "#2980b9" }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      style={{ ...btnSmall, background: "#e74c3c", marginLeft: 6 }}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

const inputStyle = {
  padding: "8px 12px",
  border: "1px solid #ccc",
  borderRadius: 6,
  fontSize: 14,
  width: "100%",
};
const btnStyle = (bg) => ({
  background: bg,
  color: "#fff",
  border: "none",
  padding: "9px 18px",
  borderRadius: 6,
  cursor: "pointer",
  fontWeight: "bold",
});
const btnSmall = {
  color: "#fff",
  border: "none",
  padding: "5px 10px",
  borderRadius: 4,
  cursor: "pointer",
};
const tdStyle = { padding: "10px 12px", borderBottom: "1px solid #eee" };