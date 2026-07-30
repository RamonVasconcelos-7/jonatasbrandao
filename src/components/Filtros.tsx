import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { STATUS_LIST, type AdvogadoRow, type Area, type Empresa } from "@/lib/data";

export const ALL = "__all__";

export type FiltroState = {
  busca: string;
  empresa: string;
  advogado: string;
  area: string;
  status: string;
  audiencia: string;
  ordem: string;
};

export const filtroInicial: FiltroState = {
  busca: "",
  empresa: ALL,
  advogado: ALL,
  area: ALL,
  status: ALL,
  audiencia: ALL,
  ordem: "prazo",
};

type Props = {
  value: FiltroState;
  onChange: (v: FiltroState) => void;
  empresas: Empresa[];
  areas: Area[];
  advogados: AdvogadoRow[];
  hide?: Array<"empresa" | "advogado" | "area">;
};

export function Filtros({ value, onChange, empresas, areas, advogados, hide = [] }: Props) {
  const set = (patch: Partial<FiltroState>) => onChange({ ...value, ...patch });

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3">
      <div className="relative min-w-56 flex-1">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por número dos autos"
          className="pl-8"
          value={value.busca}
          maxLength={80}
          onChange={(e) => set({ busca: e.target.value })}
        />
      </div>

      {!hide.includes("empresa") && (
        <Select value={value.empresa} onValueChange={(v) => set({ empresa: v })}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Empresa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas as empresas</SelectItem>
            {empresas.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {!hide.includes("advogado") && (
        <Select value={value.advogado} onValueChange={(v) => set({ advogado: v })}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Advogado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos os advogados</SelectItem>
            <SelectItem value="none">Não distribuídos</SelectItem>
            {advogados.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {!hide.includes("area") && (
        <Select value={value.area} onValueChange={(v) => set({ area: v })}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Área" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas as áreas</SelectItem>
            {areas.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select value={value.status} onValueChange={(v) => set({ status: v })}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todos os status</SelectItem>
          {STATUS_LIST.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={value.audiencia} onValueChange={(v) => set({ audiencia: v })}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Audiência" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Com ou sem audiência</SelectItem>
          <SelectItem value="com">Com audiência marcada</SelectItem>
          <SelectItem value="sem">Sem audiência</SelectItem>
        </SelectContent>
      </Select>

      <Select value={value.ordem} onValueChange={(v) => set({ ordem: v })}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Ordenação" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="prazo">Prioridade de prazo</SelectItem>
          <SelectItem value="recentes">Cadastro mais recente</SelectItem>
          <SelectItem value="numero">Número dos autos</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
