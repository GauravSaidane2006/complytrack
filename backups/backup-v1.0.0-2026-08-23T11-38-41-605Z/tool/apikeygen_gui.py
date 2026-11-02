#!/usr/bin/env python3
"""
ComplyTrack API Key Generator - GUI Version
Windows app for generating and managing API keys.
"""

import os
import sys
import json
import hashlib
import secrets
import string
import tkinter as tk
from tkinter import ttk, messagebox, simpledialog
from datetime import datetime
from pathlib import Path

VERSION = "1.0.0"
APP_NAME = "ComplyTrack API Key Generator"

# Resolve paths
if getattr(sys, 'frozen', False):
    TOOL_DIR = Path(sys.executable).parent
else:
    TOOL_DIR = Path(__file__).parent

KEYS_LOG_TXT = TOOL_DIR / "api_keys_log.txt"
KEYS_LOG_JSON = TOOL_DIR / "api_keys_log.json"

# Colors
BG_DARK = "#1a1a2e"
BG_MID = "#16213e"
BG_LIGHT = "#0f3460"
ACCENT = "#e94560"
ACCENT_HOVER = "#ff6b81"
TEXT_WHITE = "#ffffff"
TEXT_GRAY = "#a0a0a0"
SUCCESS = "#2ecc71"
WARNING = "#f39c12"
DANGER = "#e74c3c"
INPUT_BG = "#233554"

class APIKeyGenerator:
    def __init__(self):
        self.keys_data = self.load_keys()
        self.root = tk.Tk()
        self.root.title(f"{APP_NAME} v{VERSION}")
        self.root.geometry("900x600")
        self.root.minsize(800, 500)
        self.root.configure(bg=BG_DARK)

        # Try to set icon
        try:
            self.root.iconbitmap(default="")
        except:
            pass

        self.setup_styles()
        self.create_widgets()
        self.center_window()

    def center_window(self):
        self.root.update_idletasks()
        w = self.root.winfo_width()
        h = self.root.winfo_height()
        x = (self.root.winfo_screenwidth() // 2) - (w // 2)
        y = (self.root.winfo_screenheight() // 2) - (h // 2)
        self.root.geometry(f"+{x}+{y}")

    def setup_styles(self):
        style = ttk.Style()
        style.theme_use('clam')

        # Notebook (tabs)
        style.configure('Dark.TNotebook', background=BG_DARK, borderwidth=0)
        style.configure('Dark.TNotebook.Tab',
                        background=BG_MID, foreground=TEXT_GRAY,
                        padding=[20, 10], font=('Segoe UI', 10))
        style.map('Dark.TNotebook.Tab',
                  background=[('selected', BG_LIGHT)],
                  foreground=[('selected', TEXT_WHITE)])

        # Frames
        style.configure('Dark.TFrame', background=BG_DARK)
        style.configure('Card.TFrame', background=BG_MID, relief='flat')

        # Labels
        style.configure('Title.TLabel', background=BG_DARK, foreground=TEXT_WHITE,
                        font=('Segoe UI', 18, 'bold'))
        style.configure('Subtitle.TLabel', background=BG_DARK, foreground=TEXT_GRAY,
                        font=('Segoe UI', 10))
        style.configure('Card.TLabel', background=BG_MID, foreground=TEXT_WHITE,
                        font=('Segoe UI', 10))
        style.configure('CardHeader.TLabel', background=BG_MID, foreground=ACCENT,
                        font=('Segoe UI', 12, 'bold'))
        style.configure('Success.TLabel', background=BG_MID, foreground=SUCCESS,
                        font=('Segoe UI', 10, 'bold'))
        style.configure('Key.TLabel', background=BG_MID, foreground=ACCENT,
                        font=('Consolas', 11))

        # Buttons
        style.configure('Accent.TButton', background=ACCENT, foreground=TEXT_WHITE,
                        font=('Segoe UI', 10, 'bold'), padding=[15, 8], borderwidth=0)
        style.map('Accent.TButton',
                  background=[('active', ACCENT_HOVER), ('pressed', '#c0392b')])

        style.configure('Secondary.TButton', background=BG_LIGHT, foreground=TEXT_WHITE,
                        font=('Segoe UI', 10), padding=[12, 6], borderwidth=0)
        style.map('Secondary.TButton',
                  background=[('active', '#1a5276')])

        style.configure('Danger.TButton', background=DANGER, foreground=TEXT_WHITE,
                        font=('Segoe UI', 10, 'bold'), padding=[12, 6], borderwidth=0)
        style.map('Danger.TButton',
                  background=[('active', '#c0392b')])

        # Entry
        style.configure('Dark.TEntry', fieldbackground=INPUT_BG, foreground=TEXT_WHITE,
                        insertcolor=TEXT_WHITE, borderwidth=1, relief='flat',
                        font=('Segoe UI', 11))

        # Spinbox
        style.configure('Dark.TSpinbox', fieldbackground=INPUT_BG, foreground=TEXT_WHITE,
                        borderwidth=1, relief='flat', font=('Segoe UI', 11))

    def create_widgets(self):
        # Header
        header = ttk.Frame(self.root, style='Dark.TFrame')
        header.pack(fill='x', padx=20, pady=(15, 5))

        ttk.Label(header, text=f"🔐 {APP_NAME}",
                  style='Title.TLabel').pack(side='left')
        ttk.Label(header, text=f"v{VERSION}",
                  style='Subtitle.TLabel').pack(side='right', pady=(5, 0))

        # Separator
        sep = tk.Frame(self.root, bg=ACCENT, height=2)
        sep.pack(fill='x', padx=20, pady=(0, 10))

        # Tab notebook
        self.notebook = ttk.Notebook(self.root, style='Dark.TNotebook')
        self.notebook.pack(fill='both', expand=True, padx=15, pady=(0, 15))

        self.create_generate_tab()
        self.create_list_tab()

    def create_generate_tab(self):
        tab = ttk.Frame(self.notebook, style='Dark.TFrame')
        self.notebook.add(tab, text="  ⚡ Generate  ")

        # Input card
        card = tk.Frame(tab, bg=BG_MID, bd=0, highlightthickness=1,
                        highlightbackground=BG_LIGHT)
        card.pack(fill='x', padx=20, pady=(15, 10))

        inner = ttk.Frame(card, style='Card.TFrame')
        inner.pack(fill='x', padx=20, pady=15)

        ttk.Label(inner, text="Generate New API Keys", style='CardHeader.TLabel').pack(anchor='w')

        # Customer name
        row1 = ttk.Frame(inner, style='Card.TFrame')
        row1.pack(fill='x', pady=(15, 5))
        ttk.Label(row1, text="Customer Name:", style='Card.TLabel').pack(side='left')
        self.customer_entry = ttk.Entry(row1, style='Dark.TEntry', width=40)
        self.customer_entry.pack(side='right', padx=(10, 0))
        self.customer_entry.insert(0, "Unassigned")

        # Count + Generate button
        row2 = ttk.Frame(inner, style='Card.TFrame')
        row2.pack(fill='x', pady=(10, 0))

        ttk.Label(row2, text="Number of Keys:", style='Card.TLabel').pack(side='left')
        self.count_var = tk.StringVar(value="1")
        count_spin = ttk.Spinbox(row2, from_=1, to=100, width=5,
                                 textvariable=self.count_var, style='Dark.TSpinbox')
        count_spin.pack(side='left', padx=(10, 0))

        gen_btn = ttk.Button(row2, text="⚡ Generate Keys",
                             style='Accent.TButton', command=self.generate_keys)
        gen_btn.pack(side='right')

        # Results area
        results_card = tk.Frame(tab, bg=BG_MID, bd=0, highlightthickness=1,
                                highlightbackground=BG_LIGHT)
        results_card.pack(fill='both', expand=True, padx=20, pady=(0, 10))

        inner2 = ttk.Frame(results_card, style='Card.TFrame')
        inner2.pack(fill='both', expand=True, padx=15, pady=15)

        # Treeview for results
        cols = ('Key', 'Customer', 'Created', 'Status')
        self.gen_tree = ttk.Treeview(inner2, columns=cols, show='headings',
                                     selectmode='browse', height=10)

        self.gen_tree.heading('Key', text='API Key', anchor='w')
        self.gen_tree.heading('Customer', text='Customer', anchor='w')
        self.gen_tree.heading('Created', text='Created', anchor='w')
        self.gen_tree.heading('Status', text='Status', anchor='w')

        self.gen_tree.column('Key', width=320, minwidth=200)
        self.gen_tree.column('Customer', width=180, minwidth=100)
        self.gen_tree.column('Created', width=150, minwidth=100)
        self.gen_tree.column('Status', width=80, minwidth=60)

        scrollbar = ttk.Scrollbar(inner2, orient='vertical', command=self.gen_tree.yview)
        self.gen_tree.configure(yscrollcommand=scrollbar.set)

        self.gen_tree.pack(side='left', fill='both', expand=True)
        scrollbar.pack(side='right', fill='y')

        # Style treeview
        style = ttk.Style()
        style.configure("Treeview",
                        background=INPUT_BG, foreground=TEXT_WHITE,
                        fieldbackground=INPUT_BG, borderwidth=0,
                        font=('Consolas', 9))
        style.configure("Treeview.Heading",
                        background=BG_LIGHT, foreground=TEXT_WHITE,
                        font=('Segoe UI', 9, 'bold'), borderwidth=0)
        style.map("Treeview",
                  background=[('selected', ACCENT)],
                  foreground=[('selected', TEXT_WHITE)])

        # Copy button
        btn_frame = ttk.Frame(inner2, style='Card.TFrame')
        btn_frame.pack(fill='x', pady=(10, 0))
        ttk.Button(btn_frame, text="📋 Copy Selected Key",
                   style='Secondary.TButton', command=self.copy_key).pack(side='left')
        ttk.Button(btn_frame, text="📋 Copy All Keys",
                   style='Secondary.TButton', command=self.copy_all_keys).pack(side='left', padx=(10, 0))

        self.status_label = ttk.Label(inner2, text="", style='Card.TLabel')
        self.status_label.pack(side='right', padx=(10, 0))

    def create_list_tab(self):
        tab = ttk.Frame(self.notebook, style='Dark.TFrame')
        self.notebook.add(tab, text="  📋 Manage  ")

        # Toolbar
        toolbar = ttk.Frame(tab, style='Dark.TFrame')
        toolbar.pack(fill='x', padx=20, pady=(15, 5))

        # Search
        ttk.Label(toolbar, text="Search:", style='Card.TLabel').pack(side='left')
        self.search_var = tk.StringVar()
        self.search_var.trace('w', lambda *args: self.filter_keys())
        search_entry = ttk.Entry(toolbar, textvariable=self.search_var,
                                 style='Dark.TEntry', width=30)
        search_entry.pack(side='left', padx=(10, 0))

        # Show revoked checkbox
        self.show_revoked = tk.BooleanVar(value=False)
        ttk.Checkbutton(toolbar, text="Show Revoked",
                        variable=self.show_revoked,
                        command=self.filter_keys).pack(side='left', padx=(20, 0))

        # Buttons
        ttk.Button(toolbar, text="🔄 Refresh", style='Secondary.TButton',
                   command=self.refresh_list).pack(side='right')
        ttk.Button(toolbar, text="🗑️ Revoke Selected", style='Danger.TButton',
                   command=self.revoke_selected).pack(side='right', padx=(10, 0))

        # Treeview
        list_card = tk.Frame(tab, bg=BG_MID, bd=0, highlightthickness=1,
                             highlightbackground=BG_LIGHT)
        list_card.pack(fill='both', expand=True, padx=20, pady=(5, 15))

        inner = ttk.Frame(list_card, style='Card.TFrame')
        inner.pack(fill='both', expand=True, padx=10, pady=10)

        cols = ('Key', 'Customer', 'Created', 'Status')
        self.list_tree = ttk.Treeview(inner, columns=cols, show='headings',
                                      selectmode='browse')

        self.list_tree.heading('Key', text='API Key', anchor='w')
        self.list_tree.heading('Customer', text='Customer', anchor='w')
        self.list_tree.heading('Created', text='Created', anchor='w')
        self.list_tree.heading('Status', text='Status', anchor='w')

        self.list_tree.column('Key', width=320, minwidth=200)
        self.list_tree.column('Customer', width=180, minwidth=100)
        self.list_tree.column('Created', width=150, minwidth=100)
        self.list_tree.column('Status', width=80, minwidth=60)

        scrollbar = ttk.Scrollbar(inner, orient='vertical', command=self.list_tree.yview)
        self.list_tree.configure(yscrollcommand=scrollbar.set)

        self.list_tree.pack(side='left', fill='both', expand=True)
        scrollbar.pack(side='right', fill='y')

        # Stats bar
        stats_frame = ttk.Frame(tab, style='Dark.TFrame')
        stats_frame.pack(fill='x', padx=20, pady=(0, 10))

        self.stats_label = ttk.Label(stats_frame, text="", style='Subtitle.TLabel')
        self.stats_label.pack(side='left')

        self.filter_keys()

    def generate_api_key(self, length=32):
        alphabet = string.ascii_lowercase + string.digits
        body = ''.join(secrets.choice(alphabet) for _ in range(length))
        checksum = hashlib.sha256(body.encode()).hexdigest()[:4]
        return f"ct_{body}{checksum}"

    def load_keys(self):
        if KEYS_LOG_JSON.exists():
            try:
                with open(KEYS_LOG_JSON, 'r') as f:
                    return json.load(f)
            except (json.JSONDecodeError, IOError):
                return {"keys": [], "stats": {"total_generated": 0}}
        return {"keys": [], "stats": {"total_generated": 0}}

    def save_keys(self):
        with open(KEYS_LOG_JSON, 'w') as f:
            json.dump(self.keys_data, f, indent=2)
        with open(KEYS_LOG_TXT, 'w') as f:
            for entry in self.keys_data["keys"]:
                status = "active" if entry.get("active", True) else "revoked"
                f.write(f"{entry['key']} | {entry['customer']} | {entry['created']} | {status}\n")

    def generate_keys(self):
        try:
            count = int(self.count_var.get())
        except ValueError:
            messagebox.showerror("Error", "Invalid count")
            return

        customer = self.customer_entry.get().strip() or "Unassigned"

        for _ in range(count):
            key = self.generate_api_key()
            entry = {
                "key": key,
                "customer": customer,
                "created": datetime.now().isoformat(),
                "active": True
            }
            self.keys_data["keys"].append(entry)
            self.keys_data["stats"]["total_generated"] += 1

            # Add to generate treeview
            created = entry["created"][:19].replace("T", " ")
            self.gen_tree.insert('', 'end', values=(key, customer, created, 'Active'))

        self.save_keys()
        self.filter_keys()

        self.status_label.configure(text=f"✅ Generated {count} key(s)")
        self.root.after(3000, lambda: self.status_label.configure(text=""))

    def filter_keys(self):
        search = self.search_var.get().lower()
        show_revoked = self.show_revoked.get()

        self.list_tree.delete(*self.list_tree.get_children())

        for entry in self.keys_data["keys"]:
            is_active = entry.get("active", True)
            if not show_revoked and not is_active:
                continue

            if search and search not in entry["key"].lower() and \
               search not in entry.get("customer", "").lower():
                continue

            status = "Active" if is_active else "Revoked"
            created = entry["created"][:19].replace("T", " ")
            tag = 'active' if is_active else 'revoked'

            self.list_tree.insert('', 'end', values=(
                entry["key"], entry.get("customer", ""),
                created, status
            ), tags=(tag,))

        self.list_tree.tag_configure('active', foreground=SUCCESS)
        self.list_tree.tag_configure('revoked', foreground=DANGER)

        total = len(self.keys_data["keys"])
        active = sum(1 for k in self.keys_data["keys"] if k.get("active", True))
        self.stats_label.configure(
            text=f"Total: {total} | Active: {active} | Revoked: {total - active}"
        )

    def refresh_list(self):
        self.keys_data = self.load_keys()
        self.filter_keys()

    def copy_key(self):
        selected = self.gen_tree.selection()
        if not selected:
            messagebox.showinfo("Info", "Select a key to copy")
            return
        key = self.gen_tree.item(selected[0])['values'][0]
        self.root.clipboard_clear()
        self.root.clipboard_append(key)
        messagebox.showinfo("Copied", f"Key copied to clipboard:\n{key}")

    def copy_all_keys(self):
        items = self.gen_tree.get_children()
        if not items:
            messagebox.showinfo("Info", "No keys to copy")
            return
        keys = [self.gen_tree.item(i)['values'][0] for i in items]
        text = "\n".join(keys)
        self.root.clipboard_clear()
        self.root.clipboard_append(text)
        messagebox.showinfo("Copied", f"{len(keys)} key(s) copied to clipboard")

    def revoke_selected(self):
        selected = self.list_tree.selection()
        if not selected:
            messagebox.showinfo("Info", "Select a key to revoke")
            return

        key = self.list_tree.item(selected[0])['values'][0]
        status = self.list_tree.item(selected[0])['values'][3]

        if status == "Revoked":
            messagebox.showinfo("Info", "Key is already revoked")
            return

        if not messagebox.askyesno("Confirm Revoke",
                                    f"Revoke this key?\n\n{key}\n\nThis cannot be undone."):
            return

        for entry in self.keys_data["keys"]:
            if entry["key"] == key:
                entry["active"] = False
                entry["revoked"] = datetime.now().isoformat()
                break

        self.save_keys()
        self.filter_keys()
        messagebox.showinfo("Revoked", f"Key revoked successfully")

    def run(self):
        self.root.mainloop()

if __name__ == "__main__":
    app = APIKeyGenerator()
    app.run()
