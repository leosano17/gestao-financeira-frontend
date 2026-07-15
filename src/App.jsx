import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Dashboard from './pages/Dashboard';

export default function App() {
  const { isAuthenticated } = useAuth();
  const [tela, setTela] = useState('login');

  if (isAuthenticated) {
    return <Dashboard />;
  }

  if (tela === 'cadastro') {
    return <Cadastro onVoltar={() => setTela('login')} />;
  }

  return <Login onCadastro={() => setTela('cadastro')} />;
}