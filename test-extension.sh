#!/bin/bash

# Verifica se o Chrome está instalado
if ! command -v google-chrome &> /dev/null; then
    echo "Chrome não está instalado. Por favor, instale o Chrome primeiro."
    exit 1
fi

# Verifica se já existe uma extensão carregada
CHROME_PROFILE="--user-data-dir=/tmp/chrome-extension-test"
EXTENSION_ID=$(google-chrome $CHROME_PROFILE --extensions-on-chrome-urls --load-extension="$PWD/dist" &> /dev/null)

# Se não encontrou, carrega a extensão
if [ -z "$EXTENSION_ID" ]; then
    echo "Carregando extensão no Chrome..."
    google-chrome $CHROME_PROFILE --extensions-on-chrome-urls --load-extension="$PWD/dist"
else
    echo "Extensão já carregada. Abrindo Chrome..."
    google-chrome $CHROME_PROFILE
fi

# Aguarda 2 segundos para o Chrome iniciar
sleep 2

# Abre uma nova aba com uma página de teste
google-chrome $CHROME_PROFILE --new-window https://www.google.com
