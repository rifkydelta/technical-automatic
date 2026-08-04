#!/bin/bash
# Script peluncur otomatis Backend API & CLI Terminal di Termux Android

if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d "../venv" ]; then
    source ../venv/bin/activate
fi

echo "==================================================="
echo "🚀 Memulai Backend API di Background..."
echo "==================================================="

cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

sleep 3

if curl -s http://127.0.0.1:8000/ > /dev/null; then
    echo "✓ Backend API Berhasil Berjalan (PID: $BACKEND_PID)"
    echo "==================================================="
    echo "Gunakan perintah CLI berikut:"
    echo "  idx help"
    echo "  idx analyze BBCA"
    echo "  idx category bank"
    echo "  idx category bpjs"
    echo "  idx ihsg --watch"
    echo "  idx export BBCA --format txt"
    echo "==================================================="
    exec bash
else
    echo "❌ Gagal menjalankan Backend API. Detail Error:"
    echo "---------------------------------------------------"
    if [ -f "backend.log" ]; then
        tail -n 20 backend.log
    fi
    echo "---------------------------------------------------"
    echo "💡 Solusi: Jalankan perintah berikut untuk menginstall library:"
    echo "   pip install -r backend/requirements.txt"
    echo "   pip install -e cli/"
    kill $BACKEND_PID 2>/dev/null
fi
