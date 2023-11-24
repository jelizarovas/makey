import { useState, useRef, useEffect } from "react";
import {
  MdAutorenew,
  MdCheck,
  MdClear,
  MdCopyAll,
  MdSearch,
} from "react-icons/md";
import algoliasearch from "algoliasearch/lite";
import {
  InstantSearch,
  SearchBox,
  Hits,
  Configure,
  useInstantSearch,
} from "react-instantsearch";
import { ImSpinner2 } from "react-icons/im";

const burienAPI = {
  name: "Burien",
  "X-Algolia-API-Key": "179608f32563367799314290254e3e44",
  "X-Algolia-Application-Id": "SEWJN80HTN",
  index:
    "rairdonshondaofburien-legacymigration0222_production_inventory_high_to_low",
};

const searchClient = algoliasearch(
  burienAPI["X-Algolia-Application-Id"],
  burienAPI["X-Algolia-API-Key"],
  { page: 1 }
);

export default function Search({ onSelect }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={burienAPI.index}
      future={{ preserveSharedStateOnUnmount: true }}
    >
      <Configure hitsPerPage={5} />
      <InnerInstantSearch
        onSelect={onSelect}
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
      />
    </InstantSearch>
  );
}

function InnerInstantSearch({ selectedIndex, setSelectedIndex, onSelect }) {
  const listRef = useRef(null);

  const handleSelect = (...args) => {
    if (listRef.current) {
      listRef.current.classList.remove(
        "group-focus-within:block",
        "group-hover:block"
      );

      setTimeout(() => {
        listRef.current.classList.add(
          "group-focus-within:block",
          "group-hover:block"
        );
      }, 200);
    }
    setSelectedIndex(0);
    return onSelect(...args);
  };

  const { status, results, error } = useInstantSearch({ catchError: true });
  const searchResults = results._rawResults[0].hits;
  const CustomHitsComponent = ({ hit }) => (
    <Hit
      hit={hit}
      onSelect={handleSelect}
      selectedIndex={selectedIndex}
      setSelectedIndex={setSelectedIndex}
      handleKeyDown={handleKeyDown}
    />
  );

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((prevIndex) =>
        Math.min(prevIndex + 1, searchResults.length - 1)
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      handleSelect(searchResults[selectedIndex]);
    }
  };

  return (
    <>
      <div className="group relative  container mx-auto">
        {error && <>Search error: {error.message}</>}

        <div className="flex items-center text-lg text-white px-4 space-x-2 w-full bg-slate-500 focus-within:bg-slate-700 transition-all  hover:bg-slate-600 cursor-pointer  ">
          {status === "loading" || status === "stalled" ? (
            <span className="animate-spin">
              <ImSpinner2 />
            </span>
          ) : (
            <button>
              <MdSearch />
            </button>
          )}
          <SearchBox
            onKeyDown={handleKeyDown}
            className="w-full"
            classNames={{
              form: "flex w-full items-center",
              input:
                "bg-transparent flex-grow   p-2  w-full ring-0 focus:outline-none hide-clear ",
              submit: "hidden",
            }}
            placeholder={`Search HoB inventory`}
            resetIconComponent={ClearComponent}
          />
        </div>
        <div
          ref={listRef}
          className="absolute drop-shadow-2xl border border-slate-400 transition-all     group-focus-within:block group-hover:block bg-white overflow-y-auto w-full hidden"
        >
          <Hits hitComponent={CustomHitsComponent} />
        </div>
        {/* <div className="text-xs">
            <pre>{JSON.stringify(results._rawResults[0].hits.length, null, 2)}</pre>
        </div> */}
      </div>
    </>
  );
}

function Hit({
  hit,
  onSelect,
  selectedIndex,
  setSelectedIndex,
  handleKeyDown,
}) {
  const backgroundStyle = {
    backgroundImage: `url(${hit?.thumbnail})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  const showCarfax = true;
  const showPrice = true;

  return (
    <article
      className={`text-[8px]  transition-all bg-slate-800 text-white ${
        selectedIndex === hit.__position - 1 ? "bg-slate-600" : ""
      }`}
      onClick={(e) => {
        onSelect(hit);
      }}
      onMouseEnter={(e) => {
        setSelectedIndex(hit.__position - 1);
      }}
      onKeyDown={handleKeyDown}
    >
      <div
        className="flex flex-col lg:flex-row w-full items-center lg:space-x-4"
        // onClick={() => setActiveActionBarId(activeActionBarId === hit?.vin ? null : hit?.vin)}
      >
        <div className="w-full max-w-full flex    border border-white  transition-all border-opacity-20 md:rounded  ">
          <div
            style={backgroundStyle}
            className="w-24 h-16    flex-shrink-0 overflow-hidden hover:scale-95 transition-all "
          ></div>
          <div className="flex flex-col justify-between items-start flex-grow truncate px-1">
            <div className="flex w-full justify-between">
              <div
                className="whitespace-pre-wrap text-sm "
                onClick={() => console.log("CLICKED!!!")}
              >
                {`${hit?.year} ${hit?.make} ${hit?.model}`}{" "}
                <span className="opacity-40">{hit?.trim}</span>
                {hit?.certified > 0 && (
                  <span className="mx-2 border rounded text-xs px-1 py-0 bg-blue-600 bg-opacity-50">
                    CPO
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-4">
                {/* <a
                  href={hit?.link}
                  target="_blank"
                  aria-describedby="audioeye_new_window_message"
                  className="rounded-full    border-opacity-25 hover:bg-white hover:bg-opacity-20"
                >
                  <RxExternalLink />
                </a>

                {showCarfax && (
                  <a
                    href={`http://www.carfax.com/VehicleHistory/p/Report.cfx?partner=DEY_0&vin=${hit?.vin}`}
                    target="_blank"
                    aria-describedby="audioeye_new_window_message"
                    className="rounded-full    border-opacity-25 hover:bg-white hover:bg-opacity-20"
                  >
                    <MdOutlineHistory />
                  </a>
                )} */}
                {showPrice && hit?.our_price && (
                  <span className="px-2 " onClick={() => console.log(hit)}>
                    {formatCurrency(hit.our_price)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between text-xs w-full ">
              <div className="text-sm ">
                <VINComponent vin={hit?.vin} />
                {/* {hit?.vin && "#" + v.vin.slice(-8)} */}
              </div>
              <div className="text-xs">
                {hit?.miles && parseMileage(hit.miles)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <pre>{JSON.stringify(hit, null, 2)}</pre> */}
    </article>
  );
}

export function parseMileage(mileage) {
  return (
    Math.floor(Number(mileage.toString().replace(/\D/g, "")) / 1000) + "k miles"
  );
}

export function formatCurrency(num) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

export const VINComponent = ({ vin }) => {
  const [isCopying, setIsCopying] = useState("");

  const handleCopy = (text) => {
    setIsCopying(text);
    navigator.clipboard.writeText(text);
    setTimeout(() => {
      setIsCopying("");
    }, 1000); // Delay of 1 second (1000 milliseconds)
  };

  const boldStockNumber = vin.slice(-8); // Extract the last 8 symbols for stock number
  const regularVIN = vin.slice(0, -8); // Remove the last 8 symbols from the VIN

  if (!!isCopying)
    return (
      <div className="bg-lime-500 bg-opacity-60 px-1 py-0.5 rounded flex items-center">
        <MdCheck /> <MdCopyAll /> {isCopying}
      </div>
    );

  return (
    <div
      className="flex space-x-1 group cursor-copy"
      onClick={(e) => {
        e.stopPropagation();
        handleCopy(vin);
      }}
    >
      <span className="opacity-30 group-hover:opacity-70 transition-all">
        {regularVIN}
      </span>
      <span
        className="opacity-70 transition-all group-hover:opacity-100 hover:text-indigo-400 "
        onClick={(e) => {
          e.stopPropagation();
          handleCopy(boldStockNumber);
        }}
      >
        {boldStockNumber}
      </span>
    </div>
  );
};

const ClearComponent = () => {
  return (
    <span>
      <MdClear className="" />
    </span>
  );
};
