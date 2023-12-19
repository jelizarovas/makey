import download from "downloadjs";
import { PDFDocument, rgb } from "pdf-lib";
import React, { useReducer, useEffect, useRef } from "react";
import { MdClear, MdHelp, MdPerson } from "react-icons/md";

const DPI = 96; // Your system's DPI
const PDF_DPI = 72; // PDF's DPI

function convertToPdfCoordinates(x, y, width, height) {
  const xPdf = (x / DPI) * PDF_DPI;
  const yPdf = (y / DPI) * PDF_DPI;
  const widthPdf = (width / DPI) * PDF_DPI;
  const heightPdf = (height / DPI) * PDF_DPI;
  return { xPdf, yPdf, widthPdf, heightPdf };
}

const fetchVINData = (vin, updateData, setRawVinData) => {
  fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`)
    .then((response) => response.json())
    .then((data) => {
      setRawVinData(data.Results);
      const results = data.Results;
      const decodedData = {
        vin,
        year: results.find((r) => r.Variable === "Model Year")?.Value,
        make: results.find((r) => r.Variable === "Make")?.Value,
        model: results.find((r) => r.Variable === "Model")?.Value,
        trim: results.find((r) => r.Variable === "Trim")?.Value,
        body: results.find((r) => r.Variable === "Body Class")?.Value,
        seatRows: results.find((r) => r.Variable === "Number of Seat Rows")?.Value,
        driveType: results.find((r) => r.Variable === "Drive Type")?.Value,
        displacementL: results.find((r) => r.Variable === "Displacement (L)")?.Value,
        horsePower: results.find((r) => r.Variable === "Engine Brake (hp) From")?.Value,
      };
      updateData(decodedData);
    });
};

export const KeyForm = ({ state, dispatch, vinData, carDescription, setVinData }) => {
  const handleInputChange = (field, value) => {
    dispatch({
      type: "SET_FIELD",
      field,
      value,
    });
  };

  React.useEffect(() => {
    if (state.vin.length === 17) {
      fetchVINData(state.vin, (decodedData) => dispatch({ type: "DECODE_VIN", payload: decodedData }), setVinData);
    }
  }, [state.vin]);

  const handlePasteVin = async (event) => {
    // event.preventDefault(); // Prevent the default paste action

    // Get the pasted text from the clipboard
    const pastedText = (event.clipboardData || window.clipboardData).getData("text");
    const pastedVinTrimmed = pastedText.trim();

    // Check if the trimmed value length is 17
    if (pastedVinTrimmed.length === 17) {
      try {
        const decodedData = await fetchVINData(
          pastedVinTrimmed,
          (decodedData) => dispatch({ type: "NEW_VIN", payload: decodedData }),
          setVinData
        );
      } catch (error) {
        console.error("Error fetching VIN data:", error);
        // Handle error appropriately
      }
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault(); // Prevents the default form submit action
    createPdf(state);
  };

  async function loadImage(pdfDoc) {
    const imageUrl = "/makey/consecutag.jpg"; // Adjust the path if necessary
    const imageBytes = await fetch(imageUrl).then((res) => res.arrayBuffer());
    const image = await pdfDoc.embedJpg(imageBytes); // Use embedJpg if your image is a JPEG
    return image;
  }

  async function createPdf(data) {
    // Create a new PDFDocument
    const pdfDoc = await PDFDocument.create();
    const image = await loadImage(pdfDoc);

    // Convert inches to points (1 inch = 72 points)
    const pageWidth = 2 * 3 * 72;
    const pageHeight = 2 * 3 * 72; //432
    // const pageWidth = 2.25 * 72;
    // const pageHeight = 3 * 72;

    // Add a page to the document with the specified size
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Define text and coordinates
    // const texts = [
    //   { text: `${year}`, x: 10, y: pageHeight - 30 }, // Adjust x and y as needed
    //   { text: `${make}`, x: 10, y: pageHeight - 50 },
    //   { text: `${model}`, x: 10, y: pageHeight - 70 },
    // ];

    // // Add texts to the page
    // texts.forEach(({ text, x, y }) => {
    //   page.drawText(text, { x, y, size: 12, color: rgb(0, 0, 0) });
    // });

    if (data?.includeLabel) {
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
      });
    }
    if (data?.includeFields) {
      fieldArray.forEach((field) => {
        // Convert to PDF coordinates
        const { xPdf, yPdf, widthPdf, heightPdf } = convertToPdfCoordinates(
          field.position.x,
          field.position.y,
          field.size.width,
          field.size.height
        );

        page.drawText(data[field.id] || field.text, {
          x: xPdf,
          y: pageHeight - yPdf - heightPdf * 0.75,
          size: field.fontSize * 0.75,
          // Adjust text alignment as needed
        });
      });
    }

    // Serialize the PDFDocument to bytes
    const pdfBytes = await pdfDoc.save();

    // download(pdfBytes, "vehicle-details.pdf", "application/pdf");
    const blob = new Blob([pdfBytes], { type: "application/pdf" });

    // Create an object URL for the Blob
    const url = URL.createObjectURL(blob);

    // Open the PDF in a new tab
    window.open(url, "_blank");

    // Code to save pdfBytes to a file or return as needed
    // Example: fs.writeFileSync('output.pdf', pdfBytes);
  }

  async function createPdfWithRectangles(data) {
    // Create a new PDFDocument
    const pdfDoc = await PDFDocument.create();
    const image = await loadImage(pdfDoc);
    // Define page, margin, and padding dimensions (in points; 1 inch = 72 points)
    const pageWidth = 8.5 * 72;
    const pageHeight = 11 * 72;
    const margin = 0.25 * 72;
    const verticalPadding = 0.5 * 72;
    const rectWidth = 3 * 72;
    const rectHeight = 3 * 72;

    // Calculate the number of rectangles that can fit within the margins and padding
    const rectsPerRow = Math.floor((pageWidth - 2 * margin) / rectWidth);
    const rectsPerColumn = Math.floor((pageHeight - 2 * margin) / (rectHeight + verticalPadding));

    // Add a page
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Add rectangles and numbers
    let number = 1;
    for (let y = 0; y < rectsPerColumn; y++) {
      for (let x = 0; x < rectsPerRow; x++) {
        const xPos = margin + x * rectWidth;
        const yPos = pageHeight - margin - rectHeight - y * (rectHeight + verticalPadding);

        if (data?.includeLabel) {
          page.drawImage(image, {
            x: xPos,
            y: yPos,
            width: rectWidth,
            height: rectHeight,
          });
          // } else {
          // Add number in the center
          // const fontSize = 12; // Adjust as needed
          // const text = String(number);
          // const textWidth = fontSize * 0.6 * text.length; // Approximate text width
          // const textXPos = xPos + rectWidth / 2 - textWidth / 2;
          // const textYPos = yPos + rectHeight / 2 - fontSize / 2;
          // page.drawText(text, {
          //   x: textXPos,
          //   y: textYPos,
          //   size: fontSize,
          // });
        }
        // Draw rectangle
        page.drawRectangle({
          x: xPos,
          y: yPos,
          width: rectWidth,
          height: rectHeight,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });

        // page.drawText(`x:${xPos}, y:${yPos}`, {
        //   x: xPos,
        //   y: yPos,
        // });
        if (data?.includeFields) {
          fieldArray.forEach((field) => {
            // Convert to PDF coordinates
            const { xPdf, yPdf, widthPdf, heightPdf } = convertToPdfCoordinates(
              field.position.x,
              field.position.y,
              field.size.width,
              field.size.height
            );

            page.drawText(data[field.id] || field.text, {
              x: xPos + xPdf,
              y: yPos + rectHeight - yPdf - margin,
              size: field.fontSize * 0.75,
              // Adjust text alignment as needed
            });
          });
        }

        number++;
      }
    }

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await pdfDoc.save();
    const timestamp = new Date().getTime();
    // download(pdfBytes, `tags-${timestamp}.pdf`, "application/pdf");

    const blob = new Blob([pdfBytes], { type: "application/pdf" });

    // Create an object URL for the Blob
    const url = URL.createObjectURL(blob);

    // Open the PDF in a new tab
    window.open(url, "_blank");
    return pdfBytes;
  }

  return (
    <div className=" px-4 py-2  ">
      <form className="flex flex-col space-y-1 w-96 " onSubmit={handleSubmit}>
        <Input
          handleOnChange={handleInputChange}
          name="vin"
          label="VIN"
          // Icon={MdPerson}
          value={state.vin}
          placeholder="12345678901234567"
        />
        <Input
          handleOnChange={handleInputChange}
          name="year"
          label="Year"
          // Icon={MdPerson}
          value={state.year}
          placeholder="2024"
        />
        <Input
          handleOnChange={handleInputChange}
          name="make"
          // Icon={MdPerson}
          value={state.make}
          placeholder="Make"
          label="Make"
        />
        <Input
          handleOnChange={handleInputChange}
          name="model"
          label="Model"
          // Icon={MdPerson}
          value={state.model}
          placeholder="CR-V"
        />
        <Input
          handleOnChange={handleInputChange}
          name="trim"
          label="Trim"
          // Icon={MdPerson}
          value={state.trim}
          placeholder="EX-L"
        />
        <Input
          handleOnChange={handleInputChange}
          name="body"
          label="Body"
          // Icon={MdPerson}
          value={state.body}
          placeholder="SUV"
        />

        <Input
          handleOnChange={handleInputChange}
          name="extColor"
          label="Exterior Color"
          // Icon={MdPerson}
          value={state.extColor}
          placeholder="Exterior Color"
        />
        {/* <Input
          handleOnChange={handleInputChange}
          name="stock"
          label="Stock"
          // Icon={MdPerson}
          value={state.stock}
          placeholder="Stock (Last 8 of VIN)"
        /> */}
        <Input
          label="Miles"
          handleOnChange={handleInputChange}
          name="miles"
          Icon={MdPerson}
          value={state.miles}
          placeholder="Miles"
        />
        <Checkbox
          label="includeFields"
          handleOnChange={handleInputChange}
          name="includeFields"
          Icon={MdPerson}
          value={state.includeFields}
          placeholder="includeFields"
        />
        <Checkbox
          label="includeLabel"
          handleOnChange={handleInputChange}
          name="includeLabel"
          Icon={MdPerson}
          value={state.includeLabel}
          placeholder="includeLabel"
        />

        {/* <div><pre>
  {JSON.stringify(state,null,2)}
  </pre></div> */}
        <div className="flex py-4">
          {carDescription.toString()}
          {/* <button
            className="bg-green-700 text-white py-1 rounded text-xs w-36 mx-auto "
            type="submit"
          >
            Submit and Create PDF
          </button> */}
        </div>
        <div className="flex py-4">
          <button
            onClick={() => createPdf({ carDescription, ...state })}
            className="bg-blue-700 text-white py-1 rounded text-xs w-36 mx-auto "
            type="button"
          >
            SAMPLE PDF
          </button>
        </div>
      </form>
    </div>
  );
};

const Input = ({
  name,
  label,
  value = "",
  placeholder = "",
  handleOnChange,
  containerClassNames = "",
  type = "text",
  Icon,
  ...props
}) => {
  const inputRef = useRef(null);

  const onChange = (event) => {
    handleOnChange(event.target.name, event.target.value);
  };
  const handleClear = (e) => {
    handleOnChange(name, "");
    inputRef.current?.focus();
  };

  return (
    <div className={`group focus-within:text-indigo-900 ${containerClassNames}`}>
      <label className="flex">
        <div className="flex items-center">
          <span className="text-xs px-2 upper w-32 text-right">{label}</span>
        </div>
        <div
          className={`flex bg-slate-50 flex-grow hover:bg-white transition-all items-center px-2 py-1   rounded border border-slate-800 focus-within:border-indigo-400`}
        >
          {/* <div className="w-6 px-2 text-[8px] text-center flex flex-col justify-center items-center">{Icon && <span className='text-lg'><Icon  /></span>}  </div> */}

          <input
            ref={inputRef}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="bg-transparent outline-none px-2 flex-grow py-0.5 text-sm"
          />
          {/* <span>
            <MdHelp />
          </span> */}
          {value.toString().length > 0 && (
            <button
              type="button"
              className="hidden group-hover:block group-focus-within:block bg-black bg-opacity-0 transition-all  hover:bg-opacity-10 rounded-full px-1 py-1 "
              tabIndex={-1}
              onClick={handleClear}
            >
              <MdClear />
            </button>
          )}
        </div>
      </label>
    </div>
  );
};

const Checkbox = ({ name, value = false, label, handleOnChange }) => {
  const handleChange = (event) => {
    // Update the state by calling handleOnChange with field name and new value
    handleOnChange(name, event.target.checked);
  };

  return (
    <label>
      <input type="checkbox" name={name} checked={value} onChange={handleChange} />
      {label}
    </label>
  );
};

export const fieldArray = [
  {
    id: "stock",
    text: "RB003953",
    position: {
      x: 12.666694754791251,
      y: 345.3333435058594,
    },
    size: {
      width: 100,
      height: 29,
    },
    fontSize: 19,
  },
  {
    id: "keyNumber1",
    text: "1",
    position: {
      x: 15.33331525878907,
      y: 306.00001525878906,
    },
    size: {
      width: 20,
      height: 26,
    },
    fontSize: 17,
  },
  {
    id: "year",
    text: "2024",
    position: {
      x: 41.33333051757813,
      y: 368.6666717529297,
    },
    size: {
      width: 85,
      height: 31,
    },
    fontSize: 20,
  },
  {
    id: "make",
    text: "HONDA",
    position: {
      x: 36.66662370605468,
      y: 390.66668701171875,
    },
    size: {
      width: 78,
      height: 28,
    },
    fontSize: 18,
  },
  {
    id: "model",
    text: "Pilot",
    position: {
      x: 41.33331525878907,
      y: 420,
    },
    size: {
      width: 79,
      height: 25,
    },
    fontSize: 16,
  },
  {
    id: "trim",
    text: "ELITE",
    position: {
      x: 37.33333051757813,
      y: 445.33335876464844,
    },
    size: {
      width: 81,
      height: 23,
    },
    fontSize: 15,
  },
  {
    id: "extColor",
    text: "Nh-883pv",
    position: {
      x: 46.66662370605468,
      y: 465.3330535888672,
    },
    size: {
      width: 78,
      height: 27,
    },
    fontSize: 9,
  },
  {
    id: "keyNumber2",
    text: "2",
    position: {
      x: 299.33282470703125,
      y: 306.6666643066406,
    },
    size: {
      width: 34,
      height: 23,
    },
    fontSize: 15,
  },
  {
    id: "stock",
    text: "RB003953",
    position: {
      x: 29.3333740234375,
      y: 44.666656494140625,
    },
    size: {
      width: 368,
      height: 146,
    },
    fontSize: 83,
  },
  {
    id: "carDescription",
    text: "2024 Honda Pilot Elite",
    position: {
      x: 30.66668701171875,
      y: 156.66665649414062,
    },
    size: {
      width: 513,
      height: 49,
    },
    fontSize: 32,
  },
  {
    id: "stock",
    text: "RB003953",
    position: {
      x: 292.6666259765625,
      y: 346.0000305175781,
    },
    size: {
      width: 109,
      height: 29,
    },
    fontSize: 19,
  },
  {
    id: "year",
    text: "2024",
    position: {
      x: 329.3333740234375,
      y: 370.66668701171875,
    },
    size: {
      width: 80,
      height: 20,
    },
    fontSize: 13,
  },
  {
    id: "make",
    text: "HONDA",
    position: {
      x: 323.33331298828125,
      y: 392.66668701171875,
    },
    size: {
      width: 80,
      height: 20,
    },
    fontSize: 13,
  },
  {
    id: "model",
    text: "Pilot",
    position: {
      x: 328.00006103515625,
      y: 416.66668701171875,
    },
    size: {
      width: 80,
      height: 20,
    },
    fontSize: 13,
  },
  {
    id: "trim",
    text: "Elite",
    position: {
      x: 325.33331298828125,
      y: 440.66668701171875,
    },
    size: {
      width: 80,
      height: 20,
    },
    fontSize: 13,
  },
  {
    id: "extColor",
    text: "Nh-883pv",
    position: {
      x: 331.33331298828125,
      y: 466.6666564941406,
    },
    size: {
      width: 80,
      height: 20,
    },
    fontSize: 13,
  },
];

// export const fieldArray = [
//   {
//     id: "stock",
//     text: "RH707039",
//     position: {
//       x: 12.66662073135376,
//       y: 61.3333740234375,
//     },
//     size: {
//       width: 100,
//       height: 29,
//     },
//     fontSize: 19,
//   },
//   {
//     id: "keyNumber",
//     text: "1",
//     position: {
//       x: 15.333328247070312,
//       y: 21.333328247070312,
//     },
//     size: {
//       width: 20,
//       height: 26,
//     },
//     fontSize: 17,
//   },
//   {
//     id: "year",
//     text: "2024",
//     position: {
//       x: 41.333343505859375,
//       y: 89.33332824707031,
//     },
//     size: {
//       width: 85,
//       height: 31,
//     },
//     fontSize: 20,
//   },
//   {
//     id: "make",
//     text: "Honda",
//     position: {
//       x: 36.66667175292969,
//       y: 112,
//     },
//     size: {
//       width: 78,
//       height: 28,
//     },
//     fontSize: 18,
//   },
//   {
//     id: "model",
//     text: "CR-V",
//     position: {
//       x: 41.33332824707031,
//       y: 137.33334350585938,
//     },
//     size: {
//       width: 79,
//       height: 25,
//     },
//     fontSize: 16,
//   },
//   {
//     id: "trim",
//     text: "EX-L",
//     position: {
//       x: 37.333343505859375,
//       y: 162.00001525878906,
//     },
//     size: {
//       width: 81,
//       height: 23,
//     },
//     fontSize: 15,
//   },
//   {
//     id: "extColor",
//     text: "Canyon River Blue",
//     position: {
//       x: 46.66667175292969,
//       y: 182.6666717529297,
//     },
//     size: {
//       width: 78,
//       height: 27,
//     },
//     fontSize: 9,
//   },
// ];
