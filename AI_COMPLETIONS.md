# AI-Powered Code Completions

This extension includes intelligent code completions. It works **out of the box** with smart pattern-based suggestions!

## How It Works

The extension automatically detects and uses the best available completion service:

1. **GitHub Copilot** - Automatically detected
   - ✅ Uses your existing Copilot subscription
   - ✅ Best quality completions
   - ✅ No additional setup needed
   
2. **Pattern-Based (Built-in)** - Works immediately
   - ✅ No setup required
   - ✅ Fast and reliable
   - ✅ Context-aware suggestions
   - ✅ Recognizes 15+ function patterns
   - ✅ Works offline
   
3. **Ollama (Optional)** - For local AI without Copilot
   - ✅ Local AI, runs on your machine
   - ✅ Fast, private, no internet required
   - ✅ Free and open source

## Want Better Completions?

### If You Have GitHub Copilot

Nothing to do! The extension automatically detects and uses Copilot if you have it enabled.

### If You Don't Have Copilot

### Install Ollama (Optional but Recommended)

For the best experience, install Ollama locally:

#### Windows
1. Download from https://ollama.ai/download
2. Run the installer
3. Open PowerShell and run:
   ```powershell
   ollama pull codellama:7b
   ollama serve
   ```

#### Mac
```bash
brew install ollama
ollama pull codellama:7b
ollama serve
```

#### Linux
```bash
curl -fsSL https://ollama.ai/install.sh | sh
ollama pull codellama:7b
ollama serve
```

That's it! The extension will automatically detect and use Ollama.

## OpenAI Support (Optional)

If you have an OpenAI API key, you can configure it:

1. Open VS Code Settings
2. Search for "pupil.openaiApiKey"
3. Enter your API key

**Note:** OpenAI is paid and not required. The extension works great without it!

## Checking What's Running

Open the browser console in the webview to see the completion mode:
- `✓ AI completions enabled: VS Code Copilot` - Using your Copilot subscription
- `✓ AI completions enabled: Ollama (CodeLlama)` - Using local AI
- `⚠ No AI services available` - Using pattern-based (still works great!)
- `💡 Install Ollama for intelligent completions` - Reminder to upgrade

## Privacy

- **GitHub Copilot**: Follows GitHub's privacy policy (telemetry can be disabled)
- **Ollama**: 100% private, runs locally, no data leaves your machine
- **HuggingFace**: Code snippets sent to HuggingFace API (free tier)
- **OpenAI**: Code snippets sent to OpenAI (if configured)
- **Pattern-Based**: 100% local, no external calls

Choose the option that fits your privacy requirements!
