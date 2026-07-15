import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

export default function Dashboard() {
  const { logout } = useAuth();
  const [saldo, setSaldo] = useState(null);
  const [transacoes, setTransacoes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [mostrarNovaCategoria, setMostrarNovaCategoria] = useState(false);
  const [form, setForm] = useState({
    descricao: '',
    valor: '',
    data: '',
    tipo: 'ENTRADA',
    categoria: { id: '' }
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    const saldoData = await api.get('/transacoes/saldo');
    const transacoesData = await api.get('/transacoes');
    const categoriasData = await api.get('/categorias');
    setSaldo(saldoData);
    setTransacoes(transacoesData.content || []);
    setCategorias(categoriasData || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.postAuth('/transacoes', {
      ...form,
      valor: parseFloat(form.valor),
    });
    setForm({ descricao: '', valor: '', data: '', tipo: 'ENTRADA', categoria: { id: '' } });
    setMostrarForm(false);
    carregarDados();
  };

  const handleNovaCategoria = async () => {
    if (!novaCategoria.trim()) return;
    await api.postAuth('/categorias', { nome: novaCategoria });
    setNovaCategoria('');
    setMostrarNovaCategoria(false);
    carregarDados();
  };

  const handleDeletar = async (id) => {
    await api.delete(`/transacoes/${id}`);
    carregarDados();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-400">Gestão Financeira</h1>
        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Sair
        </button>
      </nav>

      <div className="p-6">
        <div className="bg-gray-800 rounded-2xl p-6 mb-6">
          <p className="text-gray-400 text-sm mb-1">Saldo atual</p>
          <p className={`text-4xl font-bold ${saldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            R$ {saldo !== null ? Number(saldo).toFixed(2) : '...'}
          </p>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Últimas transações</h2>
          <button
            onClick={() => setMostrarForm(!mostrarForm)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm transition-colors"
          >
            + Nova transação
          </button>
        </div>

        {mostrarForm && (
          <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl p-6 mb-6 space-y-4">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Descrição</label>
              <input
                type="text"
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Salário, Mercado..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Valor</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.valor}
                  onChange={(e) => setForm({ ...form, valor: e.target.value })}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-1 block">Data</label>
                <input
                  type="date"
                  value={form.data}
                  onChange={(e) => setForm({ ...form, data: e.target.value })}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-1 block">Tipo</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ENTRADA">Entrada</option>
                <option value="SAIDA">Saída</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-gray-400 text-sm">Categoria</label>
                <button
                  type="button"
                  onClick={() => setMostrarNovaCategoria(!mostrarNovaCategoria)}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  + Nova categoria
                </button>
              </div>

              {mostrarNovaCategoria && (
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={novaCategoria}
                    onChange={(e) => setNovaCategoria(e.target.value)}
                    className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome da categoria"
                  />
                  <button
                    type="button"
                    onClick={handleNovaCategoria}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm"
                  >
                    Salvar
                  </button>
                </div>
              )}

              <select
                value={form.categoria.id}
                onChange={(e) => setForm({ ...form, categoria: { id: parseInt(e.target.value) } })}
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => setMostrarForm(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {transacoes.map((t) => (
            <div key={t.id} className="bg-gray-800 rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{t.descricao}</p>
                <p className="text-gray-400 text-sm">{t.data} · {t.categoria?.nome}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className={`font-bold text-lg ${t.tipo === 'ENTRADA' ? 'text-green-400' : 'text-red-400'}`}>
                  {t.tipo === 'ENTRADA' ? '+' : '-'} R$ {Number(t.valor).toFixed(2)}
                </p>
                <button
                  onClick={() => handleDeletar(t.id)}
                  className="text-gray-500 hover:text-red-400 transition-colors text-sm"
                >
                  Deletar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}