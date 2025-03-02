const express = require("express");
const multer = require("multer");
const fs = require("fs");
const XLSX = require("xlsx");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname)); // Sirve index.html automáticamente

// Configurar Multer para subir archivos
const upload = multer({ dest: "uploads/" });

// 📌 Ruta para subir un archivo Excel
app.post("/upload", upload.single("file"), (req, res) => {
  try {
    const filePath = req.file.path;

    // Leer el archivo Excel
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });

    // Guardar los datos en data.json (manteniéndolo después del reinicio)
    fs.writeFileSync("data.json", JSON.stringify(jsonData, null, 2));

    // Eliminar el archivo Excel subido
    fs.unlinkSync(filePath);

    res.json({ message: "Disponibilidad actualizada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al procesar el archivo", error });
  }
});

// 📌 Ruta para obtener los datos guardados (manteniendo el último libro cargado)
app.get("/data", (req, res) => {
  try {
    if (fs.existsSync("data.json")) {
      const data = fs.readFileSync("data.json", "utf8");
      res.json(JSON.parse(data));
    } else {
      res.json([]); // Devuelve vacío si no hay datos guardados
    }
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los datos", error });
  }
});

// Asegurar que todas las rutas sirvan `index.html`
app.get("*", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
