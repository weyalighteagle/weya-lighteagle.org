"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { personas } from "@/lib/personas"
import type { InterviewData } from "@/lib/types"

export default function HomePage() {
  const router = useRouter()
  const [formData, setFormData] = useState<InterviewData>({
    firstName: "",
    lastName: "",
    email: "",
    personaId: "",
  })

  const isFormValid =
    formData.firstName.trim() && formData.lastName.trim() && formData.email.trim() && formData.personaId

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isFormValid) {
      sessionStorage.setItem("interviewData", JSON.stringify(formData))
      router.push("/interview")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8E5F5] via-[#F3E8F0] to-[#F5E8EB]">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left Side - Form */}
        <div className="flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-lg md:p-12">
            <h1 className="mb-2 text-3xl font-medium tracking-tight text-gray-900 md:text-4xl">
              Participate in a foundational interview
            </h1>
            <p className="mb-10 text-base text-gray-600">Fill out the form to start.</p>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Name Fields */}
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="mb-2 block text-sm text-gray-900">
                    First name*
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full border-b-2 border-gray-300 bg-transparent pb-2 text-gray-900 outline-none transition-colors focus:border-gray-900"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="mb-2 block text-sm text-gray-900">
                    Last name*
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full border-b-2 border-gray-300 bg-transparent pb-2 text-gray-900 outline-none transition-colors focus:border-gray-900"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="mb-2 block text-sm text-gray-900">
                  Email*
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border-b-2 border-gray-300 bg-transparent pb-2 text-gray-900 outline-none transition-colors focus:border-gray-900"
                />
              </div>

              {/* Persona Selection */}
              <div>
                <label htmlFor="personaSelect" className="mb-3 block text-base text-gray-900">
                  Select the model for your interview
                </label>
                <select
                  id="personaSelect"
                  value={formData.personaId}
                  onChange={(e) => setFormData({ ...formData, personaId: e.target.value })}
                  className="w-full appearance-none rounded-xl border-2 border-gray-200 bg-white px-5 py-4 text-base text-gray-900 shadow-sm outline-none transition-all focus:border-[#7B8FD8] focus:ring-2 focus:ring-[#7B8FD8]/20"
                  required
                >
                  <option value="">Choose a model...</option>
                  {personas.map((persona) => (
                    <option key={persona.id} value={persona.id}>
                      {persona.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Interview Button */}
              {formData.personaId && (
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={!isFormValid}
                    className="w-full rounded-xl bg-[#7B8FD8] px-6 py-4 text-base font-medium text-white shadow-lg transition-all hover:bg-[#6B7FC8] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#7B8FD8] disabled:hover:shadow-lg"
                  >
                    Start Interview
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right Side - Brand Info */}
        <div className="hidden items-center justify-center p-12 lg:flex">
          <div className="max-w-xl space-y-8 text-center">
            <h2 className="text-6xl font-medium tracking-tight text-gray-900">Weya</h2>
            <p className="text-2xl leading-relaxed text-gray-700">
              A system-intelligence layer for capital, trust, and coordination.
            </p>
            <p className="text-lg leading-relaxed text-gray-600">
              Weya is an AI-enabled system that listens, learns, and connects —
            </p>
            <p className="text-lg leading-relaxed text-gray-600">
              transforming conversations into shared intelligence for impact-driven capital.
            </p>
            <div className="pt-8">
              <p className="text-lg leading-relaxed text-gray-700">
                We are inviting a small group of capital allocators and ecosystem builders
              </p>
              <p className="text-lg leading-relaxed text-gray-700">
                to participate in foundational interviews shaping Weya's next phase.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
