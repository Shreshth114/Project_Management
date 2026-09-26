import sys

with open("src/index.css", "r") as f:
    css = f.read()

# 1. Add active state to buttons
if ".btn:active" not in css:
    btn_hover_idx = css.find(".btn:hover {")
    if btn_hover_idx != -1:
        insert_pos = css.find("}", btn_hover_idx) + 1
        css = css[:insert_pos] + "\n\n.btn:active {\n  transform: translateY(0) scale(0.98);\n  box-shadow: none;\n}" + css[insert_pos:]

# 2. Add subtle hover to table rows if not present
if ".portal-table tbody tr:hover {" not in css:
    table_tr_idx = css.find(".portal-table tbody tr {")
    if table_tr_idx != -1:
        insert_pos = css.find("}", table_tr_idx) + 1
        css = css[:insert_pos] + "\n\n.portal-table tbody tr:hover {\n  background-color: var(--bg-surface-hover);\n}" + css[insert_pos:]

# 3. Add smooth transitions to form inputs
input_focus_idx = css.find(".form-input:focus, .form-select:focus")
if input_focus_idx != -1 and "transition:" not in css[css.rfind("{", 0, input_focus_idx):input_focus_idx]:
    # It might already have transition in .form-input
    pass

# 4. Modal max-height for responsiveness
if "max-height: 90vh;" not in css and ".modal-dialog {" in css:
    css = css.replace(".modal-dialog {", ".modal-dialog {\n  max-height: 90vh;\n  display: flex;\n  flex-direction: column;")
    css = css.replace(".modal-body {", ".modal-body {\n  overflow-y: auto;\n  flex: 1;")

# 5. Prevent empty-state icon from shrinking
if ".empty-state-icon {" in css and "flex-shrink" not in css:
    css = css.replace(".empty-state-icon {", ".empty-state-icon {\n  flex-shrink: 0;")

with open("src/index.css", "w") as f:
    f.write(css)

print("CSS Polished.")
