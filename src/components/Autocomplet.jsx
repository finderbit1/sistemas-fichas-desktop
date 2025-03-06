import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { Typeahead } from 'react-bootstrap-typeahead';


const AutocompleteClientes = () => {
    const [clientes, setClientes] = useState([]);
    const [input, setInput] = useState('');

    useEffect(() => {
        invoke('listar_clientes')
            .then((res) => setClientes(res))
            .catch(console.error);
    }, []);

    return (
        <>
            <input
                list="clientes-list"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite o nome do cliente"
            />
            <datalist id="clientes-list">
                {clientes.map((c) => (
                    <option key={c.id} value={c.nome} />
                ))}
            </datalist>
        </>
    );
};

export default AutocompleteClientes;
