import { useEffect, useState } from "react";
import axiosClient from "../api/axios";

type Programme = {
  id: number;
  titre: string;
  description: string;
  prix?: number;
  statut?: string;
};

export default function CoachProgrammesPage() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");

  const [prix, setPrix] = useState<number>(0);

  const fetchProgrammes = () => {
    axiosClient.get("/coach/programmes")
      .then(res => setProgrammes(res.data.data))
      .catch(err => console.error(err));
  };

  const [editingProgramme, setEditingProgramme] = useState<any>(null);
  useEffect(() => {
    fetchProgrammes();
  }, []);

  const createProgramme = async () => {
  try {
    const res = await axiosClient.post("/coach/programmes", {
      titre,
      description,
      duree_semaines: 8,
      type: "remise_en_forme",
      statut: "brouillon",
      prix: prix,
    });



    const newProgramme = res.data.data;
setProgrammes((prev) => [newProgramme, ...prev]);

    setShowForm(false);
    setTitre("");
    setDescription("");
    setPrix(0);
  } catch (err: any) {
  console.log("ERROR DATA:", err.response?.data);
}
};

const deleteProgramme = async (id: number) => {
  try {
    await axiosClient.delete(`/coach/programmes/${id}`);

    setProgrammes((prev) => prev.filter((p) => p.id !== id));
  } catch (err) {
    console.error(err);
  }
};

const startEdit = (programme: any) => {
  setEditingProgramme(programme);
  setTitre(programme.titre);
  setDescription(programme.description);
  setShowForm(true);
  setPrix(programme.prix || 0);
};

const updateProgramme = async () => {
  try {
    const res = await axiosClient.put(
      `/coach/programmes/${editingProgramme.id}`,
      {
        
  titre,
  description,
  prix,
  duree_semaines: 8,
  type: "remise_en_forme",
  statut: editingProgramme.statut,

      }
    );

    const updated = res.data.data;

    setProgrammes((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );

    setEditingProgramme(null);
    setShowForm(false);
    setTitre("");
    setDescription("");
    setPrix(0);
  } catch (err) {
    console.error(err);
  }
};

  const toggleStatus = async (programme: Programme) => {
  const newStatus =
    programme.statut === "publie" ? "brouillon" : "publie";

  try {
    const res = await axiosClient.put(
      `/coach/programmes/${programme.id}`,
      {
        ...programme,
        statut: newStatus,
      }
    );

    setProgrammes((prev) =>
  prev.map((p) =>
    p.id === programme.id ? res.data.data : p
  )
);
  } catch (err) {
    console.error(err);
  }
};

   

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8 font-sans">
      
      {/* STATIC TOP NAV (From pic 2) */}
      <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
        <div className="flex bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
  <button className="px-6 py-2 bg-[#1e293b] text-white rounded-lg text-sm font-medium">
    All Programmes
  </button>
</div>

        <div className="flex items-center gap-3">
            <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm text-gray-600 flex items-center gap-2 shadow-sm cursor-pointer">
               <span>📅 This Week</span>
               <span className="text-[10px]">▼</span>
            </div>
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="Search..." 
                    className="bg-white border border-gray-200 pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none shadow-sm w-64"
                />
                <span className="absolute left-3 top-2.5 opacity-40">🔍</span>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT BOX */}
      <div className="bg-[#cbd5e1] rounded-[2.5rem] p-8 shadow-inner border border-gray-300">
        
        {/* HEADER AREA */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Programmes</h1>
            <p className="text-slate-600 mt-1">Explore top-quality coaching for your sporting activities</p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#15803d] hover:bg-[#166534] text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95"
          >
            <span className="text-xl">+</span> New Programme
          </button>
        </div>

        {/* CREATE FORM (Nested Style) */}
        {showForm && (
          <div className="bg-white rounded-2xl p-6 mb-8 shadow-xl border border-white/50 animate-in fade-in slide-in-from-top-4 duration-300">
            <input
              placeholder="Programme Title"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              className="w-full text-xl font-semibold border-b border-gray-100 py-3 mb-4 focus:outline-none focus:border-green-500 transition-colors"
            />
            <textarea
              placeholder="Provide a short description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-50 rounded-xl p-4 mb-6 focus:outline-none min-h-[100px] border border-gray-100"
            />
            <input
  type="number"
  placeholder="Price (€)"
  value={prix}
  onChange={(e) => setPrix(Number(e.target.value))}
  className="w-full bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100"
/>
            <button
  onClick={editingProgramme ? updateProgramme : createProgramme}
  className="bg-[#15803d] text-white px-10 py-3 rounded-full font-bold shadow-md hover:shadow-lg transition-all"
>
  {editingProgramme ? "Update Programme" : "Save Programme"}
</button>
          </div>
        )}

        {/* REFINED TABLE */}
        <div className="bg-[#f8fafc] rounded-3xl shadow-xl overflow-hidden border border-gray-200">
          <table className="w-full text-left">
            <thead className="bg-[#f1f5f9] border-b border-gray-200">
              <tr className="text-[11px] uppercase tracking-widest text-slate-500 font-bold">
                <th className="px-8 py-5">Program Name</th>
                <th className="px-6 py-5">Price</th>
                <th className="px-6 py-5">Added On</th>
                <th className="px-6 py-5 text-right">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {programmes.map((p) => (
                <tr key={p.id} className="hover:bg-white transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-300 rounded-xl overflow-hidden flex-shrink-0 shadow-sm border border-white">
                         <div className="w-full h-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-[8px] text-white font-black">COACH</div>
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-base">{p.titre}</div>
                        <div className="text-xs text-slate-400 font-medium line-clamp-1 max-w-[250px]">{p.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="font-bold text-slate-700">${p.prix ?? 0}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm text-slate-500 font-medium">Mon, Jul 12</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-end gap-3">
                        <div className="flex items-center justify-end gap-3">
  <span
    onClick={() => startEdit(p)}
    className="text-blue-500 text-xs cursor-pointer hover:underline"
  >
    ✏️ Edit
  </span>

  <span
    onClick={() => deleteProgramme(p.id)}
    className="text-red-500 text-xs cursor-pointer hover:underline"
  >
    🗑 Delete
  </span>
</div>
                        {/* Toggle Switch */}
                        <div
  onClick={() => toggleStatus(p)}
  className={`w-10 h-5 rounded-full p-1 cursor-pointer ${
    p.statut === "publie" ? "bg-green-500" : "bg-gray-300"
  }`}
>
  <div
    className={`w-3 h-3 bg-white rounded-full transition-transform ${
      p.statut === "publie" ? "translate-x-5" : ""
    }`}
  />
</div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}