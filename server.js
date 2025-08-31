// Importação dos módulos necessários
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

// --- Configuração do Servidor ---
const app = express();
const PORT = process.env.PORT || 3001; // A porta do servidor

// --- Middlewares ---
app.use(cors()); // Habilita o CORS para que o frontend possa aceder ao backend
app.use(express.json()); // Habilita o parsing de JSON no corpo das requisições

// --- Configuração do Banco de Dados PostgreSQL ---
// Crie um ficheiro .env na raiz do projeto backend com a sua connection string
// Exemplo: DATABASE_URL="postgresql://user:password@host:port/database"
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// --- Rotas da API ---

// Rota de teste
app.get('/api', (req, res) => {
  res.json({ message: 'Bem-vindo à API do FuelControl!' });
});

// --- Rotas para VEÍCULO ---

// GET - Obter os dados do veículo (só há um veículo por utilizador neste modelo)
app.get('/api/vehicle', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vehicle LIMIT 1');
    res.json(result.rows[0] || null); // Retorna o primeiro veículo ou null
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST - Criar ou atualizar os dados do veículo
app.post('/api/vehicle', async (req, res) => {
  const { name, brand, model, year, color, photo } = req.body;
  try {
    // Tenta apagar o veículo antigo para garantir que só há um
    await pool.query('DELETE FROM vehicle'); 
    const result = await pool.query(
      'INSERT INTO vehicle (name, brand, model, year, color, photo) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, brand, model, year, color, photo]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// --- Rotas para POSTOS (STATIONS) ---

// GET - Obter todos os postos
app.get('/api/stations', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM stations ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST - Adicionar um novo posto
app.post('/api/stations', async (req, res) => {
  const { name, logo_url } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO stations (name, logo_url) VALUES ($1, $2) RETURNING *',
      [name, logo_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT - Atualizar um posto existente
app.put('/api/stations/:id', async (req, res) => {
  const { id } = req.params;
  const { name, logo_url } = req.body;
  try {
    const result = await pool.query(
      'UPDATE stations SET name = $1, logo_url = $2 WHERE id = $3 RETURNING *',
      [name, logo_url, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE - Apagar um posto
app.delete('/api/stations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM stations WHERE id = $1', [id]);
    res.status(204).send(); // Sem conteúdo
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// --- Rotas para ABASTECIMENTOS (LOGS) ---

// GET - Obter todos os abastecimentos
app.get('/api/logs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM fuel_logs ORDER BY date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST - Adicionar um novo abastecimento
app.post('/api/logs', async (req, res) => {
  const { date, company, fuel_type, price_per_liter, liters, total_value } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO fuel_logs (date, company, fuel_type, price_per_liter, liters, total_value) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [date, company, fuel_type, price_per_liter, liters, total_value]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT - Atualizar um abastecimento
app.put('/api/logs/:id', async (req, res) => {
  const { id } = req.params;
  const { date, company, fuel_type, price_per_liter, liters, total_value } = req.body;
  try {
    const result = await pool.query(
      'UPDATE fuel_logs SET date = $1, company = $2, fuel_type = $3, price_per_liter = $4, liters = $5, total_value = $6 WHERE id = $7 RETURNING *',
      [date, company, fuel_type, price_per_liter, liters, total_value, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE - Apagar um abastecimento
app.delete('/api/logs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM fuel_logs WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// --- Inicialização do Servidor ---
app.listen(PORT, () => {
  console.log(`Servidor a rodar na porta ${PORT}`);
});
