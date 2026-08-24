import React, { useRef, useState } from 'react';
import { X, Download, Printer, ShieldCheck, Leaf, Heart, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function ESGCertificateModal({ isOpen, onClose, donorName, foodItem, user }) {
  const certificateRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const certificateId = `ESG-IN-2026-${Math.floor(100000 + Math.random() * 900000)}`;
  const issueDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const recipient = donorName || foodItem?.donor || user?.orgName || user?.name || 'Grand Banquet & Hospitality';
  const mealsCount = foodItem?.servings || 250;
  const weightKg = foodItem?.weightKg || 125;
  const co2Offset = (weightKg * 2.5).toFixed(1);
  const waterSaved = (weightKg * 500).toLocaleString(); // Estimated litres

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    setIsGenerating(true);

    try {
      const element = certificateRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`ESG-Certificate-${recipient.replace(/\s+/g, '-')}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Could not generate PDF. Please use the Print option.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 relative my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition-all print:hidden"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">Official ESG Sustainability Certificate</h3>
              <p className="text-xs text-slate-500">Tax deduction under Section 80G / CSR Zero Waste Protocol</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>
          </div>
        </div>

        {/* 📜 CERTIFICATE BODY (Capturable by html2canvas) */}
        <div
          ref={certificateRef}
          className="relative bg-gradient-to-b from-white via-emerald-50/20 to-white border-8 border-double border-emerald-800/40 rounded-3xl p-8 sm:p-12 text-center shadow-inner space-y-6 overflow-hidden"
        >
          {/* Subtle Watermark Stamp */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
            <Leaf className="w-96 h-96 text-emerald-900" />
          </div>

          {/* Certificate Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-emerald-100/70 border border-emerald-300 rounded-full text-emerald-800 text-xs font-black tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Zero Hunger • Zero Landfill Certified</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-serif uppercase pt-1">
              Certificate of Sustainability & Impact
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              This official certificate is proudly presented to:
            </p>
          </div>

          {/* Recipient Organization */}
          <div className="py-2">
            <h2 className="text-2xl sm:text-4xl font-black text-emerald-800 tracking-tight underline decoration-emerald-300 decoration-2 underline-offset-8">
              {recipient}
            </h2>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              In recognition of exceptional leadership in surplus food redistribution and community nutrition.
            </p>
          </div>

          {/* Impact Metrics Grid */}
          <div className="grid grid-cols-3 gap-3 bg-white/80 backdrop-blur-xs border border-emerald-200/80 rounded-2xl p-4 sm:p-5 shadow-xs max-w-lg mx-auto text-left">
            <div className="border-r border-slate-100 pr-2">
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold mb-0.5">
                <Heart className="w-3.5 h-3.5" />
                <span>Meals Provided</span>
              </div>
              <p className="text-lg sm:text-xl font-black text-slate-900">{mealsCount}</p>
              <span className="text-[10px] text-slate-400 font-semibold">Nutritious Servings</span>
            </div>

            <div className="border-r border-slate-100 px-2">
              <div className="flex items-center gap-1 text-teal-600 text-xs font-bold mb-0.5">
                <Leaf className="w-3.5 h-3.5" />
                <span>Waste Diverted</span>
              </div>
              <p className="text-lg sm:text-xl font-black text-slate-900">{weightKg} kg</p>
              <span className="text-[10px] text-slate-400 font-semibold">Saved from Landfill</span>
            </div>

            <div className="pl-2">
              <div className="flex items-center gap-1 text-lime-600 text-xs font-bold mb-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>CO₂ Offset</span>
              </div>
              <p className="text-lg sm:text-xl font-black text-slate-900">{co2Offset} kg</p>
              <span className="text-[10px] text-slate-400 font-semibold">Emissions Avoided</span>
            </div>
          </div>

          {/* Certificate Footer / Signature & QR */}
          <div className="pt-6 border-t border-slate-200 flex items-end justify-between text-left text-xs">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase">Certificate ID</p>
              <p className="font-mono font-extrabold text-slate-800">{certificateId}</p>
              <p className="text-[10px] text-slate-400">Date Issued: {issueDate}</p>
            </div>

            {/* Official Stamp */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-emerald-600 text-emerald-700 flex flex-col items-center justify-center font-bold text-[9px] uppercase shadow-xs p-1 text-center rotate-[-6deg]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mb-0.5" />
                <span>VERIFIED ESG</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 font-semibold">Official Seal</span>
            </div>

            <div className="text-right space-y-1">
              <div className="h-7 border-b border-slate-300 font-serif italic text-sm text-slate-700 font-bold">
                FoodRescue Authority
              </div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Authorized Signatory</p>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer Note */}
        <p className="text-center text-[11px] text-slate-400 mt-4 print:hidden">
          Verified under the National Food Loss & Waste Reduction Framework. Eligible for CSR deduction audits.
        </p>
      </div>
    </div>
  );
}

export default ESGCertificateModal;

