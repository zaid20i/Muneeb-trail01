import React, { useState, useRef, useEffect } from 'react';

interface TermsAndConditionsProps {
  onAgree?: (agreed: boolean) => void;
  isRequired?: boolean;
  initialAgreed?: boolean;
}

const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({ 
  onAgree, 
  isRequired = true,
  initialAgreed = false
}) => {
  const [hasAgreed, setHasAgreed] = useState(initialAgreed);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const element = scrollRef.current;
    if (!element) return;

    const isAtBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 10;
    setHasScrolledToBottom(isAtBottom);
  };

  const handleAgreeChange = (checked: boolean) => {
    setHasAgreed(checked);
    onAgree?.(checked);
  };

  useEffect(() => {
    const element = scrollRef.current;
    if (element) {
      element.addEventListener('scroll', handleScroll);
      return () => element.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Terms and Conditions</h3>
        {isRequired && (
          <span className="text-red-500 text-sm font-medium">* Required</span>
        )}
      </div>

      <div 
        ref={scrollRef}
        className="border border-gray-300 rounded-lg p-4 h-64 overflow-y-auto bg-gray-50"
        onScroll={handleScroll}
      >
        <div className="space-y-4 text-sm text-slate-700">
          <h4 className="font-bold text-lg text-slate-800">NORTHERN AUTOHUB RENTALS - VEHICLE LEASE AGREEMENT</h4>
          
          <section>
            <h5 className="font-semibold text-slate-800 mb-2">1. AGREEMENT</h5>
            <p>This Vehicle Lease Agreement ("Agreement") is entered into between Northern Autohub Rentals Pty Ltd ("Lessor") and the driver ("Lessee") for the rental of a motor vehicle.</p>
          </section>

          <section>
            <h5 className="font-semibold text-slate-800 mb-2">2. VEHICLE USE</h5>
            <p>The Lessee agrees to use the vehicle only for personal or business purposes as specified in this agreement. The vehicle shall not be used for any illegal activities, racing, or off-road driving unless specifically authorized.</p>
          </section>

          <section>
            <h5 className="font-semibold text-slate-800 mb-2">3. DRIVER REQUIREMENTS</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li>Must be at least 21 years of age</li>
              <li>Must hold a valid driver's license for the duration of the rental</li>
              <li>International license holders may be subject to additional fees</li>
              <li>Drivers under 25 may be subject to additional insurance fees</li>
            </ul>
          </section>

          <section>
            <h5 className="font-semibold text-slate-800 mb-2">4. PAYMENT TERMS</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li>Weekly payments are due every Monday</li>
              <li>Late payments may result in additional charges</li>
              <li>Bond amount must be paid before vehicle collection</li>
              <li>Bond will be refunded upon satisfactory vehicle return</li>
            </ul>
          </section>

          <section>
            <h5 className="font-semibold text-slate-800 mb-2">5. VEHICLE CARE</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li>Vehicle must be returned in the same condition as received</li>
              <li>Regular maintenance and servicing is the responsibility of the Lessor</li>
              <li>Any damage must be reported immediately</li>
              <li>Smoking in the vehicle will result in a $150 cleaning charge</li>
              <li>Dirty vehicle return will result in an $80 cleaning charge</li>
            </ul>
          </section>

          <section>
            <h5 className="font-semibold text-slate-800 mb-2">6. INSURANCE</h5>
            <p>The vehicle is insured for standard use. Additional insurance fees may apply for international license holders or drivers under 25. The Lessee is responsible for any excess amounts in case of accidents.</p>
          </section>

          <section>
            <h5 className="font-semibold text-slate-800 mb-2">7. TRAFFIC VIOLATIONS</h5>
            <p>The Lessee is responsible for all traffic fines, parking violations, and toll charges incurred during the rental period. These must be paid promptly to avoid additional penalties.</p>
          </section>

          <section>
            <h5 className="font-semibold text-slate-800 mb-2">8. ACCIDENTS AND DAMAGE</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li>All accidents must be reported immediately to the Lessor</li>
              <li>Police must be notified for any accident involving injury or significant damage</li>
              <li>Do not admit fault or make statements to other parties</li>
              <li>Take photos of any damage for documentation</li>
            </ul>
          </section>

          <section>
            <h5 className="font-semibold text-slate-800 mb-2">9. VEHICLE RETURN</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li>Vehicle must be returned on the agreed end date</li>
              <li>Return location will be specified by the Lessor</li>
              <li>Vehicle must be clean and in good condition</li>
              <li>All personal belongings must be removed</li>
            </ul>
          </section>

          <section>
            <h5 className="font-semibold text-slate-800 mb-2">10. TERMINATION</h5>
            <p>This agreement may be terminated by either party with appropriate notice. Early termination may result in additional charges. The Lessor reserves the right to terminate immediately for breach of terms.</p>
          </section>

          <section>
            <h5 className="font-semibold text-slate-800 mb-2">11. LIABILITY</h5>
            <p>The Lessor's liability is limited to the terms of this agreement and applicable law. The Lessee is responsible for any damage or loss beyond normal wear and tear.</p>
          </section>

          <section>
            <h5 className="font-semibold text-slate-800 mb-2">12. GOVERNING LAW</h5>
            <p>This agreement is governed by the laws of Victoria, Australia. Any disputes will be resolved in the courts of Victoria.</p>
          </section>

          <div className="border-t pt-4 mt-6">
            <p className="text-xs text-slate-600">
              <strong>By signing this agreement, you acknowledge that you have read, understood, and agree to all terms and conditions stated above.</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="agreeTerms"
            checked={hasAgreed}
            onChange={(e) => handleAgreeChange(e.target.checked)}
            disabled={!hasScrolledToBottom}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
          />
          <label htmlFor="agreeTerms" className="text-sm text-slate-700">
            I have read and agree to the Terms and Conditions
          </label>
        </div>
        
        {!hasScrolledToBottom && (
          <p className="text-xs text-orange-600 font-medium">
            Please scroll to the bottom to read all terms
          </p>
        )}
      </div>

      {hasScrolledToBottom && !hasAgreed && (
        <p className="text-sm text-red-600">
          You must agree to the terms and conditions to proceed
        </p>
      )}
    </div>
  );
};

export default TermsAndConditions; 