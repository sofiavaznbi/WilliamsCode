#!/bin/bash
# Script para limpiar la base de datos SQLite (usuarios, dispositivos, mediciones)
# Uso: ./reset_db.sh

sqlite3 energy.db "DELETE FROM mediciones;"
sqlite3 energy.db "DELETE FROM dispositivos;"
sqlite3 energy.db "DELETE FROM usuarios;"

echo "Base de datos limpiada. Todas las tablas están vacías."
