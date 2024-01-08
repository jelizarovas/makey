import React from "react";

export const Batch = ({ batchList, edit }) => {
  const [list, setList] = React.useState(null);

  return (
    <div className="w-64">
      <div className="flex justify-between bg-slate-800 text-white px-2 py-1">
        <h4>Batch List</h4>
        <button type="button" className="bg-green-400 px-2 py-1 rounded text-xs text-white" onClick={() => {}}>
          NEW
        </button>
      </div>

      {/* <pre>{JSON.stringify(batchList, null, 2)}</pre> */}

      {batchList && batchList.length > 0 ? (
        <div className="bg-slate-600 py-2 text-slate-400 px-4">
          {batchList.map((item, index) => (
            <button className="text-white my-1 bg-white bg-opacity-5 px-2 rounded hover:bg-opacity-10 transition-all " key={index} onClick={() => edit(item)}>
              {item?.vin}
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-slate-600 py-2 text-slate-400 px-4">List empty</div>
      )}
    </div>
  );
};
