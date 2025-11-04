#!/bin/bash

# Deploy gemini-metadata Edge Function to Supabase
echo "Deploying gemini-metadata Edge Function to Supabase..."

supabase functions deploy gemini-metadata --project-ref dlpfkrqvptlgtampkqvd

echo "Done! Edge Function deployed successfully."
