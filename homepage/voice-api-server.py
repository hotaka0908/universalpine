#!/usr/bin/env python3

import os
import json
import requests
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import parse_qs
import cgi
import ssl

# OpenAI APIキーを環境変数から取得
API_KEY = os.environ.get('resend_key', '')

class VoiceAPIHandler(BaseHTTPRequestHandler):
    def _set_headers(self, content_type='application/json'):
        self.send_response(200)
        self.send_header('Content-type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_OPTIONS(self):
        self._set_headers()
        
    def do_POST(self):
        if self.path == '/api/transcribe':
            self.handle_transcribe()
        elif self.path == '/api/chat':
            self.handle_chat()
        elif self.path == '/api/speech':
            self.handle_speech()
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Not found'}).encode())
    
    def handle_transcribe(self):
        # マルチパートフォームデータを解析
        form = cgi.FieldStorage(
            fp=self.rfile,
            headers=self.headers,
            environ={'REQUEST_METHOD': 'POST'}
        )
        
        # 音声ファイルを取得
        file_item = form['file']
        temp_file_path = f"/tmp/voice_{os.urandom(8).hex()}.webm"
        
        with open(temp_file_path, 'wb') as f:
            f.write(file_item.file.read())
        
        try:
            # OpenAI Whisper APIを呼び出して音声をテキストに変換
            with open(temp_file_path, 'rb') as f:
                response = requests.post(
                    "https://api.openai.com/v1/audio/transcriptions",
                    headers={"Authorization": f"Bearer {API_KEY}"},
                    files={"file": f},
                    data={"model": "whisper-1", "language": "ja"}
                )
            
            # 一時ファイルを削除
            os.remove(temp_file_path)
            
            if response.status_code == 200:
                result = response.json()
                self._set_headers()
                self.wfile.write(json.dumps({'text': result['text']}).encode())
            else:
                print(f"Transcription error: {response.status_code} {response.text}")
                self._set_headers()
                self.wfile.write(json.dumps({'error': 'Transcription failed', 'details': response.text}).encode())
                
        except Exception as e:
            print(f"Error in transcription: {str(e)}")
            self._set_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())
    
    def handle_chat(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data)
        
        user_input = data.get('text', '')
        
        try:
            # OpenAI Chat APIを呼び出して応答を生成
            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-3.5-turbo",
                    "messages": [
                        {"role": "system", "content": "あなたはUniversal Pineという会社のAIアシスタントです。日本語で簡潔に応答してください。会社はAI技術を専門とし、AIネックレスという製品を開発しています。AIネックレスは日常の大切な瞬間を自動的に記録し、プライバシーを守りながら思い出を残す製品です。"},
                        {"role": "user", "content": user_input}
                    ],
                    "max_tokens": 150,
                    "temperature": 0.7
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                assistant_text = result['choices'][0]['message']['content']
                self._set_headers()
                self.wfile.write(json.dumps({'text': assistant_text}).encode())
            else:
                print(f"Chat error: {response.status_code} {response.text}")
                self._set_headers()
                self.wfile.write(json.dumps({'error': 'Chat failed', 'details': response.text}).encode())
                
        except Exception as e:
            print(f"Error in chat: {str(e)}")
            self._set_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())
    
    def handle_speech(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data)
        
        text = data.get('text', '')
        
        try:
            # OpenAI TTS APIを呼び出して音声を生成
            response = requests.post(
                "https://api.openai.com/v1/audio/speech",
                headers={"Authorization": f"Bearer {API_KEY}"},
                json={
                    "model": "tts-1",
                    "voice": "alloy",
                    "input": text,
                    "format": "mp3"
                },
                stream=True
            )
            
            if response.status_code == 200:
                self._set_headers('audio/mpeg')
                for chunk in response.iter_content(chunk_size=4096):
                    self.wfile.write(chunk)
            else:
                print(f"Speech error: {response.status_code} {response.text}")
                self._set_headers()
                self.wfile.write(json.dumps({'error': 'Speech generation failed', 'details': response.text}).encode())
                
        except Exception as e:
            print(f"Error in speech: {str(e)}")
            self._set_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())

def run(server_class=HTTPServer, handler_class=VoiceAPIHandler, port=8000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f"Starting voice API server on port {port}...")
    httpd.serve_forever()

if __name__ == "__main__":
    # APIキーが設定されているか確認
    if not API_KEY:
        print("Warning: OpenAI API key is not set. Set the 'resend_key' environment variable.")
    
    # サーバーを起動
    run(port=8000)
