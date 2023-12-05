const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'acesso123',
  database: 'escolasgovinfo',
});

// Página inicial
app.get('/', (req, res) => {
  res.render('index');
});

// Consulta por id_escola
app.get('/escola/:id_escola', (req, res) => {
  const { id_escola } = req.params;

  const sql = 'SELECT * FROM dataset WHERE id_escola = ?';

  db.query(sql, [id_escola], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ error: 'Escola não encontrada.' });
      return;
    }

    res.render('escolas', { escolas: results, id_escola });
  });
});

// Rota para calcular a média das colunas para um conjunto de registros
app.get('/media/:id_escola', (req, res) => {
  const { id_escola } = req.params;

  // Consulta para obter os dados específicos da escola
  const sql = 'SELECT * FROM dataset WHERE id_escola = ?';

  db.query(sql, [id_escola], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ error: 'Escola não encontrada.' });
      return;
    }

    // Extrai os valores das colunas específicas e filtra os valores "None"
    const columnsToAverage = [
      'taxa_aprovacao',
      'indicador_rendimento',
      'nota_saeb_matematica',
      'nota_saeb_lingua_portuguesa',
      'nota_saeb_media_padronizada',
      'ideb',
      'projecao'
    ];

    // Calcula a média das colunas e limita para 3 casas decimais
    const averageValues = columnsToAverage.map(column => {
      const value = results[0][column];
      const valuesArray = value.split(',').map(v => v.trim());

      // Filtra os valores não nulos e diferentes de "None" antes de calcular a média
      const nonNullValues = valuesArray
        .filter(v => v !== 'None' && v !== '')
        .map(v => parseFloat(v) || 0);

      const sum = nonNullValues.reduce((acc, v) => acc + v, 0);

      return nonNullValues.length > 0
        ? (sum / nonNullValues.length).toFixed(3)
        : 'Nenhum valor não nulo para calcular a média.';
    });

    // Renderiza a página de resultados
    res.render('result', { id_escola, media: averageValues });
  });
});

// Formulário para calcular média
app.get('/media', (req, res) => {
  const { id_escola } = req.query;

  if (!id_escola) {
    // Se o ID da escola não foi fornecido, redirecione para a rota de exemplo
    res.redirect('/media/exemplo');
    return;
  }

  // Redireciona para a rota específica que calcula a média
  res.redirect(`/media/${id_escola}`);
});

// Formulário para ver detalhes da escola
app.get('/escola', (req, res) => {
  const { id_escola } = req.query;

  if (!id_escola) {
    // Se o ID da escola não foi fornecido, redirecione para a rota de exemplo
    res.redirect('/escola/exemplo');
    return;
  }

  // Redireciona diretamente para a rota específica que exibe os detalhes da escola
  res.redirect(`/escola/${id_escola}`);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
