import { sortByPrazo, type Processo } from "@/lib/data";
import { ALL, type FiltroState } from "@/components/Filtros";

export function aplicarFiltros(processos: Processo[], f: FiltroState) {
  const busca = f.busca.trim().toLowerCase();
  const list = processos.filter((p) => {
    if (busca && !p.numero.toLowerCase().includes(busca)) return false;
    if (f.empresa !== ALL && p.empresa_id !== f.empresa) return false;
    if (f.area !== ALL && p.area_id !== f.area) return false;
    if (f.status !== ALL && p.status !== f.status) return false;
    if (f.advogado === "none" && p.advogado_id) return false;
    if (f.advogado !== ALL && f.advogado !== "none" && p.advogado_id !== f.advogado) return false;
    if (f.audiencia === "com" && !p.data_audiencia) return false;
    if (f.audiencia === "sem" && p.data_audiencia) return false;
    return true;
  });

  if (f.ordem === "prazo") return [...list].sort(sortByPrazo);
  if (f.ordem === "numero") return [...list].sort((a, b) => a.numero.localeCompare(b.numero));
  return [...list].sort((a, b) => b.created_at.localeCompare(a.created_at));
}
