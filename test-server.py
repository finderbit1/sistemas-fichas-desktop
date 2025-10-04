#!/usr/bin/env python3
"""
Servidor de teste para os comandos Rust
Simula os comandos Tauri via HTTP para teste
"""

import json
import sqlite3
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading
import subprocess
import os

class RustCommandHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        if path == '/api/clientes':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            # Simular resposta dos clientes
            response = {
                "success": True,
                "data": [
                    {
                        "id": 1,
                        "nome": "Cliente Teste",
                        "email": "teste@email.com",
                        "telefone": "11999999999",
                        "endereco": "Rua Teste, 123"
                    }
                ]
            }
            self.wfile.write(json.dumps(response).encode())
            
        elif path == '/api/pedidos':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                "success": True,
                "data": [
                    {
                        "id": 1,
                        "numero": 1001,
                        "cliente_id": 1,
                        "valor_total": 150.00,
                        "status": "pendente"
                    }
                ]
            }
            self.wfile.write(json.dumps(response).encode())
            
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'Not Found')
    
    def do_POST(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        if path == '/api/clientes':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                response = {
                    "success": True,
                    "data": {
                        "id": 2,
                        "nome": data.get('nome', 'Novo Cliente'),
                        "email": data.get('email', ''),
                        "telefone": data.get('telefone', ''),
                        "endereco": data.get('endereco', '')
                    }
                }
                self.wfile.write(json.dumps(response).encode())
                
            except Exception as e:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(f'Error: {str(e)}'.encode())
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'Not Found')
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def start_test_server():
    server = HTTPServer(('localhost', 3001), RustCommandHandler)
    print("🚀 Servidor de teste iniciado em http://localhost:3001")
    print("📋 Endpoints disponíveis:")
    print("   GET  /api/clientes - Listar clientes")
    print("   POST /api/clientes - Criar cliente")
    print("   GET  /api/pedidos  - Listar pedidos")
    print("")
    print("🌐 Acesse: http://localhost:1420 (Frontend)")
    print("🔧 API Teste: http://localhost:3001/api/clientes")
    print("")
    server.serve_forever()

if __name__ == '__main__':
    start_test_server()





