const express = require('express');
const translate = require('node-google-translate-skidz');
const bodyParser = require('body-parser'); // Importar body-parser
const app = express();
const port = 3000;

// Middleware para parsear JSON
app.use(bodyParser.json());
app.use(express.static('public'));

// Cambiar a POST para la ruta de traducción
app.post("/translate", (req, res) => {
    const { text, source, target } = req.body;
  
    translate({ text, source, target }, function (result) {
      if (result && result. translation) {
        res.json({ translation: result.translation });
      } else {
        res.status(500).json({ error: "Translation error" });
      }
    });
  });
// Middleware de 404
app.use((req, res, next) => { 
    res.status(404).send('404 not found');
});

// Inicia el servidor
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
