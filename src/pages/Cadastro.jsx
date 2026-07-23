import { useState } from 'react';
import { api } from '../services/api.js';

export default function Cadastro({ onVoltar }) {
  const [form, setForm] = useState({ nome: '', email: '', senha: '' });
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const validarSenha = (senha) => {
    if (senha.length < 8) return 'Senha deve ter no mínimo 8 caracteres';
    if (!/[A-Z]/.test(senha)) return 'Senha deve ter pelo menos uma letra maiúscula';
    if (!/[a-z]/.test(senha)) return 'Senha deve ter pelo menos uma letra minúscula';
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(senha)) return 'Senha deve ter pelo menos um caractere especial';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const erroSenha = validarSenha(form.senha);
    if (erroSenha) {
      setErro(erroSenha);
      return;
    }

    if (form.senha !== confirmarSenha) {
      setErro('As senhas não coincidem');
      return;
    }

    const resposta = await api.post('/auth/cadastro', form);

    if (resposta.id) {
      setSucesso(true);
    } else if (resposta.senha) {
      setErro(resposta.senha);
    } else {
      setErro('Erro ao cadastrar. Tente outro email.');
    }
  };

  if (sucesso) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-2xl text-center">
          <p className="text-green-400 text-xl font-bold mb-4">Cadastro realizado!</p>
          <button
            onClick={onVoltar}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Fazer login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-2">Criar conta</h1>
        <p className="text-gray-400 mb-8">Preencha os dados para se cadastrar</p>

        {erro && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Nome</label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Seu nome"
              required
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Senha</label>
            <input
              type="password"
              value={form.senha}
              onChange={(e) => setForm({ ...form, senha: e.target.value })}
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mínimo 8 caracteres"
              required
            />
            <p className="text-gray-500 text-xs mt-1">Use maiúscula, minúscula e caractere especial</p>
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Confirmar senha</label>
            <input
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Cadastrar
          </button>

          <button
            type="button"
            onClick={onVoltar}
            className="w-full text-gray-400 hover:text-white py-2 transition-colors"
          >
            Já tenho conta
          </button>
        </form>
      </div>
    </div>
  );
}