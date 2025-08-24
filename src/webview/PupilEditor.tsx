import { Editor } from "@monaco-editor/react"
import { usePupilEditor } from "./hooks/usePupilEditor.js";

const PupilEditor = () => {
    const { theme, language, value, handleOnChange } = usePupilEditor();

    return (
        <Editor
            height="100vh"
            theme={theme}
            language={language}
            value={value}
            onChange={handleOnChange}
        />
    );
};

export default PupilEditor;
