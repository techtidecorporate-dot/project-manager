import React, { useState, useEffect } from 'react';
import { Download, CheckCircle2, Clock, AlertTriangle, FileText, DollarSign, Wallet, MessageSquare, Send, Upload, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const ClientInvoices = () => {
    const { user: currentUser } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [receiptFile, setReceiptFile] = useState(null);

    // New Invoice Form State for Client
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        documentFile: null,
    });

    useEffect(() => {
        if (currentUser) {
            fetchInvoices();
        }
    }, [currentUser]);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/invoices', {
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setInvoices(data);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching invoices:', error);
            setLoading(false);
        }
    };

    const handleReceiptUpload = async (invoiceId) => {
        if (!receiptFile) {
            alert('Please select a receipt file first');
            return;
        }

        try {
            setUploading(true);
            const formPayload = new FormData();
            formPayload.append('receipt', receiptFile);

            const response = await fetch(`http://localhost:5000/api/invoices/${invoiceId}/receipt`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: formPayload
            });

            if (response.ok) {
                alert('Receipt submitted successfully!');
                fetchInvoices();
                setSelectedInvoice(null);
                setReceiptFile(null);
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message}`);
            }
            setUploading(false);
        } catch (error) {
            console.error('Error uploading receipt:', error);
            setUploading(false);
        }
    };

    const handleNewInvoiceUpload = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.documentFile) {
            alert('Please fill in required fields and select a file');
            return;
        }

        try {
            setUploading(true);
            const formPayload = new FormData();
            formPayload.append('title', formData.title);
            formPayload.append('amount', formData.amount || 0);
            formPayload.append('companyName', currentUser.companyName);
            formPayload.append('document', formData.documentFile);

            const response = await fetch('http://localhost:5000/api/invoices', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: formPayload
            });

            if (response.ok) {
                const newInvoice = await response.json();
                setInvoices([newInvoice, ...invoices]);
                setFormData({ title: '', amount: '', documentFile: null });
                setIsFormOpen(false);
                alert('Invoice uploaded successfully!');
            }
            setUploading(false);
        } catch (error) {
            console.error('Error uploading invoice:', error);
            setUploading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({
                ...formData,
                documentFile: file,
            });
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#453abc]"></div>
        </div>
    );

    return (
        <div className="space-y-8 pb-10 selection:bg-[#453abc]/10 selection:text-[#453abc]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-black text-[#191a23] tracking-tight">Billing & Assets</h2>
                    <p className="text-[#191a23]/60 font-bold text-sm italic uppercase tracking-widest">Financial interaction history</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsFormOpen(!isFormOpen)}
                        className="px-6 py-3 bg-gradient-to-br from-[#453abc] to-[#60c3e3]  text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 transition-all flex items-center gap-3"
                    >
                        <Upload size={18} />
                        <span>{isFormOpen ? 'Cancel Portal' : 'Upload Invoice'}</span>
                    </button>
                    <div className="bg-[#191a23] text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-xl border border-white/10">
                        <Wallet size={18} className="text-[#453abc]" />
                        <span className="text-xs font-black uppercase tracking-widest">Active Account</span>
                    </div>
                </div>
            </div>

            <div className="grid gap-6">
                {invoices.length > 0 ? invoices.map((invoice) => (
                    <div
                        key={invoice._id}
                        className="bg-white rounded-[32px] p-8 shadow-xl border border-gray-100 group hover:border-[#453abc]/20 transition-all duration-300"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center space-x-6">
                                <div className="w-16 h-16 bg-[#f0e4d4] text-[#453abc] rounded-[24px] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500">
                                    <FileText size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-[#191a23] group-hover:text-[#453abc] transition-colors">{invoice.title}</h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                                            Issued: {new Date(invoice.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#191a23]/40">
                                            Ref: {invoice._id.slice(-8).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-10 border-t md:border-t-0 pt-6 md:pt-0">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-[#191a23]/30 uppercase tracking-widest mb-1">Settlement Amount</p>
                                    <p className="text-2xl font-black text-[#191a23]">${invoice.amount?.toLocaleString() || '0.00'}</p>
                                </div>

                                <div className="flex flex-col items-end gap-3">
                                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 shadow-sm
                                        ${invoice.status === 'Paid' ? 'bg-green-100 text-green-700' :
                                            invoice.status === 'Unpaid' ? 'bg-[#453abc]/10 text-[#453abc]' : 'bg-gray-100 text-gray-700'}`}>
                                        {invoice.status === 'Paid' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                        {invoice.status}
                                    </span>

                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setSelectedInvoice(selectedInvoice === invoice._id ? null : invoice._id)}
                                            className="px-4 py-2 bg-[#191a23] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#453abc] transition-all flex items-center gap-2"
                                        >
                                            <MessageSquare size={12} />
                                            <span>{invoice.receiptURL ? 'View Thread' : 'Reply / Upload'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Threaded View Area */}
                        {selectedInvoice === invoice._id && (
                            <div className="mt-8 pt-8 border-t border-dashed border-gray-100 animate-in slide-in-from-top-4 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Admin Part */}
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#191a23]/5 group/admin">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-gray-100 text-[#191a23] rounded-lg flex items-center justify-center">
                                                    <FileText size={14} />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-[#191a23]">Admin Invoice</span>
                                            </div>
                                            <a
                                                href={invoice.documentURL.startsWith('http') ? invoice.documentURL : `http://localhost:5000/${invoice.documentURL}`}
                                                download
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3 py-1.5 bg-gray-50 text-[#191a23] rounded-lg hover:bg-[#453abc] hover:text-white transition-all flex items-center gap-2 group/dl"
                                            >
                                                <Download size={14} className="group-hover/dl:animate-bounce" />
                                                <span className="text-[9px] font-black uppercase">Download</span>
                                            </a>
                                        </div>
                                        <p className="text-xs text-[#191a23]/60 font-bold">This is the original bill provided by the administration.</p>
                                    </div>

                                    {/* Reply Area (Client Part) */}
                                    <div className="bg-[#191a23]/5 p-6 rounded-3xl border-2 border-dashed border-[#191a23]/10">
                                        {invoice.receiptURL ? (
                                            <div className="h-full flex flex-col justify-between">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 bg-[#453abc] text-[#191a23] rounded-lg flex items-center justify-center">
                                                            <CheckCircle2 size={14} />
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#191a23]">Your Response</span>
                                                    </div>
                                                    <a
                                                        href={invoice.receiptURL.startsWith('http') ? invoice.receiptURL : `http://localhost:5000/${invoice.receiptURL}`}
                                                        download
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-1.5 bg-green-500/10 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all flex items-center gap-2 group/dl"
                                                    >
                                                        <Download size={14} className="group-hover/dl:animate-bounce" />
                                                        <span className="text-[9px] font-black uppercase">Download Submission</span>
                                                    </a>
                                                </div>
                                                <p className="text-xs text-[#191a23]/60 font-bold italic mb-4">Document submitted and linked to this invoice.</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Received by Admin</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="space-y-1">
                                                    <h4 className="font-black text-[#191a23] uppercase text-xs tracking-widest">Send Invoice / Receipt</h4>
                                                    <p className="text-[10px] text-[#191a23]/60 font-bold">Upload your signed document or payment proof.</p>
                                                </div>
                                                <div className="flex flex-col gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="file"
                                                            id={`receipt-${invoice._id}`}
                                                            className="hidden"
                                                            onChange={(e) => setReceiptFile(e.target.files[0])}
                                                        />
                                                        <label
                                                            htmlFor={`receipt-${invoice._id}`}
                                                            className="flex-1 px-5 py-3 bg-white border-2 border-[#191a23]/10 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:border-[#453abc] transition-all truncate"
                                                        >
                                                            {receiptFile ? receiptFile.name : 'Choose File...'}
                                                        </label>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleReceiptUpload(invoice._id)}
                                                            disabled={uploading || !receiptFile}
                                                            className="flex-1 px-6 py-3 bg-[#453abc] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#453abc]/20 disabled:opacity-50"
                                                        >
                                                            {uploading ? 'Sending...' : 'Authorize Submission'}
                                                        </button>
                                                        <button
                                                            onClick={() => { setSelectedInvoice(null); setReceiptFile(null); }}
                                                            className="px-4 py-3 bg-gray-200 text-[#191a23] rounded-xl hover:bg-gray-300 transition-all font-black text-[10px] uppercase"
                                                        >
                                                            X
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )) : (
                    <div className="py-20 text-center bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-100">
                        <div className="w-16 h-16 bg-gray-100 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                            <DollarSign size={32} />
                        </div>
                        <h3 className="text-lg font-black text-[#191a23] opacity-30">Financial Clearance Clear</h3>
                        <p className="text-xs text-[#191a23]/40 font-bold uppercase tracking-widest mt-2">No pending or historical invoices found</p>
                    </div>
                )}
            </div>
            {/* Client Invoice Submission Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#191a23]/20 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="relative w-full max-w-md bg-[#191a23] rounded-[32px] p-6 shadow-2xl border border-white/5 overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-[#453abc] rounded-full -mr-24 -mt-24 blur-[80px] opacity-15"></div>

                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-[#453abc] rounded-xl flex items-center justify-center">
                                    <Upload className="text-[#191a23]" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white">Submit Invoice</h3>
                                    <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">Direct Billing Portal</p>
                                </div>
                            </div>
                            <button onClick={() => setIsFormOpen(false)} className="text-white/20 hover:text-white transition-colors">
                                <Upload className="rotate-45" size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleNewInvoiceUpload} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Invoice Purpose</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Service Fees..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-[#453abc] transition-all font-bold"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Requested Amount ($)</label>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-[#453abc] font-bold"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Document Asset</label>
                                <div className="flex gap-2">
                                    <input type="file" id="clientInvoice" className="hidden" onChange={handleFileChange} />
                                    <label
                                        htmlFor="clientInvoice"
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white/40 cursor-pointer hover:border-[#453abc] transition-all font-bold truncate"
                                    >
                                        {formData.documentFile ? formData.documentFile.name : 'Select Invoice File...'}
                                    </label>
                                    <div className="w-12 h-12 bg-[#453abc]/10 rounded-xl flex items-center justify-center text-[#453abc]">
                                        <FileText size={18} />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="flex-1 bg-white/5 text-white/60 py-4 rounded-xl font-black uppercase text-[10px] border border-white/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="flex-[2] bg-[#453abc] text-[#191a23] py-4 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-[#453abc]/20"
                                >
                                    {uploading ? 'Processing...' : 'Submit to Admin'}
                                    <Send size={14} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientInvoices;

