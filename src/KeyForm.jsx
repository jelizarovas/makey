import React, { useReducer, useEffect } from "react";

const initialState = {
  vin: "",
  year: "",
  make: "",
  model: "",
  trim: "",
  body: "",
  color: "",
  stock: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "DECODE_VIN":
      return { ...state, ...action.data, stock: state.vin.slice(-8) };
    default:
      return state;
  }
}

export const KeyForm = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleInputChange = (e) => {
    dispatch({ type: "SET_FIELD", field: e.target.name, value: e.target.value });
  };

  useEffect(() => {
    if (state.vin.length === 17) {
      fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${state.vin}?format=json`)
        .then((response) => response.json())
        .then((data) => {
          const results = data.Results;
          const decodedData = {
            year: results.find((r) => r.Variable === "Model Year")?.Value,
            make: results.find((r) => r.Variable === "Make")?.Value,
            model: results.find((r) => r.Variable === "Model")?.Value,
            trim: results.find((r) => r.Variable === "Trim")?.Value,
            body: results.find((r) => r.Variable === "Body Class")?.Value,
          };
          dispatch({ type: "DECODE_VIN", data: decodedData });
        });
    }
  }, [state.vin]);

  const handleSubmit = (event) => {
    event.preventDefault(); // Prevents the default form submit action
    createPdf();
  };

  const createPdf = () => {
    // Implement your PDF creation logic here
    console.log("PDF is being created...");
    console.log(state);
  };

  return (
    <div className=" bg-fuchsia-500 px-4 py-2 container mx-auto ">
      <form className="flex flex-col space-y-1 " onSubmit={handleSubmit}>
        <input
          name="vin"
          value={state.vin}
          onChange={handleInputChange}
          placeholder="VIN"
          className="border rounded px-2 py-1"
        />
        <input
          onChange={handleInputChange}
          name="year"
          value={state.year}
          placeholder="Year"
          className="border rounded px-2 py-1"
        />
        <input
          onChange={handleInputChange}
          name="make"
          value={state.make}
          placeholder="Make"
          className="border rounded px-2 py-1"
        />
        <input
          onChange={handleInputChange}
          name="model"
          value={state.model}
          placeholder="Model"
          className="border rounded px-2 py-1"
        />
        <input
          onChange={handleInputChange}
          name="trim"
          value={state.trim}
          placeholder="Trim"
          className="border rounded px-2 py-1"
        />
        <input
          onChange={handleInputChange}
          name="body"
          value={state.body}
          placeholder="Body"
          className="border rounded px-2 py-1"
        />
        <input
          onChange={handleInputChange}
          name="color"
          value={state.color}
          placeholder="Color"
          className="border rounded px-2 py-1"
        />
        <input
          onChange={handleInputChange}
          name="stock"
          value={state.stock}
          placeholder="Stock"
          className="border rounded px-2 py-1"
        />
        <button type="submit">Submit and Create PDF</button>
      </form>
    </div>
  );
};
