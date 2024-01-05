import React from "react";

export const Batch = () => {
const [list, setList] = React.useState(null)



  return <div className="w-64">
    <div className="flex justify-between bg-slate-800 text-white px-2 py-1">
        <h4>Batch List</h4>
        <button type="button" className="bg-green-400 px-2 py-1 rounded text-xs text-white" onClick={() => {}}>NEW</button>
    </div>

    {!list && <div className="bg-slate-600 py-2 text-slate-400 px-4">List empty</div>}
    </div>;
};
