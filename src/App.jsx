import { useReducer, useState } from "react";
import { KeyForm } from "./KeyForm";
import Search from "./Search";
import {
  parseAddress,
  parseCallForPrice,
  parseDateToTimestamp,
  parseNonAlphaNumeric,
  parseOurPrice,
  parseStringToBoolean,
  transformObject,
  updateObject,
} from "./utils";
import { TagEditor } from "./TagEditor";

const initialState = {
  vin: "",
  year: "",
  make: "",
  model: "",
  modelNumber: "", //"418420"
  trim: "",
  body: "",
  stock: "",
  type: "", //new, used, certified
  link: "",
  thumbnail: "",
  msrp: 0,
  ourPrice: "", //number, or html
  ourPriceLabel: "",
  certified: "", //0 or  1
  fuelCity: "",
  fuelHighway: "",
  fuelType: "", //Hybrid Fuel
  cylinders: "",
  dateInStock: "", //11/18/2023
  dateModified: "", //2023-11-23 12:24:41
  daysInStock: "",
  doors: "",
  drivetrain: "", //"FWD"
  engineDescription: "",
  transmissionDescription: "",
  extColor: "",
  extColorGeneric: "",
  intColor: "",
  location: "", //"15026 1st Ave S<br/>Burien, WA 98148"
  miles: "",
  extOptions: [], //array  of strings
  intOptions: [], //array  of strings
  features: [], // array  of  strings
};

const hitMap = {
  type: "type", //New, Used, Certified
  vin: "vin",
  year: "year",
  make: "make",
  model: "model",
  modelNumber: "model_number", //"418420"
  trim: "trim",
  body: "body",
  extColor: "ext_color",
  extColorGeneric: "ext_color_generic",
  intColor: "int_color",
  stock: ["stock", (s, data) => data["vin"].slice(-8)],
  link: "link",
  thumbnail: "thumbnail",
  msrp: "msrp",
  ourPrice: ["our_price", parseOurPrice], //number, or html
  callForPrice: ["our_price", parseCallForPrice], //number, or html
  ourPriceLabel: ["our_price_label", parseNonAlphaNumeric],
  certified: ["certified", parseStringToBoolean], //0 or  1
  fuelCity: "city_mpg",
  fuelHighway: "hw_mpg",
  fuelType: "fueltype", //Hybrid Fuel | Gasoline Fuel
  cylinders: "cylinders",
  dateInStock: ["date_in_stock", parseDateToTimestamp], //11/18/2023
  dateModified: ["date_modified", parseDateToTimestamp], //2023-11-23 12:24:41
  daysInStock: "days_in_stock",
  doors: "doors",
  drivetrain: "drivetrain", //"FWD"
  engineDescription: "engine_description",
  transmissionDescription: "transmission_description",
  location: ["location", parseAddress], //"15026 1st Ave S<br/>Burien, WA 98148"
  miles: "miles",
  extOptions: "ext_options", //array  of strings
  intOptions: "int_options", //array  of strings
  features: "features", // array  of  strings
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SELECT_INVENTORY":
      return { ...state, ...action.payload };
    case "DECODE_VIN":
      return updateObject({ ...state }, action.payload);
    case "NEW_VIN":
      return { ...action.payload };
    case "CLEAR":
      return {};

    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [vinData, setVinData] = useState(null);
  const [hitData, setHitData] = useState(null);

  const onSelect = (data) => {
    const newData = transformObject(data, hitMap);
    setHitData(data);
    dispatch({ type: "SELECT_INVENTORY", payload: newData });
  };

  return (
    <>
      <Search onSelect={onSelect} />
      <KeyForm
        state={state}
        dispatch={dispatch}
        vinData={vinData}
        setVinData={setVinData}
      />
      <TagEditor />
      {/* <div className="text-xs overflow-y-scroll h-96 bg-indigo-800 text-white ">
        <ul>
          {hitData &&
            Object.entries(state).map(([key, value], i) => (
              <li key={i} className="flex space-x-2 hover:bg-fuchsia-800">
                <span
                  title={key}
                  className="w-36 overflow-x-hidden whitespace-nowrap"
                >
                  {key}
                </span>
                <span>{JSON.stringify(value, null, 2)}</span>
              </li>
            ))}
        </ul>
      </div> */}
      {/* <div className="text-xs overflow-y-scroll h-96 bg-black text-white ">
        <ul>
          {vinData &&
            vinData.map((p, i) => (
              <li key={i} className="flex space-x-2 hover:bg-fuchsia-800">
                <span
                  title={p?.Variable}
                  className="w-36 overflow-x-hidden whitespace-nowrap"
                >
                  {p?.Variable}
                </span>
                <span>{p?.Value}</span>
              </li>
            ))}
        </ul>
      </div> */}
    </>
  );
}

export default App;
