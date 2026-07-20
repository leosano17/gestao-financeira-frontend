import { useState } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Cadastro from './pages/Cadastro.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Relatorios from './pages/Relatorios.jsx';

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