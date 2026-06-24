import React, { useState, useEffect } from 'react';
import { Upload, FileText, Search, DollarSign, User, ShieldCheck, Send, CheckCircle2, Download, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const AdminInvoices = () => {
    const { user: currentUser } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [expandedId, setExpandedId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        userId: '',
        companyName: '',
        documentFile: null,
        amount: ''
    });

    useEffect(() => {
        if (currentUser) {
            fetchData();
        }
    }, [currentUser]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersRes, invoicesRes] = await Promise.all([
                fetch('http://localhost:5000/api/auth/users', {
                    headers: { 'Authorization': `Bearer ${currentUser.token}` }
                }),
                fetch('http://localhost:5000/api/invoices', {
                    headers: { 'Authorization': `Bearer ${currentUser.token}` }
                })
            ]);

            const usersData = await usersRes.json();
            const invoicesData = await invoicesRes.json();

            setUsers(usersData.filter(u => u.role === 'CLIENT'));
            setInvoices(invoicesData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    const handleUserChange = (userId) => {
        const selectedUser = users.find(u => u._id === userId);
        setFormData({
            ...formData,
            userId,
            companyName: selectedUser ? selectedUser.companyName : ''
        });
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

    const handleSendInvoice = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.userId || !formData.documentFile) {
            alert('Please fill in all required fields and select a file');
            return;
        }

        try {
            setSending(true);
            const formPayload = new FormData();
            formPayload.append('title', formData.title);
            formPayload.append('client', formData.userId);
            formPayload.append('companyName', formData.companyName);
            formPayload.append('amount', formData.amount || 0);
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
                setFormData({ title: '', userId: '', companyName: '', documentFile: null, amount: '' });
                setIsFormOpen(false);
                alert('Invoice sent successfully!');
            }
            setSending(false);
        } catch (error) {
            console.error('Error sending invoice:', error);
            setSending(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#453abc]"></div>
        </div>
    );

    return (
        <div className="relative space-y-8 pb-10 selection:bg-[#453abc]/10 selection:text-[#453abc] min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-4xl font-black text-[#191a23] tracking-tight">Invoice Control</h2>
                    <p className="text-[#191a23]/60 font-bold text-sm italic uppercase tracking-widest">Financial Management Hub</p>
                </div>
                <button
                    onClick={() => setIsFormOpen(!isFormOpen)}
                    className="px-8 py-3 bg-gradient-to-br from-[#453abc] to-[#60c3e3]  text-[#ffffff] rounded-xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all flex items-center gap-3"
                >
                    <Upload size={18} />
                    <span>{isFormOpen ? 'Close Portal' : 'Generate Invoice'}</span>
                </button>
            </div>

            <div className="grid gap-8">
                <div className="space-y-6">
                    <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-[#191a23]/5">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-black text-[#191a23]">Sent Invoices</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#191a23]/20" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search transaction..."
                                    className="pl-10 pr-4 py-2 bg-gray-50 rounded-xl text-xs font-bold outline-none border border-transparent focus:border-[#453abc]/20 transition-all"
                                />
                            </div>
                        </div>

                        <div className="divide-y divide-gray-50">
                            {invoices.length > 0 ? invoices.map((invoice) => (
                                <div key={invoice._id} className="group border-b border-gray-50 last:border-0">
                                    <div
                                        onClick={() => setExpandedId(prev => prev === invoice._id ? null : invoice._id)}
                                        className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between cursor-pointer"
                                    >
                                        <div className="flex items-center space-x-6">
                                            <div className="w-14 h-14 bg-[#191a23] text-white rounded-[20px] flex items-center justify-center shadow-lg group-hover:bg-[#453abc] transition-colors duration-500">
                                                <FileText size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-[#191a23] text-lg">{invoice.title}</h4>
                                                <div className="flex items-center space-x-3 mt-1">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#453abc]">
                                                        {invoice.client?.companyName || invoice.companyName}
                                                    </span>
                                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                    <span className="text-[10px] text-[#191a23]/40 font-bold flex items-center gap-1">
                                                        <User size={10} /> {invoice.client?.name || 'Unknown'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-8">
                                            <div className="text-right">
                                                <span className="block text-sm font-black text-[#191a23]">${invoice.amount?.toLocaleString()}</span>
                                                <div className="flex items-center justify-end gap-2 mt-1">
                                                    <Clock size={10} className="text-[#191a23]/40" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-[#191a23]/40">
                                                        {new Date(invoice.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className={`p-2 rounded-xl transition-all ${expandedId === invoice._id ? 'bg-[#453abc] text-[#191a23]' : 'bg-gray-100 text-[#191a23]/40'}`}>
                                                <DollarSign size={18} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Threaded/Reply View */}
                                    {expandedId === invoice._id && (
                                        <div className="px-8 pb-8 pt-2 bg-gray-50/50 animate-in slide-in-from-top-2 duration-300">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Initiator Part */}
                                                <div className="bg-white p-5 rounded-3xl shadow-sm border border-[#191a23]/5 relative overflow-hidden group/admin">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 bg-[#191a23] text-white rounded-lg flex items-center justify-center">
                                                                <ShieldCheck size={14} />
                                                            </div>
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#191a23]">Original Invoice</span>
                                                        </div>
                                                        <a
                                                            href={invoice.documentURL.startsWith('http') ? invoice.documentURL : `http://localhost:5000/${invoice.documentURL}`}
                                                            download
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="px-3 py-1.5 bg-gray-100 text-[#191a23] rounded-lg hover:bg-[#453abc] hover:text-white transition-all flex items-center gap-2 group/dl"
                                                        >
                                                            <Download size={14} className="group-hover/dl:animate-bounce" />
                                                            <span className="text-[9px] font-black uppercase">Download</span>
                                                        </a>
                                                    </div>
                                                    <p className="text-xs text-[#191a23]/60 font-bold italic">Primary document associated with this transaction.</p>
                                                </div>

                                                {/* Client Response Part */}
                                                {invoice.receiptURL && (
                                                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-[#191a23]/5 relative overflow-hidden group/client">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 bg-[#453abc] text-[#191a23] rounded-lg flex items-center justify-center">
                                                                    <Send size={14} />
                                                                </div>
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-[#191a23]">Signed / Receipt</span>
                                                            </div>
                                                            <a
                                                                href={invoice.receiptURL.startsWith('http') ? invoice.receiptURL : `http://localhost:5000/${invoice.receiptURL}`}
                                                                download
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="px-3 py-1.5 bg-green-500/10 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all flex items-center gap-2 group/dl"
                                                            >
                                                                <Download size={14} className="group-hover/dl:animate-bounce" />
                                                                <span className="text-[9px] font-black uppercase">Download</span>
                                                            </a>
                                                        </div>
                                                        <p className="text-xs text-[#191a23]/60 font-bold">Counterpart document submitted for closure.</p>
                                                    </div>
                                                )}
                                                {!invoice.receiptURL && (
                                                    <div className="bg-white/50 p-5 rounded-3xl border border-dashed border-[#191a23]/10 flex items-center justify-center italic text-[#191a23]/40 text-xs font-bold">
                                                        No secondary response detect yet.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )) : (
                                <div className="p-20 text-center text-[#191a23]/20 italic font-black uppercase tracking-widest text-sm">
                                    No transaction records detected.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Contextual Modal: Invoice Upload Portal */}
            {isFormOpen && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    {/* Backdrop Removed as requested */}

                    {/* Modal Content */}
                    <div className="relative w-full max-w-[95vw] md:max-w-md bg-gray-800 rounded-[32px] p-4 md:p-6 shadow-[0_0_80px_rgba(69,58,188,0.15)] animate-in zoom-in slide-in-from-bottom-4 duration-300 border border-white/5 overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-[#453abc] rounded-full -mr-24 -mt-24 blur-[80px] opacity-15"></div>

                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-[#453abc] rounded-xl flex items-center justify-center shadow-lg shadow-[#453abc]/20">
                                    <Upload className="text-[#191a23]" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white">Invoice Upload</h3>
                                    <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">Client Transaction Portal</p>
                                </div>
                            </div>

                        </div>

                        <form onSubmit={handleSendInvoice} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Invoice Title</label>
                                    <input
                                        type="text"
                                        placeholder="Milestone..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-[#453abc] focus:ring-2 focus:ring-[#453abc]/5 transition-all font-bold placeholder:text-white/10"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Amount ($)</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-[#453abc] font-bold placeholder:text-white/10"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Target Client</label>
                                <div className="relative">
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-[#453abc] transition-all font-bold appearance-none cursor-pointer pr-10"
                                        value={formData.userId}
                                        onChange={e => handleUserChange(e.target.value)}
                                    >
                                        <option value="" className="bg-[#191a23]">Select Client...</option>
                                        {users.map(u => (
                                            <option key={u._id} value={u._id} className="bg-[#191a23]">{u.name}</option>
                                        ))}
                                    </select>
                                    <User className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={16} />
                                </div>
                            </div>

                            {formData.companyName && (
                                <div className="px-4 py-3 bg-[#453abc]/10 rounded-xl border border-[#453abc]/20 animate-in fade-in slide-in-from-top-2 duration-300 flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <p className="text-[8px] font-black text-[#453abc] uppercase tracking-[0.3em]">Verified Organization</p>
                                        <p className="text-white font-black text-xs">{formData.companyName}</p>
                                    </div>
                                    <ShieldCheck className="text-[#453abc]" size={18} />
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Document Data</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="file"
                                        id="invoiceFile"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                    <label
                                        htmlFor="invoiceFile"
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white/40 cursor-pointer hover:border-[#453abc] transition-all font-bold truncate"
                                    >
                                        {formData.documentFile ? formData.documentFile.name : 'Choose Invoice File...'}
                                    </label>
                                    <div className="w-12 h-12 bg-[#453abc]/10 rounded-xl flex items-center justify-center text-[#453abc] border border-[#453abc]/20">
                                        <Upload size={18} />
                                    </div>
                                </div>
                                <p className="text-[8px] text-white/20 mt-1 ml-2 italic">PDF, PNG or JPG (Max 5MB)</p>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-white/60 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all border border-white/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="flex-[2] bg-[#453abc] hover:opacity-90 text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center space-x-2 transition-all active:scale-[0.98] shadow-[0_8px_20px_rgba(69,58,188,0.3)] group disabled:opacity-50"
                                >
                                    {sending ? (
                                        <span className="flex items-center gap-2">
<div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                            Sending...
                                        </span>
                                    ) : (
                                        <>
                                            <span>Authorize Invoice</span>
                                            <Send size={14} className="translate-x-0 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-300" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminInvoices;

