"""
Simple Hello World HTTP server.
Used as the application entry point for the Docker image tutorial.
Listens on 0.0.0.0:8080 and responds with "Hello, World!" to any GET request.
"""

from http.server import BaseHTTPRequestHandler, HTTPServer


class HelloWorldHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.end_headers()
        self.wfile.write(b"Hello, World!\n")

    def log_message(self, format, *args):
        # Override to include timestamp in stdout (visible in `docker logs`)
        print(f"[{self.log_date_time_string()}] {format % args}")


if __name__ == "__main__":
    host = "0.0.0.0"
    port = 8080
    server = HTTPServer((host, port), HelloWorldHandler)
    print(f"Server running on http://{host}:{port}")
    server.serve_forever()
