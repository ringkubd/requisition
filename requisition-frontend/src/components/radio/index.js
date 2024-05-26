import { Label, Radio } from 'flowbite-react'
import { useState } from 'react'

function CustomRadio({ label, onChange, name, value, data = [] }) {
    const [checked, setChecked] = useState(value)
    return (
        <fieldset className={`flex max-w-md flex-col gap-4`}>
            <legend className="mb-4">{label}</legend>
            {data.map((v, d) => (
                <div className="flex items-center gap-2" key={d}>
                    <Radio
                        id={v.id}
                        name={name}
                        value={v.value}
                        checked={v.value == checked}
                        onChange={e => {
                            onChange(e)
                            setChecked(e.target.value)
                        }}
                    />
                    <Label htmlFor={v.id}>{v.label}</Label>
                </div>
            ))}
        </fieldset>
    )
}

export default CustomRadio
