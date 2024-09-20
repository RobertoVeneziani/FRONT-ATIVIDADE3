import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style.css';
import { FaEdit, FaTrash } from 'react-icons/fa';

const CadastroProprietario = () => {
  const [proprietarios, setProprietarios] = useState([]);
  const [carros, setCarros] = useState([]);
  const [dados, setDados] = useState({
    nomeProprietario: '',
    carroCodigo: ''
  });
  const [editando, setEditando] = useState(false);
  const [proprietarioEditando, setProprietarioEditando] = useState(null);

  // Buscar carros cadastrados
  useEffect(() => {
    axios.get('http://localhost:5000/carro')
      .then(response => {
        setCarros(response.data.listaCarros || []);
      })
      .catch(error => console.error('Erro ao buscar carros:', error));
  }, []);

  // Buscar proprietários cadastrados
  useEffect(() => {
    axios.get('http://localhost:5000/proprietario')
      .then(response => {
        setProprietarios(response.data.listaProprietarios || []);
      })
      .catch(error => console.error('Erro ao buscar proprietários:', error));
  }, []);

  // Lidar com mudanças nos inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setDados({ ...dados, [name]: value });
  };

  // Salvar ou atualizar proprietário
  const salvarProprietario = () => {
    const dadosParaEnvio = {
      nome: dados.nomeProprietario,
      carroCodigo: dados.carroCodigo
    };

    if (editando && proprietarioEditando) {
      axios.put(`http://localhost:5000/proprietario/${proprietarioEditando.codigo}`, dadosParaEnvio)
        .then(response => {
          if (response.status === 200) {
            setProprietarios(proprietarios.map(proprietario => 
              proprietario.codigo === proprietarioEditando.codigo ? response.data : proprietario
            ));
            alert('Alterações salvas com sucesso');
            limparFormulario();
            window.location.reload()
          }
        })
        .catch(error => console.error('Erro ao atualizar proprietário:', error));
    } else {
      axios.post('http://localhost:5000/proprietario', dadosParaEnvio)
        .then(response => {
          if (response.status === 200) {
            setProprietarios([...proprietarios, response.data]);
            alert('Cadastrado com sucesso');
            limparFormulario();
            window.location.reload()
          }
        })
        .catch(error => console.error('Erro ao cadastrar proprietário:', error));
    }
  };

  // Excluir proprietário
  const excluirProprietario = (codigo, carros) => {
    if (!carros || carros.length === 0) {
      console.error('Este proprietário não tem carros associados!');
      return;
    }
  
    const carroCodigo = carros[0]?.codigo; // Pega o código do primeiro carro associado
    if (!carroCodigo) {
      console.error('O código do carro está vazio!');
      return;
    }
  
    axios({
      method: 'DELETE',
      url: `http://localhost:5000/proprietario/${codigo}`,
      data: {
        carroCodigo: carroCodigo
      },
      headers: { 'Content-Type': 'application/json' }
    })
    .then(() => {
      setProprietarios(proprietarios.filter(proprietario => proprietario.codigo !== codigo));
      alert('Proprietário excluído com sucesso');
      window.location.reload()
    })
    .catch(error => console.error('Erro ao excluir proprietário:', error));
  };
  

  // Iniciar edição
  const editarProprietario = (proprietario) => {
    setDados({
      nomeProprietario: proprietario.nome,
      carroCodigo: proprietario.carros.length > 0 ? proprietario.carros[0].codigo : ''
    });
    setProprietarioEditando(proprietario);
    setEditando(true);
    
  };

  // Limpar formulário
  const limparFormulario = () => {
    setDados({
      nomeProprietario: '',
      carroCodigo: ''
    });
    setEditando(false);
    setProprietarioEditando(null);
  };

  return (
    <div className="container">
      <h2 className="header">{editando ? 'Editar Proprietário' : 'Cadastro de Proprietário'}</h2>
      <form className="form">
        <div className="form-group">
          <label>Nome do Proprietário</label>
          <input
            type="text"
            name="nomeProprietario"
            value={dados.nomeProprietario}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Carro</label>
          <select
            name="carroCodigo"
            value={dados.carroCodigo}
            onChange={handleChange}
          >
            <option value="">Selecione um carro</option>
            {carros.map((carro) => (
              <option key={carro.codigo} value={carro.codigo}>
                {carro.nome}
              </option>
            ))}
          </select>
        </div>
        <button className="btn gravar" type="button" onClick={salvarProprietario}>
          {editando ? 'Salvar Alterações' : 'Gravar'}
        </button>
      </form>

      <h3 className="subheader">Proprietários Cadastrados</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Nome do Proprietário</th>
            <th>Carros</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {proprietarios.map((proprietario) => (
            <tr key={proprietario.codigo}>
              <td>{proprietario.nome}</td>
              <td>
                {proprietario.carros && proprietario.carros.length > 0
                  ? proprietario.carros.map((carro, index) => (
                      <span key={index}>
                        {carro.nome}
                        {index < proprietario.carros.length - 1 ? ', ' : ''}
                      </span>
                    ))
                  : 'Não possui'}
              </td>
              <td>
                <button className="btn editar" onClick={() => editarProprietario(proprietario)}>
                  <FaEdit />
                </button>
                <button
                  className="btn excluir"
                  onClick={() => excluirProprietario(proprietario.codigo, proprietario.carros)}
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CadastroProprietario;
