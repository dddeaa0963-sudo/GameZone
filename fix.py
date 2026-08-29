with open('admin/src/admin/AdminView.tsx', 'r') as f:
    text = f.read()

text = text.replace(
"""                                            setConfirmModal({...confirmModal, isOpen: false});
              );
                                  }} className="bg-emerald-100 text-emerald-700""",
"""                                            setConfirmModal({...confirmModal, isOpen: false});
                                          }
                                        });
                                  }} className="bg-emerald-100 text-emerald-700"""
)

with open('admin/src/admin/AdminView.tsx', 'w') as f:
    f.write(text)
