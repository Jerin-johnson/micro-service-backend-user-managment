#!/bin/bash

echo ""
echo "=== Starting Auth_app ==="
cd auth_service || exit
npm run dev &
cd ..

echo ""
echo "=== Starting user-service ==="
cd user_service || exit
npm run start&
cd ..

echo ""
echo "=== Starting Reporting_Service ==="
cd reporting_service || exit
npm start &
cd ..

echo ""
echo "=== Starting APiGateway ==="
cd api_gateway || exit
npm run start &
cd ..

wait