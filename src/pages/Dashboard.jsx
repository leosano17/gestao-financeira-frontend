import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

export default function Dashboard() {
  const { logout } = useAuth();
  const [saldo, setSaldo] = useState(null);
  const [transacoes, setTransacoes] = useState([]);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    const saldoData = await api.get('/transacoes/saldo');
    const transacoesData = await api.get('/transacoes');
    setSaldo(saldoData);
    setTransacoes(transacoesData.content || []);
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

        <h2 className="text-lg font-semibold mb-4">Últimas transações</h2>

        <div className="space-y-3">
          {transacoes.map((t) => (
            <div key={t.id} className="bg-gray-800 rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{t.descricao}</p>
                <p className="text-gray-400 text-sm">{t.data} · {t.categoria?.nome}</p>
              </div>
              <p className={`font-bold text-lg ${t.tipo === 'ENTRADA' ? 'text-green-400' : 'text-red-400'}`}>
                {t.tipo === 'ENTRADA' ? '+' : '-'} R$ {Number(t.valor).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}