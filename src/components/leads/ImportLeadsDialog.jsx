"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileUp, Download, AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

export function ImportLeadsDialog({ isOpen, onClose, onImport }) {
  const [file, setFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState(null)
  const [previewData, setPreviewData] = useState(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setError(null)

    // Validate file type
    const validTypes = [
      "text/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ]
    if (!validTypes.includes(selectedFile.type)) {
      setError("Please upload a CSV or Excel file")
      return
    }

    // Simulate file parsing and preview
    setIsUploading(true)

    // Simulate progress
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setUploadProgress(progress)

      if (progress >= 100) {
        clearInterval(interval)
        setIsUploading(false)

        // Generate sample preview data
        const sampleData = [
          {
            name: "John Smith",
            email: "john.smith@example.com",
            phone: "+1234-567-8901",
            status: "New",
            source: "Website",
            interest: "Green Valley Homes",
            priority: "Medium",
          },
          {
            name: "Emily Johnson",
            email: "emily.j@example.com",
            phone: "+1345-678-9012",
            status: "New",
            source: "WhatsApp",
            interest: "Urban Heights Tower",
            priority: "High",
          },
          // Add more sample data as needed
        ]

        setPreviewData(sampleData)
      }
    }, 200)

    return () => clearInterval(interval)
  }

  const handleImport = () => {
    if (!previewData) return

    onImport(previewData)

    // Reset state
    setFile(null)
    setPreviewData(null)
    setUploadProgress(0)
  }

  const handleDownloadTemplate = () => {
    // In a real implementation, this would generate and download a CSV template
    alert("This would download a CSV template in a real implementation")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Leads</DialogTitle>
          <DialogDescription>Upload a CSV or Excel file to import multiple leads at once.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="file-upload">Upload File</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
                className="flex items-center gap-1 text-xs"
              >
                <Download className="h-3 w-3" />
                Download Template
              </Button>
            </div>

            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              {!file ? (
                <div className="space-y-2">
                  <div className="flex justify-center">
                    <FileUp className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Drag and drop your file here or click to browse</p>
                    <p className="text-xs text-muted-foreground mt-1">Supports CSV and Excel files</p>
                  </div>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".csv, .xlsx, .xls"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button variant="outline" onClick={() => document.getElementById("file-upload")?.click()}>
                    Select File
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FileUp className="h-5 w-5 text-blue-500" />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFile(null)
                        setPreviewData(null)
                        setUploadProgress(0)
                      }}
                    >
                      Remove
                    </Button>
                  </div>

                  {isUploading && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} />
                      <p className="text-xs text-center text-muted-foreground">Processing file... {uploadProgress}%</p>
                    </div>
                  )}

                  {previewData && (
                    <Alert>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <AlertTitle>File Processed Successfully</AlertTitle>
                      <AlertDescription>Found {previewData.length} leads ready to import.</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>
          </div>

          {previewData && (
            <div className="space-y-2">
              <Label>Preview (First 2 Leads)</Label>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Name</th>
                      <th className="px-4 py-2 text-left font-medium">Email</th>
                      <th className="px-4 py-2 text-left font-medium">Phone</th>
                      <th className="px-4 py-2 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 2).map((lead, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">{lead.name}</td>
                        <td className="px-4 py-2">{lead.email}</td>
                        <td className="px-4 py-2">{lead.phone}</td>
                        <td className="px-4 py-2">{lead.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!previewData || isUploading}>
            Import {previewData ? `${previewData.length} Leads` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
