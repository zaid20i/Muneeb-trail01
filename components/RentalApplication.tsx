import React, { useState, useEffect, useMemo } from 'react';
import Header from './Header';
import ContractSection from './ContractSection';
import SignaturePad from './SignaturePad';
import Modal from './Modal';
import { LesseeDetails, Acknowledgements, AcknowledgementKey, Driver, Vehicle, RentalApplication as RentalApplicationType } from '../types';
import TermsAndConditions from './TermsAndConditions';

const ACKNOWLEDGEMENT_ITEMS: { key: AcknowledgementKey; label: string }[] = [
    { key: 'noUnauthorizedDrivers', label: 'Only nominated drivers are permitted to drive. This includes a strict one-driver policy for ride-sharing platforms.' },
    { key: 'licenseRequirements', label: 'My driver\'s license has not been suspended or cancelled in the last 3 years and, if Australian, I have held an unrestricted license for at least 12 months.' },
    { key: 'noInfluence', label: 'I will not drive the vehicle while under the influence of alcohol or prohibited substances.' },
    { key: 'noRacing', label: 'I will not use the vehicle for racing, speed trials, or in any reckless, dangerous, or illegal manner.' },
    { key: 'noUnsealedRoads', label: 'I will not drive on unsealed roads, beaches, through streams, or in other off-road conditions without consent.' },
    { key: 'geographicLimits', label: 'I will not drive the vehicle outside of regional Victoria or to other Australian states without written permission.'},
    { key: 'noTowingOrOverloading', label: 'I will not use the vehicle to tow anything or carry loads/passengers beyond its designated capacity.'},
    { key: 'prohibitedCargo', label: 'I will not transport animals (except authorized assistance animals) or any hazardous, flammable, explosive, or corrosive materials.'},
    { key: 'noDrivingWhenUnsafe', label: 'I will not drive the vehicle if it is damaged or appears unsafe to operate.'},
    { key: 'noModifyOrAbandon', label: 'I will not modify, alter, sell, abandon, or otherwise dispose of the vehicle or its parts.' },
];

const FEE_ACKNOWLEDGEMENT_ITEMS: { key: AcknowledgementKey; label: React.ReactNode }[] = [
    { key: 'nonListedDriverExcessAck', label: <>I acknowledge that a separate <span className="font-bold">$2,600 excess</span> applies if a non-listed driver is involved in an incident.</> },
    { key: 'vehicleChangeFeeAck', label: <>I agree to a <span className="font-bold">$80 penalty fee</span> if I request to change the rental vehicle.</> },
    { key: 'fineTransferFeeAck', label: <>I agree to a <span className="font-bold">$15 administrative fee</span> for each traffic fine that requires nomination.</> },
    { key: 'cleaningFeeAck', label: <>I understand a cleaning fee of <span className="font-bold">$80 up to $150</span> may be charged if the vehicle is returned in an unclean condition.</>},
    { key: 'noSmoking', label: <>I acknowledge that smoking is strictly prohibited. A cleaning fee of <span className="font-bold">$200</span> will be charged if this rule is breached.</> },
];


interface RentalApplicationProps {
  driver: Driver;
  availableVehicles: Vehicle[];
  onSubmitApplication: (application: RentalApplicationType) => void;
  onCancel: () => void;
}

const RentalApplication: React.FC<RentalApplicationProps> = ({ driver, availableVehicles, onSubmitApplication, onCancel }) => {
    const [lesseeDetails, setLesseeDetails] = useState<LesseeDetails>({
        fullName: driver.name,
        address: driver.address,
        contactNumber: driver.phone,
        contactEmail: driver.email,
        driversLicense: driver.licenseNumber,
        dateOfBirth: driver.dateOfBirth,
        licenseType: 'australian', // Default to Australian, can be changed
    });
    
    const [acknowledgements, setAcknowledgements] = useState<Acknowledgements>({
        noUnauthorizedDrivers: false,
        noInfluence: false,
        noRacing: false,
        noUnsealedRoads: false,
        noModifyOrAbandon: false,
        licenseRequirements: false,
        geographicLimits: false,
        noTowingOrOverloading: false,
        prohibitedCargo: false,
        noDrivingWhenUnsafe: false,
        noSmoking: false,
        excessAcknowledgement: false,
        nonListedDriverExcessAck: false,
        vehicleChangeFeeAck: false,
        fineTransferFeeAck: false,
        cleaningFeeAck: false,
        hasAgreedToAllTerms: false,
    });

    const [signatureData, setSignatureData] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [age, setAge] = useState<number | null>(null);
    const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    
    const agreementDate = useMemo(() => new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' }), []);

    useEffect(() => {
        if (lesseeDetails.dateOfBirth) {
            const birthDate = new Date(lesseeDetails.dateOfBirth);
            if (!isNaN(birthDate.getTime())) {
                const today = new Date();
                let calculatedAge = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    calculatedAge--;
                }
                setAge(calculatedAge);
            } else {
                setAge(null);
            }
        } else {
            setAge(null);
        }
    }, [lesseeDetails.dateOfBirth]);

    const insuranceExcess = useMemo(() => {
        const isUnder25 = age !== null && age < 25;
        const isInternational = lesseeDetails.licenseType === 'international';
        
        if (isUnder25 || isInternational) {
            return 2600;
        }
        
        return 1000; // Base excess for Australian license holders aged 25 and over
    }, [age, lesseeDetails.licenseType]);

    const handleLesseeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setLesseeDetails(prev => ({ ...prev, [id]: value }));
    };
    
    const handleLicenseTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLesseeDetails(prev => ({ ...prev, licenseType: e.target.value as 'australian' | 'international' }));
    };

    const handleAcknowledgementChange = (key: AcknowledgementKey) => {
        setAcknowledgements(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSignatureChange = (dataUrl: string) => {
        setSignatureData(dataUrl);
    };

    const handleClearSignature = () => {
        setSignatureData(null);
    };

    const isFormValid = useMemo(() => {
        const isLesseeDetailsComplete = Object.values(lesseeDetails).every(field => typeof field === 'string' && field.trim() !== '');
        
        const allRequiredAckKeys: AcknowledgementKey[] = [
            ...ACKNOWLEDGEMENT_ITEMS.map(i => i.key),
            ...FEE_ACKNOWLEDGEMENT_ITEMS.map(i => i.key),
            'excessAcknowledgement',
            'hasAgreedToAllTerms',
        ];
        const allAcksChecked = allRequiredAckKeys.every(key => acknowledgements[key]);

        return (
            isLesseeDetailsComplete &&
            signatureData !== null &&
            allAcksChecked &&
            age !== null && age >= 21 && age <= 75 &&
            selectedVehicleId !== '' &&
            startDate !== '' &&
            endDate !== ''
        );
    }, [lesseeDetails, signatureData, acknowledgements, age, selectedVehicleId, startDate, endDate]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isFormValid && selectedVehicleId && startDate && endDate) {
            const selectedVehicle = availableVehicles.find(v => v.id === selectedVehicleId);
            if (!selectedVehicle) {
                alert('Please select a vehicle.');
                return;
            }

            const application: RentalApplicationType = {
                id: `app_${Date.now()}`,
                driverId: driver.id,
                vehicleId: selectedVehicleId,
                status: 'pending',
                applicationDate: new Date().toISOString().split('T')[0],
                startDate,
                endDate,
                weeklyRate: selectedVehicle.weeklyRent,
                totalAmount: selectedVehicle.weeklyRent * 4, // 4 weeks default
                bondAmount: selectedVehicle.bond,
                insuranceAmount: insuranceExcess,
                driverAge: age || 0,
                hasInternationalLicense: lesseeDetails.licenseType === 'international',
                agreesToInsurance: acknowledgements.excessAcknowledgement,
                agreesToSmokingCharges: acknowledgements.noSmoking,
                agreesToCleaningCharges: acknowledgements.cleaningFeeAck,
                contractTerms: 'Standard rental agreement terms apply.',
                lesseeDetails,
                acknowledgements,
                signatureData: signatureData || undefined,
                insuranceExcess,
                agreementDate,
            };

            onSubmitApplication(application);
            setIsSubmitted(true);
        } else {
            alert('Please fill out all fields, select a vehicle and dates, complete all acknowledgements, and sign the agreement. Drivers must be between 21 and 75 years old.');
        }
    };

    const closeModal = () => {
        setIsSubmitted(false);
        setLesseeDetails({
            fullName: '', address: '', contactNumber: '', contactEmail: '',
            driversLicense: '', dateOfBirth: '', licenseType: 'australian',
        });
        setAcknowledgements({
            noUnauthorizedDrivers: false,
            noInfluence: false,
            noRacing: false,
            noUnsealedRoads: false,
            noModifyOrAbandon: false,
            licenseRequirements: false,
            geographicLimits: false,
            noTowingOrOverloading: false,
            prohibitedCargo: false,
            noDrivingWhenUnsafe: false,
            noSmoking: false,
            excessAcknowledgement: false,
            nonListedDriverExcessAck: false,
            vehicleChangeFeeAck: false,
            fineTransferFeeAck: false,
            cleaningFeeAck: false,
            hasAgreedToAllTerms: false,
        });
        setSignatureData(null);
    };
    
    const Checkbox = ({ id, label, checked, onChange }: {id: string, label: React.ReactNode, checked: boolean, onChange: () => void}) => (
        <label htmlFor={id} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
            <input
                type="checkbox"
                id={id}
                checked={checked}
                onChange={onChange}
                required
                className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
        </label>
    );

    const inputClasses = "w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
    const radioClasses = "h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:bg-slate-600 dark:border-slate-500 dark:checked:bg-blue-500";
    const readOnlyInputClasses = `${inputClasses} bg-slate-100 dark:bg-slate-600/50 cursor-not-allowed`;

    return (
        <div className="min-h-screen text-slate-800 dark:text-slate-200 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <main className="max-w-4xl mx-auto">
                <Header />
                <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 sm:p-8 md:p-12 space-y-10">
                    
                    <ContractSection title="Lessor Details">
                        <div className="text-sm grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                            <div><strong>Company:</strong> NORTHERN AUTO HUB RENTALS PTY LTD</div>
                            <div><strong>ACN:</strong> 685 630 979</div>
                            <div><strong>Address:</strong> 101 BROSSARD RD MICKLEHAM VIC 3064</div>
                            <div><strong>Contact:</strong> 0420210227 / northernautohub@gmail.com</div>
                        </div>
                    </ContractSection>

                    <ContractSection title="Lessee Details">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                                <input type="text" id="fullName" value={lesseeDetails.fullName} onChange={handleLesseeChange} className={inputClasses} placeholder="John Doe" required />
                            </div>
                            <div>
                                <label htmlFor="driversLicense" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Driver's License No.</label>
                                <input type="text" id="driversLicense" value={lesseeDetails.driversLicense} onChange={handleLesseeChange} className={inputClasses} placeholder="Enter license number" required />
                            </div>
                             <div className="md:col-span-2">
                                <label htmlFor="address" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label>
                                <input type="text" id="address" value={lesseeDetails.address} onChange={handleLesseeChange} className={inputClasses} placeholder="123 Main St, Anytown" required />
                            </div>
                            <div>
                                <label htmlFor="contactNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contact Number</label>
                                <input type="tel" id="contactNumber" value={lesseeDetails.contactNumber} onChange={handleLesseeChange} className={inputClasses} placeholder="0400 123 456" required />
                            </div>
                             <div>
                                <label htmlFor="contactEmail" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contact E-mail</label>
                                <input type="email" id="contactEmail" value={lesseeDetails.contactEmail} onChange={handleLesseeChange} className={inputClasses} placeholder="you@example.com" required />
                            </div>
                            <div>
                                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
                                <input type="date" id="dateOfBirth" value={lesseeDetails.dateOfBirth} onChange={handleLesseeChange} className={inputClasses} required />
                                {age !== null && (age < 21 || age > 75) && <p className="text-red-500 text-xs mt-1">Drivers must be between 21 and 75 years of age.</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">License Type</label>
                                <div className="flex gap-4 mt-2">
                                    <label className="flex items-center gap-2"><input type="radio" name="licenseType" value="australian" checked={lesseeDetails.licenseType === 'australian'} onChange={handleLicenseTypeChange} className={radioClasses} /> Australian</label>
                                    <label className="flex items-center gap-2"><input type="radio" name="licenseType" value="international" checked={lesseeDetails.licenseType === 'international'} onChange={handleLicenseTypeChange} className={radioClasses} /> International</label>
                                </div>
                            </div>
                        </div>
                    </ContractSection>

                    <ContractSection title="Vehicle Selection & Rental Period">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="vehicleSelect" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Vehicle</label>
                                <select 
                                    id="vehicleSelect"
                                    value={selectedVehicleId}
                                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                                    className={inputClasses}
                                    required
                                >
                                    <option value="">Choose a vehicle...</option>
                                    {availableVehicles.map(vehicle => (
                                        <option key={vehicle.id} value={vehicle.id}>
                                            {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.rego} (${vehicle.weeklyRent}/week)
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                                <input 
                                    type="date" 
                                    id="startDate" 
                                    value={startDate} 
                                    onChange={(e) => setStartDate(e.target.value)} 
                                    className={inputClasses} 
                                    required 
                                />
                            </div>
                            <div>
                                <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                                <input 
                                    type="date" 
                                    id="endDate" 
                                    value={endDate} 
                                    onChange={(e) => setEndDate(e.target.value)} 
                                    className={inputClasses} 
                                    required 
                                />
                            </div>
                        </div>
                    </ContractSection>

                    <ContractSection title="Key Terms & Prohibited Uses">
                         <p className="text-sm mb-4">By checking the boxes below, you confirm you have read, understood, and agree to abide by these critical terms of the lease agreement.</p>
                        <div className="space-y-3">
                            {ACKNOWLEDGEMENT_ITEMS.map(item => (
                                <Checkbox 
                                    key={item.key}
                                    id={item.key}
                                    label={item.label}
                                    checked={acknowledgements[item.key]}
                                    onChange={() => handleAcknowledgementChange(item.key)}
                                />
                            ))}
                        </div>
                    </ContractSection>

                    <ContractSection title="Insurance Excess">
                        <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 p-4 rounded-r-lg">
                            <p className="font-bold text-lg text-blue-800 dark:text-blue-300">Your insurance excess is: ${insuranceExcess.toLocaleString()}</p>
                            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">This is the amount payable by you in the event of an at-fault accident or damage to the vehicle. It is calculated based on your age and license type.</p>
                        </div>
                        <div className="mt-4">
                            <Checkbox
                                id="excessAcknowledgement"
                                label={<>I acknowledge and agree that my insurance excess is <span className="font-bold">${insuranceExcess.toLocaleString()}</span>.</>}
                                checked={acknowledgements.excessAcknowledgement}
                                onChange={() => handleAcknowledgementChange('excessAcknowledgement')}
                             />
                        </div>
                    </ContractSection>

                    <ContractSection title="Fees & Surcharges">
                        <p className="text-sm mb-4">Please acknowledge the following potential fees and surcharges that may apply during your lease.</p>
                        <div className="space-y-3">
                            {FEE_ACKNOWLEDGEMENT_ITEMS.map(item => (
                                <Checkbox 
                                    key={item.key}
                                    id={item.key}
                                    label={item.label}
                                    checked={acknowledgements[item.key]}
                                    onChange={() => handleAcknowledgementChange(item.key)}
                                />
                            ))}
                        </div>
                    </ContractSection>
                    
                     <ContractSection title="Full Lease Agreement Terms & Conditions">
                        <p className="text-sm mb-4">Please scroll through and read the entire vehicle lease agreement below. You must agree to all terms and conditions to proceed.</p>
                        <TermsAndConditions 
                          onAgree={(agreed) => handleAcknowledgementChange('hasAgreedToAllTerms')} 
                          initialAgreed={acknowledgements.hasAgreedToAllTerms}
                        />
                    </ContractSection>
                    
                    <ContractSection title="Agreement & Signature">
                        <p className="text-sm mb-4">By signing below, you confirm that all information provided is accurate and you agree to all terms and conditions outlined in this Vehicle Lease Agreement.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Driver's Signature</label>
                                <SignaturePad onSignatureChange={handleSignatureChange} onClear={handleClearSignature} />
                            </div>
                             <div>
                                <label htmlFor="agreementDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Agreement Date</label>
                                <input 
                                    type="text" 
                                    id="agreementDate" 
                                    value={agreementDate}
                                    readOnly
                                    className={readOnlyInputClasses}
                                />
                            </div>
                        </div>
                    </ContractSection>
                    
                    <div className="flex items-center justify-end pt-6 border-t border-slate-200 dark:border-slate-700">
                        <button
                            type="submit"
                            disabled={!isFormValid}
                            className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:dark:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                        >
                            Agree & Submit Agreement
                        </button>
                    </div>

                </form>
            </main>
            <Modal isOpen={isSubmitted} onClose={closeModal} title="Agreement Submitted">
                <div className="text-center">
                     <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                        <svg className="h-6 w-6 text-green-600 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Thank you, <span className="font-semibold">{lesseeDetails.fullName}</span>. Your lease agreement has been successfully submitted. We will be in touch shortly.
                    </p>
                </div>
            </Modal>
        </div>
    );
};

export default RentalApplication;
