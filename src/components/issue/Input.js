import { TextInput } from "flowbite-react";
import { useState } from "react";

const IssueInput = ({ value, onChange }) => {
  const [inputValue, setInputValue] = useState(value || "");

  const handleChange = (event) => {
    setInputValue(event.target.value);
    onChange(event.target.value);
  };

  return (
    <div>
      <TextInput
        value={value}
        onChange={handleChange}
      />
    </div>
  );
};

export default IssueInput;
