"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Copy, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const countries = [
  { code: "+1", name: "United States", flag: "🇺🇸" },
  { code: "+1", name: "Canada", flag: "🇨🇦" },
  { code: "+44", name: "United Kingdom", flag: "🇬🇧" },
  { code: "+49", name: "Germany", flag: "🇩🇪" },
  { code: "+33", name: "France", flag: "🇫🇷" },
  { code: "+39", name: "Italy", flag: "🇮🇹" },
  { code: "+34", name: "Spain", flag: "🇪🇸" },
  { code: "+7", name: "Russia", flag: "🇷🇺" },
  { code: "+86", name: "China", flag: "🇨🇳" },
  { code: "+81", name: "Japan", flag: "🇯🇵" },
  { code: "+82", name: "South Korea", flag: "🇰🇷" },
  { code: "+91", name: "India", flag: "🇮🇳" },
  { code: "+65", name: "Singapore", flag: "🇸🇬" },
  { code: "+61", name: "Australia", flag: "🇦🇺" },
  { code: "+55", name: "Brazil", flag: "🇧🇷" },
  { code: "+52", name: "Mexico", flag: "🇲🇽" },
  { code: "+54", name: "Argentina", flag: "🇦🇷" },
  { code: "+27", name: "South Africa", flag: "🇿🇦" },
  { code: "+234", name: "Nigeria", flag: "🇳🇬" },
  { code: "+20", name: "Egypt", flag: "🇪🇬" },
  { code: "+90", name: "Turkey", flag: "🇹🇷" },
  { code: "+966", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+971", name: "UAE", flag: "🇦🇪" },
  { code: "+60", name: "Malaysia", flag: "🇲🇾" },
  { code: "+66", name: "Thailand", flag: "🇹🇭" },
]

export default function WhatsAppRedirect() {
  const [countryCode, setCountryCode] = useState("+1")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isInstallable, setIsInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  // Update phone number display when country code changes
  useEffect(() => {
    if (phoneNumber && !phoneNumber.startsWith("+")) {
      // If there's a number without country code, update the display
      setPhoneNumber(countryCode + phoneNumber.replace(/^\+?\d{1,4}/, ""))
    }
  }, [countryCode])

  const parsePhoneNumber = (input: string) => {
    // Remove all non-digit characters except +
    const cleaned = input.replace(/[^\d+]/g, "")

    if (!cleaned.startsWith("+")) {
      return { countryCode, number: cleaned }
    }

    // Sort countries by code length (longest first) to match longer codes first
    const sortedCountries = [...countries].sort((a, b) => b.code.length - a.code.length)

    // Check if it starts with a country code
    for (const country of sortedCountries) {
      if (cleaned.startsWith(country.code)) {
        const number = cleaned.substring(country.code.length)
        return { countryCode: country.code, number: country.code + number }
      }
    }

    // If no match found, return the original input
    return { countryCode, number: cleaned }
  }

  const handlePhoneNumberChange = (value: string) => {
    // If the input starts with + or looks like an international number
    if (value.startsWith("+") || (value.length > 10 && /^\d+$/.test(value.replace(/[^\d]/g, "")))) {
      const parsed = parsePhoneNumber(value)
      if (parsed.countryCode !== countryCode) {
        setCountryCode(parsed.countryCode)
      }
      setPhoneNumber(parsed.number)
    } else {
      // For regular input, just clean and add country code
      const cleaned = value.replace(/[^\d]/g, "")
      setPhoneNumber(countryCode + cleaned)
    }
  }

  const handleCountryChange = (newCountryCode: string) => {
    setCountryCode(newCountryCode)
    // Update phone number to use new country code
    const currentNumber = phoneNumber.replace(/^\+?\d{1,4}/, "")
    setPhoneNumber(newCountryCode + currentNumber)
  }

  const formatPhoneNumber = (number: string) => {
    if (!number) return ""

    // If number doesn't start with country code, add it
    if (!number.startsWith(countryCode)) {
      number = countryCode + number.replace(/^\+?\d{1,4}/, "")
    }

    const withoutCountryCode = number.substring(countryCode.length)
    const digits = withoutCountryCode.replace(/\D/g, "")

    if (digits.length === 0) return countryCode + " "

    if (countryCode === "+1") {
      // US/Canada format
      if (digits.length <= 3) return `${countryCode} (${digits}`
      if (digits.length <= 6) return `${countryCode} (${digits.slice(0, 3)}) ${digits.slice(3)}`
      return `${countryCode} (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
    }

    // Default formatting for other countries
    if (digits.length <= 3) return `${countryCode} ${digits}`
    if (digits.length <= 6) return `${countryCode} ${digits.slice(0, 3)} ${digits.slice(3)}`
    return `${countryCode} ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
  }

  const generateWhatsAppLink = () => {
    const cleanNumber = phoneNumber.replace(/\D/g, "")
    if (!cleanNumber) return ""

    return `https://wa.me/${cleanNumber}`
  }

  const handleRedirect = () => {
    const link = generateWhatsAppLink()
    if (!link) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      })
      return
    }

    window.open(link, "_blank")
  }

  const copyLink = async () => {
    const link = generateWhatsAppLink()
    if (!link) return

    try {
      await navigator.clipboard.writeText(link)
      toast({
        title: "Link copied!",
        description: "WhatsApp link copied to clipboard",
      })
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      })
    }
  }

  const installApp = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      toast({
        title: "App installed!",
        description: "WhatsApp Redirect has been installed",
      })
    }

    setDeferredPrompt(null)
    setIsInstallable(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-md mx-auto pt-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">WhatsApp Redirect</h1>
          <p className="text-gray-600">Quick and easy WhatsApp link generator</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-lg">Generate WhatsApp Link</CardTitle>
            <CardDescription>Enter a phone number to create a WhatsApp chat link</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select value={countryCode} onValueChange={handleCountryChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country, index) => (
                    <SelectItem key={index} value={country.code}>
                      <div className="flex items-center gap-2">
                        <span>{country.flag}</span>
                        <span>{country.code}</span>
                        <span className="text-sm text-gray-500">{country.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder={`${countryCode} Enter phone number`}
                value={formatPhoneNumber(phoneNumber)}
                onChange={(e) => handlePhoneNumberChange(e.target.value)}
                className="text-base"
              />
              <p className="text-xs text-gray-500">
                Paste a full international number (e.g., +1234567890) to auto-detect country
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleRedirect}
                className="flex-1 bg-green-500 hover:bg-green-600"
                disabled={!phoneNumber || phoneNumber === countryCode}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open WhatsApp
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={copyLink}
                disabled={!phoneNumber || phoneNumber === countryCode}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            {generateWhatsAppLink() && (
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-xs text-gray-500 mb-1">Generated link:</p>
                <p className="text-sm font-mono break-all text-gray-700">{generateWhatsAppLink()}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {isInstallable && (
          <Card className="mt-4 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-green-900">Install App</h3>
                  <p className="text-sm text-green-700">Add to your home screen for quick access</p>
                </div>
                <Button onClick={installApp} size="sm" className="bg-green-600 hover:bg-green-700">
                  Install
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Made with ❤️ for easy WhatsApp sharing by yathin</p>
        </div>
      </div>
    </div>
  )
}
