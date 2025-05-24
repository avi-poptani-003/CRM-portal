// src/components/property/add-property-form.jsx
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import propertyService from "../../services/propertyService";
import { Building, Home, Landmark, Upload, X, Plus } from 'lucide-react';

const AddPropertyForm = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    propertyType: "house",
    propertySubType: "",
    listingType: "for_sale",
    title: "",
    price: "",
    area: "",
    description: "",
    location: "",
    status: "available",
    furnishingStatus: "Unfurnished",
    possessionStatus: "Ready to Move",
    possessionTimeline: "Ready to Move",
    floor: "",
    facing: "East",
    ageOfProperty: "",
    carpetArea: "",
    balconies: "",
    loanAmount: "",
    interestRate: "8.5",
    loanTerm: "20",
    contactName: "",
    contactPhone: "",
    dimensions_length: "",
    dimensions_width: "",
    images: [],
  });

  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [activeStep, setActiveStep] = useState(1);
  const [monthlyEMI, setMonthlyEMI] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submitDebug, setSubmitDebug] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      if (parent === "dimensions") {
        setFormData({
          ...formData,
          [`dimensions_${child}`]: value,
        });
      } else {
        setFormData({
          ...formData,
          [parent]: {
            ...formData[parent],
            [child]: value,
          },
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handlePropertyTypeChange = (type) => {
    setFormData({
      ...formData,
      propertyType: type,
    });
  };

  const handleListingTypeChange = (type) => {
    setFormData({
      ...formData,
      listingType: type,
    });
  };

  const handleImageUpload = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      // Create preview URLs for the new files
      const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file));

      setFormData({
        ...formData,
        images: [...formData.images, ...newFiles],
      });

      setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls]);
    }
  };

  const removeImage = (index) => {
    // Remove the image from the formData
    const newImages = [...formData.images];
    newImages.splice(index, 1);

    // Remove the preview URL
    const newPreviewUrls = [...imagePreviewUrls];
    URL.revokeObjectURL(newPreviewUrls[index]); // Clean up the URL object
    newPreviewUrls.splice(index, 1);

    setFormData({
      ...formData,
      images: newImages,
    });
    setImagePreviewUrls(newPreviewUrls);
  };

  const calculateEMI = () => {
    const P = Number.parseFloat(formData.loanAmount);
    const r = Number.parseFloat(formData.interestRate) / 12 / 100; // Monthly interest rate
    const n = Number.parseFloat(formData.loanTerm) * 12; // Total number of months

    if (isNaN(P) || isNaN(r) || isNaN(n) || P <= 0 || r <= 0 || n <= 0) {
      setMonthlyEMI(null);
      return;
    }

    // EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    setMonthlyEMI(emi.toFixed(2));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSubmitDebug(null);

    try {
      // Log the form data for debugging
      console.log("Form data:", formData);
      
      // Prepare data for API
      const propertyData = {
        title: formData.title,
        property_type: formData.propertyType,
        property_sub_type: formData.propertySubType,
        listing_type: formData.listingType,
        status: formData.status,
        location: formData.location,
        price: formData.price,
        area: formData.area,
        carpet_area: formData.carpetArea,
        dimensions_length: formData.dimensions_length,
        dimensions_width: formData.dimensions_width,
        description: formData.description,
        floor: formData.floor,
        facing: formData.facing,
        age_of_property: formData.ageOfProperty,
        balconies: formData.balconies,
        furnishing_status: formData.furnishingStatus,
        possession_status: formData.possessionStatus,
        possession_timeline: formData.possessionTimeline,
        loan_amount: formData.loanAmount,
        interest_rate: formData.interestRate,
        loan_term: formData.loanTerm,
        contact_name: formData.contactName,
        contact_phone: formData.contactPhone,
        images: formData.images,
      };

      // Log the prepared data for debugging
      console.log("Prepared data:", propertyData);
      setSubmitDebug("Submitting property data...");

      // Send data to API
      const result = await propertyService.createProperty(propertyData);
      
      // Verify we have a valid ID
      if (!result || !result.id) {
        throw new Error("Server returned invalid property ID");
      }
      
      setSubmitDebug(`Property created successfully! ID: ${result.id}. Redirecting...`);
      console.log("Created property with ID:", result.id);

      // Add a small delay before redirecting to ensure state is updated
      setTimeout(() => {
        // Redirect to property detail page with the correct ID
        navigate(`/dashboard/properties/${result.id}`);
      }, 500);
    } catch (err) {
      console.error("Error creating property:", err);
      
      let errorMessage = "Failed to create property. Please try again.";
      
      if (err.response && err.response.data) {
        // Format the error message from the response
        if (typeof err.response.data === 'object') {
          errorMessage = Object.entries(err.response.data)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('\n');
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        }
      }
      
      setError(errorMessage);
      setSubmitDebug(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    setActiveStep(activeStep + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setActiveStep(activeStep - 1);
    window.scrollTo(0, 0);
  };

  return (
    <div
      className={`min-h-screen ${isDark ? "bg-gray-900 text-white" : "bg-gradient-to-br from-gray-50 to-blue-50/50"}`}
    >
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className={`mb-4 flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200
              ${isDark ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-50"}`}
          >
            <i className="fas fa-arrow-left"></i>
            Back to Properties
          </button>
          <h1 className="text-2xl md:text-3xl font-semibold">Add New Property</h1>
          <p className="text-sm mt-2">Fill in the details to add a new property listing</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8 relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`w-10 h-10 rounded-full flex items-center justify-center z-10 relative
                ${
                  activeStep >= step
                    ? isDark
                      ? "bg-blue-600 text-white"
                      : "bg-blue-600 text-white"
                    : isDark
                      ? "bg-gray-700 text-gray-300"
                      : "bg-gray-200 text-gray-500"
                }`}
              onClick={() => step < activeStep && setActiveStep(step)}
            >
              {step}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <h3 className="font-bold mb-2">Error:</h3>
            <pre className="whitespace-pre-wrap">{error}</pre>
          </div>
        )}

        {submitDebug && (
          <div className="mb-6 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg">
            <h3 className="font-bold mb-2">Debug Info:</h3>
            <pre className="whitespace-pre-wrap">{submitDebug}</pre>
          </div>
        )}

        <form onSubmit={handleSubmit} className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-xl shadow-sm p-6`}>
          {/* Step 1: Basic Property Information */}
          {activeStep === 1 && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Select Property Type</h2>
                <div className="flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() => handlePropertyTypeChange("house")}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 border
                      ${
                        formData.propertyType === "house"
                          ? isDark
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                          : isDark
                            ? "bg-gray-700 border-gray-600"
                            : "bg-gray-50 border-gray-200"
                      }`}
                  >
                    <Home size={20} />
                    House
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePropertyTypeChange("commercial")}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 border
                      ${
                        formData.propertyType === "commercial"
                          ? isDark
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                          : isDark
                            ? "bg-gray-700 border-gray-600"
                            : "bg-gray-50 border-gray-200"
                      }`}
                  >
                    <Building size={20} />
                    Commercial
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePropertyTypeChange("land")}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 border
                      ${
                        formData.propertyType === "land"
                          ? isDark
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                          : isDark
                            ? "bg-gray-700 border-gray-600"
                            : "bg-gray-50 border-gray-200"
                      }`}
                  >
                    <Landmark size={20} />
                    Land
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">
                  <i className="fas fa-rupee-sign mr-2"></i>
                  Listing Details
                </h2>

                <div className="mb-4">
                  <label className="block mb-2">Listing Type</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="listingType"
                        value="for_sale"
                        checked={formData.listingType === "for_sale"}
                        onChange={() => handleListingTypeChange("for_sale")}
                        className="w-4 h-4"
                      />
                      For Sale
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="listingType"
                        value="for_rent"
                        checked={formData.listingType === "for_rent"}
                        onChange={() => handleListingTypeChange("for_rent")}
                        className="w-4 h-4"
                      />
                      For Rent
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="title" className="block mb-2">
                      Property Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      placeholder="e.g., Luxury 3BHK Apartment in Bandra West"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="propertySubType" className="block mb-2">
                      Property Sub-Type
                    </label>
                    <select
                      id="propertySubType"
                      name="propertySubType"
                      value={formData.propertySubType}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                      required
                    >
                      <option value="">Select Sub-Type</option>
                      {formData.propertyType === "house" && (
                        <>
                          <option value="Apartment">Apartment</option>
                          <option value="Villa">Villa</option>
                          <option value="Independent House">Independent House</option>
                          <option value="Penthouse">Penthouse</option>
                        </>
                      )}
                      {formData.propertyType === "commercial" && (
                        <>
                          <option value="Office Space">Office Space</option>
                          <option value="Shop">Shop</option>
                          <option value="Showroom">Showroom</option>
                          <option value="Warehouse">Warehouse</option>
                        </>
                      )}
                      {formData.propertyType === "land" && (
                        <>
                          <option value="Residential Plot">Residential Plot</option>
                          <option value="Commercial Plot">Commercial Plot</option>
                          <option value="Agricultural Land">Agricultural Land</option>
                          <option value="Industrial Land">Industrial Land</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="price" className="block mb-2">
                      Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2">₹</span>
                      <input
                        type="text"
                        id="price"
                        name="price"
                        placeholder="Price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className={`w-full pl-8 pr-4 py-2 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="area" className="block mb-2">
                      <i className="fas fa-ruler-combined mr-2"></i>
                      Area (sq.ft)
                    </label>
                    <input
                      type="text"
                      id="area"
                      name="area"
                      placeholder="Total area in sq.ft"
                      value={formData.area}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                      required
                    />
                  </div>
                </div>

                {formData.propertyType === "land" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="md:col-span-2">
                      <label className="block mb-2">Dimensions</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          name="dimensions.length"
                          placeholder="Length"
                          value={formData.dimensions_length}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                        />
                        <span>×</span>
                        <input
                          type="text"
                          name="dimensions.width"
                          placeholder="Width"
                          value={formData.dimensions_width}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="facing" className="block mb-2">
                        Plot Facing
                      </label>
                      <select
                        id="facing"
                        name="facing"
                        value={formData.facing}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                      >
                        <option value="East">East</option>
                        <option value="West">West</option>
                        <option value="North">North</option>
                        <option value="South">South</option>
                        <option value="North-East">North-East</option>
                        <option value="North-West">North-West</option>
                        <option value="South-East">South-East</option>
                        <option value="South-West">South-West</option>
                      </select>
                    </div>
                  </div>
                )}

                {formData.propertyType === "house" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="furnishingStatus" className="block mb-2">
                        Furnishing Status
                      </label>
                      <select
                        id="furnishingStatus"
                        name="furnishingStatus"
                        value={formData.furnishingStatus}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                      >
                        <option value="Unfurnished">Unfurnished</option>
                        <option value="Semi-Furnished">Semi-Furnished</option>
                        <option value="Fully Furnished">Fully Furnished</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="possessionStatus" className="block mb-2">
                        Possession Status
                      </label>
                      <select
                        id="possessionStatus"
                        name="possessionStatus"
                        value={formData.possessionStatus}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                      >
                        <option value="Ready to Move">Ready to Move</option>
                        <option value="Under Construction">Under Construction</option>
                        <option value="Coming Soon">Coming Soon</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <label htmlFor="possessionTimeline" className="block mb-2">
                    Possession Timeline
                  </label>
                  <select
                    id="possessionTimeline"
                    name="possessionTimeline"
                    value={formData.possessionTimeline}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                  >
                    <option value="Ready to Move">Ready to Move</option>
                    <option value="Within 3 Months">Within 3 Months</option>
                    <option value="Within 6 Months">Within 6 Months</option>
                    <option value="Within 1 Year">Within 1 Year</option>
                    <option value="More than 1 Year">More than 1 Year</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label htmlFor="description" className="block mb-2">
                    Property Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Describe your property..."
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={5}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                    required
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label htmlFor="location" className="block mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    placeholder="e.g., Bandra West, Mumbai"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 2: Additional Details */}
          {activeStep === 2 && (
            <>
              {formData.propertyType === "house" && (
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label htmlFor="floor" className="block mb-2">
                        Floor
                      </label>
                      <input
                        type="text"
                        id="floor"
                        name="floor"
                        placeholder="e.g., 12th (Out of 20)"
                        value={formData.floor}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                      />
                    </div>

                    <div>
                      <label htmlFor="facing" className="block mb-2">
                        Facing
                      </label>
                      <select
                        id="facing"
                        name="facing"
                        value={formData.facing}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                      >
                        <option value="East">East</option>
                        <option value="West">West</option>
                        <option value="North">North</option>
                        <option value="South">South</option>
                        <option value="North-East">North-East</option>
                        <option value="North-West">North-West</option>
                        <option value="South-East">South-East</option>
                        <option value="South-West">South-West</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="ageOfProperty" className="block mb-2">
                        Age of Property
                      </label>
                      <input
                        type="text"
                        id="ageOfProperty"
                        name="ageOfProperty"
                        placeholder="e.g., 2 years"
                        value={formData.ageOfProperty}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="carpetArea" className="block mb-2">
                        Carpet Area
                      </label>
                      <input
                        type="text"
                        id="carpetArea"
                        name="carpetArea"
                        placeholder="e.g., 1050 sq ft"
                        value={formData.carpetArea}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                      />
                    </div>

                    <div>
                      <label htmlFor="balconies" className="block mb-2">
                        Balconies
                      </label>
                      <input
                        type="text"
                        id="balconies"
                        name="balconies"
                        placeholder="No. of balconies"
                        value={formData.balconies}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">
                  <i className="fas fa-calculator mr-2"></i>
                  EMI Calculator
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label htmlFor="loanAmount" className="block mb-2">
                      Loan Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2">₹</span>
                      <input
                        type="text"
                        id="loanAmount"
                        name="loanAmount"
                        placeholder="10,000,000"
                        value={formData.loanAmount}
                        onChange={handleInputChange}
                        onBlur={calculateEMI}
                        className={`w-full pl-8 pr-4 py-2 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="interestRate" className="block mb-2">
                      Interest Rate (%)
                    </label>
                    <input
                      type="text"
                      id="interestRate"
                      name="interestRate"
                      placeholder="8.5"
                      value={formData.interestRate}
                      onChange={handleInputChange}
                      onBlur={calculateEMI}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                    />
                  </div>

                  <div>
                    <label htmlFor="loanTerm" className="block mb-2">
                      Loan Term (Years)
                    </label>
                    <input
                      type="text"
                      id="loanTerm"
                      name="loanTerm"
                      placeholder="20"
                      value={formData.loanTerm}
                      onChange={handleInputChange}
                      onBlur={calculateEMI}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                    />
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-100 text-blue-800">
                  <div className="font-medium">Your Monthly EMI</div>
                  <div className="text-2xl font-bold">
                    {monthlyEMI ? `₹${Number.parseInt(monthlyEMI).toLocaleString()}` : "Calculate EMI"}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contactName" className="block mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      id="contactName"
                      name="contactName"
                      placeholder="Your name"
                      value={formData.contactName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                    />
                  </div>

                  <div>
                    <label htmlFor="contactPhone" className="block mb-2">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      id="contactPhone"
                      name="contactPhone"
                      placeholder="Your phone number"
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 3: Images Upload */}
          {activeStep === 3 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Upload Property Images</h2>
              <p className="text-sm mb-4">
                Upload high-quality images of your property. You can upload multiple images.
              </p>

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 cursor-pointer
                  ${isDark ? "border-gray-600 hover:border-gray-500" : "border-gray-300 hover:border-gray-400"}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500">PNG, JPG, JPEG up to 10MB each</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  multiple
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {imagePreviewUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url || "/placeholder.svg"}
                        alt={`Property preview ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <div
                    className={`flex items-center justify-center h-40 border-2 border-dashed rounded-lg cursor-pointer
                      ${isDark ? "border-gray-600 hover:border-gray-500" : "border-gray-300 hover:border-gray-400"}`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Plus size={24} className="text-gray-400" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {activeStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className={`px-6 py-2 rounded-lg transition-all duration-200
                  ${isDark ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"}`}
              >
                Previous
              </button>
            ) : (
              <div></div> // Empty div to maintain flex spacing
            )}

            {activeStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-70"
              >
                {isSubmitting ? "Submitting..." : "List My Property"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPropertyForm;