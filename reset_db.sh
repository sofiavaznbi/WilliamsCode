#!/bin/bash
# =============================================================
# Ficheiro: reset_db.sh
# Descrição: Script para limpar a base de dados SQLite (utilizadores, dispositivos, medições).
# Utilidade: Executar este script para apagar todos os dados das tabelas principais.
# Uso: ./reset_db.sh
# =============================================================

sqlite3 energy.db "DELETE FROM measurements;"
sqlite3 energy.db "DELETE FROM devices;"
sqlite3 energy.db "DELETE FROM users;"

echo "Base de dados limpa. Todas as tabelas estão vazias."
