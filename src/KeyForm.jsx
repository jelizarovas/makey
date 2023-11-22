import download from "downloadjs";
import { PDFDocument, rgb } from "pdf-lib";
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
    createPdf(state);
  };

  async function createPdf({ year, make, model }) {
    // Create a new PDFDocument
    const pdfDoc = await PDFDocument.create();

    // Convert inches to points (1 inch = 72 points)
    const pageWidth = 2.25 * 72;
    const pageHeight = 3 * 72;

    // Add a page to the document with the specified size
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Define text and coordinates
    const texts = [
      { text: `${year}`, x: 10, y: pageHeight - 30 }, // Adjust x and y as needed
      { text: `${make}`, x: 10, y: pageHeight - 50 },
      { text: `${model}`, x: 10, y: pageHeight - 70 },
    ];

    // Add texts to the page
    texts.forEach(({ text, x, y }) => {
      page.drawText(text, { x, y, size: 12, color: rgb(0, 0, 0) });
    });

    // Serialize the PDFDocument to bytes
    const pdfBytes = await pdfDoc.save();
    download(pdfBytes, "vehicle-details.pdf", "application/pdf");
    // Code to save pdfBytes to a file or return as needed
    // Example: fs.writeFileSync('output.pdf', pdfBytes);
  }

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
