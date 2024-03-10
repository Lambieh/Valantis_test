import "./App.css";
import md5 from "md5";
import { useState, useEffect, useRef } from "react";
import Dropdown from "./Dropdowns";

function App() {
  const [selectedFiltered, setSelectedFiltered] = useState("product");
  const [offset, setOffset] = useState(1);
  const [state2, setState2] = useState([]);
  const [valueFiltered, setValueFiltered] = useState("");
  let items = [
    { title: "названию", id: "product" },
    { title: "цене", id: "price" },
    { title: "бренду", id: "brand" },
  ];
  const ref = useRef();

  let word_pas = "Valantis";
  let time = new Date().toISOString().slice(0, 10).split("-").join("");
  const authorizationString = `$  {word_pas}_${time}`;
  const password = md5(authorizationString).toString();

  const getProductIds = async (params) => {
    try {
      const response = await fetch("https://api.valantis.store:41000/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Auth": password,
        },
        body: JSON.stringify(params),
      });
      return await response.json();
    } catch (error) {
      handleProducts();
    }
  };

  const getProducts = async (ids) => {
    try {
      const response = await fetch("https://api.valantis.store:41000/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Auth": password,
        },
        body: JSON.stringify({
          action: "get_items",
          params: {
            ids: ids,
          },
        }),
      });
      return await response.json();
    } catch (error) {
      handleProducts();
    }
  };

  const handleProducts = async () => {
    const response = await getProductIds({
      action: "get_ids",
      params: {
        offset: offset,
        limit: 50,
      },
    });
    const products = await getProducts([...new Set(response?.result)]);
    if (!products?.result.length) return;
    setState2([...products?.result]);
  };

  useEffect(() => {
    handleProducts();
  }, [offset]);

  const deleteFiltered = async () => {
    setValueFiltered("");
    handleProducts();
    setOffset(1);
  };

  useEffect(() => {
    handleSearch({
      action: "filter",
      params: {
        [selectedFiltered]:
          selectedFiltered === "price" ? Number(valueFiltered) : valueFiltered,
      },
    });
  }, [valueFiltered]);
  const handleSearch = async (filters) => {
    if (valueFiltered == "") return;
    const filteredIds = await getProductIds(filters);
    const response = await getProducts([...new Set(filteredIds?.result)]);
    if (!filteredIds?.result.length) return;
    setState2([...response?.result]);
  };

  const table = {};
  let res = [];
  if (state2.length > 0) {
    res = state2.filter(({ id }) => !table[id] && (table[id] = 1));
  }

  return (
    <div className="page">
      <div className="page_sort">
        Фильтр по
        <Dropdown items={items} onSelectedChange={setSelectedFiltered} />
        <input
          className="input_style"
          onKeyDown={(event) => {
            if (event.key == "Enter") {
              setValueFiltered(event.target.value);
            }
          }}
          ref={ref}
        ></input>
        <button
          className="button_general_style"
          onClick={() => {
            setValueFiltered(ref.current.value);
          }}
        >
          Поиск
        </button>
        <button
          className="button_general_style"
          onClick={() => {
            ref.current.value = null;
            deleteFiltered();
          }}
        >
          Очистить
        </button>
      </div>
      <div className="app">
        <div className="pos_button">
          <button
            className="button_style left"
            onClick={() => {
              if (offset != 1) {
                return setOffset(offset - 50);
              }
            }}
          >
            {"<"}
          </button>
        </div>
        <table>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>Price</th>
            <th>Brand</th>
          </tr>

          {res.map((item, index) => (
            <tr key={item?.id + index}>
              <td>{item.id}</td>
              <td>{item.product}</td>
              <td>{item.price}</td>
              <td>{item.brand}</td>
            </tr>
          ))}
        </table>
        <div className="pos_button right">
          <button
            className="button_style"
            onClick={() => setOffset(offset + 50)}
          >
            {">"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
