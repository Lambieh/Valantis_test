import "./Dropdowns.css";

export default function Dropdown(props) {
  const { items, onSelectedChange } = props;

  return (
    <select
      onChange={(event) => onSelectedChange(event.target.value)}
      className="button_general_style"
    >
      {items.map((item) => {
        return (
          <option key={item.id} value={item.id}>
            {item.title}
          </option>
        );
      })}
    </select>
  );
}
