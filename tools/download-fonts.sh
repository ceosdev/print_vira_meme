#!/usr/bin/env bash
# Baixa as 12 fontes do catálogo (OFL + Apache) para assets/fonts.
# Fontes de peso único vêm do repositório google/fonts; pesos de famílias variáveis (Oswald, Rubik)
# e a Permanent Marker vêm da API CSS do Google Fonts, que entrega TTF estático por peso quando o
# User-Agent não é de navegador.
set -euo pipefail
DIR="$(cd "$(dirname "$0")/.." && pwd)/assets/fonts"
mkdir -p "$DIR"
GH=https://raw.githubusercontent.com/google/fonts/main

dl() { curl -fsSL "$2" -o "$DIR/$1" && echo "ok  $1"; }
css() { curl -fsSL -A "curl/8" "https://fonts.googleapis.com/css2?family=$1"; }
url_for_weight() {
  css "$1" | awk -v w="$2" '
    /font-weight:/ { gsub(";", "", $2); fw = $2 }
    /src: url\(/ { if (fw == w) { sub(/.*url\(/, ""); sub(/\).*/, ""); print; exit } }'
}

dl Anton-Regular.ttf        "$GH/ofl/anton/Anton-Regular.ttf"
dl BebasNeue-Regular.ttf    "$GH/ofl/bebasneue/BebasNeue-Regular.ttf"
dl Bangers-Regular.ttf      "$GH/ofl/bangers/Bangers-Regular.ttf"
dl LilitaOne-Regular.ttf    "$GH/ofl/lilitaone/LilitaOne-Regular.ttf"
dl ArchivoBlack-Regular.ttf "$GH/ofl/archivoblack/ArchivoBlack-Regular.ttf"
dl Oswald-Medium.ttf        "$(url_for_weight 'Oswald:wght@500;700' 500)"
dl Oswald-Bold.ttf          "$(url_for_weight 'Oswald:wght@500;700' 700)"
dl Rubik-Regular.ttf        "$(url_for_weight 'Rubik:wght@400;500;700;900' 400)"
dl Rubik-Medium.ttf         "$(url_for_weight 'Rubik:wght@400;500;700;900' 500)"
dl Rubik-Bold.ttf           "$(url_for_weight 'Rubik:wght@400;500;700;900' 700)"
dl Rubik-Black.ttf          "$(url_for_weight 'Rubik:wght@400;500;700;900' 900)"
dl PermanentMarker-Regular.ttf "$(url_for_weight 'Permanent+Marker' 400)"

dl OFL.txt "$GH/ofl/anton/OFL.txt"
dl LICENSE-PermanentMarker-Apache-2.0.txt "$GH/apache/permanentmarker/LICENSE.txt" \
  || echo "aviso: licença da Permanent Marker não baixada; obtenha em https://fonts.google.com/specimen/Permanent+Marker/license"

for f in "$DIR"/*.ttf; do
  magic=$(od -An -tx1 -N4 "$f" | tr -d ' \n')
  [ "$magic" = "00010000" ] || [ "$magic" = "74727565" ] || { echo "não é TrueType: $f ($magic)"; exit 1; }
done
echo "12 fontes OK em $DIR"
