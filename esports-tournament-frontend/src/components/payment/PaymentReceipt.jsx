import React, { useRef } from 'react';
import { Download, CreditCard, Shield, CheckCircle, X, FileText, Hash, CalendarDays, Zap } from 'lucide-react';

const PaymentReceipt = ({ team, tournament, onClose }) => {
    const receiptRef = useRef(null);

    const receiptId = `REC-${(team?.razorpayPaymentId || team?.id || 'MANUAL').substring(0, 12).toUpperCase()}`;
    const isRazorpay = team?.paymentMethod !== 'manual';
    const formattedDate = new Date().toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
    });

    // ─── Generate PDF via jsPDF ───────────────────────────────────────────────
    const handleDownloadPDF = async () => {
        try {
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

            const W = 210; // A4 width
            const margin = 20;
            let y = 20;

            // ── Background header block ──
            doc.setFillColor(13, 13, 20);
            doc.rect(0, 0, W, 50, 'F');

            // ── Title ──
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.text('PAYMENT RECEIPT', W / 2, 22, { align: 'center' });

            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(150, 150, 180);
            doc.text('ESPORTS MANAGER — BROADCAST REGISTRY', W / 2, 30, { align: 'center' });
            doc.text(`ID: ${receiptId}  •  ${formattedDate}`, W / 2, 37, { align: 'center' });

            // ── Status badge ──
            const badgeColor = isRazorpay ? [0, 200, 100] : [100, 150, 255];
            doc.setFillColor(...badgeColor);
            doc.roundedRect(W / 2 - 40, 41, 80, 8, 2, 2, 'F');
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(7);
            doc.setFont('helvetica', 'bold');
            doc.text(
                isRazorpay ? '✓ RAZORPAY GATEWAY VERIFIED' : '✓ MANUALLY VERIFIED',
                W / 2, 47, { align: 'center' }
            );

            y = 65;
            doc.setTextColor(30, 30, 40);

            // ── Helper: draw a section label ──
            const sectionLabel = (text, yPos) => {
                doc.setFillColor(240, 240, 250);
                doc.rect(margin, yPos - 5, W - margin * 2, 9, 'F');
                doc.setFontSize(8);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(80, 60, 150);
                doc.text(text.toUpperCase(), margin + 3, yPos + 1);
                return yPos + 12;
            };

            // ── Helper: draw a key-value row ──
            const kv = (label, value, yPos, highlight = false) => {
                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(100, 100, 120);
                doc.text(label, margin, yPos);
                doc.setFont('helvetica', 'bold');
                if (highlight) doc.setTextColor(80, 60, 150);
                else doc.setTextColor(20, 20, 30);
                doc.text(String(value || 'N/A'), margin + 55, yPos);
                doc.setTextColor(200, 200, 200);
                doc.line(margin, yPos + 2, W - margin, yPos + 2);
                return yPos + 10;
            };

            // ── Team / Payer Info ──
            y = sectionLabel('Payer Details', y);
            y = kv('Team Name', team?.name, y);
            y = kv('Contact Email', team?.contactEmail, y);
            y = kv('Contact Phone', team?.contactPhone, y);

            y += 5;

            // ── Tournament Info ──
            y = sectionLabel('Tournament Details', y);
            y = kv('Tournament', tournament?.name, y);
            y = kv('Game', (tournament?.game || '').replace(/_/g, ' ').toUpperCase(), y);
            y = kv('Format', (tournament?.format || '').replace(/_/g, ' ').toUpperCase(), y);

            y += 5;

            // ── Payment Info ──
            y = sectionLabel('Payment Details', y);
            y = kv('Entry Fee', `${tournament?.currency || 'INR'} ${tournament?.entryFee}`, y, true);
            y = kv('Payment Method', isRazorpay ? 'Razorpay (Gateway)' : 'Manual Payment', y);
            y = kv('Payment ID', team?.razorpayPaymentId, y);
            y = kv('Order ID', team?.razorpayOrderId, y);
            y = kv('Date & Time', formattedDate, y);
            y = kv('Receipt ID', receiptId, y);

            y += 10;

            // ── Amount box ──
            doc.setFillColor(240, 250, 245);
            doc.roundedRect(margin, y, W - margin * 2, 25, 3, 3, 'F');
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 140, 80);
            doc.text('AMOUNT PAID', W / 2, y + 10, { align: 'center' });
            doc.setFontSize(20);
            doc.text(`${tournament?.currency || 'INR'} ${tournament?.entryFee}`, W / 2, y + 21, { align: 'center' });

            y += 35;

            // ── Legal disclaimer ──
            doc.setFontSize(7);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(160, 160, 180);
            const disclaimer = 'This is a system-generated electronic receipt. No physical signature is required. The transaction is cryptographically verified and logged in the Esports Manager broadcast registry. Any alteration to this document voids its authenticity.';
            const lines = doc.splitTextToSize(disclaimer, W - margin * 2);
            doc.text(lines, margin, y);

            y += lines.length * 4 + 8;

            // ── Footer ──
            doc.setFillColor(240, 240, 250);
            doc.rect(0, 280, W, 17, 'F');
            doc.setFontSize(7);
            doc.setTextColor(120, 120, 150);
            doc.text('Esports Manager  •  Powered by Razorpay  •  esports-manager.app', W / 2, 290, { align: 'center' });

            doc.save(`receipt-${receiptId}.pdf`);
        } catch (err) {
            console.error('PDF generation failed:', err);
            // Fallback to print
            window.print();
        }
    };

    return (
        <div className="bg-[#0a0a12] border border-white/10 rounded-3xl overflow-hidden max-w-2xl mx-auto shadow-2xl print:shadow-none print:rounded-none" id="receipt-content">
            {/* Top accent */}
            <div className="h-1 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-green" />

            <div className="p-8 md:p-10 space-y-8">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-neon-blue/10 border border-neon-blue/30 rounded-2xl flex items-center justify-center">
                            <Shield className="w-6 h-6 text-neon-blue" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tight uppercase italic">Payment Receipt</h2>
                            <p className="text-[10px] font-mono text-gray-500 tracking-widest uppercase mt-0.5">
                                Esports Manager · Broadcast Registry
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-all no-print">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Receipt ID + Status */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                        <Hash className="w-3 h-3" />
                        {receiptId}
                        <span className="text-gray-700">·</span>
                        <CalendarDays className="w-3 h-3" />
                        {formattedDate}
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${isRazorpay ? 'bg-neon-green/10 border-neon-green/30 text-neon-green' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
                        <CheckCircle className="w-3.5 h-3.5" />
                        {isRazorpay ? 'Gateway Verified' : 'Manually Verified'}
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/5" />

                {/* Content grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Left: Payer + Tournament */}
                    <div className="space-y-6">
                        <div>
                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mb-3">Payer / Team</p>
                            <div className="space-y-2">
                                {[
                                    { label: 'Team Name', value: team?.name },
                                    { label: 'Contact Email', value: team?.contactEmail },
                                    { label: 'Phone', value: team?.contactPhone || '—' },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex justify-between items-center py-1.5 border-b border-white/[0.04]">
                                        <span className="text-[10px] text-gray-600 font-mono">{label}</span>
                                        <span className="text-[10px] text-white font-bold truncate max-w-[60%] text-right">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mb-3">Tournament</p>
                            <div className="space-y-2">
                                {[
                                    { label: 'Name', value: tournament?.name },
                                    { label: 'Game', value: (tournament?.game || '').replace(/_/g, ' ') },
                                    { label: 'Format', value: (tournament?.format || '').replace(/_/g, ' ') },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex justify-between items-center py-1.5 border-b border-white/[0.04]">
                                        <span className="text-[10px] text-gray-600 font-mono">{label}</span>
                                        <span className="text-[10px] text-white font-bold capitalize">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Amount + IDs */}
                    <div className="space-y-5">
                        {/* Amount box */}
                        <div className="bg-neon-green/5 border border-neon-green/20 rounded-2xl p-6 text-center">
                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mb-3">Amount Paid</p>
                            <div className="text-4xl font-black text-white italic tracking-tighter">
                                {tournament?.currency || 'INR'} {tournament?.entryFee}
                            </div>
                            <p className="text-[9px] font-mono text-neon-green/60 mt-2 uppercase tracking-widest">
                                <Zap className="w-3 h-3 inline mr-1" />
                                {isRazorpay ? 'Via Razorpay Gateway' : 'Manual Transfer'}
                            </p>
                        </div>

                        {/* IDs */}
                        <div>
                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mb-3">Transaction IDs</p>
                            <div className="space-y-2">
                                {[
                                    { label: 'Payment ID', value: team?.razorpayPaymentId },
                                    { label: 'Order ID', value: team?.razorpayOrderId },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex flex-col gap-0.5 py-1.5 border-b border-white/[0.04]">
                                        <span className="text-[9px] text-gray-600 font-mono">{label}</span>
                                        <span className="text-[9px] text-neon-blue/80 font-mono break-all">{value || 'N/A'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/5" />

                {/* Legal */}
                <p className="text-[8px] text-gray-700 font-mono leading-relaxed text-justify">
                    THIS IS A SYSTEM-GENERATED ELECTRONIC RECEIPT. ELECTRONIC SIGNATURE IS NOT REQUIRED.
                    THE TRANSACTION IS CRYPTOGRAPHICALLY VERIFIED VIA RAZORPAY HMAC-SHA256 AND LOGGED IN THE BROADCAST REGISTRY.
                    ANY ALTERATION TO THIS DOCUMENT VOIDS ITS AUTHENTICITY.
                </p>

                {/* Actions */}
                <div className="flex gap-3 no-print">
                    <button
                        onClick={handleDownloadPDF}
                        className="flex-1 flex items-center justify-center gap-2 bg-neon-purple/10 border border-neon-purple/30 text-neon-purple hover:bg-neon-purple/20 hover:border-neon-purple/60 transition-all rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest"
                    >
                        <Download className="w-4 h-4" />
                        Download PDF Receipt
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 border border-white/10 text-gray-500 rounded-2xl text-[10px] font-black uppercase hover:text-white hover:border-white/20 transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    .no-print { display: none !important; }
                    body * { visibility: hidden; }
                    #receipt-content, #receipt-content * { visibility: visible; }
                    #receipt-content { position: fixed; top: 0; left: 0; width: 100%; }
                }
            `}} />
        </div>
    );
};

export default PaymentReceipt;
