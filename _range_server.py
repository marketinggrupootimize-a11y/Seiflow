"""Static server with HTTP 206 Range support — required for video seeking."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parent


class RangeHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def send_head(self):
        path = Path(self.translate_path(self.path))
        if not path.is_file():
            return super().send_head()

        ctype = self.guess_type(str(path))
        data = path
        size = data.stat().st_size
        range_header = self.headers.get("Range")

        if not range_header:
            self.send_response(200)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(size))
            self.send_header("Accept-Ranges", "bytes")
            self.end_headers()
            return data.open("rb")

        # bytes=start-end
        try:
            units, rng = range_header.split("=", 1)
            start_s, end_s = rng.split("-", 1)
            start = int(start_s) if start_s else 0
            end = int(end_s) if end_s else size - 1
        except Exception:
            self.send_error(416, "Invalid Range")
            return None

        if start >= size:
            self.send_error(416, "Range Not Satisfiable")
            return None

        end = min(end, size - 1)
        length = end - start + 1
        self.send_response(206)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.send_header("Content-Length", str(length))
        self.send_header("Accept-Ranges", "bytes")
        self.end_headers()
        fh = data.open("rb")
        fh.seek(start)
        self._range_length = length
        return fh

    def copyfile(self, source, outputfile):
        remaining = getattr(self, "_range_length", None)
        if remaining is None:
            return super().copyfile(source, outputfile)
        while remaining > 0:
            chunk = source.read(min(64 * 1024, remaining))
            if not chunk:
                break
            outputfile.write(chunk)
            remaining -= len(chunk)


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8770
    httpd = ThreadingHTTPServer(("0.0.0.0", port), RangeHandler)
    print(f"serving {ROOT} on http://127.0.0.1:{port}", flush=True)
    print(f"rede local: http://192.168.0.12:{port}", flush=True)
    httpd.serve_forever()
