"use client";

import { useState } from "react";
import { BARBER_ANATOMY } from "@/lib/constants";
import { saveHaircutBlueprintAction } from "@/app/actions/booking";
import { Scissors, Check, X, Sparkles, Copy, AlertCircle } from "lucide-react";
import { HaircutBlueprint } from "@/lib/mock-data";

interface HaircutBlueprintDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  customerId?: string;
  barberId: string;
  barberName: string;
  branchId: string;
  existingRecipe?: HaircutBlueprint | null;
  onSaved?: () => void;
}

export function HaircutBlueprintDialog({
  isOpen,
  onClose,
  customerName,
  customerId,
  barberId,
  barberName,
  branchId,
  existingRecipe,
  onSaved,
}: HaircutBlueprintDialogProps) {
  // Preset or initial state
  const [sideTechnique, setSideTechnique] = useState<string>(
    existingRecipe?.sideTechnique || "Low Fade"
  );
  const [baselineGuard, setBaselineGuard] = useState<string>(
    existingRecipe?.baselineGuard || "#1.5 (4.5mm)"
  );
  const [topStyle, setTopStyle] = useState<string>(
    existingRecipe?.topStyle || "French Crop"
  );
  const [topTechnique, setTopTechnique] = useState<string>(
    existingRecipe?.topTechnique || "Point Cut (Tekstur)"
  );
  const [neckline, setNeckline] = useState<string>(
    existingRecipe?.neckline || "Tapered (Alami)"
  );
  const [headQuirks, setHeadQuirks] = useState<string[]>(
    existingRecipe?.headQuirks || []
  );
  const [stylingProduct, setStylingProduct] = useState<string>(
    existingRecipe?.stylingProduct || "Matte Clay"
  );
  const [notes, setNotes] = useState<string>(existingRecipe?.notes || "");

  const [saving, setSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleHeadQuirk = (quirkLabel: string) => {
    if (headQuirks.includes(quirkLabel)) {
      setHeadQuirks(headQuirks.filter((q) => q !== quirkLabel));
    } else {
      setHeadQuirks([...headQuirks, quirkLabel]);
    }
  };

  const copyLastRecipe = () => {
    if (existingRecipe) {
      setSideTechnique(existingRecipe.sideTechnique);
      setBaselineGuard(existingRecipe.baselineGuard);
      setTopStyle(existingRecipe.topStyle);
      setTopTechnique(existingRecipe.topTechnique);
      setNeckline(existingRecipe.neckline);
      setHeadQuirks(existingRecipe.headQuirks);
      setStylingProduct(existingRecipe.stylingProduct);
      setNotes(existingRecipe.notes || "");
      setStatusMessage("Resep kunjungan sebelumnya berhasil disalin!");
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setStatusMessage(null);

    const res = await saveHaircutBlueprintAction({
      customerName,
      customerId,
      barberId,
      barberName,
      sideTechnique,
      baselineGuard,
      topStyle,
      topTechnique,
      neckline,
      headQuirks,
      stylingProduct,
      notes,
      branchId,
    });

    setSaving(false);

    if (res.success) {
      if (onSaved) onSaved();
      onClose();
    } else {
      setStatusMessage(res.error || "Gagal menyimpan resep.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#181B20] border-2 border-amber-500/50 rounded-3xl w-full max-w-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2D3139]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Scissors className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Resep Potong: {customerName}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500 text-black font-black uppercase">
                  Blueprint
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Dicatat oleh {barberName} &bull; Tap-first zero-typing
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#252A31] hover:bg-[#303640] text-zinc-400 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1-Tap Copy Previous Recipe Button if available */}
        {existingRecipe && (
          <button
            type="button"
            onClick={copyLastRecipe}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Copy className="w-4 h-4" />
            <span>Salin Resep Terakhir ({existingRecipe.topStyle} - {existingRecipe.sideTechnique})</span>
          </button>
        )}

        {statusMessage && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        <div className="space-y-5 text-sm">
          {/* Zona 1: Sides & Back (Teknik Samping) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
              1. Teknik Samping & Gradasi (Sides & Back)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {BARBER_ANATOMY.sides.map((side) => {
                const active = sideTechnique === side.label;
                return (
                  <button
                    key={side.id}
                    type="button"
                    onClick={() => setSideTechnique(side.label)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      active
                        ? "bg-amber-500 text-black border-amber-500 font-bold"
                        : "bg-[#20242B] border-[#2D3139] text-zinc-300 hover:border-zinc-500"
                    }`}
                  >
                    {side.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Zona 2: Baseline Clipper Guard */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
              2. Sepatu Mesin Awal (Baseline Guard)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {BARBER_ANATOMY.guards.map((guard) => {
                const active = baselineGuard === guard.label;
                return (
                  <button
                    key={guard.id}
                    type="button"
                    onClick={() => setBaselineGuard(guard.label)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      active
                        ? "bg-amber-500 text-black border-amber-500 font-bold"
                        : "bg-[#20242B] border-[#2D3139] text-zinc-300 hover:border-zinc-500"
                    }`}
                  >
                    {guard.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Zona 3: Model Bagian Atas (Top Hair Style) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
              3. Siluet & Model Atas (Top Style)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {BARBER_ANATOMY.topStyles.map((style) => {
                const active = topStyle === style.label;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setTopStyle(style.label)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      active
                        ? "bg-amber-500 text-black border-amber-500 font-bold"
                        : "bg-[#20242B] border-[#2D3139] text-zinc-300 hover:border-zinc-500"
                    }`}
                  >
                    {style.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Zona 4: Teknik Gunting & Garis Tengkuk */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Teknik Gunting Atas
              </label>
              <div className="flex flex-wrap gap-1.5">
                {BARBER_ANATOMY.topTechniques.map((tech) => {
                  const active = topTechnique === tech.label;
                  return (
                    <button
                      key={tech.id}
                      type="button"
                      onClick={() => setTopTechnique(tech.label)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                        active
                          ? "bg-amber-500 text-black border-amber-500 font-bold"
                          : "bg-[#20242B] border-[#2D3139] text-zinc-300 hover:border-zinc-500"
                      }`}
                    >
                      {tech.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Bentuk Tengkuk (Neckline)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {BARBER_ANATOMY.necklines.map((neck) => {
                  const active = neckline === neck.label;
                  return (
                    <button
                      key={neck.id}
                      type="button"
                      onClick={() => setNeckline(neck.label)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                        active
                          ? "bg-amber-500 text-black border-amber-500 font-bold"
                          : "bg-[#20242B] border-[#2D3139] text-zinc-300 hover:border-zinc-500"
                      }`}
                    >
                      {neck.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Zona 5: Anomali Kepala (Head Quirks) & Produk */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Anatomi Kepala / Pusaran Khusus (Head Quirks)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {BARBER_ANATOMY.headQuirks.map((quirk) => {
                const active = headQuirks.includes(quirk.label);
                return (
                  <button
                    key={quirk.id}
                    type="button"
                    onClick={() => toggleHeadQuirk(quirk.label)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                      active
                        ? "bg-amber-500/20 text-amber-400 border-amber-500 font-bold"
                        : "bg-[#20242B] border-[#2D3139] text-zinc-400 hover:border-zinc-500"
                    }`}
                  >
                    <span>{quirk.label}</span>
                    {active && <Check className="w-3.5 h-3.5 text-amber-500" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Produk Finishing */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Styling Product
            </label>
            <div className="flex flex-wrap gap-1.5">
              {BARBER_ANATOMY.stylingProducts.map((p) => {
                const active = stylingProduct === p.label;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setStylingProduct(p.label)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      active
                        ? "bg-amber-500 text-black border-amber-500 font-bold"
                        : "bg-[#20242B] border-[#2D3139] text-zinc-300 hover:border-zinc-500"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Catatan Mikro Tambahan */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Catatan Mikro Khusus (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Belahan kiri tegas, jangan sentuh jambang atas"
              className="w-full bg-[#121316] border border-[#2D3139] rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-[#2D3139] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#252A31] hover:bg-[#303640] text-zinc-300 text-xs font-semibold transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20"
          >
            {saving ? "Menyimpan..." : "Simpan Resep Potong"}
          </button>
        </div>
      </div>
    </div>
  );
}
