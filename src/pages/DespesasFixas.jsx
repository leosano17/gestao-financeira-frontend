import { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import Loading from '../components/Loading.jsx';

export default function DespesasFixas({ onVoltar }) {
  const [despesas, setDespesas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState({
    descricao: '',
    valor: '',
    diaVencimento: '',
    categoria: { id: '' }
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    const despesasData = await api.get('/despesas-fixas');
    const categoriasData = await api.get('/categorias');
    setDespesas(despesasData || []);
    setCategorias(categoriasData || []);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dados = { ...form, valor: parseFloat(form.valor), diaVencimento: parseInt(form.diaVencimento) };

    if (editandoId) {
      await api.put(`/despesas-fixas/${editandoId}`, dados);
      setEditandoId(null);
    } else {
      await api.postAuth('/despesas-fixas', dados);
    }

    setForm({ descricao: '', valor: '', diaVencimento: '', categoria: { id: '' } });
    setMostrarForm(false);
    carregarDados();
  };

  const handleEditar = (d) => {
    setForm({
      descricao: d.descricao,
      valor: d.valor,
      diaVencimento: d.diaVencimento,
      categoria: { id: d.categoria?.id || '' }
    });
    setEditandoId(d.id);
    setMostrarForm(true);
  };

  const handleDeletar = async (id) => {
    if (!confirm('Deletar esta despesa fixa?')) return;
    await api.delete(`/despesas-fixas/${id}`);
    carregarDados();
  };

  const total = despesas.reduce((acc, d) => acc + Number(d.valor), 0);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          ControlaBolso
        </h1>
        <button onClick={onVoltar} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm transition-colors">
          ← Voltar
        </button>
      </nav>

      <div className="p-6">
        <div className="bg-gray-800 rounded-2xl p-6 mb-6">
          <p className="text-gray-400 text-sm mb-1">Total despesas fixas/mês</p>
          <p className="text-4xl font-bold text-red-400">- R$ {total.toFixed(2)}</p>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Despesas Fixas</h2>
          <button
            onClick={() => { setMostrarForm(!mostrarForm); setEditandoId(null); setForm({ descricao: '', valor: '', diaVencimento: '', categoria: { id: '' } }); }}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm transition-colors">
            + Nova despesa
          </button>
        </div>

        {mostrarForm && (
          <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl p-6 mb-6 space-y-4">
            <h3 className="text-white font-semibold">{editandoId ? 'Editar despesa' : 'Nova despesa fixa'}</h3>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Descrição</label>
              <input type="text" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Aluguel, Netflix..." required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Valor</label>
                <input type="number" step="0.01" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00" required />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Dia vencimento</label>
                <input type="number" min="1" max="31" value={form.diaVencimento} onChange={(e) => setForm({ ...form, diaVencimento: e.target.value })}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 10" required />
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Categoria</label>
              <select value={form.categoria.id} onChange={(e) => setForm({ ...form, categoria: { id: parseInt(e.target.value) } })}
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Selecione uma categoria</option>
                {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors">
                {editandoId ? 'Atualizar' : 'Salvar'}
              </button>
              <button type="button" onClick={() => { setMostrarForm(false); setEditandoId(null); }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors">
                Cancelar
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {loading ? <Loading /> : despesas.length === 0 ? (
            <div className="bg-gray-800 rounded-xl p-8 text-center">
              <p className="text-gray-400">Nenhuma despesa fixa cadastrada.</p>
            </div>
          ) : (
            despesas.map((d) => (
              <div key={d.id} className="bg-gray-800 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{d.descricao}</p>
                  <p className="text-gray-400 text-sm">Vence dia {d.diaVencimento} · {d.categoria?.nome}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-bold text-lg text-red-400">- R$ {Number(d.valor).toFixed(2)}</p>
                  <button onClick={() => handleEditar(d)} className="text-gray-500 hover:text-blue-400 transition-colors text-sm">Editar</button>
                  <button onClick={() => handleDeletar(d.id)} className="text-gray-500 hover:text-red-400 transition-colors text-sm">Deletar</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}