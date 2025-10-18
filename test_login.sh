curl -X POST "http://localhost:8000/api/v1/auth/login" -H "Content-Type: application/json" -d '{"email": "test@example.com", "password": "testpass"}' -w "
HTTP Status: %{http_code}
" --max-time 5
