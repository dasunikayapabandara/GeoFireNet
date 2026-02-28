
import sys

def verify_import(module_name):
    try:
        __import__(module_name)
        print(f"[OK] {module_name}")
    except ImportError as e:
        print(f"[FAIL] {module_name}: {e}")
        sys.exit(1)

modules = [
    "fastapi",
    "uvicorn",
    "tensorflow",
    "keras",
    "sklearn",  # scikit-learn
    "pandas",
    "numpy",
    "folium",
    "streamlit"
]

print(f"Python version: {sys.version}")

for module in modules:
    verify_import(module)

print("All dependencies verified successfully.")
