import React, { useState } from 'react';
import { X, Upload, FileText, Download, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { bulkUploadProducts } from '../../api/productApi';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

const BulkUploadModal = ({ isOpen, onClose, onRefresh }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB limit');
        return;
      }
      setFile(selectedFile);
      setResults(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const response = await bulkUploadProducts(formData);
      setResults(response);
      if (response.inserted > 0) {
        toast.success(`Successfully uploaded ${response.inserted} products`);
        onRefresh();
      }
      if (response.failed > 0) {
        toast.error(`${response.failed} rows failed validation`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        name: "Sample Product",
        description: "Product description here",
        specifications: "Size: 20mm, Material: PVC",
        price: 450.00,
        stock: 100,
        category_id: 1,
        image_url: "https://example.com/image.jpg",
        is_available: 1
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "product_upload_template.xlsx");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-surface border border-border rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b border-border flex justify-between items-center bg-surface/50">
          <div>
            <h2 className="text-xl font-bold text-text flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" /> Bulk Product Upload
            </h2>
            <p className="text-xs text-text-light mt-1">Upload multiple products using an Excel file.</p>
          </div>
          <button onClick={onClose} className="flex-shrink-0 p-2 hover:bg-primary/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-text-muted hover:text-text" />
          </button>
        </div>

        <div className="flex-1 p-8 overflow-y-auto">
          {!results ? (
            <div className="space-y-8">
              {/* Instructions */}
              <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                <h4 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Before you upload
                </h4>
                <ul className="text-xs text-text-light space-y-2 list-disc list-inside">
                  <li><strong>Required columns:</strong> name, price, stock, category_id (case-insensitive, spaces allowed).</li>
                  <li><strong>Examples:</strong> "Product Name", "PRICE", "Stock Items", "Category ID" all work.</li>
                  <li>Data types must be correct (price and stock must be numbers).</li>
                  <li>Use 1 for available and 0 for unavailable in the is_available column.</li>
                  <li>Maximum file size: 5MB.</li>
                </ul>
                <Button
                  onClick={downloadTemplate}
                  variant="ghost"
                  size="sm"
                  className="mt-4 text-primary font-bold flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download Sample Template
                </Button>
              </div>

              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
                  file ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-surface-hover'
                }`}
              >
                <input
                  type="file"
                  id="excel-upload"
                  className="hidden"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                />
                <label htmlFor="excel-upload" className="cursor-pointer flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                    file ? 'bg-primary/20 text-primary' : 'bg-surface-hover text-text-muted'
                  }`}>
                    <Upload className="w-8 h-8" />
                  </div>
                  {file ? (
                    <>
                      <p className="text-sm font-bold text-text">{file.name}</p>
                      <p className="text-xs text-text-light mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-text">Click to browse or drag and drop</p>
                      <p className="text-xs text-text-light mt-1">Excel files (.xlsx, .xls) only</p>
                    </>
                  )}
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
                <Button
                  onClick={handleUpload}
                  disabled={!file || loading}
                  className="px-8 min-w-[140px]"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
                  ) : (
                    'Start Upload'
                  )}
                </Button>
              </div>
            </div>
          ) : (
            /* Results View */
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-success/5 border border-success/10 rounded-2xl p-6 text-center">
                  <div className="w-12 h-12 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <p className="text-2xl font-black text-text">{results.inserted}</p>
                  <p className="text-xs text-text-light font-bold uppercase tracking-wider">Products Added</p>
                </div>
                <div className="bg-danger/5 border border-danger/10 rounded-2xl p-6 text-center">
                  <div className="w-12 h-12 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <p className="text-2xl font-black text-text">{results.failed}</p>
                  <p className="text-xs text-text-light font-bold uppercase tracking-wider">Failed Rows</p>
                </div>
              </div>

              {results.errors && results.errors.length > 0 && (
                <div className="border border-border rounded-2xl overflow-hidden max-h-[300px] overflow-y-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-surface-hover border-b border-border">
                      <tr>
                        <th className="px-4 py-3 font-bold text-text uppercase text-[10px] tracking-wider">Row</th>
                        <th className="px-4 py-3 font-bold text-text uppercase text-[10px] tracking-wider">Error Message</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {results.errors.map((error, idx) => (
                        <tr key={idx} className="hover:bg-surface-hover">
                          <td className="px-4 py-3 font-medium text-text">{error.row}</td>
                          <td className="px-4 py-3 text-danger font-medium">{error.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex justify-center pt-6">
                <Button onClick={onClose} className="px-12">Close Modal</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;
