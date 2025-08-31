import { KeyboardReact } from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';

type PupilKeyboardProps = {
  onInput?: (input: string) => void;
};

const PupilKeyboard = ({ onInput }: PupilKeyboardProps) => {
  return <KeyboardReact onKeyPress={onInput} />;
};

export default PupilKeyboard;
