"use client";

import { useState } from "react";
import { BARBER_ANATOMY } from "@/lib/constants";
import { saveHaircutBlueprintAction } from "@/app/actions/booking";
import { Scissors, Check, X, Sparkles, Copy } from "lucide-react";
import { HaircutBlueprint } from "@/lib/types";
import { AnatomyChipGroup } from "./anatomy-chip-group";

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
    setHeadQuirks((prev) =>
      prev.includes(quirkLabel) ? prev.filter((q) => q !== quirkLabel) : [...prev, quirkLabel]
    );
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

        {/* 1-Tap Copy Previous Recipe */}
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
          {/* 1. Sides */}
          <AnatomyChipGroup
            label="1. Teknik Samping & Gradasi (Sides & Back)"
            options={BARBER_ANATOMY.sides}
            selected={sideTechnique}
            onSelect={setSideTechnique}
          />

          {/* 2. Guard */}
          <AnatomyChipGroup
            label="2. Sepatu Mesin Awal (Baseline Guard)"
            options={BARBER_ANATOMY.guards}
            selected={baselineGuard}
            onSelect={setBaselineGuard}
          />

          {/* 3. Top Style */}
          <AnatomyChipGroup
            label="3. Siluet & Model Atas (Top Style)"
            options={BARBER_ANATOMY.topStyles}
            selected={topStyle}
            onSelect={setTopStyle}
          />

          {/* 4. Top Technique */}
          <AnatomyChipGroup
            label="4. Teknik Gunting Atas (Texture)"
            options={BARBER_ANATOMY.topTechniques}
            selected={topTechnique}
            onSelect={setTopTechnique}
          />

          {/* 5. Neckline */}
          <AnatomyChipGroup
            label="5. Garis Leher Belakang (Neckline)"
            options={BARBER_ANATOMY.necklines}
            selected={neckline}
            onSelect={setNeckline}
          />

          {/* 6. Quirks (Multi) */}
          <AnatomyChipGroup
            label="6. Keunikan Kepala (Head Quirks - Multi-Select)"
            options={BARBER_ANATOMY.headQuirks}
            selected={headQuirks}
            multiple
            onSelect={toggleHeadQuirk}
          />

          {/* 7. Product */}
          <AnatomyChipGroup
            label="7. Produk Styling Rekomendasi"
            options={BARBER_ANATOMY.stylingProducts}
            selected={stylingProduct}
            onSelect={setStylingProduct}
          />

          {/* 8. Notes */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
              8. Catatan Mikro Tambahan (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Belah pinggir tipis ke kanan, jangan potong poni terlalu pendek."
              className="w-full bg-[#121316] border border-[#2D3139] rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2D3139]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#20242B] hover:bg-[#2A2F38] text-zinc-300 font-bold text-xs transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-black uppercase text-xs tracking-wider flex items-center gap-1.5 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>{saving ? "Menyimpan Blueprint..." : "Simpan Resep Potong"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
