import "server-only";

// Week 3, hosted: the apps the help desk tickets break, on web01.
//
// In a hosted pod the intranet's apps live where a real firm would put them,
// on an application server, and DC01 is the IT workstation the technician
// works from. Traffic between the two crosses a real network, web01's own
// firewall really drops packets, and the services are real systemd units with
// real logs. Self-built labs have no web01 and keep the DC01-only version of
// the challenge (challenge-network-change.md).
//
// The same script runs at web01's first boot (appended to linuxCloudInit) and,
// for pods built before it existed, over SSM when Range repairs the lab. It is
// idempotent: a marker file stops it running twice, so nothing a student fixed
// is ever put back.
//
// What it plants, one fault per ticket:
//  - portal          nginx serves the intranet on 80. Nothing is broken here:
//                    the fault is the DNS record on DC01 (INC-1095).
//  - rptdash         served by the same nginx. Its CNAME was deleted on DC01.
//  - timesheet       /etc/purvex/timesheet.conf binds it to 127.0.0.1:8085, so
//                    DC01 gets a RST.
//  - expenses        listens on 0.0.0.0:8090 after an upgrade moved it from
//                    8080, but ufw still allows only 8080: DC01's SYNs are
//                    dropped (filtered), and /var/log/ufw.log records them.
//  - backup agent    stopped and disabled through sudo by nb.ellison, the
//                    contractor's account, which is then locked. auth.log and
//                    the journal keep the sudo line.
// ufw keeps 22 and 3389 open, or the student would lose web01's terminal and
// desktop; outbound stays open, so the settlement job and SSM keep working.

export const WEB01_WEEK3_MARK = "/etc/purvex/week3-web01-v1";

const SERVICES_PY = String.raw`#!/usr/bin/env python3
"""PurveX lab services on web01. One file, one mode per systemd unit."""
import configparser
import socket
import sys
import threading
import time


def serve(host, port, handler):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.bind((host, port))
    s.listen(32)
    while True:
        conn, _ = s.accept()
        threading.Thread(target=handler, args=(conn,), daemon=True).start()


def http(route):
    def handle(conn):
        try:
            conn.settimeout(5)
            data = b""
            while b"\r\n\r\n" not in data and len(data) < 65536:
                chunk = conn.recv(4096)
                if not chunk:
                    break
                data += chunk
            head, _, body = data.partition(b"\r\n\r\n")
            lines = head.decode("latin-1").split("\r\n")
            length = 0
            for line in lines[1:]:
                if line.lower().startswith("content-length:"):
                    length = int(line.split(":", 1)[1].strip() or 0)
            while len(body) < length:
                chunk = conn.recv(4096)
                if not chunk:
                    break
                body += chunk
            status, text = route(lines[0])
            payload = text.encode()
            conn.sendall(
                b"HTTP/1.1 " + status.encode() + b"\r\nContent-Type: text/plain\r\nContent-Length: "
                + str(len(payload)).encode() + b"\r\nConnection: close\r\n\r\n" + payload
            )
        except Exception:
            pass
        finally:
            conn.close()
    return handle


def timesheet():
    cfg = configparser.ConfigParser()
    cfg.read("/etc/purvex/timesheet.conf")
    host = cfg.get("server", "listen_address", fallback="127.0.0.1")
    port = cfg.getint("server", "port", fallback=8085)
    print(f"PurveX Timesheet v3 listening on {host}:{port}", flush=True)
    serve(host, port, http(lambda line: ("200 OK", "Timesheet saved.")))


def expenses():
    def route(line):
        parts = line.split(" ")
        path = parts[1] if len(parts) > 1 else ""
        if path.startswith("/api/v2/expenses"):
            return "200 OK", "Expense received."
        return "404 Not Found", "Not found."
    print("PurveX Expenses API v2 listening on 0.0.0.0:8090", flush=True)
    serve("0.0.0.0", 8090, http(route))


def backup():
    def handle(conn):
        try:
            conn.sendall(b"PurveX Backup Agent 4.2 ready\r\n")
            time.sleep(3)
        except Exception:
            pass
        finally:
            conn.close()
    print("PurveX Backup Agent 4.2 listening on 0.0.0.0:9500", flush=True)
    serve("0.0.0.0", 9500, handle)


{"timesheet": timesheet, "expenses": expenses, "backup": backup}[sys.argv[1]]()
`;

const unit = (name: string, description: string, mode: string) => `cat > /etc/systemd/system/${name}.service <<'UNIT'
[Unit]
Description=${description}
After=network-online.target
Wants=network-online.target

[Service]
ExecStart=/usr/bin/python3 /opt/purvex/services.py ${mode}
Restart=on-failure
RestartSec=5
DynamicUser=yes

[Install]
WantedBy=multi-user.target
UNIT`;

/** The plant itself, as one bash script. */
export const WEB01_WEEK3_SCRIPT = `#!/bin/bash
# PurveX Week 3 (hosted lab): the help desk outages, on web01.
set -u
MARK=${WEB01_WEEK3_MARK}
[ -f "$MARK" ] && exit 0
mkdir -p /etc/purvex /opt/purvex

# The intranet portal and the Reports Dashboard, both on nginx.
mkdir -p /var/www/html
echo 'PurveX Financial Intranet. Served from WEB01 (CHG-3301).' > /var/www/html/index.html
systemctl enable --now nginx 2>/dev/null || true

cat > /opt/purvex/services.py <<'PYEOF'
${SERVICES_PY}PYEOF
chmod 0755 /opt/purvex/services.py

cat > /etc/purvex/timesheet.conf <<'CONF'
# PurveX Timesheet service v3 (CHG-3303).
# Restart the purvex-timesheet service after changing this file.
[server]
listen_address = 127.0.0.1
port = 8085
CONF
chmod 0644 /etc/purvex/timesheet.conf

${unit("purvex-timesheet", "PurveX Timesheet service", "timesheet")}
${unit("purvex-expenses", "PurveX Expenses API", "expenses")}
${unit("purvex-backup-agent", "PurveX Backup Agent", "backup")}
systemctl daemon-reload
systemctl enable --now purvex-timesheet purvex-expenses purvex-backup-agent

# web01's firewall. CHG-3304 moved the Expenses API from 8080 to 8090 and
# never updated the rule.
command -v ufw >/dev/null 2>&1 || apt-get install -y --no-install-recommends ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 3389/tcp comment 'Remote desktop'
ufw allow 80/tcp comment 'Intranet portal'
ufw allow 8085/tcp comment 'Timesheet'
ufw allow 8080/tcp comment 'Expenses API'
ufw allow 9500/tcp comment 'Backup agent'
ufw logging low
ufw --force enable

# The contractor's account stops the backup agent "for the cutover" through
# sudo, so the trail is the real one, then the account is locked as the
# contractor is offboarded.
id -u nb.ellison >/dev/null 2>&1 || useradd -m -s /bin/bash -c 'NetBridge Services (contractor)' nb.ellison
echo 'nb.ellison ALL=(root) NOPASSWD: /usr/bin/systemctl' > /etc/sudoers.d/90-netbridge
chmod 0440 /etc/sudoers.d/90-netbridge
sleep 2
runuser -u nb.ellison -- sudo -n /usr/bin/systemctl disable --now purvex-backup-agent
rm -f /etc/sudoers.d/90-netbridge
usermod -L nb.ellison

touch "$MARK"
echo "PurveX Week 3 web01 plant finished"
`;

/** Bash lines that write the plant to disk and run it. Base64, so no quoting has to survive SSM or cloud-init. */
export function web01Week3Commands(): string[] {
  const b64 = Buffer.from(WEB01_WEEK3_SCRIPT, "utf8").toString("base64");
  return [
    "install -d -m 0700 /usr/local/sbin",
    `echo '${b64}' | base64 -d > /usr/local/sbin/purvex-week3-web01.sh`,
    "chmod 0700 /usr/local/sbin/purvex-week3-web01.sh",
    "/usr/local/sbin/purvex-week3-web01.sh",
  ];
}
