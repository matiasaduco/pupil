# Comandos de Voz

Este documento describe cómo funcionan los comandos de voz en la extensión Pupil.

## Configuración de Comandos

### Desde la Interfaz Web (http://localhost:3000)

La página web incluye una sección completa para gestionar comandos de voz:

1. **Toggle Principal**: Activa o desactiva la detección de comandos completamente
2. **Lista de Comandos**: Muestra todos los comandos disponibles con:
   - Nombre del comando
   - Frases que lo activan
   - Switch individual para habilitar/deshabilitar cada comando

Los cambios se guardan automáticamente en `localStorage` y se sincronizan con la extensión en tiempo real.

### Desde la Extensión (Settings Dialog)

En VS Code, abre el diálogo de Configuración de Pupil:

1. Ve al tab **"Comandos"**
2. Activa/desactiva la detección global de comandos
3. Activa/desactiva comandos individuales
4. Los cambios se sincronizan automáticamente con la página web

## Comandos Disponibles

Los siguientes comandos de voz están disponibles cuando el servidor de Speech-to-Text está activo:

### 1. Abrir Simple Browser

- **Frases de activación:**
  - "abrir simple browser"
  - "abrir navegador"
  - "abrir browser"
- **Acción:** Abre el diálogo de Simple Browser

### 2. Crear Archivo/Carpeta

- **Frases de activación:**
  - "crear archivo"
  - "nuevo archivo"
  - "crear carpeta"
  - "nueva carpeta"
- **Acción:** Abre el diálogo de creación de archivos/carpetas

### 3. Abrir Terminal

- **Frases de activación:**
  - "abrir terminal"
  - "mostrar terminal"
- **Acción:** Abre la terminal integrada de VS Code

### 4. Guardar Documento

- **Frases de activación:**
  - "guardar archivo"
  - "guardar documento"
  - "guardar"
- **Acción:** Guarda el documento actualmente abierto

### 5. Abrir Configuración

- **Frases de activación:**
  - "abrir configuración"
  - "abrir ajustes"
  - "configuración"
- **Acción:** Abre el diálogo de configuración

## Arquitectura

El sistema de comandos de voz funciona a través de los siguientes componentes:

### 1. `speech-web/index.html`

Detecta los comandos de voz en el transcript del reconocimiento de voz y los envía al servidor WebSocket:

```javascript
// Ejemplo de detección de comando
const commands = [
	{
		patterns: ['abrir simple browser', 'abrir navegador', 'abrir browser'],
		type: 'open-simple-browser'
	}
]

// Envía el comando al WebSocket
ws.send(
	JSON.stringify({
		type: 'voice-command',
		command: commandType,
		transcript: transcript
	})
)
```

### 2. `src/extension.ts`

El servidor WebSocket recibe los comandos y los envía al `PupilEditorProvider`:

```typescript
ws.on('message', (message: Buffer) => {
	const data = JSON.parse(message.toString())

	if (data.type === 'voice-command') {
		pupilEditorProvider.handleVoiceCommand(data.command)
	}
})
```

### 3. `src/providers/PupilEditorProvider.ts`

Convierte los comandos en mensajes para el webview:

```typescript
public handleVoiceCommand(command: string) {
  switch (command) {
    case 'open-simple-browser':
      this.webviewPanel.webview.postMessage({
        type: 'voice-open-simple-browser'
      })
      break
    // ... otros comandos
  }
}
```

### 4. `src/webview/components/PupilContainer/hooks/usePupilContainer.ts`

Escucha los mensajes del webview y ejecuta las acciones correspondientes:

```typescript
useEffect(() => {
	const handleMessage = (event: MessageEvent) => {
		if (event.data.type === 'voice-open-simple-browser') {
			setOpenSimpleBrowserDialog?.(true)
		}
		// ... otros comandos
	}

	window.addEventListener('message', handleMessage)
}, [])
```

## Agregar Nuevos Comandos

Para agregar un nuevo comando de voz:

1. **Agregar el patrón en `speech-web/index.html`:**

   ```javascript
   const commands = [
   	// ... comandos existentes
   	{
   		patterns: ['mi nuevo comando', 'comando alternativo'],
   		type: 'my-new-command'
   	}
   ]
   ```

2. **Manejar el comando en `src/providers/PupilEditorProvider.ts`:**

   ```typescript
   public handleVoiceCommand(command: string) {
     switch (command) {
       // ... casos existentes
       case 'my-new-command':
         this.webviewPanel.webview.postMessage({
           type: 'voice-my-action'
         })
         break
     }
   }
   ```

3. **Procesar el mensaje en `usePupilContainer.ts`:**
   ```typescript
   if (event.data.type === 'voice-my-action') {
   	// Ejecutar la acción deseada
   }
   ```

## Feedback Visual

### En la Página Web (index.html)

Cuando se detecta un comando de voz:

- El texto del comando con el nombre del comando detectado
- El color cambia temporalmente a verde para indicar detección exitosa
- El color se restablece después de 2 segundos
- Los comandos deshabilitados no se detectarán

### En la Lista de Comandos

- Cada comando muestra su estado (habilitado/deshabilitado)
- El switch principal controla todos los comandos
- Los switches individuales solo funcionan cuando el principal está activo

## Sincronización de Configuración

La configuración de comandos se sincroniza bidireccionalmente:

1. **index.html → Extension**:
   - Al cambiar configuración en la web, se envía vía WebSocket
   - La extensión recibe y propaga el cambio

2. **Extension → index.html**:
   - Al cambiar en Settings Dialog, se envía mensaje a speech-web
   - La página web actualiza su UI automáticamente

3. **Persistencia**:
   - Se guarda en `localStorage` del navegador
   - Se sincroniza al conectar/reconectar WebSocket
   - Sobrevive recargas de página

## Requisitos

- El servidor Speech-to-Text debe estar activo (puerto 8080)
- La página web debe estar abierta en el navegador (http://localhost:3000)
- El navegador debe soportar la Web Speech API
- El micrófono debe estar habilitado para capturar audio
