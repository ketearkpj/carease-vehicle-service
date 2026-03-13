import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { ROUTES } from '../Config/Routes';
import { formatCurrency } from '../Utils/format';
import { useApp } from '../Context/AppContext';
import { useBooking } from '../Hooks/useBooking';
import { usePayment } from '../Hooks/usePayment';
import {
  getPlaceAutocomplete,
  getPlaceDetails,
  geocodeAddress,
  loadGoogleMapsScript,
  reverseGeocode
} from '../Services/LocationService';
import { getPaymentMethods } from '../Services/PaymentService';

import Button from '../Components/Common/Button';
import Input from '../Components/Common/Input';
import Select from '../Components/Common/Select';

import '../Styles/ServiceCheckout.css';

const SERVICE_MAP = {
  rentals: 'rental',
  'car-wash': 'car_wash',
  repairs: 'repair',
  sales: 'sales'
};

const BRANCHES = [
  { value: 'roysambu-trm', label: 'Roysambu Branch (Next to TRM)' },
  { value: 'westlands', label: 'Westlands Service Hub' },
  { value: 'mombasa-road', label: 'Mombasa Road Garage' }
];

const DELIVERY_OPTIONS_BY_SERVICE = {
  rental: [
    { value: 'pickup', label: 'Pick up from branch' },
    { value: 'delivery', label: 'Deliver to my address in Nairobi' }
  ],
  car_wash: [
    { value: 'pickup', label: 'Bring vehicle to service center' },
    { value: 'delivery', label: 'Pickup and return to my address' },
    { value: 'mobile', label: 'Mobile detailing at my address' }
  ],
  repair: [
    { value: 'pickup', label: 'Bring vehicle to workshop' },
    { value: 'delivery', label: 'Pickup and return logistics' },
    { value: 'mobile', label: 'Mobile diagnosis visit (where possible)' }
  ],
  sales: [
    { value: 'pickup', label: 'Visit showroom' },
    { value: 'delivery', label: 'Home demo / vehicle delivery' }
  ]
};

const SERVICE_META = {
  rental: {
    title: 'Rental Booking & Delivery Flow',
    subtitle: 'Configure rental exactly for your trip, location, and payment preference.',
    intents: [
      { value: 'book', label: 'Book rental', type: 'booking' },
      { value: 'long_term', label: 'Long-term rental request', type: 'booking' }
    ],
    addOns: [
      { id: 'chauffeur', name: 'Professional Chauffeur', price: 8500 },
      { id: 'gps', name: 'Premium GPS', price: 2000 },
      { id: 'child-seat', name: 'Child Seat', price: 1500 },
      { id: 'insurance-plus', name: 'Insurance Plus Cover', price: 12000 }
    ]
  },
  car_wash: {
    title: 'Car Wash Booking / Package Purchase',
    subtitle: 'Pick package path, exact address, and how you want to pay.',
    intents: [
      { value: 'book', label: 'Book wash appointment', type: 'booking' },
      { value: 'buy', label: 'Buy detailing package', type: 'buy' }
    ],
    addOns: [
      { id: 'steam', name: 'Interior Steam Sanitize', price: 3500 },
      { id: 'engine', name: 'Engine Bay Detail', price: 4500 },
      { id: 'headlight', name: 'Headlight Restoration', price: 6500 },
      { id: 'odor', name: 'Odor Elimination', price: 5200 },
      { id: 'ceramic', name: 'Ceramic Booster Layer', price: 14900 }
    ]
  },
  repair: {
    title: 'Repair Booking / Repair Package Flow',
    subtitle: 'Capture fault details, collection address, urgency, and payment channel.',
    intents: [
      { value: 'book', label: 'Book repair service', type: 'booking' },
      { value: 'buy', label: 'Buy repair package', type: 'buy' }
    ],
    addOns: [
      { id: 'priority', name: 'Priority Queue', price: 6500 },
      { id: 'pickup-return', name: 'Pickup & Return Logistics', price: 8000 },
      { id: 'oem-priority', name: 'OEM Parts Priority', price: 9500 }
    ]
  },
  sales: {
    title: 'Sales Buying & Inquiry Flow',
    subtitle: 'Run purchase, test-drive, or inspection flow with proper payment path.',
    intents: [
      { value: 'purchase', label: 'Buy vehicle', type: 'buy' },
      { value: 'test_drive', label: 'Book test-drive', type: 'booking' },
      { value: 'inspection', label: 'Book inspection', type: 'booking' }
    ],
    addOns: [
      { id: 'trade-in', name: 'Trade-in Valuation', price: 0 },
      { id: 'prepurchase', name: 'Pre-purchase Inspection', price: 12500 },
      { id: 'home-demo', name: 'Home Demo Visit', price: 9000 }
    ]
  }
};

const BASE_PRICES = {
  rental: 18000,
  car_wash: 3500,
  repair: 8500,
  sales: 5000
};

const DELIVERY_FEES = {
  rental: 6500,
  car_wash: 3500,
  repair: 5000,
  sales: 8000
};

const SALES_INTENT_FEES = {
  purchase: 25000,
  test_drive: 5000,
  inspection: 3500
};

const defaultPaymentDetails = {
  mpesaPhone: '',
  paypalEmail: '',
  cardNumber: '',
  cardExpiry: '',
  cardCvv: '',
  cardName: '',
  squareCustomer: ''
};

const ServiceCheckout = ({ serviceKey }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification } = useApp();
  const { createNewBooking } = useBooking();
  const { processNewPayment } = usePayment();

  const bookingPrefill = location.state?.bookingPrefill || {};
  const serviceType = SERVICE_MAP[serviceKey] || bookingPrefill.serviceType || 'rental';
  const meta = SERVICE_META[serviceType] || SERVICE_META.rental;

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState('');
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [mapSearchSuggestions, setMapSearchSuggestions] = useState([]);
  const [mapSearchLoading, setMapSearchLoading] = useState(false);

  const [form, setForm] = useState({
    intent: bookingPrefill.inquiryType || meta.intents[0].value,
    startDate: bookingPrefill.startDate || '',
    endDate: bookingPrefill.endDate || '',
    time: bookingPrefill.time || '09:00 AM',
    branch: bookingPrefill.pickupLocation || 'roysambu-trm',
    deliveryMode: bookingPrefill.deliveryMode || 'pickup',
    county: 'Nairobi',
    exactAddress: '',
    estateArea: '',
    buildingApartment: '',
    landmark: '',
    vehicleSize: 'standard',
    vehiclePlate: '',
    vehicleMake: bookingPrefill.vehicleMake || '',
    vehicleModel: bookingPrefill.vehicleModel || '',
    vehicleYear: bookingPrefill.vehicleYear || '',
    urgent: false,
    issueDescription: bookingPrefill.specialRequests || '',
    budgetRange: '',
    financingNeeded: 'no',
    tradeIn: 'no',
    specialRequests: bookingPrefill.specialRequests || '',
    paymentChannel: 'on_delivery',
    onDeliveryMethod: 'cash_on_delivery',
    paymentMethod: '',
    locationPin: null,
    customerInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      idNumber: ''
    }
  });

  const [paymentDetails, setPaymentDetails] = useState(defaultPaymentDetails);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const addressAutocompleteRef = useRef(null);
  const addressDebounceRef = useRef(null);
  const mapRootRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapSearchDebounceRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const loadMethods = async () => {
      try {
        const methods = await getPaymentMethods();
        if (mounted) {
          const available = (methods || []).filter((method) => method.enabled && method.id !== 'cash');
          setPaymentMethods(available);
        }
      } catch {
        if (mounted) {
          setPaymentMethods([
            { id: 'card', name: 'Credit/Debit Card' },
            { id: 'paypal', name: 'PayPal' },
            { id: 'mpesa', name: 'M-PESA' },
            { id: 'square', name: 'Square' }
          ]);
        }
      }
    };

    loadMethods();
    return () => {
      mounted = false;
    };
  }, []);

  const currentIntentMeta = useMemo(() => {
    return meta.intents.find((intent) => intent.value === form.intent) || meta.intents[0];
  }, [form.intent, meta.intents]);

  const isAddressRequired = form.deliveryMode !== 'pickup';

  const baseAmount = useMemo(() => {
    if (Number(bookingPrefill.listedPrice || 0) > 0) return Number(bookingPrefill.listedPrice);
    if (serviceType === 'sales') {
      return SALES_INTENT_FEES[form.intent] || BASE_PRICES.sales;
    }
    return BASE_PRICES[serviceType] || 0;
  }, [bookingPrefill.listedPrice, serviceType, form.intent]);

  const addOnTotal = useMemo(() => {
    return selectedAddOns.reduce((sum, addon) => sum + Number(addon.price || 0), 0);
  }, [selectedAddOns]);

  const deliveryFee = form.deliveryMode === 'pickup' ? 0 : (DELIVERY_FEES[serviceType] || 0);
  const subtotal = baseAmount + addOnTotal + deliveryFee;
  const tax = subtotal * 0.08;
  const totalAmount = subtotal + tax;

  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const updateCustomer = (key, value) => {
    setForm((prev) => ({
      ...prev,
      customerInfo: {
        ...prev.customerInfo,
        [key]: value
      }
    }));
  };

  const updatePaymentDetails = (key, value) => {
    setPaymentDetails((prev) => ({ ...prev, [key]: value }));
  };

  const toggleAddOn = (addon) => {
    setSelectedAddOns((prev) => {
      if (prev.some((item) => item.id === addon.id)) {
        return prev.filter((item) => item.id !== addon.id);
      }
      return [...prev, addon];
    });
  };

  const validateStep = (targetStep) => {
    if (targetStep === 1) {
      if (!form.startDate) return 'Select start date.';
      if (serviceType === 'rental' && !form.endDate) return 'Select end date for rental.';
      if (serviceType === 'rental' && form.endDate && form.endDate < form.startDate) return 'End date cannot be before start date.';
      if (!form.time) return 'Select preferred time.';
      if (form.deliveryMode === 'pickup' && !form.branch) return 'Select branch location.';
      if (isAddressRequired) {
        if (!form.exactAddress) return 'Enter exact Nairobi house address.';
        if (!form.estateArea) return 'Enter area/estate in Nairobi.';
      }
    }

    if (targetStep === 2) {
      if (!form.customerInfo.firstName || !form.customerInfo.lastName) return 'Enter your full name.';
      if (!form.customerInfo.email) return 'Enter email address.';
      if (!form.customerInfo.phone) return 'Enter phone number.';

      if (serviceType === 'repair') {
        if (!form.vehicleMake || !form.vehicleModel || !form.vehicleYear) return 'Provide full vehicle details for repair.';
        if (!form.issueDescription) return 'Describe the repair issue.';
      }

      if (serviceType === 'car_wash' && !form.vehiclePlate) {
        return 'Provide vehicle registration number.';
      }

      if (serviceType === 'sales' && form.intent === 'purchase' && !form.budgetRange) {
        return 'Select budget range for purchase flow.';
      }
    }

    if (targetStep === 3) {
      if (form.paymentChannel === 'online') {
        if (!form.paymentMethod) return 'Select online payment method.';
        if (form.paymentMethod === 'mpesa' && !paymentDetails.mpesaPhone) return 'Enter M-PESA phone number (2547XXXXXXXX).';
        if (form.paymentMethod === 'paypal' && !paymentDetails.paypalEmail) return 'Enter PayPal email.';
        if (form.paymentMethod === 'card') {
          if (!paymentDetails.cardName || !paymentDetails.cardNumber || !paymentDetails.cardExpiry || !paymentDetails.cardCvv) {
            return 'Complete card payment details.';
          }
        }
      } else if (!form.onDeliveryMethod) {
        return 'Select on-delivery payment mode.';
      }
    }

    return null;
  };

  const goNext = () => {
    const error = validateStep(step);
    if (error) {
      addNotification(error, 'warning');
      return;
    }
    setStep((prev) => Math.min(4, prev + 1));
  };

  const goBack = () => setStep((prev) => Math.max(1, prev - 1));

  const gatewayFromMethod = (method) => {
    if (method === 'card') return 'card';
    if (method === 'paypal') return 'paypal';
    if (method === 'mpesa') return 'mpesa';
    if (method === 'square') return 'square';
    return 'card';
  };

  const submitOrder = async () => {
    const error = validateStep(3);
    if (error) {
      addNotification(error, 'warning');
      return;
    }

    setSaving(true);
    try {
      const fullAddress = isAddressRequired
        ? `${form.exactAddress}, ${form.buildingApartment || ''} ${form.estateArea}, ${form.landmark || ''}, Nairobi`.replace(/\s+,/g, ',').replace(/,+/g, ',').replace(/,\s*,/g, ',').trim()
        : BRANCHES.find((branch) => branch.value === form.branch)?.label || form.branch;
      let resolvedPin = form.locationPin;
      if (isAddressRequired && (!resolvedPin?.lat || !resolvedPin?.lng)) {
        try {
          const geo = await geocodeAddress(fullAddress);
          if (geo?.lat && geo?.lng) {
            resolvedPin = { lat: geo.lat, lng: geo.lng };
          }
        } catch {
          // Continue with exact textual address even if coordinates fail.
        }
      }

      const pickupLocation = isAddressRequired
        ? {
            type: 'address',
            name: form.estateArea || 'Nairobi Address',
            address: {
              street: fullAddress,
              city: 'Nairobi',
              state: 'Nairobi',
              zipCode: '00100'
            },
            coordinates: resolvedPin || undefined
          }
        : {
            type: 'showroom',
            name: BRANCHES.find((branch) => branch.value === form.branch)?.label || form.branch,
            address: {
              street: BRANCHES.find((branch) => branch.value === form.branch)?.label || form.branch,
              city: 'Nairobi',
              state: 'Nairobi',
              zipCode: '00100'
            }
          };

      const payload = {
        serviceType,
        vehicleId: bookingPrefill.vehicleId || null,
        vehicleName: bookingPrefill.vehicleName || null,
        packageId: bookingPrefill.packageId || null,
        packageName: bookingPrefill.packageName || '',
        listedPrice: baseAmount,
        inquiryType: form.intent,
        startDate: form.startDate,
        endDate: serviceType === 'rental' ? form.endDate : form.startDate,
        time: form.time,
        timeSlot: form.time,
        pickupLocation,
        dropoffLocation: pickupLocation,
        deliveryMode: form.deliveryMode,
        extras: selectedAddOns,
        specialRequests: [
          form.specialRequests,
          serviceType === 'repair' ? `Issue: ${form.issueDescription}` : '',
          serviceType === 'sales' ? `Budget: ${form.budgetRange || 'Not provided'}` : '',
          serviceType === 'sales' ? `Financing: ${form.financingNeeded}` : '',
          serviceType === 'sales' ? `Trade-in: ${form.tradeIn}` : ''
        ].filter(Boolean).join(' | '),
        totalAmount: Number(totalAmount.toFixed(2)),
        customerInfo: {
          ...form.customerInfo,
          address: fullAddress,
          city: 'Nairobi',
          state: 'Nairobi',
          notes: form.landmark || '',
          coordinates: resolvedPin || undefined
        },
        paymentMethod: form.paymentChannel === 'online' ? form.paymentMethod : form.onDeliveryMethod,
        paymentId: null,
        paymentMeta: {
          channel: form.paymentChannel,
          method: form.paymentChannel === 'online' ? form.paymentMethod : form.onDeliveryMethod,
          phoneNumber: form.paymentMethod === 'mpesa' ? paymentDetails.mpesaPhone : undefined,
          paypalEmail: form.paymentMethod === 'paypal' ? paymentDetails.paypalEmail : undefined,
          squareCustomer: form.paymentMethod === 'square' ? paymentDetails.squareCustomer : undefined,
          status: form.paymentChannel === 'online' ? 'processing' : 'pending',
          paymentStatus: form.paymentChannel === 'online' ? 'processing' : 'pending'
        }
      };

      const created = await createNewBooking(payload);
      const bookingId = created?.id || created?.booking?.id;

      if (!bookingId) {
        throw new Error('Booking created but ID missing. Please contact support.');
      }

      if (form.paymentChannel === 'online') {
        const gateway = gatewayFromMethod(form.paymentMethod);
        const paymentPayload = {
          bookingId,
          amount: Number(totalAmount.toFixed(2)),
          currency: 'KES',
          customerEmail: form.customerInfo.email,
          customerName: `${form.customerInfo.firstName} ${form.customerInfo.lastName}`.trim(),
          phoneNumber: form.paymentMethod === 'mpesa' ? paymentDetails.mpesaPhone : form.customerInfo.phone,
          paymentMethod: form.paymentMethod,
          paymentMethodId: form.paymentMethod === 'square' ? paymentDetails.squareCustomer : undefined,
          billingDetails: {
            email: form.customerInfo.email,
            phone: form.customerInfo.phone,
            firstName: form.customerInfo.firstName,
            lastName: form.customerInfo.lastName,
            address: {
              line1: fullAddress,
              city: 'Nairobi',
              state: 'Nairobi',
              country: 'Kenya'
            }
          }
        };

        const paymentResult = await processNewPayment(paymentPayload, gateway);
        if (!paymentResult?.success) {
          throw new Error('Online payment not completed. Confirm the prompt and retry.');
        }
      }

      addNotification(
        form.paymentChannel === 'online'
          ? 'Payment completed and service confirmed successfully.'
          : 'Service confirmed. Payment is pending on delivery.',
        'success'
      );
      navigate(`${ROUTES.BOOKING_CONFIRMATION}?id=${bookingId}`);
    } catch (err) {
      addNotification(err?.message || 'Failed to complete service flow.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const paymentChannelOptions = currentIntentMeta?.type === 'buy'
    ? [
        { value: 'online', label: 'Pay Online Now' },
        { value: 'on_delivery', label: 'Pay On Delivery / Service Day' }
      ]
    : [
        { value: 'on_delivery', label: 'Pay On Delivery / Service Day' },
        { value: 'online', label: 'Pay Online Now' }
      ];

  const deliveryOptions = DELIVERY_OPTIONS_BY_SERVICE[serviceType] || DELIVERY_OPTIONS_BY_SERVICE.rental;

  useEffect(() => {
    if (!isAddressRequired) {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      return;
    }

    const query = form.exactAddress?.trim();
    if (!query || query.length < 3) {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      setAddressLoading(false);
      return;
    }

    if (addressDebounceRef.current) {
      clearTimeout(addressDebounceRef.current);
    }

    let active = true;
    setAddressLoading(true);
    addressDebounceRef.current = setTimeout(async () => {
      try {
        const predictions = await getPlaceAutocomplete(query, {
          country: 'ke',
          types: ['address']
        });

        if (!active) return;

        const nairobiOnly = (predictions || [])
          .filter((item) => /nairobi/i.test(item.description || item.secondaryText || ''))
          .slice(0, 8);

        setAddressSuggestions(nairobiOnly);
        setShowAddressSuggestions(nairobiOnly.length > 0);
      } catch {
        if (active) {
          setAddressSuggestions([]);
          setShowAddressSuggestions(false);
        }
      } finally {
        if (active) {
          setAddressLoading(false);
        }
      }
    }, 280);

    return () => {
      active = false;
      if (addressDebounceRef.current) {
        clearTimeout(addressDebounceRef.current);
      }
    };
  }, [form.exactAddress, isAddressRequired]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!addressAutocompleteRef.current?.contains(event.target)) {
        setShowAddressSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const applyAddressSuggestion = (suggestion) => {
    const normalizedMain = suggestion.mainText || suggestion.description?.split(',')[0] || '';
    const secondaryParts = (suggestion.secondaryText || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    const estate = secondaryParts.find((item) => !/nairobi|kenya/i.test(item)) || form.estateArea;

    setForm((prev) => ({
      ...prev,
      exactAddress: normalizedMain || prev.exactAddress,
      estateArea: prev.estateArea || estate
    }));
    setAddressSuggestions([]);
    setShowAddressSuggestions(false);
  };

  useEffect(() => {
    if (!showMapPicker || !isAddressRequired || !mapRootRef.current) return;

    let mounted = true;
    const initializeMap = async () => {
      setMapError('');
      setMapLoading(true);
      try {
        await loadGoogleMapsScript();
        if (!mounted || !window.google?.maps || !mapRootRef.current) return;

        const defaultPin = form.locationPin || { lat: -1.286389, lng: 36.817223 };
        mapRef.current = new window.google.maps.Map(mapRootRef.current, {
          center: defaultPin,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        });

        markerRef.current = new window.google.maps.Marker({
          map: mapRef.current,
          position: defaultPin,
          draggable: true
        });

        mapRef.current.addListener('click', async (event) => {
          if (!markerRef.current) return;
          const nextPin = { lat: event.latLng.lat(), lng: event.latLng.lng() };
          markerRef.current.setPosition(nextPin);
          setForm((prev) => ({ ...prev, locationPin: nextPin }));
          try {
            const reversed = await reverseGeocode(nextPin.lat, nextPin.lng);
            if (reversed?.formattedAddress) {
              setForm((prev) => ({ ...prev, exactAddress: reversed.formattedAddress }));
            }
          } catch {
            // Ignore reverse geocode errors during manual pinning.
          }
        });

        markerRef.current.addListener('dragend', async () => {
          if (!markerRef.current) return;
          const position = markerRef.current.getPosition();
          if (!position) return;
          const nextPin = { lat: position.lat(), lng: position.lng() };
          setForm((prev) => ({ ...prev, locationPin: nextPin }));
          try {
            const reversed = await reverseGeocode(nextPin.lat, nextPin.lng);
            if (reversed?.formattedAddress) {
              setForm((prev) => ({ ...prev, exactAddress: reversed.formattedAddress }));
            }
          } catch {
            // Ignore reverse geocode errors during manual pinning.
          }
        });
      } catch {
        if (mounted) {
          setMapError('Google Maps failed to load. Check API key and network.');
        }
      } finally {
        if (mounted) {
          setMapLoading(false);
        }
      }
    };

    initializeMap();
    return () => {
      mounted = false;
    };
  }, [showMapPicker, isAddressRequired]);

  useEffect(() => {
    if (!showMapPicker || !isAddressRequired) return;

    const query = mapSearchQuery?.trim();
    if (!query || query.length < 3) {
      setMapSearchSuggestions([]);
      setMapSearchLoading(false);
      return;
    }

    if (mapSearchDebounceRef.current) {
      clearTimeout(mapSearchDebounceRef.current);
    }

    let active = true;
    setMapSearchLoading(true);
    mapSearchDebounceRef.current = setTimeout(async () => {
      try {
        const results = await getPlaceAutocomplete(query, { country: 'ke', types: ['address'] });
        if (!active) return;
        const nairobiOnly = (results || []).filter((item) => /nairobi/i.test(item.description || ''));
        setMapSearchSuggestions(nairobiOnly.slice(0, 8));
      } catch {
        if (active) {
          setMapSearchSuggestions([]);
        }
      } finally {
        if (active) {
          setMapSearchLoading(false);
        }
      }
    }, 250);

    return () => {
      active = false;
      if (mapSearchDebounceRef.current) {
        clearTimeout(mapSearchDebounceRef.current);
      }
    };
  }, [mapSearchQuery, showMapPicker, isAddressRequired]);

  const applyMapSearchResult = async (suggestion) => {
    try {
      const place = await getPlaceDetails(suggestion.placeId);
      const pin = place?.location;
      if (pin && mapRef.current && markerRef.current) {
        mapRef.current.setCenter(pin);
        mapRef.current.setZoom(17);
        markerRef.current.setPosition(pin);
      }

      const secondaryParts = (suggestion.secondaryText || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      const estate = secondaryParts.find((item) => !/nairobi|kenya/i.test(item));

      setForm((prev) => ({
        ...prev,
        locationPin: pin || prev.locationPin,
        exactAddress: place?.address || suggestion.description || prev.exactAddress,
        estateArea: prev.estateArea || estate || prev.estateArea
      }));
      setMapSearchQuery(place?.address || suggestion.description || '');
      setMapSearchSuggestions([]);
    } catch {
      addNotification('Unable to center that address on map. Try another search.', 'warning');
    }
  };

  return (
    <div className="service-checkout-page">
      <section className="service-checkout-hero">
        <div className="container">
          <h1>{meta.title}</h1>
          <p>{meta.subtitle}</p>
          <div className="service-checkout-breadcrumbs">
            <Link to={ROUTES.SERVICES}>Services</Link>
            <span>•</span>
            <span>{meta.title}</span>
          </div>
        </div>
      </section>

      <section className="service-checkout-content">
        <div className="container service-checkout-grid">
          <div className="service-checkout-main">
            <div className="service-step-bar">
              <span className={step >= 1 ? 'active' : ''}>1. Service Plan</span>
              <span className={step >= 2 ? 'active' : ''}>2. Address & Customer</span>
              <span className={step >= 3 ? 'active' : ''}>3. Payment</span>
              <span className={step >= 4 ? 'active' : ''}>4. Confirm</span>
            </div>

            {step === 1 && (
              <div className="service-step-panel">
                <h2>Service Plan</h2>
                <div className="form-row two-col">
                  <Select
                    label="Flow Intent"
                    value={form.intent}
                    onChange={(e) => updateForm('intent', e.target.value)}
                    options={meta.intents.map((intent) => ({ value: intent.value, label: intent.label }))}
                  />
                  <Select
                    label="Delivery Mode"
                    value={form.deliveryMode}
                    onChange={(e) => updateForm('deliveryMode', e.target.value)}
                    options={deliveryOptions}
                  />
                </div>

                <div className="form-row three-col">
                  <Input
                    label="Start Date"
                    type="date"
                    value={form.startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => updateForm('startDate', e.target.value)}
                  />
                  {serviceType === 'rental' ? (
                    <Input
                      label="End Date"
                      type="date"
                      value={form.endDate}
                      min={form.startDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => updateForm('endDate', e.target.value)}
                    />
                  ) : (
                    <Input
                      label="End Date"
                      type="date"
                      value={form.startDate}
                      disabled
                      onChange={() => {}}
                    />
                  )}
                  <Select
                    label="Preferred Time"
                    value={form.time}
                    onChange={(e) => updateForm('time', e.target.value)}
                    options={[
                      { value: '08:00 AM', label: '08:00 AM' },
                      { value: '09:00 AM', label: '09:00 AM' },
                      { value: '11:00 AM', label: '11:00 AM' },
                      { value: '01:00 PM', label: '01:00 PM' },
                      { value: '03:00 PM', label: '03:00 PM' },
                      { value: '05:00 PM', label: '05:00 PM' }
                    ]}
                  />
                </div>

                {form.deliveryMode === 'pickup' ? (
                  <div className="form-row">
                    <Select
                      label="Branch Location"
                      value={form.branch}
                      onChange={(e) => updateForm('branch', e.target.value)}
                      options={BRANCHES}
                    />
                  </div>
                ) : (
                  <>
                    <div className="address-banner">Delivery address supports all exact Nairobi house addresses.</div>
                    <div className="form-row two-col">
                      <Input label="County" value={form.county} disabled onChange={() => {}} />
                      <Input
                        label="Area / Estate (Nairobi)"
                        value={form.estateArea}
                        onChange={(e) => updateForm('estateArea', e.target.value)}
                        placeholder="e.g. Kilimani, Kileleshwa, Kasarani"
                      />
                    </div>
                    <div className="form-row">
                      <div className="address-autocomplete" ref={addressAutocompleteRef}>
                        <Input
                          label="Exact House Address"
                          value={form.exactAddress}
                          onChange={(e) => updateForm('exactAddress', e.target.value)}
                          onFocus={() => setShowAddressSuggestions(addressSuggestions.length > 0)}
                          placeholder="House number, street, road"
                        />

                        {isAddressRequired && (showAddressSuggestions || addressLoading) && (
                          <div className="address-suggestion-dropdown">
                            {addressLoading && (
                              <div className="address-suggestion-item muted">Looking up Nairobi addresses...</div>
                            )}
                            {!addressLoading && addressSuggestions.length === 0 && (
                              <div className="address-suggestion-item muted">No Nairobi address matches yet.</div>
                            )}
                            {!addressLoading && addressSuggestions.map((suggestion) => (
                              <button
                                key={suggestion.placeId}
                                type="button"
                                className="address-suggestion-item"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => applyAddressSuggestion(suggestion)}
                              >
                                <strong>{suggestion.mainText}</strong>
                                <span>{suggestion.secondaryText || suggestion.description}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="map-picker-panel">
                        <div className="map-picker-header">
                          <strong>Pin Exact Location (Google Maps)</strong>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowMapPicker((prev) => !prev)}
                          >
                            {showMapPicker ? 'Hide Map' : 'Open Map Picker'}
                          </Button>
                        </div>

                        {showMapPicker && (
                          <div className="map-picker-body">
                            <div className="map-picker-search">
                              <Input
                                label="Search on Map"
                                value={mapSearchQuery}
                                onChange={(e) => setMapSearchQuery(e.target.value)}
                                placeholder="Search exact Nairobi address then pin"
                              />
                              {(mapSearchLoading || mapSearchSuggestions.length > 0) && (
                                <div className="map-search-dropdown">
                                  {mapSearchLoading && (
                                    <div className="map-search-item muted">Finding addresses...</div>
                                  )}
                                  {!mapSearchLoading && mapSearchSuggestions.map((item) => (
                                    <button
                                      key={item.placeId}
                                      type="button"
                                      className="map-search-item"
                                      onClick={() => applyMapSearchResult(item)}
                                    >
                                      <strong>{item.mainText}</strong>
                                      <span>{item.secondaryText || item.description}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="map-canvas-wrap">
                              <div ref={mapRootRef} className="map-canvas" />
                              {mapLoading && <div className="map-canvas-state">Loading map...</div>}
                              {mapError && <div className="map-canvas-state error">{mapError}</div>}
                            </div>
                            {form.locationPin && (
                              <p className="map-pin-readout">
                                Pinned: {form.locationPin.lat.toFixed(6)}, {form.locationPin.lng.toFixed(6)}
                              </p>
                            )}
                            <p className="map-picker-note">Search, click on map, then drag the pin to exact house gate.</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="form-row two-col">
                      <Input
                        label="Building / Apartment"
                        value={form.buildingApartment}
                        onChange={(e) => updateForm('buildingApartment', e.target.value)}
                        placeholder="Apartment / floor / unit"
                      />
                      <Input
                        label="Nearest Landmark"
                        value={form.landmark}
                        onChange={(e) => updateForm('landmark', e.target.value)}
                        placeholder="School, mall, stage, gate"
                      />
                    </div>
                  </>
                )}

                <div className="service-actions">
                  <Button variant="primary" onClick={goNext}>Continue to Customer & Add-ons</Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="service-step-panel">
                <h2>Customer & Service Details</h2>

                <div className="service-addon-grid">
                  {meta.addOns.map((addon) => (
                    <label key={addon.id} className="service-addon-item">
                      <input
                        type="checkbox"
                        checked={selectedAddOns.some((item) => item.id === addon.id)}
                        onChange={() => toggleAddOn(addon)}
                      />
                      <div>
                        <strong>{addon.name}</strong>
                        <span>{addon.price > 0 ? `+${formatCurrency(addon.price)}` : 'Included / No charge'}</span>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="form-row two-col">
                  <Input label="First Name" value={form.customerInfo.firstName} onChange={(e) => updateCustomer('firstName', e.target.value)} />
                  <Input label="Last Name" value={form.customerInfo.lastName} onChange={(e) => updateCustomer('lastName', e.target.value)} />
                </div>
                <div className="form-row two-col">
                  <Input label="Email" type="email" value={form.customerInfo.email} onChange={(e) => updateCustomer('email', e.target.value)} />
                  <Input label="Phone" type="tel" value={form.customerInfo.phone} onChange={(e) => updateCustomer('phone', e.target.value)} />
                </div>
                <div className="form-row">
                  <Input label="National ID / Passport" value={form.customerInfo.idNumber} onChange={(e) => updateCustomer('idNumber', e.target.value)} />
                </div>

                {serviceType === 'car_wash' && (
                  <div className="form-row two-col">
                    <Input label="Vehicle Plate Number" value={form.vehiclePlate} onChange={(e) => updateForm('vehiclePlate', e.target.value)} />
                    <Select
                      label="Vehicle Size"
                      value={form.vehicleSize}
                      onChange={(e) => updateForm('vehicleSize', e.target.value)}
                      options={[
                        { value: 'compact', label: 'Compact' },
                        { value: 'standard', label: 'Standard' },
                        { value: 'suv', label: 'SUV' },
                        { value: 'luxury', label: 'Luxury' },
                        { value: 'exotic', label: 'Exotic' }
                      ]}
                    />
                  </div>
                )}

                {serviceType === 'repair' && (
                  <>
                    <div className="form-row three-col">
                      <Input label="Vehicle Make" value={form.vehicleMake} onChange={(e) => updateForm('vehicleMake', e.target.value)} />
                      <Input label="Vehicle Model" value={form.vehicleModel} onChange={(e) => updateForm('vehicleModel', e.target.value)} />
                      <Input label="Vehicle Year" value={form.vehicleYear} onChange={(e) => updateForm('vehicleYear', e.target.value)} />
                    </div>
                    <div className="form-row two-col">
                      <Select
                        label="Urgency"
                        value={form.urgent ? 'urgent' : 'normal'}
                        onChange={(e) => updateForm('urgent', e.target.value === 'urgent')}
                        options={[
                          { value: 'normal', label: 'Normal Queue' },
                          { value: 'urgent', label: 'Urgent Priority' }
                        ]}
                      />
                      <Input label="Issue Summary" value={form.issueDescription} onChange={(e) => updateForm('issueDescription', e.target.value)} />
                    </div>
                  </>
                )}

                {serviceType === 'sales' && (
                  <div className="form-row three-col">
                    <Select
                      label="Budget Range"
                      value={form.budgetRange}
                      onChange={(e) => updateForm('budgetRange', e.target.value)}
                      options={[
                        { value: '', label: 'Select range' },
                        { value: 'under_3m', label: 'Under KSh 3M' },
                        { value: '3m_8m', label: 'KSh 3M - 8M' },
                        { value: '8m_20m', label: 'KSh 8M - 20M' },
                        { value: 'above_20m', label: 'Above KSh 20M' }
                      ]}
                    />
                    <Select
                      label="Need Financing"
                      value={form.financingNeeded}
                      onChange={(e) => updateForm('financingNeeded', e.target.value)}
                      options={[
                        { value: 'no', label: 'No' },
                        { value: 'yes', label: 'Yes' }
                      ]}
                    />
                    <Select
                      label="Trade-in"
                      value={form.tradeIn}
                      onChange={(e) => updateForm('tradeIn', e.target.value)}
                      options={[
                        { value: 'no', label: 'No' },
                        { value: 'yes', label: 'Yes' }
                      ]}
                    />
                  </div>
                )}

                <div className="form-row">
                  <label className="textarea-label">Additional Instructions</label>
                  <textarea
                    className="service-textarea"
                    rows="4"
                    value={form.specialRequests}
                    onChange={(e) => updateForm('specialRequests', e.target.value)}
                    placeholder="Any custom instructions for delivery, service handling, or contact"
                  />
                </div>

                <div className="service-actions">
                  <Button variant="outline" onClick={goBack}>Back</Button>
                  <Button variant="primary" onClick={goNext}>Continue to Payment</Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="service-step-panel">
                <h2>Payment Configuration</h2>
                <div className="form-row two-col">
                  <Select
                    label="Payment Channel"
                    value={form.paymentChannel}
                    onChange={(e) => updateForm('paymentChannel', e.target.value)}
                    options={paymentChannelOptions}
                  />

                  {form.paymentChannel === 'online' ? (
                    <Select
                      label="Online Method"
                      value={form.paymentMethod}
                      onChange={(e) => updateForm('paymentMethod', e.target.value)}
                      options={paymentMethods.map((method) => ({ value: method.id, label: method.name || method.label || method.id }))}
                      placeholder="Select payment method"
                    />
                  ) : (
                    <Select
                      label="On-Delivery Payment Mode"
                      value={form.onDeliveryMethod}
                      onChange={(e) => updateForm('onDeliveryMethod', e.target.value)}
                      options={[
                        { value: 'cash_on_delivery', label: 'Cash on delivery/service day' },
                        { value: 'card_on_delivery', label: 'Card on service day' },
                        { value: 'mobile_on_delivery', label: 'M-PESA transfer on service day' }
                      ]}
                    />
                  )}
                </div>

                {form.paymentChannel === 'online' && form.paymentMethod === 'mpesa' && (
                  <div className="form-row">
                    <Input
                      label="M-PESA Phone"
                      value={paymentDetails.mpesaPhone}
                      onChange={(e) => updatePaymentDetails('mpesaPhone', e.target.value)}
                      placeholder="2547XXXXXXXX"
                    />
                  </div>
                )}

                {form.paymentChannel === 'online' && form.paymentMethod === 'paypal' && (
                  <div className="form-row">
                    <Input
                      label="PayPal Email"
                      type="email"
                      value={paymentDetails.paypalEmail}
                      onChange={(e) => updatePaymentDetails('paypalEmail', e.target.value)}
                      placeholder="you@example.com"
                    />
                  </div>
                )}

                {form.paymentChannel === 'online' && form.paymentMethod === 'card' && (
                  <>
                    <div className="form-row">
                      <Input label="Cardholder Name" value={paymentDetails.cardName} onChange={(e) => updatePaymentDetails('cardName', e.target.value)} />
                    </div>
                    <div className="form-row three-col">
                      <Input label="Card Number" value={paymentDetails.cardNumber} onChange={(e) => updatePaymentDetails('cardNumber', e.target.value)} />
                      <Input label="Expiry" value={paymentDetails.cardExpiry} onChange={(e) => updatePaymentDetails('cardExpiry', e.target.value)} placeholder="MM/YY" />
                      <Input label="CVV" value={paymentDetails.cardCvv} onChange={(e) => updatePaymentDetails('cardCvv', e.target.value)} />
                    </div>
                  </>
                )}

                {form.paymentChannel === 'online' && form.paymentMethod === 'square' && (
                  <div className="form-row">
                    <Input
                      label="Square Customer Token"
                      value={paymentDetails.squareCustomer}
                      onChange={(e) => updatePaymentDetails('squareCustomer', e.target.value)}
                    />
                  </div>
                )}

                <div className="service-actions">
                  <Button variant="outline" onClick={goBack}>Back</Button>
                  <Button variant="primary" onClick={goNext}>Review & Confirm</Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="service-step-panel">
                <h2>Final Confirmation</h2>
                <p className="confirm-note">
                  You are about to complete the {currentIntentMeta?.type === 'buy' ? 'buying' : 'booking'} process for this {serviceType.replace('_', ' ')} service.
                </p>
                <div className="service-actions">
                  <Button variant="outline" onClick={goBack}>Back</Button>
                  <Button variant="primary" onClick={submitOrder} loading={saving} disabled={saving}>
                    {saving ? 'Processing...' : 'Complete Service Flow'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <aside className="service-checkout-summary">
            <h3>Service Summary</h3>
            <div className="summary-row">
              <span>Service</span>
              <strong>{serviceType.replace('_', ' ')}</strong>
            </div>
            <div className="summary-row">
              <span>Flow</span>
              <strong>{currentIntentMeta?.label}</strong>
            </div>
            {(bookingPrefill.packageName || bookingPrefill.vehicleName) && (
              <div className="summary-row">
                <span>Selection</span>
                <strong>{bookingPrefill.packageName || bookingPrefill.vehicleName}</strong>
              </div>
            )}
            <div className="summary-row">
              <span>Base Amount</span>
              <strong>{formatCurrency(baseAmount)}</strong>
            </div>
            <div className="summary-row">
              <span>Add-ons</span>
              <strong>{formatCurrency(addOnTotal)}</strong>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <strong>{formatCurrency(deliveryFee)}</strong>
            </div>
            <div className="summary-row">
              <span>Tax (8%)</span>
              <strong>{formatCurrency(tax)}</strong>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <strong>{formatCurrency(totalAmount)}</strong>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default ServiceCheckout;
