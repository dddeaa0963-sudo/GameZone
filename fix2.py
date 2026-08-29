import re
with open('admin/src/admin/AdminView.tsx', 'r') as f:
    text = f.read()

text = re.sub(
    r"setConfirmModal\(\{\.\.\.confirmModal, isOpen: false\}\);\s*\);\s*\}\}\s*className=\"flex-1 min-w-\[80px\] text-xs sm:text-sm bg-red-50 text-red-600",
    r"setConfirmModal({...confirmModal, isOpen: false});\n                                  }\n                                });\n                              }} className=\"flex-1 min-w-[80px] text-xs sm:text-sm bg-red-50 text-red-600",
    text
)

with open('admin/src/admin/AdminView.tsx', 'w') as f:
    f.write(text)
