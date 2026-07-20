import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { api } from '../services/api.js';

const CORES = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function Relatorios({ onVoltar }) {
  const [transacoes, setTransacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    const data = await api.get('/transacoes?tamanho=1000');
    setTransacoes(data.content || []);
    setLoading(false);
  };

  const totalEntradas = transacoes
    .filter(t => t.tipo === 'ENTRADA')
    .reduce((acc, t) => acc + Number(t.valor), 0);

  const totalSaidas = transacoes
    .filter(t => t.tipo === 'SAIDA')
    .reduce((acc, t) => acc + Number(t.valor), 0);

  const gastosPorCategoria = transacoes
    .filter(t => t.tipo === 'SAIDA')
    .reduce((acc, t) => {
      const nome = t.categoria?.nome || 'Sem categoria';
      acc[nome] = (acc[nome] || 0) + Number(t.valor);
      return acc;
    }, {});

  const dadosCategoria = Object.entries(gastosPorCategoria).map(([nome, valor]) => ({
    nome,
    valor: parseFloat(valor.toFixed(2)),
  }));

  const dadosEntradasSaidas = [
    { nome: 'Entradas', valor: parseFloat(totalEntradas.toFixed(2)) },
    { nome: 'Saídas', valor: parseFloat(totalSaidas.toFixed(2)) },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-400">Relatórios</h1>
        <button
          onClick={onVoltar}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm transition-colors"
        >
          ← Voltar
        </button>
      </nav>

      <div className="p-6 space-y-6">

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">Total Entradas</p>
            <p className="text-2xl font-bold text-green-400">R$ {totalEntradas.toFixed(2)}</p>
          </div>
          <div className="bg-gray-800 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">Total Saídas</p>
            <p className="text-2xl font-bold text-red-400">R$ {totalSaidas.toFixed(2)}</p>
          </div>
          <div className="bg-gray-800 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">Saldo</p>
            <p className={`text-2xl font-bold ${totalEntradas - totalSaidas >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
              R$ {(totalEntradas - totalSaidas).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Entradas vs Saídas</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dadosEntradasSaidas}>
              <XAxis dataKey="nome" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
                cursor={{ fill: 'transparent' }}
              />
              <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                {dadosEntradasSaidas.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.nome === 'Entradas' ? '#10b981' : '#ef4444'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {dadosCategoria.length > 0 && (
          <div className="bg-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Gastos por categoria</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosCategoria}
                  dataKey="valor"
                  nameKey="nome"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ nome, valor }) => `${nome}: R$${valor}`}
                >
                  {dadosCategoria.map((_, index) => (
                    <Cell key={index} fill={CORES[index % CORES.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

      </div>
    </div>
  );
}