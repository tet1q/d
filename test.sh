#!/bin/bash

API_URL="https://legendary-acorn-4rj4r99947r2j6qr-3000.app.github.dev/api/chess"

echo "🚀 Testing Stockfish API"
echo "========================"

# Test 1: Health Check
echo "1. Testing Health Endpoint:"
curl -s "${API_URL}/../health"
echo -e "\n"

# Test 2: Engine Info
echo "2. Testing Engine Info:"
curl -s "${API_URL}/info"
echo -e "\n"

# Test 3: Best Move (Cara yang Benar)
echo "3. Testing Best Move Endpoint:"
curl -X POST \
  "${API_URL}/bestmove" \
    -H "Content-Type: application/json" \
      -d '{
          "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
              "depth": 15
                }'
                echo -e "\n"

                # Test 4: Dengan depth yang lebih rendah (lebih cepat)
                echo "4. Quick Test (depth 5):"
                curl -X POST \
                  "${API_URL}/bestmove" \
                    -H "Content-Type: application/json" \
                      -d '{
                          "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                              "depth": 5
                                }'
                                echo -e "\n"

                                # Test 5: Posisi lain
                                echo "5. Test dengan posisi lain:"
                                curl -X POST \
                                  "${API_URL}/bestmove" \
                                    -H "Content-Type: application/json" \
                                      -d '{
                                          "fen": "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
                                              "depth": 10
                                                }'