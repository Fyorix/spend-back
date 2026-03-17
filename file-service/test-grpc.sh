#!/bin/bash

PROTO_PATH="./node_modules/@clement.pasteau/contracts/proto"
SERVICE_URL="localhost:50052"
PROTO_FILE="file/file.services.proto"
DEFAULT_FILE="README.md"

echo "🚀 gRPC Interactive Tester - File Service"
echo "----------------------------------------"

# Petit check de debug pour voir les méthodes dispo sur le serveur
echo "🔍 Méthodes détectées sur le serveur :"
grpcurl -plaintext -proto "$PROTO_PATH/$PROTO_FILE" -import-path "$PROTO_PATH" $SERVICE_URL list file.FileService
echo "----------------------------------------"

PS3='Choisissez une action: '
options=("Upload File (Stream)" "Get File" "Quitter")

select opt in "${options[@]}"
do
    case $opt in
        "Upload File (Stream)")
            read -p "ID Utilisateur [test-user]: " uid
            uid=${uid:-"test-user-123"}
            
            read -p "Chemin du fichier [$DEFAULT_FILE]: " fpath
            fpath=${fpath:-$DEFAULT_FILE}
            
            if [ ! -f "$fpath" ]; then echo "❌ Erreur: $fpath introuvable"; continue; fi

            fname=$(basename "$fpath")
            fsize=$(wc -c < "$fpath")

            echo "📤 Envoi de $fname ($fsize bytes)..."
            
            # Utilisation de @ pour lire le flux JSON combiné
            (
              echo "{\"metadata\": {\"userId\": \"$uid\", \"originalName\": \"$fname\", \"mimeType\": \"text/markdown\", \"size\": $fsize}}"
              echo "{\"chunk\": \"$(base64 -i "$fpath")\"}"
            ) | grpcurl -plaintext \
                -proto "$PROTO_PATH/$PROTO_FILE" \
                -import-path "$PROTO_PATH" \
                -d @ \
                $SERVICE_URL \
                file.FileService/UploadFile
            ;;
        "Quitter") break ;;
        *) echo "Invalide";;
    esac
done
