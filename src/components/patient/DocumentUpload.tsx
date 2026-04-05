"use client";

import { useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { 
  Upload, FileText, X, Check, AlertCircle, 
  Eye, Trash2, File, Image, FileSpreadsheet,
  Loader2, ScanLine
} from "lucide-react";
import { Card, Button, Chip, Spinner } from "@heroui/react";

interface DocumentUploadProps {
  patientId: Id<"patients">;
}

const DOCUMENT_TYPES = [
  { value: "medical_report", label: "Medical Report", icon: FileText },
  { value: "lab_result", label: "Lab Result", icon: FileSpreadsheet },
  { value: "imaging_report", label: "Imaging Report", icon: Image },
  { value: "prescription_scan", label: "Prescription Scan", icon: FileText },
  { value: "insurance", label: "Insurance", icon: File },
  { value: "id_document", label: "ID Document", icon: File },
  { value: "referral", label: "Referral", icon: FileText },
  { value: "other", label: "Other", icon: File },
] as const;

const STATUS_COLORS: Record<string, "warning" | "success" | "primary" | "default"> = {
  pending: "warning",
  processed: "success",
  reviewed: "primary",
};

export function DocumentUpload({ patientId }: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("medical_report");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.patient_documents.generateUploadUrl);
  const uploadDocument = useMutation(api.patient_documents.uploadDocument);
  const extractDocumentData = useMutation(api.patient_documents.extractDocumentData);
  const deleteDocument = useMutation(api.patient_documents.deleteDocument);
  const documents = useQuery(api.patient_documents.listByPatient, { patient_id: patientId });
  const stats = useQuery(api.patient_documents.getDocumentStats, { patient_id: patientId });

  const handleFileSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }
    setSelectedFile(file);
    setError(null);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Generate upload URL
      const uploadUrl = await generateUploadUrl();

      // Upload file to storage
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const storageId = (await response.json()) as Id<"_storage">;

      // Create document record
      const docId = await uploadDocument({
        patient_id: patientId,
        document_type: selectedType as any,
        title: title || selectedFile.name,
        description: description || undefined,
        storage_id: storageId,
        file_name: selectedFile.name,
        file_type: selectedFile.type,
        file_size: selectedFile.size,
      });

      // Extract document data
      await extractDocumentData({ document_id: docId });

      setSuccess("Document uploaded successfully!");
      setSelectedFile(null);
      setTitle("");
      setDescription("");
      setShowUploadModal(false);

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (docId: Id<"patient_documents">) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      await deleteDocument({ document_id: docId });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("image")) return <Image size={20} className="text-blue-500" />;
    if (fileType.includes("pdf")) return <FileText size={20} className="text-red-500" />;
    if (fileType.includes("spreadsheet") || fileType.includes("excel")) return <FileSpreadsheet size={20} className="text-green-500" />;
    return <File size={20} className="text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getDocumentTypeLabel = (type: string) => {
    const docType = DOCUMENT_TYPES.find(t => t.value === type);
    return docType ? docType.label : type;
  };

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-4 bg-blue-50 border border-blue-100">
            <div className="text-2xl font-black text-blue-600">{stats.total}</div>
            <div className="text-xs text-blue-500 font-bold">Total Documents</div>
          </Card>
          <Card className="p-4 bg-amber-50 border border-amber-100">
            <div className="text-2xl font-black text-amber-600">{stats.pending}</div>
            <div className="text-xs text-amber-500 font-bold">Pending</div>
          </Card>
          <Card className="p-4 bg-emerald-50 border border-emerald-100">
            <div className="text-2xl font-black text-emerald-600">{stats.processed}</div>
            <div className="text-xs text-emerald-500 font-bold">Processed</div>
          </Card>
          <Card className="p-4 bg-purple-50 border border-purple-100">
            <div className="text-2xl font-black text-purple-600">{stats.reviewed}</div>
            <div className="text-xs text-purple-500 font-bold">Reviewed</div>
          </Card>
        </div>
      )}

      {/* Upload Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900">My Documents</h3>
        <Button
          className="font-bold bg-blue-600 text-white"
          onPress={() => setShowUploadModal(true)}
        >
          <Upload size={16} />
          Upload Document
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
          <Check size={16} />
          <span className="text-sm font-medium">{success}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-100">
          <AlertCircle size={16} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Documents List */}
      {documents === undefined ? (
        <div className="flex items-center justify-center p-8">
          <Spinner size="lg" />
          <span className="ml-3 text-gray-400">Loading documents...</span>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center p-12 bg-gray-50 rounded-2xl border border-gray-100">
          <FileText size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No documents uploaded yet</p>
          <p className="text-gray-400 text-sm mt-1">Upload your medical documents to share with your doctor</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc: { _id: Id<"patient_documents">; _creationTime: number; patient_id: Id<"patients">; uploaded_by?: Id<"users">; uploaded_at: number; document_type: string; title?: string; description?: string; storage_id: Id<"_storage">; file_name: string; file_type: string; file_size: number; extracted_data?: unknown; status?: string; url?: string | null }) => (
            <Card key={doc._id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-50 rounded-xl">
                  {getFileIcon(doc.file_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-gray-900 truncate">{doc.title || doc.file_name}</h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Chip size="sm" variant="soft" className="text-[10px] font-bold">
                          {getDocumentTypeLabel(doc.document_type)}
                        </Chip>
                        {doc.status && (
                          <Chip size="sm" color={STATUS_COLORS[doc.status] as any} variant="soft" className="text-[10px] font-bold capitalize">
                            {doc.status}
                          </Chip>
                        )}
                        <span className="text-xs text-gray-400">
                          {formatFileSize(doc.file_size)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(doc.uploaded_at).toLocaleDateString()}
                        </span>
                      </div>
                      {doc.description && (
                        <p className="text-sm text-gray-500 mt-1">{doc.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.url && (
                        <Button
                          isIconOnly
                          size="sm"
                          variant="ghost"
                          onPress={() => window.open(doc.url as string, "_blank")}
                        >
                          <Eye size={16} className="text-gray-500" />
                        </Button>
                      )}
                      <Button
                        isIconOnly
                        size="sm"
                        variant="ghost"
                        className="text-rose-600"
                        onPress={() => handleDelete(doc._id as Id<"patient_documents">)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Upload Document</h2>
                <Button isIconOnly size="sm" variant="ghost" onPress={() => setShowUploadModal(false)}>
                  <X size={20} />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Document Type */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Document Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {DOCUMENT_TYPES.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setSelectedType(type.value)}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                          selectedType === type.value
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <type.icon size={16} className={selectedType === type.value ? "text-blue-500" : "text-gray-400"} />
                        <span className="text-sm font-medium">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Document title"
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description (optional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the document"
                    rows={2}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none"
                  />
                </div>

                {/* File Upload Area */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">File</label>
                  <div
                    className={`relative p-8 border-2 border-dashed rounded-xl text-center transition-all ${
                      dragActive
                        ? "border-blue-500 bg-blue-50"
                        : selectedFile
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {selectedFile ? (
                      <div className="flex flex-col items-center">
                        <Check size={32} className="text-emerald-500 mb-2" />
                        <p className="font-bold text-gray-900">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-rose-600 mt-2"
                          onPress={() => setSelectedFile(null)}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload size={32} className="text-gray-400 mb-2" />
                        <p className="font-bold text-gray-700">Drag & drop your file here</p>
                        <p className="text-sm text-gray-400 mt-1">or</p>
                        <Button
                          size="sm"
                          className="mt-2 bg-gray-100 text-gray-700"
                          onPress={() => fileInputRef.current?.click()}
                        >
                          Browse Files
                        </Button>
                        <p className="text-xs text-gray-400 mt-2">Max file size: 10MB</p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleFileSelect(e.target.files[0]);
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  className="w-full font-bold bg-blue-600 text-white"
                  onPress={handleUpload}
                  isDisabled={isUploading || !selectedFile}
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Upload Document
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
