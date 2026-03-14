import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud } from "lucide-react";
import type { DocumentType } from "@/lib/types";
import { useSupabase } from "@/hooks/useSupabase";
import AppShell from "@/components/layout/AppShell";
import FrostPanel from "@/components/ui/FrostPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import AlertBox from "@/components/ui/AlertBox";

const DOC_TYPE_OPTIONS: { value: DocumentType; label: string }[] = [
  { value: "lrc_base", label: "LRC Base" },
  { value: "qsi", label: "QSI Assessment" },
  { value: "support_plan", label: "Support Plan" },
  { value: "other", label: "Other" },
];

type UploadStep = "form" | "uploading" | "success" | "error";

export default function Upload() {
  const { supabase } = useSupabase();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [referralId, setReferralId] = useState("");
  const [docType, setDocType] = useState<DocumentType>("lrc_base");
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<UploadStep>("form");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0] ?? null;
    setFile(picked);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !referralId.trim()) return;

    setStep("uploading");
    setErrorMsg(null);

    try {
      // 1. Upload to Supabase Storage
      setStatusMsg("Uploading file…");
      const storagePath = `referrals/${referralId.trim()}/${file.name}`;
      const { error: storageErr } = await supabase.storage
        .from("documents")
        .upload(storagePath, file, { upsert: true });

      if (storageErr) throw new Error(`Storage: ${storageErr.message}`);

      // 2. Insert document record
      setStatusMsg("Creating document record…");
      const { data: docRow, error: dbErr } = await supabase
        .from("documents")
        .insert({
          referral_id: referralId.trim(),
          name: file.name,
          type: docType,
          status: "pending",
          storage_path: storagePath,
        })
        .select("id")
        .single();

      if (dbErr) throw new Error(`Database: ${dbErr.message}`);

      // 3. Trigger parse-referral Netlify function
      setStatusMsg("Queuing AI extraction…");
      const resp = await fetch("/.netlify/functions/parse-referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_id: docRow.id,
          referral_id: referralId.trim(),
          doc_type: docType,
          storage_path: storagePath,
        }),
      });

      if (!resp.ok) {
        const body = await resp.text();
        throw new Error(`Parse trigger failed (${resp.status}): ${body}`);
      }

      setStep("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
      setStep("error");
    }
  }

  return (
    <AppShell>
      <div className="space-y-4 max-w-lg mx-auto">
        <h1 className="text-[22px] font-bold text-[#2d1e6b]">Upload Document</h1>

        {step === "success" && (
          <AlertBox variant="success" title="Upload Complete">
            Document uploaded and queued for AI extraction. Processing may take 1–2 minutes.
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => navigate(`/referral/${referralId.trim()}`)}
                className="text-[12px] font-semibold text-white bg-[#4f35e0] px-3 py-1.5 rounded-full"
              >
                View Referral
              </button>
              <button
                onClick={() => {
                  setStep("form");
                  setFile(null);
                  setReferralId("");
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-[12px] font-semibold text-[#4f35e0] px-3 py-1.5 rounded-full border border-[#4f35e0]/30"
              >
                Upload Another
              </button>
            </div>
          </AlertBox>
        )}

        {step === "error" && (
          <AlertBox variant="error" title="Upload Failed">
            {errorMsg}
            <button
              onClick={() => setStep("form")}
              className="mt-2 block text-[12px] font-semibold text-[#4f35e0]"
            >
              Try again
            </button>
          </AlertBox>
        )}

        {(step === "form" || step === "uploading") && (
          <FrostPanel>
            <SectionHeader title="Referral Information" />
            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              {/* Referral ID */}
              <div>
                <label
                  htmlFor="referral-id"
                  className="block text-[12px] font-medium text-[#2d1e6b] mb-1"
                >
                  Referral ID (iConnect Number)
                </label>
                <input
                  id="referral-id"
                  type="text"
                  value={referralId}
                  onChange={(e) => setReferralId(e.target.value)}
                  placeholder="e.g. 71176"
                  required
                  disabled={step === "uploading"}
                  className="w-full text-[13px] px-3 py-3 sm:py-2 rounded-lg border border-black/10 bg-white/60 text-[#2d1e6b] placeholder-[#9990b8] focus:outline-none focus:ring-2 focus:ring-[#4f35e0]/40 disabled:opacity-50"
                />
              </div>

              {/* Document type */}
              <div>
                <label
                  htmlFor="doc-type"
                  className="block text-[12px] font-medium text-[#2d1e6b] mb-1"
                >
                  Document Type
                </label>
                <select
                  id="doc-type"
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as DocumentType)}
                  disabled={step === "uploading"}
                  className="w-full text-[13px] px-3 py-2 rounded-lg border border-black/10 bg-white/60 text-[#2d1e6b] focus:outline-none focus:ring-2 focus:ring-[#4f35e0]/40 disabled:opacity-50"
                >
                  {DOC_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* File picker */}
              <div>
                <label className="block text-[12px] font-medium text-[#2d1e6b] mb-1">
                  PDF File
                </label>
                <label
                  htmlFor="file-input"
                  className={[
                    "flex flex-col items-center justify-center gap-2 w-full h-32 sm:h-28 rounded-xl border-2 border-dashed cursor-pointer transition-colors",
                    file
                      ? "border-[#4f35e0]/50 bg-[#4f35e0]/5"
                      : "border-black/10 bg-white/40 hover:border-[#4f35e0]/30",
                    step === "uploading" ? "pointer-events-none opacity-50" : "",
                  ].join(" ")}
                >
                  <UploadCloud size={22} className="text-[#4f35e0]/70" />
                  {file ? (
                    <span className="text-[12px] font-medium text-[#2d1e6b] px-4 text-center truncate max-w-full">
                      {file.name}
                    </span>
                  ) : (
                    <span className="text-[12px] text-[#5c5470]">
                      Click to select PDF
                    </span>
                  )}
                  <input
                    id="file-input"
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    disabled={step === "uploading"}
                    className="sr-only"
                  />
                </label>
              </div>

              {/* Status message during upload */}
              {step === "uploading" && (
                <p className="text-[12px] text-[#4f35e0] text-center">{statusMsg}</p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={!file || !referralId.trim() || step === "uploading"}
                className="w-full text-[13px] font-semibold text-white bg-[#4f35e0] py-3 sm:py-2.5 rounded-full hover:bg-[#3d28b0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]"
              >
                {step === "uploading" ? "Processing…" : "Upload & Extract"}
              </button>
            </form>
          </FrostPanel>
        )}
      </div>
    </AppShell>
  );
}
