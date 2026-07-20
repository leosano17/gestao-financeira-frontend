import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Dashboard from './pages/Dashboard';
import Relatorios from './pages/Relatorios';

export default function App() {
  const { isAuthenticated } = useAuth();
  const [tela, setTela] = useState('login');

  if (isAuthenticated) {
    if (tela === 'relatorios') {
      return <Relatorios onVoltar={() => setTela('dashboard')} />;
    }
    return <Dashboard onRelatorios={() => setTela('relatorios')} />;
  }

  if (tela === 'cadastro') {
    return <Cadastro onVoltar={() => setTela('login')} />;
  }

  return <Login onCadastro={() => setTela('cadastro')} />;
}