import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function Dashboard({ onRelatorios }) {
  const { logout } = useAuth();
  const [saldo, setSaldo] = useState(null);
  const [transacoes, setTransacoes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [mostrarNovaCategoria, setMostrarNovaCategoria] = useState(false);
  const [filtroMes, setFiltroMes] = useState(new Date().getMonth() + 1);
  const [filtroAno, setFiltroAno] = useState(new Date().getFullYear());
  const [transacaoEditando, setTransacaoEditando] = useState(null);
  const [form, setForm] = useState({
    descricao: '',
    valor: '',
    data: '',
    tipo: 'ENTRADA',
    categoria: { id: '' }
  });

  useEffect(() => {
    carregarDados();
  }, [filtroMes, filtroAno]);

  const carregarDados = async () => {
    const saldoData = await api.get('/transacoes/saldo');
    const dataInicio = `${filtroAno}-${String(filtroMes).padStart(2, '0')}-01`;
    const ultimoDia = new Date(filtroAno, filtroMes, 0).getDate();
    const dataFim = `${filtroAno}-${String(filtroMes).padStart(2, '0')}-${ultimoDia}`;
    const transacoesData = await api.get(`/transacoes/filtrar?dataInicio=${dataInicio}&dataFim=${dataFim}&tamanho=100`);
    const categoriasData = await api.get('/categorias');
    setSaldo(saldoData);
    setTransacoes(transacoesData.content || []);
    setCategorias(categoriasData || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dados = { ...form, valor: parseFloat(form.valor) };

    if (transacaoEditando) {
      await api.put(`/transacoes/${transacaoEditando}`, dados);
      setTransacaoEditando(null);
    } else {
      await api.postAuth('/transacoes', dados);
    }

    setForm({ descricao: '', valor: '', data: '', tipo: 'ENTRADA', categoria: { id: '' } });
    setMostrarForm(false);
    carregarDados();
  };

  const handleEditar = (t) => {
    setForm({
      descricao: t.descricao,
      valor: t.valor,
      data: t.data,
      tipo: t.tipo,
      categoria: { id: t.categoria?.id || '' }
    });
    setTransacaoEditando(t.id);
    setMostrarForm(true);
  };

  const handleNovaCategoria = async () => {
    if (!novaCategoria.trim()) return;
    await api.postAuth('/categorias', { nome: novaCategoria });
    setNovaCategoria('');
    setMostrarNovaCategoria(false);
    carregarDados();
  };

  const handleDeletar = async (id) => {
    if (!confirm('Tem certeza que deseja deletar esta transação?')) return;
    await api.delete(`/transacoes/${id}`);
    carregarDados();
  };

  const anos = [2023, 2024, 2025, 2026, 2027];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-400">Gestão Financeira</h1>
        <div className="flex gap-3">
          <button onClick={onRelatorios} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm transition-colors">
            Relatórios
          </button>
          <button onClick={logout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm transition-colors">
            Sair
          </button>
        </div>
      </nav>

      <div className="p-6">
        <div className="bg-gray-800 rounded-2xl p-6 mb-6">
          <p className="text-gray-400 text-sm mb-1">Saldo atual</p>
          <p className={`text-4xl font-bold ${saldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            R$ {saldo !== null ? Number(saldo).toFixed(2) : '...'}
          </p>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-3 items-center">
            <h2 className="text-lg font-semibold">Transações</h2>
            <select value={filtroMes} onChange={(e) => setFiltroMes(Number(e.target.value))}
              className="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {meses.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <select value={filtroAno} onChange={(e) => setFiltroAno(Number(e.target.value))}
              className="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {anos.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <button onClick={() => { setMostrarForm(!mostrarForm); setTransacaoEditando(null); setForm({ descricao: '', valor: '', data: '', tipo: 'ENTRADA', categoria: { id: '' } }); }}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm transition-colors w-full sm:w-auto">
            + Nova transação
          </button>
        </div>

        {mostrarForm && (
          <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl p-6 mb-6 space-y-4">
            <h3 className="text-white font-semibold">{transacaoEditando ? 'Editar transação' : 'Nova transação'}</h3>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Descrição</label>
              <input type="text" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Salário, Mercado..." required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Valor</label>
                <input type="number" step="0.01" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00" required />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Data</label>
                <input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-1 block">Tipo</label>
              <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="ENTRADA">Entrada</option>
                <option value="SAIDA">Saída</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-gray-400 text-sm">Categoria</label>
                <button type="button" onClick={() => setMostrarNovaCategoria(!mostrarNovaCategoria)}
                  className="text-blue-400 hover:text-blue-300 text-sm">
                  + Nova categoria
                </button>
              </div>
              {mostrarNovaCategoria && (
                <div className="flex gap-2 mb-2">
                  <input type="text" value={novaCategoria} onChange={(e) => setNovaCategoria(e.target.value)}
                    className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome da categoria" />
                  <button type="button" onClick={handleNovaCategoria}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm">Salvar</button>
                </div>
              )}
              <select value={form.categoria.id} onChange={(e) => setForm({ ...form, categoria: { id: parseInt(e.target.value) } })}
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="">Selecione uma categoria</option>
                {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors">
                {transacaoEditando ? 'Atualizar' : 'Salvar'}
              </button>
              <button type="button" onClick={() => { setMostrarForm(false); setTransacaoEditando(null); }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors">
                Cancelar
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {transacoes.length === 0 ? (
            <div className="bg-gray-800 rounded-xl p-8 text-center">
              <p className="text-gray-400">Nenhuma transação neste período.</p>
            </div>
          ) : (
            transacoes.map((t) => (
              <div key={t.id} className="bg-gray-800 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{t.descricao}</p>
                  <p className="text-gray-400 text-sm">{t.data} · {t.categoria?.nome}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className={`font-bold text-lg ${t.tipo === 'ENTRADA' ? 'text-green-400' : 'text-red-400'}`}>
                    {t.tipo === 'ENTRADA' ? '+' : '-'} R$ {Number(t.valor).toFixed(2)}
                  </p>
                  <button onClick={() => handleEditar(t)} className="text-gray-500 hover:text-blue-400 transition-colors text-sm">
                    Editar
                  </button>
                  <button onClick={() => handleDeletar(t.id)} className="text-gray-500 hover:text-red-400 transition-colors text-sm">
                    Deletar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}