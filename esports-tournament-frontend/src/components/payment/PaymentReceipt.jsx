import React from 'react';
import { Download, CreditCard, Shield, Calendar, MapPin, CheckCircle } from 'lucide-react';

const PaymentReceipt = ({ team, tournament, onClose }) => {
    const handlePrint = () => {
        window.print();
    };

    const receiptId = `REC-${(team.razorpayPaymentId || team.id).substring(0, 8).toUpperCase()}`;

    return (
        <div className="bg-dark-950 p-6 md:p-10 rounded-3xl border border-white/10 shadow-2xl max-w-2xl mx-auto overflow-hidden relative" id="receipt-content">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] rotate-12">
                <Shield className="w-64 h-64 text-white" />
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-10 border-b border-white/5 relative z-10">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-neon-blue/10 rounded-xl flex items-center justify-center border border-neon-blue/30">
                            <Shield className="w-6 h-6 text-neon-blue" />
                        </div>
                        <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">Payment Receipt</h2>
                    </div>
                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest leading-relaxed">
                        ID: <span className="text-neon-blue">{receiptId}</span> • {new Date().toLocaleDateString()}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-black text-white mb-1">ESPORTS MANAGER</p>
                    <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Nodes Verification Registry</p>
                </div>
            </div>

            {/* Status Badge */}
            <div className="mb-10 flex justify-center">
                <div className="bg-neon-green/10 border border-neon-green/30 px-6 py-2 rounded-full flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-neon-green" />
                    <span className="text-[10px] font-black text-neon-green uppercase tracking-[0.2em]">Transaction Confirmed</span>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-6">
                    <div>
                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2">Transmitted From</p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden">
                                {team.logo ? <img src={team.logo} className="w-full h-full object-cover" /> : <Shield className="w-5 h-5 text-gray-500" />}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white uppercase">{team.name}</p>
                                <p className="text-[10px] text-gray-500 font-mono">{team.contactEmail}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2">Tournament Node</p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-neon-pink/10 rounded-xl border border-neon-pink/30 flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-neon-pink" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white uppercase">{tournament.name}</p>
                                <p className="text-[10px] text-gray-500 font-mono italic capitalize">{tournament.game?.replace('_', ' ')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex flex-col justify-center text-center">
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mb-4">Total Amount Secured</p>
                    <div className="relative inline-block">
                        <div className="absolute -inset-4 bg-neon-blue/10 blur-xl rounded-full"></div>
                        <span className="relative text-3xl md:text-4xl font-black text-white italic tracking-tighter">
                            {tournament.currency || 'INR'} {tournament.entryFee}
                        </span>
                    </div>
                    <p className="text-[9px] font-mono text-neon-blue/60 mt-4 tracking-widest uppercase italic">Transaction Managed via {team.paymentMethod?.toUpperCase() || 'RAZORPAY'}</p>
                </div>
            </div>

            {/* Footer / Meta */}
            <div className="pt-8 border-t border-white/5 space-y-4">
                <div className="flex justify-between text-[8px] font-mono text-gray-600 uppercase tracking-widest">
                    <span>Payment ID: {team.razorpayPaymentId || 'N/A'}</span>
                    <span>Order ID: {team.razorpayOrderId || 'N/A'}</span>
                </div>
                <p className="text-[8px] text-gray-700 font-mono text-justify leading-relaxed">
                    THIS IS A SYSTEM GENERATED ELECTRONIC RECEIPT. ELECTRONIC SIGNATURE IS NOT REQUIRED.
                    THE TRANSACTION IS LOGGED AND ENCRYPTED WITHIN THE BROADCAST REGISTRY.
                    ANY ALTERATION TO THIS DOCUMENT VOIDS ITS AUTHENTICITY.
                </p>
            </div>

            {/* Actions (Hidden on print) */}
            <div className="mt-10 flex gap-4 no-print relative z-10">
                <button
                    onClick={handlePrint}
                    className="flex-1 btn-primary py-3 text-[10px] font-black uppercase flex items-center justify-center gap-2"
                >
                    <Download className="w-4 h-4" /> Save as PDF / Print
                </button>
                <button
                    onClick={onClose}
                    className="px-6 py-3 border border-white/10 text-gray-500 rounded-2xl text-[10px] font-black uppercase hover:text-white hover:border-white/20 transition-all"
                >
                    Close
                </button>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                    #receipt-content { 
                        background: white !important; 
                        border: 1px solid #eee !important;
                        color: black !important;
                        box-shadow: none !important;
                        max-width: 100% !important;
                        width: 100% !important;
                    }
                    .text-white { color: black !important; }
                    .text-gray-500, .text-gray-600 { color: #666 !important; }
                    .bg-dark-950 { background: white !important; }
                    .bg-white/[0.02], .bg-neon-blue/10, .bg-neon-pink/10, .bg-neon-green/10 { background: #f9f9f9 !important; border: 1px solid #eee !important; }
                    .border-white/5, .border-white/10 { border-color: #eee !important; }
                }
            `}} />
        </div>
    );
};

export default PaymentReceipt;
