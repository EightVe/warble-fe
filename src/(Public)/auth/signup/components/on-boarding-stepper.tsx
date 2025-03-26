"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ChevronRight, Check, Mail, Globe, Calendar, ChevronDown, Hand, Binary, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import axiosInstance from "@/lib/axiosInstance"
import countryToCode from "@/(Protected)/OnetoOnePeer/Peering/country-flags"

const STEPS = [
  {
    id: "welcome",
    title: "Welcome",
    icon: <Hand className="h-6 w-6 animate-pulse" />,
  },
  {
    id: "email",
    title: "Email",
    icon: <Mail className="h-6 w-6 animate-pulse" />,
  },
  {
    id: "country",
    title: "Country",
    icon: <Globe className="h-6 w-6 animate-pulse" />,
  },
  {
    id: "age",
    title: "Age",
    icon: <Calendar className="h-6 w-6 animate-pulse" />,
  },
  {
    id: "gender",
    title: "Gender",
    icon: <Binary className="h-6 w-6 animate-pulse" />,
  },
  {
    id: "complete",
    title: "Complete",
    icon: <Check className="h-6 w-6 animate-pulse" />,
  },
]
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export function OnboardingStepper({ user, updateGeoLocationManually }) {
  // Add these new state variables at the top of the OnboardingStepper component
  const [sendingOTP, setSendingOTP] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [countdownInterval, setCountdownInterval] = useState<NodeJS.Timeout | null>(null)
  // In the OnboardingStepper component, add a message state for OTP feedback
  const [message, setMessage] = useState("")
  const [otp, setOtp] = useState("")
  // Add state to track if we're checking geolocation
  const [checkingLocation, setCheckingLocation] = useState(false)

  // Update the sendOTP function to handle loading state
  const sendOTP = async () => {
    try {
      setSendingOTP(true)
      setMessage("In Progress...")
      const response = await axiosInstance.post("/verifications/send-email-otp", {
        userId: user._id,
        email: user.emailAddress,
      })

      // Handle successful response
      console.log("OTP sent:", response.data)
      setMessage(
        `We've sent an OTP to your email address (${user.emailAddress}) please enter the code bellow to verify your email.`,
      )

      // Start countdown timer
      setCountdown(59)
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      setCountdownInterval(interval)
    } catch (error) {
      // Handle error
      console.error("Error sending OTP:", error.response?.data || error.message)
      setMessage("It seems that your email address is not in our system. Please try again.")
    } finally {
      setSendingOTP(false)
    }
  }
  const getFlagImage = (countryName: string) => {
    const countryCode = countryToCode[countryName]
    if (!countryCode) return null

    return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`
  }
  // Update the verifyOTP function to handle verification results
  const verifyOTP = async () => {
    try {
      setMessage("Verifying OTP...")
      const response = await axiosInstance.post("/verifications/verify-email-otp", {
        userId: user._id,
        otp,
      })

      console.log("OTP verified:", response.data)
      setMessage("Email verified successfully! please wait to procceed to the next step.")

      // Proceed to next step after successful verification
      setTimeout(() => {
        setCurrentStep(2)
      }, 1000)

      return true
    } catch (error) {
      // Handle error
      console.error("Error verifying OTP:", error.response?.data || error.message)
      setMessage("Invalid OTP. Please try again.")
      return false
    }
  }

  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    email: "",
    country: "",
    birthDate: {
      day: "",
      month: "",
      year: "",
    },
    gender: "", // Add this line
  })
  const [errors, setErrors] = useState({
    email: "",
    country: "",
    birthDate: "",
    gender: "", // Add this line
  })

  // In the OnboardingStepper component, add a loading state
  const [isLoading, setIsLoading] = useState(false)

  // Add cleanup for the interval in a useEffect
  // Add this after the state declarations
  useEffect(() => {
    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval)
      }
    }
  }, [countdownInterval])

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const calculateAge = (birthDate: { day: string; month: string; year: string }) => {
    if (!birthDate.day || !birthDate.month || !birthDate.year) return null

    const today = new Date()
    const birthDateObj = new Date(
      Number.parseInt(birthDate.year),
      Number.parseInt(birthDate.month) - 1,
      Number.parseInt(birthDate.day),
    )

    let age = today.getFullYear() - birthDateObj.getFullYear()
    const monthDiff = today.getMonth() - birthDateObj.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--
    }

    return age
  }

  // Function to try to update geolocation and check if it's available
  const tryUpdateGeolocation = async () => {
    setCheckingLocation(true)

    try {
      // Call the updateGeoLocationManually function
      await updateGeoLocationManually()

      // Wait a moment for the user object to potentially update
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Return whether the country is now available
      return !!user.country
    } catch (error) {
      console.error("Error updating geolocation:", error)
      return false
    } finally {
      setCheckingLocation(false)
    }
  }

  // Modify the handleNext function to check for user.country and try to update it if needed
  const handleNext = async () => {
    let canProceed = true
    const newErrors = { ...errors }

    // For step 0, check what information is already verified
    if (currentStep === 0) {
      setIsLoading(true)

      // First, check if we need to update geolocation
      if (!user.country) {
        // Try to update geolocation
        const locationUpdated = await tryUpdateGeolocation()
        // If location still not available, we'll handle that in the next checks
      }

      // Check what information is available after potential geolocation update
      if (user.verifiedEmail && user.country && user.userAge && user.gender) {
        // If all information is available, go to complete step
        setTimeout(() => {
          setIsLoading(false)
          setCurrentStep(5) // Skip to complete step
        }, 500)
      } else if (user.verifiedEmail && user.country && user.userAge) {
        // If email, country, and age are verified, go to gender step
        setTimeout(() => {
          setIsLoading(false)
          setCurrentStep(4) // Skip to gender step
        }, 500)
      } else if (user.verifiedEmail && user.country) {
        // If email and country are verified, go to age step
        setTimeout(() => {
          setIsLoading(false)
          setCurrentStep(3) // Skip to age step
        }, 500)
      } else if (user.verifiedEmail) {
        // If only email is verified, go to country step
        setTimeout(() => {
          setIsLoading(false)
          setCurrentStep(2) // Skip to country step
        }, 500)
      } else {
        // If email is not verified, go to step 1 (email verification) and send OTP
        setTimeout(() => {
          setIsLoading(false)
          setCurrentStep(1)
          // Send OTP when showing step 1
          sendOTP()
        }, 500)
      }
      return
    } else if (currentStep === 1) {
      if (!otp) {
        newErrors.email = "OTP is required"
        canProceed = false
      } else {
        newErrors.email = ""
        // Verify OTP when proceeding from step 1
        const verified = await verifyOTP()
        if (!verified) {
          canProceed = false
        } else {
          // If verification successful, check what information is available
          if (user.country && user.userAge && user.gender) {
            // If all other information is available, go to complete step
            setTimeout(() => {
              setCurrentStep(5)
            }, 1000)
            return
          } else if (user.country && user.userAge) {
            // If country and age are available, go to gender step
            setTimeout(() => {
              setCurrentStep(4)
            }, 1000)
            return
          } else if (user.country) {
            // If only country is available, go to age step
            setTimeout(() => {
              setCurrentStep(3)
            }, 1000)
            return
          } else {
            // If no other information is available, check if we need to update geolocation
            if (!user.country) {
              // Try to update geolocation
              const locationUpdated = await tryUpdateGeolocation()

              // Check if location is now available
              if (user.country) {
                if (user.userAge && user.gender) {
                  // If age and gender are available, go to complete step
                  setTimeout(() => {
                    setCurrentStep(5)
                  }, 1000)
                } else if (user.userAge) {
                  // If only age is available, go to gender step
                  setTimeout(() => {
                    setCurrentStep(4)
                  }, 1000)
                } else {
                  // If no age, go to age step
                  setTimeout(() => {
                    setCurrentStep(3)
                  }, 1000)
                }
                return
              }
            }
            // Otherwise, proceed to country step as already set in verifyOTP
          }
          return
        }
      }
    } else if (currentStep === 2) {
      // Before showing the country step, try to update geolocation one more time
      if (!user.country && !formData.country) {
        await tryUpdateGeolocation()

        // If location is now available, check what other information is available
        if (user.country) {
          if (user.userAge && user.gender) {
            setCurrentStep(5) // Skip to complete step
          } else if (user.userAge) {
            setCurrentStep(4) // Skip to gender step
          } else {
            setCurrentStep(3) // Go to age step
          }
          return
        }
      }

      if (!formData.country && !user.country) {
        newErrors.country = "Please select a country"
        canProceed = false
      } else {
        newErrors.country = ""

        // Update user country in the database
        try {
          setIsLoading(true)
          const selectedCountry = formData.country || user.country

          const response = await axiosInstance.post(`/user/add-country/${user._id}`, {
            country: selectedCountry,
          })

          console.log("Country updated:", response.data)

          // Check what other information is available
          setTimeout(() => {
            setIsLoading(false)
            if (user.userAge && user.gender) {
              setCurrentStep(5) // Skip to complete step
            } else if (user.userAge) {
              setCurrentStep(4) // Skip to gender step
            } else {
              setCurrentStep(3) // Go to age step
            }
          }, 500)
          return
        } catch (error) {
          console.error("Error updating country:", error)
          setIsLoading(false)
        }
      }
    } else if (currentStep === 3) {
      const age = calculateAge(formData.birthDate)
      if (!age && formData.birthDate.day && formData.birthDate.month && formData.birthDate.year) {
        newErrors.birthDate = "Invalid date selected"
        canProceed = false
      } else if (!age) {
        newErrors.birthDate = "Please select your complete birth date"
        canProceed = false
      } else if (age < 18) {
        newErrors.birthDate = "You must be at least 18 years old to access Warble"
        canProceed = false
      } else if (age > 100) {
        newErrors.birthDate = "You are older than 100 years"
        canProceed = false
      } else {
        newErrors.birthDate = ""

        // Update user age in the database
        try {
          setIsLoading(true)

          const response = await axiosInstance.post(`/user/add-age/${user._id}`, {
            birthDate: formData.birthDate,
          })

          console.log("Age updated:", response.data)

          // Check if gender is already set
          setTimeout(() => {
            setIsLoading(false)
            if (user.gender) {
              setCurrentStep(5) // Skip to complete step
            } else {
              setCurrentStep(4) // Go to gender step
            }
          }, 500)
          return
        } catch (error) {
          console.error("Error updating age:", error)
          setIsLoading(false)
        }
      }
    } else if (currentStep === 4) {
      if (!formData.gender) {
        newErrors.gender = "Please select your gender to continue"
        canProceed = false
      } else {
        newErrors.gender = ""

        // Update user gender in the database
        try {
          setIsLoading(true)

          const response = await axiosInstance.post(`/user/add-gender/${user._id}`, {
            gender: formData.gender,
          })

          console.log("Gender updated:", response.data)

          // Proceed to complete step
          setTimeout(() => {
            setIsLoading(false)
            setCurrentStep(5)
          }, 500)
          return
        } catch (error) {
          console.error("Error updating gender:", error)
          setIsLoading(false)
        }
      }
    }

    setErrors(newErrors)

    if (canProceed && currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleBirthDateChange = (field: "day" | "month" | "year", value: string) => {
    const newBirthDate = {
      ...formData.birthDate,
      [field]: value,
    }

    setFormData({
      ...formData,
      birthDate: newBirthDate,
    })

    // Check age immediately when all fields are filled
    if (newBirthDate.day && newBirthDate.month && newBirthDate.year) {
      const age = calculateAge(newBirthDate)
      if (age !== null) {
        if (age < 18) {
          setErrors({ ...errors, birthDate: "You must be at least 18 years old to access Warble" })
        } else if (age > 100) {
          setErrors({ ...errors, birthDate: "You are older than 100 years" })
        } else {
          setErrors({ ...errors, birthDate: "" })
        }
      }
    }
  }

  const getAge = () => {
    return calculateAge(formData.birthDate)
  }

  const getFormattedBirthDate = () => {
    const { day, month, year } = formData.birthDate
    if (!day || !month || !year) return ""

    const monthName = months[Number.parseInt(month) - 1]
    return `${monthName} ${day}, ${year}`
  }

  // Initialize form data from user object if available
  useEffect(() => {
    if (user) {
      // If user has a birth date, parse it to set the form data
      if (user.userBirthDate) {
        try {
          // Example format: "January 15, 1990"
          const parts = user.userBirthDate.split(" ")
          if (parts.length === 3) {
            const monthName = parts[0]
            const day = parts[1].replace(",", "")
            const year = parts[2]

            const monthIndex = months.findIndex((m) => m === monthName) + 1

            if (monthIndex > 0) {
              setFormData((prev) => ({
                ...prev,
                birthDate: {
                  day: day.padStart(2, "0"),
                  month: String(monthIndex).padStart(2, "0"),
                  year,
                },
              }))
            }
          }
        } catch (error) {
          console.error("Error parsing birth date:", error)
        }
      }

      // If user has gender, set it in form data
      if (user.gender) {
        setFormData((prev) => ({
          ...prev,
          gender: user.gender,
        }))
      }

      // If user has country, set it in form data
      if (user.country) {
        setFormData((prev) => ({
          ...prev,
          country: user.country,
        }))
      }
    }
  }, [user])
  const [isFinalizing, setIsFinalizing] = useState(false)
  const [finalizeError, setFinalizeError] = useState("")
  
  // Automatically finalize when reaching step 5
  useEffect(() => {
    const finalizeSteps = async () => {
      setIsFinalizing(true)
      setFinalizeError("")
      try {
        await axiosInstance.post(`/user/finished-steps/${user._id}`)
        console.log("User steps marked as finished")
  
        // Wait 2 more seconds before refreshing
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } catch (error) {
        console.error("Error finalizing user steps:", error)
        setFinalizeError("Failed to finalize steps. Please try again.")
      } finally {
        setIsFinalizing(false)
      }
    }
  
    if (currentStep === 5) {
      const timeout = setTimeout(() => {
        finalizeSteps()
      }, 3000)
  
      return () => clearTimeout(timeout)
    }
  }, [currentStep, user._id])
  
  const manualFinalize = async () => {
    setIsFinalizing(true)
    setFinalizeError("")
    try {
      await axiosInstance.post(`/user/finished-steps/${user._id}`)
      setTimeout(() => {
        window.location.href = "/";
      }, 2000)
    } catch (error) {
      setFinalizeError("Still failed. Please try again later.")
    } finally {
      setIsFinalizing(false)
    }
  }
  
  
  return (
    <div className="w-full max-w-md mx-auto z-10 px-6">
      <div className="relative">
        {/* Main content */}
        <div className="relative backdrop-blur-sm p-8">
          {/* Progress Indicators - Only show after step 1 */}
          {currentStep > 0 && (
            <div className="flex justify-center mb-4">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full transition-all duration-500",
                      index === currentStep
                        ? "bg-[#ff5757] shadow-[0_0_10px_#ff5757]"
                        : index < currentStep
                          ? "bg-[#ff5757] opacity-70"
                          : "bg-zinc-700",
                    )}
                  />
                  {index < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "w-8 h-0.5 transition-all duration-500",
                        index < currentStep ? "bg-[#ff5757] opacity-70" : "bg-zinc-700",
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Step Content */}
          <div className="mb-4">
            {currentStep === 0 && (
              <div className="text-center">
                <h2 className="text-lg text-white">Welcome, {user.firstName}!</h2>
                <p className="text-gray-200 text-[13px]">Let's complete a few steps to set up your account.</p>
              </div>
            )}

            {currentStep === 1 && (
              <div>
                <h2 className="text-2xlmb-4 text-center text-white">Verify Your Email Address</h2>
                {message && (
                  <p
                    className={cn(
                      "mt-2 text-[13px] text-center py-2 px-3 rounded my-3",
                      message.includes("successfully")
                        ? "text-green-500 bg-green-500/10"
                        : message.includes("Error") || message.includes("Invalid")
                          ? "text-red-500"
                          : "text-gray-200",
                    )}
                  >
                    {message}
                  </p>
                )}

                {sendingOTP ? (
                  <div className="flex flex-col items-center justify-center py-4">
                    <svg
                      className="animate-spin h-10 w-10 text-[#ff5757]"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <p className="mt-3 text-sm text-gray-300">Sending OTP to your email...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="relative">
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className={cn(
                            "w-full px-4 py-3 text-sm bg-black/50 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff5757] transition-all text-white",
                            errors.email ? "border-red-500" : "border-[#ff5757]/30",
                          )}
                          placeholder="Enter OTP code"
                        />
                        <Binary className="absolute right-3 top-3 h-5 w-5 text-[#ff5757]/70" />
                      </div>
                    </div>
                    <button
                      onClick={sendOTP}
                      disabled={countdown > 0}
                      className={cn(
                        "cursor-pointer flex justify-end w-full text-xs transition-colors",
                        countdown > 0 ? "text-gray-500 cursor-not-allowed" : "text-[#ff5757] hover:text-[#ff7575]",
                      )}
                    >
                      {countdown > 0 ? `Resend OTP in ${countdown} sec` : "Resend OTP code"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Update the country step to show different content based on whether user.country exists
            // Replace the country step content with this updated version */}
            {currentStep === 2 && (
              <div>
                <h2 className="text-2xlmb-4 text-center text-white">Location Detection</h2>
                {checkingLocation ? (
                  <div className="flex flex-col items-center justify-center py-4">
                    <svg
                      className="animate-spin h-10 w-10 text-[#ff5757]"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                ) : user.country ? (
                  <div className="text-center">
                    <p className="text-center text-gray-300 text-[12px] py-3">
                      We've detected that you are located in {user.country}
                      {user.city ? `, ${user.city}` : ""}. <br />
                      We use your location to enhance your experience in video matching.
                    </p>
                    <div className="mt-4 p-3 bg-green-500/10 rounded-md border border-green-500/20">
                      <p className="text-green-500 text-[13px]">
                        Your location has been verified. Click continue to proceed.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-center text-gray-300 text-[12px] py-3">
                      Unable to detect your location. Please try again or enter your country manually.
                    </p>
                    <div className="pb-2">
                      <button
                        onClick={tryUpdateGeolocation}
                        className="cursor-pointer w-full flex items-center justify-center gap-2 text-sm text-[#ff5757] hover:text-[#ff7575] transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Retry Location Detection
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-center text-gray-300 text-[12px] pb-1">- OR -</p>
                    <p className="text-center text-gray-300 text-[12px] pb-3">Enter your country manually below:</p>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="country" className="block text-sm font-medium text-zinc-400 mb-1">
                          Country
                        </label>
                        <div className="relative">
                          <select
                            id="country"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            className={cn(
                              "w-full px-4 py-3 bg-black/50 border rounded-md focus:outline-none text-gray-300 text-sm focus:ring-2 focus:ring-[#ff5757] appearance-none transition-all",
                              errors.country ? "border-red-500" : "border-[#ff5757]/30",
                            )}
                          >
                            <option value="">Select a country</option>

                            {Object.keys(countryToCode).map((country) => (
                              <option key={country} value={country}>
                                {country}
                              </option>
                            ))}
                          </select>
                          {getFlagImage(formData.country) ? (
                            <img
                              src={getFlagImage(formData.country)! || "/placeholder.svg"}
                              alt={`${formData.country} flag`}
                              className="absolute right-3 top-3 w-7 h-5 rounded-sm"
                            />
                          ) : (
                            <Globe className="absolute right-3 top-3 h-5 w-5 text-[#ff5757]/70" />
                          )}
                        </div>
                        {errors.country && <p className="mt-1 text-sm text-red-500">{errors.country}</p>}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h2 className=" mb-4 text-center text-white">Select Your Age</h2>
                <div className="space-y-6">
                  <div className="flex flex-col items-center">
                    <DateSelector birthDate={formData.birthDate} onDateChange={handleBirthDateChange} />

                    <div className="mt-6 text-center space-y-0">
                      <p className="text-zinc-400">
                        <span className="text-zinc-300 text-[13px]">You are </span>{" "}
                        <span
                          className={cn(
                            " text-sm",
                            getAge() && getAge() < 18
                              ? "text-red-500"
                              : getAge() && getAge() > 100
                                ? "text-red-500"
                                : "text-[#ff5757]",
                          )}
                        >
                          {getAge() || "--"}
                        </span>{" "}
                        <span className="text-zinc-300 text-[13px]">years old.</span>
                      </p>
                      <p className="text-zinc-400 mb-2">
                        <span className="text-zinc-300 text-[13px]">Date of Birth:</span>{" "}
                        <span className="text-white text-[13px]">{getFormattedBirthDate() || "MM, DD, YY"}</span>
                      </p>

                      {errors.birthDate && (
                        <p className="text-[13px] text-red-500 text-center bg-red-500/10 py-2 px-4 rounded-md border border-red-500/20">
                          {errors.birthDate}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <h2 className="mb-4 text-center text-white">Select Your Gender</h2>
                <div className="space-y-4">
                  <p className="text-center text-gray-300 text-[13px] pb-3">Please select your gender</p>

                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => {
                        setFormData({ ...formData, gender: "male" })
                        setErrors({ ...errors, gender: "" })
                      }}
                      className={cn(
                        "flex flex-col items-center justify-center p-4 rounded-lg border transition-all w-32",
                        formData.gender === "male"
                          ? "border-[#ff5757] bg-[#ff5757]/10"
                          : "border-[#ff5757]/30 bg-black/50 hover:bg-[#ff5757]/5",
                      )}
                    >
                      <div
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center mb-2",
                          formData.gender === "male" ? "bg-[#ff5757]/20" : "bg-black/30",
                        )}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-[#ff5757]"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="5" r="3"></circle>
                          <line x1="12" y1="8" x2="12" y2="21"></line>
                          <line x1="8" y1="16" x2="16" y2="16"></line>
                        </svg>
                      </div>
                      <span className="text-white text-sm">Male</span>
                    </button>

                    <button
                      onClick={() => {
                        setFormData({ ...formData, gender: "female" })
                        setErrors({ ...errors, gender: "" })
                      }}
                      className={cn(
                        "flex flex-col items-center justify-center p-4 rounded-lg border transition-all w-32",
                        formData.gender === "female"
                          ? "border-[#ff5757] bg-[#ff5757]/10"
                          : "border-[#ff5757]/30 bg-black/50 hover:bg-[#ff5757]/5",
                      )}
                    >
                      <div
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center mb-2",
                          formData.gender === "female" ? "bg-[#ff5757]/20" : "bg-black/30",
                        )}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-[#ff5757]"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="7" r="5"></circle>
                          <path d="M12 12v7"></path>
                          <path d="M9 19h6"></path>
                        </svg>
                      </div>
                      <span className="text-white text-sm">Female</span>
                    </button>
                  </div>

                  {errors.gender && (
                    <p className="text-[13px] text-red-500 text-center bg-red-500/10 py-2 px-4 rounded-md border border-red-500/20">
                      {errors.gender}
                    </p>
                  )}
                </div>
              </div>
            )}

{currentStep === 5 && (
  <div className="text-center">
    <div className="w-10 h-10 mx-auto mb-2 relative">
      <div className="absolute inset-0 rounded-full bg-[#ff5757]/20 animate-pulse"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Check className="h-6 w-6 text-[#ff5757]" />
      </div>
    </div>
    <h2 className="text-base text-white">Congratulations!</h2>
    <p className="text-zinc-400 text-[13px] mb-2">
      You've successfully completed all the steps.
    </p>
    {!finalizeError && !isFinalizing && (


    <div className=" flex items-center justify-center gap-2">
        <svg
          className="animate-spin h-4 w-4 text-[#ff5757]"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p className="text-[13.5px] text-gray-300">Please wait while we finish setup...</p>
      </div>
    )}
    {isFinalizing ? (
    <div className=" flex items-center justify-center gap-2">
    <svg
      className="animate-spin h-4 w-4 text-[#ff5757]"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <p className="text-[13.5px] text-gray-300">Please wait while we finish setup...</p>
  </div>
    ) : finalizeError ? (
      <div className="">
        <p className="text-sm text-red-500 mb-2">{finalizeError}</p>
        <button
          onClick={manualFinalize}
          className="text-xs text-white bg-[#ff5757] px-3 py-2 rounded-md hover:bg-[#ff7575] transition-all"
        >
          Finish Setup
        </button>
      </div>
    ) : null}
  </div>
)}


          </div>

          {/* Navigation */}
          {currentStep < STEPS.length - 1 && (
            <button
              onClick={handleNext}
              disabled={
                isLoading ||
                checkingLocation ||
                (currentStep > 0 &&
                  ((currentStep === 1 && (!otp || errors.email)) ||
                    (currentStep === 2 && !formData.country && !user.country) ||
                    errors.country ||
                    (currentStep === 3 && (errors.birthDate || !getAge() || getAge() < 18 || getAge() > 100)) ||
                    (currentStep === 4 && !formData.gender)))
              }
              className={cn(
                "w-full flex items-center justify-center cursor-pointer py-3 text-sm bg-transparent border border-[#ff5757] text-white rounded-md relative group overflow-hidden transition-all",
                isLoading || checkingLocation
                  ? "opacity-50 cursor-not-allowed"
                  : (currentStep > 0 &&
                        ((currentStep === 1 && (!otp || errors.email)) ||
                          (currentStep === 2 && !formData.country && !user.country) ||
                          errors.country ||
                          (currentStep === 3 && (errors.birthDate || !getAge() || getAge() < 18 || getAge() > 100)))) ||
                      (currentStep === 4 && !formData.gender)
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-[#ff5757]/10",
              )}
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#ff5757]/0 via-[#ff5757]/30 to-[#ff5757]/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
              <span className="relative flex items-center">
                {isLoading || checkingLocation ? (
                  <span className="flex items-center gap-2">
                    {checkingLocation ? "Detecting Location" : "In Progress"}
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#ff5757]"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </span>
                ) : (
                  <>
                    <span className="mr-2 uppercase">{currentStep === 0 ? "Start" : "Continue"}</span>
                    <ChevronRight className="h-5 w-5" />
                  </>
                )}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

interface DateSelectorProps {
  birthDate: {
    day: string
    month: string
    year: string
  }
  onDateChange: (field: "day" | "month" | "year", value: string) => void
}

// Update the DateSelector component to dynamically calculate years based on current date
function DateSelector({ birthDate, onDateChange }: DateSelectorProps) {
  // Generate days (1-31)
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, "0"))

  // Generate months (1-12)
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"))

  // Calculate min and max years based on current date
  const getValidYearRange = () => {
    const today = new Date()
    const currentYear = today.getFullYear()

    // For minimum age (18 years old)
    const minYear = currentYear - 100 // Oldest allowed (100 years ago)
    const maxYear = currentYear - 5 // Current year minus 5 years

    return { minYear, maxYear }
  }

  const { minYear, maxYear } = getValidYearRange()

  // Generate years (min to max)
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => (minYear + i).toString())

  return (
    <div className="flex justify-center space-x-4">
      <div className="flex flex-col items-center">
        <label className="text-[13px] text-zinc-400 mb-2">Day</label>
        <div className="relative w-20 border border-[#ff5757]/30 rounded-md bg-black/50 overflow-hidden">
          <select
            value={birthDate.day}
            onChange={(e) => onDateChange("day", e.target.value)}
            className="w-full appearance-none bg-black/75 text-center py-2 px-3 text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff5757]"
          >
            <option value="">DD</option>
            {days.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <ChevronDown className="h-4 w-4 text-[#ff5757]" />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <label className="text-[13px] text-zinc-400 mb-2">Month</label>
        <div className="relative w-20 border border-[#ff5757]/30 rounded-md bg-black/50 overflow-hidden">
          <select
            value={birthDate.month}
            onChange={(e) => onDateChange("month", e.target.value)}
            className="w-full appearance-none bg-black/75 text-center py-2 px-3 text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff5757]"
          >
            <option value="">MM</option>
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <ChevronDown className="h-4 w-4 text-[#ff5757]" />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <label className="text-[13px] text-zinc-400 mb-2">Year</label>
        <div className="relative w-24 border border-[#ff5757]/30 rounded-md bg-black/50 overflow-hidden">
          <select
            value={birthDate.year}
            onChange={(e) => onDateChange("year", e.target.value)}
            className="w-full appearance-none bg-black/75 text-center py-2 px-3 text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff5757]"
          >
            <option value="">YYYY</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <ChevronDown className="h-4 w-4 text-[#ff5757]" />
          </div>
        </div>
      </div>
    </div>
  )
}

