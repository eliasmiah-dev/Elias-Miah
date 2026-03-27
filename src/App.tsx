import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Smartphone, 
  Calculator, 
  Calendar as CalendarIcon, 
  Printer, 
  Download, 
  Languages, 
  ChevronRight, 
  CreditCard,
  Info,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  MapPin,
  Bell,
  Mail
} from 'lucide-react';
import { format, addMonths } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { cn } from './lib/utils';

// --- Types & Constants ---

type Language = 'en' | 'bn';

interface PlanConfig {
  months: number;
  interestRate: number;
}

const PLANS: PlanConfig[] = [
  { months: 3, interestRate: 20 },
  { months: 4, interestRate: 25 },
  { months: 6, interestRate: 30 },
];

const SERVICE_CHARGE = 300;

// --- Translations ---

const translations = {
  en: {
    title: "Phone Future - EMI System",
    subtitle: "EMI System",
    phonePrice: "Mobile Phone Price (BDT)",
    serviceCharge: "Service Charge",
    totalPrice: "Total Price",
    downPaymentPct: "Down Payment (%)",
    downPaymentAmt: "Down Payment Amount",
    purchaseDate: "Purchase Date",
    calculate: "Calculate Plans",
    plans: "Installment Plans",
    months: "Months",
    interestRate: "Interest Rate",
    interestAmt: "Interest Amount",
    remainingAmt: "Remaining Amount",
    finalPayable: "Final Payable Amount",
    monthlyEMI: "Monthly Installment",
    schedule: "Payment Schedule",
    dueDate: "Due Date",
    amount: "Amount",
    print: "Print Slip",
    download: "Download PDF",
    summary: "Summary",
    noData: "Enter price to see plans",
    installment: "Installment",
    totalPayable: "Total Payable",
    bdt: "BDT",
    shopName: "Phone Future",
    date: "Date",
    firstInstallment: "First installment starts after 1 month",
    customerName: "Customer Name",
    customerPhone: "Customer Phone Number",
    customerNID: "Customer NID (National ID)",
    mobileModel: "Mobile Model Number",
    invoiceNumber: "Invoice Number",
    uploadLogo: "Upload Shop Logo",
    customerDetails: "Customer Details",
    productDetails: "Product Details",
    regenerate: "Regenerate",
    totalAmount: "Total Amount",
    confirmPrint: "Confirm Print",
    printNow: "Print Now",
    cancel: "Cancel",
    previewTitle: "Print Preview",
    previewSubtitle: "Please confirm if you want to print this slip",
    reminderSettings: "Reminder Settings",
    reminderEmail: "Reminder Email",
    reminderPhone: "Reminder Phone",
    enableReminders: "Enable Payment Reminders",
    reminderDescription: "Get notified before each installment due date",
    reminderSuccess: "Reminders scheduled successfully!",
    sendReminder: "Send Reminder",
    reminderSent: "Reminder Sent!",
    installApp: "Install App",
  },
  bn: {
    title: "Phone Future - EMI System",
    subtitle: "ইএমআই সিস্টেম",
    phonePrice: "মোবাইল ফোনের দাম (টাকা)",
    serviceCharge: "সার্ভিস চার্জ",
    totalPrice: "মোট দাম",
    downPaymentPct: "ডাউন পেমেন্ট (%)",
    downPaymentAmt: "ডাউন পেমেন্ট পরিমাণ",
    purchaseDate: "ক্রয়ের তারিখ",
    calculate: "প্ল্যান হিসাব করুন",
    plans: "কিস্তি প্ল্যানসমূহ",
    months: "মাস",
    interestRate: "সুদের হার",
    interestAmt: "সুদের পরিমাণ",
    remainingAmt: "অবশিষ্ট পরিমাণ",
    finalPayable: "সর্বমোট প্রদেয় পরিমাণ",
    monthlyEMI: "মাসিক কিস্তি",
    schedule: "পেমেন্ট শিডিউল",
    dueDate: "পরিশোধের তারিখ",
    amount: "পরিমাণ",
    print: "স্লিপ প্রিন্ট করুন",
    download: "পিডিএফ ডাউনলোড",
    summary: "সারসংক্ষেপ",
    noData: "প্ল্যান দেখতে দাম লিখুন",
    installment: "কিস্তি",
    totalPayable: "মোট প্রদেয়",
    bdt: "টাকা",
    shopName: "Phone Future",
    date: "তারিখ",
    firstInstallment: "প্রথম কিস্তি ১ মাস পর শুরু হবে",
    customerName: "গ্রাহকের নাম",
    customerPhone: "গ্রাহকের ফোন নম্বর",
    customerNID: "গ্রাহকের এনআইডি (জাতীয় পরিচয়পত্র)",
    mobileModel: "মোবাইল মডেল নম্বর",
    invoiceNumber: "ইনভয়েস নম্বর",
    uploadLogo: "শপ লোগো আপলোড",
    customerDetails: "গ্রাহকের তথ্য",
    productDetails: "পণ্যের তথ্য",
    regenerate: "পুনরায় তৈরি করুন",
    totalAmount: "সর্বমোট পরিমাণ",
    confirmPrint: "প্রিন্ট নিশ্চিত করুন",
    printNow: "এখনই প্রিন্ট করুন",
    cancel: "বাতিল করুন",
    previewTitle: "প্রিন্ট প্রিভিউ",
    previewSubtitle: "অনুগ্রহ করে নিশ্চিত করুন আপনি এই স্লিপটি প্রিন্ট করতে চান কি না",
    reminderSettings: "রিমাইন্ডার সেটিংস",
    reminderEmail: "রিমাইন্ডার ইমেইল",
    reminderPhone: "রিমাইন্ডার ফোন",
    enableReminders: "পেমেন্ট রিমাইন্ডার চালু করুন",
    reminderDescription: "প্রতিটি কিস্তির তারিখের আগে বিজ্ঞপ্তি পান",
    reminderSuccess: "রিমাইন্ডার সফলভাবে সেট করা হয়েছে!",
    sendReminder: "রিমাইন্ডার পাঠান",
    reminderSent: "রিমাইন্ডার পাঠানো হয়েছে!",
    installApp: "অ্যাপ ইনস্টল করুন",
  }
};

// --- Components ---

interface PrintSlipProps {
  shopLogo: string | null;
  t: any;
  purchaseDate: string;
  customerName: string;
  customerPhone: string;
  customerNID: string;
  mobileModel: string;
  phonePrice: number;
  serviceCharge: number;
  currentPlanData: any;
  activePlan: number;
}

const SingleSlip = ({ 
  shopLogo, 
  t, 
  purchaseDate, 
  customerName, 
  customerPhone, 
  customerNID, 
  mobileModel, 
  phonePrice, 
  serviceCharge, 
  currentPlanData, 
  activePlan
}: Omit<PrintSlipProps, 'ref'>) => (
  <div className="flex flex-col bg-white min-h-[297mm] p-6">
    <div className="border-8 border-double border-slate-900 p-8 flex-grow flex flex-col relative overflow-hidden">
      {/* Watermarks */}
      {shopLogo && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05] z-0">
          <img src={shopLogo} alt="Watermark" className="w-[400px] h-[400px] object-contain" />
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none opacity-[0.01] z-0">
        <div className="flex flex-col gap-16 -rotate-12">
          {[...Array(10)].map((_, i) => (
            <p key={i} className="text-4xl font-black uppercase tracking-[0.5em] whitespace-nowrap even:translate-x-24">
              Phone Future
            </p>
          ))}
        </div>
      </div>

      <div className="relative z-10 flex flex-col flex-grow">
        {/* Header */}
        <div className="flex justify-between items-start mb-10 pb-6 border-b-2 border-slate-900">
          <div className="flex items-center gap-4">
            {shopLogo ? (
              <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                <img src={shopLogo} alt="Logo" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-20 h-20 bg-[#0052CC] rounded-lg flex items-center justify-center text-white overflow-hidden relative shadow-sm">
                <svg viewBox="0 0 40 40" className="w-16 h-16">
                  <rect width="40" height="40" rx="8" fill="#0052CC" />
                  <path d="M12 8H28C29.1046 8 30 8.89543 30 10V30C30 31.1046 29.1046 32 28 32H12C10.8954 32 10 31.1046 10 30V10C10 8.89543 10.8954 8 12 8Z" stroke="#FF8A00" strokeWidth="2" fill="none" />
                  <path d="M22 28H18" stroke="#FF8A00" strokeWidth="2" strokeLinecap="round" />
                  <path d="M15 15L20 20L32 8" stroke="#00C853" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm" />
                </svg>
              </div>
            )}
            <div>
              <h1 className="text-5xl font-black uppercase tracking-tighter text-slate-900 leading-none mb-1">Phone Future</h1>
              <div className="flex flex-col">
                <p className="text-sm font-black text-slate-800 italic leading-tight">Take your Dream</p>
                <p className="text-xs font-black text-slate-900 inline-block border-b-4 border-yellow-400 pb-0.5 leading-tight w-fit">Buy/Sell/Exchange</p>
                <div className="flex flex-col mt-0.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-700 leading-none">
                    <Phone className="w-3 h-3 text-blue-600" />
                    <span>+8801886-038800, +8801713-831446</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-[10px] font-black text-slate-700 leading-tight mt-0.5">
                    <MapPin className="w-3 h-3 text-red-600 shrink-0 mt-0.5" />
                    <span>Johir & Suraiya Complex, Down of islami Bank ltd. Gobindajang, Gaibandha.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-black text-slate-900 uppercase">{t.date}: <span className="text-slate-900 font-mono">{format(new Date(purchaseDate), 'dd/MM/yyyy')}</span></p>
          </div>
        </div>

        {/* Customer & Product Info */}
        <div className="grid grid-cols-2 gap-12 mb-10">
          <div className="space-y-4">
            <div className="flex justify-center">
              <h3 className="text-xs font-black uppercase border-2 border-slate-900 text-slate-900 px-6 py-1.5 inline-block mb-2">{t.customerDetails}</h3>
            </div>
            <div className="flex gap-4">
              <div className="space-y-1">
                <p className="text-sm font-black text-slate-900 uppercase">{t.customerName}</p>
                <p className="text-lg font-black text-slate-900">{customerName || 'N/A'}</p>
                <p className="text-sm font-black text-slate-900 uppercase mt-2">{t.customerPhone}</p>
                <p className="text-md font-bold text-slate-900">{customerPhone || 'N/A'}</p>
                <p className="text-sm font-black text-slate-900 uppercase mt-2">{t.customerNID}</p>
                <p className="text-md font-bold text-slate-900">{customerNID || 'N/A'}</p>
              </div>
            </div>
            <div className="mt-4 border-b-4 border-double border-slate-900 w-full"></div>

            {/* Summary Box moved here */}
            <div className="mt-6 flex gap-3">
              <div className="bg-blue-50 p-2 rounded-none border border-blue-200 text-center inline-block min-w-[120px]">
                <p className="text-[10px] font-black text-blue-600 uppercase mb-0.5 tracking-widest">{t.monthlyEMI}</p>
                <p className="text-lg font-black text-blue-900 font-mono">{currentPlanData?.monthlyEMI.toLocaleString(undefined, { maximumFractionDigits: 0 })} {t.bdt}</p>
              </div>
              <div className="bg-orange-50 p-2 rounded-none border border-orange-200 text-center inline-block min-w-[120px]">
                <p className="text-[10px] font-black text-orange-600 uppercase mb-0.5 tracking-widest">{t.totalAmount}</p>
                <p className="text-lg font-black text-orange-900 font-mono">{(phonePrice + serviceCharge + (currentPlanData?.interestAmt || 0)).toLocaleString()} {t.bdt}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-center">
              <h3 className="text-xs font-black uppercase border-2 border-slate-900 text-slate-900 px-6 py-1.5 inline-block mb-2">{t.productDetails}</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-[10px] font-black text-slate-900 uppercase">{t.mobileModel}</span>
                <span className="text-sm font-black text-slate-900">{mobileModel || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-[10px] font-black text-slate-900 uppercase">{t.phonePrice}</span>
                <span className="text-sm font-black text-slate-900 font-mono">{phonePrice.toLocaleString()} {t.bdt}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-[10px] font-black text-slate-900 uppercase">{t.serviceCharge}</span>
                <span className="text-sm font-black text-slate-900 font-mono">{serviceCharge.toLocaleString()} {t.bdt}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-[10px] font-black text-slate-900 uppercase">{t.interestAmt} ({currentPlanData?.interestRate}%)</span>
                <span className="text-sm font-black text-slate-900 font-mono">+{currentPlanData?.interestAmt.toLocaleString()} {t.bdt}</span>
              </div>
              <div className="flex justify-between border-b-2 border-slate-900 pb-1 pt-1 bg-slate-50 px-1">
                <span className="text-[10px] font-black text-slate-900 uppercase">Subtotal (Price + S.C + Int.)</span>
                <span className="text-sm font-black text-slate-900 font-mono">{(phonePrice + serviceCharge + (currentPlanData?.interestAmt || 0)).toLocaleString()} {t.bdt}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1 pt-2">
                <span className="text-[10px] font-black text-slate-900 uppercase">{t.downPaymentAmt} ({currentPlanData?.dpPct}%)</span>
                <span className="text-sm font-black text-red-600 font-mono">-{currentPlanData?.dpAmount.toLocaleString()} {t.bdt}</span>
              </div>
              <div className="flex justify-between border-b-2 border-slate-900 pb-1 pt-1 bg-slate-50 px-1">
                <span className="text-[10px] font-black text-slate-900 uppercase">Remaining / Payable Balance</span>
                <span className="text-sm font-black text-slate-900 font-mono">{(phonePrice + serviceCharge + (currentPlanData?.interestAmt || 0) - (currentPlanData?.dpAmount || 0)).toLocaleString()} {t.bdt}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="flex-grow">
          <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            {activePlan} {t.months} {t.installment} {t.schedule}
          </h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-4 border-slate-900 text-xs font-black uppercase">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">{t.dueDate}</th>
                <th className="py-3 px-4 text-right">{t.amount}</th>
              </tr>
            </thead>
            <tbody>
              {currentPlanData?.schedule.map((item: any) => (
                <tr key={item.index} className="border-b border-slate-200">
                  <td className="py-3 px-4 font-mono font-bold text-slate-400">{item.index.toString().padStart(2, '0')}</td>
                  <td className="py-3 px-4 font-black text-slate-800">{format(item.date, 'dd MMMM yyyy')}</td>
                  <td className="py-3 px-4 text-right font-mono font-black text-blue-600">{item.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })} {t.bdt}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-900 text-white">
                <td colSpan={2} className="py-4 px-4 font-black uppercase text-right">{t.totalPayable}</td>
                <td className="py-4 px-4 text-right font-mono font-black text-xl">{currentPlanData?.finalPayable.toLocaleString()} {t.bdt}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-24 pt-16 border-t-2 border-slate-100 flex justify-between items-end">
          <div className="text-center">
            <div className="w-56 border-t-2 border-slate-900 pt-2 font-black uppercase text-[10px]">Customer Signature</div>
          </div>
          <div className="text-center">
            <div className="w-56 border-t-2 border-slate-900 pt-2 font-black uppercase text-[10px]">Authorized Signature</div>
          </div>
        </div>

        {/* Thank You Message */}
        <div className="mt-auto pt-10 text-center">
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
            THANK YOU FOR CHOOSING PHONE FUTURE
          </p>
        </div>
      </div>
    </div>
    {/* System Copyright Footer - Outside Border */}
    <div className="mt-2 text-[8px] font-black text-black tracking-wider">
      ©{new Date().getFullYear()}, Phone Future All rights reserved.<br />
      developed by Elias Miah.
    </div>
  </div>
);

const PrintSlip = React.forwardRef<HTMLDivElement, PrintSlipProps>((props, ref) => (
  <div ref={ref} className="bg-white w-[210mm] text-slate-900 font-sans p-0">
    <SingleSlip {...props} />
  </div>
));

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [serviceCharge, setServiceCharge] = useState<number>(300);
  const [phonePrice, setPhonePrice] = useState<number>(0);
  const [dpPct, setDpPct] = useState<number>(30);
  const [purchaseDate, setPurchaseDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [activePlan, setActivePlan] = useState<number>(3);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  
  // New Fields
  const [shopLogo, setShopLogo] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('shopLogo');
    }
    return null;
  });
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerNID, setCustomerNID] = useState<string>('');
  const [mobileModel, setMobileModel] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState<string>(`INV-${Math.floor(1000 + Math.random() * 9000)}`);
  const [reminderEmail, setReminderEmail] = useState<string>('');
  const [reminderPhone, setReminderPhone] = useState<string>('');
  const [enableReminders, setEnableReminders] = useState<boolean>(false);
  const [reminderStatus, setReminderStatus] = useState<'idle' | 'success'>('idle');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [previewScale, setPreviewScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (window.innerWidth < 640) {
        setPreviewScale((window.innerWidth - 32) / 794);
      } else if (window.innerWidth < 768) {
        setPreviewScale(0.7);
      } else if (window.innerWidth < 1024) {
        setPreviewScale(0.85);
      } else {
        setPreviewScale(1);
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const t = translations[lang];
  const slipRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setter(result);
        if (setter === setShopLogo) {
          localStorage.setItem('shopLogo', result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Calculations
  const calculations = useMemo(() => {
    const total = phonePrice > 0 ? phonePrice + serviceCharge : 0;
    const dpAmount = total * (dpPct / 100);
    const remaining = total - dpAmount;

    return PLANS.map(plan => {
      const interestAmt = remaining * (plan.interestRate / 100);
      const finalPayable = remaining + interestAmt;
      const monthlyEMI = finalPayable / plan.months;

      const schedule = Array.from({ length: plan.months }).map((_, i) => ({
        index: i + 1,
        date: addMonths(new Date(purchaseDate), i + 1),
        amount: monthlyEMI
      }));

      return {
        ...plan,
        interestAmt,
        finalPayable,
        monthlyEMI,
        schedule,
        total,
        dpAmount,
        dpPct,
        remaining
      };
    });
  }, [phonePrice, dpPct, purchaseDate]);

  const currentPlanData = calculations.find(p => p.months === activePlan);

  const handlePrint = () => {
    setShowPrintPreview(true);
  };

  const confirmPrint = () => {
    window.print();
    setShowPrintPreview(false);
  };

  const handleDownloadPDF = async () => {
    if (!slipRef.current) return;
    try {
      const canvas = await html2canvas(slipRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowHeight: slipRef.current.scrollHeight,
        height: slipRef.current.scrollHeight
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pdfWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      
      // If image is taller than page, scale it down to fit on one page
      let finalWidth = imgWidth;
      let finalHeight = imgHeight;
      if (imgHeight > pdfHeight) {
        finalHeight = pdfHeight;
        finalWidth = (imgProps.width * finalHeight) / imgProps.height;
      }
      
      const xOffset = (pdfWidth - finalWidth) / 2;
      
      pdf.addImage(imgData, 'PNG', xOffset, 0, finalWidth, finalHeight);
      
      pdf.save(`EMI_${customerName || 'Customer'}.pdf`);
    } catch (error) {
      console.error('PDF Generation Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 no-print">
      <header className="bg-white border-b border-slate-200 relative">
        <div className="max-w-7xl mx-auto px-4 py-2 sm:h-20 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto overflow-hidden">
            <label className="cursor-pointer group relative block shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#0052CC] rounded-xl flex items-center justify-center text-white overflow-hidden relative shadow-sm group-hover:ring-2 group-hover:ring-blue-400 transition-all">
                {shopLogo ? (
                  <div className="relative w-full h-full group/logo">
                    <img src={shopLogo} alt="Logo" className="w-full h-full object-cover" />
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShopLogo(null);
                        localStorage.removeItem('shopLogo');
                      }}
                      className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-lg opacity-0 group-hover/logo:opacity-100 transition-opacity z-10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 40 40" className="w-10 h-10">
                      <rect width="40" height="40" rx="8" fill="#0052CC" />
                      <path d="M12 8H28C29.1046 8 30 8.89543 30 10V30C30 31.1046 29.1046 32 28 32H12C10.8954 32 10 31.1046 10 30V10C10 8.89543 10.8954 8 12 8Z" stroke="#FF8A00" strokeWidth="2" fill="none" />
                      <path d="M22 28H18" stroke="#FF8A00" strokeWidth="2" strokeLinecap="round" />
                      <path d="M15 15L20 20L32 8" stroke="#00C853" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Download className="w-5 h-5 text-white" />
                </div>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setShopLogo)} />
            </label>
            <div className="min-w-0 flex-grow">
              <h1 className="font-black text-base sm:text-xl leading-tight tracking-tight text-slate-900 truncate">{t.shopName}</h1>
              <div className="flex flex-col">
                <p className="text-[9px] sm:text-[11px] font-black text-slate-800 italic leading-tight">Take your Dream</p>
                <p className="text-[8px] sm:text-[10px] font-black text-slate-900 inline-block border-b-2 border-yellow-400 pb-0.5 leading-tight w-fit">Buy/Sell/Exchange</p>
                <div className="hidden sm:flex flex-col mt-0.5">
                  <div className="flex items-center gap-1 sm:gap-1.5 text-[8px] sm:text-[9px] font-black text-slate-700 leading-none">
                    <Phone className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-blue-600" />
                    <span className="break-words">+8801886-038800, +8801713-831446</span>
                  </div>
                  <div className="flex items-start gap-1 sm:gap-1.5 text-[8px] sm:text-[9px] font-black text-slate-700 leading-tight mt-0.5">
                    <MapPin className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-red-600 shrink-0 mt-0.5" />
                    <span className="break-words">Johir & Suraiya Complex, Down of islami Bank ltd. Gobindajang, Gaibandha.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-2 sm:gap-4 shrink-0">
            {!shopLogo && (
              <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all text-xs font-black uppercase tracking-wider border border-blue-100 shadow-sm">
                <Download className="w-3.5 h-3.5" />
                {t.uploadLogo}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setShopLogo)} />
              </label>
            )}

            <button 
              onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
              className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-all text-xs sm:text-sm font-bold border border-slate-200 shadow-sm"
            >
              <Languages className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {lang === 'en' ? 'বাংলা' : 'English'}
            </button>

            {deferredPrompt && (
              <button 
                onClick={handleInstallClick}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all text-sm font-bold shadow-md shadow-blue-200"
              >
                <Smartphone className="w-4 h-4" />
                {t.installApp}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-4 space-y-6">
          {/* Customer Details Section */}
          <section className="pos-card p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-6">
              <Info className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-slate-800">{t.customerDetails}</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="pos-label">{t.customerName}</label>
                <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="pos-input" />
              </div>
              <div>
                <label className="pos-label">{t.customerPhone}</label>
                <input type="text" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="pos-input" />
              </div>
              <div>
                <label className="pos-label">{t.customerNID}</label>
                <input type="text" value={customerNID} onChange={(e) => setCustomerNID(e.target.value)} className="pos-input" />
              </div>
            </div>
          </section>

          {/* Product Details Section */}
          <section className="pos-card p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-6">
              <Smartphone className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-slate-800">{t.productDetails}</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="pos-label font-bold text-green-600">{t.phonePrice}</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={phonePrice || ''} 
                    onChange={(e) => setPhonePrice(Number(e.target.value))}
                    className="pos-input pl-10 border-green-100 focus:border-green-500 focus:ring-green-500/20"
                    placeholder="0.00"
                  />
                  <CreditCard className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-green-500" />
                </div>
              </div>

              <div>
                <label className="pos-label">{t.mobileModel}</label>
                <input type="text" value={mobileModel} onChange={(e) => setMobileModel(e.target.value)} className="pos-input" placeholder="e.g. iPhone 15 Pro" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="pos-label">{t.downPaymentPct}</label>
                  <input 
                    type="number" 
                    value={dpPct} 
                    onChange={(e) => setDpPct(Number(e.target.value))}
                    className="pos-input"
                  />
                </div>
                <div>
                  <label className="pos-label">{t.serviceCharge}</label>
                  <input 
                    type="number" 
                    value={serviceCharge} 
                    onChange={(e) => setServiceCharge(Number(e.target.value))}
                    className="pos-input"
                  />
                </div>
              </div>

              <div>
                <label className="pos-label">{t.purchaseDate}</label>
                <div className="relative">
                  <input 
                    type="date" 
                    value={purchaseDate} 
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="pos-input pl-10"
                  />
                  <CalendarIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <div className="flex justify-between text-base font-bold text-blue-600">
                  <span>{t.totalAmount}</span>
                  <span className="font-mono">{(phonePrice > 0 ? phonePrice + serviceCharge + (currentPlanData?.interestAmt || 0) : 0).toLocaleString()} {t.bdt}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Reminder Settings Section */}
          <section className="pos-card p-4 sm:p-6 bg-blue-50/50 border-blue-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <h2 className="font-bold text-slate-800 tracking-tight">{t.reminderSettings}</h2>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={enableReminders}
                  onChange={(e) => setEnableReminders(e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <AnimatePresence>
              {enableReminders && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-4"
                >
                  <p className="text-xs text-slate-500 font-medium">{t.reminderDescription}</p>
                  <div>
                    <label className="pos-label">{t.reminderEmail}</label>
                    <div className="relative">
                      <input 
                        type="email" 
                        value={reminderEmail} 
                        onChange={(e) => setReminderEmail(e.target.value)} 
                        className="pos-input pl-10" 
                        placeholder="customer@example.com"
                      />
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                  <div>
                    <label className="pos-label">{t.reminderPhone}</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={reminderPhone} 
                        onChange={(e) => setReminderPhone(e.target.value)} 
                        className="pos-input pl-10" 
                        placeholder="+8801xxxxxxxxx"
                      />
                      <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setReminderStatus('success');
                      setTimeout(() => setReminderStatus('idle'), 3000);
                    }}
                    className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                      reminderStatus === 'success' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                    }`}
                  >
                    {reminderStatus === 'success' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        {t.reminderSuccess}
                      </>
                    ) : (
                      <>
                        <Bell className="w-4 h-4" />
                        {t.enableReminders}
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0" />
            <p className="text-xs text-blue-800 leading-relaxed font-medium">
              {t.firstInstallment}
            </p>
          </div>
        </div>

        {/* Right Column: Plans & Schedule */}
        <div className="lg:col-span-8 space-y-8">
          {phonePrice <= 0 ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 bg-white border-2 border-dashed border-slate-200 rounded-2xl">
              <Calculator className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-medium">{t.noData}</p>
            </div>
          ) : (
            <>
              {/* Plan Selector */}
              <div className="grid grid-cols-3 gap-4">
                {calculations.map((plan) => (
                  <button
                    key={plan.months}
                    onClick={() => setActivePlan(plan.months)}
                    className={cn(
                      "pos-card p-4 text-left transition-all relative",
                      activePlan === plan.months 
                        ? "ring-2 ring-blue-600 border-transparent bg-blue-50/50" 
                        : "hover:border-slate-300"
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-2xl font-black text-slate-800">{plan.months}</span>
                      {activePlan === plan.months && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                    </div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">{t.months} {t.plans}</p>
                    <div className="mt-2 text-sm font-bold text-blue-700">
                      {plan.interestRate}% {t.interestRate}
                    </div>
                  </button>
                ))}
              </div>

              {/* Active Plan Dashboard */}
              <AnimatePresence mode="wait">
                {currentPlanData && (
                  <motion.div
                    key={activePlan}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* Main Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                      <StatCard label={t.downPaymentAmt} value={currentPlanData.dpAmount} subValue={`${dpPct}%`} />
                      <StatCard label={t.remainingAmt} value={currentPlanData.remaining} />
                      <StatCard label={t.interestAmt} value={currentPlanData.interestAmt} subValue={`${currentPlanData.interestRate}%`} />
                      <StatCard label={t.totalAmount} value={phonePrice + serviceCharge + currentPlanData.interestAmt} variant="orange" />
                      <StatCard label={t.monthlyEMI} value={currentPlanData.monthlyEMI} variant="blue" />
                    </div>

                    {/* Schedule Table */}
                    <div className="pos-card">
                      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-blue-600" />
                          {t.schedule}
                        </h3>
                        <div className="text-xs font-bold text-slate-500">
                          {t.totalPayable}: <span className="text-blue-600 font-mono text-sm">{currentPlanData.finalPayable.toLocaleString()} {t.bdt}</span>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                              <th className="px-6 py-3 border-b border-slate-100">#</th>
                              <th className="px-6 py-3 border-b border-slate-100">{t.dueDate}</th>
                              <th className="px-6 py-3 border-b border-slate-100 text-right">{t.amount}</th>
                              <th className="px-6 py-3 border-b border-slate-100 text-center">{t.sendReminder}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentPlanData.schedule.map((item) => (
                              <tr key={item.index} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4 border-b border-slate-100 font-mono text-sm text-slate-400">{item.index.toString().padStart(2, '0')}</td>
                                <td className="px-6 py-4 border-b border-slate-100 font-semibold text-slate-700">{format(item.date, 'dd MMMM yyyy')}</td>
                                <td className="px-6 py-4 border-b border-slate-100 text-right font-mono font-bold text-blue-600">{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className="px-6 py-4 border-b border-slate-100 text-center">
                                  <div className="flex justify-center gap-2">
                                    <button 
                                      onClick={() => {
                                        const message = `Hello ${customerName || 'Customer'}, this is a reminder for your installment #${item.index} of ${item.amount.toLocaleString()} BDT due on ${format(item.date, 'dd MMMM yyyy')}. Thank you! - Phone Future`;
                                        const phone = reminderPhone || customerPhone;
                                        if (phone) {
                                          window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                                        } else if (reminderEmail) {
                                          window.open(`mailto:${reminderEmail}?subject=Payment Reminder&body=${encodeURIComponent(message)}`, '_blank');
                                        } else {
                                          alert('Please provide a phone number or email for reminders.');
                                        }
                                      }}
                                      className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all opacity-0 group-hover:opacity-100"
                                      title="Send via WhatsApp"
                                    >
                                      <Phone className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => {
                                        const message = `Hello ${customerName || 'Customer'}, this is a reminder for your installment #${item.index} of ${item.amount.toLocaleString()} BDT due on ${format(item.date, 'dd MMMM yyyy')}. Thank you! - Phone Future`;
                                        if (reminderEmail) {
                                          window.open(`mailto:${reminderEmail}?subject=Payment Reminder&body=${encodeURIComponent(message)}`, '_blank');
                                        } else {
                                          alert('Please provide an email for reminders.');
                                        }
                                      }}
                                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all opacity-0 group-hover:opacity-100"
                                      title="Send via Email"
                                    >
                                      <Mail className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-4">
                      <button onClick={handlePrint} className="pos-button pos-button-primary flex items-center gap-2">
                        <Printer className="w-4 h-4" />
                        {t.print}
                      </button>
                      <button onClick={handleDownloadPDF} className="pos-button pos-button-secondary flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        {t.download}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </main>

      {/* Print Preview Modal */}
      <AnimatePresence>
        {showPrintPreview && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 no-print"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Printer className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 leading-none">{t.previewTitle}</h2>
                    <p className="text-xs text-slate-500 font-medium mt-1">{t.previewSubtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShowPrintPreview(false)}
                    className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-full font-bold hover:bg-slate-200 transition-all active:scale-95"
                  >
                    {t.cancel}
                  </button>
                  <button 
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 text-white rounded-full font-bold hover:bg-slate-900 transition-all shadow-lg shadow-slate-200 active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    {t.download}
                  </button>
                  <button 
                    onClick={confirmPrint}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
                  >
                    <Printer className="w-4 h-4" />
                    {t.printNow}
                  </button>
                  <button 
                    onClick={() => setShowPrintPreview(false)}
                    className="p-2 hover:bg-slate-200 rounded-full transition-colors ml-2"
                  >
                    <X className="w-6 h-6 text-slate-500" />
                  </button>
                </div>
              </div>
              <div className="flex-grow overflow-auto p-2 sm:p-4 md:p-8 bg-slate-100 flex flex-col items-center">
                <div style={{ width: `${794 * previewScale}px`, minHeight: `${1123 * previewScale}px` }} className="flex justify-center">
                  <div className="shadow-2xl origin-top-left transition-transform" style={{
                    width: '210mm',
                    transform: `scale(${previewScale})`
                  }}>
                    <PrintSlip 
                    shopLogo={shopLogo}
                    t={t}
                    purchaseDate={purchaseDate}
                    customerName={customerName}
                    customerPhone={customerPhone}
                    customerNID={customerNID}
                    mobileModel={mobileModel}
                    phonePrice={phonePrice}
                    serviceCharge={serviceCharge}
                    currentPlanData={currentPlanData}
                    activePlan={activePlan}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

      {/* Hidden Print Slip - Use for PDF and Print */}
      <div className="fixed opacity-0 pointer-events-none -z-50 top-0 left-0 print-visible">
        <div id="print-content">
          <PrintSlip 
            ref={slipRef}
            shopLogo={shopLogo}
            t={t}
            purchaseDate={purchaseDate}
            customerName={customerName}
            customerPhone={customerPhone}
            customerNID={customerNID}
            mobileModel={mobileModel}
            phonePrice={phonePrice}
            serviceCharge={serviceCharge}
            currentPlanData={currentPlanData}
            activePlan={activePlan}
          />
        </div>
      </div>

      {/* Print Styles */}
      {/* Floating Install Button for Mobile */}
      {deferredPrompt && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] sm:hidden">
          <button 
            onClick={handleInstallClick}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white font-bold shadow-2xl shadow-blue-400 active:scale-95 transition-all"
          >
            <Smartphone className="w-5 h-5" />
            {t.installApp}
          </button>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          .print-visible { 
            opacity: 1 !important; 
            pointer-events: auto !important;
            position: static !important;
            z-index: auto !important;
            display: block !important;
          }
          #print-content { 
            display: block !important;
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            background: white;
          }
          body { background: white !important; margin: 0 !important; padding: 0 !important; }
          @page { size: A4; margin: 0; }
        }
      `}} />
    </div>
  );
}

function StatCard({ label, value, subValue, variant = 'default' }: { label: string, value: number, subValue?: string, variant?: 'default' | 'blue' | 'orange' }) {
  const isBlue = variant === 'blue';
  const isOrange = variant === 'orange';

  return (
    <div className={cn(
      "pos-card p-4 transition-all hover:shadow-md",
      isBlue && "bg-blue-600 text-white border-blue-700",
      isOrange && "bg-orange-500 text-white border-orange-600"
    )}>
      <div className="flex justify-between items-start mb-1">
        <p className={cn(
          "text-[10px] font-black uppercase tracking-wider", 
          isBlue ? "text-blue-100" : isOrange ? "text-orange-100" : "text-slate-500"
        )}>
          {label}
        </p>
        {subValue && (
          <span className={cn(
            "text-[10px] font-bold px-1.5 py-0.5 rounded", 
            isBlue ? "bg-blue-500 text-white" : isOrange ? "bg-orange-400 text-white" : "bg-slate-100 text-slate-600"
          )}>
            {subValue}
          </span>
        )}
      </div>
      <p className={cn(
        "text-2xl font-mono font-black truncate", 
        (isBlue || isOrange) ? "text-white" : "text-slate-900"
      )}>
        {value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </p>
    </div>
  );
}
