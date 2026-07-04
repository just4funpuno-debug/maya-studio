import type { PiezaHistorialResumen } from "@/lib/calendario/cargar-historial-piezas";
import { cargarHistorialPiezas } from "@/lib/calendario/cargar-historial-piezas";
import {
  formatearFechaHoyBolivia,
  getBoliviaMonthStartUtc,
  getBoliviaVentanaRecienteInicioUtc,
  getBoliviaWeekStartUtc,
} from "@/lib/date/bolivia";
import type { UsuarioPerfil } from "@/lib/auth/perfil";
import { nombreMostrable } from "@/lib/auth/perfil";
import { esAdmin } from "@/lib/auth/requiere-admin";
import { cargarListaProductos } from "@/lib/productos/cargar-lista-productos";
import { createClient } from "@/lib/supabase/server";

export type DashboardPulso = {
  total: number;
  listos: number;
  pendientes: number;
  porcentaje: number;
};

export type DashboardMetricas = {
  piezasTotal: number;
  piezasMes: number;
  piezasSemana: number;
  productosActivos: number;
};

export type DashboardDatos = {
  saludoNombre: string;
  fechaHoy: string;
  esAdmin: boolean;
  pulso: DashboardPulso;
  metricas: DashboardMetricas;
  publicacionesRecientes: PiezaHistorialResumen[];
  equipo: { creadores: number } | null;
  error: string | null;
};

async function contarPiezasAprobadas(desdeIso?: string): Promise<number> {
  const supabase = await createClient();
  let query = supabase
    .from("piezas")
    .select("id", { count: "exact", head: true })
    .eq("estado", "aprobado");

  if (desdeIso) {
    query = query.gte("creado_en", desdeIso);
  }

  const { count, error } = await query;
  if (error) throw new Error(error.message);
  return count ?? 0;
}

async function contarCreadores(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("usuarios")
    .select("id", { count: "exact", head: true })
    .eq("rol", "creador");

  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function cargarDashboard(
  usuario: UsuarioPerfil | null
): Promise<DashboardDatos> {
  const saludoNombre = usuario ? nombreMostrable(usuario) : "Usuario";
  const fechaHoy = formatearFechaHoyBolivia();
  const admin = esAdmin(usuario);

  try {
    const mesInicio = getBoliviaMonthStartUtc();
    const semanaInicio = getBoliviaWeekStartUtc();
    const ventanaPuntuacion = getBoliviaVentanaRecienteInicioUtc(11);

    const [
      { productos, error: errorProductos },
      piezasTotal,
      piezasMes,
      piezasSemana,
      { piezas: publicacionesRecientes, error: errorPublicaciones },
      creadores,
    ] = await Promise.all([
      cargarListaProductos(usuario),
      contarPiezasAprobadas(),
      contarPiezasAprobadas(mesInicio),
      contarPiezasAprobadas(semanaInicio),
      cargarHistorialPiezas(null, undefined, ventanaPuntuacion),
      admin ? contarCreadores() : Promise.resolve(0),
    ]);

    const error = errorProductos ?? errorPublicaciones ?? null;

    const listos = productos.filter((p) => p.generadoHoy).length;
    const total = productos.length;
    const pendientes = total - listos;
    const porcentaje = total > 0 ? Math.round((listos / total) * 100) : 0;

    return {
      saludoNombre,
      fechaHoy,
      esAdmin: admin,
      pulso: { total, listos, pendientes, porcentaje },
      metricas: {
        piezasTotal,
        piezasMes,
        piezasSemana,
        productosActivos: total,
      },
      publicacionesRecientes,
      equipo: admin ? { creadores } : null,
      error,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al cargar el dashboard.";
    return {
      saludoNombre,
      fechaHoy,
      esAdmin: admin,
      pulso: { total: 0, listos: 0, pendientes: 0, porcentaje: 0 },
      metricas: {
        piezasTotal: 0,
        piezasMes: 0,
        piezasSemana: 0,
        productosActivos: 0,
      },
      publicacionesRecientes: [],
      equipo: admin ? { creadores: 0 } : null,
      error: msg,
    };
  }
}
