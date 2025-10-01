SmolVLM run instructions

This project includes a static copy of the SmolVLM frontend at `public/smolvlm/auto.html`.

To run the SmolVLM model server locally (serves the API expected by the page):

1. Ensure you have the llama-server tool available in your PATH. Then run:

   llama-server -hf ggml-org/SmolVLM-500M-Instruct-GGUF

2. By default the server listens on port 8080. The frontend `auto.html` defaults its API endpoint to `http://localhost:8080` in the UI.

3. Open the frontend in your app by visiting:

   http://localhost:3000/smolvlm/auto.html  (when Next.js dev server is running)

   or if you open the static file directly from the `public` folder (not recommended), be aware of camera/microphone permissions and cross-origin restrictions when calling the model server.

CORS and HTTPS
- For camera and microphone access, open the page on `https` or `localhost`.
- If you run the llama-server on a different host or port, update the "API Endpoint" field in the UI.
- If the llama-server API enforces CORS, ensure it allows requests from the origin where `auto.html` is served (e.g. http://localhost:3000).

If you want the SmolVLM page to be embedded inside a modal instead of a new tab, I can add a modal implementation to the `MentalHealth` component. Also let me know if you'd like the button to POST an event to your backend before opening the page.
