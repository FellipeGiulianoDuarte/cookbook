import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { loadCatalog } from "@/lib/data";
import { derive } from "@/lib/derive";
import { formatClock } from "@/lib/engine/schedule";
import { EMPTY_SELECTION } from "@/lib/machine";
import { Method, Process, RoastLevel } from "@/lib/schema";

/*
  Shareable recipe card. Reads the same query parameters as the wizard and draws the
  numbers a friend needs: method, recipe, dose, water, temperature, grinder setting, time.
  Malformed parameters fall back to a generic card, never a 500.
*/

export const runtime = "nodejs";

const W = 1200;
const H = 630;
const BG = "#151210";
const FG = "#f2ede6";
const MUTED = "#a89e92";
const ACCENT = "#e0b077";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const { recipes, grinders, adjustments, microns, extraction } = loadCatalog();
  const catalog = { recipes, grinders, adjustments, microns, extraction };

  const m = Method.safeParse(q.get("m"));
  const roast = RoastLevel.safeParse(q.get("roast"));
  const proc = Process.safeParse(q.get("proc"));
  const dose = Number.parseFloat(q.get("d") ?? "");
  const selection = {
    ...EMPTY_SELECTION,
    method: m.success ? m.data : undefined,
    recipeId: q.get("r") ?? undefined,
    grinderId: q.get("g") ?? undefined,
    dose: Number.isFinite(dose) ? dose : undefined,
    roast: roast.success ? roast.data : "medium",
    process: proc.success ? proc.data : undefined,
    grindOffset: Number.parseInt(q.get("off") ?? "0", 10) || 0,
    nudge: q.get("nudge") === "true",
  };
  const d = derive(catalog, selection);

  const title = d.recipe ? d.recipe.name : "Cookbook";
  const subtitle = d.recipe
    ? `${d.recipe.method === "v60" ? "Hario V60" : "AeroPress"} · ${d.recipe.author}`
    : "Brew it right every time.";
  const cells =
    d.recipe && d.schedule
      ? [
          ["Coffee", `${d.schedule.dose} g`],
          [
            "Water",
            `${d.schedule.water} g${d.schedule.bypass ? ` +${d.schedule.bypass.grams}` : ""}`,
          ],
          ["Temp", `${d.tempC} °C`],
          ["Time", formatClock(d.schedule.totalSeconds)],
        ]
      : [];
  const setting =
    d.grinder && d.setting?.kind === "ok"
      ? `${d.setting.text} ±${d.setting.tolerance} · ${d.grinder.brand} ${d.grinder.model}`
      : d.recipe
        ? `${d.recipe.grind.texture} grind`
        : "";

  return new ImageResponse(
    <div
      style={{
        width: W,
        height: H,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 64,
        background: `radial-gradient(900px 500px at 85% 15%, #2a2018 0%, ${BG} 60%)`,
        color: FG,
        fontFamily: "Georgia, serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontSize: 22,
            letterSpacing: 4,
            color: MUTED,
            textTransform: "uppercase",
            fontFamily: "sans-serif",
          }}
        >
          Cookbook
        </div>
        <div
          style={{
            fontSize: 68,
            lineHeight: 1.05,
            marginTop: 12,
            letterSpacing: -1.5,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 28,
            color: MUTED,
            marginTop: 10,
            fontFamily: "sans-serif",
          }}
        >
          {subtitle}
        </div>
      </div>

      {cells.length ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", gap: 20 }}>
            {cells.map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "18px 26px",
                  borderRadius: 20,
                  background: "#221c18",
                  minWidth: 200,
                }}
              >
                <div
                  style={{
                    fontSize: 16,
                    letterSpacing: 3,
                    color: MUTED,
                    textTransform: "uppercase",
                    fontFamily: "sans-serif",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: 44,
                    marginTop: 4,
                    color: label === "Coffee" ? ACCENT : FG,
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{ fontSize: 26, color: ACCENT, fontFamily: "sans-serif" }}
          >
            {setting}
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 28, color: MUTED, fontFamily: "sans-serif" }}>
          V60 and AeroPress recipes from their authors, the setting for your
          grinder, and a timer that talks you through the pour.
        </div>
      )}
    </div>,
    { width: W, height: H },
  );
}
