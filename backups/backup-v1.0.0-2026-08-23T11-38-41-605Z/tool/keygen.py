"""
ComplyTrack License Key Generator
Generates 16-digit license keys for 1-month, 3-month, and 1-year tiers.
Auto-saves every generated key to keys_log.txt with creation and expiry dates.
"""

import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import secrets
import string
import hashlib
import json
import os
from datetime import datetime, timedelta

# ── Key Format ──────────────────────────────────────────────
# 16 alphanumeric chars, grouped as XXXX-XXXX-XXXX-XXXX
# First 2 chars = tier prefix: 1M / 3M / 1Y
# Next  char   = checksum (hex digit)
# Remaining    = random payload
# ────────────────────────────────────────────────────────────

TIERS = {
    "1 Month":  {"prefix": "1M", "days": 30,  "color": "#3b82f6"},
    "3 Months": {"prefix": "3M", "days": 90,  "color": "#8b5cf6"},
    "1 Year":   {"prefix": "1Y", "days": 365, "color": "#10b981"},
}

ALPHABET = string.ascii_uppercase + string.digits
# Remove confusing chars
ALPHABET = ALPHABET.replace("O", "").replace("I", "").replace("L", "")

# ── Persistent Log File ─────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
KEYS_LOG = os.path.join(SCRIPT_DIR, "keys_log.txt")
KEYS_JSON = os.path.join(SCRIPT_DIR, "keys_log.json")


def _checksum(data: str) -> str:
    h = hashlib.sha256(data.encode()).hexdigest()
    return h[0].upper()


def generate_key(tier_label: str) -> str:
    info = TIERS[tier_label]
    prefix = info["prefix"]

    # 13 random chars + 2 prefix + 1 checksum = 16 total
    payload = "".join(secrets.choice(ALPHABET) for _ in range(13))
    raw = prefix + payload
    cs = _checksum(raw)
    full = prefix + cs + payload  # 2 + 1 + 13 = 16

    # Format as XXXX-XXXX-XXXX-XXXX
    return "-".join(full[i:i+4] for i in range(0, 16, 4))


def decode_key(key: str) -> dict:
    clean = key.replace("-", "").replace(" ", "").upper()
    if len(clean) != 16:
        return None

    prefix = clean[:2]
    tier_info = None
    for label, info in TIERS.items():
        if info["prefix"] == prefix:
            tier_info = info
            tier_label = label
            break

    if not tier_info:
        return None

    cs_input = clean[:2] + clean[3:]  # skip only the checksum at position 2
    expected_cs = _checksum(cs_input)
    actual_cs = clean[2]

    valid = expected_cs == actual_cs

    return {
        "key": "-".join(clean[i:i+4] for i in range(0, 16, 4)),
        "tier": tier_label,
        "prefix": prefix,
        "days": tier_info["days"],
        "valid_checksum": valid,
    }


def load_previous_keys() -> list[dict]:
    """Load previously generated keys from JSON log."""
    if os.path.exists(KEYS_JSON):
        try:
            with open(KEYS_JSON, "r") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            pass
    return []


def save_keys_to_json(keys: list[dict]):
    """Save all keys to JSON log."""
    with open(KEYS_JSON, "w") as f:
        json.dump(keys, f, indent=2)


def append_key_to_log(entry: dict):
    """Append a single key entry to the txt log file."""
    with open(KEYS_LOG, "a") as f:
        f.write(f"{entry['key']}  |  {entry['tier']}  |  Created: {entry['created']}  |  Expires: {entry['expires']}\n")


def init_log_file():
    """Create the log file with header if it doesn't exist."""
    if not os.path.exists(KEYS_LOG):
        with open(KEYS_LOG, "w") as f:
            f.write("=" * 72 + "\n")
            f.write("  ComplyTrack License Keys Log\n")
            f.write(f"  Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write("=" * 72 + "\n\n")


class KeyGenApp:
    def __init__(self, root: tk.Tk):
        self.root = root
        self.root.title("ComplyTrack - License Key Generator")
        self.root.geometry("780x640")
        self.root.resizable(False, False)
        self.root.configure(bg="#0f172a")

        # Load previous keys from persistent storage
        self.generated_keys: list[dict] = load_previous_keys()

        # Initialize log file
        init_log_file()

        self._build_ui()

        # Show how many previous keys were loaded
        if self.generated_keys:
            self.status_label.configure(
                text=f"Loaded {len(self.generated_keys)} previously generated key(s)"
            )
            self._refresh_tree()

    # ── UI ──────────────────────────────────────────────
    def _build_ui(self):
        style = ttk.Style()
        style.theme_use("clam")
        style.configure("TFrame", background="#0f172a")
        style.configure("TLabel", background="#0f172a", foreground="#e2e8f0", font=("Segoe UI", 11))
        style.configure("Header.TLabel", background="#0f172a", foreground="#f8fafc", font=("Segoe UI", 22, "bold"))
        style.configure("Sub.TLabel", background="#0f172a", foreground="#94a3b8", font=("Segoe UI", 10))
        style.configure("Tier.TButton", font=("Segoe UI", 12, "bold"), padding=(20, 12))
        style.configure("Action.TButton", font=("Segoe UI", 10), padding=(12, 6))
        style.configure("TCombobox", font=("Segoe UI", 11))
        style.configure("TEntry", font=("Consolas", 12))
        style.configure("Treeview", font=("Consolas", 10), rowheight=26, background="#1e293b", fieldbackground="#1e293b", foreground="#e2e8f0")
        style.configure("Treeview.Heading", font=("Segoe UI", 10, "bold"), background="#334155", foreground="#f8fafc")
        style.map("Treeview", background=[("selected", "#3b82f6")])

        # Header
        hdr = ttk.Frame(self.root)
        hdr.pack(fill="x", padx=24, pady=(18, 4))
        ttk.Label(hdr, text="ComplyTrack Key Generator", style="Header.TLabel").pack(anchor="w")
        ttk.Label(hdr, text="Generate license keys for 1-month, 3-month, and 1-year subscriptions", style="Sub.TLabel").pack(anchor="w")

        sep = tk.Frame(self.root, height=1, bg="#334155")
        sep.pack(fill="x", padx=24, pady=(10, 10))

        # ── Generate Section ───────────────────────────
        gen_frame = ttk.Frame(self.root)
        gen_frame.pack(fill="x", padx=24, pady=(0, 8))

        ttk.Label(gen_frame, text="Tier:").grid(row=0, column=0, padx=(0, 8))
        self.tier_var = tk.StringVar(value="1 Month")
        tier_cb = ttk.Combobox(gen_frame, textvariable=self.tier_var, values=list(TIERS.keys()),
                               state="readonly", width=14)
        tier_cb.grid(row=0, column=1, padx=(0, 16))

        ttk.Label(gen_frame, text="Qty:").grid(row=0, column=2, padx=(0, 8))
        self.qty_var = tk.StringVar(value="1")
        qty_cb = ttk.Combobox(gen_frame, textvariable=self.qty_var,
                              values=["1", "5", "10", "25", "50", "100"],
                              state="readonly", width=6)
        qty_cb.grid(row=0, column=3, padx=(0, 16))

        ttk.Label(gen_frame, text="Hint (optional):").grid(row=0, column=4, padx=(0, 8))
        self.hint_var = tk.StringVar()
        hint_entry = ttk.Entry(gen_frame, textvariable=self.hint_var, width=22)
        hint_entry.grid(row=0, column=5, padx=(0, 16))

        gen_btn = tk.Button(gen_frame, text="Generate", command=self._generate,
                            bg="#3b82f6", fg="white", font=("Segoe UI", 11, "bold"),
                            activebackground="#2563eb", activeforeground="white",
                            relief="flat", padx=18, pady=6, cursor="hand2")
        gen_btn.grid(row=0, column=6)

        # ── Key Display ────────────────────────────────
        disp_frame = ttk.Frame(self.root)
        disp_frame.pack(fill="x", padx=24, pady=(4, 8))

        self.key_var = tk.StringVar(value="Click Generate to create keys")
        key_entry = tk.Entry(disp_frame, textvariable=self.key_var, font=("Consolas", 16, "bold"),
                             bg="#1e293b", fg="#38bdf8", insertbackground="#38bdf8",
                             relief="flat", justify="center", state="readonly")
        key_entry.pack(fill="x", ipady=8)

        # Copy button
        copy_btn = tk.Button(disp_frame, text="Copy to Clipboard", command=self._copy_key,
                             bg="#334155", fg="#e2e8f0", font=("Segoe UI", 9),
                             activebackground="#475569", relief="flat", padx=10, pady=3, cursor="hand2")
        copy_btn.pack(anchor="e", pady=(4, 0))

        # ── Tier Info Cards ────────────────────────────
        cards_frame = ttk.Frame(self.root)
        cards_frame.pack(fill="x", padx=24, pady=(4, 8))

        for i, (label, info) in enumerate(TIERS.items()):
            card = tk.Frame(cards_frame, bg=info["color"], padx=12, pady=8)
            card.grid(row=0, column=i, padx=(0, 10), sticky="ew")
            cards_frame.columnconfigure(i, weight=1)
            tk.Label(card, text=label, bg=info["color"], fg="white",
                     font=("Segoe UI", 11, "bold")).pack(anchor="w")
            tk.Label(card, text=f"{info['days']} days | Prefix: {info['prefix']}",
                     bg=info["color"], fg="#e0e0e0", font=("Segoe UI", 9)).pack(anchor="w")

        # ── Keys History Table ─────────────────────────
        hist_label = ttk.Label(self.root, text="Generated Keys", font=("Segoe UI", 12, "bold"),
                               background="#0f172a", foreground="#f8fafc")
        hist_label.pack(anchor="w", padx=24, pady=(8, 4))

        tree_frame = ttk.Frame(self.root)
        tree_frame.pack(fill="both", expand=True, padx=24, pady=(0, 4))

        cols = ("key", "tier", "hint", "created", "expires")
        self.tree = ttk.Treeview(tree_frame, columns=cols, show="headings", selectmode="browse")
        self.tree.heading("key", text="License Key")
        self.tree.heading("tier", text="Tier")
        self.tree.heading("hint", text="Hint")
        self.tree.heading("created", text="Created")
        self.tree.heading("expires", text="Expires")
        self.tree.column("key", width=200, anchor="center")
        self.tree.column("tier", width=90, anchor="center")
        self.tree.column("hint", width=140)
        self.tree.column("created", width=130, anchor="center")
        self.tree.column("expires", width=130, anchor="center")

        scrollbar = ttk.Scrollbar(tree_frame, orient="vertical", command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)
        self.tree.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

        # ── Bottom Actions ─────────────────────────────
        btn_frame = ttk.Frame(self.root)
        btn_frame.pack(fill="x", padx=24, pady=(4, 14))

        export_btn = tk.Button(btn_frame, text="Export to File", command=self._export,
                               bg="#10b981", fg="white", font=("Segoe UI", 10, "bold"),
                               activebackground="#059669", relief="flat", padx=14, pady=5, cursor="hand2")
        export_btn.pack(side="left")

        clear_btn = tk.Button(btn_frame, text="Clear All", command=self._clear,
                              bg="#ef4444", fg="white", font=("Segoe UI", 10, "bold"),
                              activebackground="#dc2626", relief="flat", padx=14, pady=5, cursor="hand2")
        clear_btn.pack(side="left", padx=(10, 0))

        self.status_label = ttk.Label(btn_frame, text="Ready", foreground="#64748b")
        self.status_label.pack(side="right")

    # ── Actions ─────────────────────────────────────────
    def _generate(self):
        tier = self.tier_var.get()
        qty = int(self.qty_var.get())
        hint = self.hint_var.get().strip()

        keys = []
        for _ in range(qty):
            key = generate_key(tier)
            now = datetime.now()
            exp = now + timedelta(days=TIERS[tier]["days"])
            entry = {
                "key": key,
                "tier": tier,
                "hint": hint or f"{TIERS[tier]['prefix']} key",
                "created": now.strftime("%Y-%m-%d %H:%M"),
                "expires": exp.strftime("%Y-%m-%d"),
                "days": TIERS[tier]["days"],
            }
            keys.append(entry)
            self.generated_keys.append(entry)

            # Auto-save to persistent storage
            append_key_to_log(entry)

        # Save full JSON after batch
        save_keys_to_json(self.generated_keys)

        self.key_var.set(keys[0]["key"])
        self.status_label.configure(text=f"Generated {qty} key(s) | {tier} | Saved to keys_log.txt")
        self._refresh_tree()

    def _copy_key(self):
        key = self.key_var.get()
        if key and key != "Click Generate to create keys":
            self.root.clipboard_clear()
            self.root.clipboard_append(key)
            self.status_label.configure(text="Copied to clipboard")

    def _export(self):
        if not self.generated_keys:
            messagebox.showinfo("Export", "No keys to export.")
            return

        path = filedialog.asksaveasfilename(
            defaultextension=".txt",
            filetypes=[("Text File", "*.txt"), ("JSON File", "*.json"), ("CSV File", "*.csv")],
            title="Export Keys"
        )
        if not path:
            return

        if path.endswith(".json"):
            with open(path, "w") as f:
                json.dump(self.generated_keys, f, indent=2)
        elif path.endswith(".csv"):
            with open(path, "w") as f:
                f.write("Key,Tier,Hint,Created,Expires,Days\n")
                for k in self.generated_keys:
                    f.write(f"{k['key']},{k['tier']},{k['hint']},{k['created']},{k['expires']},{k['days']}\n")
        else:
            with open(path, "w") as f:
                f.write("=" * 72 + "\n")
                f.write("  ComplyTrack License Keys\n")
                f.write(f"  Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write("=" * 72 + "\n\n")
                for k in self.generated_keys:
                    f.write(f"Key:      {k['key']}\n")
                    f.write(f"Tier:     {k['tier']} ({k['days']} days)\n")
                    f.write(f"Hint:     {k['hint']}\n")
                    f.write(f"Created:  {k['created']}\n")
                    f.write(f"Expires:  {k['expires']}\n")
                    f.write("-" * 40 + "\n")
                f.write(f"\nTotal: {len(self.generated_keys)} key(s)\n")

        self.status_label.configure(text=f"Exported to {os.path.basename(path)}")
        messagebox.showinfo("Export", f"Keys exported to:\n{path}")

    def _clear(self):
        self.generated_keys.clear()
        save_keys_to_json(self.generated_keys)
        for item in self.tree.get_children():
            self.tree.delete(item)
        self.key_var.set("Click Generate to create keys")
        self.status_label.configure(text="Cleared (log file preserved)")

    def _refresh_tree(self):
        for item in self.tree.get_children():
            self.tree.delete(item)
        for k in self.generated_keys:
            self.tree.insert("", "end", values=(
                k["key"], k["tier"], k["hint"], k["created"], k["expires"]
            ))


def main():
    root = tk.Tk()
    root.iconbitmap(default="")
    app = KeyGenApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
