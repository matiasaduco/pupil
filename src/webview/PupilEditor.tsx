import { Editor } from "@monaco-editor/react"
import { usePupilEditor } from "./hooks/usePupilEditor.js";

const PupilEditor = () => {
    const { theme } = usePupilEditor();

    return (
        <Editor
            height="100vh"
            theme={theme}
            defaultLanguage="javascript"
            defaultValue="// This is a comment..."
        />
    );
};

export default PupilEditor;
