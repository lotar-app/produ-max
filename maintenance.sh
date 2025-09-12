#!/bin/bash

FILE="/root/produzione-stabile/.maintenance"

case "$1" in
  on)
    if [ ! -f "$FILE" ]; then
      touch "$FILE"
      echo "Maintenance mode ATTIVATA."
    else
      echo "Maintenance mode già attiva."
    fi
    ;;
  off)
    if [ -f "$FILE" ]; then
      rm "$FILE"
      echo "Maintenance mode DISATTIVATA."
    else
      echo "Maintenance mode già disattivata."
    fi
    ;;
  *)
    echo "Uso: $0 {on|off}"
    ;;
esac