import { Ref } from "react";
import { PupilEditorHandle } from "../../../types/PupilEditorHandle.js";
import useForwardRef from "./useForwardRef.js";
import useEditorState from "./useEditorState.js";

export const usePupilEditor = (ref?: Ref<PupilEditorHandle>) => {
  const { theme, value, language, handleOnChange } = useEditorState();
  const { handleOnMount } = useForwardRef(ref);

  return { theme, value, language, handleOnChange, handleOnMount };
};
